-- Four city markets from the finder run of 2026-10-10, each read on its organiser's own page
-- that day, with a credited Wikimedia Commons photo: Flohmarkt Friedrichshagen and KiezKram
-- (Heynhöfe) in Berlin, Flohmarkt am Ebertplatz and the Martinsmarkt in Köln.
--
-- The three Köln/Berlin ones waited in intake since 2026-10-09 because each would soon show "no
-- date yet". That is no longer a reason: a market between editions now says when it is back and
-- offers to tell the visitor (Delfim, 2026-10-10). Ebertplatz ran today and has nothing announced
-- for 2027, so it opens as "Back in April".
--
-- Months from the organisers' own rhythm: Friedrichshagen every Sunday April to December,
-- Ebertplatz April to October. KiezKram and the Martinsmarkt state none.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.markets set season_from = 4, season_to = 12 where slug = 'flohmarkt-friedrichshagen-berlin';
  update public.markets set season_from = 4, season_to = 10 where slug = 'flohmarkt-am-ebertplatz-koeln';
  update public.markets set status = 'active', updated_at = now()
   where status = 'unverified' and image_url is not null
     and slug in ('flohmarkt-friedrichshagen-berlin', 'kiezkram-flohmarkt-heynhoefe-berlin', 'flohmarkt-am-ebertplatz-koeln', 'martinsmarkt-maternusplatz-koeln');
  get diagnostics n = row_count;
  if n <> 4 then raise exception 'expected 4 markets to publish, found %', n; end if;
end $$;

commit;
