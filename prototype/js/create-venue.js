"use strict";

const SUPABASE_URL = window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";
const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

const form = document.getElementById("create-venue-form");
const message = document.getElementById("access-message");
const submitButton = document.getElementById("create-venue-submit");
let client = null;
let currentUser = null;

const translations = {
    en: {
        home: "Home",
        events: "Events",
        profile: "Profile",
        coordinatorEvents: "Coordinator Events",
        createEvent: "+ Create Event",
        createVenue: "+ Create Venue",
        signOut: "Sign Out",
        eyebrow: "AUK EVENTS",
        createVenueHeading: "Create a campus venue",
        createVenueSubtitle: "Register a new campus venue with its location and physical room capacity.",
        coordinator: "Coordinator",
        venueName: "Venue name",
        venueLocation: "Campus location",
        roomCapacity: "Room capacity",
        cancel: "Cancel",
        submitCreateVenue: "Create Venue",
        pleaseSignIn: "Please sign in as a coordinator to create a venue.",
        onlyCoordinators: "Only coordinators can create venues.",
        unableToConnect: "Unable to connect to Supabase.",
        unableToVerify: "Unable to verify coordinator access. Check the Supabase configuration.",
        venueNameRequired: "Venue name is required.",
        locationRequired: "Venue location is required.",
        capacityRequired: "Room capacity is required.",
        capacityMustBePositive: "Room capacity must be greater than zero.",
        venueAddedSuccess: "Venue added successfully.",
        venueCreateError: "Venue could not be created. Check the details and try again."
    },
    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        profile: "الملف الشخصي",
        coordinatorEvents: "فعاليات المنسق",
        createEvent: "+ إنشاء فعالية",
        createVenue: "+ إنشاء قاعة",
        signOut: "تسجيل الخروج",
        eyebrow: "فعاليات الجامعة",
        createVenueHeading: "إنشاء قاعة جامعية",
        createVenueSubtitle: "تسجيل قاعة جامعية جديدة مع موقعها وسعتها الاستيعابية الفعلية.",
        coordinator: "منسق",
        venueName: "اسم القاعة",
        venueLocation: "موقع القاعة في الحرم",
        roomCapacity: "السعة الاستيعابية",
        cancel: "إلغاء",
        submitCreateVenue: "إنشاء القاعة",
        pleaseSignIn: "يرجى تسجيل الدخول كمنسق لإنشاء قاعة.",
        onlyCoordinators: "يمكن للمنسقين فقط إنشاء القاعات.",
        unableToConnect: "تعذر الاتصال بقاعدة البيانات.",
        unableToVerify: "تعذر التحقق من صلاحيات المنسق. يرجى التحقق من الإعدادات.",
        venueNameRequired: "اسم القاعة مطلوب.",
        locationRequired: "موقع القاعة مطلوب.",
        capacityRequired: "السعة الاستيعابية مطلوبة.",
        capacityMustBePositive: "يجب أن تكون السعة الاستيعابية أكبر من الصفر.",
        venueAddedSuccess: "تمت إضافة القاعة بنجاح.",
        venueCreateError: "تعذر إنشاء القاعة. يرجى التحقق من التفاصيل والمحاولة مرة أخرى."
    }
};

function lang() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
}

function t(key) {
    return translations[lang()]?.[key] || key;
}

function setMessage(keyOrText, type) {
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

function setTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    localStorage.setItem("auk-theme", value);
    const themeToggle = document.getElementById("theme-toggle");
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

    const langToggle = document.getElementById("language-toggle");
    if (langToggle) {
        langToggle.textContent = value === "ar" ? "English" : "العربية";
    }

    if (message.dataset.i18nKey) {
        message.textContent = t(message.dataset.i18nKey);
    }
}

function closeMenu() {
    const navLinks = document.getElementById("nav-links");
    const menuToggle = document.getElementById("menu-toggle");
    if (navLinks) navLinks.classList.remove("open");
    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    }
}

function initializeNavigation() {
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const open = document.getElementById("nav-links").classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(open));
            menuToggle.textContent = open ? "✕" : "☰";
        });
    }
    document.addEventListener("click", event => {
        if (!event.target.closest("nav")) closeMenu();
    });

    const currentTheme = document.documentElement.dataset.theme || "light";
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";
        themeToggle.addEventListener("click", () => {
            setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
        });
    }

    const initialLang = document.documentElement.lang || "en";
    setLanguage(initialLang);

    const langToggle = document.getElementById("language-toggle");
    if (langToggle) {
        langToggle.addEventListener("click", () => {
            setLanguage(document.documentElement.lang === "ar" ? "en" : "ar");
        });
    }

    const signoutBtn = document.getElementById("signout-btn");
    if (signoutBtn) {
        signoutBtn.addEventListener("click", async () => {
            if (client) await client.auth.signOut();
            window.location.assign("home.html");
        });
    }
}

async function initialize() {
    initializeNavigation();

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
    if (!data.session?.user) {
        setMessage("pleaseSignIn", "error");
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
        setMessage("unableToVerify", "error");
        return;
    }
    if (!coordinator) {
        setMessage("onlyCoordinators", "error");
        return;
    }

    // Verified coordinator access
    const coordBadge = document.getElementById("coordinator-badge");
    if (coordBadge) coordBadge.hidden = false;

    const signoutBtn = document.getElementById("signout-btn");
    if (signoutBtn) signoutBtn.hidden = false;

    const createEventBtn = document.getElementById("create-event-btn");
    if (createEventBtn) createEventBtn.hidden = false;

    const coordEventsLink = document.getElementById("coordinator-events-link");
    if (coordEventsLink) coordEventsLink.hidden = false;

    form.hidden = false;
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(form);
    const venueName = (formData.get("venue_name") || "").trim();
    const location = (formData.get("location") || "").trim();
    const rawCapacity = (formData.get("room_capacity") || "").trim();

    // Acceptance criterion 4: If venues.venue_name is blank or missing
    if (!venueName) {
        setMessage("venueNameRequired", "error");
        document.getElementById("venue-name")?.focus();
        return;
    }

    // Acceptance criterion 5: If venues.location is blank or missing
    if (!location) {
        setMessage("locationRequired", "error");
        document.getElementById("venue-location")?.focus();
        return;
    }

    // Acceptance criterion 6: If venues.room_capacity is missing
    if (!rawCapacity) {
        setMessage("capacityRequired", "error");
        document.getElementById("room-capacity")?.focus();
        return;
    }

    // Acceptance criterion 7: If venues.room_capacity is zero, negative, or not a whole number
    const capacityNumber = Number(rawCapacity);
    if (!Number.isInteger(capacityNumber) || capacityNumber <= 0) {
        setMessage("capacityMustBePositive", "error");
        document.getElementById("room-capacity")?.focus();
        return;
    }

    submitButton.disabled = true;
    try {
        // Acceptance criterion 2: Successfully submitting the form creates a new record in public.venues
        const { error } = await client.from("venues").insert({
            venue_name: venueName,
            location: location,
            room_capacity: capacityNumber
        });

        if (error) throw error;

        form.reset();
        // Acceptance criterion 3: The system displays a confirmation notification: "Venue added successfully."
        setMessage("venueAddedSuccess", "success");
    } catch (error) {
        console.error("Venue creation error:", error);
        if (error.code === "42501") {
            setMessage("onlyCoordinators", "error");
        } else {
            setMessage("venueCreateError", "error");
        }
    } finally {
        submitButton.disabled = false;
    }
});

initialize();
