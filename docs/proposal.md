# Project Proposal: AUK Campus Event & Workshop Attendance Tracking

**1. The client, and how you reach them** 

American University of Kuwait (AUK). Our contact is Dr. Seyed Ebrahim Esmaeili, Associate Professor at AUK. Dr. Seyed is the father of one of our team members, which gave us direct personal access to him. Our teammate met with him to discuss event coordination challenges across campus; he agreed to regular bi-weekly review meetings, committed to answering questions through the end of the semester, and agreed to review the working prototype before the final project submission. 

**2. What happens today, and what goes wrong** 

Throughout each semester, AUK hosts a variety of on-campus gatherings: student theatre productions and plays in the auditorium, hands-on faculty workshops in computer labs, and guest speaker seminars. Each event type has a hard physical room capacity (auditorium seating limits, computer lab desks, or lecture hall occupancy). 

1. The organizing committee posts event announcements on campus message boards and social channels with a generic web form link. 
2. The form does not close when venue capacity is reached; high-demand plays and guest seminars routinely collect 80 to 120 sign-ups for halls with 50 to 60 seats. 
3. Event staff manually sort spreadsheets by submission time and attempt to email confirmation lists to attendees. 
4. On the day of the event, organizers print paper rosters and manually cross off attendee names at the entrance door. 
5. After the event, staff manually count paper sign-ins to report turnout numbers to the administration. 

What goes wrong: For popular auditorium plays and major seminars, uncontrolled sign-ups result in severe overcrowding, forcing organizers to turn away 20 to 30 frustrated students at the door on peak event nights. Conversely, for technical workshops, an average of 7 to 10 confirmed students fail to show up without cancelling, leaving seats empty while interested students were turned away. Manually reconciling paper check-in sheets and generating attendance counts takes staff 3 to 5 hours after every major event. 

**3. Who is better off, and how you would know** 

Dr. Seyed, event organizing committees, and attending students. Organizers regain roughly 15 to 20 hours per month spent managing spreadsheets and paper rosters, while venue capacities are strictly enforced to avoid overcrowding. 

We will measure success using two figures produced directly by the system: 
* Overcapacity rejections at the venue door (falls to zero due to strict booking caps). 
* Time required to compile a final event attendance report (reduced from several hours to under 2 minutes). 

**4. What the system does, in outline** 

* An attendee (student or staff) browses upcoming campus events by category (plays, workshops, seminars) and reserves a seat. 
* The system refuses additional bookings once the venue capacity is reached and places the attendee on an automated waitlist. 
* An attendee cancels an existing booking, which automatically promotes the next person on the waitlist to a confirmed seat. 
* An event organizer views the live roster at the venue entrance and marks attendees present as they arrive. 
* The system alerts the organizer against admitting walk-ins when all confirmed seats are already accounted for. 
* A coordinator creates new events (setting title, event type, venue, date, and seat limit) and downloads the final turnout report. 

**5. What it records** 

Events (title, event type: play, workshop, or seminar, venue location, date/time, seat capacity). Attendees (name, university ID, email). Bookings (attendee ID, event ID, booking status: confirmed, waitlisted, or cancelled). Attendance Logs (booking ID, check-in timestamp, marked present by which organizer). 

The system exists to answer the operational question: *"Has this venue reached its physical capacity limit, and did this specific registered attendee show up?"* That question cannot be answered without persistent records across past events and days. 

**6. In scope by the final week — and what is not** 

In scope: 
* One university campus (AUK). 
* Three event categories: plays, workshops, and seminars. 
* Real-time seat reservation with hard capacity enforcement. 
* Automated first-come, first-served waitlist advancement on cancellation. 
* Day-of-event check-in interface for door organizers. 
* Turnout and attendance summary export. 
* Three user roles: Attendee, Organizer, and Coordinator. 

Not in scope this semester: 
* Paid ticketing or payment gateway integration (all events are assumed free admission). 
* Assigned interactive seat-map selection (general admission within venue capacity only). 
* Integration with AUK’s central Banner SIS or institutional Single Sign-On (SSO). 
* Automated SMS messaging (notifications remain on-screen and via email). 
* Multi-day recurring festival itineraries. 

**7. The next life** 

Other higher education institutions in Kuwait (such as Kuwait University, GUST, and AUM) and independent cultural societies manage campus theatre productions, academic seminars, and training sessions using the exact same fragmented Google Forms and paper rosters. The capacity-capping and waitlist logic can be adopted directly by any campus student activities office. 

**8. What you told the client this is** 

During our initial meeting, we explicitly told Dr. Seyed that this is a coursework prototype built by students, that it will be hosted publicly at a public web address, and that it will be completely unsupported after the final week of the semester. Dr. Seyed acknowledged these conditions and confirmed that all system testing will use synthetic attendee data.
