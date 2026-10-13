-- Three markets that waited only for a photo, each now carrying one Delfim supplied
-- (2026-10-13): the Flohmarkt Theresienwiese in München, read on the BRK's own page and
-- its 2026 PDFs that day, and Melan's markets at METRO Köln-Godorf and PORTA Köln-Lind,
-- which waited in intake since 2026-09-22 for a photo of the place.
--
-- Months from the organisers' own words: the Theresienwiese once a year in April, during
-- the Frühlingsfest — 2027's date is not out, so it opens as "Back in April"; PORTA from
-- March to October, its season over, so "Back in March". METRO runs about monthly and has
-- November and December dated.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.markets set season_from = 4, season_to = 4 where slug = 'flohmarkt-theresienwiese-muenchen';
  update public.markets set season_from = 3, season_to = 10 where slug = 'troedelmarkt-porta-koeln-lind';
  update public.markets set status = 'active', updated_at = now()
   where status = 'unverified' and image_url is not null
     and slug in ('flohmarkt-theresienwiese-muenchen', 'troedelmarkt-metro-koeln-godorf', 'troedelmarkt-porta-koeln-lind');
  get diagnostics n = row_count;
  if n <> 3 then raise exception 'expected 3 markets to publish, found %', n; end if;
end $$;

commit;
