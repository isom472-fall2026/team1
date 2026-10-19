"use strict";

const SUPABASE_URL = window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "******";

const form = document.getElementById("create-event-form");
const message = document.getElementById("access-message");
const venueSelect = document.getElementById("event-venue");
const submitButton = document.getElementById("create-event-submit");
let client = null;
let currentUser = null;

function setMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type || ""}`.trim();
}

function setTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    localStorage.setItem("auk-theme", value);
}

function setLanguage() {
    const isArabic = document.documentElement.lang === "ar";
    document.documentElement.lang = isArabic ? "en" : "ar";
    document.documentElement.dir = isArabic ? "ltr" : "rtl";
    document.getElementById("language-toggle").textContent = isArabic ? "العربية" : "English";
    localStorage.setItem("auk-language", isArabic ? "en" : "ar");
}

function closeMenu() {
    document.getElementById("nav-links").classList.remove("open");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
    document.getElementById("menu-toggle").textContent = "☰";
}

function initializeNavigation() {
    const menuToggle = document.getElementById("menu-toggle");
    menuToggle.addEventListener("click", () => {
        const open = document.getElementById("nav-links").classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.textContent = open ? "✕" : "☰";
    });
    document.addEventListener("click", event => {
        if (!event.target.closest("nav")) closeMenu();
    });
    document.getElementById("theme-toggle").addEventListener("click", () => {
        setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
    document.getElementById("language-toggle").addEventListener("click", setLanguage);
    document.getElementById("signout-btn").addEventListener("click", async () => {
        if (client) await client.auth.signOut();
        window.location.assign("home.html");
    });
}

async function loadVenues() {
    const { data, error } = await client
        .from("venues")
        .select("venue_id,venue_name,location,room_capacity")
        .order("venue_name", { ascending: true });

    if (error) throw error;
    venueSelect.replaceChildren(new Option("Select a venue", ""));
    (data || []).forEach(venue => {
        const option = new Option(
            `${venue.venue_name} — ${venue.location} (max ${venue.room_capacity})`,
            String(venue.venue_id)
        );
        option.dataset.capacity = String(venue.room_capacity);
        venueSelect.append(option);
    });
}

async function hasConflict(eventDate, startTime, endTime, venueId) {
    const { data, error } = await client
        .from("events")
        .select("event_id")
        .eq("event_date", eventDate)
        .eq("venue_id", venueId)
        .lt("start_time", endTime)
        .gt("end_time", startTime)
        .limit(1);

    if (error) throw error;
    return Boolean(data?.length);
}

async function initialize() {
    initializeNavigation();
    document.getElementById("event-date").min = new Date().toISOString().slice(0, 10);

    if (!window.supabase?.createClient) {
        setMessage("Unable to connect to Supabase.", "error");
        return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await client.auth.getSession();
    if (error) {
        console.error("Session check error:", error);
        setMessage("Unable to connect to Supabase. Check the project URL and anon key.", "error");
        return;
    }
    if (!data.session?.user) {
        setMessage("Please sign in as a coordinator to create an event.", "error");
        return;
    }

    currentUser = data.session.user;
    const { data: coordinator, error: coordinatorError } = await client
        .from("coordinator")
        .select("user_id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    if (coordinatorError) {
        console.error("Coordinator check error:", coordinatorError);
        setMessage("Unable to verify coordinator access. Check the Supabase configuration.", "error");
        return;
    }
    if (!coordinator) {
        setMessage("Only coordinators can create events.", "error");
        return;
    }

    try {
        await loadVenues();
        form.hidden = false;
    } catch (error) {
        console.error("Venue loading error:", error);
        setMessage("Unable to load venues. Please try again later.", "error");
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(form);
    const title = formData.get("title").trim();
    const eventDate = formData.get("event_date");
    const startTime = formData.get("start_time");
    const endTime = formData.get("end_time");
    const venueId = formData.get("venue_id");
    const capacity = Number(formData.get("capacity"));
    const selectedVenue = venueSelect.selectedOptions[0];

    if (!title || !eventDate || !startTime || !endTime || !venueId || !formData.get("event_type")) {
        setMessage("Complete all required event details.", "error");
        return;
    }
    if (!Number.isInteger(capacity) || capacity <= 0) {
        setMessage("Capacity must be a whole number greater than zero.", "error");
        return;
    }
    if (startTime >= endTime) {
        setMessage("End time must be after start time.", "error");
        return;
    }
    if (capacity > Number(selectedVenue.dataset.capacity)) {
        setMessage("Capacity cannot exceed the selected venue's capacity.", "error");
        return;
    }

    submitButton.disabled = true;
    try {
        if (await hasConflict(eventDate, startTime, endTime, venueId)) {
            setMessage("This venue already has an overlapping event at that time.", "error");
            return;
        }

        const { error } = await client.from("events").insert({
            title,
            description: formData.get("description").trim() || null,
            event_type: formData.get("event_type"),
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime,
            capacity,
            coordinator_id: currentUser.id,
            venue_id: Number(venueId)
        });
        if (error) throw error;
        form.reset();
        setMessage("Event created successfully. Attendees can now view it.", "success");
    } catch (error) {
        console.error("Event creation error:", error);
        if (error.code === "23P01") {
            setMessage("This venue already has an overlapping event at that time.", "error");
        } else if (error.code === "42501") {
            setMessage("Only coordinators can create events. Please check your coordinator account.", "error");
        } else {
            setMessage("Event could not be created. Check the details and try again.", "error");
        }
    } finally {
        submitButton.disabled = false;
    }
});

initialize();
