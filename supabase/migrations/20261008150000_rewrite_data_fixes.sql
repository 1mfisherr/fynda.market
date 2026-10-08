-- What the description rewrite found wrong in our own data, 2026-10-08.
-- Each claim was found by one agent, re-checked independently by a second
-- against the organiser's or commune's own page, and the ones that move
-- visitors (Schmittiplatz, Hölstein, FLOSCH) re-read by hand. High confidence
-- only; medium ones and anything needing Delfim are listed in PLAN.md.
--
-- Sources, by market:
--   Barfüsserplatz   media.bs.ch/…/vorschrift-flohmaerkte-2026.pdf (January to early October)
--   Bülach           buelach.ch/dienstleistungen/100984 (2027: January and March cancelled, renovation)
--   GZ Hirzenbach    gz-zh.ch/gz-hirzenbach/angebote/gz-flohmarkt/ (a children's market, four a year)
--   Rüticenter       flohmarktkoenig.ch/infos/1 (Flohmarktkönig; July runs, August doesn't)
--   Stücki           flohmarktkoenig.ch/infos/9 ("mehrmals im Jahr")
--   Schmittiplatz    schmittiflohmi.ch/portfolio/ ("Er findet zwei mal im Jahr statt")
--   FLOSCH           flosch.ch/daten ("normalerweise" last Saturday; "8-17 Uhr", "bei jeder Witterung")
--   Gänggali Chur    flohmarkt-chur.ch (run by its own team; August 2026 moved to the 8th)
--   Markthalle       bs.ch, other markets (once a month over a weekend; under the dome)
--   CPO Ouchy        cpo-ouchy.ch/activites/les-puces-du-cpo/ (no puces on holidays or in school holidays)
--   Calabash         associationcalabash.ch/reglement/ (every first Sunday, all year; 9-18)
--   Massagno         ti.ch cantonal agenda (spring and autumn editions; Associazione La Ghirlanda)
--   Strandgut        neubad.org/veranstaltungen ("grundsätzlich" 1st and 3rd Sunday, often shifted)
--   Echichens        echichens.ch/_rte/anlass/7654582 (Sunday 1 November 2026, 09-16)
--   Hölstein         flohmarkt-hoelstein.ch (2027: 11 April and 17 October; 3 April is a different market)
--   Puces de Nyon    quartierderive.ch/commissions/puces-de-nyon (8h-19h)
--   Säuliämtler      säuliämtler-flohmarkt.ch/download/agb.pdf ("von 9 Uhr bis 16 Uhr")
--   Vinyl Markt      markthallebasel.ch/kalender/ (Saturday 6 February 2027, 12-21)
--   Vide-dressing    flon.ch agenda (only 2026 dates published; 2027 ones were ours, extrapolated)
--   Hirzbrunnen      quartierflohmibasel.ch (Schorenweg is Basel 4058, not Riehen 4125; runs in any weather)
--   Thun             schadaugaertnerei.ch/events/ (Seestrasse 42, 3600 Thun)
--   Liesberg         liesberger-flohmarkt.ch (hall at Seemättliweg 19)
--   Lutry vide-grenier sdlutry.ch/vide-grenier ("sur les quais de Lutry")
--   Organisers       Carouge: carouge.ch brocante page; Aarau: flohmarkt-aarau.ch/ueber;
--                    Hölstein: its 2026 Reglement; Kronensaal: eventfrog listing (Hotel Kronenhof)
--   A private person who organises (Schmittiplatz, Chur) is named by the market, not by name.

begin;

-- Rhythm lines. markets.recurrence_text is the German; texts carries every locale.
create temporary table rhythm (slug text, locale text, value text) on commit drop;
insert into rhythm values
  ('flohmarkt-barfuesserplatz-basel', 'de', '2. und 4. Mittwoch des Monats, Januar bis Anfang Oktober'),
  ('flohmarkt-barfuesserplatz-basel', 'en', '2nd and 4th Wednesday of the month, January to early October'),
  ('flohmarkt-barfuesserplatz-basel', 'fr', '2e et 4e mercredi du mois, de janvier à début octobre'),
  ('flohmarkt-barfuesserplatz-basel', 'it', '2° e 4° mercoledì del mese, da gennaio a inizio ottobre'),
  ('flohmarkt-buelach-stadthalle', 'de', 'Zwei- bis viermal jährlich'),
  ('flohmarkt-buelach-stadthalle', 'en', 'Two to four times a year'),
  ('flohmarkt-buelach-stadthalle', 'fr', 'Deux à quatre fois par an'),
  ('flohmarkt-buelach-stadthalle', 'it', 'Da due a quattro volte all''anno'),
  ('flohmarkt-gz-hirzenbach', 'de', 'Viermal jährlich'),
  ('flohmarkt-gz-hirzenbach', 'en', 'Four times a year'),
  ('flohmarkt-gz-hirzenbach', 'fr', 'Quatre fois par an'),
  ('flohmarkt-gz-hirzenbach', 'it', 'Quattro volte all''anno'),
  ('flohmarkt-rueticenter-pratteln', 'de', 'Rund zehnmal jährlich an einem Sonntag, Februar bis November (ausser August)'),
  ('flohmarkt-rueticenter-pratteln', 'en', 'About ten Sundays a year, February to November (not August)'),
  ('flohmarkt-rueticenter-pratteln', 'fr', 'Une dizaine de dimanches par an, de février à novembre (sauf août)'),
  ('flohmarkt-rueticenter-pratteln', 'it', 'Una decina di domeniche all''anno, da febbraio a novembre (tranne agosto)'),
  ('flohmarkt-stuecki-basel', 'de', 'Mehrmals jährlich an einem Sonntag'),
  ('flohmarkt-stuecki-basel', 'en', 'Several Sundays a year'),
  ('flohmarkt-stuecki-basel', 'fr', 'Plusieurs dimanches par an'),
  ('flohmarkt-stuecki-basel', 'it', 'Diverse domeniche all''anno'),
  ('flohmi-schmittiplatz-pratteln', 'de', 'Zweimal jährlich, an einem Samstag im Frühling und im Herbst'),
  ('flohmi-schmittiplatz-pratteln', 'en', 'Twice a year, on a Saturday in spring and in autumn'),
  ('flohmi-schmittiplatz-pratteln', 'fr', 'Deux fois par an, un samedi au printemps et un en automne'),
  ('flohmi-schmittiplatz-pratteln', 'it', 'Due volte all''anno, un sabato in primavera e uno in autunno'),
  ('flosch-schwamendingen-zuerich', 'de', 'Meist am letzten Samstag des Monats, Februar–November'),
  ('flosch-schwamendingen-zuerich', 'en', 'Usually the last Saturday of the month, February–November'),
  ('flosch-schwamendingen-zuerich', 'fr', 'Généralement le dernier samedi du mois, de février à novembre'),
  ('flosch-schwamendingen-zuerich', 'it', 'Di solito l''ultimo sabato del mese, da febbraio a novembre'),
  ('gaenggali-markt-chur', 'de', 'Meist am ersten Samstag, April bis Dezember'),
  ('gaenggali-markt-chur', 'en', 'Usually the first Saturday, April to December'),
  ('gaenggali-markt-chur', 'fr', 'Généralement le premier samedi, d''avril à décembre'),
  ('gaenggali-markt-chur', 'it', 'Di solito il primo sabato, da aprile a dicembre'),
  ('hallenflohmarkt-markthalle-basel', 'de', 'Einmal monatlich an einem Wochenende (Samstag und Sonntag), Daten variieren'),
  ('hallenflohmarkt-markthalle-basel', 'en', 'Once a month over a weekend (Saturday and Sunday), dates vary'),
  ('hallenflohmarkt-markthalle-basel', 'fr', 'Une fois par mois, sur un week-end (samedi et dimanche), dates variables'),
  ('hallenflohmarkt-markthalle-basel', 'it', 'Una volta al mese, nel fine settimana (sabato e domenica), date variabili'),
  ('les-puces-du-cpo-lausanne', 'de', 'Jeden Donnerstag, ausser an Feiertagen und in den Weihnachts- und Sommerferien'),
  ('les-puces-du-cpo-lausanne', 'en', 'Every Thursday, except public holidays and the Christmas and summer holidays'),
  ('les-puces-du-cpo-lausanne', 'fr', 'Chaque jeudi, sauf jours fériés et vacances de Noël et d''été'),
  ('les-puces-du-cpo-lausanne', 'it', 'Ogni giovedì, tranne i giorni festivi e le vacanze di Natale e d''estate'),
  ('marche-calabash-lausanne', 'de', 'Jeden 1. Sonntag im Monat, ganzjährig'),
  ('marche-calabash-lausanne', 'en', 'First Sunday of every month, all year'),
  ('marche-calabash-lausanne', 'fr', 'Chaque premier dimanche du mois, toute l''année'),
  ('marche-calabash-lausanne', 'it', 'Ogni prima domenica del mese, tutto l''anno'),
  ('mercato-delle-pulci-massagno', 'de', 'Zweimal jährlich, ein Nachmittag im Frühling und einer im Herbst'),
  ('mercato-delle-pulci-massagno', 'en', 'Twice a year, an afternoon in spring and one in autumn'),
  ('mercato-delle-pulci-massagno', 'fr', 'Deux fois par an, un après-midi au printemps et un en automne'),
  ('mercato-delle-pulci-massagno', 'it', 'Due volte all''anno, un pomeriggio in primavera e uno in autunno'),
  ('strandgut-flohmarkt-neubad-luzern', 'de', 'Meist am 1. und 3. Sonntag des Monats'),
  ('strandgut-flohmarkt-neubad-luzern', 'en', 'Usually the 1st and 3rd Sunday of the month'),
  ('strandgut-flohmarkt-neubad-luzern', 'fr', 'Généralement les 1er et 3e dimanches du mois'),
  ('strandgut-flohmarkt-neubad-luzern', 'it', 'Di solito la 1ª e la 3ª domenica del mese'),
  ('vide-grenier-echichens', 'de', 'Einmal jährlich, meist im November'),
  ('vide-grenier-echichens', 'en', 'Once a year, usually in November'),
  ('vide-grenier-echichens', 'fr', 'Une fois par an, généralement en novembre'),
  ('vide-grenier-echichens', 'it', 'Una volta all''anno, di solito a novembre');

do $$
declare n int;
begin
  -- An empty database (the CI schema test) has nothing to correct.
  if not exists (select 1 from public.markets) then return; end if;
  update public.markets m set recurrence_text = r.value, updated_at = now()
    from rhythm r where r.locale = 'de' and m.slug = r.slug;
  get diagnostics n = row_count;
  if n <> 14 then raise exception 'rhythm: expected 14 markets, got %', n; end if;
end $$;

insert into public.texts (entity_type, entity_id, locale, field, value)
select 'market', m.id, r.locale, 'recurrence_text', r.value
  from rhythm r join public.markets m on m.slug = r.slug
on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value, updated_at = now();

-- Dates and hours.
create temporary table occ_fix (slug text, action text, date date, start_time time, end_time time) on commit drop;
insert into occ_fix values
  ('hallenflohmarkt-hoelstein',         'delete', '2027-04-04', null, null),
  ('vide-dressing-flon-lausanne',       'delete', '2027-09-04', null, null),
  ('vide-dressing-flon-lausanne',       'delete', '2027-10-02', null, null),
  -- CPO: Christmas Eve and New Year's Eve fall in the Christmas holidays, Ascension is a holiday,
  -- and the Vaud school summer holidays run July to mid-August. A missing date is safer than a closed door.
  ('les-puces-du-cpo-lausanne',         'delete', '2026-12-24', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2026-12-31', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-05-06', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-07-08', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-07-15', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-07-22', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-07-29', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-08-05', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-08-12', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-08-19', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-12-23', null, null),
  ('les-puces-du-cpo-lausanne',         'delete', '2027-12-30', null, null),
  ('saeuliaemtler-flohmarkt-affoltern', 'hours',  '2026-10-31', '09:00', '16:00'),
  ('vide-grenier-echichens',            'insert', '2026-11-01', '09:00', '16:00'),
  ('vinyl-market-markthalle-basel',     'insert', '2027-02-06', '12:00', '21:00');

do $$
declare n int; want int;
begin
  -- An empty database (the CI schema test) has nothing to correct.
  if not exists (select 1 from public.markets) then return; end if;
  select count(*) into want from occ_fix where action = 'delete';
  delete from public.occurrences o using occ_fix f, public.markets m
   where f.action = 'delete' and m.slug = f.slug and o.market_id = m.id and o.date = f.date;
  get diagnostics n = row_count;
  if n <> want then raise exception 'delete: expected %, got %', want, n; end if;

  update public.occurrences o set start_time = f.start_time, end_time = f.end_time, updated_at = now()
    from occ_fix f, public.markets m
   where f.action = 'hours' and m.slug = f.slug and o.market_id = m.id and o.date = f.date;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'hours: expected 1, got %', n; end if;

  insert into public.occurrences (market_id, date, start_time, end_time, status, origin, confirmed_at)
  select m.id, f.date, f.start_time, f.end_time, 'confirmed', 'manual', now()
    from occ_fix f join public.markets m on m.slug = f.slug where f.action = 'insert';
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'insert: expected 2, got %', n; end if;
end $$;

-- Hours across every upcoming date.
update public.occurrences o set start_time = '08:00', updated_at = now()
  from public.markets m where m.slug = 'flosch-schwamendingen-zuerich' and o.market_id = m.id
   and o.date >= current_date and o.start_time = '07:00';
update public.occurrences o set start_time = '09:00', end_time = '18:00', updated_at = now()
  from public.markets m where m.slug = 'marche-calabash-lausanne' and o.market_id = m.id and o.date >= current_date;
update public.occurrences o set end_time = '19:00', updated_at = now()
  from public.markets m where m.slug = 'puces-de-nyon' and o.market_id = m.id and o.date >= current_date;

-- Kind, rain, setting — rain and setting only where we held nothing.
update public.markets set kind = 'kinderflohmarkt', updated_at = now() where slug = 'flohmarkt-gz-hirzenbach';
update public.markets set rain_policy = 'runs', updated_at = now()
 where slug in ('quartierflohmarkt-hirzbrunnen', 'flohmi-schmittiplatz-pratteln', 'flosch-schwamendingen-zuerich')
   and rain_policy is null;
update public.markets set setting = 'indoor', updated_at = now()
 where slug = 'hallenflohmarkt-markthalle-basel' and setting is null;

-- Organisers. Each row serves this one market only (checked 2026-10-08).
create temporary table org_fix (slug text, name text, channel text) on commit drop;
insert into org_fix values
  ('brocante-de-carouge-geneve',           'Association des Intérêts de Carouge', null),
  ('flohmarkt-aarau',                      'Kramer Brocki & Secondhand', null),
  ('flohmarkt-rueticenter-pratteln',       'Flohmarktkönig', null),
  ('flohmarkt-stuecki-basel',              'Flohmarktkönig', null),
  ('flohmi-schmittiplatz-pratteln',        'Flohmi Schmittiplatz', null),
  ('gaenggali-markt-chur',                 'Floh- und Gänggalimarkt Chur', 'https://flohmarkt-chur.ch/'),
  ('hallenflohmarkt-hoelstein',            'Marktverein Hölstein', null),
  ('mercato-delle-pulci-massagno',         'Associazione La Ghirlanda', null),
  ('musiker-flohmarkt-zuerich-kronensaal', 'Hotel Kronenhof', null);

do $$
declare n int;
begin
  -- An empty database (the CI schema test) has nothing to correct.
  if not exists (select 1 from public.markets) then return; end if;
  if exists (select 1 from org_fix f join public.markets m on m.slug = f.slug
              where (select count(*) from public.markets x where x.organiser_id = m.organiser_id) <> 1)
  then raise exception 'an organiser row serves more than one market'; end if;
  update public.organisers o set name = f.name, channel_value = coalesce(f.channel, o.channel_value), updated_at = now()
    from org_fix f join public.markets m on m.slug = f.slug where o.id = m.organiser_id;
  get diagnostics n = row_count;
  if n <> 9 then raise exception 'organisers: expected 9, got %', n; end if;
end $$;

-- Venues. Each row serves one market (checked). texts(venue, name, de) mirrors venues.name.
update public.venues v set address_line = 'Seestrasse 42, 3600 Thun', postal_code = '3600', updated_at = now()
  from public.markets m where m.slug = 'floh-und-antiquitaetenmarkt-schadaumaerit-thun' and v.id = m.venue_id;
update public.venues v set address_line = 'Schorenweg 33, 4058 Basel', postal_code = '4058', updated_at = now()
  from public.markets m where m.slug = 'quartierflohmarkt-hirzbrunnen' and v.id = m.venue_id;
update public.venues v set address_line = 'Seemättliweg 19, 4254 Liesberg', updated_at = now()
  from public.markets m where m.slug = 'liesberger-flohmarkt' and v.id = m.venue_id;
update public.texts t set value = 'Quais de Lutry', updated_at = now()
  from public.markets m where m.slug = 'vide-grenier-lutry' and t.entity_type = 'venue'
   and t.entity_id = m.venue_id and t.field = 'name' and t.value = 'Chemin de la Cantine';
update public.venues v set name = 'Quais de Lutry', address_line = 'Quais de Lutry, 1095 Lutry', updated_at = now()
  from public.markets m where m.slug = 'vide-grenier-lutry' and v.id = m.venue_id;

commit;
