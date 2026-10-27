"use strict";

/* =========================================================
   AUK EVENTS — EVENTS PAGE
========================================================= */

const $ = (id) => document.getElementById(id);

let db = null;
let allEvents = [];
let currentUser = null;
let selectedEvent = null;
let lastFocusedElement = null;

let activeSearch = "";
let activeType = "all";

let loadState = "loading";
let authRequestVersion = 0;

let currentLanguage = "en";

/* =========================================================
   TRANSLATIONS
========================================================= */

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

        signUp: "Sign Up",
        signIn: "Sign In",
        signOut: "Sign Out",

        eventsEyebrow: "AUK CAMPUS ACTIVITIES",
        allEventsHeading: "Discover Upcoming Events",
        allEventsSubtitle:
            "Explore upcoming workshops, seminars, and campus activities at the American University of Kuwait.",

        upcomingEvents: "Upcoming Events",
        browseEvents: "Browse Events",
        eventsSubtitle: "Find events that interest you.",
        availableEvents: "Available Events",

        searchEventsPlaceholder:
            "Search by title, description, or venue...",

        all: "All Events",
        workshop: "Workshop",
        seminar: "Seminar",
        play: "Play",

        dateLabel: "Date",
        timeLabel: "Time",
        venueLabel: "Venue",
        capacityLabel: "Capacity",

        viewDetails: "View Details",
        description: "Description",
        addToCalendar: "Add to Google Calendar",
        close: "Close",

        backToHome: "Back to Home",
        clearFilters: "Clear Filters",

        noEvents: "No upcoming events",
        noEventsDescription:
            "There are currently no events matching your search or filters.",

        loadingEvents: "Loading events...",
        eventError: "Unable to load events. Please try again.",

        stayConnected: "Stay Connected with Campus Life",
        stayConnectedDescription:
            "Discover new opportunities, workshops, and university events.",

        toBeAnnounced: "To be announced",
        untitledEvent: "Untitled Event",
        noDescription: "No description available.",
        eventsFound: "events found"
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

        signUp: "إنشاء حساب",
        signIn: "تسجيل الدخول",
        signOut: "تسجيل الخروج",

        eventsEyebrow: "فعاليات الجامعة الأمريكية في الكويت",
        allEventsHeading: "اكتشف الفعاليات القادمة",
        allEventsSubtitle:
            "استكشف ورش العمل والندوات والأنشطة القادمة في الجامعة الأمريكية في الكويت.",

        upcomingEvents: "الفعاليات القادمة",
        browseEvents: "تصفح الفعاليات",
        eventsSubtitle: "ابحث عن الفعاليات التي تهمك.",
        availableEvents: "الفعاليات المتاحة",

        searchEventsPlaceholder:
            "ابحث بالعنوان أو الوصف أو الموقع...",

        all: "جميع الفعاليات",
        workshop: "ورشة عمل",
        seminar: "ندوة",
        play: "مسرحية",

        dateLabel: "التاريخ",
        timeLabel: "الوقت",
        venueLabel: "الموقع",
        capacityLabel: "السعة",

        viewDetails: "عرض التفاصيل",
        description: "الوصف",
        addToCalendar: "إضافة إلى تقويم Google",
        close: "إغلاق",

        backToHome: "العودة للرئيسية",
        clearFilters: "إزالة الفلاتر",

        noEvents: "لا توجد فعاليات قادمة",
        noEventsDescription:
            "لا توجد فعاليات مطابقة للبحث أو الفلاتر المحددة.",

        loadingEvents: "جارٍ تحميل الفعاليات...",
        eventError: "تعذر تحميل الفعاليات. حاول مرة أخرى.",

        stayConnected: "ابقَ على تواصل مع الحياة الجامعية",
        stayConnectedDescription:
            "اكتشف الفرص الجديدة وورش العمل والفعاليات الجامعية.",

        toBeAnnounced: "سيتم الإعلان لاحقاً",
        untitledEvent: "فعالية بدون عنوان",
        noDescription: "لا يوجد وصف متاح.",
        eventsFound: "فعالية"
    }
};

/* =========================================================
   STORAGE
========================================================= */

function readPreference(key, fallback) {
    try {
        return localStorage.getItem(key) || fallback;
    } catch {
        return fallback;
    }
}

function savePreference(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn("Unable to save preference:", error);
    }
}

/* =========================================================
   TRANSLATIONS
========================================================= */

function t(key) {
    return translations[currentLanguage]?.[key]
        || translations.en[key]
        || key;
}

function setLanguage(language) {
    currentLanguage = language === "ar" ? "ar" : "en";

    savePreference("auk-language", currentLanguage);

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir =
        currentLanguage === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        element.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        element.placeholder = t(key);
    });

    const languageButton = $("language-toggle");

    if (languageButton) {
        languageButton.textContent =
            currentLanguage === "ar" ? "English" : "العربية";
    }

    renderEvents();

    if (selectedEvent && $("event-modal") && !$("event-modal").hidden) {
        fillEventModal(selectedEvent);
    }
}

/* =========================================================
   THEME
========================================================= */

function setTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = selectedTheme;

    savePreference("auk-theme", selectedTheme);

    const button = $("theme-toggle");

    if (button) {
        button.textContent = selectedTheme === "dark" ? "☀️" : "🌙";
        button.setAttribute(
            "aria-label",
            selectedTheme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );
    }
}

/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   DATE / TIME
========================================================= */

function localToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString(
        currentLanguage === "ar" ? "ar-KW" : "en-GB",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

function formatTime(value) {
    if (!value) return "—";

    const parts = String(value).split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1] || 0);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return String(value);
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString(
        currentLanguage === "ar" ? "ar-KW" : "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}

function formatTimeRange(event) {
    const start = formatTime(event.start_time);

    if (!event.end_time) {
        return start;
    }

    return `${start} – ${formatTime(event.end_time)}`;
}

function eventEndDate(event) {
    if (!event.event_date) return null;

    const time = event.end_time || event.start_time || "23:59:59";
    const date = new Date(`${event.event_date}T${time}`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function isUpcomingEvent(event) {
    const end = eventEndDate(event);
    return end !== null && end >= new Date();
}

/* =========================================================
   EVENT HELPERS
========================================================= */

function translateEventType(type) {
    const value = String(type || "").toLowerCase();

    if (value === "workshop") return t("workshop");
    if (value === "seminar") return t("seminar");
    if (value === "play") return t("play");

    return type || "Event";
}

function getVenueName(event) {
    const venue = event.venues;

    if (Array.isArray(venue)) {
        return venue[0]?.venue_name || t("toBeAnnounced");
    }

    return venue?.venue_name || t("toBeAnnounced");
}

/* =========================================================
   EVENT LOADING
========================================================= */

async function loadEvents() {
    loadState = "loading";
    renderEvents();

    if ($("events-error")) {
        $("events-error").hidden = true;
    }

    try {
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
            .gte("event_date", localToday())
            .order("event_date", { ascending: true })
            .order("start_time", { ascending: true });

        if (error) throw error;

        allEvents = (data || [])
            .filter(isUpcomingEvent);

        loadState = "loaded";

        if ($("stat-events")) {
            $("stat-events").textContent = allEvents.length;
        }

        renderEvents();

    } catch (error) {
        console.error("Unable to load events:", error);

        allEvents = [];
        loadState = "error";

        if ($("stat-events")) {
            $("stat-events").textContent = "—";
        }

        renderEvents();
    }
}

/* =========================================================
   SEARCH / FILTER
========================================================= */

function getFilteredEvents() {
    const search = activeSearch.toLowerCase();

    return allEvents.filter((event) => {
        const title = String(event.title || "").toLowerCase();
        const description = String(event.description || "").toLowerCase();
        const venue = String(getVenueName(event)).toLowerCase();
        const type = String(event.event_type || "").toLowerCase();

        const matchesSearch =
            title.includes(search) ||
            description.includes(search) ||
            venue.includes(search) ||
            type.includes(search);

        const matchesType =
            activeType === "all" ||
            type === activeType.toLowerCase();

        return matchesSearch && matchesType;
    });
}

/* =========================================================
   EVENT CARD
========================================================= */

function eventInfo(icon, label, value) {
    return `
        <div class="event-info-item">
            <span class="event-info-icon" aria-hidden="true">
                ${icon}
            </span>

            <div class="event-info-text">
                <span class="event-info-label">
                    ${escapeHTML(label)}
                </span>

                <span class="event-info-value">
                    ${escapeHTML(value)}
                </span>
            </div>
        </div>
    `;
}

function renderEvents() {
    const grid = $("events-grid");

    if (!grid) return;

    const empty = $("events-empty");
    const errorBox = $("events-error");
    const count = $("events-count");

    if (empty) empty.hidden = true;
    if (errorBox) errorBox.hidden = true;

    if (loadState === "loading") {
        grid.innerHTML = `
            <div class="empty-state">
                ${escapeHTML(t("loadingEvents"))}
            </div>
        `;

        if (count) count.textContent = "";

        return;
    }

    if (loadState === "error") {
        grid.innerHTML = "";

        if (count) count.textContent = "";

        if (errorBox) {
            errorBox.textContent = t("eventError");
            errorBox.hidden = false;
        }

        return;
    }

    const filtered = getFilteredEvents();

    if (count) {
        count.textContent = `${filtered.length} ${t("eventsFound")}`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = "";

        if (empty) empty.hidden = false;

        return;
    }

    grid.innerHTML = filtered.map((event) => {
        const title = escapeHTML(event.title || t("untitledEvent"));
        const description = escapeHTML(
            event.description || t("noDescription")
        );
        const type = escapeHTML(
            translateEventType(event.event_type)
        );

        return `
            <article class="events-page-card">

                <span class="event-type">
                    ${type}
                </span>

                <h3>${title}</h3>

                <p class="event-description">
                    ${description}
                </p>

                <div class="event-info">

                    ${eventInfo(
            "📅",
            t("dateLabel"),
            formatDate(event.event_date)
        )}

                    ${eventInfo(
            "🕒",
            t("timeLabel"),
            formatTimeRange(event)
        )}

                    ${eventInfo(
            "📍",
            t("venueLabel"),
            getVenueName(event)
        )}

                    ${eventInfo(
            "👥",
            t("capacityLabel"),
            event.capacity ?? "—"
        )}

                </div>

                <div class="event-card-actions">
                    <button
                        type="button"
                        class="event-details-btn"
                        data-event-id="${escapeHTML(event.event_id)}"
                    >
                        ${escapeHTML(t("viewDetails"))}
                    </button>
                </div>

            </article>
        `;
    }).join("");
}

/* =========================================================
   GOOGLE CALENDAR
========================================================= */

function googleCalendarDate(date, time) {
    if (!date || !time) return null;

    const timeParts = String(time).split(":");

    const hh = (timeParts[0] || "00").padStart(2, "0");
    const mm = (timeParts[1] || "00").padStart(2, "0");
    const ss = (timeParts[2] || "00").padStart(2, "0");

    return `${String(date).replace(/-/g, "")}T${hh}${mm}${ss}`;
}

function getGoogleCalendarLink(event) {
    const start = googleCalendarDate(
        event.event_date,
        event.start_time
    );

    const end = googleCalendarDate(
        event.event_date,
        event.end_time
    );

    if (!start || !end) return null;

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title || "AUK Event",
        dates: `${start}/${end}`,
        details: event.description || "",
        location: getVenueName(event),
        ctz: "Asia/Kuwait"
    });

    return `https://calendar.google.com/calendar/render?${params}`;
}

/* =========================================================
   EVENT DETAILS MODAL
========================================================= */

function fillEventModal(event) {
    $("modal-type").textContent =
        translateEventType(event.event_type);

    $("modal-title").textContent =
        event.title || t("untitledEvent");

    $("modal-description").textContent =
        event.description || t("noDescription");

    $("modal-meta").innerHTML = `
        <div class="modal-event-info">
            <strong>${escapeHTML(t("dateLabel"))}</strong>
            <span>${escapeHTML(formatDate(event.event_date))}</span>
        </div>

        <div class="modal-event-info">
            <strong>${escapeHTML(t("timeLabel"))}</strong>
            <span>${escapeHTML(formatTimeRange(event))}</span>
        </div>

        <div class="modal-event-info">
            <strong>${escapeHTML(t("venueLabel"))}</strong>
            <span>${escapeHTML(getVenueName(event))}</span>
        </div>

        <div class="modal-event-info">
            <strong>${escapeHTML(t("capacityLabel"))}</strong>
            <span>${escapeHTML(event.capacity ?? "—")}</span>
        </div>
    `;

    const calendarButton = $("modal-gcal");
    const link = getGoogleCalendarLink(event);

    if (calendarButton) {
        if (link) {
            calendarButton.href = link;
            calendarButton.hidden = false;
        } else {
            calendarButton.removeAttribute("href");
            calendarButton.hidden = true;
        }
    }
}

function openEventModal(event) {
    selectedEvent = event;
    lastFocusedElement = document.activeElement;

    fillEventModal(event);

    $("event-modal").hidden = false;
    document.body.style.overflow = "hidden";

    $("modal-close")?.focus();
}

function closeEventModal() {
    $("event-modal").hidden = true;
    document.body.style.overflow = "";

    selectedEvent = null;

    if (lastFocusedElement?.isConnected) {
        lastFocusedElement.focus();
    }
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

function initializeEventControls() {
    $("event-search")?.addEventListener("input", (event) => {
        activeSearch = event.target.value.trim();
        renderEvents();
    });

    $("event-type-filter")?.addEventListener("change", (event) => {
        activeType = event.target.value;
        renderEvents();
    });

    $("clear-filters")?.addEventListener("click", () => {
        activeSearch = "";
        activeType = "all";

        if ($("event-search")) {
            $("event-search").value = "";
        }

        if ($("event-type-filter")) {
            $("event-type-filter").value = "all";
        }

        renderEvents();
    });

    $("events-grid")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-event-id]");

        if (!button) return;

        const eventData = allEvents.find(
            (item) =>
                String(item.event_id) === button.dataset.eventId
        );

        if (eventData) {
            openEventModal(eventData);
        }
    });

    $("modal-close")?.addEventListener(
        "click",
        closeEventModal
    );

    $("modal-close-btn")?.addEventListener(
        "click",
        closeEventModal
    );

    $("event-modal")?.addEventListener("click", (event) => {
        if (event.target === $("event-modal")) {
            closeEventModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            $("event-modal") &&
            !$("event-modal").hidden
        ) {
            closeEventModal();
        }
    });
}

/* =========================================================
   INITIALIZE
========================================================= */

async function initialize() {
    // Initialize custom event filter
    initializeCustomEventFilter();
    const year = $("current-year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Hide signed-in controls until the session is checked.
    if ($("user-menu")) $("user-menu").hidden = true;
    if ($("coordinator-menu")) $("coordinator-menu").hidden = true;

    // Theme
    setTheme(readPreference("auk-theme", "light"));

    $("theme-toggle")?.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme;

        setTheme(current === "dark" ? "light" : "dark");
    });

    // Language
    setLanguage(readPreference("auk-language", "en"));

    $("language-toggle")?.addEventListener("click", () => {
        setLanguage(currentLanguage === "en" ? "ar" : "en");
    });

    // Event controls
    initializeEventControls();

    // Supabase
    if (
        !window.supabase ||
        !window.SUPABASE_URL ||
        !window.SUPABASE_ANON_KEY
    ) {
        console.error("Supabase configuration is missing.");

        loadState = "error";
        renderEvents();

        return;
    }

    db = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY
    );

    // Load events
    await loadEvents();
}

document.addEventListener("DOMContentLoaded", initialize);
function initializeCustomEventFilter() {
    const dropdown = document.getElementById("event-filter-dropdown");
    const trigger = document.getElementById("event-filter-trigger");
    const menu = document.getElementById("event-filter-menu");
    const selected = document.getElementById("selected-event-type");

    if (!dropdown || !trigger || !menu || !selected) return;

    const options = [...menu.querySelectorAll(".dropdown-option")];

    function openDropdown() {
        dropdown.classList.add("open");
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
        dropdown.classList.remove("open");
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
    }

    // Open when hovering
    dropdown.addEventListener("mouseenter", openDropdown);

    // Stay open while hovering, close when leaving
    dropdown.addEventListener("mouseleave", closeDropdown);

    // Also support clicking on mobile
    trigger.addEventListener("click", () => {
        if (menu.hidden) {
            openDropdown();
        } else {
            closeDropdown();
        }
    });

    options.forEach(option => {
        option.addEventListener("click", () => {
            const value = option.dataset.value;

            selected.textContent = option.textContent.trim();

            options.forEach(item => {
                const active = item === option;
                item.classList.toggle("active", active);
                item.setAttribute("aria-selected", String(active));
            });

            // Apply the selected event filter
            activeFilter = value.toLowerCase();

            renderEvents();

            closeDropdown();
        });
    });

    // Close when clicking outside
    document.addEventListener("click", event => {
        if (!dropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    // Close with Escape

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeDropdown();
            trigger.focus();
        }
    });
}