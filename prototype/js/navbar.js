"use strict";

/* =========================================================
   AUK EVENTS — SHARED MODERN NAVBAR CONTROLLER
========================================================= */

(function () {
    const $ = (id) => document.getElementById(id);

    const translations = {
        en: {
            home: "Home",
            events: "Events",
            myBookings: "My Bookings",
            profile: "My Profile",
            coordinator: "Coordinator",
            account: "Account",
            coordinatorEvents: "Coordinator Events",
            createEvent: "Create Event",
            createVenue: "Create Venue",
            assignOrganizers: "Assign Organizers",
            signUp: "Sign Up",
            signIn: "Sign In",
            signOut: "Sign Out"
        },
        ar: {
            home: "الرئيسية",
            events: "الفعاليات",
            myBookings: "حجوزاتي",
            profile: "ملفي الشخصي",
            coordinator: "المنسق",
            account: "الحساب",
            coordinatorEvents: "إدارة الفعاليات",
            createEvent: "إنشاء فعالية",
            createVenue: "إنشاء موقع",
            assignOrganizers: "تعيين المنظمين",
            signUp: "إنشاء حساب",
            signIn: "تسجيل الدخول",
            signOut: "تسجيل الخروج"
        }
    };

    let dbClient = null;
    let authVersion = 0;

    function getDbClient() {
        if (dbClient) return dbClient;
        if (window.aukDb) {
            dbClient = window.aukDb;
            return dbClient;
        }
        if (window.supabase && typeof window.supabase.createClient === "function") {
            const url = window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";
            const key = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";
            dbClient = window.supabase.createClient(url, key);
            return dbClient;
        }
        return null;
    }

    /* =========================================================
       THEME & LANGUAGE
    ========================================================= */

    function getLanguage() {
        return document.documentElement.lang === "ar" ? "ar" : (localStorage.getItem("auk-language") || "en");
    }

    function getTheme() {
        return document.documentElement.dataset.theme === "dark" ? "dark" : (localStorage.getItem("auk-theme") || "light");
    }

    function updateNavbarLanguage(lang) {
        const dict = translations[lang] || translations.en;
        const nav = document.querySelector(".site-header");
        if (nav) {
            nav.querySelectorAll("[data-i18n]").forEach((el) => {
                const key = el.dataset.i18n;
                if (dict[key]) {
                    el.textContent = dict[key];
                }
            });
        }
        const langBtn = $("language-toggle");
        if (langBtn) {
            langBtn.textContent = lang === "ar" ? "English" : "العربية";
        }
    }

    function updateNavbarTheme(theme) {
        const themeBtn = $("theme-toggle");
        if (themeBtn) {
            themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
            themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
        }
    }

    function initThemeAndLanguage() {
        const lang = getLanguage();
        const theme = getTheme();
        updateNavbarLanguage(lang);
        updateNavbarTheme(theme);

        // Listen to toggle clicks as a fallback if page script did not toggle it
        $("theme-toggle")?.addEventListener("click", () => {
            const initialTheme = document.documentElement.dataset.theme;
            setTimeout(() => {
                if (document.documentElement.dataset.theme === initialTheme) {
                    const newTheme = initialTheme === "dark" ? "light" : "dark";
                    document.documentElement.dataset.theme = newTheme;
                    try { localStorage.setItem("auk-theme", newTheme); } catch (e) {}
                    updateNavbarTheme(newTheme);
                }
            }, 0);
        });

        $("language-toggle")?.addEventListener("click", () => {
            const initialLang = document.documentElement.lang;
            setTimeout(() => {
                if (document.documentElement.lang === initialLang) {
                    const newLang = initialLang === "ar" ? "en" : "ar";
                    document.documentElement.lang = newLang;
                    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
                    try { localStorage.setItem("auk-language", newLang); } catch (e) {}
                    updateNavbarLanguage(newLang);
                }
            }, 0);
        });

        // Watch for changes made by existing page scripts
        const observer = new MutationObserver(() => {
            updateNavbarLanguage(document.documentElement.lang === "ar" ? "ar" : "en");
            updateNavbarTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["lang", "dir", "data-theme"]
        });
    }

    /* =========================================================
       ACTIVE PAGE HIGHLIGHTING
    ========================================================= */

    function highlightActivePage() {
        const rawPath = window.location.pathname.split("/").pop() || "home.html";
        const page = rawPath.toLowerCase();

        // Clear existing active states in nav
        document.querySelectorAll(".site-header .nav-link, .site-header .nav-dropdown-toggle, .site-header .nav-dropdown-menu a").forEach((el) => {
            el.classList.remove("active");
            el.removeAttribute("aria-current");
        });

        if (page === "home.html" || page === "" || page === "index.html") {
            const link = document.querySelector('.site-header a[href="home.html"]');
            if (link) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        } else if (page === "events.html") {
            const link = document.querySelector('.site-header a[href="events.html"]');
            if (link) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        } else if (page === "my-bookings.html") {
            const link = $("my-bookings-link");
            if (link) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        } else if (page === "profile.html") {
            const userToggle = document.querySelector(".site-header .user-menu-toggle");
            const profileLink = $("profile-link");
            if (userToggle) userToggle.classList.add("active");
            if (profileLink) profileLink.classList.add("active");
        } else if (
            page === "coordinator-events.html" ||
            page === "create-event.html" ||
            page === "create-venue.html" ||
            page === "assign-organizers.html"
        ) {
            const coordToggle = document.querySelector('#coordinator-menu .nav-dropdown-toggle');
            if (coordToggle) coordToggle.classList.add("active");
            const subLink = document.querySelector(`.site-header a[href="${page}"]`);
            if (subLink) subLink.classList.add("active");
        }
    }

    /* =========================================================
       DROPDOWNS & MOBILE MENU
    ========================================================= */

    function closeAllDropdowns() {
        document.querySelectorAll(".site-header .nav-dropdown").forEach((menu) => {
            menu.classList.remove("open");
            const toggle = menu.querySelector(".nav-dropdown-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "false");
        });
    }

    function initDropdowns() {
        document.querySelectorAll(".site-header .nav-dropdown-toggle").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const dropdown = btn.closest(".nav-dropdown");
                if (!dropdown || dropdown.hidden) return;
                const wasOpen = dropdown.classList.contains("open");
                closeAllDropdowns();
                if (!wasOpen) {
                    dropdown.classList.add("open");
                    btn.setAttribute("aria-expanded", "true");
                }
            });
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".site-header .nav-dropdown")) {
                closeAllDropdowns();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeAllDropdowns();
            }
        });
    }

    function initMobileMenu() {
        const toggle = $("menu-toggle");
        const navLinks = $("nav-links");
        if (!toggle || !navLinks) return;

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
                closeAllDropdowns();
            });
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 1250) {
                navLinks.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* =========================================================
       AUTHENTICATION & ROLE-BASED NAVIGATION
    ========================================================= */

    function setSignedOutNav() {
        if ($("signin-btn")) $("signin-btn").hidden = false;
        if ($("signup-btn")) $("signup-btn").hidden = false;
        if ($("user-menu")) $("user-menu").hidden = true;
        if ($("my-bookings-link")) $("my-bookings-link").hidden = true;
        if ($("coordinator-menu")) $("coordinator-menu").hidden = true;
        closeAllDropdowns();
    }

    function setSignedInNav() {
        if ($("signin-btn")) $("signin-btn").hidden = true;
        if ($("signup-btn")) $("signup-btn").hidden = true;
        if ($("user-menu")) $("user-menu").hidden = false;
        if ($("my-bookings-link")) $("my-bookings-link").hidden = false;
        if ($("coordinator-menu")) $("coordinator-menu").hidden = true;
    }

    async function applyNavUser(user) {
        const currentVersion = ++authVersion;
        if (!user) {
            setSignedOutNav();
            return;
        }

        setSignedInNav();

        const client = getDbClient();
        if (!client) return;

        try {
            const { data, error } = await client
                .from("coordinator")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (currentVersion !== authVersion) return;

            if (!error && data?.user_id) {
                if ($("coordinator-menu")) $("coordinator-menu").hidden = false;
            } else {
                if ($("coordinator-menu")) $("coordinator-menu").hidden = true;
            }
        } catch (err) {
            console.warn("Coordinator check error:", err);
            if (currentVersion === authVersion && $("coordinator-menu")) {
                $("coordinator-menu").hidden = true;
            }
        }
    }

    window.applyNavbarUser = applyNavUser;

    async function initAuth() {
        const client = getDbClient();
        if (!client) {
            setSignedOutNav();
            return;
        }

        try {
            const { data: { session }, error } = await client.auth.getSession();
            if (!error && session?.user) {
                await applyNavUser(session.user);
            } else {
                await applyNavUser(null);
            }
        } catch (e) {
            setSignedOutNav();
        }

        client.auth.onAuthStateChange((_event, session) => {
            setTimeout(() => {
                applyNavUser(session?.user || null);
            }, 0);
        });

        // Sign out button
        $("signout-btn")?.addEventListener("click", async () => {
            const btn = $("signout-btn");
            if (btn) btn.disabled = true;
            try {
                if (client) await client.auth.signOut();
                applyNavUser(null);
                const page = window.location.pathname.split("/").pop();
                const protectedPages = [
                    "coordinator-events.html",
                    "create-event.html",
                    "create-venue.html",
                    "assign-organizers.html",
                    "profile.html",
                    "my-bookings.html"
                ];
                if (protectedPages.includes(page)) {
                    window.location.assign("home.html");
                }
            } catch (err) {
                console.error("Sign out error:", err);
            } finally {
                if (btn) btn.disabled = false;
            }
        });

        // Intercept sign-in / sign-up on home.html when modals are present
        const signinBtn = $("signin-btn");
        const signupBtn = $("signup-btn");

        if (signinBtn && typeof window.openSigninModal === "function") {
            signinBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.openSigninModal();
            });
        }

        if (signupBtn && typeof window.openSignupModal === "function") {
            signupBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.openSignupModal();
            });
        }
    }

    /* =========================================================
       INITIALIZE
    ========================================================= */

    function initNavbar() {
        initThemeAndLanguage();
        highlightActivePage();
        initDropdowns();
        initMobileMenu();
        initAuth();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNavbar);
    } else {
        initNavbar();
    }
})();
