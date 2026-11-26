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
    let currentEventId = null;
    let currentEvent = null;
    let rosterRecords = [];
    let activeFilter = "all";
    let selectedWaitlistBookingId = null;
    let toastTimeout = null;

    const translations = {
        en: {
            organizer: "Organizer",
            backToDashboard: "← Back to Organizer Dashboard",
            rosterEyebrow: "DOOR CHECK-IN ROSTER",
            rosterHeading: "Event Check-in Roster",
            rosterSubtitle: "Look up registered attendees and mark them present at the door.",
            statCheckedIn: "Checked In (Live Turnout)",
            statConfirmedTotal: "Confirmed Attendees",
            statWaitlistedTotal: "Waitlisted",
            filterAll: "All",
            filterConfirmed: "Confirmed",
            filterWaitlisted: "Waitlisted",
            searchPlaceholder: "Search by attendee name or university ID...",
            loadingRoster: "Loading attendee roster...",
            noAttendees: "No matching attendees.",
            noMatchingAttendees: "No matching attendees.",
            colName: "Full Name",
            colUniversityId: "University ID",
            colStatus: "Booking Status",
            colAction: "Check-in Action",
            markPresent: "Mark Present",
            markingPresent: "Checking in...",
            alreadyCheckedIn: "Already Checked In",
            nameUnavailable: "Name unavailable.",
            statusConfirmed: "Confirmed",
            statusWaitlisted: "Waitlisted",
            statusInvalid: "Invalid Status",
            unavailableAction: "Unavailable",
            viewQueuePosition: "Queue Position",
            queuePositionSummary: "Queue Position #{pos} of {total}",
            bookedAtLabel: "Booked",
            showingCountAll: "Total attendees: {count}",
            showingCountConfirmed: "Confirmed attendees: {count}",
            showingCountWaitlisted: "Waitlisted attendees: {count}",
            errNotAssigned: "You are not assigned to staff this event.",
            errAlreadyCheckedIn: "Attendee has already been checked in.",
            errWaitlisted: "Cannot check in: attendee status is Waitlisted.",
            errInvalidBooking: "Invalid booking reference.",
            errInvalidEvent: "Invalid event selected.",
            unableToConnect: "Unable to connect to Supabase.",
            checkInSuccess: "Attendee marked as Present."
        },
        ar: {
            organizer: "منظم",
            backToDashboard: "العودة إلى لوحة تحكم المنظم ←",
            rosterEyebrow: "قائمة تسجيل الحضور",
            rosterHeading: "قائمة حضور الفعالية",
            rosterSubtitle: "ابحث عن المسجلين وقم بتسجيل حضورهم عند البوابة.",
            statCheckedIn: "الحاضرون المسجلون (العدد الفعلي)",
            statConfirmedTotal: "الحجوزات المؤكدة",
            statWaitlistedTotal: "قائمة الانتظار",
            filterAll: "الكل",
            filterConfirmed: "مؤكد",
            filterWaitlisted: "قائمة الانتظار",
            searchPlaceholder: "البحث بالاسم أو الرقم الجامعي...",
            loadingRoster: "جارٍ تحميل قائمة الحضور...",
            noAttendees: "No matching attendees.",
            noMatchingAttendees: "No matching attendees.",
            colName: "الاسم الكامل",
            colUniversityId: "الرقم الجامعي",
            colStatus: "حالة الحجز",
            colAction: "تسجيل الحضور",
            markPresent: "تسجيل الحضور",
            markingPresent: "جارٍ التسجيل...",
            alreadyCheckedIn: "تم تسجيل الحضور",
            nameUnavailable: "Name unavailable.",
            statusConfirmed: "مؤكد",
            statusWaitlisted: "قائمة الانتظار",
            statusInvalid: "حالة غير صالحة",
            unavailableAction: "غير متاح",
            viewQueuePosition: "ترتيب الانتظار",
            queuePositionSummary: "الترتيب #{pos} من {total} في قائمة الانتظار",
            bookedAtLabel: "تاريخ الحجز",
            showingCountAll: "إجمالي المسجلين: {count}",
            showingCountConfirmed: "الحجوزات المؤكدة: {count}",
            showingCountWaitlisted: "قائمة الانتظار: {count}",
            errNotAssigned: "You are not assigned to staff this event.",
            errAlreadyCheckedIn: "Attendee has already been checked in.",
            errWaitlisted: "Cannot check in: attendee status is Waitlisted.",
            errInvalidBooking: "Invalid booking reference.",
            errInvalidEvent: "Invalid event selected.",
            unableToConnect: "تعذر الاتصال بقاعدة البيانات.",
            checkInSuccess: "تم تسجيل حضور المشارك بنجاح."
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

    function setAccessMessage(text, type) {
        const el = $("access-message");
        if (!el) return;
        el.textContent = text || "";
        el.className = `form-message ${type || ""}`.trim();
    }

    function setFeedback(text, type) {
        const el = $("checkin-feedback");
        if (!el) return;
        if (!text) {
            el.textContent = "";
            el.className = "form-message";
            el.hidden = true;
            return;
        }
        el.textContent = text;
        el.className = `form-message ${type || ""}`.trim();
        el.hidden = false;
    }

    function showToast(text, type) {
        const toast = $("toast");
        if (!toast) return;
        toast.textContent = text;
        toast.className = `toast ${type ? `toast-${type}` : ""}`.trim();
        toast.hidden = false;
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.hidden = true;
        }, 3500);
    }

    function normalizeBookingStatus(status) {
        const normalized = String(status || "").trim().toLowerCase();
        if (normalized === "confirmed") return "confirmed";
        if (normalized === "waitlisted") return "waitlisted";
        return "invalid";
    }

    function updateTurnoutStats() {
        const checkedInCount = rosterRecords.filter(
            r => r.attendanceLog && r.attendanceLog.attendance_status === "Present"
        ).length;
        const confirmedCount = rosterRecords.filter(
            r => normalizeBookingStatus(r.status) === "confirmed"
        ).length;
        const waitlistedCount = rosterRecords.filter(
            r => normalizeBookingStatus(r.status) === "waitlisted"
        ).length;

        if ($("stat-checked-in")) $("stat-checked-in").textContent = String(checkedInCount);
        if ($("stat-confirmed-total")) $("stat-confirmed-total").textContent = String(confirmedCount);
        if ($("stat-waitlisted-total")) $("stat-waitlisted-total").textContent = String(waitlistedCount);

        if ($("filter-count-all")) $("filter-count-all").textContent = String(rosterRecords.length);
        if ($("filter-count-confirmed")) $("filter-count-confirmed").textContent = String(confirmedCount);
        if ($("filter-count-waitlisted")) $("filter-count-waitlisted").textContent = String(waitlistedCount);

        document.querySelectorAll(".filter-tab[data-status-filter]").forEach(tab => {
            const isSelected = tab.dataset.statusFilter === activeFilter;
            tab.classList.toggle("active", isSelected);
            tab.setAttribute("aria-selected", isSelected ? "true" : "false");
        });

        const summaryEl = $("filter-count-summary");
        if (summaryEl) {
            const count = activeFilter === "confirmed"
                ? confirmedCount
                : (activeFilter === "waitlisted" ? waitlistedCount : rosterRecords.length);
            const templateKey = activeFilter === "confirmed"
                ? "showingCountConfirmed"
                : (activeFilter === "waitlisted" ? "showingCountWaitlisted" : "showingCountAll");
            summaryEl.textContent = t(templateKey).replace("{count}", String(count));
        }
    }

    function renderWaitlistPositionPanel() {
        const panel = $("waitlist-position-panel");
        if (!panel) return;

        if (!selectedWaitlistBookingId) {
            panel.hidden = true;
            return;
        }

        const record = rosterRecords.find(
            r => Number(r.booking_id) === Number(selectedWaitlistBookingId) &&
                normalizeBookingStatus(r.status) === "waitlisted"
        );
        if (!record) {
            selectedWaitlistBookingId = null;
            panel.hidden = true;
            return;
        }

        const totalWaitlisted = rosterRecords.filter(
            r => normalizeBookingStatus(r.status) === "waitlisted"
        ).length;

        const badgeEl = $("waitlist-position-badge");
        const titleEl = $("waitlist-position-title");
        const metaEl = $("waitlist-position-meta");

        if (badgeEl) badgeEl.textContent = `#${record.waitlistPosition}`;
        if (titleEl) {
            const posText = t("queuePositionSummary")
                .replace("{pos}", String(record.waitlistPosition))
                .replace("{total}", String(totalWaitlisted));
            titleEl.textContent = `${record.displayName} — ${posText}`;
        }
        if (metaEl) {
            const bookedText = record.bookingDate
                ? `${t("bookedAtLabel")}: ${new Date(record.bookingDate).toLocaleString()}`
                : "";
            metaEl.textContent = [record.universityId || "—", bookedText].filter(Boolean).join(" · ");
        }

        panel.hidden = false;
    }

    function renderRoster() {
        updateTurnoutStats();

        const container = $("roster-container");
        if (!container) return;

        const filteredRecords = rosterRecords.filter(record => {
            const norm = normalizeBookingStatus(record.status);
            if (activeFilter === "confirmed") return norm === "confirmed";
            if (activeFilter === "waitlisted") return norm === "waitlisted";
            return true;
        });

        renderWaitlistPositionPanel();

        if (!filteredRecords.length) {
            container.innerHTML = `<div class="empty-state">${escapeHTML(t("noMatchingAttendees"))}</div>`;
            return;
        }

        const rowsHTML = filteredRecords.map(record => {
            const normStatus = normalizeBookingStatus(record.status);
            const isConfirmed = normStatus === "confirmed";
            const isWaitlisted = normStatus === "waitlisted";
            const isInvalid = normStatus === "invalid";
            const hasLog = Boolean(record.attendanceLog);

            const statusLabel = isWaitlisted
                ? t("statusWaitlisted")
                : (isConfirmed
                    ? t("statusConfirmed")
                    : (record.status ? String(record.status) : t("statusInvalid")));
            const statusClass = isWaitlisted
                ? "status-waitlisted"
                : (isConfirmed ? "status-confirmed" : "status-invalid");

            let actionHTML = "";
            if (hasLog && isConfirmed) {
                actionHTML = `
                    <button type="button" class="checked-in-badge" disabled aria-disabled="true"
                        data-booking-id="${escapeHTML(record.booking_id)}">
                        ✓ ${escapeHTML(t("alreadyCheckedIn"))}
                    </button>
                `;
            } else if (isWaitlisted) {
                actionHTML = `
                    <div class="waitlisted-action-wrap">
                        <button type="button" class="btn-waitlisted-disabled" disabled aria-disabled="true"
                            title="${escapeHTML(t("errWaitlisted"))}">
                            ${escapeHTML(t("markPresent"))}
                        </button>
                        <button type="button" class="btn-select-waitlist"
                            data-booking-id="${escapeHTML(record.booking_id)}">
                            ${escapeHTML(t("viewQueuePosition"))}
                        </button>
                    </div>
                `;
            } else if (isInvalid) {
                actionHTML = `
                    <button type="button" class="btn-waitlisted-disabled" disabled aria-disabled="true">
                        ${escapeHTML(t("unavailableAction"))}
                    </button>
                `;
            } else {
                actionHTML = `
                    <button type="button" class="btn-mark-present"
                        id="mark-present-${escapeHTML(record.booking_id)}"
                        data-booking-id="${escapeHTML(record.booking_id)}">
                        ${escapeHTML(t("markPresent"))}
                    </button>
                `;
            }

            const isSelectedWaitlist = isWaitlisted &&
                Number(selectedWaitlistBookingId) === Number(record.booking_id);
            const rowClasses = [
                isWaitlisted ? "roster-row-waitlisted" : "",
                isSelectedWaitlist ? "roster-row-selected" : ""
            ].filter(Boolean).join(" ");

            return `
                <tr class="${rowClasses}"
                    data-booking-id="${escapeHTML(record.booking_id)}"
                    data-status="${escapeHTML(normStatus)}"
                    ${isWaitlisted ? `tabindex="0" aria-selected="${isSelectedWaitlist ? "true" : "false"}"` : ""}>
                    <td data-label="${escapeHTML(t("colName"))}">
                        <span class="attendee-name ${record.isNameMissing ? "name-missing" : ""}">
                            ${escapeHTML(record.displayName)}
                        </span>
                    </td>
                    <td data-label="${escapeHTML(t("colUniversityId"))}">
                        <span class="attendee-uid">${escapeHTML(record.universityId || "—")}</span>
                    </td>
                    <td data-label="${escapeHTML(t("colStatus"))}">
                        <span class="booking-status-badge ${statusClass}">
                            ${escapeHTML(statusLabel)}
                        </span>
                    </td>
                    <td data-label="${escapeHTML(t("colAction"))}">
                        ${actionHTML}
                    </td>
                </tr>
            `;
        }).join("");

        container.innerHTML = `
            <div class="roster-table-wrap">
                <table class="roster-table">
                    <thead>
                        <tr>
                            <th>${escapeHTML(t("colName"))}</th>
                            <th>${escapeHTML(t("colUniversityId"))}</th>
                            <th>${escapeHTML(t("colStatus"))}</th>
                            <th>${escapeHTML(t("colAction"))}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        `;
    }

    async function handleMarkPresent(bookingId) {
        setFeedback("", "");

        // AC 5: Validate booking_id
        if (bookingId === undefined || bookingId === null || String(bookingId).trim() === "") {
            setFeedback(t("errInvalidBooking"), "error");
            showToast(t("errInvalidBooking"), "error");
            return;
        }
        const parsedBookingId = Number(bookingId);
        if (Number.isNaN(parsedBookingId) || !Number.isInteger(parsedBookingId) || parsedBookingId <= 0) {
            setFeedback(t("errInvalidBooking"), "error");
            showToast(t("errInvalidBooking"), "error");
            return;
        }

        const record = rosterRecords.find(r => Number(r.booking_id) === parsedBookingId);
        if (!record) {
            setFeedback(t("errInvalidBooking"), "error");
            showToast(t("errInvalidBooking"), "error");
            return;
        }

        // Prevent checking in Waitlisted or invalid-status attendees
        const normStatus = normalizeBookingStatus(record.status);
        if (normStatus === "waitlisted") {
            setFeedback(t("errWaitlisted"), "error");
            showToast(t("errWaitlisted"), "error");
            return;
        }
        if (normStatus !== "confirmed") {
            setFeedback(t("errInvalidBooking"), "error");
            showToast(t("errInvalidBooking"), "error");
            return;
        }

        // AC 3: Prevent duplicate check-in
        if (record.attendanceLog) {
            setFeedback(t("errAlreadyCheckedIn"), "error");
            showToast(t("errAlreadyCheckedIn"), "error");
            return;
        }

        const btn = $(`mark-present-${parsedBookingId}`);
        if (btn) {
            btn.disabled = true;
            btn.textContent = t("markingPresent");
        }

        try {
            // AC 7: Verify public.is_assigned_organizer() before check-in
            const { data: isAssigned, error: rpcErr } = await client.rpc("is_assigned_organizer", {
                p_event_id: currentEventId
            });
            if (rpcErr || isAssigned !== true) {
                setFeedback(t("errNotAssigned"), "error");
                showToast(t("errNotAssigned"), "error");
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = t("markPresent");
                }
                return;
            }

            // AC 2: Insert attendance_logs record
            const { data, error } = await client
                .from("attendance_logs")
                .insert([
                    {
                        booking_id: parsedBookingId,
                        organizer_id: currentUser.id,
                        attendance_status: "Present",
                        check_in_time: new Date().toISOString()
                    }
                ])
                .select("log_id, booking_id, organizer_id, attendance_status, check_in_time")
                .single();

            if (error) throw error;

            record.attendanceLog = data;
            setFeedback(t("checkInSuccess"), "success");
            showToast(t("checkInSuccess"), "success");
            renderRoster();
        } catch (err) {
            console.error("Check-in error:", err);
            const code = err?.code;
            const msg = String(err?.message || "");

            if (code === "23505" || msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
                // Already checked in in DB — sync state
                const { data: existingLog } = await client
                    .from("attendance_logs")
                    .select("log_id, booking_id, organizer_id, attendance_status, check_in_time")
                    .eq("booking_id", parsedBookingId)
                    .maybeSingle();
                if (existingLog) record.attendanceLog = existingLog;
                setFeedback(t("errAlreadyCheckedIn"), "error");
                showToast(t("errAlreadyCheckedIn"), "error");
                renderRoster();
                return;
            }

            if (msg.includes("confirmed bookings")) {
                setFeedback(t("errWaitlisted"), "error");
                showToast(t("errWaitlisted"), "error");
            } else if (msg.includes("Booking does not exist")) {
                setFeedback(t("errInvalidBooking"), "error");
                showToast(t("errInvalidBooking"), "error");
            } else if (code === "42501" || msg.includes("not assigned")) {
                setFeedback(t("errNotAssigned"), "error");
                showToast(t("errNotAssigned"), "error");
            } else {
                setFeedback(msg || t("unableToConnect"), "error");
                showToast(msg || t("unableToConnect"), "error");
            }

            if (btn) {
                btn.disabled = false;
                btn.textContent = t("markPresent");
            }
        }
    }

    async function loadRoster() {
        const container = $("roster-container");
        if (container) {
            container.innerHTML = `<div class="empty-state">${escapeHTML(t("loadingRoster"))}</div>`;
        }

        try {
            // Load event info, event bookings + attendance_logs, and user profiles in parallel
            const [eventRes, bookingsRes, usersRes] = await Promise.all([
                client
                    .from("events")
                    .select("event_id, title, event_date, start_time, end_time, venues(venue_name, location)")
                    .eq("event_id", currentEventId)
                    .maybeSingle(),
                client
                    .from("bookings")
                    .select(`
                        booking_id,
                        user_id,
                        event_id,
                        booking_date,
                        status,
                        attendance_logs (
                            log_id,
                            booking_id,
                            organizer_id,
                            attendance_status,
                            check_in_time
                        )
                    `)
                    .eq("event_id", currentEventId)
                    .neq("status", "Cancelled")
                    .order("booking_date", { ascending: true }),
                client
                    .from("users")
                    .select("user_id, name, university_id")
            ]);

            if (eventRes.error || !eventRes.data) {
                setAccessMessage(t("errInvalidEvent"), "error");
                return;
            }

            currentEvent = eventRes.data;
            const titleEl = $("page-title");
            if (titleEl && currentEvent.title) {
                titleEl.textContent = `${currentEvent.title} — ${t("rosterHeading")}`;
            }

            const subtitleEl = $("event-meta-subtitle");
            if (subtitleEl) {
                const venueName = currentEvent.venues?.venue_name || "";
                const timeRange = [
                    String(currentEvent.start_time || "").slice(0, 5),
                    String(currentEvent.end_time || "").slice(0, 5)
                ].filter(Boolean).join(" – ");
                const parts = [currentEvent.event_date, timeRange, venueName].filter(Boolean);
                if (parts.length) subtitleEl.textContent = parts.join(" · ");
            }

            if (bookingsRes.error) throw bookingsRes.error;

            const usersMap = new Map();
            (usersRes.data || []).forEach(u => {
                usersMap.set(u.user_id, u);
            });

            rosterRecords = (bookingsRes.data || []).map(b => {
                const user = usersMap.get(b.user_id) || {};
                const rawName = user.name;
                const isNameMissing = rawName === null || rawName === undefined || String(rawName).trim() === "";
                const displayName = isNameMissing ? t("nameUnavailable") : String(rawName).trim();

                const rawLog = Array.isArray(b.attendance_logs)
                    ? b.attendance_logs[0] || null
                    : b.attendance_logs || null;

                return {
                    booking_id: b.booking_id,
                    user_id: b.user_id,
                    bookingDate: b.booking_date,
                    status: b.status,
                    displayName,
                    isNameMissing,
                    universityId: user.university_id || "",
                    attendanceLog: rawLog,
                    waitlistPosition: null
                };
            });

            // Assign exact chronological queue positions (1-based) to waitlisted bookings
            const waitlistedSorted = rosterRecords
                .filter(r => normalizeBookingStatus(r.status) === "waitlisted")
                .sort((a, b) => {
                    const timeA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
                    const timeB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
                    if (timeA !== timeB) return timeA - timeB;
                    return Number(a.booking_id) - Number(b.booking_id);
                });
            waitlistedSorted.forEach((rec, idx) => {
                rec.waitlistPosition = idx + 1;
            });

            renderRoster();
        } catch (err) {
            console.error("Failed to load attendee roster:", err);
            if (container) {
                container.innerHTML = `<div class="empty-state">${escapeHTML(t("unableToConnect"))}</div>`;
            }
        }
    }

    function selectWaitlistedAttendee(bookingId) {
        selectedWaitlistBookingId = Number(bookingId);
        renderRoster();
    }

    function initControls() {
        document.querySelectorAll(".filter-tab[data-status-filter]").forEach(tab => {
            tab.addEventListener("click", () => {
                activeFilter = tab.dataset.statusFilter || "all";
                if (activeFilter === "confirmed") {
                    selectedWaitlistBookingId = null;
                }
                renderRoster();
            });
        });

        const closeBtn = $("waitlist-position-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                selectedWaitlistBookingId = null;
                renderRoster();
            });
        }

        const container = $("roster-container");
        if (container) {
            container.addEventListener("click", e => {
                const markBtn = e.target.closest(".btn-mark-present");
                if (markBtn) {
                    handleMarkPresent(markBtn.dataset.bookingId);
                    return;
                }

                const waitlistBtn = e.target.closest(".btn-select-waitlist");
                if (waitlistBtn) {
                    selectWaitlistedAttendee(waitlistBtn.dataset.bookingId);
                    return;
                }

                const waitlistRow = e.target.closest("tr[data-status='waitlisted']");
                if (waitlistRow) {
                    selectWaitlistedAttendee(waitlistRow.dataset.bookingId);
                }
            });

            container.addEventListener("keydown", e => {
                if (e.key !== "Enter" && e.key !== " ") return;
                const waitlistRow = e.target.closest("tr[data-status='waitlisted']");
                if (!waitlistRow) return;
                e.preventDefault();
                selectWaitlistedAttendee(waitlistRow.dataset.bookingId);
            });
        }
    }

    function applyTranslations() {
        const lang = getLanguage();
        const dict = translations[lang] || translations.en;
        document.querySelectorAll("main [data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) el.textContent = dict[key];
        });
        if (rosterRecords.length || currentEvent) {
            renderRoster();
        }
    }

    async function initialize() {
        const yearEl = $("current-year");
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());

        initControls();
        applyTranslations();

        const observer = new MutationObserver(() => {
            applyTranslations();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["lang"]
        });

        const db = getClient();
        if (!db) {
            setAccessMessage(t("unableToConnect"), "error");
            return;
        }

        // Parse event_id from URL
        const params = new URLSearchParams(window.location.search);
        const rawEventId = params.get("event_id");
        const parsedEventId = Number(rawEventId);
        if (!rawEventId || Number.isNaN(parsedEventId) || !Number.isInteger(parsedEventId) || parsedEventId <= 0) {
            setAccessMessage(t("errInvalidEvent"), "error");
            return;
        }
        currentEventId = parsedEventId;

        const { data: sessionData, error: sessionError } = await db.auth.getSession();
        if (sessionError) {
            setAccessMessage(t("unableToConnect"), "error");
            return;
        }

        if (!sessionData?.session?.user) {
            setAccessMessage(t("errNotAssigned"), "error");
            return;
        }

        currentUser = sessionData.session.user;

        // AC 7: Verify public.is_assigned_organizer(p_event_id)
        const { data: isAssigned, error: rpcErr } = await db.rpc("is_assigned_organizer", {
            p_event_id: currentEventId
        });

        if (rpcErr || isAssigned !== true) {
            setAccessMessage(t("errNotAssigned"), "error");
            return;
        }

        setAccessMessage("");
        const badge = $("organizer-badge");
        if (badge) badge.hidden = false;

        const content = $("roster-content");
        if (content) content.hidden = false;

        await loadRoster();
    }

    initialize();
})();
