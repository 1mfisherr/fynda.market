-- Publishes the nine Köln and Hamburg markets imported 2026-09-28 that now
-- have a photo (Wikimedia Commons, credited under the photo). Every date was
-- read on the organiser's own page the same day.
--
-- Left unverified until a photo exists: the Melan car-park markets at
-- GLOBUS Marsdorf, METRO Godorf, SELGROS Butzweilerhof, PORTA Lind and
-- ROLLER Marsdorf — Commons has no picture of those stores.

begin;

do $$
declare n int;
begin
  -- An empty database (the CI schema test) has nothing to correct.
  if not exists (select 1 from public.markets) then return; end if;
  update public.markets set status = 'active', updated_at = now()
   where status = 'unverified' and image_url is not null
     and slug in (
       'flohmarkt-galopprennbahn-weidenpesch-koeln',
       'flohmarkt-nippes-koeln',
       'flohmarkt-riehler-guertel-koeln',
       'flohmarkt-suedbruecke-koeln',
       'flohmarkt-rheinenergiestadion-koeln',
       'troedelmarkt-ikea-koeln-butzweilerhof',
       'troedelmarkt-ikea-koeln-godorf',
       'flohdom-horner-rennbahn-hamburg',
       'kulturflohmarkt-museum-der-arbeit-hamburg');
  get diagnostics n = row_count;
  if n <> 9 then raise exception 'expected 9 markets to publish, found %', n; end if;
end $$;

commit;
