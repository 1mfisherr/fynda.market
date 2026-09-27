-- Addresses, times and one name the facts pass found wrong, checked
-- 2026-09-28 against the organisers' own pages. Coordinates from
-- OpenStreetMap (Nominatim), matching the organisers' street addresses.
--
-- Alpin-Flohmi Yverdon (29 Oct 2026): the venue was the town itself. It is
-- the Maison de Paroisse, Rue Pestalozzi 6, Thursday 18:00-21:00
-- (mountainwilderness.ch/fr/themen/marche-aux-puces-alpin/).
--
-- Alpin-Flohmi Bulle (24 Nov 2026): the club house of CAS La Gruyère,
-- Chemin de Bouleyres 79, 18:00-21:30 (cas-gruyere.ch/events/march-aux-puces-alpin/).
-- The pin sat 600 m away in the town centre.
--
-- Quartierflohmarkt St. Johann, Basel: on file at Elsässerstrasse 2, which
-- is the city's bring&nimm swap point. The market is spread over the quarter;
-- its one organised meeting point is the square in front of the Zentrum
-- Johannes, Mülhauserstrasse 145 (quartierflohmibasel.ch/de/st-johann/info/).
--
-- Obere Mühle Dübendorf: two markets a year, a spring and a summer one
-- (oberemuehle.ch). The listing was named "Sommer-Flohmarkt" while its next
-- date is the spring one; the name now covers both.

begin;

update public.venues
   set name = 'Maison de Paroisse', address_line = 'Rue Pestalozzi 6, 1400 Yverdon-les-Bains',
       postal_code = '1400', point = ST_SetSRID(ST_MakePoint(6.6403408, 46.7772143), 4326)::geography,
       updated_at = now()
 where id = (select venue_id from public.markets where slug = 'alpin-flohmi-yverdon-les-bains');

update public.occurrences set start_time = '18:00', end_time = '21:00', updated_at = now()
 where market_id = (select id from public.markets where slug = 'alpin-flohmi-yverdon-les-bains')
   and date = '2026-10-29';

update public.venues
   set name = 'CAS Section La Gruyère', address_line = 'Chemin de Bouleyres 79, 1630 Bulle',
       postal_code = '1630', point = ST_SetSRID(ST_MakePoint(7.0654529, 46.6157571), 4326)::geography,
       updated_at = now()
 where id = (select venue_id from public.markets where slug = 'alpin-flohmi-bulle');

update public.occurrences set start_time = '18:00', end_time = '21:30', updated_at = now()
 where market_id = (select id from public.markets where slug = 'alpin-flohmi-bulle')
   and date = '2026-11-24';

update public.venues
   set name = 'Zentrum Johannes', address_line = 'Mülhauserstrasse 145, 4056 Basel',
       postal_code = '4056', point = ST_SetSRID(ST_MakePoint(7.5747116, 47.5656144), 4326)::geography,
       updated_at = now()
 where id = (select venue_id from public.markets where slug = 'quartierflohmarkt-st-johann');

update public.texts t set value = 'Flohmarkt Obere Mühle Dübendorf', updated_at = now()
 where t.entity_type = 'market' and t.field = 'name'
   and t.entity_id = (select id from public.markets where slug = 'flohmarkt-obere-muehle-duebendorf');

update public.markets set recurrence_text = 'Zweimal jährlich, im Frühling und im Sommer', updated_at = now()
 where slug = 'flohmarkt-obere-muehle-duebendorf';
update public.texts t set value = v.value, updated_at = now()
  from (values ('en', 'Twice a year, in spring and summer'),
               ('fr', 'Deux fois par an, au printemps et en été'),
               ('it', 'Due volte all''anno, in primavera e in estate')) as v(locale, value)
 where t.entity_type = 'market' and t.field = 'recurrence_text' and t.locale = v.locale
   and t.entity_id = (select id from public.markets where slug = 'flohmarkt-obere-muehle-duebendorf');

commit;
