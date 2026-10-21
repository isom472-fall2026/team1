"use strict";

/* ===================================
   PROFILE CONFIGURATION & CONSTANTS
=================================== */

const SUPABASE_URL =
    window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";

const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

const $ = id => document.getElementById(id);

let db = null;
let profileState = {
    user: null,
    name: "",
    email: "",
    universityId: "",
    phone: "",
    role: "",
    attendeeType: ""
};

/* ===================================
   TRANSLATIONS & SENSIBLE DEFAULTS
=================================== */

const translations = {
    en: {
        home: "Home",
        events: "Events",
        profile: "Profile",
        coordinatorEvents: "Coordinator Events",
        createEvent: "+ Create Event",
        signOut: "Sign Out",
        profileEyebrow: "AUK EVENTS",
        profileHeading: "Account Information",
        profileSubtitle:
            "Update your contact details below. University credentials and roles are read-only.",
        fullName: "Full Name",
        email: "Email Address",
        universityId: "University ID",
        phoneNumber: "Phone Number",
        systemRole: "System Role",
        attendeeType: "Attendee Type",
        readOnly: "🔒 Read-only",
        requiredTag: "* Required",
        optionalTag: "Optional",
        saveChanges: "Save Changes",
        savingChanges: "Saving...",
        profileUpdatedSuccess: "Profile updated successfully",
        couldNotUpdateProfile: "Could not update profile",
        nameRequired: "Full name cannot be empty.",
        fullNamePlaceholder: "Enter full name",
        phonePlaceholder: "+965 ...",
        backToHome: "← Back to Home",
        coordinator: "Coordinator",
        organizer: "Organizer",
        attendee: "Attendee",
        student: "Student",
        staffFaculty: "Staff / Faculty",
        guest: "Guest",
        nameUnavailable: "Name unavailable",
        emailUnavailable: "Email unavailable",
        phoneUnavailable: "Phone unavailable",
        idUnavailable: "ID unavailable",
        notApplicable: "Not applicable",
        roleUnavailable: "Role unavailable",
        typeUnavailable: "Attendee type unavailable",
        memberSubtitle: "AUK Campus Community Member",
        signedOutSuccess: "Signed out successfully."
    },
    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        profile: "الملف الشخصي",
        coordinatorEvents: "فعاليات المنسق",
        createEvent: "+ إنشاء فعالية",
        signOut: "تسجيل الخروج",
        profileEyebrow: "فعاليات الجامعة",
        profileHeading: "معلومات الحساب",
        profileSubtitle:
            "قم بتحديث بيانات الاتصال الخاصة بك أدناه. البيانات الجامعية والأدوار للقراءة فقط.",
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        universityId: "الرقم الجامعي",
        phoneNumber: "رقم الهاتف",
        systemRole: "دور النظام",
        attendeeType: "نوع المشارك",
        readOnly: "🔒 للقراءة فقط",
        requiredTag: "* إجباري",
        optionalTag: "اختياري",
        saveChanges: "حفظ التغييرات",
        savingChanges: "جارٍ الحفظ...",
        profileUpdatedSuccess: "تم تحديث الملف الشخصي بنجاح.",
        couldNotUpdateProfile: "تعذر تحديث الملف الشخصي",
        nameRequired: "لا يمكن ترك الاسم الكامل فارغاً.",
        fullNamePlaceholder: "أدخل الاسم الكامل",
        phonePlaceholder: "965+ ...",
        backToHome: "← العودة إلى الرئيسية",
        coordinator: "منسق",
        organizer: "منظم",
        attendee: "مشارك",
        student: "طالب",
        staffFaculty: "موظف / عضو هيئة تدريس",
        guest: "زائر",
        nameUnavailable: "الاسم غير متوفر",
        emailUnavailable: "البريد الإلكتروني غير متوفر",
        phoneUnavailable: "رقم الهاتف غير متوفر",
        idUnavailable: "الرقم الجامعي غير متوفر",
        notApplicable: "غير منطبق",
        roleUnavailable: "الدور غير متوفر",
        typeUnavailable: "نوع المشارك غير متوفر",
        memberSubtitle: "عضو مجتمع الجامعة الأمريكية بالكويت",
        signedOutSuccess: "تم تسجيل الخروج بنجاح."
    }
};

function lang() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
}

function t(key) {
    return translations[lang()]?.[key] || key;
}

function savePreference(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn("Unable to save preference:", error);
    }
}

function loadPreference(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

/* ===================================
   THEME & LANGUAGE
=================================== */

function setTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    savePreference("auk-theme", value);

    const toggle = $("theme-toggle");
    if (toggle) {
        toggle.textContent = value === "dark" ? "☀️" : "🌙";
    }
}

function setLanguage(language) {
    const value = language === "ar" ? "ar" : "en";
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    savePreference("auk-language", value);

    document.querySelectorAll("[data-i18n]").forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });

    const langToggle = $("language-toggle");
    if (langToggle) {
        langToggle.textContent = value === "ar" ? "English" : "العربية";
    }

    renderProfile();
}

/* ===================================
   NAVIGATION MANAGEMENT
=================================== */

function closeMenu() {
    const navLinks = $("nav-links");
    const menuToggle = $("menu-toggle");
    if (navLinks) navLinks.classList.remove("open");
    if (menuToggle) {
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    }
}

function initializeNavigation() {
    const menuToggle = $("menu-toggle");
    const navLinks = $("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const open = navLinks.classList.toggle("open");
            menuToggle.textContent = open ? "✕" : "☰";
            menuToggle.setAttribute("aria-expanded", String(open));
        });

        document.addEventListener("click", event => {
            if (!event.target.closest("nav")) {
                closeMenu();
            }
        });
    }

    const themeToggle = $("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current = document.documentElement.dataset.theme;
            setTheme(current === "dark" ? "light" : "dark");
        });
    }

    const languageToggle = $("language-toggle");
    if (languageToggle) {
        languageToggle.addEventListener("click", () => {
            setLanguage(lang() === "ar" ? "en" : "ar");
        });
    }
}

/* ===================================
   READ-ONLY LOCKDOWN
   Ensures protected credentials cannot
   be manually typed into.
=================================== */

function lockReadonlyInputs() {
    const inputs = document.querySelectorAll(
        ".profile-input[readonly]:not(#profile-name):not(#profile-phone)"
    );
    inputs.forEach(input => {
        input.setAttribute("aria-readonly", "true");
        input.addEventListener("keydown", event => {
            // Prevent typing while still allowing tab navigation
            if (event.key !== "Tab") {
                event.preventDefault();
            }
        });
        input.addEventListener("paste", event => {
            event.preventDefault();
        });
        input.addEventListener("beforeinput", event => {
            event.preventDefault();
        });
    });
}

/* ===================================
   NOTIFICATIONS & STATUS ALERTS
=================================== */

let toastTimeout = null;

function showToast(message, isError = false) {
    const toast = $("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;
    if (isError) {
        toast.classList.add("toast-error");
    } else {
        toast.classList.remove("toast-error");
    }

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.hidden = true;
        toast.classList.remove("toast-error");
    }, 4000);
}

function showStatusAlert(message, type) {
    const alertEl = $("profile-alert");
    if (alertEl) {
        alertEl.textContent = message;
        alertEl.className = `profile-alert alert-${type}`;
        alertEl.hidden = false;
    }
    showToast(message, type === "error");
}

/* ===================================
   FORMATTERS & HELPERS
=================================== */

function formatRoleLabel(role) {
    if (!role) return t("roleUnavailable");
    const normalized = role.toLowerCase().replace(/[^a-z]/g, "");
    if (normalized === "coordinator") return t("coordinator");
    if (normalized === "organizer") return t("organizer");
    if (normalized === "attendee") return t("attendee");
    return role;
}

function formatAttendeeTypeLabel(type) {
    if (!type) return t("typeUnavailable");
    const normalized = type.toLowerCase().replace(/[^a-z]/g, "");
    if (normalized === "student") return t("student");
    if (normalized === "stafffaculty") return t("staffFaculty");
    if (normalized === "guest") return t("guest");
    return type;
}

function getInitials(name) {
    if (!name || name === t("nameUnavailable")) return "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ===================================
   RENDER PROFILE DATA
=================================== */

function renderProfile() {
    const { name, email, universityId, phone, role, attendeeType } = profileState;

    // Sensible defaults if profile data is missing
    const displayName = name || t("nameUnavailable");
    const displayEmail = email || t("emailUnavailable");
    const isGuest =
        (attendeeType || "").toLowerCase() === "guest";
    const displayUnivId =
        universityId || (isGuest ? t("notApplicable") : t("idUnavailable"));
    const displayRole = formatRoleLabel(role);

    // Profile header
    const avatarEl = $("profile-avatar");
    if (avatarEl) {
        avatarEl.textContent = getInitials(displayName);
    }

    const nameTitleEl = $("profile-display-name");
    if (nameTitleEl) {
        nameTitleEl.textContent = displayName;
    }

    const roleBadgeEl = $("role-badge");
    if (roleBadgeEl) {
        roleBadgeEl.textContent = displayRole;
    }

    // Editable contact inputs
    const nameInput = $("profile-name");
    if (nameInput) {
        nameInput.readOnly = false;
        nameInput.removeAttribute("readonly");
        nameInput.removeAttribute("aria-readonly");
        nameInput.value = name || "";
        nameInput.placeholder = t("fullNamePlaceholder");
    }

    const phoneInput = $("profile-phone");
    if (phoneInput) {
        phoneInput.readOnly = false;
        phoneInput.removeAttribute("readonly");
        phoneInput.removeAttribute("aria-readonly");
        phoneInput.value = phone || "";
        phoneInput.placeholder = t("phonePlaceholder");
    }

    // Read-only credentials
    const emailInput = $("profile-email");
    if (emailInput) emailInput.value = displayEmail;

    const univIdInput = $("profile-university-id");
    if (univIdInput) univIdInput.value = displayUnivId;

    const roleInput = $("profile-role");
    if (roleInput) roleInput.value = displayRole;

    // Attendee-specific details
    const isAttendee =
        (role || "").toLowerCase() === "attendee" ||
        Boolean(attendeeType && (role || "").toLowerCase() !== "coordinator" && (role || "").toLowerCase() !== "organizer");

    const attendeeTypeGroup = $("attendee-type-group");
    const attendeeTypeBadge = $("attendee-type-badge");
    const attendeeTypeInput = $("profile-attendee-type");

    if (isAttendee) {
        const displayAttendeeType = formatAttendeeTypeLabel(attendeeType);
        if (attendeeTypeGroup) attendeeTypeGroup.hidden = false;
        if (attendeeTypeBadge) {
            attendeeTypeBadge.hidden = false;
            attendeeTypeBadge.textContent = displayAttendeeType;
        }
        if (attendeeTypeInput) attendeeTypeInput.value = displayAttendeeType;
    } else {
        if (attendeeTypeGroup) attendeeTypeGroup.hidden = true;
        if (attendeeTypeBadge) attendeeTypeBadge.hidden = true;
    }

    // Coordinator navigation access
    const isCoordinator = (role || "").toLowerCase() === "coordinator";
    const createEventNavBtn = $("create-event-btn");
    if (createEventNavBtn) {
        createEventNavBtn.hidden = !isCoordinator;
    }
    const coordEventsLink = $("coordinator-events-link");
    if (coordEventsLink) {
        coordEventsLink.hidden = !isCoordinator;
    }
    const coordinatorActionBtn = $("coordinator-create-event-btn");
    if (coordinatorActionBtn) {
        coordinatorActionBtn.hidden = !isCoordinator;
    }
    const coordinatorViewEventsBtn = $("coordinator-view-events-btn");
    if (coordinatorViewEventsBtn) {
        coordinatorViewEventsBtn.hidden = !isCoordinator;
    }
}

/* ===================================
   FETCH PROFILE INFORMATION
=================================== */

async function fetchUserProfile(user) {
    profileState.user = user;
    profileState.email = user.email || "";

    // Fallbacks from metadata in case database rows are not yet populated
    profileState.name = user.user_metadata?.name || "";
    profileState.phone = user.user_metadata?.phone || "";
    profileState.universityId = user.user_metadata?.university_id || "";
    profileState.attendeeType = user.user_metadata?.attendee_type || "";
    profileState.role = "";

    if (!db) {
        renderProfile();
        return;
    }

    // 1. Fetch from public.users table
    try {
        const { data: userData, error: userError } = await db
            .from("users")
            .select("name, phone, university_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!userError && userData) {
            if (userData.name) profileState.name = userData.name;
            if (userData.phone) profileState.phone = userData.phone;
            if (userData.university_id) profileState.universityId = userData.university_id;
        }
    } catch (error) {
        console.warn("Unable to fetch public.users record:", error);
    }

    // 2. Determine System Role and Attendee Type
    try {
        // Check coordinator
        const { data: coordData, error: coordError } = await db
            .from("coordinator")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!coordError && coordData?.user_id) {
            profileState.role = "Coordinator";
        }
    } catch (e) {
        console.warn("Coordinator query error:", e);
    }

    if (!profileState.role) {
        try {
            // Check organizer
            const { data: orgData, error: orgError } = await db
                .from("organizer")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!orgError && orgData?.user_id) {
                profileState.role = "Organizer";
            }
        } catch (e) {
            console.warn("Organizer query error:", e);
        }
    }

    if (!profileState.role) {
        try {
            // Check attendee
            const { data: attData, error: attError } = await db
                .from("attendee")
                .select("attendee_type")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!attError && attData?.attendee_type) {
                profileState.role = "Attendee";
                profileState.attendeeType = attData.attendee_type;
            }
        } catch (e) {
            console.warn("Attendee query error:", e);
        }
    }

    // Default to Attendee if attendeeType exists or user is registered attendee
    if (!profileState.role) {
        if (profileState.attendeeType) {
            profileState.role = "Attendee";
        } else {
            profileState.role = "Attendee";
        }
    }

    renderProfile();
}

/* ===================================
   PROFILE UPDATE HANDLER
=================================== */

async function handleProfileSubmit(event) {
    if (event) event.preventDefault();

    const nameInput = $("profile-name");
    const phoneInput = $("profile-phone");
    const saveBtn = $("save-profile-btn");
    const alertEl = $("profile-alert");

    if (alertEl) alertEl.hidden = true;

    if (!nameInput) return;

    const trimmedName = (nameInput.value || "").trim();
    const trimmedPhone = phoneInput ? (phoneInput.value || "").trim() : "";

    // Reject updates where the full name field is left entirely empty
    if (!trimmedName) {
        showStatusAlert(t("nameRequired"), "error");
        nameInput.focus();
        return;
    }

    if (!profileState.user?.id || !db) {
        showStatusAlert(t("couldNotUpdateProfile"), "error");
        return;
    }

    // Disable button to prevent duplicate submissions
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.setAttribute("aria-busy", "true");
        saveBtn.textContent = t("savingChanges");
    }

    try {
        const { error } = await db
            .from("users")
            .update({
                name: trimmedName,
                phone: trimmedPhone || null
            })
            .eq("user_id", profileState.user.id);

        if (error) {
            console.error("Profile update error:", error);
            const errorMsg = error.message
                ? `${t("couldNotUpdateProfile")}: ${error.message}`
                : t("couldNotUpdateProfile");
            showStatusAlert(errorMsg, "error");
            return;
        }

        profileState.name = trimmedName;
        profileState.phone = trimmedPhone;
        nameInput.value = trimmedName;
        if (phoneInput) phoneInput.value = trimmedPhone;

        const avatarEl = $("profile-avatar");
        if (avatarEl) avatarEl.textContent = getInitials(trimmedName);
        const nameTitleEl = $("profile-display-name");
        if (nameTitleEl) nameTitleEl.textContent = trimmedName;

        showStatusAlert(t("profileUpdatedSuccess"), "success");
    } catch (err) {
        console.error("Unexpected error saving profile:", err);
        showStatusAlert(t("couldNotUpdateProfile"), "error");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.removeAttribute("aria-busy");
            saveBtn.textContent = t("saveChanges");
        }
    }
}

/* ===================================
   SIGN OUT
=================================== */

async function handleSignOut() {
    if (db?.auth) {
        try {
            await db.auth.signOut();
        } catch (e) {
            console.error("Sign out error:", e);
        }
    }
    // Redirect to home.html and open sign in modal
    window.location.assign("home.html?signin=true");
}

/* ===================================
   INITIALIZATION
=================================== */

async function initialize() {
    const yearEl = $("current-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    initializeNavigation();
    lockReadonlyInputs();

    const nameInput = $("profile-name");
    if (nameInput) {
        nameInput.readOnly = false;
        nameInput.removeAttribute("readonly");
        nameInput.removeAttribute("aria-readonly");
    }
    const phoneInput = $("profile-phone");
    if (phoneInput) {
        phoneInput.readOnly = false;
        phoneInput.removeAttribute("readonly");
        phoneInput.removeAttribute("aria-readonly");
    }

    setTheme(loadPreference("auk-theme") || "light");
    setLanguage(loadPreference("auk-language") || "en");

    const profileForm = $("profile-form");
    if (profileForm) {
        profileForm.addEventListener("submit", handleProfileSubmit);
    }

    const navSignoutBtn = $("signout-btn");
    if (navSignoutBtn) {
        navSignoutBtn.addEventListener("click", handleSignOut);
    }

    const profileSignoutBtn = $("profile-signout-btn");
    if (profileSignoutBtn) {
        profileSignoutBtn.addEventListener("click", handleSignOut);
    }

    // Verify Supabase client availability
    if (!window.supabase?.createClient) {
        console.error("Supabase client unavailable.");
        window.location.assign("home.html?signin=true");
        return;
    }

    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        const { data, error } = await db.auth.getSession();
        if (error || !data?.session?.user) {
            window.location.assign("home.html?signin=true");
            return;
        }

        await fetchUserProfile(data.session.user);
    } catch (error) {
        console.error("Session verification error:", error);
        window.location.assign("home.html?signin=true");
        return;
    }

    db.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
            window.location.assign("home.html?signin=true");
        } else if (session?.user) {
            await fetchUserProfile(session.user);
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}
