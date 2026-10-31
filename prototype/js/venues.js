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

/* Unicode-aware regex allowing letters in any language, numbers, spaces, and standard text punctuation */
const VALID_SEARCH_REGEX = /^[\p{L}\p{N}\s\-_.,'()\/]+$/u;

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
        pleaseSignIn: "Please sign in as a coordinator to access venues."
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
        pleaseSignIn: "يرجى تسجيل الدخول كمنسق للوصول إلى المواقع."
    }
};

function lang() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
}

function t(key) {
    return translations[lang()]?.[key] || key;
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

function renderVenues(venuesToRender, isSearchResult = false) {
    const grid = $("venues-grid");
    if (!grid) return;

    // AC 6: Empty state when no venues exist in the database
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
            </article>
        `;
    }).join("");
}

/* ===================================
   SEARCH LOGIC (AC 4)
=================================== */

function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    const searchInput = $("venue-search");
    const feedback = $("search-feedback");
    if (!searchInput) return;

    const rawValue = searchInput.value;
    const trimmed = rawValue.trim();

    // 1. Missing or whitespace-only values
    if (!trimmed) {
        if (feedback) {
            feedback.textContent = t("searchEmptyError");
            feedback.className = "search-feedback error visible";
        }
        return;
    }

    // 2. Invalid characters
    const hasInvalidChars = !VALID_SEARCH_REGEX.test(trimmed);
    if (hasInvalidChars) {
        if (feedback) {
            feedback.textContent = t("noMatchesFound");
            feedback.className = "search-feedback error visible";
        }
        renderVenues([], true);
        return;
    }

    // 3. Search query filtering by venue_name and location
    const queryLower = trimmed.toLowerCase();
    const matches = allVenues.filter(venue => {
        const name = String(venue.venue_name || "").toLowerCase();
        const loc = String(venue.location || "").toLowerCase();
        return name.includes(queryLower) || loc.includes(queryLower);
    });

    if (matches.length === 0) {
        if (feedback) {
            feedback.textContent = t("noMatchesFound");
            feedback.className = "search-feedback info visible";
        }
        renderVenues([], true);
    } else {
        if (feedback) {
            feedback.textContent = "";
            feedback.className = "search-feedback";
        }
        renderVenues(matches, true);
    }
}

function handleSearchClear() {
    const searchInput = $("venue-search");
    const feedback = $("search-feedback");
    if (searchInput) searchInput.value = "";
    if (feedback) {
        feedback.textContent = "";
        feedback.className = "search-feedback";
    }
    renderVenues(allVenues, false);
}

function initSearchControls() {
    const form = $("venue-search-form");
    if (form) {
        form.addEventListener("submit", handleSearchSubmit);
    }

    const clearBtn = $("search-clear-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", handleSearchClear);
    }

    const searchInput = $("venue-search");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const feedback = $("search-feedback");
            if (feedback && feedback.textContent === t("searchEmptyError") && searchInput.value.trim()) {
                feedback.textContent = "";
                feedback.className = "search-feedback";
            }
        });
    }
}

/* ===================================
   DATA LOADING (AC 1)
=================================== */

async function fetchVenues() {
    const grid = $("venues-grid");
    if (grid) {
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
        renderVenues(allVenues, false);
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
