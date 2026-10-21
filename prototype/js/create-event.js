"use strict";

const SUPABASE_URL = window.SUPABASE_URL || "https://abhtxsufvhlixtqgcivk.supabase.co";
const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHR4c3VmdmhsaXh0cWdjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTUyMjQsImV4cCI6MjEwNjUzMTIyNH0.jw38FYru71ZH7O_maPl5Ceaict38kzEi9NuGUBE2pJU";

const form = document.getElementById("create-event-form");
const message = document.getElementById("access-message");
const venueSelect = document.getElementById("event-venue");
const submitButton = document.getElementById("create-event-submit");
let client = null;
let currentUser = null;

const translations = {
    en: {
        home: "Home",
        events: "Events",
        profile: "Profile",
        coordinatorEvents: "Coordinator Events",
        createEvent: "+ Create Event",
        signOut: "Sign Out",
        eyebrow: "AUK EVENTS",
        createEventHeading: "Create a campus event",
        createEventSubtitle: "Add the details attendees need to find and reserve seats.",
        coordinator: "Coordinator",
        eventTitle: "Event title",
        description: "Description",
        dateLabel: "Date",
        eventType: "Event type",
        selectType: "Select a type",
        typePlay: "Play",
        typeWorkshop: "Workshop",
        typeSeminar: "Seminar",
        startTime: "Start time",
        endTime: "End time",
        venue: "Venue",
        loadingVenues: "Loading venues...",
        selectVenue: "Select a venue",
        capacityLabel: "Capacity",
        cancel: "Cancel",
        submitCreateEvent: "Create Event",
        pleaseSignIn: "Please sign in as a coordinator to create an event.",
        onlyCoordinators: "Only coordinators can create events.",
        unableToConnect: "Unable to connect to Supabase.",
        unableToVerify: "Unable to verify coordinator access. Check the Supabase configuration.",
        unableToLoadVenues: "Unable to load venues. Please try again later.",
        completeDetails: "Complete all required event details.",
        capacityPositive: "Capacity must be a whole number greater than zero.",
        endTimeAfterStart: "End time must be after start time.",
        capacityExceedsVenue: "Capacity cannot exceed the selected venue's capacity.",
        venueOverlap: "This venue already has an overlapping event at that time.",
        onlyCoordinatorsCheckAccount: "Only coordinators can create events. Please check your coordinator account.",
        eventCreatedSuccess: "Event created successfully. Attendees can now view it.",
        eventCreateError: "Event could not be created. Check the details and try again.",
        maxCapacity: "max"
    },
    ar: {
        home: "الرئيسية",
        events: "الفعاليات",
        profile: "الملف الشخصي",
        coordinatorEvents: "فعاليات المنسق",
        createEvent: "+ إنشاء فعالية",
        signOut: "تسجيل الخروج",
        eyebrow: "فعاليات الجامعة",
        createEventHeading: "إنشاء فعالية جامعية",
        createEventSubtitle: "أضف التفاصيل التي يحتاجها المشاركون للعثور على الفعالية وحجز المقاعد.",
        coordinator: "منسق",
        eventTitle: "عنوان الفعالية",
        description: "الوصف",
        dateLabel: "التاريخ",
        eventType: "نوع الفعالية",
        selectType: "اختر النوع",
        typePlay: "مسرحية",
        typeWorkshop: "ورشة عمل",
        typeSeminar: "ندوة",
        startTime: "وقت البدء",
        endTime: "وقت الانتهاء",
        venue: "القاعة",
        loadingVenues: "جارٍ تحميل القاعات...",
        selectVenue: "اختر القاعة",
        capacityLabel: "السعة الاستيعابية",
        cancel: "إلغاء",
        submitCreateEvent: "إنشاء الفعالية",
        pleaseSignIn: "يرجى تسجيل الدخول كمنسق لإنشاء فعالية.",
        onlyCoordinators: "يمكن للمنسقين فقط إنشاء الفعاليات.",
        unableToConnect: "تعذر الاتصال بقاعدة البيانات.",
        unableToVerify: "تعذر التحقق من صلاحيات المنسق. يرجى التحقق من الإعدادات.",
        unableToLoadVenues: "تعذر تحميل القاعات. يرجى المحاولة لاحقاً.",
        completeDetails: "يرجى إكمال جميع تفاصيل الفعالية المطلوبة.",
        capacityPositive: "يجب أن تكون السعة رقماً صحيحاً أكبر من الصفر.",
        endTimeAfterStart: "يجب أن يكون وقت الانتهاء بعد وقت البدء.",
        capacityExceedsVenue: "لا يمكن أن تتجاوز السعة الاستيعابية سعة القاعة المحددة.",
        venueOverlap: "هذه القاعة محجوزة لفعالية أخرى في نفس الوقت.",
        onlyCoordinatorsCheckAccount: "يمكن للمنسقين فقط إنشاء الفعاليات. يرجى التحقق من حسابك.",
        eventCreatedSuccess: "تم إنشاء الفعالية بنجاح. يمكن للمشاركين الآن رؤيتها.",
        eventCreateError: "تعذر إنشاء الفعالية. يرجى التحقق من التفاصيل والمحاولة مرة أخرى.",
        maxCapacity: "الحد الأقصى"
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

    if (venueSelect && venueSelect.options.length > 0 && venueSelect.options[0].value === "") {
        venueSelect.options[0].text = t("selectVenue");
    }
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

async function loadVenues() {
    const { data, error } = await client
        .from("venues")
        .select("venue_id,venue_name,location,room_capacity")
        .order("venue_name", { ascending: true });

    if (error) throw error;
    venueSelect.replaceChildren(new Option(t("selectVenue"), ""));
    (data || []).forEach(venue => {
        const option = new Option(
            `${venue.venue_name} — ${venue.location} (${t("maxCapacity")} ${venue.room_capacity})`,
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

    const coordBadge = document.getElementById("coordinator-badge");
    if (coordBadge) coordBadge.hidden = false;
    const signoutBtn = document.getElementById("signout-btn");
    if (signoutBtn) signoutBtn.hidden = false;
    const coordEventsLink = document.getElementById("coordinator-events-link");
    if (coordEventsLink) coordEventsLink.hidden = false;

    try {
        await loadVenues();
        form.hidden = false;
    } catch (error) {
        console.error("Venue loading error:", error);
        setMessage("unableToLoadVenues", "error");
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
        setMessage("completeDetails", "error");
        return;
    }
    if (!Number.isInteger(capacity) || capacity <= 0) {
        setMessage("capacityPositive", "error");
        return;
    }
    if (startTime >= endTime) {
        setMessage("endTimeAfterStart", "error");
        return;
    }
    if (capacity > Number(selectedVenue.dataset.capacity)) {
        setMessage("capacityExceedsVenue", "error");
        return;
    }

    submitButton.disabled = true;
    try {
        if (await hasConflict(eventDate, startTime, endTime, venueId)) {
            setMessage("venueOverlap", "error");
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
        setMessage("eventCreatedSuccess", "success");
    } catch (error) {
        console.error("Event creation error:", error);
        if (error.code === "23P01") {
            setMessage("venueOverlap", "error");
        } else if (error.code === "42501") {
            setMessage("onlyCoordinatorsCheckAccount", "error");
        } else {
            setMessage("eventCreateError", "error");
        }
    } finally {
        submitButton.disabled = false;
    }
});

initialize();
