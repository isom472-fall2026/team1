# Phase 2 delivery note

*The Phase Lead for phase 2 writes this note, during phase 2 — not afterwards, and not by
whoever is free at the end.*

## What was delivered
We finalized the scope and specifications for the AUK Event & Workshop Management System to resolve seat leakage, crowding, and manual workload. The key decisions are:

1. User Roles & Permissions (RLS)
Attendee: Can view events, book seats, cancel bookings, and join the waitlist. (Read-only access to events).

Organizer: Can view the active attendee list and check people in at the venue.

Coordinator: Has full admin control to create/edit events, check attendees in, and download final reports.

2. Database Schema (Core Tables)
Events: Stores event details (Title, Type, Location, Date, Capacity).

Attendees: Stores attendee info (Name, Student ID, Email).

Bookings: Links attendees to events and tracks booking status (Confirmed, Waitlisted, Cancelled).

Attendance Logs: Records actual attendance with timestamps during check-in.

3. Core Features
Hard Capacity Limits: Automatically blocks new bookings once the event capacity is reached.

Automated Waitlist: Automatically moves the first waitlisted person to "Confirmed" if a booking is cancelled.

Live Check-in Interface: Allows organizers to check in confirmed attendees at the door.

Instant Turnout Reports: Allows coordinators to export complete attendance summaries in under 2 minutes.


## Who did what

<!-- One line per team member: name, then the stories they built. Everybody appears. -->

| Name | Stories |
|Seyed Esmaeili (Build Lead)|	#13, #14|
|Esmael Mahmud (Data Lead) | #15, #16 |
|Ayoub Mohammed (FinOps & Quality Lead)  |	#18, #19  |
|Sulaiman Alhamlan	(Design Lead,phase lead) |#20, #21  |
|Mustafa Dashti (Client Lead)  | #23, #24 |

## Links to the stories
All project artifacts are located within the team1 GitHub repository. The key documents and their paths are as follows:

User Stories: Managed in the GitHub Issues tab.

Project Proposal: docs/proposal.md

Personas: docs/personas.md

Database Schema: docs/schema.md

ERD: docs/erd.html

Team Working Agreement: docs/how-we-work.md

Prototype Files: Located in the /prototype directory.

The Git tag for this phase: phase-2


- #__ —

## The tag cut for this phase

`phase-2`

<!-- Created by the Phase Lead — steps in ../how-we-work.md#how-to-create-the-tag. The tag is what gets graded — anything pushed after it does not
     count for this phase. -->

## Anything not finished, and where it went

<!-- What was planned and was not finished, and what happened to it: moved to the next phase,
     dropped, or replaced. Say which. -->
