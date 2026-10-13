-- Data the organisers' own pages contradict, each read and quoted on 2026-10-13
-- (intake/fixes/2026-10-13-conflicts/verified-*.json: claim, verdict, quote, URL).
-- The rewrite's writers raised 173 claims on 84 markets; a second, independent check on the
-- organiser's or commune's own page confirmed 57 (99 not confirmed, 46 unclear — a tourism
-- site or event listing never confirms). Of the 57, the description ones were already true in
-- the texts written that day; these are the data ones. Rain policy for Biasca (a fixed
-- reserve date a week later) has no value in our vocabulary and stays as it is; Biel keeps
-- its venue name — the market alternates between the old town and the Esplanade, which the
-- description says in four languages and one name cannot.
-- Dates and hours changed here are also in intake/sync-v1/keep-ours.json, or the weekly
-- copy from v1 would put the old values back.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;

  -- Places -------------------------------------------------------------------------------
  -- Kloten: on the army's driving-school ground at Oelberg; only the parking is at the
  -- airport (P6). Point from the organiser's own map link. flughafen-flohmarkt.ch/besucher
  update public.venues set name = 'Militär-Fahrschulplatz Oelberg', address_line = 'Oelbergweg', postal_code = '8302',
         point = extensions.st_setsrid(extensions.st_makepoint(8.571326, 47.450038), 4326)::extensions.geography, updated_at = now()
   where id = '8afa3f31-b417-43bd-a155-79a91d5a4b44' and name = 'Flughafen Zürich';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Kloten venue: updated %, expected 1', n; end if;

  -- Bern: the Grosse Halle and the Schützenmatte, Schützenmattstrasse 7; "Schützenweg 1"
  -- is another street, and the point sat 800 m off. flohmarkt.grossehalle.ch; point: the
  -- Reitschule on OpenStreetMap, beside the Schützenmatte.
  update public.venues set name = 'Grosse Halle & Schützenmatte', address_line = 'Schützenmattstrasse 7', postal_code = '3012',
         point = extensions.st_setsrid(extensions.st_makepoint(7.4407, 46.9530), 4326)::extensions.geography, updated_at = now()
   where id = 'b2517d78-aa9d-4e31-be5f-1c25d3c7774b' and name = 'Schützenweg 1';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Bern venue: updated %, expected 1', n; end if;

  -- Winterthur: Steinberggasse and Metzggasse. junge-altstadt.ch/event/kinderflohmi
  update public.venues set name = 'Steinberggasse & Metzggasse, Altstadt Winterthur', updated_at = now()
   where id = '8548ef73-4706-4e69-933a-ef9176024419' and name = 'Steinberggasse, Altstadt Winterthur';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Winterthur venue: updated %, expected 1', n; end if;

  -- Street numbers the organisers give: Wetzikon, Arbon.
  update public.venues set address_line = 'Rapperswilerstrasse 63', updated_at = now()
   where id = 'ffb456c7-fe7a-4665-bf52-b7b0a0b1f63a' and address_line = 'bei der Eishalle, 8620 Wetzikon';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Wetzikon address: updated %, expected 1', n; end if;
  update public.venues set address_line = 'Hamelstrasse 15', updated_at = now()
   where id = 'f025e662-9d2d-4cda-9949-21c218f31f3b' and address_line = 'Hamelstrasse';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Arbon address: updated %, expected 1', n; end if;

  update public.texts t set value = v.name, updated_at = now()
    from (values ('8afa3f31-b417-43bd-a155-79a91d5a4b44'::uuid, 'Militär-Fahrschulplatz Oelberg'),
                 ('b2517d78-aa9d-4e31-be5f-1c25d3c7774b'::uuid, 'Grosse Halle & Schützenmatte'),
                 ('8548ef73-4706-4e69-933a-ef9176024419'::uuid, 'Steinberggasse & Metzggasse, Altstadt Winterthur')) as v(id, name)
   where t.entity_type = 'venue' and t.entity_id = v.id and t.field = 'name';

  -- Rhythm lines and seasons ---------------------------------------------------------------
  create temporary table rhythm (slug text primary key, de text, en text, fr text, it text, season_from smallint, season_to smallint, set_season boolean) on commit drop;
  insert into rhythm values
    -- 6 Sep and 8 Nov 2026, "le DERNIER ... de l'année"; never October
    ('coffre-ouvert-oron', 'Mehrmals jährlich, an ausgewählten Sonntagen', 'Several times a year, on selected Sundays', 'Plusieurs fois par an, certains dimanches', 'Più volte l''anno, in alcune domeniche', null, null, true),
    -- "Nach langer Pause kehrt er endlich zurück", 2027, date to follow
    ('flodo-flohmarkt-solothurn', 'Nach einer langen Pause wieder ab 2027, Datum folgt', 'Back in 2027 after a long break, date to follow', 'De retour en 2027 après une longue pause, date à venir', 'Torna nel 2027 dopo una lunga pausa, data da definire', null, null, true),
    -- "2007: nur noch einmal jährlich – im Mai"
    ('flughafen-flohmarkt-kloten-zuerich', 'Einmal jährlich, im Mai', 'Once a year, in May', 'Une fois par an, en mai', 'Una volta all''anno, a maggio', 5, 5, true),
    -- 2026 from 29 March to 1 November
    ('grosser-flohmarkt-thun', 'Mehrere Sonntage pro Jahr, März bis November', 'Several Sundays a year, March to November', 'Plusieurs dimanches par an, de mars à novembre', 'Diverse domeniche l''anno, da marzo a novembre', 3, 11, true),
    -- editions in May and September (2023–2026)
    ('kofmehl-flohmi-solothurn', 'Ein- bis zweimal jährlich, an einem Samstag im Mai oder September', 'Once or twice a year, on a Saturday in May or September', 'Une ou deux fois par an, un samedi de mai ou de septembre', 'Una o due volte l''anno, un sabato di maggio o di settembre', 5, 9, true),
    -- "25 Stunden, 2 Länder, 1 Flohmarkt"
    ('grenzueberschreitender-flohmarkt-kreuzlingen-konstanz', 'Jährlich, ein Wochenende im Juni, 25 Stunden', 'Once a year, a weekend in June, 25 hours', 'Une fois par an, un week-end de juin, pendant 25 heures', 'Una volta all''anno, un fine settimana di giugno, per 25 ore', null, null, false),
    -- "2026 finden nur 3 Flohmärkte statt", all Saturdays, April to October
    ('flohmarkt-wetzikon', 'Mehrmals jährlich, samstags, von Frühling bis Herbst', 'A few times a year, on Saturdays, spring to autumn', 'Quelques fois par an, le samedi, du printemps à l''automne', 'Alcune volte l''anno, di sabato, dalla primavera all''autunno', 4, 10, true),
    -- "Einmal im Monat am Sonntag von 10-15 Uhr"
    ('fundus-flohmarkt-arena-root', 'Einmal im Monat, sonntags', 'Once a month, on Sundays', 'Une fois par mois, le dimanche', 'Una volta al mese, di domenica', null, null, false),
    -- "alle zwei Wochen sonntags", season April into October, dry weather
    ('quartier-flohmarkt-areal-bach', 'Alle zwei Wochen sonntags, April bis Oktober, bei trockenem Wetter', 'Every other Sunday, April to October, in dry weather', 'Un dimanche sur deux, d''avril à octobre, par temps sec', 'Una domenica ogni due, da aprile a ottobre, con il tempo asciutto', 4, 10, true),
    -- one edition shown, Sunday 19 April 2026; the page does not say yearly
    ('quartierflohmarkt-pratteln-gehrenacker', 'Ein Sonntag im April', 'A Sunday in April', 'Un dimanche d''avril', 'Una domenica di aprile', 4, 4, true),
    -- Saturday 8 August 2026
    ('quartierflohmarkt-st-johann', 'Einmal jährlich, ein Samstag im August', 'Once a year, a Saturday in August', 'Une fois par an, un samedi d''août', 'Una volta all''anno, un sabato di agosto', 8, 8, true),
    -- Saturday 25 April 2026, no autumn edition
    ('quartierflohmi-reinach-nord', 'Einmal jährlich, ein Samstag im Frühling', 'Once a year, a Saturday in spring', 'Une fois par an, un samedi de printemps', 'Una volta all''anno, un sabato di primavera', 4, 4, true),
    -- 30 May 2026, 5 June 2027
    ('subiger-dorf-flohmarkt', 'Jährlich, Ende Mai oder Anfang Juni', 'Once a year, late May or early June', 'Une fois par an, fin mai ou début juin', 'Una volta all''anno, a fine maggio o inizio giugno', 5, 6, true),
    -- the Christmas market on 28 Nov 2026 is a Saturday
    ('talkessel-flohmarkt-seewen', 'Mehrmals jährlich, meist sonntags, in der Halle', 'Several times a year, mostly on Sundays, indoors', 'Plusieurs fois par an, surtout le dimanche, en salle', 'Più volte l''anno, per lo più di domenica, al coperto', null, null, false);

  update public.markets m set recurrence_text = r.de, updated_at = now()
    from rhythm r where m.slug = r.slug;
  get diagnostics n = row_count;
  if n <> 14 then raise exception 'rhythm: updated %, expected 14', n; end if;
  update public.markets m set season_from = r.season_from, season_to = r.season_to
    from rhythm r where m.slug = r.slug and r.set_season;

  insert into public.texts (entity_type, entity_id, locale, field, value)
  select 'market', m.id, l.locale, 'recurrence_text', l.value
    from rhythm r join public.markets m on m.slug = r.slug
    cross join lateral (values ('de', r.de), ('en', r.en), ('fr', r.fr), ('it', r.it)) as l(locale, value)
  on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value, updated_at = now();

  -- Facts --------------------------------------------------------------------------------
  -- "Ca. 80 Aussteller" ambiente-brocante.ch/events
  update public.markets set stall_count = 80, updated_at = now() where slug = 'antik-flohmarkt-fehraltorf' and stall_count = 75;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Fehraltorf stalls: updated %, expected 1', n; end if;
  -- "Der Quartierflohmarkt richtet sich an Private" mach-mit.pratteln.ch/quartierflohmarkt
  update public.markets set seller_mix = 'private', updated_at = now() where slug = 'quartierflohmarkt-pratteln-gehrenacker' and seller_mix is null;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Pratteln sellers: updated %, expected 1', n; end if;
  -- Fribourg, Place Python: the city calls this last-Saturday market a vide-grenier and gives
  -- no stall count for it (30–50 is the first-Saturday market's); its page, not tourism's.
  update public.markets set stall_count = null, website_url = 'https://www.ville-fribourg.ch/marches-fribourg', updated_at = now()
   where slug = 'marche-aux-puces-fribourg-place-python' and stall_count = 30;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Fribourg: updated %, expected 1', n; end if;

  -- The facts ledger: each changed fact with the page it was read on; the value it replaces
  -- points at it.
  declare f record; new_id uuid;
  begin
    for f in select m.id, x.field, x.value, x.url
               from (values ('antik-flohmarkt-fehraltorf', 'stall_count', '80', 'https://www.ambiente-brocante.ch/events'),
                            ('quartierflohmarkt-pratteln-gehrenacker', 'seller_mix', 'private', 'https://mach-mit.pratteln.ch/quartierflohmarkt')) as x(slug, field, value, url)
               join public.markets m on m.slug = x.slug
    loop
      insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
      values ('market', f.id, f.field, to_jsonb(f.value), 'website_crawl', f.url, now(), 'confirmed') returning id into new_id;
      update public.facts set superseded_by = new_id
       where entity_type = 'market' and entity_id = f.id and field = f.field and superseded_by is null and id <> new_id;
    end loop;
  end;

  -- Dates and hours ----------------------------------------------------------------------
  -- Bulle: "Mardi 24 novembre 2026, de 18h00 à 21h00"
  update public.occurrences o set end_time = '21:00', updated_at = now()
    from public.markets m where m.id = o.market_id and m.slug = 'alpin-flohmi-bulle' and o.date = '2026-11-24';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Bulle hours: updated %, expected 1', n; end if;
  -- Enter, Derendingen: 12 Dec "10.00 – 16.00 Uhr"
  update public.occurrences o set end_time = '16:00', updated_at = now()
    from public.markets m where m.id = o.market_id and m.slug = 'enter-flohmarkt-derendingen' and o.date = '2026-12-12';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Enter hours: updated %, expected 1', n; end if;
  -- Kloten: "zwischen 07:00 und 16:00 Uhr geöffnet"
  update public.occurrences o set start_time = '07:00', end_time = '16:00', updated_at = now()
    from public.markets m where m.id = o.market_id and m.slug = 'flughafen-flohmarkt-kloten-zuerich' and o.date = '2027-05-22';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Kloten hours: updated %, expected 1', n; end if;

  -- Oron: "Dimanche 8 Novembre Oron-la-Ville dés 6h.30 à 17h.00"
  -- Flumserei: "Samstag, 3. April 2027, 8 – 16 Uhr / Samstag, 25. September 2027, 8 – 16 Uhr"
  insert into public.occurrences (market_id, date, start_time, end_time, status, origin, confirmed_at)
  select m.id, d.date::date, d.s::time, d.e::time, 'confirmed', 'manual', now()
    from (values ('coffre-ouvert-oron', '2026-11-08', '06:30', '17:00'),
                 ('hallen-flohmarkt-flumserei', '2027-04-03', '08:00', '16:00'),
                 ('hallen-flohmarkt-flumserei', '2027-09-25', '08:00', '16:00')) as d(slug, date, s, e)
    join public.markets m on m.slug = d.slug
   where not exists (select 1 from public.occurrences o where o.market_id = m.id and o.date = d.date::date);
  get diagnostics n = row_count;
  if n <> 3 then raise exception 'new dates: inserted %, expected 3', n; end if;
end $$;

commit;
