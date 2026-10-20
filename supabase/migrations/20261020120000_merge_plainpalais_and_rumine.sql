-- Plainpalais (Geneva) and Rumine (Lausanne) are one market each again (Delfim, 2026-10-20).
--
-- The import split each into one market per weekday — Plainpalais into Wednesday,
-- Saturday and first Sunday, Rumine into Tuesday, Wednesday, Friday and Saturday —
-- so the site carried seven pages (28 with the languages) for two markets: the same
-- name, square, organiser and photo, which is the one-page-per-day pattern Google's
-- spam rules name, and it made Geneva read "4 markets" where there are two.
--
-- The hub of each series (`hub_market_id`, set at import) carries on as the market:
--   * every date of the others moves to it — no two share a day, checked below — and
--     with them every answer, alert and fact hung on a date (keyed by occurrence id);
--   * it takes a slug without a weekday in every language; the old one stays in the
--     ledger, retired, and 301s to the new (scripts/redirects.mjs RETIRED);
--   * its text and rhythm line say all the days (written from the seven texts, nothing new).
-- The others close, keep their hub link and their slugs: closed with a live hub is
-- "merged", and their addresses 301 to the hub (scripts/redirects.mjs ENDED). They keep
-- their `markets.slug` too — v1 still lists seven markets, and sync-v1 matches by that
-- slug, then follows the hub link to file each date under the market that holds it.
begin;

do $$
declare
  hub_pp uuid; hub_ru uuid; n int;
begin
  if not exists (select 1 from public.markets) then return; end if;

  select id into hub_pp from public.markets where slug = 'marche-aux-puces-plainpalais-geneve-erster-sonntag';
  select id into hub_ru from public.markets where slug = 'marche-rumine-lausanne-mardi';
  if hub_pp is null or hub_ru is null then raise exception 'merge: a hub is missing'; end if;

  select count(*) into n from public.markets where hub_market_id in (hub_pp, hub_ru) and status = 'active';
  if n <> 5 then raise exception 'merge: % active markets point at the two hubs, expected 5', n; end if;

  -- No two markets of a series may hold the same day, or the move below would break
  -- occurrences_market_id_date_key halfway through.
  if exists (
    select 1 from public.occurrences o join public.markets m on m.id = o.market_id
     where coalesce(m.hub_market_id, m.id) in (hub_pp, hub_ru)
     group by coalesce(m.hub_market_id, m.id), o.date having count(*) > 1
  ) then raise exception 'merge: two markets of one series share a date'; end if;

  -- 1. Every date to the hub.
  update public.occurrences o set market_id = m.hub_market_id, updated_at = now()
    from public.markets m
   where m.id = o.market_id and m.hub_market_id in (hub_pp, hub_ru) and m.status = 'active';
  get diagnostics n = row_count;
  if n < 400 then raise exception 'merge: moved % dates, expected over 400', n; end if;

  -- 2. The others close; the hub link stays and is what makes "closed" read as "merged".
  update public.markets set status = 'permanently_closed'
   where hub_market_id in (hub_pp, hub_ru) and status = 'active';
  get diagnostics n = row_count;
  if n <> 5 then raise exception 'merge: closed %, expected 5', n; end if;

  -- 3. A slug without a weekday, in every language the hub has. Inserted, the old one
  --    retired — never renamed in place (the slug ledger).
  update public.slugs set is_current = false
   where entity_type = 'market' and entity_id in (hub_pp, hub_ru) and is_current;
  get diagnostics n = row_count;
  if n <> 8 then raise exception 'merge: retired % hub slugs, expected 8', n; end if;
  insert into public.slugs (entity_type, entity_id, locale, slug, is_current)
  select 'market', id, locale, s, true
    from (values (hub_pp, 'marche-aux-puces-plainpalais-geneve'), (hub_ru, 'marche-rumine-lausanne')) as h(id, s)
   cross join (values ('de'), ('fr'), ('it'), ('en')) as l(locale);

  -- 4. The rhythm line: German on the market row, the rest in texts.
  update public.markets set recurrence_text = 'Jeden Mittwoch und Samstag, ganzjährig (ausser 1. August), dazu jeden 1. Sonntag des Monats' where id = hub_pp;
  update public.markets set recurrence_text = 'Jeden Dienstag, Mittwoch, Freitag und Samstag seit März 2026' where id = hub_ru;

  insert into public.texts (entity_type, entity_id, locale, field, value)
  values
    ('market', hub_pp, 'en', 'recurrence_text', 'Every Wednesday and Saturday, all year (except 1 August), and every 1st Sunday of the month'),
    ('market', hub_pp, 'fr', 'recurrence_text', 'Chaque mercredi et samedi, toute l''année (sauf le 1er août), et chaque 1er dimanche du mois'),
    ('market', hub_pp, 'it', 'recurrence_text', 'Ogni mercoledì e sabato, tutto l''anno (tranne il 1° agosto), e ogni 1ª domenica del mese'),
    ('market', hub_ru, 'en', 'recurrence_text', 'Every Tuesday, Wednesday, Friday and Saturday since March 2026'),
    ('market', hub_ru, 'fr', 'recurrence_text', 'Chaque mardi, mercredi, vendredi et samedi depuis mars 2026'),
    ('market', hub_ru, 'it', 'recurrence_text', 'Ogni martedì, mercoledì, venerdì e sabato da marzo 2026'),

  -- 5. One text for the whole market, from what the seven said — no new claim.
    ('market', hub_pp, 'de', 'description', 'Der Genfer Flohmarkt füllt die Plaine de Plainpalais an mehreren Tagen pro Woche, das ganze Jahr hindurch: Der Platz dient schon seit 1970 als Marktplatz. Rund 300 Händler stehen auf der Liste. Manche haben einen festen Platz, andere kommen tageweise und stellen sich entlang der Strecke auf; wie viele es sind, hängt vom Wetter ab. Auf den Tischen liegen Möbel, Gemälde, Geschirr, Krimskrams, Bücher, Zeitschriften, Platten, CDs und Kleider, und neben Fachleuten schlendern viele Neugierige durch. Die tpg-Haltestelle Plainpalais liegt gleich beim Platz. Am Nationalfeiertag, dem 1. August, bleibt der Markt geschlossen.'),
    ('market', hub_pp, 'fr', 'description', 'Le marché aux puces de Genève occupe la plaine de Plainpalais plusieurs jours par semaine, toute l''année : la plaine sert de place de marché depuis 1970. Quelque 300 marchands figurent sur la liste. Certains ont une place fixe, d''autres viennent au jour le jour et s''installent le long du parcours ; leur nombre varie avec la météo. Sur les tables : meubles, tableaux, vaisselle, bibelots, livres, magazines, disques, CD et vêtements ; spécialistes et simples curieux s''y croisent. L''arrêt tpg Plainpalais est juste à côté de la place. Le 1er août, fête nationale, le marché fait relâche.'),
    ('market', hub_pp, 'it', 'description', 'Il mercato delle pulci di Ginevra occupa la Plaine de Plainpalais diversi giorni a settimana, tutto l''anno: la spianata fa da piazza del mercato dal 1970. I commercianti in elenco sono circa 300. Alcuni hanno un posto fisso, altri arrivano giorno per giorno e si sistemano lungo il percorso; il loro numero varia con il tempo. Sui banchi: mobili, dipinti, stoviglie, cianfrusaglie, libri, riviste, dischi, CD e vestiti, e tra i banchi si incontrano esperti e semplici curiosi. La fermata tpg Plainpalais è proprio accanto alla piazza. Il 1° agosto, festa nazionale, il mercato resta chiuso.'),
    ('market', hub_pp, 'en', 'description', 'Geneva''s flea market fills the Plaine de Plainpalais several days a week, all year round: the plain has been a market ground since 1970. Around 300 traders are on the list. Some keep a fixed pitch, others come day by day and set up along the route, and how many appear depends on the weather. On the tables: furniture, paintings, crockery, knick-knacks, books, magazines, records, CDs and clothes, with specialists and curious strollers side by side. The tpg stop Plainpalais is right by the square. On 1 August, the national holiday, the market takes a day off.'),
    ('market', hub_ru, 'de', 'description', 'An vier Tagen pro Woche stellt die Stadt Lausanne auf der Place de la Riponne, vor dem Palais de Rumine, Stände ohne Lebensmittel auf: Möbel, Kleider, Schuhe, Bücher und Kunsthandwerk, viel Neues wie Textilien, dazu Gebrauchtes und Kurioses zum Stöbern. Die Stadt beschreibt den Markt als Ort für ausgefallene Entdeckungen. An zwei der Tage läuft er den ganzen Tag, an den anderen beiden ist er ein Vormittagsmarkt, am frühen Nachmittag vorbei. Die Metrostation Riponne–Maurice Béjart liegt nur wenige Schritte vom Platz entfernt.'),
    ('market', hub_ru, 'fr', 'description', 'Quatre jours par semaine, la Ville de Lausanne installe sur la place de la Riponne, devant le palais de Rumine, des stands qui vendent tout sauf de l''alimentaire : meubles, vêtements, chaussures, livres et artisanat, beaucoup de neuf comme des textiles, et de la seconde main et des objets insolites à dénicher. La Ville le décrit comme un lieu où chiner. Deux de ces jours, le marché dure toute la journée ; les deux autres, c''est un marché du matin, terminé en début d''après-midi. La station de métro Riponne–Maurice Béjart n''est qu''à quelques pas de la place.'),
    ('market', hub_ru, 'it', 'description', 'Quattro giorni a settimana la Città di Losanna allestisce sulla Place de la Riponne, davanti al Palais de Rumine, bancarelle che vendono tutto tranne il cibo: mobili, vestiti, scarpe, libri e artigianato, molto nuovo come i tessili, e oggetti usati e curiosi da scovare. La Città lo descrive come un posto dove curiosare. Due di questi giorni il mercato dura tutta la giornata; negli altri due è un mercato del mattino, finito a inizio pomeriggio. La stazione della metropolitana Riponne–Maurice Béjart è a pochi passi dalla piazza.'),
    ('market', hub_ru, 'en', 'description', 'Four days a week, the City of Lausanne fills the Place de la Riponne, in front of the Palais de Rumine, with stalls that sell everything except food: furniture, clothes, shoes, books and crafts, plenty of new goods such as textiles, and secondhand and curious things to dig out. The city calls it a place to rummage and turn up unusual objects. Two of the days run all day; the other two are morning markets, over by early afternoon. The metro station Riponne–Maurice Béjart is a few steps from the square.')
  on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value, updated_at = now();

  -- 6. What a visitor saved, asked about or reported on a merged market belongs to the hub.
  --    None on 2026-10-20; here so the merge is whole if one arrives before it runs.
  update public.saved_markets s set market_id = m.hub_market_id from public.markets m
   where m.id = s.market_id and m.hub_market_id in (hub_pp, hub_ru)
     and not exists (select 1 from public.saved_markets x where x.subscriber_id = s.subscriber_id and x.market_id = m.hub_market_id);
  update public.date_alerts a set market_id = m.hub_market_id from public.markets m
   where m.id = a.market_id and m.hub_market_id in (hub_pp, hub_ru)
     and not exists (select 1 from public.date_alerts x where x.email = a.email and x.market_id = m.hub_market_id);
end $$;

commit;
