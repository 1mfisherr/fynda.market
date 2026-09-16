-- The cancellation alert: when an organiser cancels a date, the newsletter
-- subscribers whose subscription covers that market are told at once — the
-- thing the signup promises ("cancellations, so you don't travel for nothing")
-- and the thing no competitor does.
--
-- Who is told is the same rule the Friday digest uses: the subscriber's canton
-- is the market's, or the market lies within their radius of their town. The
-- Function cannot run PostGIS through PostgREST filters, so the match is a SQL
-- function it calls by RPC. One row per subscriber per cancelled date, written
-- before the send, so a retried request cannot mail anyone twice.

begin;

create table public.newsletter_alerts (
  subscriber_id  uuid not null references public.newsletter_subscribers (id) on delete cascade,
  occurrence_id  uuid not null references public.occurrences (id) on delete cascade,
  sent_at        timestamptz not null default now(),
  primary key (subscriber_id, occurrence_id)
);

comment on table public.newsletter_alerts is
  'One row per subscriber per cancelled date, written before the send. Keyed so a retry cannot mail anyone twice.';

alter table public.newsletter_alerts enable row level security;
revoke all on public.newsletter_alerts from anon, authenticated;
grant select, insert on public.newsletter_alerts to service_role;
revoke select on public.newsletter_alerts from metabase_ro;

/*
 * Everyone who should hear that this date is cancelled and has not yet.
 * Paused and unsubscribed addresses are never returned. Cadence is ignored on
 * purpose: "once a month" was a choice about the digest, and a cancellation is
 * the one mail the subscription exists for. A subscription with neither canton
 * nor town is the whole country, as it is for the digest.
 */
create or replace function public.cancellation_recipients(p_occurrence uuid)
  returns table (id uuid, email text, locale text, unsubscribe_token text)
  language sql
  security definer
  set search_path = public, extensions, pg_catalog
as $$
  select s.id, s.email, s.locale, s.unsubscribe_token
  from public.occurrences o
  join public.markets m on m.id = o.market_id
  join public.venues v  on v.id = m.venue_id
  join public.cities mc on mc.id = v.city_id
  join public.newsletter_subscribers s
    on s.unsubscribed_at is null
   and (s.paused_until is null or s.paused_until < current_date)
   and (
        -- No canton and no town: the whole country, as the digest reads it.
        (s.region_id is null and s.city_id is null)
     or (s.region_id is not null and s.region_id = mc.region_id)
     or (s.city_id is not null and exists (
          select 1 from public.cities sc
          where sc.id = s.city_id
            and extensions.st_dwithin(sc.point, v.point, coalesce(s.radius_km, 25) * 1000)
        ))
   )
  left join public.newsletter_alerts a on a.subscriber_id = s.id and a.occurrence_id = o.id
  where o.id = p_occurrence
    and a.subscriber_id is null
$$;

revoke all on function public.cancellation_recipients(uuid) from public;
grant execute on function public.cancellation_recipients(uuid) to service_role;

commit;
