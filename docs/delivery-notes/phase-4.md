# Phase 4 delivery note

*The Phase Lead for phase 4 writes this note, during phase 4 — not afterwards, and not by
whoever is free at the end.*

## What was delivered

During Phase 4, Team 1 — Seas successfully delivered 10 user stories focused on improving the functionality, usability, and reliability of the AUK Events system. The enhancements strengthened the attendee booking experience and provided coordinators with improved event and venue management capabilities.
Attendee and Guest Features
Attendees can browse upcoming events, filter events by category, reserve seats, cancel existing reservations, and view their bookings and reservation statuses. Guests attempting to reserve a seat are prompted to sign in before proceeding, ensuring that reservations are associated with authenticated users.
Coordinator Features
Coordinators can view all venues, update existing venue information, and delete venues that are no longer needed. They can also edit existing events, with validation ensuring that event details comply with the system's requirements.
Bug Fixes and Performance Improvements
In addition to the planned user stories, the team resolved three reported bugs:
#103 — Sign Up Modal Closes Immediately After Opening: Corrected the modal behavior to ensure users can complete registration without unexpected interruptions.
#108 — Incorrect Error Message for an Already Registered Email: Improved registration error handling to provide clear and accurate feedback when an email address is already registered.
#114 — Slow Role-Based Navigation and Repeated Supabase Requests: Optimized role-based navigation and reduced unnecessary Supabase requests to improve responsiveness and overall performance.
Scope Management
Issues #83 and #61 were reviewed and formally closed as out of scope, as their requirements did not fall within the agreed project scope. These issues were excluded from the completed deliverables and were not counted as implemented features.
Overall, Phase 4 delivered 10 completed user stories and 3 resolved bugs, while maintaining clear documentation of outstanding work and scope-related decisions.
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

All 10 planned Phase 4 user stories were successfully completed and delivered. In addition, three reported bugs (#103, #108, and #114) were resolved to improve the system's functionality, usability, and performance.
At the Phase 4 delivery cutoff, the remaining work was documented as follows:
19 stories in To Do: These stories remain in the project backlog for future development and prioritization.
1 story in progress: Issue #62 remains under development and will be carried forward to the next phase.
7 outstanding stories: Issues #13, #14, #19, #20, #21, #23, and #24 remain pending and are included in the To Do backlog.
2 issues closed as out of scope: Issues #83 and #61 were reviewed and formally closed because their requirements fell outside the agreed scope of Phase 4. They were not counted as completed deliverables.
All unfinished work is documented in docs/backlog.md and tracked on the GitHub Project Board to ensure transparency and continuity in future development phases.
The remaining stories will be reviewed and prioritized according to project requirements and available resources.