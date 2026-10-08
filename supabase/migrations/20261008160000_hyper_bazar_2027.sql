-- Hyper Bazar, La Chaux-de-Fonds: the 2027 dates its own site lists
-- (hyperbazar.ch, read 2026-10-08) under "2027 ?" — 24 April, 29 May (a Fête
-- de mai edition), 26 June, 28 August, 25 September, 10:00-16:00; 31 July is
-- a summer pause. The organiser's question mark is why they go in as
-- 'unverified' ("Not confirmed yet") with no stamp (Delfim, 2026-10-08).
-- Flip them with confirm.mjs once the question mark is gone.

begin;

do $$
declare n int;
begin
  -- An empty database (the CI schema test) has nothing to correct.
  if not exists (select 1 from public.markets) then return; end if;
  insert into public.occurrences (market_id, date, start_time, end_time, status, origin)
  select m.id, d::date, '10:00', '16:00', 'unverified', 'manual'
    from public.markets m,
         unnest(array['2027-04-24', '2027-05-29', '2027-06-26', '2027-08-28', '2027-09-25']) as d
   where m.slug = 'hyper-bazar-la-chaux-de-fonds';
  get diagnostics n = row_count;
  if n <> 5 then raise exception 'expected 5 dates, got %', n; end if;

  insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
  select 'occurrence', o.id, 'date', to_jsonb(o.date::text), 'website_crawl', 'https://hyperbazar.ch/', now(), 'reported'
    from public.occurrences o join public.markets m on m.id = o.market_id
   where m.slug = 'hyper-bazar-la-chaux-de-fonds' and o.date >= '2027-01-01';
end $$;

commit;
