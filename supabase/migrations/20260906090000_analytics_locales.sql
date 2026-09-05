-- Analytics accepts the locales the site actually publishes.
--
-- The original check allowed 'de' alone, with the note that widening it is a
-- decision rather than a config change. The decision was made and shipped: the
-- site has served de, fr, it and en since launch, in complete hreflang
-- clusters, and ARCHITECTURE.md §Locales records it.
--
-- Left as it was, the first event from a French page would have been rejected
-- by the constraint — silently, from the visitor's side — and three quarters of
-- the site would have looked like it had no traffic at all. Nothing has been
-- collected yet, so there is no bad data to repair; this only has to land
-- before the collector does.

begin;

alter table public.analytics_events
  drop constraint analytics_events_locale_check;

alter table public.analytics_events
  add constraint analytics_events_locale_check
    check (locale is null or locale = any (array['de', 'fr', 'it', 'en']));

commit;
