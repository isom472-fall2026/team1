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
let attendanceRecords = [];
let attendanceLoadState = "loading";
let activeTab = "bookings"; // "bookings" | "attendance"

const translations = {
    en: {
        home: "Home",
        events: "Events",
        myBookings: "My Bookings",
        myBookingsSubtitle: "View and manage your registered campus events and workshops.",
        attendanceHistory: "Attendance History",
        attendanceHistorySubtitle: "View your past event attendance records and check-in timestamps.",
        tabMyBookings: "My Bookings",
        noPastAttendance: "No past attendance records found.",
        attendanceUnavailable: "Attendance record unavailable.",
        loadingAttendance: "Loading attendance records...",
        checkInTimestamp: "Check-in Timestamp",
        attendanceStatus: "Attendance Status",
        statusPresent: "Present",
        statusAbsent: "Absent",
        recordsFound: "attendance records found",
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
        statusWaitlistedBadge: "Waitlisted (Position #{pos})",
        checkinUnavailableWaitlisted: "Check-in Unavailable (Waitlisted)",
        checkinUnavailableTooltip: "Attendance check-in is unavailable while waitlisted. You will be eligible once promoted to a confirmed seat.",
        statusCancelled: "Cancelled",
        workshop: "Workshop",
        seminar: "Seminar",
        play: "Play",
        event: "Event",
        toBeAnnounced: "To be announced",
        untitledEvent: "Untitled Event",
        noDescription: "No description available.",
        cancelReservation: "Cancel Reservation",
        cancelling: "Cancelling...",
        cancelSuccess: "Your reservation has been cancelled successfully.",
        cancelError: "Unable to cancel your reservation. Please try again.",
        bookingDoesNotExist: "booking does not exist",
        leaveWaitlist: "Leave Waitlist",
        leavingWaitlist: "Leaving...",
        leaveWaitlistConfirm: "Are you sure you want to leave the waitlist?",
        leaveWaitlistSuccess: "You have been removed from the waitlist.",
        "You have been removed from the waitlist.": "You have been removed from the waitlist.",
        bookingIdMissing: "Booking ID is missing.",
        "Booking ID is missing.": "Booking ID is missing.",
        notWaitlistedError: "Booking is not waitlisted.",
        "Booking is not waitlisted.": "Booking is not waitlisted."
    },
    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        myBookings: "حجوزاتي",
        myBookingsSubtitle: "عرض وإدارة الفعاليات وورش العمل المسجلة الخاصة بك.",
        attendanceHistory: "سجل الحضور",
        attendanceHistorySubtitle: "عرض سجلات حضور الفعاليات السابقة وأوقات تسجيل الحضور.",
        tabMyBookings: "حجوزاتي",
        noPastAttendance: "لم يتم العثور على سجلات حضور سابقة.",
        attendanceUnavailable: "سجل الحضور غير متوفر.",
        loadingAttendance: "جارٍ تحميل سجلات الحضور...",
        checkInTimestamp: "وقت تسجيل الحضور",
        attendanceStatus: "حالة الحضور",
        statusPresent: "حاضر",
        statusAbsent: "غائب",
        recordsFound: "سجل حضور",
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
        statusWaitlistedBadge: "قائمة الانتظار (المركز رقم #{pos})",
        checkinUnavailableWaitlisted: "تسجيل الحضور غير متاح (قائمة الانتظار)",
        checkinUnavailableTooltip: "تسجيل الحضور غير متاح أثناء التواجد في قائمة الانتظار. ستكون مؤهلاً بمجرد الترقية إلى مقعد مؤكد.",
        statusCancelled: "ملغي",
        workshop: "ورشة عمل",
        seminar: "ندوة",
        play: "مسرحية",
        event: "فعالية",
        toBeAnnounced: "سيتم الإعلان لاحقاً",
        untitledEvent: "فعالية بدون عنوان",
        noDescription: "لا يوجد وصف متاح.",
        cancelReservation: "إلغاء الحجز",
        cancelling: "جارٍ الإلغاء...",
        cancelSuccess: "تم إلغاء حجزك بنجاح.",
        cancelError: "تعذر إلغاء حجزك. يرجى المحاولة مرة أخرى.",
        bookingDoesNotExist: "الحجز غير موجود",
        leaveWaitlist: "مغادرة قائمة الانتظار",
        leavingWaitlist: "جارٍ المغادرة...",
        leaveWaitlistConfirm: "هل أنت متأكد من رغبتك في مغادرة قائمة الانتظار؟",
        leaveWaitlistSuccess: "تمت إزالتك من قائمة الانتظار.",
        "You have been removed from the waitlist.": "تمت إزالتك من قائمة الانتظار.",
        bookingIdMissing: "معرف الحجز مفقود.",
        "Booking ID is missing.": "معرف الحجز مفقود.",
        notWaitlistedError: "الحجز ليس في قائمة الانتظار.",
        "Booking is not waitlisted.": "الحجز ليس في قائمة الانتظار."
    }
};

function getLanguage() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
}

function t(key) {
    const lang = getLanguage();
    return translations[lang]?.[key] || translations.en[key] || key;
}

function displayError(msg) {
    const errorBox = $("bookings-error");
    const successBox = $("bookings-success");
    if (successBox) {
        successBox.textContent = "";
        successBox.hidden = true;
    }
    if (errorBox) {
        errorBox.textContent = t(msg);
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function displaySuccess(msg) {
    const errorBox = $("bookings-error");
    const successBox = $("bookings-success");
    if (errorBox) {
        errorBox.textContent = "";
        errorBox.hidden = true;
    }
    if (successBox) {
        successBox.textContent = t(msg);
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function clearMessages() {
    const errorBox = $("bookings-error");
    const successBox = $("bookings-success");
    if (errorBox) {
        errorBox.textContent = "";
        errorBox.hidden = true;
    }
    if (successBox) {
        successBox.textContent = "";
        successBox.hidden = true;
    }
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

async function getWaitlistQueuePosition(eventId, bookingId, bookingDate) {
    if (!eventId || !bookingId) return 1;

    // 1. Try RPC function get_waitlist_position
    try {
        const { data: pos, error: rpcErr } = await db.rpc("get_waitlist_position", {
            p_event_id: Number(eventId),
            p_booking_id: Number(bookingId)
        });
        if (!rpcErr && typeof pos === "number" && pos > 0) {
            return pos;
        }
    } catch { }

    // 2. Query bookings table for waitlisted entries for this event
    try {
        const { data, error } = await db
            .from("bookings")
            .select("booking_id, booking_date")
            .eq("event_id", Number(eventId))
            .eq("status", "Waitlisted")
            .order("booking_date", { ascending: true })
            .order("booking_id", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
            const idx = data.findIndex(item => String(item.booking_id) === String(bookingId));
            return idx >= 0 ? idx + 1 : 1;
        }
    } catch (e) {
        console.warn("Error calculating waitlist position:", e);
    }

    return 1;
}

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

    const timeToCheck = event.end_time || event.start_time;
    if (!timeToCheck) return false;

    const currentTime = [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0")
    ].join(":");

    return timeToCheck <= currentTime;
}

function formatCheckInTimestamp(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString(
        getLanguage() === "ar" ? "ar-KW" : "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}

function switchTab(tabName) {
    activeTab = tabName === "attendance" ? "attendance" : "bookings";

    const bookingsTab = $("tab-bookings");
    const attendanceTab = $("tab-attendance");
    const bookingsPanel = $("bookings-panel");
    const attendancePanel = $("attendance-panel");
    const headingTitle = $("page-heading-title");
    const headingSubtitle = $("page-heading-subtitle");
    const countBadge = $("bookings-count");

    if (activeTab === "attendance") {
        if (bookingsTab) {
            bookingsTab.classList.remove("active");
            bookingsTab.setAttribute("aria-selected", "false");
        }
        if (attendanceTab) {
            attendanceTab.classList.add("active");
            attendanceTab.setAttribute("aria-selected", "true");
        }
        if (bookingsPanel) bookingsPanel.hidden = true;
        if (attendancePanel) attendancePanel.hidden = false;

        if (headingTitle) headingTitle.textContent = t("attendanceHistory");
        if (headingSubtitle) headingSubtitle.textContent = t("attendanceHistorySubtitle");

        if (countBadge) {
            if (attendanceLoadState === "loaded" && attendanceRecords.length > 0) {
                countBadge.textContent = `${attendanceRecords.length} ${t("recordsFound")}`;
                countBadge.hidden = false;
            } else {
                countBadge.hidden = true;
            }
        }
        renderAttendance();
    } else {
        if (attendanceTab) {
            attendanceTab.classList.remove("active");
            attendanceTab.setAttribute("aria-selected", "false");
        }
        if (bookingsTab) {
            bookingsTab.classList.add("active");
            bookingsTab.setAttribute("aria-selected", "true");
        }
        if (attendancePanel) attendancePanel.hidden = true;
        if (bookingsPanel) bookingsPanel.hidden = false;

        if (headingTitle) headingTitle.textContent = t("myBookings");
        if (headingSubtitle) headingSubtitle.textContent = t("myBookingsSubtitle");

        if (countBadge) {
            if (loadState === "loaded" && userBookings.length > 0) {
                countBadge.textContent = `${userBookings.length} ${t("bookingsFound")}`;
                countBadge.hidden = false;
            } else {
                countBadge.hidden = true;
            }
        }
        renderBookings();
    }
}

function renderAttendance() {
    const grid = $("attendance-grid");
    const emptyState = $("attendance-empty");
    const authPrompt = $("auth-prompt");
    const countBadge = $("bookings-count");
    const tabCount = $("tab-attendance-count");

    if (tabCount) {
        tabCount.textContent = attendanceRecords.length;
        tabCount.hidden = attendanceRecords.length === 0;
    }

    if (emptyState) emptyState.hidden = true;

    if (attendanceLoadState === "unauthenticated") {
        if (grid) grid.innerHTML = "";
        if (authPrompt) authPrompt.hidden = false;
        return;
    }

    if (attendanceLoadState === "loading") {
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    ${escapeHTML(t("loadingAttendance"))}
                </div>
            `;
        }
        return;
    }

    if (attendanceLoadState === "error") {
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state record-unavailable-card">
                    ${escapeHTML(t("attendanceUnavailable"))}
                </div>
            `;
        }
        return;
    }

    if (attendanceRecords.length === 0) {
        if (grid) grid.innerHTML = "";
        if (emptyState) emptyState.hidden = false;
        return;
    }

    if (activeTab === "attendance" && countBadge) {
        countBadge.textContent = `${attendanceRecords.length} ${t("recordsFound")}`;
        countBadge.hidden = false;
    }

    if (grid) {
        grid.innerHTML = attendanceRecords.map((record) => {
            if (record.corrupted) {
                return `
                    <article class="events-page-card booking-card record-unavailable-card">
                        <p>${escapeHTML(t("attendanceUnavailable"))}</p>
                    </article>
                `;
            }

            const title = escapeHTML(record.title || t("untitledEvent"));
            const typeLabel = escapeHTML(translateEventType(record.event_type));
            const isPresent = record.status === "Present";
            const statusClass = isPresent ? "status-present" : "status-absent";
            const statusLabel = escapeHTML(isPresent ? t("statusPresent") : t("statusAbsent"));
            const dateDisplay = escapeHTML(formatDate(record.event_date));
            const checkInDisplay = record.check_in_time
                ? escapeHTML(formatCheckInTimestamp(record.check_in_time))
                : "—";

            return `
                <article class="events-page-card booking-card attendance-card" data-booking-id="${escapeHTML(record.booking_id)}">
                    <div class="booking-card-head">
                        <span class="event-type">${typeLabel}</span>
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                    </div>

                    <h3>${title}</h3>

                    <div class="event-info">
                        <div class="event-info-item">
                            <span class="event-info-icon" aria-hidden="true">📅</span>
                            <div class="event-info-text">
                                <span class="event-info-label">${escapeHTML(t("dateLabel"))}</span>
                                <span class="event-info-value">${dateDisplay}</span>
                            </div>
                        </div>

                        <div class="event-info-item">
                            <span class="event-info-icon" aria-hidden="true">⏱️</span>
                            <div class="event-info-text">
                                <span class="event-info-label">${escapeHTML(t("checkInTimestamp"))}</span>
                                <span class="event-info-value">${checkInDisplay}</span>
                            </div>
                        </div>

                        <div class="event-info-item">
                            <span class="event-info-icon" aria-hidden="true">📋</span>
                            <div class="event-info-text">
                                <span class="event-info-label">${escapeHTML(t("attendanceStatus"))}</span>
                                <span class="event-info-value">${statusLabel}</span>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }
}

function renderBookings() {
    const grid = $("bookings-grid");
    const emptyState = $("bookings-empty");
    const authPrompt = $("auth-prompt");
    const errorBox = $("bookings-error");
    const countBadge = $("bookings-count");
    const tabCount = $("tab-bookings-count");

    if (tabCount) {
        tabCount.textContent = userBookings.length;
        tabCount.hidden = userBookings.length === 0;
    }

    if (emptyState) emptyState.hidden = true;
    if (authPrompt) authPrompt.hidden = true;

    if (loadState === "unauthenticated") {
        if (grid) grid.innerHTML = "";
        if (authPrompt) authPrompt.hidden = false;
        if (activeTab === "bookings" && countBadge) countBadge.hidden = true;
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
        if (activeTab === "bookings" && countBadge) countBadge.hidden = true;
        return;
    }

    if (loadState === "error") {
        if (grid) grid.innerHTML = "";
        if (errorBox) {
            errorBox.textContent = t("loadError");
            errorBox.hidden = false;
        }
        if (activeTab === "bookings" && countBadge) countBadge.hidden = true;
        return;
    }

    if (userBookings.length === 0) {
        if (grid) grid.innerHTML = "";
        if (emptyState) emptyState.hidden = false;
        if (activeTab === "bookings" && countBadge) countBadge.hidden = true;
        return;
    }

    if (activeTab === "bookings" && countBadge) {
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
            const isConfirmed = statusRaw === "confirmed";
            const isWaitlisted = statusRaw === "waitlisted";
            const queuePos = booking.queuePosition || 1;

            // AC 5: In the attendee's "My Bookings" dashboard, waitlisted entries are badged as "Waitlisted"
            // with their live queue position, distinguishing them visually from "Confirmed" reservations
            // and preventing attendance check-in until promoted.
            let badgeText = statusLabel;
            if (isWaitlisted) {
                badgeText = t("statusWaitlistedBadge").replace("{pos}", queuePos);
            }

            const venueDisplay = escapeHTML(getVenueName(event));
            const dateDisplay = escapeHTML(formatDate(event.event_date));
            const timeDisplay = escapeHTML(formatTimeRange(event));

            let actionBtnHTML = "";
            if (isConfirmed) {
                actionBtnHTML = `
                    <div class="booking-actions">
                        <button type="button" class="btn btn-cancel-booking" id="cancel-booking-${escapeHTML(booking.booking_id)}" data-booking-id="${escapeHTML(booking.booking_id)}">
                            ${escapeHTML(t("cancelReservation"))}
                        </button>
                    </div>
                `;
            } else if (isWaitlisted) {
                actionBtnHTML = `
                    <div class="booking-actions">
                        <button type="button" class="btn btn-outline btn-checkin-disabled" disabled title="${escapeHTML(t("checkinUnavailableTooltip"))}">
                            ${escapeHTML(t("checkinUnavailableWaitlisted"))}
                        </button>
                        <button type="button" class="btn btn-cancel-booking btn-leave-waitlist" id="leave-waitlist-${escapeHTML(booking.booking_id)}" data-booking-id="${escapeHTML(booking.booking_id)}">
                            ${escapeHTML(t("leaveWaitlist"))}
                        </button>
                    </div>
                `;
            }

            return `
                <article class="events-page-card booking-card ${isWaitlisted ? 'waitlisted-card' : ''}" data-booking-id="${escapeHTML(booking.booking_id)}">
                    <div class="booking-card-head">
                        <span class="event-type">${typeLabel}</span>
                        <span class="status-badge status-${escapeHTML(statusRaw)}">${escapeHTML(badgeText)}</span>
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
                                <span class="event-info-value">${escapeHTML(isWaitlisted ? `${statusLabel} (Position #${queuePos})` : statusLabel)}</span>
                            </div>
                        </div>
                    </div>

                    ${actionBtnHTML}
                </article>
            `;
        }).join("");

        grid.querySelectorAll(".btn-cancel-booking:not(.btn-leave-waitlist)").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const bookingId = btn.dataset.bookingId;
                cancelBooking(bookingId);
            });
        });

        grid.querySelectorAll(".btn-leave-waitlist").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const bookingId = btn.dataset.bookingId;
                const confirmed = window.confirm(t("leaveWaitlistConfirm"));
                if (!confirmed) return;
                await leaveWaitlist(bookingId);
            });
        });
    }
}

async function cancelBooking(bookingId) {
    if (!bookingId) {
        displayError("booking does not exist");
        return;
    }

    if (!currentUser || !db) {
        displayError(t("signInPrompt"));
        return;
    }

    const btn = document.querySelector(`.btn-cancel-booking[data-booking-id="${bookingId}"]`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = t("cancelling");
    }

    try {
        // Query the booking to verify existence and check current status and event
        const { data: booking, error: fetchError } = await db
            .from("bookings")
            .select("booking_id, status, user_id, event_id")
            .eq("booking_id", bookingId)
            .maybeSingle();

        // If bookings.booking_id does not exist, cancellation is rejected with an error message "booking does not exist"
        if (fetchError || !booking) {
            displayError("booking does not exist");
            if (btn) {
                btn.disabled = false;
                btn.textContent = t("cancelReservation");
            }
            return;
        }

        // If bookings.status is already Cancelled, no further change occurs.
        if (String(booking.status).toLowerCase() === "cancelled") {
            if (btn) {
                btn.disabled = false;
                btn.textContent = t("cancelReservation");
            }
            return;
        }

        // Transition booking status to 'Cancelled'.
        // The DB trigger promote_waitlist_on_cancel_trigger handles waitlist promotion automatically.
        const { error: updateError } = await db
            .from("bookings")
            .update({ status: "Cancelled" })
            .eq("booking_id", bookingId)
            .eq("user_id", currentUser.id);

        if (updateError) {
            console.error("Cancellation error:", updateError);
            displayError(updateError.message || t("cancelError"));
            if (btn) {
                btn.disabled = false;
                btn.textContent = t("cancelReservation");
            }
            return;
        }

        displaySuccess(t("cancelSuccess"));
        await loadUserBookings(currentUser, true);
    } catch (err) {
        console.error("Unexpected error during cancellation:", err);
        displayError(err.message || t("cancelError"));
        if (btn) {
            btn.disabled = false;
            btn.textContent = t("cancelReservation");
        }
    }
}

window.cancelBooking = cancelBooking;

async function leaveWaitlist(payload) {
    let targetBookingId = payload;
    if (typeof targetBookingId === "object" && targetBookingId !== null) {
        targetBookingId = targetBookingId.booking_id;
    }

    if (
        targetBookingId === null ||
        targetBookingId === undefined ||
        targetBookingId === "" ||
        (typeof targetBookingId === "number" && isNaN(targetBookingId))
    ) {
        displayError("Booking ID is missing.");
        return;
    }

    const numId = Number(targetBookingId);
    if (isNaN(numId) || numId <= 0) {
        displayError("Booking ID is missing.");
        return;
    }

    if (!currentUser || !db) {
        displayError(t("signInPrompt"));
        return;
    }

    const btn = document.querySelector(`.btn-leave-waitlist[data-booking-id="${numId}"]`);
    if (btn) {
        btn.disabled = true;
        btn.textContent = t("leavingWaitlist");
    }

    try {
        const { data: booking, error: fetchError } = await db
            .from("bookings")
            .select("booking_id, status, user_id, event_id")
            .eq("booking_id", numId)
            .maybeSingle();

        if (fetchError || !booking) {
            displayError("booking does not exist");
            if (btn) {
                btn.disabled = false;
                btn.textContent = t("leaveWaitlist");
            }
            return;
        }

        if (String(booking.status).toLowerCase() !== "waitlisted") {
            displayError("Booking is not waitlisted.");
            if (btn) {
                btn.disabled = false;
                btn.textContent = t("leaveWaitlist");
            }
            return;
        }

        // Delete the booking row from public.bookings to remove from waitlist queue and allow re-booking
        const { error: deleteError } = await db
            .from("bookings")
            .delete()
            .eq("booking_id", numId)
            .eq("user_id", currentUser.id);

        if (deleteError) {
            console.warn("Delete booking failed, falling back to status update:", deleteError);
            const { error: updateError } = await db
                .from("bookings")
                .update({ status: "Cancelled" })
                .eq("booking_id", numId)
                .eq("user_id", currentUser.id);

            if (updateError) {
                console.error("Leave waitlist error:", updateError);
                displayError(updateError.message || t("cancelError"));
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = t("leaveWaitlist");
                }
                return;
            }
        }

        displaySuccess("You have been removed from the waitlist.");
        await loadUserBookings(currentUser, true);
    } catch (err) {
        console.error("Unexpected error during leave waitlist:", err);
        displayError(err.message || t("cancelError"));
        if (btn) {
            btn.disabled = false;
            btn.textContent = t("leaveWaitlist");
        }
    }
}

window.leaveWaitlist = leaveWaitlist;

async function loadUserBookings(user, preserveMessages = false) {
    if (!preserveMessages) {
        clearMessages();
    }

    if (!user?.id) {
        loadState = "unauthenticated";
        attendanceLoadState = "unauthenticated";
        renderBookings();
        renderAttendance();
        return;
    }

    currentUser = user;
    loadState = "loading";
    attendanceLoadState = "loading";
    renderBookings();
    renderAttendance();

    try {
        // Explicitly filter on user_id to ensure only the signed-in user's bookings are returned
        const { data, error } = await db
            .from("bookings")
            .select(`
                booking_id,
                booking_date,
                status,
                user_id,
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
                ),
                attendance_logs (
                    log_id,
                    booking_id,
                    attendance_status,
                    check_in_time,
                    check_out_time
                )
            `)
            .eq("user_id", user.id)
            .order("booking_date", { ascending: false });

        if (error) throw error;

        userBookings = (data || []).filter((b) => {
            if (String(b.status || "").toLowerCase() === "cancelled") {
                return false;
            }
            if (isPastEvent(b.events)) {
                return false;
            }
            return true;
        });

        // AC 5: Calculate live queue positions for waitlisted bookings
        await Promise.all(
            userBookings.map(async (b) => {
                if (String(b.status || "").toLowerCase() === "waitlisted") {
                    const eventId = b.events?.event_id;
                    b.queuePosition = await getWaitlistQueuePosition(eventId, b.booking_id, b.booking_date);
                }
            })
        );

        loadState = "loaded";
        renderBookings();

        // Process Attendance History records
        attendanceRecords = [];
        for (const b of (data || [])) {
            // Check for corrupted booking ID
            if (!b || b.booking_id == null || isNaN(Number(b.booking_id)) || Number(b.booking_id) <= 0) {
                attendanceRecords.push({ corrupted: true, errorMsg: "Attendance record unavailable." });
                continue;
            }

            const event = b.events;
            const attLog = Array.isArray(b.attendance_logs) ? b.attendance_logs[0] : b.attendance_logs;

            // Check if event data is missing or corrupted
            if (!event || typeof event !== "object") {
                if (attLog) {
                    attendanceRecords.push({ corrupted: true, booking_id: b.booking_id, errorMsg: "Attendance record unavailable." });
                }
                continue;
            }

            const past = isPastEvent(event);
            const hasLog = Boolean(attLog && attLog.attendance_status);

            // Completed / past event or attendance was logged
            if (past || hasLog) {
                // If attendance log status is invalid
                if (attLog && attLog.attendance_status && !["Present", "Absent"].includes(attLog.attendance_status)) {
                    attendanceRecords.push({ corrupted: true, booking_id: b.booking_id, errorMsg: "Attendance record unavailable." });
                    continue;
                }

                const isPresent = attLog?.attendance_status === "Present";
                const checkIn = isPresent && attLog?.check_in_time ? attLog.check_in_time : null;

                attendanceRecords.push({
                    booking_id: b.booking_id,
                    event_id: event.event_id,
                    title: event.title || "",
                    event_type: event.event_type || "",
                    event_date: event.event_date || "",
                    start_time: event.start_time || "",
                    end_time: event.end_time || "",
                    venues: event.venues,
                    status: isPresent ? "Present" : "Absent",
                    check_in_time: checkIn,
                    corrupted: false
                });
            }
        }

        attendanceLoadState = "loaded";
        renderAttendance();
    } catch (err) {
        console.error("Error loading user bookings or attendance:", err);
        userBookings = [];
        attendanceRecords = [];
        loadState = "error";
        attendanceLoadState = "error";
        renderBookings();
        renderAttendance();
    }
}

async function initialize() {
    const yearEl = $("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const bookingsTab = $("tab-bookings");
    const attendanceTab = $("tab-attendance");
    if (bookingsTab) {
        bookingsTab.addEventListener("click", () => switchTab("bookings"));
    }
    if (attendanceTab) {
        attendanceTab.addEventListener("click", () => switchTab("attendance"));
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.hash === "#attendance" || urlParams.get("tab") === "attendance") {
        switchTab("attendance");
    }

    if (!window.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("Supabase client or configuration missing.");
        loadState = "error";
        attendanceLoadState = "error";
        renderBookings();
        renderAttendance();
        return;
    }

    db = window.aukDb || (window.supabase && typeof window.supabase.createClient === "function"
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null);

    if (!db) {
        console.error("Supabase client or configuration missing.");
        loadState = "error";
        attendanceLoadState = "error";
        renderBookings();
        renderAttendance();
        return;
    }

    window.aukDb = db;

    try {
        const { data, error } = await db.auth.getSession();
        if (error || !data?.session?.user) {
            loadState = "unauthenticated";
            attendanceLoadState = "unauthenticated";
            renderBookings();
            renderAttendance();
        } else {
            await loadUserBookings(data.session.user);
        }
    } catch (err) {
        console.error("Session check error:", err);
        loadState = "unauthenticated";
        attendanceLoadState = "unauthenticated";
        renderBookings();
        renderAttendance();
    }

    db.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            await loadUserBookings(session.user);
        } else {
            currentUser = null;
            userBookings = [];
            attendanceRecords = [];
            loadState = "unauthenticated";
            attendanceLoadState = "unauthenticated";
            renderBookings();
            renderAttendance();
        }
    });

    // Realtime sync for automatic waitlist promotion and queue position updates
    if (db && typeof db.channel === "function") {
        try {
            db.channel("public-bookings-waitlist-sync")
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "bookings" },
                    () => {
                        if (currentUser) {
                            loadUserBookings(currentUser, true);
                        }
                    }
                )
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "attendance_logs" },
                    () => {
                        if (currentUser) {
                            loadUserBookings(currentUser, true);
                        }
                    }
                )
                .subscribe();
        } catch (realtimeErr) {
            console.warn("Realtime subscription unavailable:", realtimeErr);
        }
    }

    // Refresh bookings when attendee switches back to this browser tab
    window.addEventListener("focus", () => {
        if (currentUser) {
            loadUserBookings(currentUser, true);
        }
    });

    // Re-render when language or theme changes in the document
    const observer = new MutationObserver(() => {
        if (activeTab === "attendance") {
            renderAttendance();
        } else {
            renderBookings();
        }
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
