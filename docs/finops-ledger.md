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
|  |  |  |  |  |

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