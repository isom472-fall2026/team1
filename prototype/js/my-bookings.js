"use strict";

/* =========================================================
   AUK EVENTS — MY BOOKINGS PAGE CONTROLLER
========================================================= */

const $ = (id) => document.getElementById(id);

const SUPABASE_URL =
    window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";

const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

let db = null;
let currentUser = null;
let userBookings = [];
let loadState = "loading";

const translations = {
    en: {
        home: "Home",
        events: "Events",
        myBookings: "My Bookings",
        myBookingsSubtitle: "View and manage your registered campus events and workshops.",
        bookingsFound: "bookings found",
        bookingStatus: "Status",
        bookingDate: "Booked On",
        dateLabel: "Date",
        timeLabel: "Time",
        venueLabel: "Venue",
        loadingBookings: "Loading your bookings...",
        noBookings: "No event bookings found.",
        browseEvents: "Browse Events",
        signInPrompt: "Please sign in to view your bookings.",
        signInBtn: "Sign In",
        loadError: "Unable to load your bookings. Please try again.",
        statusConfirmed: "Confirmed",
        statusWaitlisted: "Waitlisted",
        statusCancelled: "Cancelled",
        workshop: "Workshop",
        seminar: "Seminar",
        play: "Play",
        event: "Event",
        toBeAnnounced: "To be announced",
        untitledEvent: "Untitled Event",
        noDescription: "No description available."
    },
    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        myBookings: "حجوزاتي",
        myBookingsSubtitle: "عرض وإدارة الفعاليات وورش العمل المسجلة الخاصة بك.",
        bookingsFound: "حجز",
        bookingStatus: "الحالة",
        bookingDate: "تاريخ الحجز",
        dateLabel: "التاريخ",
        timeLabel: "الوقت",
        venueLabel: "الموقع",
        loadingBookings: "جارٍ تحميل حجوزاتك...",
        noBookings: "لا توجد حجوزات فعاليات.",
        browseEvents: "تصفح الفعاليات",
        signInPrompt: "يرجى تسجيل الدخول لعرض حجوزاتك.",
        signInBtn: "تسجيل الدخول",
        loadError: "تعذر تحميل حجوزاتك. يرجى المحاولة مرة أخرى.",
        statusConfirmed: "مؤكد",
        statusWaitlisted: "قائمة الانتظار",
        statusCancelled: "ملغي",
        workshop: "ورشة عمل",
        seminar: "ندوة",
        play: "مسرحية",
        event: "فعالية",
        toBeAnnounced: "سيتم الإعلان لاحقاً",
        untitledEvent: "فعالية بدون عنوان",
        noDescription: "لا يوجد وصف متاح."
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
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString(
        getLanguage() === "ar" ? "ar-KW" : "en-GB",
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
        getLanguage() === "ar" ? "ar-KW" : "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}

function formatTimeRange(event) {
    if (!event) return "—";
    const start = formatTime(event.start_time);
    if (!event.end_time) return start;
    return `${start} – ${formatTime(event.end_time)}`;
}

function translateEventType(type) {
    const value = String(type || "").toLowerCase();
    if (value === "workshop") return t("workshop");
    if (value === "seminar") return t("seminar");
    if (value === "play") return t("play");
    return type || t("event");
}

function translateStatus(status) {
    const value = String(status || "").toLowerCase();
    if (value === "confirmed") return t("statusConfirmed");
    if (value === "waitlisted") return t("statusWaitlisted");
    if (value === "cancelled") return t("statusCancelled");
    return status || "—";
}

function getVenueName(event) {
    if (!event) return t("toBeAnnounced");
    const venue = event.venues;
    if (Array.isArray(venue)) {
        const item = venue[0];
        if (!item?.venue_name) return t("toBeAnnounced");
        return item.location ? `${item.venue_name} — ${item.location}` : item.venue_name;
    }
    if (venue && typeof venue === "object") {
        if (!venue.venue_name) return t("toBeAnnounced");
        return venue.location ? `${venue.venue_name} — ${venue.location}` : venue.venue_name;
    }
    return t("toBeAnnounced");
}

function renderBookings() {
    const grid = $("bookings-grid");
    const emptyState = $("bookings-empty");
    const authPrompt = $("auth-prompt");
    const errorBox = $("bookings-error");
    const countBadge = $("bookings-count");

    if (emptyState) emptyState.hidden = true;
    if (authPrompt) authPrompt.hidden = true;
    if (errorBox) errorBox.hidden = true;

    if (loadState === "unauthenticated") {
        if (grid) grid.innerHTML = "";
        if (authPrompt) authPrompt.hidden = false;
        if (countBadge) countBadge.hidden = true;
        return;
    }

    if (loadState === "loading") {
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    ${escapeHTML(t("loadingBookings"))}
                </div>
            `;
        }
        if (countBadge) countBadge.hidden = true;
        return;
    }

    if (loadState === "error") {
        if (grid) grid.innerHTML = "";
        if (errorBox) {
            errorBox.textContent = t("loadError");
            errorBox.hidden = false;
        }
        if (countBadge) countBadge.hidden = true;
        return;
    }

    if (userBookings.length === 0) {
        if (grid) grid.innerHTML = "";
        if (emptyState) emptyState.hidden = false;
        if (countBadge) countBadge.hidden = true;
        return;
    }

    if (countBadge) {
        countBadge.textContent = `${userBookings.length} ${t("bookingsFound")}`;
        countBadge.hidden = false;
    }

    if (grid) {
        grid.innerHTML = userBookings.map((booking) => {
            const event = booking.events || {};
            const title = escapeHTML(event.title || t("untitledEvent"));
            const description = escapeHTML(event.description || t("noDescription"));
            const typeLabel = escapeHTML(translateEventType(event.event_type));
            const statusRaw = String(booking.status || "Confirmed").toLowerCase();
            const statusLabel = escapeHTML(translateStatus(booking.status));
            const venueDisplay = escapeHTML(getVenueName(event));
            const dateDisplay = escapeHTML(formatDate(event.event_date));
            const timeDisplay = escapeHTML(formatTimeRange(event));

            return `
                <article class="events-page-card booking-card">
                    <div class="booking-card-head">
                        <span class="event-type">${typeLabel}</span>
                        <span class="status-badge status-${escapeHTML(statusRaw)}">${statusLabel}</span>
                    </div>

                    <h3>${title}</h3>

                    <p class="event-description">
                        ${description}
                    </p>

                    <div class="event-info">
                        <div class="event-info-item">
                            <span class="event-info-icon" aria-hidden="true">📅</span>
                            <div class="event-info-text">
                                <span class="event-info-label">${escapeHTML(t("dateLabel"))}</span>
                                <span class="event-info-value">${dateDisplay}</span>
                            </div>
                        </div>

                        <div class="event-info-item">
                            <span class="event-info-icon" aria-hidden="true">🕒</span>
                            <div class="event-info-text">
                                <span class="event-info-label">${escapeHTML(t("timeLabel"))}</span>
                                <span class="event-info-value">${timeDisplay}</span>
                            </div>
                        </div>

                        <div class="event-info-item">
                            <span class="event-info-icon" aria-hidden="true">📍</span>
                            <div class="event-info-text">
                                <span class="event-info-label">${escapeHTML(t("venueLabel"))}</span>
                                <span class="event-info-value">${venueDisplay}</span>
                            </div>
                        </div>

                        <div class="event-info-item">
                            <span class="event-info-icon" aria-hidden="true">🎟️</span>
                            <div class="event-info-text">
                                <span class="event-info-label">${escapeHTML(t("bookingStatus"))}</span>
                                <span class="event-info-value">${statusLabel}</span>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }
}

async function loadUserBookings(user) {
    if (!user?.id) {
        loadState = "unauthenticated";
        renderBookings();
        return;
    }

    currentUser = user;
    loadState = "loading";
    renderBookings();

    try {
        // Explicitly filter on user_id to ensure only the signed-in user's bookings are returned
        const { data, error } = await db
            .from("bookings")
            .select(`
                booking_id,
                booking_date,
                status,
                events (
                    event_id,
                    title,
                    description,
                    event_type,
                    event_date,
                    start_time,
                    end_time,
                    capacity,
                    venues (
                        venue_name,
                        location
                    )
                )
            `)
            .eq("user_id", user.id)
            .order("booking_date", { ascending: false });

        if (error) throw error;

        userBookings = data || [];
        loadState = "loaded";
        renderBookings();
    } catch (err) {
        console.error("Error loading user bookings:", err);
        userBookings = [];
        loadState = "error";
        renderBookings();
    }
}

async function initialize() {
    const yearEl = $("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    if (!window.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("Supabase client or configuration missing.");
        loadState = "error";
        renderBookings();
        return;
    }

    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        const { data, error } = await db.auth.getSession();
        if (error || !data?.session?.user) {
            loadState = "unauthenticated";
            renderBookings();
        } else {
            await loadUserBookings(data.session.user);
        }
    } catch (err) {
        console.error("Session check error:", err);
        loadState = "unauthenticated";
        renderBookings();
    }

    db.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            await loadUserBookings(session.user);
        } else {
            currentUser = null;
            userBookings = [];
            loadState = "unauthenticated";
            renderBookings();
        }
    });

    // Re-render when language or theme changes in the document
    const observer = new MutationObserver(() => {
        renderBookings();
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang", "dir", "data-theme"]
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

