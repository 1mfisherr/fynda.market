-- Analytics v2: everything the edge and the browser can know, kept.
--
-- Decided by Delfim 2026-09-17: track everything we can, first-party, and keep
-- it. Three gaps closed here, the rest is columns:
--
--   * Time on page and scroll depth did not exist. `page_leave` is one row per
--     page view, sent when the tab is hidden or closed: how long the page was
--     actually in front of someone, how far they scrolled, which sections
--     they saw.
--   * Robots were dropped at the door. `crawler_hits` keeps them, in their own
--     table so visitor numbers stay clean: which robot, which role (an AI
--     training crawler, a search-index crawler, a fetch a human triggered by
--     asking an assistant about a page), which page.
--   * Page views carried no market id. The page now says which market, town
--     and canton it is about in three meta tags; the edge reads them.
--
-- Everything is nullable, so old rows are untouched and a client that sends
-- nothing new still writes a row.

begin;

-- ---------------------------------------------------------------------------
-- 1. What the edge learns on every request
-- ---------------------------------------------------------------------------
alter table public.analytics_events
  add column if not exists browser_lang    char(2),      -- first Accept-Language tag: what the browser speaks
  add column if not exists city            text,         -- Cloudflare's guess from the connection; a town, never a street
  add column if not exists region_code     text,         -- ISO 3166-2 subdivision, e.g. ZH
  add column if not exists timezone        text,
  add column if not exists asn             integer,      -- the network the request came from
  add column if not exists as_org          text,
  add column if not exists rtt_ms          integer,      -- TCP round trip: a proxy for connection quality
  add column if not exists http_protocol   text,
  add column if not exists is_eu           boolean,
  add column if not exists viewport_w      smallint,     -- browser width in CSS px, from the client
  add column if not exists days_until_date smallint,     -- market pages: days from this view to the next date
  add column if not exists status          smallint,     -- HTTP status of the page view; 404 is its own event too
  add column if not exists prev_path       text;         -- the previous page on our own site, when the referrer was us

alter table public.analytics_events
  add constraint analytics_events_browser_lang_check check (browser_lang is null or browser_lang ~ '^[a-z]{2}$'),
  add constraint analytics_events_city_check check (city is null or char_length(city) between 1 and 120),
  add constraint analytics_events_region_code_check check (region_code is null or region_code ~ '^[A-Z0-9]{1,6}$'),
  add constraint analytics_events_timezone_check check (timezone is null or timezone ~ '^[A-Za-z_/+-]{1,64}$'),
  add constraint analytics_events_as_org_check check (as_org is null or char_length(as_org) between 1 and 200),
  add constraint analytics_events_rtt_check check (rtt_ms is null or rtt_ms between 0 and 60000),
  add constraint analytics_events_viewport_check check (viewport_w is null or viewport_w between 100 and 10000),
  add constraint analytics_events_days_until_check check (days_until_date is null or days_until_date between -1 and 400),
  add constraint analytics_events_status_check check (status is null or status between 100 and 599),
  add constraint analytics_events_prev_path_check check (
    prev_path is null or (char_length(prev_path) between 1 and 2048 and left(prev_path, 1) = '/' and position('?' in prev_path) = 0)
  );

-- ---------------------------------------------------------------------------
-- 2. The event registry grows
-- ---------------------------------------------------------------------------
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
    'language_switch'        -- the language links in the header
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

    else false
  end, false)
);

-- ---------------------------------------------------------------------------
-- 3. Robots, kept apart
-- ---------------------------------------------------------------------------
create table public.crawler_hits (
  id            uuid primary key default gen_random_uuid(),
  occurred_at   timestamptz not null default now(),
  -- The robot's name as its user agent gives it (GPTBot, ClaudeBot,
  -- Googlebot…); `unnamed` when only the network or the missing headers gave
  -- it away.
  bot_name      text not null,
  -- training: reads pages to train a model. search: builds an index
  -- (Googlebot, OAI-SearchBot, PerplexityBot). user: a human asked an AI about
  -- this page and it fetched it right now (ChatGPT-User, Claude-User).
  -- seo / social / other: the rest.
  bot_role      text not null,
  -- Why the edge called it a robot: ua | no_language | no_sec_fetch | datacentre.
  reason        text not null,
  user_agent    text,
  asn           integer,
  as_org        text,
  country       char(2),
  path          text not null,
  page_type     text,
  locale        text,
  market_id     uuid,
  status        smallint,
  -- Cloudflare's own word for it when it has one (search_engine, ai_crawler…).
  verified_category text,
  constraint crawler_hits_role_check check (bot_role = any (array['training', 'search', 'user', 'seo', 'social', 'monitor', 'other'])),
  constraint crawler_hits_reason_check check (reason = any (array['ua', 'no_language', 'no_sec_fetch', 'datacentre'])),
  constraint crawler_hits_bot_name_check check (char_length(bot_name) between 1 and 80),
  constraint crawler_hits_ua_check check (user_agent is null or char_length(user_agent) <= 512),
  constraint crawler_hits_path_check check (char_length(path) between 1 and 2048 and left(path, 1) = '/' and position('?' in path) = 0),
  constraint crawler_hits_country_check check (country is null or country ~ '^[A-Z]{2}$')
);

comment on table public.crawler_hits is
  'Every request the edge decided was a robot, since 2026-09-17. No person is in here. bot_role = user is a human asking an AI assistant about that page.';

create index crawler_hits_occurred_at_idx on public.crawler_hits (occurred_at);
create index crawler_hits_bot_idx on public.crawler_hits (bot_name, occurred_at);

alter table public.crawler_hits enable row level security;
grant insert on public.crawler_hits to service_role;
grant select on public.crawler_hits to metabase_ro;

-- ---------------------------------------------------------------------------
-- 4. The views dashboards read
-- ---------------------------------------------------------------------------
-- e.* was frozen when the view was created; it has to be made again to show
-- the new columns.
drop view public.analytics_events_classified;
create view public.analytics_events_classified as
select e.*, coalesce(v.bot_likely, false) as bot_likely
from public.analytics_events e
left join public.analytics_visitor_days v
  on v.visitor_day_hash = e.visitor_day_hash and v.day = e.occurred_at::date;
comment on view public.analytics_events_classified is
  'analytics_events plus bot_likely from analytics_visitor_days. What dashboards read.';
grant select on public.analytics_events_classified to metabase_ro;

-- A sitting, without a cookie: the same visitor's page views with no gap
-- longer than 30 minutes. The standard cookieless definition.
create view public.analytics_sessions as
with pv as (
  select visitor_day_hash, occurred_at, path, page_type, locale, device_class, country, referrer_host, bot_likely,
         case when occurred_at - lag(occurred_at) over (partition by visitor_day_hash order by occurred_at) > interval '30 minutes'
                or lag(occurred_at) over (partition by visitor_day_hash order by occurred_at) is null
              then 1 else 0 end as starts
  from public.analytics_events_classified
  where event_name = 'page_view'
),
numbered as (
  select *, sum(starts) over (partition by visitor_day_hash order by occurred_at) as n from pv
)
select
  visitor_day_hash,
  n as session_n,
  min(occurred_at)                        as started_at,
  max(occurred_at)                        as ended_at,
  count(*)                                as page_views,
  count(*) = 1                            as bounced,
  (array_agg(path order by occurred_at))[1]  as landing_path,
  (array_agg(page_type order by occurred_at))[1] as landing_page_type,
  (array_agg(path order by occurred_at desc))[1] as exit_path,
  min(locale)                             as locale,
  min(device_class)                       as device_class,
  min(country)                            as country,
  min(referrer_host)                      as referrer_host,
  bool_or(bot_likely)                     as bot_likely
from numbered
group by visitor_day_hash, n;
comment on view public.analytics_sessions is
  'One row per sitting: the same visitor with no 30-minute gap. bounced = one page only.';
grant select on public.analytics_sessions to metabase_ro;

-- One row per page_leave, flattened: what engagement dashboards read.
create view public.analytics_engagement as
select
  occurred_at, visitor_day_hash, session_id, page_view_id, locale, page_type, path, market_id, city_slug, region_slug,
  device_class, country, viewport_w, bot_likely,
  (props ->> 'active_ms')::int        as active_ms,
  (props ->> 'max_scroll_pct')::int   as max_scroll_pct,
  props -> 'sections'                 as sections
from public.analytics_events_classified
where event_name = 'page_leave';
comment on view public.analytics_engagement is
  'page_leave rows flattened: time the page was visible, scroll depth, sections seen.';
grant select on public.analytics_engagement to metabase_ro;

commit;
