-- Alpin-Flohmi Lausanne, 11 Nov 2026: the organiser gives 18:30–20:30, members only until 19:00,
-- so the public's hours are 19:00–20:30 (intake/fixes/2026-10-11-small-items.json). Our date had none.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.occurrences o set start_time = '19:00', end_time = '20:30', updated_at = now()
    from public.markets m
   where m.id = o.market_id and m.slug = 'alpin-flohmi-lausanne' and o.date = '2026-11-11' and (o.start_time is null or o.start_time = '18:30');
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'updated %, expected 1', n; end if;
end $$;

commit;
