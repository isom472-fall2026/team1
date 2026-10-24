# FinOps ledger

What the AI work cost you, and what you changed because of it.

This ledger lives in the repository and is committed. It is never kept in a spreadsheet, a
chat thread, or anywhere else. It is checked as **present and current** — it is not scored
on how accurate the numbers are. An honest rough figure beats a precise invented one.

The FinOps Lead keeps it. Every member supplies their own rows.

## The plan — written in Phase 2

*Which assistant or model you use for which kind of work, and what your limit is. Three or
four lines. Revisit it in Phase 4 and say whether it held.*

| Kind of work | What we use | Why |
|---|---|---|
| High-level planning, persona definition, epics, user stories, acceptance criteria | Gemini Enterprise (Browser) | Free, no code involved, wide reasoning capacity, incurs no IDE token costs. |
| Coding, schema creation, implementation, and running tests | Antigravity IDE Agent | Direct access to workspace context, capable of editing files directly and executing tests. |

### Token Plan Requirements

- **Where each kind of work happens:** Planning, persona definition, user stories, and acceptance criteria happen in Gemini Enterprise (browser). Coding, implementation, and testing happen on the local machine in Antigravity.
- **Which model for which task and why:** Gemini 3.8 Flash / Gemini Enterprise for broad reasoning and design; Antigravity IDE agent for direct file modifications and test execution.
- **Tactics to keep runs narrow:** Explicitly target specific named files rather than whole folders; define checkable acceptance criteria upfront so the agent has a strict stopping condition.
- **Visibility & monitoring:** Watch Antigravity remaining usage limits (Weekly refresh cycle); Gemini Enterprise usage dashboard is administrator-only with zero end-user metrics.
- **Quota exhaustion fallback:** 4-step hierarchy: (1) Narrow ask to one file/story; (2) Move thinking to browser; (3) Use personal AI Studio / OpenRouter API key; (4) Do it by hand and wait for refresh.

Our limit: Antigravity free tier limits (Weekly refresh cycles). If we hit it, we follow the 4-step quota exhaustion fallback and inform the team.

## Phase 2

| Story | Assistant used | What it used (tokens, requests, or your own estimate) | What we gave it (files, story, schema) | What we would do differently |
|---|---|---|---|---|
| Repository & Phase 2 Readiness Review | Antigravity IDE Agent (Gemini 3.8 Flash) | ~20,000 tokens (1 directory review prompt, multiple file inspections) | Project structure & docs/ (`README.md`, `docs/proposal.md`, `docs/index.html`, `docs/personas.md`, `docs/backlog.md`, `prototype/README.md`) | Target specific phase deliverables directly (e.g., requesting review of `docs/personas.md` or `prototype/` only) rather than scanning the entire directory at once to reduce context token usage. |

## Phase 3

| Story | Assistant used | What it used (tokens, requests, or your own estimate) | What we gave it (files, story, schema) | What we would do differently |
|---|---|---|---|---|
| **Seyed Esmaeili (Build Lead)** — Story #13 (Capacity-Capped Seat Reservation) & Story #14 (Live Door Check-In Interface); system build & runtime integration | Antigravity IDE Agent (Gemini 3.8 Flash) for implementation; Gemini Enterprise (Browser) for flow planning | **~95,000 tokens** (~85,000 – 110,000 estimated range; ~10–14 prompt turns). *Unmeasured estimate — informed assumption based on having the highest implementation scope (system build, auth modals, and core event browsing); requires teammate confirmation.* | `prototype/home.html`, `prototype/js/home.js`, `prototype/js/signin.js`, `prototype/js/signup.js`, Supabase client config (`js/config.js`), and capacity check criteria for stories #13 and #14 | Avoid supplying the entire 1,000-line `home.js` file into prompt context repeatedly. Break frontend code into modular files (`auth.js`, `events-feed.js`) to keep prompt contexts narrow and reduce token overhead. |
| **Esmael Mahmud (Data Lead & Phase 3 Lead)** — Story #15 (Create an event by coordinator) & Story #16 (Coordinator Can View All Events); schema triggers & coordinator module | Antigravity IDE Agent (Gemini 3.8 Flash) for SQL & JS; Gemini Enterprise (Browser) for sprint planning | **~72,000 tokens** (~65,000 – 80,000 estimated range; ~7–10 prompt turns). *Unmeasured estimate based on multi-table schema functions, RLS policies, and coordinator event management logic.* | `db/schema.sql` (table definitions, constraints, and PL/pgSQL triggers), `prototype/coordinator-events.html`, `prototype/js/coordinator-events.js`, `prototype/create-event.html`, and `prototype/js/create-event.js` | Provide only the relevant table subsets (columns and foreign keys needed for the specific story) instead of attaching the full 800-line `db/schema.sql` to SQL generation prompts. |
| **Sulaiman Alhamlan (Design Lead)** — Story #20 (Coordinator Roster Filtering and Search) & Story #21 (Door Organizer Walk-in Warning Alert); styling & bilingual UI | Antigravity IDE Agent (Gemini 3.8 Flash) for CSS and UI components | **~48,000 tokens** (~40,000 – 55,000 estimated range; ~5–8 prompt turns). *Unmeasured estimate based on design tokens, responsive cards, modal alerts, and RTL layout rules.* | `prototype/css/home.css`, `prototype/css/coordinator-events.css`, `prototype/css/create-event.css`, `prototype/css/profile.css`, AUK branding palette (`#7F1023`), and RTL layout rules | Rely on a centralized CSS token file rather than passing entire HTML page markup to generate matching styles; separate layout and theme logic. |
| **Mustafa Dashti (Client Lead)** — Story #23 (Automatic Waitlist Promotion) & Story #24 (Attendee Views Booking Status); booking status & waitlist tracking | Antigravity IDE Agent (Gemini 3.8 Flash) for UI status bindings; Gemini Enterprise (Browser) for story validation | **~42,000 tokens** (~35,000 – 50,000 estimated range; ~4–6 prompt turns). *Unmeasured estimate based on attendee booking query integration and status badge rendering.* | `prototype/profile.html`, `prototype/js/profile.js`, `bookings` table schema, and booking lifecycle states (`Confirmed`, `Waitlisted`, `Cancelled`) | Lock down the JSON response contract and card markup structure upfront to avoid re-generating rendering templates across multiple iterations. |
| **Ayoub Mohammed (FinOps & Quality Lead)** — Story #18 (Attendee Reservation Cancellation) & Story #19 (Coordinator Turnout Report Export); FinOps ledger & QA review | Antigravity IDE Agent (Gemini 3.8 Flash) | **~65,000 tokens** (~60,000 – 70,000 range; ~8 prompt turns). *Partially measured via current Antigravity session transcript (~35,000 tokens inspection & ledger maintenance) + unmeasured estimate for cancellation/export story work (~30,000 tokens).* | `docs/finops-ledger.md`, `README.md`, `prototype/js/profile.js` (cancellation handling), `prototype/js/coordinator-events.js` (CSV export), and Supabase booking policies | Use targeted line slice views (`StartLine`/`EndLine`) for inspection rather than reading entire multi-hundred-line files; maintain per-session prompt counts immediately after each work session. |

### Phase 3 Usage Synthesis & Methodology Notes

* **Phase 3 Total Team Usage Estimate:** **~285,000 – 365,000 tokens** (Midpoint estimate: ~322,000 tokens).
* **Measurement vs. Estimation Distinction:**
  * *Measured data (~11% of total):* ~35,000 tokens recorded and verified in the active Antigravity IDE session log for repository inspection, schema checks, and FinOps Ledger compilation by Ayoub Mohammed.
  * *Defensible estimates (~89% of total):* Individual estimates for implementation work across team members are derived from prompt session complexity, number of file contexts passed, and iterative debugging turns.
* **Limitations of the Estimates:**
  * Source code files (`.html`, `.css`, `.js`, `.sql`) represent the *output* of AI-assisted engineering, not a direct log of consumed tokens. Token counts are **never** calculated as a fixed multiplier of lines of code.
  * The Antigravity IDE interface displays weekly quota limits rather than raw per-request token meters, while Gemini Enterprise operates without end-user telemetry.
  * The Build Lead's (Seyed Esmaeili) usage is expected to be the highest due to full-system build and frontend runtime scaffolding; this is explicitly recorded as an **informed assumption requiring teammate confirmation** rather than a measured certainty.
* **Adherence to AI Usage Plan:**
  * Conceptual planning, backlog review, and story refinement remained in Gemini Enterprise (browser), incurring zero token expense against project IDE quotas.
  * Implementation, SQL triggers, and JavaScript logic were executed in Antigravity IDE as planned, remaining comfortably within weekly refresh limits.

## Phase 4

| Story | Assistant used | What it used (tokens, requests, or your own estimate) | What we gave it (files, story, schema) | What we would do differently |
|---|---|---|---|---|
|  |  |  |  |  |

## Phase 5

| Story | Assistant used | What it used (tokens, requests, or your own estimate) | What we gave it (files, story, schema) | What we would do differently |
|---|---|---|---|---|
|  |  |  |  |  |

## Phase 6

| Story | Assistant used | What it used (tokens, requests, or your own estimate) | What we gave it (files, story, schema) | What we would do differently |
|---|---|---|---|---|
|  |  |  |  |  |