
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
let selectedEvent = null;
let userBookingsMap = new Map();

/* ===================================
   TRANSLATIONS
=================================== */

const translations = {
    en: {
        home: "Home",
        events: "Events",
        profile: "Profile",
        coordinatorEvents: "Coordinator Events",
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
            "There are no upcoming events.",
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
        capacityLabel: "Capacity",
        venueLabel: "Venue",
        reserveSeat: "Reserve Seat",
        reserving: "Reserving...",
        signInToReserve: "Sign In to Reserve",
        alreadyReservedConfirmed: "✓ You have a confirmed reservation for this event.",
        alreadyReservedWaitlisted: "⏳ You are on the waitlist for this event.",
        reserveSuccessConfirmed: "Seat reserved successfully! Your status is Confirmed.",
        reserveSuccessWaitlisted: "Event capacity reached. You have been added to the Waitlist.",
        duplicateBooking: "You already have a reservation for this event.",
        attendeeRequired: "Only registered attendee accounts can make reservations.",
        reserveError: "Unable to reserve a seat. Please try again.",
        viewMyBookings: "View My Bookings",
        statusConfirmed: "Confirmed",
        statusWaitlisted: "Waitlisted",
        guestReservePrompt: "Sign in or create an account to reserve your seat.",
    },

    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        profile: "الملف الشخصي",
        coordinatorEvents: "فعاليات المنسق",
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
        capacityLabel: "السعة",
        venueLabel: "المكان",
        reserveSeat: "حجز مقعد",
        reserving: "جارٍ الحجز...",
        signInToReserve: "تسجيل الدخول للحجز",
        alreadyReservedConfirmed: "✓ لديك حجز مؤكد في هذه الفعالية.",
        alreadyReservedWaitlisted: "⏳ أنت في قائمة الانتظار لهذه الفعالية.",
        reserveSuccessConfirmed: "تم حجز مقعدك بنجاح! حالتك: مؤكد.",
        reserveSuccessWaitlisted: "الفعالية مكتملة السعة. تمت إضافتك إلى قائمة الانتظار.",
        duplicateBooking: "لديك حجز مسبق لهذه الفعالية بالفعل.",
        attendeeRequired: "يمكن لحسابات الحضور المسجلين فقط إجراء الحجوزات.",
        reserveError: "تعذر إتمام الحجز. يرجى المحاولة مرة أخرى.",
        viewMyBookings: "عرض حجوزاتي",
        statusConfirmed: "مؤكد",
        statusWaitlisted: "قائمة الانتظار",
        guestReservePrompt: "سجل الدخول أو أنشئ حساباً لحجز مقعدك.",
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
    const button = document.getElementById("show-all-events");

    if (!button) return;

    button.hidden = false;
}

/* ===================================
   RENDER UPCOMING EVENTS
=================================== */


function renderEvents() {
    const container = $("home-events");

    if (!container) return;

    // Loading state
    if (eventsState === "loading") {
        container.innerHTML = `
            <div class="empty-state" role="status">
                ${escapeHTML(t("loadingEvents"))}
            </div>
        `;

        updateShowAllButton();
        return;
    }

    // Error state
    if (eventsState === "error") {
        container.innerHTML = `
            <div class="empty-state" role="alert">
                ${escapeHTML(t("eventError"))}
            </div>
        `;

        updateShowAllButton();
        return;
    }

    // Filter events by category
    const filtered =
        activeFilter === "all"
            ? allEvents
            : allEvents.filter(event =>
                normalizeType(event.event_type) === activeFilter
            );

    // Show 3 initially, then all when requested
    const visible = filtered.slice(0, 3);
    // Empty state
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

    // Render event cards
    container.innerHTML = visible.map((event, index) => {

        const venueName =
            event.venues?.venue_name || "To be announced";

        return `
            <article class="event-card">

                <span class="event-type">
                    ${escapeHTML(event.event_type || t("event"))}
                </span>

                <h3>
                    ${escapeHTML(event.title)}
                </h3>

                <p class="event-description">
                    ${escapeHTML(
            event.description || "No description available."
        )}
                </p>

                <div class="event-info">

                    <p>
                        <strong>${escapeHTML(t("dateLabel"))}:</strong>
                        ${escapeHTML(formatDate(event.event_date))}
                    </p>

                    <p>
                        <strong>${escapeHTML(t("timeLabel"))}:</strong>
                        ${escapeHTML(formatTimeRange(event))}
                    </p>

                    <p>
                        <strong>${escapeHTML(t("venueLabel"))}:</strong>
                        ${escapeHTML(venueName)}
                    </p>

                    <p>
                        <strong>${escapeHTML(t("capacityLabel"))}:</strong>
                        ${escapeHTML(event.capacity ?? "—")}
                    </p>

                </div>

                <div class="event-footer">

                    <button
                        class="btn event-detail-btn"
                        type="button"
                        data-index="${index}">
                        ${escapeHTML(t("viewDetails"))}
                    </button>

                </div>

            </article>
        `;
    }).join("");

    // View Details buttons
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

    const venueName =
        event.venues?.venue_name || "To be announced";

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
            <strong>${escapeHTML(t("venueLabel"))}:</strong>
            ${escapeHTML(venueName)}
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
            dates: `${ymd}T${start}00/${ymd}T${end}00`,
            details: event.description || "",
            location: venueName
        });

        calendarLink.href =
            `https://calendar.google.com/calendar/render?${params}`;

        calendarLink.hidden = false;
    } else {
        calendarLink.hidden = true;
        calendarLink.removeAttribute("href");
    }

    updateModalReservationState(event);
    openDialog();
}

/* ===================================
   RESERVATIONS
=================================== */

async function fetchUserBookings() {
    if (!currentUser || !db) return;

    try {
        const { data, error } = await db
            .from("bookings")
            .select("booking_id, event_id, status")
            .eq("user_id", currentUser.id);

        if (error) {
            console.warn("Could not load user bookings:", error);
            return;
        }

        userBookingsMap.clear();
        (data || []).forEach(b => {
            if (b.status === "Confirmed" || b.status === "Waitlisted") {
                userBookingsMap.set(Number(b.event_id), b);
            }
        });
    } catch (err) {
        console.warn("Error fetching user bookings:", err);
    }
}

function updateModalReservationState(event) {
    const reserveBtn = $("modal-reserve-btn");
    const viewBookingBtn = $("modal-view-booking-btn");
    const banner = $("modal-reservation-banner");

    if (!reserveBtn || !event) return;

    const existingBooking = userBookingsMap.get(Number(event.event_id));

    if (!currentUser) {
        reserveBtn.hidden = false;
        reserveBtn.disabled = false;
        reserveBtn.textContent = t("signInToReserve");
        reserveBtn.onclick = () => {
            sessionStorage.setItem("pending_booking_event_id", String(event.event_id));
            sessionStorage.setItem("pending_booking_return_url", "home.html");
            closeDialog();
            if (typeof window.openSigninModal === "function") {
                window.openSigninModal();
            } else {
                window.location.assign("signin.html");
            }
        };

        if (viewBookingBtn) viewBookingBtn.hidden = true;
        if (banner) {
            banner.hidden = false;
            banner.className = "modal-reservation-banner banner-info";
            banner.textContent = t("guestReservePrompt");
        }
        return;
    }

    if (existingBooking) {
        reserveBtn.hidden = true;
        if (viewBookingBtn) viewBookingBtn.hidden = false;

        if (banner) {
            banner.hidden = false;
            if (existingBooking.status === "Confirmed") {
                banner.className = "modal-reservation-banner banner-success";
                banner.textContent = t("alreadyReservedConfirmed");
            } else {
                banner.className = "modal-reservation-banner banner-warning";
                banner.textContent = t("alreadyReservedWaitlisted");
            }
        }
    } else {
        reserveBtn.hidden = false;
        reserveBtn.disabled = false;
        reserveBtn.textContent = t("reserveSeat");
        reserveBtn.onclick = () => handleReserveSeat(event);

        if (viewBookingBtn) viewBookingBtn.hidden = true;
        if (banner) {
            banner.hidden = true;
            banner.textContent = "";
        }
    }
}

async function handleReserveSeat(event) {
    if (!currentUser) {
        if (event && event.event_id) {
            sessionStorage.setItem("pending_booking_event_id", String(event.event_id));
            sessionStorage.setItem("pending_booking_return_url", "home.html");
        }
        closeDialog();
        if (typeof window.openSigninModal === "function") {
            window.openSigninModal();
        } else {
            window.location.assign("signin.html");
        }
        return;
    }

    if (!event || !event.event_id) return;

    const reserveBtn = $("modal-reserve-btn");
    if (reserveBtn) {
        reserveBtn.disabled = true;
        reserveBtn.textContent = t("reserving");
    }

    try {
        const { data, error } = await db
            .from("bookings")
            .insert([
                {
                    user_id: currentUser.id,
                    event_id: event.event_id
                }
            ])
            .select("booking_id, event_id, status")
            .single();

        if (error) throw error;

        userBookingsMap.set(Number(data.event_id), data);

        if (data.status === "Confirmed") {
            showToast(t("reserveSuccessConfirmed"), "success");
        } else {
            showToast(t("reserveSuccessWaitlisted"), "warning");
        }

        updateModalReservationState(event);
        renderEvents();
    } catch (err) {
        console.error("Reservation failed:", err);
        const code = err?.code;
        const msg = String(err?.message || "");

        if (code === "23505" || msg.includes("unique_user_event") || msg.includes("duplicate")) {
            showToast(t("duplicateBooking"), "warning");
            await fetchUserBookings();
            updateModalReservationState(event);
            renderEvents();
        } else if (msg.includes("attendee") || msg.includes("is_attendee")) {
            showToast(t("attendeeRequired"), "error");
        } else {
            showToast(err.message || t("reserveError"), "error");
        }

        if (reserveBtn) {
            reserveBtn.disabled = false;
            reserveBtn.textContent = t("reserveSeat");
        }
    }
}

/* ===================================
   LOAD EVENTS FROM SUPABASE
=================================== */

function updateUpcomingEventsCount() {
    const counter = document.getElementById("stat-events");

    if (!counter) return;

    counter.textContent = allEvents.length;
}

async function loadEvents() {
    eventsState = "loading";
    renderEvents();

    try {
        const today = localToday();

        const { data, error } = await db
            .from("events")
            .select(`
                event_id,
                title,
                description,
                event_type,
                event_date,
                start_time,
                end_time,
                capacity,
                venues (
                    venue_name
                )
            `)
            .gte("event_date", today)
            .order("event_date", { ascending: true })
            .order("start_time", { ascending: true });

        if (error) throw error;

        const now = new Date();

        allEvents = (data || []).filter(event => {
            if (!event.end_time) return true;

            const end = new Date(
                `${event.event_date}T${event.end_time}`
            );

            return !Number.isNaN(end.getTime()) && end >= now;
        });

        eventsState = "loaded";

    } catch (error) {
        console.error("Unable to load events:", error);
        allEvents = [];
        eventsState = "error";
    }

    updateUpcomingEventsCount();
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
    const profileLink = $("profile-link");

    if (currentUser) {
        if (profileLink) profileLink.hidden = false;
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
        if (profileLink) profileLink.hidden = true;
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

    const coordEventsLink = $("coordinator-events-link");

    if (!user) {
        currentUser = null;
        currentUserName = "";
        currentUserRole = "Guest";
        userBookingsMap.clear();
        if (createEventBtn) createEventBtn.hidden = true;
        if (coordEventsLink) coordEventsLink.hidden = true;
        renderUserWelcome();
        renderEvents();
        if (selectedEvent && $("event-modal") && !$("event-modal").hidden) {
            updateModalReservationState(selectedEvent);
        }
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
    if (coordEventsLink) {
        coordEventsLink.hidden = Boolean(user && !isCoordinator);
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

    await fetchUserBookings();
    renderUserWelcome();
    renderEvents();
    if (selectedEvent && $("event-modal") && !$("event-modal").hidden) {
        updateModalReservationState(selectedEvent);
    }
    if (typeof window.applyNavbarUser === "function") {
        window.applyNavbarUser(user);
    }
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

    // Check for post-login redirection or return to event
    const urlParams = new URLSearchParams(window.location.search);
    const targetEventId = urlParams.get("event_id") || sessionStorage.getItem("pending_booking_event_id");
    if (targetEventId && !urlParams.has("signin") && !urlParams.has("signup")) {
        sessionStorage.removeItem("pending_booking_event_id");
        sessionStorage.removeItem("pending_booking_return_url");
        const match = allEvents.find(e => String(e.event_id) === String(targetEventId));
        if (match) {
            openEventModal(match);
            try {
                const cleanUrl = new URL(window.location);
                cleanUrl.searchParams.delete("event_id");
                window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ""));
            } catch {
                // Ignore URL cleanup errors
            }
        }
    }
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
} function initializeMobileMenu() {
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    // Close menu when clicking a navigation link
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        });
    });

    // Close menu when clicking outside
    document.addEventListener("click", event => {
        if (
            !navLinks.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMobileMenu);
} else {
    initializeMobileMenu();
}