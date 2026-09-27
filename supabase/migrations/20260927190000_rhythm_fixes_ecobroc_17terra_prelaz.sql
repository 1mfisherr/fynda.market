-- Three rhythms that said something the organisers do not, 2026-09-27.
--
-- Found by the facts pass; the evidence came from Delfim the same day.
--
-- EcoBroc Saxon: the organiser's 2026 poster (ecobroc.ch) lists one Saturday
-- a month, March to October, 9:00-17:00 — 28 Mar, 25 Apr, 30 May, 27 Jun,
-- 18 Jul, 29 Aug, 26 Sep, 31 Oct. "Several times a year" undersold it, and
-- the 31 Oct date an agent thought cancelled is on the poster.
--
-- Galerie 17 Terra, Geneva: an in-shop brocante ("Magasin au rez"), a week at
-- a time. The rhythm said the first week of every month, Monday to Saturday;
-- the gallery's own poster shows 23-28 March, and September ran Wednesday to
-- Sunday. Monthly-ish holds, the first week and the weekdays do not.
--
-- Vide-grenier Prélaz-Valency, Lausanne: one weekend only. It was part of the
-- city's Caravane des quartiers, which stops in a different quarter each year
-- (City of Lausanne press release, 29-31 May 2026, vide-grenier on the chemin
-- de Renens on the Saturday and Sunday). "Once a year" promised a return that
-- will not happen. Whether a page for a market that has ended should stay is
-- Delfim's call; until then the page tells the truth.

begin;

-- EcoBroc
update public.markets set recurrence_text = 'Ein Samstag im Monat, März bis Oktober', updated_at = now()
 where slug = 'vide-grenier-ecobroc-saxon';
update public.texts t set value = v.value, updated_at = now()
  from (values ('en', 'One Saturday a month, March to October'),
               ('fr', 'Un samedi par mois, de mars à octobre'),
               ('it', 'Un sabato al mese, da marzo a ottobre')) as v(locale, value)
 where t.entity_type = 'market' and t.field = 'recurrence_text' and t.locale = v.locale
   and t.entity_id = (select id from public.markets where slug = 'vide-grenier-ecobroc-saxon');

-- Galerie 17 Terra
update public.markets set recurrence_text = 'Etwa einmal im Monat, jeweils eine Woche lang', updated_at = now()
 where slug = 'brocante-17-terra-geneve';
update public.texts t set value = v.value, updated_at = now()
  from (values ('en', 'Roughly once a month, a week at a time'),
               ('fr', 'Environ une fois par mois, une semaine à la fois'),
               ('it', 'Circa una volta al mese, una settimana alla volta')) as v(locale, value)
 where t.entity_type = 'market' and t.field = 'recurrence_text' and t.locale = v.locale
   and t.entity_id = (select id from public.markets where slug = 'brocante-17-terra-geneve');

-- Prélaz-Valency
update public.markets set recurrence_text = 'Einmalig, Ende Mai 2026, zur Caravane des quartiers', updated_at = now()
 where slug = 'vide-grenier-prelaz-valency-lausanne';
update public.texts t set value = v.value, updated_at = now()
  from (values ('de', 'Einmalig, Ende Mai 2026, zur Caravane des quartiers'),
               ('en', 'Once only, at the end of May 2026, during the Caravane des quartiers'),
               ('fr', 'Une seule fois, fin mai 2026, pendant la Caravane des quartiers'),
               ('it', 'Una sola volta, a fine maggio 2026, durante la Caravane des quartiers')) as v(locale, value)
 where t.entity_type = 'market' and t.field = 'recurrence_text' and t.locale = v.locale
   and t.entity_id = (select id from public.markets where slug = 'vide-grenier-prelaz-valency-lausanne');

commit;
