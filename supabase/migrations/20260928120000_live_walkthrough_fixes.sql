-- What a phone walkthrough of the live site found on 2026-09-28, checked
-- against the organisers' own pages the same day.
--
-- Marché de Rumine, Tuesday and Friday: the rhythm line promised "until 16:30
-- in winter". The city's page gives one set of hours all year — Tuesday and
-- Friday 09:30-18:00, Wednesday and Saturday 08:30-13:00 (lausanne.ch,
-- marche-de-rumine.html). The dates already say 18:00; the line was the
-- only thing wrong.
--
-- Zentralmarkt at the Dampfzentrale, Bern: "last Sunday, April to October".
-- The organiser's 2026 dates run 26 April to 27 September, "immer am letzten
-- Sonntag bis September" (zentralmarkt.be). The market is run by the
-- Zentralmarkt, not by the Dampfzentrale.
--
-- Flohmarkt Barfüsserplatz, Basel, was reported as missing dates. It is not:
-- the city lists none after 23 September (no market in October, the
-- Herbstmesse has the square; November and December not yet published).
-- Nothing changes for it.
--
-- Place names that were sentences. The place line is shown on every locale,
-- so it carries a name and nothing else (CLAUDE.md: nothing shared across
-- locales is German, or English). "bei der Eishalle" and "Karte auf
-- kreisflohmi.ch" read as German prose on the English and French pages.
--
-- Flohdom Bahrenfeld's 3 October cancellation carried our own provenance as
-- its reason, "Einmalig abgesagt (KREAKTIVA, kreaktiva.de)", printed on every
-- locale. The status already says cancelled; the source belongs to us.

begin;

-- Rumine
update public.markets
   set recurrence_text = regexp_replace(recurrence_text, ' \(Sommer bis 18:00, Winter bis 16:30\)$', ''), updated_at = now()
 where slug in ('marche-rumine-lausanne-mardi', 'marche-rumine-lausanne-vendredi');

update public.texts t
   set value = regexp_replace(value, ' \((until 18:00 in summer, 16:30 in winter|jusqu''à 18h00 en été, 16h30 en hiver|fino alle 18:00 in estate, 16:30 in inverno)\)$', ''), updated_at = now()
  from public.markets m
 where t.entity_type = 'market' and t.entity_id = m.id and t.field = 'recurrence_text'
   and m.slug in ('marche-rumine-lausanne-mardi', 'marche-rumine-lausanne-vendredi');

-- Dampfzentrale
update public.markets
   set recurrence_text = 'Letzter Sonntag des Monats, April–September', updated_at = now()
 where slug = 'flohmarkt-dampfzentrale-bern';

update public.texts t
   set value = v.value, updated_at = now()
  from public.markets m,
       (values
         ('en', 'recurrence_text', 'Last Sunday of the month, April to September'),
         ('fr', 'recurrence_text', 'Dernier dimanche du mois, d''avril à septembre'),
         ('it', 'recurrence_text', 'Ultima domenica del mese, da aprile a settembre'),
         ('de', 'description', 'Markt rund um das Kulturzentrum Dampfzentrale an der Aare: Vintage-Kleider, Designobjekte, Bücher und Secondhand, am letzten Sonntag des Monats von April bis September, bei jedem Wetter. Eintritt frei; organisiert vom Zentralmarkt.'),
         ('en', 'description', 'A market around the Dampfzentrale cultural centre on the Aare: vintage clothing, design objects, books and secondhand, on the last Sunday of the month from April to September, in any weather. Free entry; run by the Zentralmarkt.'),
         ('fr', 'description', 'Marché autour du centre culturel Dampfzentrale, au bord de l''Aar : vêtements vintage, objets design, livres et seconde main, le dernier dimanche du mois d''avril à septembre, par tous les temps. Entrée libre ; organisé par le Zentralmarkt.'),
         ('it', 'description', 'Mercato attorno al centro culturale Dampfzentrale, sull''Aar: abiti vintage, oggetti di design, libri e usato, l''ultima domenica del mese da aprile a settembre, con ogni tempo. Ingresso libero; organizzato dallo Zentralmarkt.')
       ) as v(locale, field, value)
 where t.entity_type = 'market' and t.entity_id = m.id and m.slug = 'flohmarkt-dampfzentrale-bern'
   and t.locale = v.locale and t.field = v.field;

-- Place names. texts(venue, name, de) mirrors venues.name and moves with it.
create temporary table venue_rename (old text primary key, new text not null) on commit drop;
insert into venue_rename values
  ('Privatgrund im jeweiligen Stadtkreis – Karte auf kreisflohmi.ch', 'Zürcher Stadtkreise'),
  ('Quartier Reinach Nord – Karte auf qvrn.ch',                        'Quartier Reinach Nord'),
  ('bei der Eishalle',                                                 'Eishalle Wetzikon'),
  ('Vom Alexanderplatz bis zum Bahnhof (Bahnhofstrasse)',              'Alexanderplatz – Bahnhofstrasse'),
  ('Am Kupfergraben, gegenüber dem Bode-Museum',                       'Am Kupfergraben (Bode-Museum)'),
  ('John-F.-Kennedy-Platz, vor dem Rathaus Schöneberg',                'John-F.-Kennedy-Platz (Rathaus Schöneberg)'),
  ('Leopoldplatz, vor der Alten Nazarethkirche',                       'Leopoldplatz (Alte Nazarethkirche)'),
  ('Parkplatz zwischen Hohenzollerndamm und Preußenpark',              'Fehrbelliner Platz (Preußenpark)'),
  ('Sarnen-Center, zwischen Coop und Migros',                          'Sarnen-Center'),
  ('Unter der Leporello-Brücke, bei der Kulturfabrik Kofmehl',         'Kulturfabrik Kofmehl'),
  ('Seestrasse Kreuzlingen (und Klein Venedig, Konstanz)',             'Seestrasse Kreuzlingen / Klein Venedig Konstanz'),
  ('Cour du Vieux-Collège (et Esplanade du Crochetan)',                'Cour du Vieux-Collège / Esplanade du Crochetan'),
  ('Autour du Château de Prilly',                                      'Château de Prilly'),
  ('Place vers Denner, Chemin de la Charrettaz 10',                    'Chemin de la Charrettaz 10'),
  ('Stedtli: Zeughausplatz, Rosengasse und Kanonengasse',              'Zeughausplatz, Rosengasse, Kanonengasse'),
  ('Quartiere Säli, Bruch und Obergütsch',                             'Säli, Bruch, Obergütsch'),
  ('Rathus-Schüür und Schulhausplatz Marktgasse',                      'Rathus-Schüür / Schulhausplatz Marktgasse'),
  ('Stiftstheater Beromünster (Festsaal und Schol)',                   'Stiftstheater Beromünster'),
  ('Parkflächen der TU Dortmund',                                      'TU Dortmund'),
  ('Rheinpromenade, between Hohenzollernbrücke and Bastei',            'Rheinpromenade (Altstadt)'),
  ('Schaumainkai (Museumsufer), between Untermainbrücke and Holbeinsteg', 'Schaumainkai (Museumsufer)'),
  ('Rheinufer zwischen Kaisertor und Theodor-Heuss-Brücke',            'Rheinufer (Kaisertor – Theodor-Heuss-Brücke)');

do $$
declare missing int;
begin
  select count(*) into missing from venue_rename r where not exists (select 1 from public.venues v where v.name = r.old);
  if missing > 0 then raise exception '% venue name(s) not found — nothing renamed', missing; end if;
end $$;

update public.texts t set value = r.new, updated_at = now()
  from venue_rename r, public.venues v
 where v.name = r.old and t.entity_type = 'venue' and t.entity_id = v.id and t.field = 'name' and t.value = r.old;

update public.venues v set name = r.new, updated_at = now()
  from venue_rename r where v.name = r.old;

-- Flohdom Bahrenfeld, 3 October
update public.occurrences set cancellation_note = null, updated_at = now()
 where cancellation_note = 'Einmalig abgesagt (KREAKTIVA, kreaktiva.de)';

commit;
