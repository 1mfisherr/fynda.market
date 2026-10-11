-- Fixes the facts pass found (2026-10-11), each read on the organiser's own page; the quotes
-- are in intake/fixes/2026-10-11-proposals.json.
--   Setting: Hölstein (65 hall tables, 12 outside), Baden Bazaar (indoor and outdoor pitches),
--   Enter Flohmarkt (a boot sale outside the Eventhalle) sell stalls inside and out → both.
--   Website: seven links to a listing, a ticket shop or a dead site → the organiser's own page.
--   Venue: Aachen's market is on the car park in front of the arena, not in the ice rink the
--   name suggested; the name keeps only the arena (a venue name carries no one language).

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;

  update public.markets m set setting = 'both', updated_at = now()
    from (values ('hallenflohmarkt-hoelstein'), ('baden-bazaar'), ('enter-flohmarkt-derendingen')) as v(slug)
   where m.slug = v.slug and m.setting = 'indoor';
  get diagnostics n = row_count;
  if n <> 3 then raise exception 'setting: updated %, expected 3', n; end if;

  update public.markets m set website_url = v.url, updated_at = now()
    from (values
      ('cd-schallplatten-boerse-bern',   'https://bernerschallplattenboerse.ch/'),
      ('brocante-de-misery',             'https://brocantedesamis.ch/brocante-de-misery'),
      ('brocante-quai-de-nogent-yverdon','https://brocantedesamis.ch/brocantes-d-yverdon'),
      ('mercalibro-bellinzona',          'https://cooperativa-area.ch/'),
      ('flohmarkt-presswerk-arbon',      'https://presswerk-arbon.ch/events/flohmarkt-november-2026/'),
      ('hyper-bazar-la-chaux-de-fonds',  'https://hyperbazar.ch/'),
      ('marche-aux-puces-vevey',         'http://apero1800vevey.blogspot.com/p/blog-page_16.html')
    ) as v(slug, url)
   where m.slug = v.slug and m.website_url is distinct from v.url;
  get diagnostics n = row_count;
  if n <> 7 then raise exception 'website: updated %, expected 7', n; end if;

  update public.venues set name = '100,5 Arena', updated_at = now()
   where id = '2ae4f57b-9139-4bef-b1fc-5b6e34ff22d2' and name = '100,5 Arena (Tivoli Eissporthalle)';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'venue: updated %, expected 1', n; end if;
end $$;

commit;
