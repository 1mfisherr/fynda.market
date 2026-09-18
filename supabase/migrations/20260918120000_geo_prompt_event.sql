-- The near-me page asks the phone for a location, on a tap and never on load
-- (docs/specs/near-me.md). This is the one event that says how that goes, so
-- the allow rate can be read after four weeks: a `requested` row per tap,
-- then `granted` or `denied` with the reason.
--
-- Both constraints are the whole list again, not a patch: a check constraint
-- cannot be altered in place, and a copy that can be read top to bottom is
-- worth more than a diff against 20260917120000_analytics_v2.sql.

alter table public.analytics_events drop constraint analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (
  event_name = any (array[
    'page_view', 'search', 'no_results', 'filter_changed', 'market_click',
    'outbound_click', 'calendar_add', 'market_save', 'newsletter_form_view',
    'newsletter_submit', 'organiser_contact', 'report_open',
    -- since 2026-09-17
    'page_leave',            -- the page was hidden or closed: time, scroll, sections
    'web_vitals',            -- LCP / INP / CLS / TTFB as the visitor experienced them
    'js_error',              -- a script broke on someone's device
    'not_found',             -- a 404, with where the link came from
    'newsletter_form_start', -- first focus in the signup form
    'rage_click',            -- three clicks in a second on the same spot
    'dead_click',            -- a click on something that does nothing
    'language_switch',       -- the language links in the header
    -- since 2026-09-18
    'geo_prompt'             -- the visitor asked for a location: requested, granted or denied
  ])
);

alter table public.analytics_events drop constraint analytics_events_props_shape_check;
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
      -- `maps` is what the client sent until 2026-09-17; `directions` since.
      and props ->> 'click_type' = any (array['maps', 'directions', 'organiser_website', 'website', 'phone', 'social', 'calendar', 'other'])
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

    when 'newsletter_form_start' then
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

    -- active_ms: time the tab was visible; max_scroll_pct 0–100; sections: the
    -- ids of the page sections that were on screen, in order seen.
    when 'page_leave' then
      props ?& array['active_ms', 'max_scroll_pct']
      and props - array['active_ms', 'max_scroll_pct', 'sections']::text[] = '{}'::jsonb
      and jsonb_typeof(props -> 'active_ms') = 'number'
      and (props ->> 'active_ms')::numeric between 0 and 86400000
      and jsonb_typeof(props -> 'max_scroll_pct') = 'number'
      and (props ->> 'max_scroll_pct')::numeric between 0 and 100
      and (not props ? 'sections' or jsonb_typeof(props -> 'sections') = 'array')

    -- Milliseconds, except cls which is unitless. Any subset: the browser
    -- reports what it measured.
    when 'web_vitals' then
      props - array['lcp', 'inp', 'cls', 'ttfb', 'fcp']::text[] = '{}'::jsonb
      and props <> '{}'::jsonb
      and (not props ? 'lcp'  or jsonb_typeof(props -> 'lcp')  = 'number')
      and (not props ? 'inp'  or jsonb_typeof(props -> 'inp')  = 'number')
      and (not props ? 'cls'  or jsonb_typeof(props -> 'cls')  = 'number')
      and (not props ? 'ttfb' or jsonb_typeof(props -> 'ttfb') = 'number')
      and (not props ? 'fcp'  or jsonb_typeof(props -> 'fcp')  = 'number')

    when 'js_error' then
      props ? 'message'
      and props - array['message', 'source', 'line']::text[] = '{}'::jsonb
      and jsonb_typeof(props -> 'message') = 'string'
      and char_length(props ->> 'message') between 1 and 300
      and (not props ? 'source' or jsonb_typeof(props -> 'source') = 'string')
      and (not props ? 'line' or jsonb_typeof(props -> 'line') = 'number')

    when 'not_found' then props = '{}'::jsonb

    when 'rage_click' then
      props ? 'selector'
      and props - 'selector' = '{}'::jsonb
      and jsonb_typeof(props -> 'selector') = 'string'
      and char_length(props ->> 'selector') between 1 and 200

    when 'dead_click' then
      props ? 'selector'
      and props - 'selector' = '{}'::jsonb
      and jsonb_typeof(props -> 'selector') = 'string'
      and char_length(props ->> 'selector') between 1 and 200

    when 'language_switch' then
      props ? 'to'
      and props - 'to' = '{}'::jsonb
      and props ->> 'to' = any (array['de', 'fr', 'it', 'en'])

    -- One row per step of the ask: `requested` on the tap, then `granted` or
    -- `denied` (with why: the person said no, the phone took too long, or the
    -- device cannot). granted ÷ requested is the allow rate the near-me
    -- page is judged on (docs/specs/near-me.md).
    when 'geo_prompt' then
      props ? 'outcome'
      and props - array['outcome', 'reason']::text[] = '{}'::jsonb
      and props ->> 'outcome' = any (array['requested', 'granted', 'denied'])
      and (not props ? 'reason' or props ->> 'reason' = any (array['denied', 'timeout', 'unavailable']))

    else false
  end, false)
);
