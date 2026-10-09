-- What the helpers writing the texts of the 40 markets from v1 found on the organisers' and
-- venues' own pages (2026-10-09; intake/descriptions-v1-winter/out-*.json, quotes there):
--   Bourse photo & vieux papiers, Granges-Paccot — the organiser's poster for this fair: "10h-16h".
--   Vinylbörse Villa Flora, Wald — the venue's event page: 10:00 – 16:00, "EINTRITT FREI".
--   Zürcher Schallplatten- und CD-Börse — the Volkshaus events page lists Sunday 4 April 2027, 10:00.
--   Grosse Burgdorfer Brocante — the organiser's 2026 flyer: entry CHF 7.
--   Mercatino Lusso Vintage, Lugano — the organiser's ticket page: entry free.
-- The same corrections went to v1 (fleafind migration 20261009140000), so the weekly copy agrees.

begin;

do $$
declare m uuid; o uuid;
begin
  if not exists (select 1 from public.markets) then return; end if;

  update public.occurrences set start_time = '10:00', confirmed_at = now()
   where date = '2027-02-07' and market_id = (select id from public.markets where slug = 'bourse-photo-vieux-papiers-fribourg-granges-paccot')
  returning id into o;
  if o is not null then
    insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
    values ('occurrence', o, 'hours', '{"start":"10:00","end":"16:00"}', 'website_crawl', 'https://dakotaevents.ch/wp-content/uploads/2026/06/Inscription-APIP.pdf', now(), 'confirmed');
  end if;

  update public.occurrences set start_time = '10:00', end_time = '16:00', confirmed_at = now()
   where date = '2026-11-01' and market_id = (select id from public.markets where slug = 'vinylboerse-villa-flora-wald')
  returning id into o;
  if o is not null then
    insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
    values ('occurrence', o, 'hours', '{"start":"10:00","end":"16:00"}', 'website_crawl', 'https://villaflora-wald.ch/events/8-vinylboerse-245-867/', now(), 'confirmed');
  end if;

  select id into m from public.markets where slug = 'zuercher-schallplatten-cd-boerse';
  if m is not null then
    insert into public.occurrences (market_id, date, start_time, status, origin, confirmed_at)
    values (m, '2027-04-04', '10:00', 'confirmed', 'manual', now())
    on conflict (market_id, date) do nothing returning id into o;
    if o is not null then
      insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
      values ('occurrence', o, 'date', to_jsonb('2027-04-04'::text), 'website_crawl', 'https://www.volkshaus.ch/veranstaltungen', now(), 'confirmed');
    end if;
  end if;

  update public.markets set entry_fee = 0 where slug in ('vinylboerse-villa-flora-wald', 'mercatino-lusso-vintage-lugano');
  update public.markets set entry_fee = 7 where slug = 'grosse-burgdorfer-brocante';
  insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
  select 'market', id, 'entry_fee', to_jsonb(entry_fee), 'website_crawl', src, now(), 'confirmed'
    from public.markets m join (values
      ('vinylboerse-villa-flora-wald', 'https://villaflora-wald.ch/events/8-vinylboerse-245-867/'),
      ('mercatino-lusso-vintage-lugano', 'https://www.tickettailor.com/events/laghiandadisimonatrabucco/2408113'),
      ('grosse-burgdorfer-brocante', 'https://www.grosseburgdorferbrocante.ch/files/Burgdorfer-Brocante--2026.webp')) as s(slug, src) on s.slug = m.slug;
end $$;

commit;
