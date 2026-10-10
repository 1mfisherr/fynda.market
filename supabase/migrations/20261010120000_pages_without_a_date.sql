/* ---------------------------------------------------------------------------
 * Pages with no date yet (docs/PAGES.md, Delfim 2026-10-10).
 *
 * A market between editions is a place with a season, not an event that
 * ended: 94 of 339 live markets had no upcoming date on 2026-10-10, 88% of
 * their visitors arrived straight from Google and 84% left without a tap.
 * The page now says when the market is usually back, offers to tell the
 * visitor when it is, and shows what is on nearby meanwhile.
 *
 * Three things the schema did not hold:
 *
 *   season_from / season_to  the months a market runs, read from its own
 *                            rhythm line — "April to October" is 4 / 10, an
 *                            annual market in September 9 / 9, and a season
 *                            over the new year wraps (Uster, October to
 *                            April, is 10 / 4). Null where the rhythm names
 *                            no months: "twice a year" says nothing a page
 *                            could promise. src/lib/season.ts reads it.
 *   seller_mix               who sells — private people, a mix, or dealers.
 *                            What buyers ask most after size (PAGES.md §What
 *                            decides a trip). Rendered only when set.
 *   date_alerts              "Tell me when it's back": one address, one
 *                            market or one town, one e-mail the night a date
 *                            appears (scripts/send-date-alerts.mjs).
 * ------------------------------------------------------------------------- */

alter table public.markets
  add column season_from smallint check (season_from between 1 and 12),
  add column season_to   smallint check (season_to between 1 and 12),
  add column seller_mix  text check (seller_mix in ('private', 'mixed', 'trader')),
  add constraint markets_season_both check ((season_from is null) = (season_to is null));

comment on column public.markets.season_from is 'First month the market runs (1–12). With season_to; equal for an annual market in one month; may wrap the new year.';
comment on column public.markets.season_to is 'Last month the market runs (1–12). See season_from.';
comment on column public.markets.seller_mix is 'Who sells: private people, a mix, or dealers. From the organiser or their own page; rendered only when set.';

/* ---------------------------------------------------------------------------
 * The alert.
 *
 * One row per request. The address is held only until it has done its one
 * job: the sender stamps notified_at and clears the address in the same
 * statement, and a request that waited 400 days with no date is expired the
 * same way. What stays is the market or town and the date — how many people
 * waited for which market, which is the number an organiser wants to hear.
 * ------------------------------------------------------------------------- */

create table public.date_alerts (
  id              uuid primary key default gen_random_uuid(),
  email           text,
  locale          text not null check (locale in ('de', 'fr', 'it', 'en')),
  -- One or the other: a market page asks about that market, a town page
  -- with nothing dated asks about the town.
  market_id       uuid references public.markets (id) on delete cascade,
  city_id         uuid references public.cities (id) on delete cascade,
  source_path     text check (source_path is null or source_path ~ '^/'),
  consent_text    text check (consent_text is null or length(consent_text) <= 500),
  signup_ip_hash  text check (signup_ip_hash is null or signup_ip_hash ~ '^[0-9a-f]{64}$'),
  created_at      timestamptz not null default now(),
  notified_at     timestamptz,
  expired_at      timestamptz,

  constraint date_alerts_one_target check ((market_id is null) <> (city_id is null)),
  constraint date_alerts_email_shape check (email is null or (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and email = lower(email))),
  -- An address while the request waits, none once it is done.
  constraint date_alerts_email_while_waiting check ((email is null) = (notified_at is not null or expired_at is not null))
);

comment on table public.date_alerts is
  '"Tell me when it''s back" — one address, one market or town, one e-mail when a date appears. The address is cleared once sent or after 400 days.';

/* A second tap from the same address on the same page is the same request. */
create unique index date_alerts_waiting_market_key on public.date_alerts (email, market_id)
  where email is not null and market_id is not null;
create unique index date_alerts_waiting_city_key on public.date_alerts (email, city_id)
  where email is not null and city_id is not null;

alter table public.date_alerts enable row level security;
revoke all on public.date_alerts from anon, authenticated;
-- The Function inserts; the sender reads, stamps and clears.
grant select, insert, update on public.date_alerts to service_role;

/* How many people wait for each market or town, with no address in sight —
   for Metabase now, and for the organiser page later ("12 people asked to be
   told about your 2027 dates"). */
create view public.date_alerts_waiting as
  select market_id, city_id, count(*) as waiting, min(created_at) as since
  from public.date_alerts
  where email is not null
  group by market_id, city_id;

revoke all on public.date_alerts_waiting from anon, authenticated;
grant select on public.date_alerts_waiting to service_role, metabase_ro;
