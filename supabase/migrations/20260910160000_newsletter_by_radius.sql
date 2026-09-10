-- "Markets near me" rather than "markets in my canton".
--
-- A canton is a decent guess at how far somebody drives, and on a canton page
-- it is exactly the right unit. Everywhere else it is a blunt one: Graubünden
-- is 7,100 km² and Zug is 239, so the same subscription means a two-hour drive
-- for one reader and fifteen minutes for another. Somebody in Zug who would
-- happily go to Zürich gets nothing from either.
--
-- So a city page and a market page now subscribe to a distance from a place,
-- which is the question those pages are actually about. The canton page keeps
-- the canton, because a page about a canton asking "how far from where?" would
-- be inventing a question the visitor did not ask.
--
-- Both shapes live on the row, and at most one of them is set:
--
--   region_id            markets in that canton
--   city_id + radius_km  markets within that many km of that city
--   neither              the whole country
--
-- The check constraint is what stops a third, undefined shape existing.

begin;

alter table public.newsletter_subscribers
  add column if not exists city_id uuid
    references public.cities (id) on delete set null,
  add column if not exists radius_km integer;

comment on column public.newsletter_subscribers.city_id is
  'The place a radius subscription is measured from. Its centroid is cities.point.';
comment on column public.newsletter_subscribers.radius_km is
  'Kilometres from city_id. Only meaningful with one; see src/lib/geo.ts for the offered values.';

/*
 * One shape at a time, and a radius only ever with a place to measure from.
 * Without this a row could name a canton and a city, and the digest would have
 * to pick one — which is a decision that belongs here, not in a query.
 */
alter table public.newsletter_subscribers
  drop constraint if exists newsletter_one_scope;

alter table public.newsletter_subscribers
  add constraint newsletter_one_scope check (
    (region_id is null or city_id is null)
    and (radius_km is null or city_id is not null)
    and (radius_km is null or radius_km between 1 and 200)
  );

-- "Who is on this list and where are they" is the digest's only question.
create index if not exists newsletter_subscribers_city_idx
  on public.newsletter_subscribers (city_id)
  where unsubscribed_at is null;

commit;
