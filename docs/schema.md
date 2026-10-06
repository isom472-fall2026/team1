# AUK Event & Workshop Attendance System — Schema

## Purpose

The database supports the AUK Event & Workshop Attendance System from event creation through registration and attendance. It separates user identity and role information from event, booking, organizer assignment, and attendance records.

Supabase Authentication provides the authenticated user identity, while the public database schema stores the application data. Row Level Security (RLS) is used to control what attendees, coordinators, and organizers are allowed to read and modify.

---

## Users

A row in `users` represents the application profile of a person who has an authenticated account.

The `users` table acts as the common profile for the different types of users in the system. Each user is connected to Supabase Authentication, while their role is determined through the attendee, coordinator, or organizer tables.

Users can read and update their own profiles. Coordinators and organizers can also read user information when necessary for managing events and attendance.

---

## Attendees

A row in `attendee` means that a user participates in the system as an attendee.

An attendee can be a Student, Staff/Faculty member, or Guest. The attendee record extends the main user profile instead of storing another copy of the user's information.

Attendees can view their own attendee information and manage their own event bookings. Coordinators and organizers can read attendee information when needed to manage registrations and attendance.

---

## Coordinators

A row in `coordinator` means that a user has coordinator responsibilities in the system.

Coordinators are responsible for creating and managing events. They also manage venues and assign organizers to events.

A coordinator can create an event only under their own account and can update or delete events that they own. Coordinators can also view bookings and attendance records associated with their events.

These restrictions prevent one coordinator from modifying another coordinator's events.

---

## Organizers

A row in `organizer` means that a user can serve as an event organizer.

Being an organizer does not automatically provide access to every event. An organizer must first be assigned to an event through `organizer_assignments`.

Organizers can view their own organizer information and the attendee information required for event operations. They can view event bookings and manage attendance only for events to which they have been assigned.

---

## Venues

A row in `venues` represents a physical location where an event can take place.

Events are connected to venues so that the system knows where each event occurs and can enforce venue-related rules.

Authenticated users can view venues so that event locations can be displayed. Coordinators manage venue records because venues are resources required when creating events.

The database also checks that an event's capacity does not exceed the capacity of its selected venue.

---

## Events

A row in `events` represents one scheduled AUK event.

Each event is created by a coordinator and takes place at a venue. The event becomes the central record connecting the coordinator, venue, attendee bookings, organizer assignments, and attendance.

Authenticated users can view events so that they can browse available activities.

Only coordinators can create events. A coordinator can update or delete only events that belong to them.

The database also validates event scheduling. It prevents invalid start and end times, prevents an event's capacity from exceeding its venue capacity, and prevents overlapping events from being scheduled in the same venue.

---

## Bookings

A row in `bookings` represents one attendee's reservation for one event.

A booking connects an attendee to an event. Each booking can have one of three states:

- **Confirmed** — the attendee has a reserved seat.
- **Waitlisted** — the event has reached capacity and the attendee is waiting for a seat.
- **Cancelled** — the attendee cancelled the reservation.

The database prevents the same attendee from creating multiple bookings for the same event.

Attendees can create and view their own bookings. Coordinators can view bookings belonging to events they manage. Assigned organizers can view bookings for events to which they have been assigned.

When a booking is created, the system checks the event capacity. If a seat is available, the booking becomes Confirmed. If the event is full, the booking becomes Waitlisted.

When a confirmed attendee cancels, the system can promote the next waitlisted booking to Confirmed.

---

## Organizer Assignments

A row in `organizer_assignments` means that a particular organizer has been assigned to a particular event.

This relationship is stored separately because one organizer may work on multiple events and one event may have multiple organizers.

The coordinator responsible for an event can assign or remove organizers from that event.

Organizers can view their own assignments.

The assignment also acts as an authorization rule. An organizer must be assigned to an event before they can access that event's bookings or perform attendance operations.

---

## Attendance Logs

A row in `attendance_logs` represents the attendance record associated with an attendee's confirmed booking.

Attendance is connected to the booking rather than directly to the attendee because the booking identifies both the attendee and the specific event.

Assigned organizers can create and update attendance records for confirmed bookings belonging to their assigned events.

Attendees can view their own attendance records, while coordinators can view attendance for events they manage.

Before attendance is recorded, the database verifies that the booking is Confirmed and that the organizer is assigned to the corresponding event.

Each booking can have only one attendance record.

---

## How the Tables Relate

The system begins with a person authenticated through Supabase Authentication. That person has a corresponding record in `users`.

The person's role is represented through one or more role tables:

**User → Attendee**

**User → Coordinator**

**User → Organizer**

A coordinator creates an event:

**Coordinator → Event**

Each event takes place at a venue:

**Venue → Event**

An attendee reserves a place at an event through a booking:

**Attendee → Booking → Event**

Organizers are connected to events through organizer assignments:

**Organizer → Organizer Assignment → Event**

On the event day, an assigned organizer records attendance for a confirmed booking:

**Booking → Attendance Log ← Organizer**

Together, these relationships support the complete event process from event creation through reservation and final attendance tracking.

---

## System Workflow

The main database workflow is:

**User → Role → Event → Booking → Attendance**

A coordinator first creates an event and selects its venue.

Attendees can then view the event and reserve seats.

If capacity is available, the reservation becomes Confirmed. If the event is full, the reservation becomes Waitlisted.

The coordinator can assign one or more organizers to manage the event.

If a confirmed attendee cancels their reservation, the next attendee on the waitlist can automatically be promoted to Confirmed.

When the event takes place, an assigned organizer records attendance for confirmed attendees.

The coordinator can then access the attendance information for the event.

---

## Row Level Security (RLS)

Row Level Security is enabled on every application table in the public schema.

RLS is used so that authenticated users do not automatically receive unrestricted access to database records.

### Attendee Access

Attendees primarily access information that belongs to them.

They can view their own profile, attendee information, bookings, and attendance records. They can create their own bookings and update their bookings when cancelling a reservation.

Attendees cannot create events, assign organizers, or record attendance.

### Coordinator Access

Coordinators receive administrative permissions required to manage events.

They can create events and manage events that belong to them. They can manage venues and organizer assignments and can view attendees, bookings, and attendance information required to manage their events.

### Organizer Access

Organizers receive operational access for events they are assigned to.

They can view their assignments and access the attendee and booking information required for those events.

Attendance can only be created or updated when the organizer is assigned to the corresponding event and the attendee has a confirmed booking.

---

## Database Rules and Automation

The database uses functions and triggers to enforce important business rules independently of the web interface.

### Automatic Booking Status

When an attendee reserves an event, the database checks the event capacity.

If capacity remains, the booking becomes `Confirmed`. Otherwise, it becomes `Waitlisted`.

### Waitlist Promotion

When a confirmed booking is cancelled, the database can promote the first eligible waitlisted booking to `Confirmed`.

This allows an available seat to be automatically given to the next attendee waiting for the event.

### Booking Protection

Important booking information cannot be changed after the booking has been created.

Normal attendee updates are restricted so that attendees cannot manually change themselves from Waitlisted to Confirmed or modify the event associated with their booking.

### Event Overlap Prevention

The database prevents two events from occupying the same venue when their scheduled times overlap.

This protects against venue scheduling conflicts.

### Venue Capacity Validation

An event cannot be created with a capacity greater than the capacity of its selected venue.

This ensures that the number of available event seats remains consistent with the physical venue.

### Attendance Validation

Attendance can only be recorded for a Confirmed booking.

The database also verifies that the organizer recording attendance has actually been assigned to the corresponding event.

---

## Relationship Summary

`users` represents the common application identity and connects the application profile to Supabase Authentication.

`attendee`, `coordinator`, and `organizer` represent the roles a user can perform within the system.

`venues` represents the physical locations used by events.

`events` represents scheduled activities created by coordinators.

`bookings` connects attendees with the events they want to attend.

`organizer_assignments` connects organizers with the events they are responsible for.

`attendance_logs` records attendance for confirmed bookings and identifies the organizer responsible for the attendance action.

Together, these relationships provide the database structure required to manage events, capacity, waitlists, organizer responsibilities, and attendance while controlling access through Row Level Security.