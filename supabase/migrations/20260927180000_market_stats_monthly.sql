-- The monthly photo: the state of the directory, per country and region.
--
-- "In 2026 there were 100 markets, in 2027 120" should be a lookup, not an
-- archaeology project over the history book. One row per month per country
-- (region = '') and per region, recomputed every night for the current month
-- by scripts/snapshot-stats.mjs; on the 1st it closes the month just ended
-- one last time. After that a month is never recomputed: it is what we knew
-- then.
--
-- Counts cover listed markets (status 'active'), which is what the site shows.
-- Months are Zurich months. Starts with September 2026.

begin;

create table public.market_stats_monthly (
  month                       date    not null,
  country                     text    not null,
  region                      text    not null default '',
  markets_listed              integer not null,
  markets_new                 integer not null,
  markets_organiser_confirmed integer not null,
  markets_with_date           integer not null,
  dates                       integer not null,
  dates_cancelled             integer not null,
  dates_checked               integer not null,
  dates_from_organiser        integer not null,
  setting_indoor              integer not null,
  setting_outdoor             integer not null,
  setting_both                integer not null,
  setting_unknown             integer not null,
  kinds                       jsonb   not null,
  computed_at                 timestamptz not null default now(),
  primary key (month, country, region)
);

alter table public.market_stats_monthly enable row level security;
grant select on public.market_stats_monthly to metabase_ro;

comment on table public.market_stats_monthly is
  'Per month, per country (region = '''') and per region: markets listed, new, organiser-confirmed, with a date that month; dates, cancelled, checked, from organisers; indoor/outdoor; kinds. Current month recomputed nightly; past months frozen.';

create or replace function public.snapshot_market_stats(
  p_month date default date_trunc('month', (now() at time zone 'Europe/Zurich'))::date
)
returns integer
language plpgsql
as $$
declare
  written integer;
  m_start date := date_trunc('month', p_month)::date;
  m_end   date := (date_trunc('month', p_month) + interval '1 month')::date;
begin
  with m as (
    select mk.id, mk.kind, mk.setting, mk.verified_by, mk.created_at, c.iso2 as country, r.code as region
      from public.markets mk
      join public.venues v    on v.id = mk.venue_id
      join public.cities ci   on ci.id = v.city_id
      join public.regions r   on r.id = ci.region_id
      join public.countries c on c.id = r.country_id
     where mk.status = 'active'
  ),
  d as (
    select o.market_id, o.status, o.confirmed_at, o.origin
      from public.occurrences o
     where o.date >= m_start and o.date < m_end
  ),
  per_market as (
    select m.*,
           (select count(*) from d where d.market_id = m.id)                                 as n_dates,
           (select count(*) from d where d.market_id = m.id and d.status = 'cancelled')      as n_cancelled,
           (select count(*) from d where d.market_id = m.id and d.confirmed_at is not null)  as n_checked,
           (select count(*) from d where d.market_id = m.id and d.origin = 'organiser')      as n_organiser,
           exists (select 1 from d where d.market_id = m.id and d.status <> 'cancelled')     as has_date
      from m
  ),
  grouped as (
    select country, coalesce(region, '') as region,
           count(*)                                                              as markets_listed,
           count(*) filter (where created_at >= m_start and created_at < m_end)  as markets_new,
           count(*) filter (where verified_by = 'organiser')                     as markets_organiser_confirmed,
           count(*) filter (where has_date)                                      as markets_with_date,
           coalesce(sum(n_dates), 0)                                             as dates,
           coalesce(sum(n_cancelled), 0)                                         as dates_cancelled,
           coalesce(sum(n_checked), 0)                                           as dates_checked,
           coalesce(sum(n_organiser), 0)                                         as dates_from_organiser,
           count(*) filter (where setting = 'indoor')                            as setting_indoor,
           count(*) filter (where setting = 'outdoor')                           as setting_outdoor,
           count(*) filter (where setting = 'both')                              as setting_both,
           count(*) filter (where setting is null)                               as setting_unknown
      from per_market
     group by grouping sets ((country), (country, region))
  ),
  kinds as (
    select country, coalesce(region, '') as region, jsonb_object_agg(kind, n) as kinds
      from (
        select country, region, kind, count(*) as n
          from per_market
         group by grouping sets ((country, kind), (country, region, kind))
      ) k
     group by 1, 2
  )
  insert into public.market_stats_monthly as s (
    month, country, region, markets_listed, markets_new, markets_organiser_confirmed,
    markets_with_date, dates, dates_cancelled, dates_checked, dates_from_organiser,
    setting_indoor, setting_outdoor, setting_both, setting_unknown, kinds, computed_at)
  select m_start, g.country, g.region, g.markets_listed, g.markets_new, g.markets_organiser_confirmed,
         g.markets_with_date, g.dates, g.dates_cancelled, g.dates_checked, g.dates_from_organiser,
         g.setting_indoor, g.setting_outdoor, g.setting_both, g.setting_unknown, k.kinds, now()
    from grouped g
    join kinds k using (country, region)
  on conflict (month, country, region) do update set
    markets_listed = excluded.markets_listed,
    markets_new = excluded.markets_new,
    markets_organiser_confirmed = excluded.markets_organiser_confirmed,
    markets_with_date = excluded.markets_with_date,
    dates = excluded.dates,
    dates_cancelled = excluded.dates_cancelled,
    dates_checked = excluded.dates_checked,
    dates_from_organiser = excluded.dates_from_organiser,
    setting_indoor = excluded.setting_indoor,
    setting_outdoor = excluded.setting_outdoor,
    setting_both = excluded.setting_both,
    setting_unknown = excluded.setting_unknown,
    kinds = excluded.kinds,
    computed_at = excluded.computed_at;

  get diagnostics written = row_count;
  return written;
end;
$$;

revoke all on function public.snapshot_market_stats(date) from public;

select public.snapshot_market_stats();

commit;
