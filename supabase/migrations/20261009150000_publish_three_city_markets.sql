-- Publishes three city markets the finder turned up (2026-10-09), each read on
-- its organiser's own page the same day, with a Wikimedia Commons photo of the
-- venue credited under it: Flohmarkt Daglfing and the Midnightbazar in München,
-- the Nachtflohmarkt in der Gleishalle in Hamburg. Daglfing's dates beyond
-- 30 Oct are derived from its stated rhythm and show as not yet confirmed.
--
-- Left in intake for 2027 (each would soon show "no date yet"): Flohmarkt am
-- Ebertplatz and the Martinsmarkt in Köln, KiezKram in Berlin.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.markets set status = 'active', updated_at = now()
   where status = 'unverified' and image_url is not null
     and slug in ('flohmarkt-daglfing-muenchen', 'midnightbazar-nachtflohmarkt-muenchen', 'nachtflohmarkt-gleishalle-hamburg');
  get diagnostics n = row_count;
  if n <> 3 then raise exception 'expected 3 markets to publish, found %', n; end if;
end $$;

commit;
