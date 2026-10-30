"use strict";

/* =====================================
   USER STORY: SIGN IN WITH EMAIL & PASSWORD
===================================== */

(function () {
    const SUPABASE_URL =
        window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";
    const SUPABASE_ANON_KEY =
        window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

    const signinForm = document.getElementById("signin-form");
    const signinModal = document.getElementById("signin-modal");
    const signinButton = document.getElementById("signin-btn");
    const closeButton = document.getElementById("signin-close");
    const emailInput = document.getElementById("signin-email");
    const passwordInput = document.getElementById("signin-password");
    const togglePasswordBtn = document.getElementById("toggle-password");
    const messageEl = document.getElementById("signin-message");
    const submitBtn = document.getElementById("signin-submit");
    const signupLink = document.getElementById("signup-link");

    if (!signinForm) {
        return;
    }

    let previousFocus = null;
    let supabaseClient = null;

    function getSupabaseClient() {
        if (supabaseClient) {
            return supabaseClient;
        }
        if (window.aukDb) {
            supabaseClient = window.aukDb;
            return supabaseClient;
        }
        if (window.supabase && typeof window.supabase.createClient === "function") {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return supabaseClient;
        }
        return null;
    }

    /* =====================================
       OPEN / CLOSE SIGN-IN MODAL
    ===================================== */
    function openSignin() {
        if (!signinModal) return;
        previousFocus = document.activeElement;
        signinModal.hidden = false;
        document.body.style.overflow = "hidden";
        clearErrorMessage();
        if (emailInput) emailInput.focus();
    }

    function closeSignin() {
        if (!signinModal) return;
        signinModal.hidden = true;
        document.body.style.overflow = "";
        clearErrorMessage();
        if (previousFocus) {
            previousFocus.focus();
            previousFocus = null;
        }
    }

    window.openSigninModal = openSignin;
    window.closeSigninModal = closeSignin;

    if (signinButton) {
        signinButton.addEventListener("click", openSignin);
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeSignin);
    }

    if (signinModal) {
        signinModal.addEventListener("click", function (event) {
            if (event.target === signinModal) {
                closeSignin();
            }
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && signinModal && !signinModal.hidden) {
            closeSignin();
        }
    });

    /* =====================================
       SWITCH TO SIGN UP MODAL
       Acceptance Criterion:
       The page provides a clear link for users who do not have an account to navigate to the signup.html page.
    ===================================== */
    if (signupLink) {
        signupLink.addEventListener("click", function (event) {
            if (typeof window.openSignupModal === "function") {
                event.preventDefault();
                closeSignin();
                window.openSignupModal();
            }
        });
    }

    /* =====================================
       TOGGLE PASSWORD VISIBILITY ("Show" button)
       Acceptance Criterion:
       The form includes a "Show" button to toggle password visibility.
    ===================================== */
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", function () {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            togglePasswordBtn.textContent = isPassword ? "Hide" : "Show";
            togglePasswordBtn.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );
        });
    }

    /* =====================================
       DISPLAY ERROR MESSAGE
       Acceptance Criterion:
       If the credentials are invalid, the form displays an error message: "Invalid login credentials."
    ===================================== */
    function showErrorMessage(text) {
        if (!messageEl) return;
        messageEl.textContent = text;
        messageEl.hidden = false;
        messageEl.className = "auth-message error";
        messageEl.style.display = "block";
    }

    function clearErrorMessage() {
        if (!messageEl) return;
        messageEl.textContent = "";
        messageEl.hidden = true;
        messageEl.style.display = "none";
    }

    /* =====================================
       AUTHENTICATE USER CREDENTIALS
       Acceptance Criteria:
       - The form requires a user to enter their email and password.
       - The signin.js script authenticates the user's credentials against the auth.users table.
       - Upon successful authentication, the user is redirected to the home.html page.
       - If the credentials are invalid, the form displays an error message: "Invalid login credentials."
    ===================================== */
    signinForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearErrorMessage();

        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        // Acceptance Criterion: The form requires a user to enter their email and password.
        if (!email || !password) {
            showErrorMessage("Invalid login credentials.");
            return;
        }

        const client = getSupabaseClient();
        if (!client) {
            showErrorMessage("Invalid login credentials.");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent =
                document.documentElement.lang === "ar"
                    ? "جارٍ تسجيل الدخول..."
                    : "Signing In...";
        }

        try {
            // Authenticate against Supabase auth.users
            const { data, error } = await client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error || !data || !data.user) {
                showErrorMessage("Invalid login credentials.");
                return;
            }

            if (typeof window.applyUserSession === "function") {
                await window.applyUserSession(data.user);
            }

            closeSignin();

            const pendingEventId = sessionStorage.getItem("pending_booking_event_id");
            const pendingReturnUrl = sessionStorage.getItem("pending_booking_return_url");

            if (pendingEventId) {
                const targetUrl = pendingReturnUrl || "events.html";
                const separator = targetUrl.includes("?") ? "&" : "?";
                window.location.assign(`${targetUrl}${separator}event_id=${encodeURIComponent(pendingEventId)}`);
                return;
            }

            // Acceptance Criterion: Upon successful authentication, the user is redirected to the home.html page.
            window.location.assign("home.html");
        } catch (err) {
            showErrorMessage("Invalid login credentials.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent =
                    document.documentElement.lang === "ar"
                        ? "تسجيل الدخول"
                        : "Sign In";
            }
        }
    });
})();
