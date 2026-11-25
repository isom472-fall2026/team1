"use strict";

(function () {
    const SUPABASE_URL =
        window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";

    const SUPABASE_ANON_KEY =
        window.SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

    const $ = id => document.getElementById(id);

    let client = null;
    let currentUser = null;
    let isOrganizer = false;
    let assignedEvents = [];
    let hasOrphanAssignment = false;

    const translations = {
        en: {
            organizer: "Organizer",
            organizerEyebrow: "ORGANIZER DASHBOARD",
            assignedEventsHeading: "My Assigned Events",
            assignedEventsSubtitle:
                "View your upcoming work schedule and access check-in rosters for your assigned events.",
            statTotalAssigned: "Total Assigned Events",
            statUpcomingAssigned: "Upcoming Events",
            loadingEvents: "Loading assigned events...",
            noAssignedEvents: "You are not assigned to any upcoming events.",
            accessRestricted: "Access restricted to authorized event organizers.",
            orphanEventNotFound: "Assigned event record not found.",
            unableToConnect: "Unable to connect to Supabase.",
            errorLoading: "Unable to load assigned events. Please try again later.",
            upcoming: "Upcoming",
            past: "Past",
            venueUnavailable: "Venue unavailable",
            locationUnavailable: "Location unavailable",
            checkInRoster: "Check-in Roster",
            event: "Event"
        },
        ar: {
            organizer: "منظم",
            organizerEyebrow: "لوحة تحكم المنظم",
            assignedEventsHeading: "الفعاليات المعينة لي",
            assignedEventsSubtitle:
                "اطلع على جدول عملك القادم وقم بالوصول إلى قوائم تسجيل الحضور للفعاليات المعينة لك.",
            statTotalAssigned: "إجمالي الفعاليات المعينة",
            statUpcomingAssigned: "الفعاليات القادمة",
            loadingEvents: "جارٍ تحميل الفعاليات المعينة...",
            noAssignedEvents: "You are not assigned to any upcoming events.",
            accessRestricted: "Access restricted to authorized event organizers.",
            orphanEventNotFound: "Assigned event record not found.",
            unableToConnect: "تعذر الاتصال بقاعدة البيانات.",
            errorLoading: "تعذر تحميل الفعاليات المعينة. يرجى المحاولة لاحقاً.",
            upcoming: "قادمة",
            past: "سابقة",
            venueUnavailable: "القاعة غير متوفرة",
            locationUnavailable: "الموقع غير متوفر",
            checkInRoster: "قائمة الحضور",
            event: "فعالية"
        }
    };

    function getLanguage() {
        return document.documentElement.lang === "ar" ? "ar" : "en";
    }

    function t(key) {
        const lang = getLanguage();
        return translations[lang]?.[key] || translations.en[key] || key;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[ch]);
    }

    function setAccessMessage(text, type) {
        const el = $("access-message");
        if (!el) return;
        el.textContent = text || "";
        el.className = `form-message ${type || ""}`.trim();
    }

    function setOrphanNotice(visible) {
        const el = $("orphan-message");
        if (!el) return;
        if (visible) {
            el.textContent = t("orphanEventNotFound");
            el.hidden = false;
        } else {
            el.textContent = "";
            el.hidden = true;
        }
    }

    function getClient() {
        if (client) return client;
        if (window.aukDb) {
            client = window.aukDb;
            return client;
        }
        if (window.supabase && typeof window.supabase.createClient === "function") {
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.aukDb = client;
            return client;
        }
        return null;
    }

    function isUpcomingEvent(event) {
        const endStr = String(event.end_time || "23:59:59").slice(0, 8);
        const eventEnd = new Date(`${event.event_date}T${endStr}`);
        if (Number.isNaN(eventEnd.getTime())) return false;
        return eventEnd >= new Date();
    }

    function sortChronologicalSoonestFirst(events) {
        return [...events].sort((a, b) => {
            const aUpcoming = isUpcomingEvent(a);
            const bUpcoming = isUpcomingEvent(b);
            if (aUpcoming !== bUpcoming) {
                return aUpcoming ? -1 : 1;
            }
            const dateCmp = String(a.event_date || "").localeCompare(String(b.event_date || ""));
            if (dateCmp !== 0) return dateCmp;
            return String(a.start_time || "").localeCompare(String(b.start_time || ""));
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return "—";
        const d = new Date(`${dateStr}T00:00:00`);
        if (Number.isNaN(d.getTime())) return dateStr;
        const locale = getLanguage() === "ar" ? "ar-KW" : undefined;
        return d.toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function formatTimeRange(event) {
        const start = String(event.start_time || "").slice(0, 5);
        const end = String(event.end_time || "").slice(0, 5);
        if (!start && !end) return "—";
        return `${start || "—"} – ${end || "—"}`;
    }

    function updateStats() {
        const totalEl = $("stat-total-assigned");
        const upcomingEl = $("stat-upcoming-assigned");
        const upcomingCount = assignedEvents.filter(isUpcomingEvent).length;
        if (totalEl) totalEl.textContent = String(assignedEvents.length);
        if (upcomingEl) upcomingEl.textContent = String(upcomingCount);
    }

    function renderAssignedEvents() {
        const grid = $("assigned-events-grid");
        if (!grid) return;

        setOrphanNotice(hasOrphanAssignment);
        updateStats();

        if (!assignedEvents.length) {
            grid.innerHTML = `<div class="empty-state">${escapeHTML(t("noAssignedEvents"))}</div>`;
            return;
        }

        grid.innerHTML = assignedEvents.map(event => {
            const upcoming = isUpcomingEvent(event);
            const venueName = event.venues?.venue_name || t("venueUnavailable");
            const venueLocation = event.venues?.location || t("locationUnavailable");
            const venueDisplay = `${venueName} — ${venueLocation}`;

            return `
                <article class="coordinator-card" data-event-id="${escapeHTML(event.event_id)}">
                    <div class="card-top-row">
                        <span class="event-type">${escapeHTML(event.event_type || t("event"))}</span>
                        <span class="status-badge ${upcoming ? "status-upcoming" : "status-past"}">
                            ${escapeHTML(upcoming ? t("upcoming") : t("past"))}
                        </span>
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
                        <div class="card-meta-item">
                            <span class="meta-icon" aria-hidden="true">📍</span>
                            <span>${escapeHTML(venueDisplay)}</span>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="card-buttons">
                            <a href="organizer-attendance.html?event_id=${encodeURIComponent(event.event_id)}"
                               class="btn btn-gold">
                                ${escapeHTML(t("checkInRoster"))}
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    async function loadAssignedEvents() {
        const grid = $("assigned-events-grid");
        if (grid) {
            grid.innerHTML = `<div class="empty-state">${escapeHTML(t("loadingEvents"))}</div>`;
        }

        const { data, error } = await client
            .from("organizer_assignments")
            .select(`
                event_id,
                events (
                    event_id,
                    title,
                    event_type,
                    event_date,
                    start_time,
                    end_time,
                    venues (
                        venue_name,
                        location
                    )
                )
            `)
            .eq("organizer_id", currentUser.id);

        if (error) {
            console.error("Error loading organizer assignments:", error);
            if (grid) {
                grid.innerHTML = `<div class="empty-state">${escapeHTML(t("errorLoading"))}</div>`;
            }
            return;
        }

        const rows = Array.isArray(data) ? data : [];
        const validEvents = [];
        let orphanFound = false;

        for (const row of rows) {
            if (!row || !row.events || !row.events.event_id) {
                orphanFound = true;
                continue;
            }
            validEvents.push(row.events);
        }

        hasOrphanAssignment = orphanFound;
        assignedEvents = sortChronologicalSoonestFirst(validEvents);
        renderAssignedEvents();
    }

    function applyTranslations() {
        const lang = getLanguage();
        const dict = translations[lang] || translations.en;
        document.querySelectorAll("main [data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) el.textContent = dict[key];
        });
        if (isOrganizer) {
            renderAssignedEvents();
        }
    }

    async function initialize() {
        const yearEl = $("current-year");
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());

        const observer = new MutationObserver(() => {
            applyTranslations();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["lang"]
        });

        applyTranslations();

        const db = getClient();
        if (!db) {
            setAccessMessage(t("unableToConnect"), "error");
            return;
        }

        const { data: sessionData, error: sessionError } = await db.auth.getSession();
        if (sessionError) {
            console.error("Session check error:", sessionError);
            setAccessMessage(t("unableToConnect"), "error");
            return;
        }

        if (!sessionData?.session?.user) {
            setAccessMessage(t("accessRestricted"), "error");
            return;
        }

        currentUser = sessionData.session.user;

        const { data: organizer, error: organizerError } = await db
            .from("organizer")
            .select("user_id")
            .eq("user_id", currentUser.id)
            .maybeSingle();

        if (organizerError || !organizer?.user_id) {
            setAccessMessage(t("accessRestricted"), "error");
            return;
        }

        try {
            sessionStorage.setItem("auk_role_" + currentUser.id, "Organizer");
        } catch { }

        isOrganizer = true;
        setAccessMessage("");

        const badge = $("organizer-badge");
        if (badge) badge.hidden = false;

        const content = $("organizer-content");
        if (content) content.hidden = false;

        await loadAssignedEvents();
    }

    initialize();
})();
