"use strict";

const SUPABASE_URL =
    window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";

const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

const $ = id => document.getElementById(id);

let client = null;
let currentUser = null;
let isCoordinator = false;
let allVenues = [];
let editingVenueId = null;
let toastTimeout = null;

/* ===================================
   TRANSLATIONS
=================================== */

const translations = {
    en: {
        home: "Home",
        events: "Events",
        myBookings: "My Bookings",
        profile: "My Profile",
        coordinator: "Coordinator",
        coordinatorEvents: "Coordinator Events",
        venues: "Venues",
        venuesHeading: "Campus Venues",
        venuesSubtitle: "View and search all registered campus venues and capacity limits.",
        coordinatorEyebrow: "COORDINATOR DASHBOARD",
        createEvent: "+ Create Event",
        createVenue: "+ Create Venue",
        signOut: "Sign Out",
        signIn: "Sign In",
        signUp: "Sign Up",
        account: "Account",
        search: "Search",
        clear: "Clear",
        searchPlaceholder: "Search by venue name or location...",
        searchEmptyError: "Search keyword cannot be empty.",
        noMatchesFound: "No matching venues found.",
        noVenuesAvailable: "No venues available.",
        loadingVenues: "Loading venues...",
        locationUnavailable: "Location unavailable.",
        invalidCapacity: "Invalid capacity specified.",
        maximumCapacity: "Maximum Capacity:",
        campusLocation: "Location:",
        seats: "seats",
        unableToConnect: "Unable to connect to Supabase.",
        pleaseSignIn: "Please sign in as a coordinator to access venues.",
        edit: "Edit",
        cancel: "Cancel",
        saveChanges: "Save Changes",
        editVenueHeading: "Edit Venue",
        venueNameLabel: "Venue Name",
        locationLabel: "Location",
        capacityLabel: "Room Capacity",
        venueUpdatedSuccess: "Venue details updated successfully.",
        "Venue details updated successfully.": "Venue details updated successfully.",
        "Venue name cannot be empty": "Venue name cannot be empty",
        "Venue location cannot be empty": "Venue location cannot be empty",
        "Room capacity must be a positive integer.": "Room capacity must be a positive integer.",
        "Capacity cannot be lower than existing scheduled event capacity.": "Capacity cannot be lower than existing scheduled event capacity."
    },
    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        myBookings: "حجوزاتي",
        profile: "ملفي الشخصي",
        coordinator: "المنسق",
        coordinatorEvents: "إدارة الفعاليات",
        venues: "المواقع",
        venuesHeading: "مواقع الحرم الجامعي",
        venuesSubtitle: "عرض والبحث في جميع مواقع الحرم الجامعي وسعتها الاستيعابية.",
        coordinatorEyebrow: "لوحة تحكم المنسق",
        createEvent: "+ إنشاء فعالية",
        createVenue: "+ إنشاء موقع",
        signOut: "تسجيل الخروج",
        signIn: "تسجيل الدخول",
        signUp: "إنشاء حساب",
        account: "الحساب",
        search: "بحث",
        clear: "مسح",
        searchPlaceholder: "البحث باسم الموقع أو الحرم الجامعي...",
        searchEmptyError: "لا يمكن أن تكون كلمة البحث فارغة.",
        noMatchesFound: "لم يتم العثور على مواقع مطابقة.",
        noVenuesAvailable: "لا توجد مواقع متاحة.",
        loadingVenues: "جاري تحميل المواقع...",
        locationUnavailable: "الموقع غير متوفر.",
        invalidCapacity: "تم تحديد سعة غير صالحة.",
        maximumCapacity: "الحد الأقصى للسعة:",
        campusLocation: "الموقع:",
        seats: "مقعد",
        unableToConnect: "تعذر الاتصال بقاعدة البيانات.",
        pleaseSignIn: "يرجى تسجيل الدخول كمنسق للوصول إلى المواقع.",
        edit: "تعديل",
        cancel: "إلغاء",
        saveChanges: "حفظ التغييرات",
        editVenueHeading: "تعديل تفاصيل الموقع",
        venueNameLabel: "اسم الموقع",
        locationLabel: "الموقع في الحرم",
        capacityLabel: "السعة الاستيعابية",
        venueUpdatedSuccess: "تم تحديث تفاصيل الموقع بنجاح.",
        "Venue details updated successfully.": "تم تحديث تفاصيل الموقع بنجاح.",
        "Venue name cannot be empty": "لا يمكن أن يكون اسم الموقع فارغاً",
        "Venue location cannot be empty": "لا يمكن أن يكون موقع الموقع فارغاً",
        "Room capacity must be a positive integer.": "يجب أن تكون السعة الاستيعابية عدداً صحيحاً موجباً.",
        "Capacity cannot be lower than existing scheduled event capacity.": "لا يمكن أن تكون السعة أقل من سعة الفعاليات المجدولة الحالية."
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
    message.textContent = translations[lang()]?.[keyOrText] || keyOrText;
    message.className = `form-message ${type || ""}`.trim();
}

function showToast(messageText) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = messageText;
    toast.className = "toast toast-success";
    toast.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.hidden = true;
    }, 4000);
}

function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
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

    const accessMsg = $("access-message");
    if (accessMsg && accessMsg.dataset.i18nKey) {
        accessMsg.textContent = translations[value]?.[accessMsg.dataset.i18nKey] || accessMsg.dataset.i18nKey;
    }

    const langToggle = $("language-toggle");
    if (langToggle) {
        langToggle.textContent = value === "ar" ? "English" : "العربية";
    }
}

/* ===================================
   VENUE FORMATTING HELPERS
=================================== */

function getLocationDisplay(location) {
    if (location === null || location === undefined) {
        return { text: "Location unavailable.", isUnavailable: true };
    }
    const trimmed = String(location).trim();
    if (!trimmed) {
        return { text: "Location unavailable.", isUnavailable: true };
    }
    return { text: trimmed, isUnavailable: false };
}

function getCapacityDisplay(capacity) {
    if (capacity === null || capacity === undefined || capacity === "") {
        return { text: "Invalid capacity specified.", isValid: false };
    }
    const num = Number(capacity);
    if (isNaN(num) || !Number.isFinite(num) || num <= 0 || !Number.isInteger(num)) {
        return { text: "Invalid capacity specified.", isValid: false };
    }
    return { text: `${num} ${t("seats")}`, rawNumber: num, isValid: true };
}

/* ===================================
   RENDERING
=================================== */

function getCurrentSearchQuery() {
    const input = $("venue-search");
    return input ? input.value.trim() : "";
}

function renderCurrentVenues() {
    const query = getCurrentSearchQuery();
    renderVenues(filterVenues(query), query !== "");
}

function renderVenues(venuesToRender, isSearchResult = false) {
    const grid = $("venues-grid");
    if (!grid) return;

    // Empty state when no venues exist in the database
    if (!isSearchResult && allVenues.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" id="no-venues-empty-state">
                <p class="empty-state-message">${escapeHTML(t("noVenuesAvailable"))}</p>
                <a href="create-venue.html" class="btn btn-primary create-venue-cta" id="create-venue-cta">
                    ${escapeHTML(t("createVenue"))}
                </a>
            </div>
        `;
        return;
    }

    // Empty state when search produces no matching venues
    if (isSearchResult && venuesToRender.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" id="no-matches-empty-state">
                <p class="empty-state-message">${escapeHTML(t("noMatchesFound"))}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = venuesToRender.map(venue => {
        // Render inline edit form if this venue is actively being edited
        if (Number(venue.venue_id) === editingVenueId) {
            return `
                <article class="venue-card editing" data-venue-id="${escapeHTML(venue.venue_id)}">
                    <div class="edit-card-header">
                        <span class="status-badge status-upcoming">${escapeHTML(t("editVenueHeading"))}</span>
                        <button type="button" class="icon-btn cancel-edit-x-btn" aria-label="${escapeHTML(t("cancel"))}" data-venue-id="${escapeHTML(venue.venue_id)}">✕</button>
                    </div>

                    <form class="inline-edit-form" data-venue-id="${escapeHTML(venue.venue_id)}" novalidate>
                        <div class="edit-form-field">
                            <label for="edit-name-${venue.venue_id}">${escapeHTML(t("venueNameLabel"))} *</label>
                            <input type="text" id="edit-name-${venue.venue_id}" name="venue_name" value="${escapeHTML(venue.venue_name || "")}" maxlength="150" required>
                        </div>

                        <div class="edit-form-field">
                            <label for="edit-location-${venue.venue_id}">${escapeHTML(t("locationLabel"))} *</label>
                            <input type="text" id="edit-location-${venue.venue_id}" name="location" value="${escapeHTML(venue.location || "")}" maxlength="150" required>
                        </div>

                        <div class="edit-form-field">
                            <label for="edit-capacity-${venue.venue_id}">${escapeHTML(t("capacityLabel"))} *</label>
                            <input type="number" id="edit-capacity-${venue.venue_id}" name="room_capacity" value="${escapeHTML(venue.room_capacity ?? "")}" min="1" step="1" required>
                        </div>

                        <p class="edit-error-msg" id="edit-error-${venue.venue_id}" role="alert" aria-live="polite" style="display:none;"></p>

                        <div class="edit-form-actions">
                            <button type="button" class="btn btn-outline cancel-edit-btn" data-venue-id="${escapeHTML(venue.venue_id)}">
                                ${escapeHTML(t("cancel"))}
                            </button>
                            <button type="submit" class="btn btn-gold save-edit-btn">
                                ${escapeHTML(t("saveChanges"))}
                            </button>
                        </div>
                    </form>
                </article>
            `;
        }

        const loc = getLocationDisplay(venue.location);
        const cap = getCapacityDisplay(venue.room_capacity);
        const name = venue.venue_name || "";

        return `
            <article class="venue-card" data-venue-id="${escapeHTML(venue.venue_id)}">
                <div class="venue-card-header">
                    <h3 class="venue-name">${escapeHTML(name)}</h3>
                </div>
                <div class="venue-card-body">
                    <div class="venue-detail venue-location-detail">
                        <span class="detail-icon" aria-hidden="true">📍</span>
                        <span class="detail-label">${escapeHTML(t("campusLocation"))}</span>
                        <span class="detail-value ${loc.isUnavailable ? 'location-unavailable' : ''}">${escapeHTML(loc.text)}</span>
                    </div>
                    <div class="venue-detail venue-capacity-detail">
                        <span class="detail-icon" aria-hidden="true">👥</span>
                        <span class="detail-label">${escapeHTML(t("maximumCapacity"))}</span>
                        <span class="detail-value ${cap.isValid ? 'capacity-valid' : 'capacity-invalid'}">${escapeHTML(cap.text)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div></div>
                    <div class="card-buttons">
                        <button type="button" class="btn btn-gold edit-venue-btn" data-venue-id="${escapeHTML(venue.venue_id)}">
                            ${escapeHTML(t("edit"))}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    grid.querySelectorAll(".edit-venue-btn").forEach(button => {
        button.addEventListener("click", event => {
            event.stopPropagation();
            const venueId = Number(button.dataset.venueId);
            startEditingVenue(venueId);
        });
    });

    grid.querySelectorAll(".cancel-edit-btn, .cancel-edit-x-btn").forEach(button => {
        button.addEventListener("click", event => {
            event.stopPropagation();
            cancelEditingVenue();
        });
    });

    grid.querySelectorAll(".inline-edit-form").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();
            const venueId = Number(form.dataset.venueId);
            saveVenue(venueId, form);
        });
    });
}

function startEditingVenue(venueId) {
    editingVenueId = Number(venueId);
    setMessage("");
    renderCurrentVenues();
    const card = document.querySelector(`.venue-card[data-venue-id="${venueId}"]`);
    if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        const nameInput = card.querySelector('input[name="venue_name"]');
        if (nameInput) nameInput.focus();
    }
}

function cancelEditingVenue() {
    editingVenueId = null;
    setMessage("");
    renderCurrentVenues();
}

async function saveVenue(venueId, formElement) {
    const errorEl = formElement.querySelector(".edit-error-msg");
    const submitBtn = formElement.querySelector(".save-edit-btn");

    function displayError(msg) {
        const text = translations[lang()]?.[msg] || msg;
        if (errorEl) {
            errorEl.textContent = text;
            errorEl.style.display = "block";
            errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        setMessage(msg, "error");
        if (submitBtn) submitBtn.disabled = false;
    }

    if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
    }
    setMessage("");

    const formData = new FormData(formElement);
    const venueName = (formData.get("venue_name") ?? "").trim();
    const location = (formData.get("location") ?? "").trim();
    const rawCapacity = formData.get("room_capacity");

    // Criterion: If venues.venue_name is emptied, saving is rejected with the error: "Venue name cannot be empty"
    if (!venueName) {
        displayError("Venue name cannot be empty");
        const nameInput = formElement.querySelector('input[name="venue_name"]');
        if (nameInput) nameInput.focus();
        return;
    }

    // Criterion: Same with venues location it gets the error message "Venue location cannot be empty"
    if (!location) {
        displayError("Venue location cannot be empty");
        const locInput = formElement.querySelector('input[name="location"]');
        if (locInput) locInput.focus();
        return;
    }

    // Criterion: If venues.room_capacity is set to zero or a negative value, updating is rejected with the error: "Room capacity must be a positive integer."
    const trimmedCap = String(rawCapacity ?? "").trim();
    const capacityNum = Number(trimmedCap);
    if (!trimmedCap || isNaN(capacityNum) || !Number.isInteger(capacityNum) || capacityNum <= 0) {
        displayError("Room capacity must be a positive integer.");
        const capInput = formElement.querySelector('input[name="room_capacity"]');
        if (capInput) capInput.focus();
        return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
        // Criterion: If venues.room_capacity is updated to a number lower than an already scheduled event's capacity in that venue,
        // the system rejects the update with the error: "Capacity cannot be lower than existing scheduled event capacity."
        const { data: scheduledEvents, error: eventsErr } = await client
            .from("events")
            .select("event_id, title, capacity")
            .eq("venue_id", venueId);

        if (eventsErr) {
            console.error("Error checking scheduled events:", eventsErr);
            displayError("Unable to verify existing scheduled events for this venue.");
            return;
        }

        if (scheduledEvents && scheduledEvents.length > 0) {
            const conflictingEvent = scheduledEvents.find(e => Number(e.capacity) > capacityNum);
            if (conflictingEvent) {
                displayError("Capacity cannot be lower than existing scheduled event capacity.");
                return;
            }
        }

        // Criterion: Saving updates persists changes directly to the public.venues table for the target venues.venue_id
        const { error: updateError } = await client
            .from("venues")
            .update({
                venue_name: venueName,
                location: location,
                room_capacity: capacityNum
            })
            .eq("venue_id", venueId);

        if (updateError) {
            console.error("Database update error:", updateError);
            displayError(updateError.message || "Failed to update venue.");
            return;
        }

        // Criterion: The system shows a success banner: "Venue details updated successfully."
        editingVenueId = null;
        setMessage("Venue details updated successfully.", "success");
        showToast(translations[lang()]?.["Venue details updated successfully."] || "Venue details updated successfully.");
        await fetchVenues();
    } catch (err) {
        console.error("Unexpected error updating venue:", err);
        displayError(err.message || "An unexpected error occurred.");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

/* ===================================
   SEARCH LOGIC (AC 4) — reactive on input
=================================== */

function filterVenues(query) {
    if (!query) return allVenues;
    const lower = query.toLowerCase();
    return allVenues.filter(v =>
        String(v.venue_name || "").toLowerCase().includes(lower) ||
        String(v.location || "").toLowerCase().includes(lower)
    );
}

function initSearchControls() {
    const input = $("venue-search");
    const clearBtn = $("venue-search-clear");

    if (!input) return;

    input.addEventListener("input", () => {
        const val = input.value;

        // Show/hide the × button
        if (clearBtn) clearBtn.hidden = !val;

        // Live filter and render
        renderCurrentVenues();
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.hidden = true;
            renderCurrentVenues();
            input.focus();
        });
    }
}

/* ===================================
   DATA LOADING (AC 1)
=================================== */

async function fetchVenues() {
    const grid = $("venues-grid");
    if (grid && allVenues.length === 0) {
        grid.innerHTML = `
            <div class="empty-state loading-state" id="venues-loading">
                ${escapeHTML(t("loadingVenues"))}
            </div>
        `;
    }

    try {
        const { data, error } = await client
            .from("venues")
            .select("venue_id, venue_name, location, room_capacity")
            .order("venue_name", { ascending: true });

        if (error) throw error;
        allVenues = data || [];
        renderCurrentVenues();
    } catch (err) {
        console.error("Failed to load venues:", err);
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state error-state">
                    ${escapeHTML(t("unableToConnect"))}
                </div>
            `;
        }
    }
}

/* ===================================
   COORDINATOR AUTHORIZATION (AC 3)
=================================== */

async function initialize() {
    initSearchControls();

    const initialLang = document.documentElement.lang || "en";
    setLanguage(initialLang);

    if (!window.supabase?.createClient) {
        window.location.assign("signin.html");
        return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Check session
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError || !session?.user) {
        window.location.assign("signin.html");
        return;
    }

    currentUser = session.user;

    // Verify coordinator privilege: public.is_coordinator() = true
    try {
        const { data: rpcRes, error: rpcErr } = await client.rpc("is_coordinator");
        if (!rpcErr && rpcRes === true) {
            isCoordinator = true;
        }
    } catch (err) {
        console.warn("RPC is_coordinator check error:", err);
    }

    if (!isCoordinator) {
        try {
            const { data: coordData, error: coordErr } = await client
                .from("coordinator")
                .select("user_id")
                .eq("user_id", currentUser.id)
                .maybeSingle();

            if (!coordErr && coordData?.user_id) {
                isCoordinator = true;
            }
        } catch (err) {
            console.warn("Coordinator table check error:", err);
        }
    }

    // Unauthenticated or unauthorized users are blocked and redirected to signin.html
    if (!isCoordinator) {
        window.location.assign("signin.html");
        return;
    }

    // Access verified: reveal coordinator content
    const content = $("coordinator-content");
    if (content) content.hidden = false;

    const badge = $("coordinator-badge");
    if (badge) badge.hidden = false;

    await fetchVenues();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

