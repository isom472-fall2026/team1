# FinOps ledger

What the AI work cost you, and what you changed because of it.

This ledger lives in the repository and is committed. It is never kept in a spreadsheet, a chat thread, or anywhere else. It is checked as **present and current** — it is not scored on how accurate the numbers are. An honest rough figure beats a precise invented one.

The FinOps Lead keeps it. Every member supplies their own rows.

## The plan — written in Phase 2

*Which assistant or model you use for which kind of work, and what your limit is. Three or four lines. Revisit it in Phase 4 and say whether it held.*

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
| **Ismail** — Story #46 (Guest Access to the AUK Events Home Page) & Story #36 (User Account Creation); landing page foundation & attendee registration | Antigravity IDE Agent (Gemini 3.8 Flash) for scaffolding and UI logic; Gemini Enterprise (Browser) for story criteria | **~95,000 tokens** (~85,000 – 105,000 estimated range; ~10–14 prompt turns). *Unmeasured estimate — informed assumption based on foundational landing page layout, event card rendering, filter controls, and attendee registration modal; requires teammate confirmation.* | `prototype/home.html`, `prototype/css/home.css`, `prototype/js/home.js`, `prototype/js/signup.js`, Supabase client config (`js/config.js`), AUK color palette tokens (`#7F1023`), and acceptance criteria for stories #46 and #36 (attendee registration fields, university ID, and password validation rules) | Avoid generating monolithic CSS and JavaScript files in single large prompts (e.g., initial 800+ line CSS and 750+ line JS files). Prompt for modular components (such as separate modal logic and event cards) to keep prompt context narrow and reduce token usage. |
| **Ayoub** — Story #37 (User Sign In) & Story #41 (User Sign Out); authentication modals, session state & FinOps ledger maintenance | Antigravity IDE Agent (Gemini 3.8 Flash) for auth flows and ledger review; Gemini Enterprise (Browser) for auth flow planning | **~70,000 tokens** (~65,000 – 75,000 range; ~11–15 prompt turns). *Partially measured: ~35,000 tokens recorded and verified from active Antigravity IDE session log for ledger compilation and repo review; plus ~30,000 – 40,000 tokens unmeasured defensible estimate for sign-in/out modal implementation.* | `prototype/home.html`, `prototype/css/home.css`, `prototype/css/signin.css`, `prototype/css/signup.css`, `prototype/js/home.js`, `prototype/js/signin.js`, `prototype/js/signup.js`, `docs/finops-ledger.md`, Supabase Auth client methods (`signInWithPassword`, `signOut`), bilingual English/Arabic label strings, and session-aware navigation state requirements | Pass only the specific navigation and modal markup snippets rather than attaching the entire `home.html` and `home.css` files into prompt contexts, reducing input token overhead during auth UI styling. |
| **Mustafa** — Story #38 (Profile View & Information Retrieval) & Story #39 (User Contact Information Update); attendee profile management & contact updates | Antigravity IDE Agent (Gemini 3.8 Flash) for profile UI and Supabase retrieval; GitHub Copilot SWE agent for PR #67 conflict resolution; Gemini Enterprise (Browser) for story verification | **~62,000 tokens** (~55,000 – 70,000 estimated range; ~7–10 prompt turns). *Unmeasured estimate based on attendee profile page generation, session retrieval logic, guest redirect flow, contact info edit handling, and cache-busting fix.* | `prototype/profile.html`, `prototype/css/profile.css`, `prototype/js/profile.js`, `prototype/home.html`, `prototype/js/home.js`, Supabase `profiles` table schema and attendee fields, session retrieval logic, input fields for emergency contact and phone, and git conflict markers | Clearly specify database field constraints, editable input states, and caching expectations upfront in the initial prompt to prevent repetitive debugging turns for form unlocking and cache invalidation. |
| **Sulieman** — Story #16 (Coordinator Can View All Events) & Story #56 (Coordinator Creates a New Venue); coordinator event roster & venue creation | Antigravity IDE Agent (Gemini 3.8 Flash) for coordinator event list and venue creation; Gemini Enterprise (Browser) for navigation flow | **~72,000 tokens** (~65,000 – 80,000 estimated range; ~8–11 prompt turns). *Unmeasured estimate based on coordinator events management table, coordinator role security guard, venue creation form, and cross-page navigation links.* | `prototype/coordinator-events.html`, `prototype/css/coordinator-events.css`, `prototype/js/coordinator-events.js`, `prototype/create-venue.html`, `prototype/js/create-venue.js`, `prototype/home.html`, `prototype/profile.html`, `events` and `venues` table schemas, coordinator role verification logic, and navigation bar tabs | Standardize shared UI layout and table styling tokens upfront rather than having the AI generate redundant standalone CSS files (`coordinator-events.css`), and verify role guard logic before building pages to avoid follow-up fix prompts. |
| **Sayed** — Story #15 (Create an event by coordinator) & Story #40 (Role-Specific Navigation Visibility); coordinator event creation, SQL trigger & role-based nav | Antigravity IDE Agent (Gemini 3.8 Flash) and GitHub Copilot (co-author on commit 3ac254c) for event creation and SQL triggers; Gemini Enterprise (Browser) for schema design and validation rules | **~80,000 tokens** (~70,000 – 90,000 estimated range; ~9–12 prompt turns). *Unmeasured estimate based on coordinator event creation page, database PL/pgSQL triggers with venue conflict detection, role-based nav visibility button, and bilingual Arabic translation passes.* | `db/schema.sql` (table definitions, constraints, and PL/pgSQL venue overlap trigger), `prototype/create-event.html`, `prototype/css/create-event.css`, `prototype/js/create-event.js`, `prototype/home.html`, `prototype/js/home.js`, `prototype/css/home.css`, `js/config.js`, coordinator role check rules, and Arabic translation strings for event form fields | Provide only the relevant `events` and `venues` table schema snippets instead of attaching the full `db/schema.sql`, and prompt for bilingual English/Arabic labels in the initial pass to eliminate secondary translation prompts. |

### Phase 3 Usage Synthesis & Methodology Notes

* **Phase 3 Total Team Usage Estimate:** **~340,000 – 420,000 tokens** (Midpoint estimate: ~379,000 tokens across all team members).
* **Measurement vs. Estimation Distinction:**
  * *Verified measured data (~9.2% of total):* ~35,000 tokens recorded and verified in the active Antigravity IDE session log for repository inspection, schema checks, and FinOps ledger maintenance by Ayoub.
  * *Defensible estimates (~90.8% of total):* ~344,000 tokens across individual implementation work for team members, derived from prompt session complexity, number of file contexts passed, and iterative debugging turns.
* **Limitations of the Estimates:**
  * Source code files (`.html`, `.css`, `.js`, `.sql`) represent the *output* of AI-assisted engineering, not a direct log of consumed tokens. Token counts are **never** calculated as a fixed multiplier of lines of code.
  * The Antigravity IDE interface displays weekly quota limits rather than raw per-request token meters, while Gemini Enterprise operates without end-user telemetry.
  * Individual session logs for teammates are not centrally tracked; therefore, individual token counts are transparent, defensible estimates rather than exact measurements.
  * Ismail is estimated to have the highest usage (~85,000 – 105,000 tokens, midpoint ~95,000 tokens) due to foundational landing page architecture and attendee registration scaffolding; this is explicitly recorded as an **informed assumption requiring teammate confirmation** rather than a verified certainty.
* **Adherence to AI Usage Plan:**
  * High-level conceptual planning, story refinement, and backlog review remained in Gemini Enterprise (browser), incurring zero token expense against project IDE quotas.
  * Implementation, UI components, PL/pgSQL triggers, and bug fixes were executed in local IDE assistants (Antigravity IDE Agent with Gemini 3.8 Flash, supplemented by GitHub Copilot on specific trigger and merge conflict work), remaining comfortably within weekly refresh limits.

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
