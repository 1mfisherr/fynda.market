-- Three small fixes, each read on the organiser's own page (intake/fixes/2026-10-11-small-items.json):
--   Alpin-Flohmi Lausanne: our venue was only the word "Lausanne"; the organiser gives the hall,
--     Grande Salle du CAS des Diablerets, Rue Beau-Séjour 24.
--   Kinderflohmarkt Schlieren: the children's market is on the meadow between the Stadthaus and
--     the Stürmeierhuus on Freiestrasse, not on Kirchgasse (the Herbstmarkt's street); its old
--     link is dead and the town keeps no page per edition, so the town's events calendar.
--   Nachtflohmarkt im Presswerk: the Presswerk's own page now gives 29 Dec 2026, 18:00–22:00.
-- Both venues belong to one market each, so they are corrected in place.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;

  update public.venues set name = 'Grande Salle du CAS des Diablerets', address_line = 'Rue Beau-Séjour 24', postal_code = '1003',
         point = extensions.st_setsrid(extensions.st_makepoint(6.6368267, 46.5174527), 4326)::extensions.geography, updated_at = now()
   where id = '23915520-878b-447f-9d90-9e3162099e9c' and name = 'Lausanne';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Lausanne venue: updated %, expected 1', n; end if;

  update public.venues set name = 'Stadthaus Schlieren', address_line = 'Freiestrasse 6', postal_code = '8952',
         point = extensions.st_setsrid(extensions.st_makepoint(8.4470032, 47.3961613), 4326)::extensions.geography, updated_at = now()
   where id = '65ad03dc-e5e6-4e23-ba9e-9af394921386' and name = 'Kirchgasse Schlieren';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Schlieren venue: updated %, expected 1', n; end if;

  update public.texts set value = v.name, updated_at = now()
    from (values ('23915520-878b-447f-9d90-9e3162099e9c'::uuid, 'Grande Salle du CAS des Diablerets'),
                 ('65ad03dc-e5e6-4e23-ba9e-9af394921386'::uuid, 'Stadthaus Schlieren')) as v(id, name)
   where entity_type = 'venue' and entity_id = v.id and field = 'name';

  update public.markets set website_url = 'https://www.schlieren.ch/anlaesseaktuelles', updated_at = now()
   where slug = 'flohmarkt-schlieren-herbstmarkt';
  update public.markets set website_url = 'https://presswerk-arbon.ch/events/nachtflohmarkt-27-12-22/', updated_at = now()
   where slug = 'nachtflohmarkt-presswerk-arbon';

  update public.occurrences o set start_time = '18:00', end_time = '22:00', updated_at = now()
    from public.markets m
   where m.id = o.market_id and m.slug = 'nachtflohmarkt-presswerk-arbon' and o.date = '2026-12-29';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Presswerk hours: updated %, expected 1', n; end if;
end $$;

commit;
