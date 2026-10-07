# Database Schema

The database supports AUK's event and workshop process from event creation and seat reservation to organizer assignment and attendance.

## What a row means

- **`users`** — one person who has an account in the AUK event system.
- **`attendee`** — one user who may attend events as a student, staff/faculty member, or guest.
- **`coordinator`** — one user who is responsible for creating and managing AUK events.
- **`organizer`** — one user who may be assigned to help operate an event.
- **`venues`** — one physical AUK location in which an event may take place.
- **`events`** — one scheduled AUK event or workshop managed by a coordinator at a venue.
- **`bookings`** — one attendee's reservation for one event, including whether the seat is confirmed, waitlisted, or cancelled.
- **`organizer_assignments`** — one assignment of an organizer to an event they are responsible for.
- **`attendance_logs`** — one attendance record for an attendee's confirmed event booking.

## Relationships

- A `users` record may be extended by an `attendee`, `coordinator`, or `organizer` role.
- A coordinator may manage many events; each event has one coordinator.
- A venue may host many events; each event uses one venue.
- An attendee may make many bookings; each booking belongs to one attendee and one event.
- Events and organizers have a many-to-many relationship through `organizer_assignments`.
- A confirmed booking may have one attendance log, recorded by an organizer assigned to that event.

## Access policies

- **Users:** a user reads and updates their own profile; coordinators and organizers may read profiles when needed to operate events.
- **Attendees:** an attendee reads their own attendee record; coordinators and organizers may read attendee information for registration and attendance work.
- **Coordinators:** coordinators read their own role information and manage coordinator records because they administer the event process.
- **Organizers:** organizers read their own role information; coordinators manage organizer records because coordinators assign event staff.
- **Venues:** authenticated users read venues to see event locations; coordinators write venue records because they manage event setup.
- **Events:** authenticated users read events so they can browse them; only the coordinator responsible for an event creates or changes it.
- **Bookings:** attendees read and write their own reservations; the event coordinator and assigned organizers may read them to manage capacity and event operations.
- **Organizer assignments:** assigned organizers and the event coordinator may read assignments; only the event's coordinator adds or removes assignments.
- **Attendance logs:** attendees may read their own attendance, while assigned organizers and the event coordinator may read it; only an assigned organizer may record or update attendance for a confirmed booking.

Row Level Security is enabled on every application table so these rules are enforced by the database rather than only by the web interface.