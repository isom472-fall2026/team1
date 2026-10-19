
"use strict";

/* =====================================
   US-02: CREATE ATTENDEE ACCOUNT
===================================== */

(function () {

    const signupForm =
        document.getElementById("signup-form");

    const signupModal =
        document.getElementById("signup-modal");

    const signupButton =
        document.getElementById("signup-btn");

    const closeButton =
        document.getElementById("signup-close");

    const attendeeType =
        document.getElementById("signup-type");

    const universityIdGroup =
        document.getElementById("university-id-group");

    const universityIdInput =
        document.getElementById("signup-university-id");

    const message =
        document.getElementById("signup-message");

    const submitButton =
        document.getElementById("signup-submit");

    if (!signupForm || !signupModal) {
        return;
    }

    let previousFocus = null;

    /* =====================================
       OPEN REGISTRATION MODAL
    ===================================== */

    function openSignup() {

        previousFocus = document.activeElement;

        signupModal.hidden = false;

        document.body.style.overflow = "hidden";

        message.textContent = "";

        document.getElementById("signup-name").focus();
    }

    /* =====================================
       CLOSE REGISTRATION MODAL
    ===================================== */

    function closeSignup() {

        signupModal.hidden = true;

        document.body.style.overflow = "";

        if (previousFocus) {
            previousFocus.focus();
            previousFocus = null;
        }
    }

    /* =====================================
       UNIVERSITY ID VALIDATION
    ===================================== */

    function updateUniversityId() {

        const type = attendeeType.value;

        const required =
            type === "Student" ||
            type === "StaffFaculty";

        universityIdGroup.hidden = !required;

        universityIdInput.required = required;

        if (!required) {
            universityIdInput.value = "";
        }
    }

    attendeeType.addEventListener(
        "change",
        updateUniversityId
    );

    updateUniversityId();

    /* =====================================
       DISPLAY REGISTRATION MESSAGE
    ===================================== */

    function showMessage(text, isError = true) {

        message.textContent = text;

        message.className =
            isError
                ? "auth-message error"
                : "auth-message success";
    }

    /* =====================================
       VALIDATE REGISTRATION DATA
    ===================================== */

    function validateForm() {

        const name =
            document.getElementById("signup-name")
                .value.trim();

        const email =
            document.getElementById("signup-email")
                .value.trim();

        const phone =
            document.getElementById("signup-phone")
                .value.trim();

        const password =
            document.getElementById("signup-password")
                .value;

        const confirmPassword =
            document.getElementById("signup-confirm")
                .value;

        const type = attendeeType.value;

        const universityId =
            universityIdInput.value.trim();

        if (!name || !email || !phone || !type) {

            showMessage(
                "Please complete all required fields."
            );

            return null;
        }

        if (password.length < 8) {

            showMessage(
                "Password must contain at least 8 characters."
            );

            return null;
        }

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match."
            );

            return null;
        }

        if (
            (type === "Student" ||
                type === "StaffFaculty") &&
            !/^[0-9]{8}$/.test(universityId)
        ) {

            showMessage(
                "University ID must contain exactly 8 digits."
            );

            return null;
        }

        return {
            name,
            email,
            phone,
            password,
            attendee_type: type,
            university_id:
                type === "Guest"
                    ? null
                    : universityId
        };
    }

    /* =====================================
       REGISTER ACCOUNT WITH SUPABASE
    ===================================== */

    async function registerAccount(event) {

        event.preventDefault();

        message.textContent = "";

        const formData = validateForm();

        if (!formData) return;

        if (
            !window.supabase ||
            !window.supabase.createClient
        ) {

            showMessage(
                "Supabase is not available. Please try again."
            );

            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";

        try {

            /*
              Use the same Supabase project
              configured in home.js.

              window.aukDb is initialized
              in Step 4 below.
            */

            const client = window.aukDb;

            if (!client) {
                showMessage(
                    "The registration service is not ready. Please refresh the page and try again."
                );
                return;
            }

            const { data, error } =
                await client.auth.signUp({

                    email: formData.email,

                    password: formData.password,

                    options: {

                        data: {
                            name: formData.name,
                            phone: formData.phone,
                            attendee_type:
                                formData.attendee_type,
                            university_id:
                                formData.university_id
                        }
                    }
                });

            if (error) {
                throw error;
            }

            /*
              The database trigger is responsible
              for creating records in:

              public.users
              public.attendee

              Do not insert those records again
              from the browser.
            */

            if (!data.user) {

                throw new Error(
                    "Account creation could not be confirmed."
                );
            }

            if (data.session) {

                showMessage(
                    "Account created successfully!",
                    false
                );

                window.location.assign("home.html");

            } else {

                showMessage(
                    "Registration submitted. Please check your email for a confirmation link. If you already have an account, use the sign-in process.",
                    false
                );

                signupForm.reset();
                updateUniversityId();
            }

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            const errorMessage = error.message || "";

            if (errorMessage.includes("Email rate limit exceeded")) {
                showMessage(
                    "Too many registration attempts. Please try again later."
                );
            } else if (
                errorMessage.includes("Password should be at least")
            ) {
                showMessage(
                    "Password does not meet the required length."
                );
            } else {
                showMessage(
                    "Unable to complete registration. Please check your details or try again later."
                );
            }
        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                document.documentElement.lang === "ar"
                    ? "إنشاء حساب"
                    : "Create Account";
        }
    }

    /* =====================================
       EVENT LISTENERS
    ===================================== */

    signupButton.addEventListener(
        "click",
        openSignup
    );

    closeButton.addEventListener(
        "click",
        closeSignup
    );

    signupModal.addEventListener(
        "click",
        event => {

            if (event.target === signupModal) {
                closeSignup();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !signupModal.hidden
            ) {

                closeSignup();
            }
        }
    );

    signupForm.addEventListener(
        "submit",
        registerAccount
    );

    window.openSignupModal = openSignup;
    window.closeSignupModal = closeSignup;

    const signinLink = document.getElementById("signin-link");
    if (signinLink) {
        signinLink.addEventListener("click", event => {
            event.preventDefault();
            closeSignup();
            if (typeof window.openSigninModal === "function") {
                window.openSigninModal();
            }
        });
    }

})();
