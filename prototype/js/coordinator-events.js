"use strict";

const SUPABASE_URL =
    window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";

const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

const $ = id => document.getElementById(id);

let client = null;
let currentUser = null;
let coordinatorRecord = null;
let isCoordinator = false;

let allEvents = [];
let venueMap = new Map();
let timingFilter = "all"; // "all" | "upcoming" | "past"
let typeFilter = "all";
let searchQuery = "";

let lastFocusedElement = null;

/* ===================================
   TRANSLATIONS
=================================== */

const translations = {
    en: {
        home: "Home",
        events: "Events",
        profile: "Profile",
        coordinatorEvents: "Coordinator Events",
        createEvent: "+ Create Event",
        createVenue: "+ Create Venue",
        signOut: "Sign Out",
        coordinator: "Coordinator",
        coordinatorEyebrow: "COORDINATOR DASHBOARD",
        allEventsHeading: "My Coordinator Events",
        allEventsSubtitle:
            "View and manage events created by you in one centralized schedule.",
        statTotalEvents: "My Total Events",
        statUpcomingEvents: "My Upcoming Events",
        statPastEvents: "My Past Events",
        filterAll: "All Events",
        filterUpcoming: "Upcoming",
        filterPast: "Past",
        searchPlaceholder: "Search by title, venue, or type...",
        allTypes: "All Types",
        typeWorkshop: "Workshop",
        typeSeminar: "Seminar",
        typePlay: "Play",
        dateLabel: "Date",
        timeLabel: "Time",
        venueLabel: "Venue",
        capacityLabel: "Capacity",
        seats: "seats",
        descriptionHeading: "Description",
        viewDetails: "View Details",
        addToCalendar: "Add to Google Calendar",
        close: "Close",
        upcoming: "Upcoming",
        past: "Past",
        venueUnavailable: "Venue unavailable",
        noDescriptionAvailable: "No description available.",
        noEventsAvailable: "No events created by you yet.",
        noFilteredEvents: "No events match this filter.",
        loadingEvents: "Loading events...",
        errorLoading: "Unable to load events. Please try again later.",
        pleaseSignIn: "Please sign in as a coordinator to view coordinator events.",
        onlyCoordinators: "Only coordinators can view coordinator events.",
        unableToConnect: "Unable to connect to Supabase.",
        unableToVerify: "Unable to verify coordinator access. Check the Supabase configuration."
    },
    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        profile: "الملف الشخصي",
        coordinatorEvents: "فعاليات المنسق",
        createEvent: "+ إنشاء فعالية",
        createVenue: "+ إنشاء قاعة",
        signOut: "تسجيل الخروج",
        coordinator: "منسق",
        coordinatorEyebrow: "لوحة تحكم المنسق",
        allEventsHeading: "فعالياتي كمنسق",
        allEventsSubtitle:
            "عرض وإدارة الفعاليات التي أنشأتها السابقة والقادمة في جدول مركزي واحد.",
        statTotalEvents: "إجمالي فعالياتي",
        statUpcomingEvents: "فعالياتي القادمة",
        statPastEvents: "فعالياتي السابقة",
        filterAll: "جميع الفعاليات",
        filterUpcoming: "القادمة",
        filterPast: "السابقة",
        searchPlaceholder: "بحث بالعنوان أو القاعة أو النوع...",
        allTypes: "جميع الأنواع",
        typeWorkshop: "ورشة عمل",
        typeSeminar: "ندوة",
        typePlay: "مسرحية",
        dateLabel: "التاريخ",
        timeLabel: "الوقت",
        venueLabel: "القاعة",
        capacityLabel: "السعة",
        seats: "مقعد",
        descriptionHeading: "الوصف",
        viewDetails: "عرض التفاصيل",
        addToCalendar: "إضافة إلى تقويم Google",
        close: "إغلاق",
        upcoming: "قادمة",
        past: "سابقة",
        venueUnavailable: "المكان غير متوفر",
        noDescriptionAvailable: "لا يوجد وصف متاح.",
        noEventsAvailable: "لا توجد فعاليات متاحة.",
        noFilteredEvents: "لا توجد فعاليات تطابق هذا الفلتر.",
        loadingEvents: "جارٍ تحميل الفعاليات...",
        errorLoading: "تعذر تحميل الفعاليات. يرجى المحاولة لاحقاً.",
        pleaseSignIn: "يرجى تسجيل الدخول كمنسق لعرض فعاليات المنسق.",
        onlyCoordinators: "يمكن للمنسقين فقط عرض فعاليات المنسق.",
        unableToConnect: "تعذر الاتصال بقاعدة البيانات.",
        unableToVerify: "تعذر التحقق من صلاحيات المنسق. يرجى التحقق من الإعدادات."
    }
};

function lang() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
}

function t(key) {
    return translations[lang()]?.[key] || key;
}

function setMessage(keyOrText, type) {
    const message = $("access-message");
    if (!message) return;

    if (!keyOrText) {
        message.textContent = "";
        message.className = "form-message";
        delete message.dataset.i18nKey;
        return;
    }

    message.dataset.i18nKey = keyOrText;
    message.textContent = t(keyOrText);
    message.className = `form-message ${type || ""}`.trim();
}

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

/* ===================================
   TIMING / DATE LOGIC
=================================== */

function isPastEvent(event) {
    if (!event || !event.event_date) return false;

    const now = new Date();
    const currentDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    if (event.event_date < currentDate) return true;
    if (event.event_date > currentDate) return false;

    // Event is today: compare end_time or start_time
    const timeToCheck = event.end_time || event.start_time;
    if (!timeToCheck) return false;

    const currentTime = [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0")
    ].join(":");

    return timeToCheck < currentTime;
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;

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
    const start = String(event.start_time || "").slice(0, 5);
    const end = String(event.end_time || "").slice(0, 5);

    if (start && end) return `${start} – ${end}`;
    return start || end || "—";
}

/* ===================================
   VENUE AND DESCRIPTION HELPERS
=================================== */

// Criterion 6: If venue_id has no matching venue, displays "Venue unavailable" without crashing
function getVenueDisplay(venueId) {
    if (venueId === null || venueId === undefined || venueId === "") {
        return {
            displayName: t("venueUnavailable"),
            location: "",
            roomCapacity: null,
            isUnavailable: true
        };
    }

    const venue = venueMap.get(Number(venueId));
    if (!venue) {
        return {
            displayName: t("venueUnavailable"),
            location: "",
            roomCapacity: null,
            isUnavailable: true
        };
    }

    const locationText = venue.location ? ` — ${venue.location}` : "";
    return {
        displayName: `${venue.venue_name}${locationText}`,
        venueName: venue.venue_name,
        location: venue.location || "",
        roomCapacity: venue.room_capacity,
        isUnavailable: false
    };
}

// Criterion 5: If an event has missing optional events.description, displays "No description available."
function getDescriptionDisplay(description) {
    if (!description || !description.trim()) {
        return {
            text: t("noDescriptionAvailable"),
            isMissing: true
        };
    }
    return {
        text: description.trim(),
        isMissing: false
    };
}

/* ===================================
   RENDERING EVENTS & STATS
=================================== */

function updateStatsAndCounts() {
    const total = allEvents.length;
    let upcomingCount = 0;
    let pastCount = 0;

    allEvents.forEach(event => {
        if (isPastEvent(event)) {
            pastCount++;
        } else {
            upcomingCount++;
        }
    });

    const statTotal = $("stat-total");
    const statUpcoming = $("stat-upcoming");
    const statPast = $("stat-past");

    if (statTotal) statTotal.textContent = total;
    if (statUpcoming) statUpcoming.textContent = upcomingCount;
    if (statPast) statPast.textContent = pastCount;

    const countAll = $("count-all");
    const countUpcoming = $("count-upcoming");
    const countPast = $("count-past");

    if (countAll) countAll.textContent = total;
    if (countUpcoming) countUpcoming.textContent = upcomingCount;
    if (countPast) countPast.textContent = pastCount;
}

function getFilteredEvents() {
    return allEvents.filter(event => {
        // Timing filter
        const isPast = isPastEvent(event);
        if (timingFilter === "upcoming" && isPast) return false;
        if (timingFilter === "past" && !isPast) return false;

        // Type filter
        if (typeFilter !== "all") {
            const evType = String(event.event_type || "").trim().toLowerCase();
            if (evType !== typeFilter.toLowerCase()) return false;
        }

        // Search query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const title = String(event.title || "").toLowerCase();
            const type = String(event.event_type || "").toLowerCase();
            const desc = String(event.description || "").toLowerCase();
            const venue = getVenueDisplay(event.venue_id).displayName.toLowerCase();

            if (!title.includes(q) && !type.includes(q) && !desc.includes(q) && !venue.includes(q)) {
                return false;
            }
        }

        return true;
    });
}

function renderEvents() {
    const grid = $("events-grid");
    if (!grid) return;

    updateStatsAndCounts();

    // Criterion 7: If there are no events, the coordinator sees "No events available."
    if (allEvents.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" id="empty-state-msg">
                ${escapeHTML(t("noEventsAvailable"))}
            </div>
        `;
        return;
    }

    const filtered = getFilteredEvents();

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" id="empty-state-filtered">
                ${escapeHTML(t("noFilteredEvents"))}
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(event => {
        const isPast = isPastEvent(event);
        const venueInfo = getVenueDisplay(event.venue_id);
        const descInfo = getDescriptionDisplay(event.description);
        const statusClass = isPast ? "status-past" : "status-upcoming";
        const statusLabel = isPast ? t("past") : t("upcoming");
        const cardPastClass = isPast ? "card-past" : "";

        return `
            <article class="coordinator-card ${cardPastClass}" data-event-id="${escapeHTML(event.event_id)}">
                <div class="card-top-row">
                    <span class="event-type">${escapeHTML(event.event_type || t("events"))}</span>
                    <span class="status-badge ${statusClass}">${escapeHTML(statusLabel)}</span>
                </div>

                <h3>${escapeHTML(event.title)}</h3>

                <div class="card-meta-list">
                    <div class="card-meta-item">
                        <span class="meta-icon" aria-hidden="true">📅</span>
                        <span>${escapeHTML(formatDate(event.event_date))}</span>
                    </div>

                    <div class="card-meta-item">
                        <span class="meta-icon" aria-hidden="true">🕒</span>
                        <span>${escapeHTML(formatTimeRange(event))}</span>
                    </div>

                    <div class="card-meta-item ${venueInfo.isUnavailable ? "venue-missing" : ""}">
                        <span class="meta-icon" aria-hidden="true">📍</span>
                        <span>${escapeHTML(venueInfo.displayName)}</span>
                    </div>
                </div>

                <p class="card-description ${descInfo.isMissing ? "missing-desc" : ""}">
                    ${escapeHTML(descInfo.text)}
                </p>

                <div class="card-footer">
                    <span class="capacity-indicator">
                        👥 ${escapeHTML(event.capacity || "—")} ${escapeHTML(t("seats"))}
                    </span>

                    <button type="button" class="btn btn-outline view-details-btn" data-event-id="${escapeHTML(event.event_id)}">
                        ${escapeHTML(t("viewDetails"))}
                    </button>
                </div>
            </article>
        `;
    }).join("");

    // Criterion 4: Coordinator can select an event to view its full details
    grid.querySelectorAll(".view-details-btn").forEach(button => {
        button.addEventListener("click", event => {
            event.stopPropagation();
            const eventId = Number(button.dataset.eventId);
            const targetEvent = allEvents.find(e => Number(e.event_id) === eventId);
            if (targetEvent) openEventModal(targetEvent);
        });
    });

    grid.querySelectorAll(".coordinator-card").forEach(card => {
        card.addEventListener("click", () => {
            const eventId = Number(card.dataset.eventId);
            const targetEvent = allEvents.find(e => Number(e.event_id) === eventId);
            if (targetEvent) openEventModal(targetEvent);
        });
    });
}

/* ===================================
   EVENT DETAILS MODAL (AC 4)
=================================== */

function openEventModal(event) {
    if (!event) return;

    lastFocusedElement = document.activeElement;

    const isPast = isPastEvent(event);
    const venueInfo = getVenueDisplay(event.venue_id);
    const descInfo = getDescriptionDisplay(event.description);

    $("modal-type").textContent = event.event_type || t("events");
    const statusElem = $("modal-status");
    statusElem.textContent = isPast ? t("past") : t("upcoming");
    statusElem.className = `status-badge ${isPast ? "status-past" : "status-upcoming"}`;

    $("modal-title").textContent = event.title || "—";
    $("modal-date").textContent = formatDate(event.event_date);
    $("modal-time").textContent = formatTimeRange(event);
    $("modal-venue").textContent = venueInfo.displayName;

    const capacityText = venueInfo.roomCapacity
        ? `${event.capacity || "—"} / max ${venueInfo.roomCapacity} ${t("seats")}`
        : `${event.capacity || "—"} ${t("seats")}`;
    $("modal-capacity").textContent = capacityText;

    const descElem = $("modal-description");
    descElem.textContent = descInfo.text;
    descElem.className = descInfo.isMissing ? "missing-desc" : "";

    // Google Calendar button for upcoming events
    const gcalBtn = $("modal-gcal");
    if (!isPast && event.event_date && event.start_time && event.end_time) {
        const ymd = String(event.event_date).replace(/-/g, "");
        const start = String(event.start_time).slice(0, 5).replace(":", "");
        const end = String(event.end_time).slice(0, 5).replace(":", "");

        if (/^\d{8}$/.test(ymd)) {
            const params = new URLSearchParams({
                action: "TEMPLATE",
                text: `[AUK] ${event.title || "Event"}`,
                dates: `${ymd}T${start}00/${ymd}T${end}00`,
                details: event.description || "",
                location: venueInfo.displayName || ""
            });
            gcalBtn.href = `https://calendar.google.com/calendar/render?${params}`;
            gcalBtn.hidden = false;
        } else {
            gcalBtn.hidden = true;
        }
    } else {
        gcalBtn.hidden = true;
    }

    $("event-modal").hidden = false;
    document.body.style.overflow = "hidden";
    $("modal-close").focus();
}

function closeEventModal() {
    $("event-modal").hidden = true;
    document.body.style.overflow = "";

    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

function initializeDialog() {
    $("modal-close").addEventListener("click", closeEventModal);
    $("modal-close-btn").addEventListener("click", closeEventModal);

    $("event-modal").addEventListener("click", event => {
        if (event.target === $("event-modal")) {
            closeEventModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !$("event-modal").hidden) {
            closeEventModal();
        }
    });
}

/* ===================================
   LANGUAGE & THEME HANDLING
=================================== */

function setTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    localStorage.setItem("auk-theme", value);

    const themeToggle = $("theme-toggle");
    if (themeToggle) {
        themeToggle.textContent = value === "dark" ? "☀️" : "🌙";
    }
}

function setLanguage(language) {
    const value = language === "ar" ? "ar" : "en";
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    localStorage.setItem("auk-language", value);

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        if (translations[value]?.[key]) {
            element.textContent = translations[value][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        if (translations[value]?.[key]) {
            element.placeholder = translations[value][key];
        }
    });

    const langToggle = $("language-toggle");
    if (langToggle) {
        langToggle.textContent = value === "ar" ? "English" : "العربية";
    }

    const currentYear = $("current-year");
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    const accessMsg = $("access-message");
    if (accessMsg && accessMsg.dataset.i18nKey) {
        accessMsg.textContent = t(accessMsg.dataset.i18nKey);
    }

    if (isCoordinator) {
        renderEvents();
    }
}

/* ===================================
   NAVIGATION & CONTROLS
=================================== */

function closeMenu() {
    const navLinks = $("nav-links");
    const menuToggle = $("menu-toggle");
    if (navLinks) navLinks.classList.remove("open");
    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    }
}

function initializeNavigation() {
    const menuToggle = $("menu-toggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const navLinks = $("nav-links");
            const open = navLinks.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(open));
            menuToggle.textContent = open ? "✕" : "☰";
        });
    }

    document.addEventListener("click", event => {
        if (!event.target.closest("nav")) closeMenu();
    });

    const currentTheme = document.documentElement.dataset.theme || "light";
    const themeToggle = $("theme-toggle");
    if (themeToggle) {
        themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";
        themeToggle.addEventListener("click", () => {
            setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
        });
    }

    const langToggle = $("language-toggle");
    if (langToggle) {
        langToggle.addEventListener("click", () => {
            setLanguage(document.documentElement.lang === "ar" ? "en" : "ar");
        });
    }

    const signoutBtn = $("signout-btn");
    if (signoutBtn) {
        signoutBtn.addEventListener("click", async () => {
            if (client) await client.auth.signOut();
            window.location.assign("home.html");
        });
    }
}

function initializeControls() {
    // Timing Filter Tabs
    const tabs = [
        { id: "tab-all", filter: "all" },
        { id: "tab-upcoming", filter: "upcoming" },
        { id: "tab-past", filter: "past" }
    ];

    tabs.forEach(({ id, filter }) => {
        const tab = $(id);
        if (tab) {
            tab.addEventListener("click", () => {
                tabs.forEach(tItem => {
                    const btn = $(tItem.id);
                    if (btn) {
                        btn.classList.remove("active");
                        btn.setAttribute("aria-selected", "false");
                    }
                });
                tab.classList.add("active");
                tab.setAttribute("aria-selected", "true");
                timingFilter = filter;
                renderEvents();
            });
        }
    });

    // Search Input
    const searchInput = $("event-search");
    if (searchInput) {
        searchInput.addEventListener("input", event => {
            searchQuery = event.target.value.trim();
            renderEvents();
        });
    }

    // Type Filter Select
    const typeSelect = $("type-filter");
    if (typeSelect) {
        typeSelect.addEventListener("change", event => {
            typeFilter = event.target.value;
            renderEvents();
        });
    }
}

/* ===================================
   DATA LOADING (SUPABASE)
=================================== */

async function loadVenues() {
    try {
        const { data, error } = await client
            .from("venues")
            .select("venue_id, venue_name, location, room_capacity");

        if (!error && data) {
            venueMap = new Map(data.map(v => [Number(v.venue_id), v]));
        }
    } catch (e) {
        console.warn("Venues loading error:", e);
    }
}

// Criterion: Coordinator can only view events created by themselves
async function loadAllEvents() {
    try {
        await loadVenues();

        const coordId = coordinatorRecord?.coordinator_id;
        const userId = currentUser?.id;

        let query = client
            .from("events")
            .select("event_id, title, description, event_type, event_date, start_time, end_time, capacity, coordinator_id, venue_id")
            .order("event_date", { ascending: false })
            .order("start_time", { ascending: false });

        if (coordId && userId && String(coordId) !== String(userId)) {
            query = query.or(`coordinator_id.eq.${coordId},coordinator_id.eq.${userId}`);
        } else {
            const filterId = coordId || userId;
            if (filterId) {
                query = query.eq("coordinator_id", filterId);
            }
        }

        const { data, error } = await query;

        if (error) throw error;

        allEvents = (data || []).filter(e => {
            if (!coordId && !userId) return false;
            return (
                (coordId && String(e.coordinator_id) === String(coordId)) ||
                (userId && String(e.coordinator_id) === String(userId))
            );
        });

        renderEvents();
    } catch (error) {
        console.error("Failed to load events:", error);
        allEvents = [];
        const grid = $("events-grid");
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    ${escapeHTML(t("errorLoading"))}
                </div>
            `;
        }
    }
}

/* ===================================
   INITIALIZATION (MIRRORS CREATE-EVENT)
=================================== */

async function initialize() {
    initializeNavigation();
    initializeControls();
    initializeDialog();

    const initialLang = document.documentElement.lang || "en";
    setLanguage(initialLang);

    if (!window.supabase?.createClient) {
        setMessage("unableToConnect", "error");
        return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await client.auth.getSession();
    if (error) {
        console.error("Session check error:", error);
        setMessage("unableToConnect", "error");
        return;
    }

    // Must be signed in
    if (!data.session?.user) {
        setMessage("pleaseSignIn", "error");
        return;
    }

    currentUser = data.session.user;

    // Must be an authorized coordinator in coordinator table
    const { data: coordinator, error: coordinatorError } = await client
        .from("coordinator")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    if (coordinatorError) {
        console.error("Coordinator check error:", coordinatorError);
        setMessage("unableToVerify", "error");
        return;
    }

    if (!coordinator) {
        setMessage("onlyCoordinators", "error");
        return;
    }

    // Authorized Coordinator Verified
    coordinatorRecord = coordinator;
    isCoordinator = true;
    setMessage(""); // Clear error message

    const badge = $("coordinator-badge");
    if (badge) badge.hidden = false;

    const signoutBtn = $("signout-btn");
    if (signoutBtn) signoutBtn.hidden = false;

    const createEventBtn = $("create-event-btn");
    if (createEventBtn) createEventBtn.hidden = false;

    const createVenueBtn = $("create-venue-btn");
    if (createVenueBtn) createVenueBtn.hidden = false;

    const content = $("coordinator-content");
    if (content) content.hidden = false;

    await loadAllEvents();
}

initialize();
