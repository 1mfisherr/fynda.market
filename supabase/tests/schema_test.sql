-- Behavioural tests for the initial schema.
--
-- Run against a throwaway database that already has the migration applied:
--   npm run db:test
--
-- These assert the rules the schema claims to enforce. A comment saying a
-- trigger prevents something is not evidence; this file is.

\set ON_ERROR_STOP on

begin;

create or replace function pg_temp.expect_failure(p_sql text, p_label text)
  returns void
  language plpgsql
as $$
begin
  begin
    execute p_sql;
  exception when others then
    raise notice 'PASS  %  (rejected: %)', p_label, left(sqlerrm, 70);
    return;
  end;
  raise exception 'FAIL  % — the statement was allowed and should not have been', p_label;
end
$$;

create or replace function pg_temp.expect(p_condition boolean, p_label text)
  returns void
  language plpgsql
as $$
begin
  if p_condition then
    raise notice 'PASS  %', p_label;
  else
    raise exception 'FAIL  %', p_label;
  end if;
end
$$;

/* -- fixtures ------------------------------------------------------------- */

insert into public.countries (id, iso2) values
  ('00000000-0000-0000-0000-0000000000c1', 'CH');

insert into public.regions (id, country_id, code) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000c1', 'ZH');

insert into public.cities (id, region_id) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000f1'),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000f1');

insert into public.venues (id, city_id, name, address_line, point, timezone) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1',
   'Bürkliplatz', 'Bürkliplatz 1',
   extensions.ST_MakePoint(8.5417, 47.3667)::extensions.geography, 'Europe/Zurich'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a2',
   'Kanzleiareal', 'Kanzleistrasse 56',
   extensions.ST_MakePoint(8.5230, 47.3760)::extensions.geography, 'Europe/Zurich');

insert into public.markets (id, venue_id, slug, status) values
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000b1',
   'buerkliplatz-flohmarkt', 'active'),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000b2',
   'kanzleiareal-flohmarkt', 'active');

/* -- 1. the 120-day horizon binds generated rows only --------------------- */

select pg_temp.expect_failure($sql$
  insert into public.occurrences (market_id, date, origin, status)
  values ('00000000-0000-0000-0000-0000000000d1', current_date + 200, 'generated', 'unverified')
$sql$, 'generated occurrence beyond 120 days is refused');

insert into public.occurrences (market_id, date, origin, status)
values ('00000000-0000-0000-0000-0000000000d1', current_date + 30, 'generated', 'unverified');

select pg_temp.expect(
  (select count(*) = 1 from public.occurrences where origin = 'generated'),
  'generated occurrence inside the horizon is accepted'
);

-- The distinction the whole decision rests on: a human-confirmed date next
-- June is a real fact, and the database keeps it. Only publication is capped.
insert into public.occurrences (market_id, date, origin, status, confirmed_at)
values ('00000000-0000-0000-0000-0000000000d1', current_date + 300, 'organiser', 'confirmed', now());

select pg_temp.expect(
  (select count(*) = 1 from public.occurrences
    where origin = 'organiser' and date > current_date + 120),
  'human-confirmed occurrence beyond 120 days is kept'
);

/* -- 2. hubs cannot span cities ------------------------------------------- */

select pg_temp.expect_failure($sql$
  update public.markets
     set hub_market_id = '00000000-0000-0000-0000-0000000000d1'
   where id = '00000000-0000-0000-0000-0000000000d2'
$sql$, 'a hub spanning two cities is refused');

/* -- 3. polymorphic integrity --------------------------------------------- */

select pg_temp.expect_failure($sql$
  insert into public.slugs (entity_type, entity_id, locale, slug)
  values ('market', '00000000-0000-0000-0000-00000000dead', 'de', 'geistermarkt')
$sql$, 'a slug pointing at a non-existent entity is refused');

select pg_temp.expect_failure($sql$
  insert into public.slugs (entity_type, entity_id, locale, slug)
  values ('city', '00000000-0000-0000-0000-0000000000a1', 'de', 'zürich')
$sql$, 'a slug with a non-ASCII character is refused');

insert into public.slugs (entity_type, entity_id, locale, slug) values
  ('country', '00000000-0000-0000-0000-0000000000c1', 'de', 'schweiz'),
  ('country', '00000000-0000-0000-0000-0000000000c1', 'fr', 'suisse'),
  ('city',    '00000000-0000-0000-0000-0000000000a1', 'de', 'zuerich'),
  ('market',  '00000000-0000-0000-0000-0000000000d1', 'de', 'buerkliplatz-flohmarkt');

select pg_temp.expect(
  (select count(*) = 2 from public.slugs where entity_type = 'country'),
  'a country carries one slug row per locale that exists, and no others'
);

/* -- 4. deleting an entity sweeps its polymorphic rows -------------------- */

insert into public.texts (entity_type, entity_id, locale, field, value)
values ('market', '00000000-0000-0000-0000-0000000000d2', 'de', 'name', 'Flohmarkt Kanzleiareal');

delete from public.markets where id = '00000000-0000-0000-0000-0000000000d2';

select pg_temp.expect(
  (select count(*) = 0 from public.texts
    where entity_type = 'market' and entity_id = '00000000-0000-0000-0000-0000000000d2'),
  'deleting a market removes its texts, slugs and facts'
);

/* -- 5. provenance -------------------------------------------------------- */

insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref,
                          observed_at, confidence)
values ('market', '00000000-0000-0000-0000-0000000000d1', 'exists', 'true'::jsonb,
        'organiser_email', 'mail:2026-03-01', now() - interval '180 days', 'confirmed');

select pg_temp.expect(
  (select last_observed_at is not null from public.publishable_markets
    where id = '00000000-0000-0000-0000-0000000000d1'),
  'a market exposes the freshness of its most recent unsuperseded fact'
);

/* -- 6. publishability is derived from content ---------------------------- */

select pg_temp.expect(
  (select count(*) = 1 from public.publishable_cities),
  'only the city that still has an active market is publishable'
);

select pg_temp.expect(
  (select date = current_date + 30 from public.market_next_occurrence
    where market_id = '00000000-0000-0000-0000-0000000000d1') is not false,
  'the next occurrence is the soonest non-cancelled future date'
);

update public.markets set status = 'permanently_closed'
 where id = '00000000-0000-0000-0000-0000000000d1';

select pg_temp.expect(
  (select count(*) = 0 from public.publishable_cities),
  'a city with no active market drops out of publishable_cities'
);

update public.markets set status = 'active'
 where id = '00000000-0000-0000-0000-0000000000d1';

/* -- 7. radius search ----------------------------------------------------- */

select pg_temp.expect(
  (select count(*) = 1 from public.markets_within(8.5417, 47.3667, 1000)),
  'radius search finds a market at the search point'
);

select pg_temp.expect(
  (select count(*) = 0 from public.markets_within(6.1432, 46.2044, 1000)),
  'radius search does not find a Zurich market from Geneva'
);

/* -- 8. updated_at maintains itself --------------------------------------- */

-- now() is the transaction timestamp, so it cannot move within this test.
-- Backdate the row first, then check the trigger drags it forward.
update public.markets set updated_at = timestamptz '2000-01-01'
 where id = '00000000-0000-0000-0000-0000000000d1';

update public.markets set website_url = 'https://example.ch'
 where id = '00000000-0000-0000-0000-0000000000d1';

select pg_temp.expect(
  (select updated_at > timestamptz '2020-01-01' from public.markets
    where id = '00000000-0000-0000-0000-0000000000d1'),
  'updated_at moves on write without the application setting it'
);

rollback;
