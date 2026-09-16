-- Analytics vocabulary: three gaps the first ten days of data showed, and one
-- piece of dead schema.
--
-- 1. page_type gains `utility` and `country`. The report, newsletter, saved and
--    legal pages were the third-busiest thing on the site and all landed in
--    `other` together, so "how many people opened the report form" could not
--    be asked. `country` is the page type ARCHITECTURE.md already names and
--    the Germany launch builds; adding the word now is one migration, not two.
--
-- 2. newsletter_form_view.placement names the FORM, not the page. It was
--    `home|city|region|market`, which is what page_type already says on every
--    row, and it is why the event was never emitted. Now `card` (the block at
--    the foot of a listing page), `footer` (the site footer, on every page) or
--    `page` (the /newsletter/ page itself).
--
-- 3. organiser_contact keeps `view|start|submit` — the shape was right, it had
--    no emitter. The browser sends it now; nothing to change here.
--
-- 4. analytics_daily and analytics_rollup() are dropped. The rollup was a speed
--    layer written before there was data, called by nothing, and the raw table
--    is ~100 rows a day — Metabase reads it directly for years to come. A
--    function in the schema that looks like a feature and is not is worse than
--    no function. If reads get slow, bring back an aggregate as its own
--    migration, on evidence.

begin;

alter table public.analytics_events
  drop constraint analytics_events_page_type_check;

alter table public.analytics_events
  add constraint analytics_events_page_type_check check (
    page_type is null or page_type = any (array[
      'home', 'country', 'city', 'region', 'market', 'filter', 'organiser', 'utility', 'other'
    ])
  );

comment on column public.analytics_events.page_type is
  'home | country | city | region | market | filter (the radius view) | organiser | utility (forms, saved, legal, about) | other. On every row so any question can be asked per page type.';

-- The props check is one big CASE over event_name; the only way to change one
-- branch is to restate it. Copied verbatim from 20260829130000 with the
-- newsletter_form_view branch changed.
alter table public.analytics_events
  drop constraint analytics_events_props_shape_check;

alter table public.analytics_events add constraint analytics_events_props_shape_check check (
  coalesce(case event_name

    when 'page_view' then props = '{}'::jsonb

    when 'search' then
      props ?& array['term', 'results_count']
      and props - array['term', 'results_count']::text[] = '{}'::jsonb
      and jsonb_typeof(props -> 'term') = 'string'
      and public.analytics_term_is_clean(props ->> 'term')
      and jsonb_typeof(props -> 'results_count') = 'number'

    when 'no_results' then
      props ? 'term'
      and props - array['term', 'filters']::text[] = '{}'::jsonb
      and jsonb_typeof(props -> 'term') = 'string'
      and public.analytics_term_is_clean(props ->> 'term')
      and (not props ? 'filters' or jsonb_typeof(props -> 'filters') = 'object')

    when 'filter_changed' then
      props ?& array['filter', 'value']
      and props - array['filter', 'value']::text[] = '{}'::jsonb
      -- The filters the product actually has (ARCHITECTURE.md: filters, not URLs).
      and props ->> 'filter' = any (array['zeit', 'typ', 'tag', 'umkreis', 'ort'])
      and jsonb_typeof(props -> 'value') = 'string'
      and char_length(props ->> 'value') between 1 and 256
      and props ->> 'value' !~ '[[:cntrl:]]'

    when 'market_click' then
      props ?& array['position', 'surface']
      and props - array['position', 'surface']::text[] = '{}'::jsonb
      and jsonb_typeof(props -> 'position') = 'number'
      and props ->> 'surface' = any (array['weekend_rail', 'list', 'search', 'map', 'nearby'])

    when 'outbound_click' then
      props ?& array['click_type', 'destination_host']
      and props - array['click_type', 'destination_host']::text[] = '{}'::jsonb
      and props ->> 'click_type' = any (array['maps', 'organiser_website', 'calendar'])
      and props ->> 'destination_host' = lower(btrim(props ->> 'destination_host'))
      and props ->> 'destination_host' ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$'

    when 'calendar_add' then
      props ? 'method'
      and props - 'method' = '{}'::jsonb
      and props ->> 'method' = any (array['ics', 'google'])

    when 'market_save' then
      props ? 'action'
      and props - 'action' = '{}'::jsonb
      and props ->> 'action' = any (array['add', 'remove'])

    when 'newsletter_form_view' then
      props ? 'placement'
      and props - 'placement' = '{}'::jsonb
      and props ->> 'placement' = any (array['card', 'footer', 'page'])

    when 'newsletter_submit' then
      props ? 'outcome'
      and props - 'outcome' = '{}'::jsonb
      and props ->> 'outcome' = any (array['ok', 'validation_error', 'server_error'])

    when 'organiser_contact' then
      props ? 'step'
      and props - 'step' = '{}'::jsonb
      and props ->> 'step' = any (array['view', 'start', 'submit'])

    when 'report_open' then
      props ? 'kind'
      and props - 'kind' = '{}'::jsonb
      and props ->> 'kind' = any (array['correction', 'cancellation', 'organiser'])

    else false
  end, false)
);

drop function if exists public.analytics_rollup(date);
drop table if exists public.analytics_daily;

commit;
