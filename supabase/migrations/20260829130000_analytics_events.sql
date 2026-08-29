-- First-party analytics.
--
-- PLAN.md step 3.3, and it lands before any page ships for one reason: events
-- not collected cannot be recovered. There is no back-fill for a question you
-- did not think to ask in August.
--
-- v1's analytics schema was the best thing in that repo and most of it is
-- carried over — in particular the event registry enforced as a database
-- constraint, so a broken collector cannot quietly persist arbitrary or
-- identifying keys. Three things change. They are marked DIFFERENT FROM v1.
--
-- The question this table exists to answer, from the week the traffic died:
--   WHICH PAGE TYPE IS DECAYING?
-- That is why page_type is on every single event.

begin;

/* ---------------------------------------------------------------------------
 * raw events
 * ------------------------------------------------------------------------- */

create table public.analytics_events (
  id             uuid primary key default gen_random_uuid(),
  received_at    timestamptz not null default now(),
  occurred_at    timestamptz not null,

  event_name     text not null,
  schema_version smallint not null default 1,

  -- DIFFERENT FROM v1 (1/3): there is no persistent visitor identifier.
  --
  -- v1 carried an `anonymous_id uuid` — a browser-stored id that survives
  -- across days — plus a table linking it to newsletter subscribers. That is a
  -- persistent per-person identifier, which is exactly what triggers consent
  -- under ePrivacy and what makes "we don't track you" untrue.
  --
  -- All that remains is a daily hash: HMAC(ip + user agent, salt), where the
  -- salt rotates every day. It counts a visitor within one day and is useless
  -- the next, which is the whole point.
  --
  -- The cost is real and accepted: no cross-day funnels, no returning-visitor
  -- rate. STACK.md §Analytics takes that trade deliberately.
  visitor_day_hash text not null,

  -- Joins the events of one page view together (a search and the click that
  -- followed it). Generated per request, never stored anywhere else.
  page_view_id   uuid,

  locale         text,
  page_type      text,
  path           text,

  -- No foreign key, deliberately. Events are immutable observations: deleting
  -- a market must not rewrite the history of what people did.
  market_id      uuid,
  city_slug      text,
  region_slug    text,

  referrer_host  text,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  device_class   text,
  country        char(2),

  props          jsonb not null default '{}'::jsonb,

  constraint analytics_events_timestamps_finite
    check (isfinite(received_at) and isfinite(occurred_at)),

  constraint analytics_events_schema_version_check check (schema_version = 1),

  -- The event registry. Adding an event means changing this list, which means
  -- a reviewed migration — not a collector deploy.
  constraint analytics_events_event_name_check check (
    event_name = any (array[
      'page_view',
      'search',
      -- DIFFERENT FROM v1 (2/3): no_results is its own event, not a search
      -- with results_count = 0. STACK.md calls it "the most valuable and most
      -- commonly forgotten" event, and it is forgotten precisely because it
      -- hides inside another one. A separate name cannot be missed in a query.
      'no_results',
      'filter_changed',
      'market_click',
      'outbound_click',
      'calendar_add',
      'market_save',
      'newsletter_form_view',
      'newsletter_submit',
      'organiser_contact',
      'report_open'
    ])
  ),

  -- sha256 hex, same representation the collector produces.
  constraint analytics_events_visitor_day_hash_check
    check (visitor_day_hash ~ '^[0-9a-f]{64}$'),

  -- A locale exists when its content exists (ARCHITECTURE.md). Today that is
  -- German only; widening this list is a decision, not a config change.
  constraint analytics_events_locale_check
    check (locale is null or locale = any (array['de'])),

  -- Our four indexable page types, plus the non-indexed surfaces. If a value
  -- here ever needs adding, that is a page-type decision and belongs in
  -- ARCHITECTURE.md first.
  constraint analytics_events_page_type_check check (
    page_type is null or page_type = any (array[
      'home', 'city', 'region', 'market', 'filter', 'organiser', 'other'
    ])
  ),

  -- Paths only, never query strings: a query string is where personal data
  -- ends up by accident.
  constraint analytics_events_path_check check (
    path is null or (
      char_length(path) between 1 and 2048
      and left(path, 1) = '/'
      and path !~ '[[:cntrl:]]'
      and position('?' in path) = 0
      and position('#' in path) = 0
    )
  ),

  constraint analytics_events_city_slug_check check (
    city_slug is null or city_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint analytics_events_region_slug_check check (
    region_slug is null or region_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint analytics_events_referrer_host_check check (
    referrer_host is null or (
      char_length(referrer_host) between 1 and 253
      and referrer_host = lower(btrim(referrer_host))
      and referrer_host ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$'
    )
  ),
  constraint analytics_events_device_class_check check (
    device_class is null or device_class = any (array['mobile', 'tablet', 'desktop', 'other'])
  ),
  constraint analytics_events_country_check check (
    country is null or country ~ '^[A-Z]{2}$'
  ),
  constraint analytics_events_props_object_check check (
    jsonb_typeof(props) = 'object' and octet_length(props::text) <= 2048
  )
);

comment on table public.analytics_events is
  'First-party events, collected server-side at the edge. No cookies, no localStorage id, no cross-site tracking, no raw IP. Raw rows are deleted after the retention window; the daily rollup keeps the trend forever.';

comment on column public.analytics_events.page_type is
  'On every event, deliberately. This is the column that answers "which page type is decaying" — the question v1 could not answer during its collapse.';

/* ---------------------------------------------------------------------------
 * the event registry, enforced
 *
 * v1's best idea, carried over intact: each event may carry exactly the keys
 * it declares and nothing else. A collector regression cannot quietly start
 * persisting a session token or an email address, because the database will
 * refuse the row.
 * ------------------------------------------------------------------------- */

-- A free-text search term is the one field a person can type an email address
-- or a phone number into. Refuse both shapes outright.
create or replace function public.analytics_term_is_clean(p_term text)
  returns boolean
  language sql
  immutable
as $$
  select p_term is not null
     and char_length(p_term) between 1 and 200
     and char_length(btrim(p_term)) >= 1
     and p_term !~ '[[:cntrl:]]'
     and p_term !~* '[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+'
     and p_term !~ '(^|[^0-9])([+]|00)?[0-9]([[:space:]()./-]*[0-9]){8,}([^0-9]|$)'
$$;

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
      and props ->> 'placement' = any (array['home', 'city', 'region', 'market'])

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

create index analytics_events_occurred_at_idx on public.analytics_events (occurred_at desc);
create index analytics_events_page_type_idx on public.analytics_events (page_type, occurred_at desc);
create index analytics_events_name_idx on public.analytics_events (event_name, occurred_at desc);
create index analytics_events_market_idx on public.analytics_events (market_id, occurred_at desc)
  where market_id is not null;

/* ---------------------------------------------------------------------------
 * daily rollup
 *
 * DIFFERENT FROM v1 (3/3): v1 monitored storage and never pruned anything. It
 * had a view called analytics_storage_status whose own comment admitted "this
 * monitors storage only; it does not prune or enforce retention".
 *
 * Keeping raw events forever is the easy default and the wrong one: it is the
 * position hardest to defend and the least useful, because trends live in
 * aggregates. So the rollup is permanent and the raw rows are not.
 * ------------------------------------------------------------------------- */

create table public.analytics_daily (
  day          date not null,
  page_type    text,
  event_name   text not null,
  events       bigint not null,
  visitors     bigint not null,   -- distinct visitor_day_hash, so distinct people that day
  primary key (day, page_type, event_name)
);

comment on table public.analytics_daily is
  'Permanent aggregates. No identifiers, nothing per-person. This is what survives the retention window and what the decay alert reads.';

create or replace function public.analytics_rollup(p_day date default (current_date - 1))
  returns integer
  language plpgsql
  set search_path = public, pg_catalog
as $$
declare
  written integer;
begin
  insert into public.analytics_daily (day, page_type, event_name, events, visitors)
  select
    p_day,
    e.page_type,
    e.event_name,
    count(*),
    count(distinct e.visitor_day_hash)
  from public.analytics_events e
  where e.occurred_at >= p_day::timestamptz
    and e.occurred_at < (p_day + 1)::timestamptz
  group by e.page_type, e.event_name
  on conflict (day, page_type, event_name) do update
    set events = excluded.events,
        visitors = excluded.visitors;

  get diagnostics written = row_count;
  return written;
end
$$;

/**
 * Delete raw events past the retention window.
 *
 * Refuses to run for any day that has not been rolled up yet — deleting raw
 * rows that were never aggregated destroys the record silently, and a cron job
 * that outruns the rollup is exactly how that happens.
 */
create or replace function public.analytics_prune(p_retain_days integer default 90)
  returns integer
  language plpgsql
  set search_path = public, pg_catalog
as $$
declare
  cutoff date := current_date - p_retain_days;
  unrolled date;
  removed integer;
begin
  select min(e.occurred_at::date) into unrolled
  from public.analytics_events e
  where e.occurred_at < cutoff::timestamptz
    and not exists (
      select 1 from public.analytics_daily d where d.day = e.occurred_at::date
    );

  if unrolled is not null then
    raise exception
      'refusing to prune: % has raw events that were never rolled up. Run analytics_rollup for it first.',
      unrolled
      using errcode = 'raise_exception';
  end if;

  delete from public.analytics_events where occurred_at < cutoff::timestamptz;
  get diagnostics removed = row_count;
  return removed;
end
$$;

/* ---------------------------------------------------------------------------
 * Search Console
 *
 * STACK.md calls this the more important half: v1's collapse was visible in
 * impressions before it was visible anywhere else, and owning the history
 * means never being unable to answer a basic question mid-crisis.
 * ------------------------------------------------------------------------- */

create table public.search_console_daily (
  day         date not null,
  page        text not null,
  query       text not null default '',
  page_type   text,
  clicks      integer not null default 0,
  impressions integer not null default 0,
  position    numeric(6, 2),
  imported_at timestamptz not null default now(),
  primary key (day, page, query)
);

create index search_console_daily_page_type_idx
  on public.search_console_daily (page_type, day desc);

comment on table public.search_console_daily is
  'Weekly pull from the GSC API, kept forever. page_type is derived on import so the decay question can be asked per page type, which is the shape v1 needed and did not have.';

/* ---------------------------------------------------------------------------
 * the decay alert
 *
 * One view, aimed at one failure: a page type quietly losing impressions.
 * Compares the last 7 days against the 7 before, per page type.
 * ------------------------------------------------------------------------- */

create or replace view public.search_console_weekly_change as
  with recent as (
    select page_type,
           sum(clicks) as clicks,
           sum(impressions) as impressions
    from public.search_console_daily
    where day > current_date - 7
    group by page_type
  ),
  prior as (
    select page_type,
           sum(clicks) as clicks,
           sum(impressions) as impressions
    from public.search_console_daily
    where day <= current_date - 7 and day > current_date - 14
    group by page_type
  )
  select
    coalesce(r.page_type, p.page_type) as page_type,
    coalesce(r.clicks, 0)              as clicks_this_week,
    coalesce(p.clicks, 0)              as clicks_last_week,
    coalesce(r.impressions, 0)         as impressions_this_week,
    coalesce(p.impressions, 0)         as impressions_last_week,
    case
      when coalesce(p.impressions, 0) = 0 then null
      else round(
        (coalesce(r.impressions, 0) - p.impressions)::numeric / p.impressions * 100, 1
      )
    end as impressions_change_pct
  from recent r
  full outer join prior p on p.page_type = r.page_type;

/* ---------------------------------------------------------------------------
 * row level security
 *
 * Deliberately no policies. Only the service role, which bypasses RLS, may
 * touch any of this — the collector writes with it, Metabase reads with it.
 * Defence in depth against the Supabase Data API ever being pointed here.
 * ------------------------------------------------------------------------- */

do $$
declare
  t text;
begin
  foreach t in array array['analytics_events', 'analytics_daily', 'search_console_daily'] loop
    execute format('alter table public.%I enable row level security', t);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on public.%I from anon', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on public.%I from authenticated', t);
    end if;
  end loop;
end
$$;

commit;
