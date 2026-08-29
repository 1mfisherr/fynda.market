-- Fynda initial schema.
--
-- Implements docs/ARCHITECTURE.md §Data model. Read that first; this file is
-- the mechanism, the doc is the reasoning.
--
-- The rule the whole design defends:
--   A page exists because there is content for it — never because a URL
--   pattern permits it.
--
-- Three things here are load-bearing and expensive to retrofit:
--   1. Multi-country geography from commit one (countries → regions → cities).
--   2. Row-per-locale slugs and texts. A locale exists when its rows exist.
--      v1 had slug_de/slug_fr/slug_it/slug_en NOT NULL on every place, which
--      is how four locales came to feel free. They were not free.
--   3. Per-fact provenance in an append-only ledger, not one timestamp per
--      market. A market's existence stays true for years; this Sunday's date
--      is worth a week.

begin;

/* ---------------------------------------------------------------------------
 * extensions
 *
 * PostGIS is NOT relocatable — once created in a schema it cannot be moved
 * (docs/STACK.md). It goes in `extensions`, and so does everything else, so
 * `public` holds our tables and nothing else.
 * ------------------------------------------------------------------------- */

create schema if not exists extensions;

create extension if not exists postgis   with schema extensions;
create extension if not exists pg_trgm   with schema extensions;
create extension if not exists unaccent  with schema extensions;
create extension if not exists pgcrypto  with schema extensions;

/* ---------------------------------------------------------------------------
 * shared helpers
 * ------------------------------------------------------------------------- */

-- unaccent() is STABLE, so it cannot be used in an index expression directly.
-- This wrapper is the standard workaround: zuerich matches Zürich.
create or replace function public.immutable_unaccent(text)
  returns text
  language sql
  immutable
  parallel safe
  set search_path = extensions, pg_catalog
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

/* ---------------------------------------------------------------------------
 * geography: countries → regions → cities → venues
 *
 * No free-text place names anywhere else in the schema. Every geographic
 * question joins through this tree. v1 carried markets.city and markets.canton
 * as text beside a municipality_id, needed a trigger to police the drift, and
 * still drifted.
 * ------------------------------------------------------------------------- */

create table public.countries (
  id          uuid primary key default gen_random_uuid(),
  iso2        char(2) not null unique,          -- 'CH', 'DE'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint countries_iso2_upper check (iso2 = upper(iso2))
);

comment on table public.countries is
  'One row per country we publish. The country is a real level of the tree with its own slug rows — schweiz/suisse/svizzera is translatable text, not a string hardcoded into a route.';

-- One region level only: the country's official first-level administrative
-- unit. Canton in CH, Bundesland in DE. That is the level with measured search
-- demand (flohmarkt nrw, flohmarkt bayern) and boundaries nobody argues about.
-- v1 also had metro and tourism regions; "Zürich should include Dietikon" is
-- what the radius filter answers, without a page. See ARCHITECTURE.md.
create table public.regions (
  id          uuid primary key default gen_random_uuid(),
  country_id  uuid not null references public.countries (id) on delete restrict,
  code        text not null,                    -- 'ZH', 'NW'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (country_id, code)
);

create table public.cities (
  id          uuid primary key default gen_random_uuid(),
  region_id   uuid not null references public.regions (id) on delete restrict,
  point       extensions.geography(Point, 4326),   -- centroid, for "near me" defaults
  -- Set the first time a published market appears here. A city page's right to
  -- exist is derived from content (see the publishable_cities view), never from
  -- the city existing in an import.
  first_published_market_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index cities_region_id_idx on public.cities (region_id);
create index cities_point_idx on public.cities using gist (point);

-- Geometry lives here, on the small static table. Occurrences are filtered by
-- market and date, never spatially, so the spatially-indexed table never grows.
create table public.venues (
  id              uuid primary key default gen_random_uuid(),
  city_id         uuid not null references public.cities (id) on delete restrict,
  name            text not null,
  address_line    text not null,
  postal_code     text,
  point           extensions.geography(Point, 4326) not null,
  google_place_id text,
  -- Not a default worth guessing per row: a wrong timezone produces a wrong
  -- startDate offset, which invalidates the Event markup.
  timezone        text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index venues_city_id_idx on public.venues (city_id);
create index venues_point_idx on public.venues using gist (point);
create unique index venues_google_place_id_idx
  on public.venues (google_place_id) where google_place_id is not null;

/* ---------------------------------------------------------------------------
 * organisers and markets
 * ------------------------------------------------------------------------- */

create table public.organisers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  -- How this organiser is actually reachable. Mostly amateurs — clubs,
  -- schools, churches, municipalities — so this is rarely a web form.
  channel_type  text check (channel_type in ('email', 'phone', 'whatsapp', 'website', 'post', 'unknown')),
  channel_value text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.markets (
  id            uuid primary key default gen_random_uuid(),
  venue_id      uuid not null references public.venues (id) on delete restrict,
  organiser_id  uuid references public.organisers (id) on delete set null,

  -- Several markets can share one physical hub (one Marktplatz, several named
  -- markets). v1 used a text key matched by convention; this is a real key.
  hub_market_id uuid references public.markets (id) on delete set null,

  slug          text not null unique,
  status        text not null default 'unverified'
                  check (status in ('active', 'unverified', 'permanently_closed')),
  kind          text not null default 'flohmarkt'
                  check (kind in ('flohmarkt', 'hallenflohmarkt', 'nachtflohmarkt',
                                  'kinderflohmarkt', 'troedelmarkt', 'brocante',
                                  'antikmarkt', 'strassenmarkt')),

  -- Recurrence is stored as well as expanded, never instead of. RFC 5545, so
  -- mature libraries handle it. The human phrase is what a page renders when
  -- there are no confirmed dates: "jeden 1. Sonntag, März–Oktober".
  recurrence_rrule text,
  recurrence_text  text,

  entry_fee     numeric(6, 2),
  currency      char(3) check (currency is null or currency = upper(currency)),
  website_url   text,
  image_url     text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint markets_hub_is_not_self check (hub_market_id is distinct from id)
);

create index markets_venue_id_idx on public.markets (venue_id);
create index markets_hub_market_id_idx on public.markets (hub_market_id) where hub_market_id is not null;
create index markets_status_idx on public.markets (status);
create index markets_organiser_id_idx on public.markets (organiser_id) where organiser_id is not null;

-- Personal data lives in its own table so it cannot leak through a permissive
-- read policy on markets. v1's best security decision.
create table public.market_private (
  market_id       uuid primary key references public.markets (id) on delete cascade,
  organiser_email text,
  source_url      text,
  admin_notes     text,
  raw_import      jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

/* ---------------------------------------------------------------------------
 * occurrences
 *
 * Concrete rows, always. `flohmarkt 2.8.26` is a real query shape with 29%
 * click-through, so dates must be queryable and displayable regardless of what
 * sits underneath. Pages render rows, never rules.
 * ------------------------------------------------------------------------- */

create table public.occurrences (
  id                uuid primary key default gen_random_uuid(),
  market_id         uuid not null references public.markets (id) on delete cascade,
  date              date not null,
  start_time        time,
  end_time          time,

  -- Maps 1:1 onto Schema.org eventStatus. Cancelled rows are kept and shown,
  -- with startDate intact — removing the date breaks the markup, and the
  -- cancellation is the most valuable thing on the page.
  status            text not null default 'unverified'
                      check (status in ('confirmed', 'tentative', 'cancelled', 'unverified')),
  -- 'generated' rows came from expanding recurrence_rrule and are subject to
  -- the 120-day horizon below. Human-confirmed rows are not.
  origin            text not null default 'manual'
                      check (origin in ('manual', 'generated', 'organiser', 'import')),

  cancellation_note text,
  confirmed_at      timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (market_id, date)
);

create index occurrences_date_idx on public.occurrences (date);
create index occurrences_market_date_idx on public.occurrences (market_id, date);
create index occurrences_upcoming_idx on public.occurrences (date)
  where status <> 'cancelled';

-- The 120-day horizon, as a trigger rather than a CHECK constraint: the rule
-- compares against today, and a CHECK is only evaluated on write, so it would
-- silently stop meaning what it says as time passed.
--
-- It binds GENERATED rows only. Storage is not the risk, publication is — if
-- an organiser confirms next June's annual market, that is a real verified
-- fact and we keep it. CI enforces the horizon again at the output layer, on
-- whatever actually gets rendered.
--
-- Keep this number in step with occurrenceHorizonDays in guardrails.config.json.
create or replace function public.enforce_generated_occurrence_horizon()
  returns trigger
  language plpgsql
  set search_path = public, pg_catalog
as $$
declare
  horizon_days constant int := 120;
begin
  if new.origin = 'generated' and new.date > current_date + horizon_days then
    raise exception
      'generated occurrence for market % is % days out; the horizon is % days. '
      'Expanding a recurrence rule past the horizon is what produced 8500 URLs '
      'for 157 markets on v1. Confirm the date with a source and set origin to '
      'manual or organiser if it is real.',
      new.market_id, (new.date - current_date), horizon_days
      using errcode = 'check_violation';
  end if;
  return new;
end
$$;

create trigger occurrences_enforce_horizon
  before insert or update of date, origin on public.occurrences
  for each row execute function public.enforce_generated_occurrence_horizon();

-- A hub groups markets at one physical place. If members sat in different
-- cities, one canonical page would render occurrences from two locations with
-- no error at write time. v1 shipped this check after finding the hole.
create or replace function public.check_market_hub_consistency()
  returns trigger
  language plpgsql
  set search_path = public, pg_catalog
as $$
declare
  hub_city_id  uuid;
  self_city_id uuid;
begin
  if new.hub_market_id is null then
    return new;
  end if;

  select v.city_id into hub_city_id
    from public.markets m join public.venues v on v.id = m.venue_id
   where m.id = new.hub_market_id;

  select v.city_id into self_city_id
    from public.venues v where v.id = new.venue_id;

  if hub_city_id is distinct from self_city_id then
    raise exception
      'market % cannot join hub %: they are in different cities (% vs %)',
      new.slug, new.hub_market_id, self_city_id, hub_city_id
      using errcode = 'check_violation';
  end if;

  return new;
end
$$;

create trigger markets_check_hub_consistency
  before insert or update of hub_market_id, venue_id on public.markets
  for each row execute function public.check_market_hub_consistency();

/* ---------------------------------------------------------------------------
 * tags
 *
 * Filters, never URLs. A real table with stable slugs and per-locale labels,
 * because tags are a monetisation hook later. Keep the set small: a tag that
 * cannot be applied confidently from data we hold does not exist.
 * ------------------------------------------------------------------------- */

create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,     -- stable machine key: 'indoor', 'kids'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.market_tags (
  market_id uuid not null references public.markets (id) on delete cascade,
  tag_id    uuid not null references public.tags (id) on delete cascade,
  primary key (market_id, tag_id)
);

create index market_tags_tag_id_idx on public.market_tags (tag_id);

/* ---------------------------------------------------------------------------
 * localisation: one row per locale that actually exists
 *
 * These are polymorphic, so there is no foreign key. The trade is deliberate:
 * URL resolution is "given a locale and a slug, what is this?", which is one
 * indexed lookup here and a UNION across five tables otherwise. Integrity is
 * enforced by trigger instead — see assert_entity_exists() below.
 * ------------------------------------------------------------------------- */

create table public.slugs (
  entity_type text not null
    check (entity_type in ('country', 'region', 'city', 'market', 'tag')),
  entity_id   uuid not null,
  locale      text not null check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  slug        text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (entity_type, entity_id, locale),
  -- Two cities in different cantons can both be `buchs`; the tree disambiguates
  -- them in the URL, so uniqueness is per type and locale, not global.
  unique (entity_type, locale, slug)
);

comment on column public.slugs.slug is
  'ASCII only, transliterated: zuerich, not zürich. Umlauts in URLs break sharing and analytics, and guardrails.config.json forbids them.';

create table public.texts (
  entity_type text not null
    check (entity_type in ('country', 'region', 'city', 'venue', 'market', 'tag')),
  entity_id   uuid not null,
  locale      text not null check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  field       text not null
    check (field in ('name', 'description', 'meta_title', 'meta_description', 'label')),
  value       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (entity_type, entity_id, locale, field)
);

-- Trigram index for the search box. German compound nouns are the open problem
-- here (Flohmarkt inside Kinderflohmarkt) — see PLAN.md step 3.5. Trigrams are
-- the fallback that works today; they match substrings natively.
create index texts_name_trgm_idx
  on public.texts using gin (public.immutable_unaccent(lower(value)) extensions.gin_trgm_ops)
  where field = 'name';

/* ---------------------------------------------------------------------------
 * provenance
 *
 * Append-only. Nothing is overwritten, only superseded. This is the moat and
 * the single cheapest decision available: it is what makes "Bestätigt am
 * 12.08. durch den Veranstalter" honest, and that one string is both the human
 * trust signal and the attributable claim an AI answer can quote.
 * ------------------------------------------------------------------------- */

create table public.facts (
  id            uuid primary key default gen_random_uuid(),
  entity_type   text not null
    check (entity_type in ('country', 'region', 'city', 'venue', 'market', 'occurrence', 'tag')),
  entity_id     uuid not null,
  field         text not null,
  value         jsonb not null,

  source_type   text not null
    check (source_type in ('organiser_email', 'organiser_phone', 'organiser_whatsapp',
                           'website_crawl', 'press', 'municipality', 'our_visit',
                           'manual', 'import')),
  source_ref    text,                       -- URL, message id, admin user

  observed_at   timestamptz not null,       -- when the world was in this state
  recorded_at   timestamptz not null default now(),  -- when we wrote it down
  confidence    text not null default 'reported'
                  check (confidence in ('confirmed', 'reported', 'inferred')),
  superseded_by uuid references public.facts (id) on delete set null
);

create index facts_entity_idx on public.facts (entity_type, entity_id, field);
create index facts_current_idx on public.facts (entity_type, entity_id, observed_at desc)
  where superseded_by is null;
create index facts_observed_at_idx on public.facts (observed_at desc);

comment on table public.facts is
  'Append-only provenance ledger. Never UPDATE a value here — insert a new row and point the old one at it via superseded_by. The freshness queue is a view over this table: staleness x traffic x volatility.';

/* ---------------------------------------------------------------------------
 * user reports
 * ------------------------------------------------------------------------- */

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  market_id     uuid not null references public.markets (id) on delete cascade,
  occurrence_id uuid references public.occurrences (id) on delete set null,
  report_type   text not null
    check (report_type in ('wrong_date', 'cancelled', 'wrong_location',
                           'permanently_closed', 'other')),
  note          text,
  submitted_at  timestamptz not null default now(),
  resolved      boolean not null default false,
  resolved_at   timestamptz,
  resolver_note text
);

create index reports_open_idx on public.reports (submitted_at desc) where not resolved;

/* ---------------------------------------------------------------------------
 * integrity for the polymorphic tables
 * ------------------------------------------------------------------------- */

create or replace function public.assert_entity_exists()
  returns trigger
  language plpgsql
  set search_path = public, pg_catalog
as $$
declare
  found_one boolean;
begin
  execute format(
    'select exists (select 1 from public.%I where id = $1)',
    case new.entity_type
      when 'country'    then 'countries'
      when 'region'     then 'regions'
      when 'city'       then 'cities'
      when 'venue'      then 'venues'
      when 'market'     then 'markets'
      when 'occurrence' then 'occurrences'
      when 'tag'        then 'tags'
    end
  ) into found_one using new.entity_id;

  if not found_one then
    raise exception '% % does not exist', new.entity_type, new.entity_id
      using errcode = 'foreign_key_violation';
  end if;

  return new;
end
$$;

create trigger slugs_assert_entity before insert or update on public.slugs
  for each row execute function public.assert_entity_exists();
create trigger texts_assert_entity before insert or update on public.texts
  for each row execute function public.assert_entity_exists();
create trigger facts_assert_entity before insert or update on public.facts
  for each row execute function public.assert_entity_exists();

-- No FK means no ON DELETE CASCADE, so deletes are swept by hand.
create or replace function public.purge_entity_side_tables()
  returns trigger
  language plpgsql
  set search_path = public, pg_catalog
as $$
declare
  kind text := tg_argv[0];
begin
  delete from public.slugs where entity_type = kind and entity_id = old.id;
  delete from public.texts where entity_type = kind and entity_id = old.id;
  delete from public.facts where entity_type = kind and entity_id = old.id;
  return old;
end
$$;

create trigger countries_purge   after delete on public.countries
  for each row execute function public.purge_entity_side_tables('country');
create trigger regions_purge     after delete on public.regions
  for each row execute function public.purge_entity_side_tables('region');
create trigger cities_purge      after delete on public.cities
  for each row execute function public.purge_entity_side_tables('city');
create trigger venues_purge      after delete on public.venues
  for each row execute function public.purge_entity_side_tables('venue');
create trigger markets_purge     after delete on public.markets
  for each row execute function public.purge_entity_side_tables('market');
create trigger occurrences_purge after delete on public.occurrences
  for each row execute function public.purge_entity_side_tables('occurrence');
create trigger tags_purge        after delete on public.tags
  for each row execute function public.purge_entity_side_tables('tag');

/* ---------------------------------------------------------------------------
 * updated_at
 * ------------------------------------------------------------------------- */

do $$
declare
  t text;
begin
  foreach t in array array[
    'countries', 'regions', 'cities', 'venues', 'organisers', 'markets',
    'market_private', 'occurrences', 'tags', 'slugs', 'texts'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end
$$;

/* ---------------------------------------------------------------------------
 * publishability — the governing rule, in the database
 *
 * v1's best idea: derive "should this page exist" from live content counts
 * rather than from a URL pattern. The build reads these views; a place that is
 * not in one does not get a page. CI then checks the same thing from the other
 * end, against dist/.
 * ------------------------------------------------------------------------- */

create or replace view public.market_next_occurrence as
  select distinct on (o.market_id)
    o.market_id,
    o.id as occurrence_id,
    o.date,
    o.start_time,
    o.end_time,
    o.status,
    o.cancellation_note,
    o.confirmed_at
  from public.occurrences o
  where o.date >= current_date
    and o.status <> 'cancelled'
  order by o.market_id, o.date;

comment on view public.market_next_occurrence is
  'The one occurrence a market page emits as its single schema.org Event. Google only supports pages focused on a single event; later dates are visible content, not markup.';

create or replace view public.publishable_markets as
  select
    m.id,
    m.slug,
    m.status,
    m.kind,
    v.id   as venue_id,
    v.city_id,
    c.region_id,
    r.country_id,
    n.occurrence_id as next_occurrence_id,
    n.date          as next_date,
    (select max(f.observed_at) from public.facts f
      where f.entity_type = 'market' and f.entity_id = m.id
        and f.superseded_by is null) as last_observed_at
  from public.markets m
  join public.venues v on v.id = m.venue_id
  join public.cities c on c.id = v.city_id
  join public.regions r on r.id = c.region_id
  left join public.market_next_occurrence n on n.market_id = m.id
  where m.status = 'active';

create or replace view public.publishable_cities as
  select
    c.id as city_id,
    c.region_id,
    count(distinct m.id)                                   as market_count,
    count(distinct m.id) filter (where n.date is not null)  as markets_with_upcoming_dates,
    min(n.date)                                             as next_date
  from public.cities c
  join public.venues v on v.city_id = c.id
  join public.markets m on m.venue_id = v.id and m.status = 'active'
  left join public.market_next_occurrence n on n.market_id = m.id
  group by c.id, c.region_id
  having count(distinct m.id) >= 1;

comment on view public.publishable_cities is
  'A city page exists because markets exist there. The build must not generate a page for a city absent from this view — that is the rule v1 broke.';

create or replace view public.publishable_regions as
  select
    r.id as region_id,
    r.country_id,
    count(distinct m.id) as market_count,
    count(distinct c.id) as city_count,
    min(n.date)          as next_date
  from public.regions r
  join public.cities c on c.region_id = r.id
  join public.venues v on v.city_id = c.id
  join public.markets m on m.venue_id = v.id and m.status = 'active'
  left join public.market_next_occurrence n on n.market_id = m.id
  group by r.id, r.country_id
  having count(distinct m.id) >= 1;

/* ---------------------------------------------------------------------------
 * radius search — the #1 German query pattern, "in der Nähe"
 * ------------------------------------------------------------------------- */

create or replace function public.markets_within(
  p_lng       double precision,
  p_lat       double precision,
  p_radius_m  int default 30000,
  p_limit     int default 100
)
  returns table (
    market_id  uuid,
    slug       text,
    venue_id   uuid,
    city_id    uuid,
    distance_m double precision,
    next_date  date
  )
  language sql
  stable
  set search_path = public, extensions, pg_catalog
as $$
  select
    m.id,
    m.slug,
    v.id,
    v.city_id,
    extensions.ST_Distance(v.point, extensions.ST_MakePoint(p_lng, p_lat)::extensions.geography),
    n.date
  from public.markets m
  join public.venues v on v.id = m.venue_id
  left join public.market_next_occurrence n on n.market_id = m.id
  where m.status = 'active'
    and extensions.ST_DWithin(
          v.point,
          extensions.ST_MakePoint(p_lng, p_lat)::extensions.geography,
          p_radius_m
        )
  order by 5
  limit p_limit;
$$;

/* ---------------------------------------------------------------------------
 * row level security
 *
 * Deny by default, everywhere. Reads happen at build time with the service
 * role; the runtime API will get explicit, narrow policies or security-definer
 * functions when it exists. v1 shipped permissive anon reads and spent a
 * migration taking them back — start where that ended.
 * ------------------------------------------------------------------------- */

do $$
declare
  t text;
begin
  foreach t in array array[
    'countries', 'regions', 'cities', 'venues', 'organisers', 'markets',
    'market_private', 'occurrences', 'tags', 'market_tags', 'slugs', 'texts',
    'facts', 'reports'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    -- anon and authenticated are Supabase's roles. Guarded so this migration
    -- also applies to a plain Postgres, which is how it is tested in CI.
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
