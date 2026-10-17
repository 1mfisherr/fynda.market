-- Market Watch 2026-10-17: dates the run raised, read again on the organisers' pages the same day.
-- The AI step dropped Freiburg's; HansaMarkt's Telegram finding carries 13 of its 17 new Sundays — the four it missed are here too.
begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  -- Riesenflohmarkt Freiburg, https://www.suema-maier.de/Flohmarkt/termine.php, all at the Messehalle Freiburg:
  -- "Fr. 15.01. von 14 - 19 Uhr / Sa. 16.01. von 9 - 17 Uhr" … "Sa. 22.05. von 10 - 18 Uhr / So. 23.05. von 11 - 18 Uhr"
  -- HansaMarkt Berlin, https://www.hansamarkt.de/termine-und-buchung/: "So. 03.01.2027 … So. 25.04.2027", "Für Besucher ab 9Uhr bis 16Uhr"
  insert into public.occurrences (market_id, date, start_time, end_time, status, origin, confirmed_at)
  select m.id, d.date::date, d.s::time, d.e::time, 'confirmed', 'manual', now()
    from (values ('riesenflohmarkt-freiburg', '2027-01-15', '14:00', '19:00'),
                 ('riesenflohmarkt-freiburg', '2027-01-16', '09:00', '17:00'),
                 ('riesenflohmarkt-freiburg', '2027-02-05', '14:00', '19:00'),
                 ('riesenflohmarkt-freiburg', '2027-02-06', '09:00', '17:00'),
                 ('riesenflohmarkt-freiburg', '2027-03-12', '14:00', '19:00'),
                 ('riesenflohmarkt-freiburg', '2027-03-13', '09:00', '17:00'),
                 ('riesenflohmarkt-freiburg', '2027-04-16', '14:00', '19:00'),
                 ('riesenflohmarkt-freiburg', '2027-04-17', '09:00', '17:00'),
                 ('riesenflohmarkt-freiburg', '2027-05-22', '10:00', '18:00'),
                 ('riesenflohmarkt-freiburg', '2027-05-23', '11:00', '18:00'),
                 ('troedelmarkt-hansamarkt-berlin', '2027-01-31', '09:00', '16:00'),
                 ('troedelmarkt-hansamarkt-berlin', '2027-02-28', '09:00', '16:00'),
                 ('troedelmarkt-hansamarkt-berlin', '2027-03-28', '09:00', '16:00'),
                 ('troedelmarkt-hansamarkt-berlin', '2027-04-25', '09:00', '16:00')) as d(slug, date, s, e)
    join public.markets m on m.slug = d.slug
   where not exists (select 1 from public.occurrences o where o.market_id = m.id and o.date = d.date::date);
  get diagnostics n = row_count;
  if n <> 14 then raise exception 'new dates: inserted %, expected 14', n; end if;
end $$;

commit;
