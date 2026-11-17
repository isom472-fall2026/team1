"use strict";

(function () {
    const $ = id => document.getElementById(id);
    const SUPABASE_URL = window.SUPABASE_URL;
    const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

    let db = null;
    let activeEvents = [];
    let assignedOrganizersByEvent = new Map();
    let organizerNamesById = new Map();
    let selectedEvent = null;

    function setMessage(id, text, type) {
        const message = $(id);
        if (!message) return;
        message.textContent = text || "";
        message.className = `form-message ${type || ""}`.trim();
    }

    function getClient() {
        if (window.aukDb) return window.aukDb;
        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            return null;
        }
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.aukDb = db;
        return db;
    }

    function isActiveEvent(event) {
        const eventEnd = new Date(`${event.event_date}T${String(event.end_time).slice(0, 8)}`);
        return !Number.isNaN(eventEnd.getTime()) && eventEnd >= new Date();
    }

    function formatDate(date) {
        return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function formatTimeRange(event) {
        return `${String(event.start_time).slice(0, 5)} - ${String(event.end_time).slice(0, 5)}`;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function renderEvents() {
        const grid = $("assign-events-grid");
        if (!grid) return;

        if (!activeEvents.length) {
            grid.innerHTML = '<div class="empty-state">You have no active events to assign.</div>';
            return;
        }

        grid.innerHTML = activeEvents.map(event => {
            const assignedNames = assignedOrganizersByEvent.get(String(event.event_id)) || [];
            const organizerLabel = assignedNames.length
                ? assignedNames.join(", ")
                : "No organizer assigned";

            return `
            <article class="coordinator-card" data-event-id="${escapeHTML(event.event_id)}">
                <div class="card-top-row">
                    <span class="event-type">${escapeHTML(event.event_type || "Event")}</span>
                    <span class="status-badge status-upcoming">Upcoming</span>
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
                    <div class="card-meta-item ${assignedNames.length ? "" : "assigned-organizer-empty"}">
                        <span class="meta-icon" aria-hidden="true">👤</span>
                        <span>Door organizer: ${escapeHTML(organizerLabel)}</span>
                    </div>
                </div>

                <div class="card-footer">
                    <span class="capacity-indicator">${assignedNames.length ? "Organizer assigned" : "Needs organizer"}</span>
                    <div class="card-buttons">
                        <button type="button" class="btn btn-gold assign-event-btn"
                            data-event-id="${escapeHTML(event.event_id)}">
                            Assign organizer
                        </button>
                    </div>
                </div>
            </article>
        `;
        }).join("");

        grid.querySelectorAll(".assign-event-btn").forEach(button => {
            button.addEventListener("click", () => openAssignmentModal(button.dataset.eventId));
        });
    }

    function setOrganizerOptions(organizers) {
        const select = $("organizer-select");
        organizerNamesById = new Map(organizers.users.map(user => [user.user_id, user.name]));
        select.replaceChildren(new Option(
            organizers.ids.length ? "Select an organizer" : "No organizers available",
            ""
        ));
        organizers.ids.forEach(id => select.add(new Option(organizerNamesById.get(id) || id, id)));
    }

    async function loadFormData(client, userId) {
        const [eventsResult, organizersResult, usersResult, assignmentsResult] = await Promise.all([
            client
                .from("events")
                .select("event_id, title, event_type, event_date, start_time, end_time, coordinator_id")
                .eq("coordinator_id", userId)
                .order("event_date", { ascending: true })
                .order("start_time", { ascending: true }),
            client
                .from("organizer")
                .select("user_id")
                .order("user_id", { ascending: true }),
            client
                .from("users")
                .select("user_id, name"),
            client
                .from("organizer_assignments")
                .select("event_id, organizer_id")
        ]);

        if (eventsResult.error) throw eventsResult.error;
        if (organizersResult.error) throw organizersResult.error;
        if (usersResult.error) throw usersResult.error;
        if (assignmentsResult.error) throw assignmentsResult.error;

        activeEvents = (eventsResult.data || []).filter(isActiveEvent);
        setOrganizerOptions({
            ids: (organizersResult.data || []).map(organizer => organizer.user_id),
            users: usersResult.data || []
        });
        assignedOrganizersByEvent = new Map();
        (assignmentsResult.data || []).forEach(assignment => {
            const eventKey = String(assignment.event_id);
            const organizerName = organizerNamesById.get(assignment.organizer_id) || assignment.organizer_id;
            const names = assignedOrganizersByEvent.get(eventKey) || [];
            names.push(organizerName);
            assignedOrganizersByEvent.set(eventKey, names);
        });
        renderEvents();
        $("assign-events-section").hidden = false;
    }

    function mapAssignmentError(error) {
        const message = String(error?.message || "");
        if (
            message.includes("Organizer is already assigned to an event") ||
            error?.code === "23505" ||
            message.toLowerCase().includes("duplicate key")
        ) {
            return "Organizer is already assigned to an event.";
        }
        if (message.includes("Invalid event selected") || message.includes("organizer_assignments_event_id_fkey")) {
            return "Invalid event selected.";
        }
        if (message.includes("organizer_id") && message.includes("null")) {
            return "Please select an organizer to assign.";
        }
        return "Unable to assign organizer. Please try again.";
    }

    async function submitAssignment(event) {
        event.preventDefault();
        setMessage("assignment-message", "");

        const organizerId = $("organizer-select").value;
        if (!organizerId) {
            setMessage("assignment-message", "Please select an organizer to assign.", "error");
            return;
        }

        if (!selectedEvent) {
            setMessage("assignment-message", "Invalid event selected.", "error");
            return;
        }

        const submitButton = $("assign-organizer-submit");
        submitButton.disabled = true;
        try {
            const { error: insertError } = await db
                .from("organizer_assignments")
                .insert({ event_id: selectedEvent.event_id, organizer_id: organizerId });

            if (insertError) {
                setMessage("assignment-message", mapAssignmentError(insertError), "error");
                return;
            }

            setMessage("assignment-message", "Organizer successfully assigned to event.", "success");
            $("organizer-select").value = "";
            const eventKey = String(selectedEvent.event_id);
            const names = assignedOrganizersByEvent.get(eventKey) || [];
            names.push(organizerNamesById.get(organizerId) || organizerId);
            assignedOrganizersByEvent.set(eventKey, names);
            renderEvents();
        } catch (error) {
            console.error("Organizer assignment error:", error);
            setMessage("assignment-message", mapAssignmentError(error), "error");
        } finally {
            submitButton.disabled = false;
        }
    }

    function openAssignmentModal(eventId) {
        selectedEvent = activeEvents.find(item => String(item.event_id) === String(eventId));
        if (!selectedEvent) {
            setMessage("assignment-message", "Invalid event selected.", "error");
            return;
        }

        $("assign-modal-title").textContent = "Assign organizer";
        $("assign-modal-event").textContent = `${selectedEvent.title} — ${formatDate(selectedEvent.event_date)}`;
        $("organizer-select").value = "";
        setMessage("assignment-message", "");
        $("assign-modal").hidden = false;
        $("organizer-select").focus();
    }

    function closeAssignmentModal() {
        $("assign-modal").hidden = true;
        selectedEvent = null;
        setMessage("assignment-message", "");
    }

    async function initialize() {
        const client = getClient();
        if (!client) {
            setMessage("access-message", "Unable to connect to Supabase.", "error");
            return;
        }
        db = client;

        try {
            const { data: sessionData, error: sessionError } = await client.auth.getSession();
            if (sessionError) throw sessionError;
            const user = sessionData.session?.user;
            if (!user) {
                setMessage("access-message", "Please sign in as a coordinator.", "error");
                return;
            }

            const { data: coordinator, error: coordinatorError } = await client
                .from("coordinator")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();
            if (coordinatorError) throw coordinatorError;
            if (!coordinator) {
                setMessage("access-message", "Only coordinators can assign organizers.", "error");
                return;
            }

            await loadFormData(client, user.id);
            $("assign-organizer-form").addEventListener("submit", submitAssignment);
            $("assign-modal-close").addEventListener("click", closeAssignmentModal);
            $("assign-modal-cancel").addEventListener("click", closeAssignmentModal);
            $("assign-modal").addEventListener("click", event => {
                if (event.target === $("assign-modal")) closeAssignmentModal();
            });
            document.addEventListener("keydown", event => {
                if (event.key === "Escape" && !$("assign-modal").hidden) closeAssignmentModal();
            });
        } catch (error) {
            console.error("Organizer assignment page error:", error);
            setMessage("access-message", "Unable to load organizer assignments.", "error");
        }
    }

    initialize();
})();
