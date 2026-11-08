# Phase 4 delivery note

*The Phase Lead for phase 4 writes this note, during phase 4 — not afterwards, and not by
whoever is free at the end.*

## What was delivered

During Phase 4, Team 1 — Seas improved the AUK Events system by introducing new features that make it easier for attendees to discover events, manage reservations, and track their bookings.
 
Attendees can now browse upcoming events, filter events by category, reserve seats, cancel reservations, and view their booking details and statuses. Guests who attempt to reserve a seat are prompted to sign in before proceeding.
 
Coordinators can now view all venues, update existing venue information, and delete venues that are no longer needed. They can also edit existing events, with validation to ensure that event details meet the system's requirements.
 
The registration experience has also been improved. The sign-up window now remains open as expected, users receive a clear message when attempting to register with an existing email address, and role-based navigation responds more efficiently with fewer unnecessary database requests.
Overall, Phase 4 delivered a more functional, reliable, and user-friendly event management system for attendees, guests, and coordinators.
## Who did what

<!-- One line per team member: name, then the stories they built. Everybody appears. -->

| Name | Stories |
|---|---|
| Ismail | #44, #70, #103(bug), #108(bug), #114(bug) |
| Ayoub | #74, #45 |
| Mustafa | #81, #57 |
| Sulieman | #18, #75 |
| Sayed | #43, #101, #114(bug) |


## Links to the stories

*The full story list at this tag is saved in ../backlog.md — do not repeat it here.*

<!-- Link each story listed above to its issue. -->

- [#74](https://github.com/isom472-fall2026/team1/issues/74) — Attendee Reserve a Seat
- [#45](https://github.com/isom472-fall2026/team1/issues/45) — Guest User is Prompted to Sign In Before Reserving
- [#44](https://github.com/isom472-fall2026/team1/issues/44) — Attendee Can View Upcoming Events
- [#70](https://github.com/isom472-fall2026/team1/issues/70) — Attendee Filters Events by Event Category
- [#18](https://github.com/isom472-fall2026/team1/issues/18) — Attendee Reservation Cancellation
- [#75](https://github.com/isom472-fall2026/team1/issues/75) — View My Bookings
- [#81](https://github.com/isom472-fall2026/team1/issues/81) — Coordinator Deletes an Unused Venue
- [#57](https://github.com/isom472-fall2026/team1/issues/57) — Coordinator Updates Existing Venue Details
- [#43](https://github.com/isom472-fall2026/team1/issues/43) — Coordinator Event Editing and Constraint Validation
- [#101](https://github.com/isom472-fall2026/team1/issues/101) — Coordinator Can View All Venues
- [#108](https://github.com/isom472-fall2026/team1/issues/108) — Sign Up Displays Incorrect Error Message for an Already Registered Email
- [#114](https://github.com/isom472-fall2026/team1/issues/114) — Slow Role-Based Navigation and Repeated Supabase Requests
- [#103](https://github.com/isom472-fall2026/team1/issues/103) — Sign Up Modal Closes Immediately After Opening

## where every thing is:


| **Item** | **Done** | **Where it is** |
| :--- | :---: | :--- |
| GitHub Project Board | ☑ | [Team 1 — Seas](https://github.com/isom472-fall2026/team1/projects) |
| Phase 4 user stories and acceptance criteria | ☑ | [GitHub Issues](https://github.com/isom472-fall2026/team1/issues) |
| Completed Phase 4 features | ☑ | [Running AUK Events System](https://isom472-fall2026.github.io/team1/prototype/home.html) |
| HTML, CSS, and JavaScript implementation | ☑ | [prototype/](https://github.com/isom472-fall2026/team1/tree/main/prototype) |
| Database schema and RLS policies | ☑ | [db/schema.sql](https://github.com/isom472-fall2026/team1/blob/main/db/schema.sql) |
| Phase 4 backlog | ☑ | [docs/backlog.md](https://github.com/isom472-fall2026/team1/blob/main/docs/backlog.md) |
| Team contributions | ☑ | See **Who did what** section above |
| FinOps ledger | ☑ | [docs/finops-ledger.md](https://github.com/isom472-fall2026/team1/blob/main/docs/finops-ledger.md) |
| what we learned |☑ | [docs/blog.md](https://github.com/isom472-fall2026/team1/blob/main/docs/blog.md) |
| Phase 4 delivery note | ☑ | This document |
| Phase 4 Git tag | ☑ | `phase-4` |
## The tag cut for this phase

`phase-4`

<!-- Created by the Phase Lead — steps in ../how-we-work.md#how-to-create-the-tag. The tag is what gets graded — anything pushed after it does not
     count for this phase. -->

## Anything not finished, and where it went

All 10 planned Phase 4 user stories were completed and delivered, along with three resolved bugs (#103, #108, and #114).
 
Some work remains in the project backlog and has been carried forward for future development. At the end of Phase 4, 19 stories remained in the To Do column, including #13, #14, #19, #20, #21, #23, and #24. These stories were deferred to the next phase for review and prioritization.
Issue #62 remained in progress at the Phase 4 delivery cutoff and was carried forward to the next phase for completion and testing.
 
Issues #83 and #61 were reviewed and closed as out of scope because they did not align with the agreed project requirements. These issues were dropped from the planned work rather than carried forward and were not counted as completed features.
 
All remaining work and scope decisions are documented in docs/backlog.md and tracked on the GitHub Project Board to maintain a clear record of what was completed, deferred, or excluded.