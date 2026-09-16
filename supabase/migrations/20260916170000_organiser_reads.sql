-- The answer Function (functions/a) names the market and the town in the
-- organiser's language on the page it shows after a button press. Those names
-- live in texts, reached through venues and cities. Read-only.
begin;
grant select on public.texts, public.venues, public.cities to service_role;
commit;
