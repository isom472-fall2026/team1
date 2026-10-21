
"use strict";

/* ===================================
   SUPABASE CONFIGURATION
=================================== */

const SUPABASE_URL =
    window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

const $ = id => document.getElementById(id);

let db = null;

let currentUser = null;
let currentUserName = "";
let currentUserRole = "Guest";

let allEvents = [];
let activeFilter = "all";
let eventsState = "loading";
let showAllEvents = false;

let toastTimeout = null;
let lastFocusedElement = null;

/* ===================================
   TRANSLATIONS
=================================== */

const translations = {
    en: {
        home: "Home",
        events: "Events",
        profile: "Profile",
        guest: "Guest",
        welcome: "Welcome",
        welcomeSubtitle: "Your campus community starts here.",
        heroTitle: "Discover Campus Events",
        heroDescription:
            "Explore workshops, discover upcoming activities, and connect with your university community.",
        browseEvents: "Browse Events",
        overview: "Campus Overview",
        overviewSubtitle:
            "A quick look at upcoming campus activities.",
        upcomingEvents: "Upcoming Events",
        quickActions: "Quick Actions",
        browseDescription:
            "Find workshops and activities around campus.",
        eventsSubtitle:
            "Explore what's happening next at AUK.",
        viewAllEvents: "View All Events",
        showLess: "Show Fewer Events",
        stayConnected: "Stay Connected with Campus Life",
        stayConnectedDescription:
            "Discover new opportunities, workshops, and university events.",
        noEvents:
            "There are no upcoming events at the moment.",
        noEventsFiltered:
            "No upcoming events match this filter.",
        eventError:
            "Unable to load events. Please try again later.",
        loadingEvents: "Loading events...",
        viewDetails: "View Details",
        event: "Event",
        all: "All",
        workshop: "Workshop",
        seminar: "Seminar",
        social: "Social",
        sports: "Sports",
        cultural: "Cultural",
        dateLabel: "Date",
        timeLabel: "Time",
        capacityLabel: "Capacity",
        addToCalendar: "Add to Google Calendar",
        notConnected: "Unable to connect to Supabase.",
        signUp: "Sign Up",
        signupTitle: "Create Your Account",
        signupSubtitle: "Join the AUK Events community.",
        fullName: "Full Name",
        email: "Email Address",
        phoneNumber: "Phone Number",
        attendeeType: "Attendee Type",
        student: "Student",
        staffFaculty: "Staff / Faculty",
        universityId: "University ID (8 digits)",
        universityIdHint: "Required for students and staff/faculty.",
        password: "Password",
        confirmPassword: "Confirm Password",
        createAccount: "Create Account",
        signIn: "Sign In",
        signinTitle: "Sign In",
        signinSubtitle: "Access your AUK Events account.",
        dontHaveAccount: "Don't have an account? Sign up",
        alreadyHaveAccount: "Already have an account? Sign in",
        signOut: "Sign Out",
        signedInAs: "Signed in as",
        signedOutSuccess: "Signed out successfully.",
        stafffaculty: "Staff / Faculty",
        createEvent: "+ Create Event",
        coordinator: "Coordinator",
        organizer: "Organizer",
        attendee: "Attendee",
    },

    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        profile: "الملف الشخصي",
        guest: "زائر",
        welcome: "مرحباً",
        welcomeSubtitle: "مجتمعك الجامعي يبدأ هنا.",
        heroTitle: "اكتشف فعاليات الحرم الجامعي",
        heroDescription:
            "استكشف ورش العمل والأنشطة القادمة وتواصل مع مجتمع الجامعة.",
        browseEvents: "تصفح الفعاليات",
        overview: "نظرة عامة على الفعاليات",
        overviewSubtitle:
            "ملخص سريع للأنشطة الجامعية القادمة.",
        upcomingEvents: "الفعاليات القادمة",
        quickActions: "إجراءات سريعة",
        browseDescription:
            "اكتشف ورش العمل والأنشطة داخل الجامعة.",
        eventsSubtitle:
            "اكتشف الفعاليات القادمة في الجامعة الأمريكية بالكويت.",
        viewAllEvents: "عرض جميع الفعاليات",
        showLess: "عرض فعاليات أقل",
        stayConnected: "ابقَ على تواصل مع الحياة الجامعية",
        stayConnectedDescription:
            "اكتشف فرصاً جديدة وورش عمل وفعاليات جامعية.",
        noEvents: "لا توجد فعاليات قادمة حالياً.",
        noEventsFiltered:
            "لا توجد فعاليات تطابق هذا التصنيف.",
        eventError:
            "تعذر تحميل الفعاليات. يرجى المحاولة لاحقاً.",
        loadingEvents: "جارٍ تحميل الفعاليات...",
        viewDetails: "عرض التفاصيل",
        event: "فعالية",
        all: "الكل",
        workshop: "ورشة عمل",
        seminar: "ندوة",
        social: "اجتماعي",
        sports: "رياضي",
        cultural: "ثقافي",
        dateLabel: "التاريخ",
        timeLabel: "الوقت",
        capacityLabel: "السعة",
        addToCalendar: "أضف إلى تقويم Google",
        notConnected: "تعذر الاتصال بقاعدة البيانات.",
        signUp: "إنشاء حساب",
        signupTitle: "إنشاء حساب جديد",
        signupSubtitle: "انضم إلى مجتمع فعاليات الجامعة.",
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phoneNumber: "رقم الهاتف",
        attendeeType: "نوع المشارك",
        student: "طالب",
        staffFaculty: "موظف / عضو هيئة تدريس",
        universityId: "الرقم الجامعي (8 أرقام)",
        universityIdHint: "مطلوب للطلاب والموظفين وأعضاء هيئة التدريس.",
        password: "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        createAccount: "إنشاء حساب",
        signIn: "تسجيل الدخول",
        signinTitle: "تسجيل الدخول",
        signinSubtitle: "الدخول إلى حساب فعاليات الجامعة.",
        dontHaveAccount: "ليس لديك حساب؟ إنشاء حساب",
        alreadyHaveAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
        signOut: "تسجيل الخروج",
        signedInAs: "تم تسجيل الدخول كـ",
        signedOutSuccess: "تم تسجيل الخروج بنجاح.",
        stafffaculty: "موظف / عضو هيئة تدريس",
        createEvent: "+ إنشاء فعالية",
        coordinator: "منسق",
        organizer: "منظم",
        attendee: "مشارك",
    }
};

/* ===================================
   LANGUAGE HELPERS
=================================== */

function lang() {
    return document.documentElement.lang === "ar"
        ? "ar"
        : "en";
}

function t(key) {
    return translations[lang()][key] || key;
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
   THEME
=================================== */

function setTheme(theme) {
    const value = theme === "dark"
        ? "dark"
        : "light";

    document.documentElement.dataset.theme = value;

    savePreference("auk-theme", value);

    $("theme-toggle").textContent =
        value === "dark" ? "☀️" : "🌙";
}

/* ===================================
   LANGUAGE
=================================== */

function setLanguage(language) {
    const value = language === "ar"
        ? "ar"
        : "en";

    document.documentElement.lang = value;

    document.documentElement.dir =
        value === "ar" ? "rtl" : "ltr";

    savePreference("auk-language", value);

    document.querySelectorAll("[data-i18n]")
        .forEach(element => {
            element.textContent = t(element.dataset.i18n);
        });

    $("language-toggle").textContent =
        value === "ar" ? "English" : "العربية";

    renderUserWelcome();

    updateShowAllButton();
    renderChips();
    renderEvents();
}

/* ===================================
   NAVIGATION
=================================== */

function closeMenu() {
    $("nav-links").classList.remove("open");

    $("menu-toggle").textContent = "☰";

    $("menu-toggle").setAttribute(
        "aria-expanded",
        "false"
    );
}

function initializeNavigation() {
    $("menu-toggle").addEventListener("click", () => {
        const open =
            $("nav-links").classList.toggle("open");

        $("menu-toggle").textContent =
            open ? "✕" : "☰";

        $("menu-toggle").setAttribute(
            "aria-expanded",
            String(open)
        );
    });

    document.addEventListener("click", event => {
        if (!event.target.closest("nav")) {
            closeMenu();
        }
    });

    document.querySelectorAll("[data-page]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const page = button.dataset.page;

                closeMenu();

                if (page === "home") {
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }

                if (page === "events") {
                    $("events-section").scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            });
        });

    const createEventBtn = $("create-event-btn");
    if (createEventBtn) {
        createEventBtn.addEventListener("click", closeMenu);
    }

    const profileLink = $("profile-link");
    if (profileLink) {
        profileLink.addEventListener("click", event => {
            closeMenu();
            if (!currentUser) {
                event.preventDefault();
                if (typeof window.openSigninModal === "function") {
                    window.openSigninModal();
                } else {
                    window.location.assign("home.html?signin=true");
                }
            }
        });
    }
}

/* ===================================
   NOTIFICATIONS
=================================== */

function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.hidden = false;

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.hidden = true;
    }, 3500);
}

/* ===================================
   MODAL MANAGEMENT
=================================== */

function openDialog() {
    lastFocusedElement = document.activeElement;

    $("event-modal").hidden = false;

    document.body.style.overflow = "hidden";

    $("modal-close").focus();
}

function closeDialog() {
    $("event-modal").hidden = true;

    document.body.style.overflow = "";

    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

function initializeDialogs() {
    $("modal-close").addEventListener(
        "click",
        closeDialog
    );

    $("event-modal").addEventListener(
        "click",
        event => {
            if (event.target === $("event-modal")) {
                closeDialog();
            }
        }
    );

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeDialog();
            closeMenu();
        }
    });
}

/* ===================================
   EVENT HELPERS
=================================== */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
}

function localToday() {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        lang() === "ar" ? "ar-KW" : "en-KW",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);
}

function formatTimeRange(event) {
    const start =
        String(event.start_time || "").slice(0, 5);

    const end =
        String(event.end_time || "").slice(0, 5);

    if (start && end) {
        return `${start} – ${end}`;
    }

    return start || end || "—";
}

const KNOWN_TYPES = [
    "workshop",
    "seminar",
    "social",
    "sports",
    "cultural"
];

function normalizeType(type) {
    const value =
        String(type || "").trim().toLowerCase();

    return KNOWN_TYPES.includes(value)
        ? value
        : "";
}

/* ===================================
   EVENT CATEGORY FILTERS
=================================== */

function renderChips() {
    const container = $("chip-row");

    const types = [
        ...new Set(
            allEvents
                .map(event => normalizeType(event.event_type))
                .filter(Boolean)
        )
    ];

    if (
        eventsState !== "loaded" ||
        types.length < 2
    ) {
        container.hidden = true;
        container.innerHTML = "";
        return;
    }

    container.hidden = false;

    container.innerHTML =
        ["all", ...types].map(type => `
            <button
                type="button"
                class="chip ${type === activeFilter ? "active" : ""}"
                data-filter="${type}">
                ${escapeHTML(t(type))}
            </button>
        `).join("");

    container.querySelectorAll("[data-filter]")
        .forEach(button => {
            button.addEventListener("click", () => {
                activeFilter = button.dataset.filter;

                showAllEvents = false;

                renderChips();
                renderEvents();
            });
        });
}

/* ===================================
   VIEW ALL EVENTS
=================================== */

function updateShowAllButton() {
    const button = $("show-all-events");

    const filtered =
        activeFilter === "all"
            ? allEvents
            : allEvents.filter(event =>
                normalizeType(event.event_type) === activeFilter
            );

    button.hidden =
        eventsState !== "loaded" ||
        filtered.length <= 6;

    button.textContent =
        showAllEvents
            ? t("showLess")
            : t("viewAllEvents");
}

/* ===================================
   RENDER UPCOMING EVENTS
=================================== */

function renderEvents() {
    const container = $("home-events");

    if (eventsState === "loading") {
        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(t("loadingEvents"))}
            </div>
        `;

        updateShowAllButton();
        return;
    }

    if (eventsState === "error") {
        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(t("eventError"))}
            </div>
        `;

        updateShowAllButton();
        return;
    }

    const filtered =
        activeFilter === "all"
            ? allEvents
            : allEvents.filter(event =>
                normalizeType(event.event_type) === activeFilter
            );

    const visible =
        showAllEvents
            ? filtered
            : filtered.slice(0, 6);

    if (!visible.length) {
        container.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(t(
            activeFilter === "all"
                ? "noEvents"
                : "noEventsFiltered"
        ))}
            </div>
        `;

        updateShowAllButton();
        return;
    }

    container.innerHTML = visible.map((event, index) => `
        <article class="event-card">

            <span class="event-type">
                ${escapeHTML(event.event_type || t("event"))}
            </span>

            <h3>
                ${escapeHTML(event.title)}
            </h3>

            <span class="event-date">
                📅 ${escapeHTML(formatDate(event.event_date))}
                ·
                🕒 ${escapeHTML(formatTimeRange(event))}
            </span>

            <p class="event-description">
                ${escapeHTML(event.description || "")}
            </p>

            <div class="event-footer">

                <button
                    class="btn event-detail-btn"
                    type="button"
                    data-index="${index}">
                    ${escapeHTML(t("viewDetails"))}
                </button>

            </div>

        </article>
    `).join("");

    container.querySelectorAll(".event-detail-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);

                openEventModal(visible[index]);
            });
        });

    updateShowAllButton();
}

/* ===================================
   EVENT DETAILS
=================================== */

function openEventModal(event) {
    if (!event) return;

    $("modal-type").textContent =
        event.event_type || t("event");

    $("modal-title").textContent =
        event.title || t("event");

    $("modal-description").textContent =
        event.description || "";

    $("modal-meta").innerHTML = `
        <span>
            <strong>${escapeHTML(t("dateLabel"))}:</strong>
            ${escapeHTML(formatDate(event.event_date))}
        </span>

        <span>
            <strong>${escapeHTML(t("timeLabel"))}:</strong>
            ${escapeHTML(formatTimeRange(event))}
        </span>

        <span>
            <strong>${escapeHTML(t("capacityLabel"))}:</strong>
            ${escapeHTML(event.capacity ?? "—")}
        </span>
    `;

    const ymd =
        String(event.event_date || "").replace(/-/g, "");

    const start =
        String(event.start_time || "09:00")
            .slice(0, 5)
            .replace(":", "");

    const end =
        String(event.end_time || "10:00")
            .slice(0, 5)
            .replace(":", "");

    const calendarLink = $("modal-gcal");

    if (/^\d{8}$/.test(ymd)) {
        const params = new URLSearchParams({
            action: "TEMPLATE",
            text: `[AUK] ${event.title || "Event"}`,
            dates:
                `${ymd}T${start}00/${ymd}T${end}00`,
            details: event.description || ""
        });

        calendarLink.href =
            `https://calendar.google.com/calendar/render?${params}`;

        calendarLink.hidden = false;
    } else {
        calendarLink.hidden = true;
        calendarLink.removeAttribute("href");
    }

    openDialog();
}

/* ===================================
   LOAD EVENTS FROM SUPABASE
=================================== */

async function loadEvents() {
    eventsState = "loading";
    renderEvents();

    try {
        const { data, error } = await db
            .from("events")
            .select(
                "event_id,title,description,event_type,event_date,start_time,end_time,capacity"
            )
            .gte("event_date", localToday())
            .order("event_date", {
                ascending: true
            })
            .order("start_time", {
                ascending: true
            });

        if (error) throw error;

        allEvents = data || [];
        eventsState = "loaded";

        $("stat-events").textContent =
            allEvents.length;

    } catch (error) {
        console.error("Events error:", error);

        allEvents = [];
        eventsState = "error";

        $("stat-events").textContent = "—";
    }

    renderChips();
    renderEvents();
}

/* ===================================
   USER SESSION & WELCOME MANAGEMENT
=================================== */

function renderUserWelcome() {
    const welcomeTitle = $("welcome-title");
    const roleBadge = $("user-role-badge");
    const welcomeSubtitle = $("welcome-subtitle");
    const signupBtn = $("signup-btn");
    const signinBtn = $("signin-btn");
    const signoutBtn = $("signout-btn");

    if (currentUser) {
        const name = currentUserName || (currentUser.email ? currentUser.email.split("@")[0] : "Attendee");
        if (welcomeTitle) {
            welcomeTitle.textContent = `${t("welcome")} ${escapeHTML(name)}!`;
        }
        if (roleBadge) {
            const roleKey = currentUserRole.toLowerCase().replace(/[^a-z]/g, "");
            roleBadge.textContent = t(roleKey) || t(currentUserRole.toLowerCase()) || currentUserRole;
        }
        if (welcomeSubtitle) {
            welcomeSubtitle.textContent = `${t("signedInAs")} ${currentUser.email || name}.`;
        }
        if (signupBtn) signupBtn.hidden = true;
        if (signinBtn) signinBtn.hidden = true;
        if (signoutBtn) signoutBtn.hidden = false;
    } else {
        if (welcomeTitle) {
            welcomeTitle.textContent = `${t("welcome")} ${t("guest")}!`;
        }
        if (roleBadge) {
            roleBadge.textContent = t("guest");
        }
        if (welcomeSubtitle) {
            welcomeSubtitle.textContent = t("welcomeSubtitle");
        }
        if (signupBtn) signupBtn.hidden = false;
        if (signinBtn) signinBtn.hidden = false;
        if (signoutBtn) signoutBtn.hidden = true;
    }
}

async function applyUserSession(user) {
    const createEventBtn = $("create-event-btn");

    if (!user) {
        currentUser = null;
        currentUserName = "";
        currentUserRole = "Guest";
        if (createEventBtn) createEventBtn.hidden = true;
        renderUserWelcome();
        return;
    }

    currentUser = user;
    currentUserName = user.user_metadata?.name || "";
    currentUserRole = user.user_metadata?.attendee_type || "Attendee";
    let isCoordinator = false;

    // Securely query coordinator table to verify Coordinator role
    if (db) {
        try {
            const { data: coordData, error: coordError } = await db
                .from("coordinator")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!coordError && coordData?.user_id) {
                isCoordinator = true;
                currentUserRole = "Coordinator";
            }
        } catch (e) {
            console.warn("Coordinator check error:", e);
        }

        if (!isCoordinator) {
            try {
                const { data: orgData, error: orgError } = await db
                    .from("organizer")
                    .select("user_id")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (!orgError && orgData?.user_id) {
                    currentUserRole = "Organizer";
                } else {
                    const { data: attData } = await db
                        .from("attendee")
                        .select("attendee_type")
                        .eq("user_id", user.id)
                        .maybeSingle();

                    if (attData?.attendee_type) {
                        currentUserRole = attData.attendee_type;
                    }
                }
            } catch (e) {
                console.warn("Role check error:", e);
            }
        }
    }

    // Keep the entry point available after sign-in. Supabase RLS enforces
    // coordinator authorization when the event is inserted.
    if (createEventBtn) {
        createEventBtn.hidden = !isCoordinator;
    }

    if (!currentUserName && db) {
        try {
            const { data, error } = await db
                .from("users")
                .select("name")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!error && data?.name) {
                currentUserName = data.name;
            }
        } catch (e) {
            console.warn("Unable to fetch user profile:", e);
        }
    }

    if (!currentUserName) {
        currentUserName = user.email ? user.email.split("@")[0] : "Attendee";
    }

    renderUserWelcome();
}

window.applyUserSession = applyUserSession;

async function handleSignOut() {
    if (db?.auth) {
        try {
            await db.auth.signOut();
        } catch (e) {
            console.error("Sign out error:", e);
        }
    }
    await applyUserSession(null);
    showToast(t("signedOutSuccess"));
}

async function initializeAuth() {
    const signoutBtn = $("signout-btn");
    if (signoutBtn) {
        signoutBtn.addEventListener("click", handleSignOut);
    }

    if (!db?.auth) return;

    try {
        const { data, error } = await db.auth.getSession();
        if (!error && data?.session?.user) {
            await applyUserSession(data.session.user);
        } else {
            await applyUserSession(null);
        }
    } catch (e) {
        console.warn("Session check error:", e);
        await applyUserSession(null);
    }

    db.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
            await applyUserSession(session.user);
        } else if (event === "SIGNED_OUT") {
            await applyUserSession(null);
        }
    });
}

/* ===================================
   INITIALIZATION
=================================== */

async function initialize() {
    $("current-year").textContent =
        new Date().getFullYear();

    initializeNavigation();
    initializeDialogs();

    $("theme-toggle").addEventListener("click", () => {
        const current =
            document.documentElement.dataset.theme;

        setTheme(
            current === "dark" ? "light" : "dark"
        );
    });

    $("language-toggle").addEventListener("click", () => {
        setLanguage(
            lang() === "ar" ? "en" : "ar"
        );
    });

    $("show-all-events").addEventListener("click", () => {
        showAllEvents = !showAllEvents;
        renderEvents();
    });

    setTheme(
        loadPreference("auk-theme") || "light"
    );

    setLanguage(
        loadPreference("auk-language") || "en"
    );

    if (!window.supabase?.createClient) {
        eventsState = "error";
        renderEvents();
        showToast(t("notConnected"));
        return;
    }

    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    // Share the existing client with signup.js and signin.js
    window.aukDb = db;

    await loadEvents();
    await initializeAuth();
    checkUrlAuthAction();
}

function checkUrlAuthAction() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("signin")) {
        const tryOpen = () => {
            if (typeof window.openSigninModal === "function") {
                window.openSigninModal();
                try {
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch {
                    // Ignore state replacement errors
                }
                return true;
            }
            return false;
        };

        if (!tryOpen()) {
            setTimeout(tryOpen, 150);
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );
} else {
    initialize();
}
