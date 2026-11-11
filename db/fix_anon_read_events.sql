-- Fix: Allow anonymous (unauthenticated) users to read events and venues.
--
-- PostgREST evaluates RLS on every table in a join. The events page calls
-- loadEvents() before auth.getSession() resolves, so the first request goes
-- out as the 'anon' role.  Without SELECT policies for anon on both tables
-- the join fails and "Unable to load events" appears for every user.
--
-- Venue names and event titles are public information — there is no
-- confidentiality reason to hide them from unauthenticated visitors.

DROP POLICY IF EXISTS "Anyone reads events" ON public.events;
CREATE POLICY "Anyone reads events"
ON public.events
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "Anyone reads venues" ON public.venues;
CREATE POLICY "Anyone reads venues"
ON public.venues
FOR SELECT TO anon
USING (true);

