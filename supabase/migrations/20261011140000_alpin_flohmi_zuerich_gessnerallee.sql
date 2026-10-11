-- Alpin-Flohmi Zürich moved: the organiser's page puts the 22 Oct 2026 edition at Stall6,
-- Theater Gessnerallee, Gessnerallee 8, not at the Dynamo (facts pass, 2026-10-11,
-- intake/fixes/2026-10-11-proposals.json). It is the market's only upcoming date, and a date
-- cannot carry its own venue, so the market moves; the Dynamo row stays, unused. The series
-- picks a hall per edition — check the venue again when the 2027 date is out.

begin;

do $$
declare n int; v uuid;
begin
  if not exists (select 1 from public.markets) then return; end if;

  insert into public.venues (city_id, name, address_line, postal_code, point, timezone)
  values ('8edf468e-33df-4441-bf0e-a1882cf5208a', 'Stall6, Theater Gessnerallee', 'Gessnerallee 8', '8001',
          extensions.st_setsrid(extensions.st_makepoint(8.5347264, 47.3747687), 4326)::extensions.geography, 'Europe/Zurich')
  returning id into v;
  insert into public.texts (entity_type, entity_id, locale, field, value)
  values ('venue', v, 'de', 'name', 'Stall6, Theater Gessnerallee');

  update public.markets set venue_id = v, updated_at = now()
   where slug = 'alpin-flohmi-zuerich' and venue_id = '7ec24106-9bba-45ec-90e3-afc675e4692c';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'moved %, expected 1', n; end if;
end $$;

commit;
