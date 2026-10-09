-- The three Swiss markets brought from v1 on 2026-10-09 (import-v1-additions.mjs) arrived
-- with v1's description, word for word — the same text on two live sites, which the
-- 8 October rewrite removed everywhere else. Rewritten from the same facts, in our words,
-- for visitors only (no stall booking), without repeating the date and hours the page shows.
-- Their rhythm lines were German only; en/fr/it added.
--   Disco Flohmi — dreigaenger.ch/disco-flohmi-22-10-26/: an evening market in the shop, music
--     and snacks, the bar open an hour longer.
--   Hallenflohmarkt Arboldswil — Arboldswiler Dorfblatt: Mehrzweckhalle; Herbstmarkt with regional
--     produce in the Hofmet-Schüüre; lunch, cake buffet and Beizli in the gym; parking at the hall.
--   Hinterhof Flohmarkt — the organiser's Instagram: Rorschacherstrasse 242 behind Restaurant
--     Oechsli; design, vintage, retro 60s–90s, antiques, second-hand clothes, illuminated letters,
--     other small stalls; drinks and grill in the garden; any weather; step-free.

begin;

create temporary table new_text (slug text, locale text, field text, value text) on commit drop;
insert into new_text values
  ('disco-flohmi-dreigaenger-liebefeld', 'en', 'description', $t$An evening flea market in Dreigänger, a second-hand shop in Liebefeld, with music and small things to eat. The bar stays open an hour after the stalls close.$t$),
  ('disco-flohmi-dreigaenger-liebefeld', 'de', 'description', $t$Ein Flohmarkt am Abend im Dreigänger, einem Secondhand-Laden in Liebefeld, mit Musik und kleinen Snacks. Die Bar bleibt eine Stunde länger offen als die Stände.$t$),
  ('disco-flohmi-dreigaenger-liebefeld', 'fr', 'description', $t$Un marché aux puces en soirée chez Dreigänger, une boutique de seconde main à Liebefeld, avec de la musique et de quoi grignoter. Le bar reste ouvert une heure après la fermeture des stands.$t$),
  ('disco-flohmi-dreigaenger-liebefeld', 'it', 'description', $t$Un mercatino serale da Dreigänger, un negozio dell'usato a Liebefeld, con musica e qualcosa da mangiare. Il bar resta aperto un'ora dopo la chiusura delle bancarelle.$t$),

  ('hallenflohmarkt-arboldswil', 'en', 'description', $t$Indoors, in the village's multi-purpose hall. On the same day an autumn market of regional produce runs next door in the Hofmet-Schüüre, and the gym serves lunch, cakes and drinks. There is parking right by the hall.$t$),
  ('hallenflohmarkt-arboldswil', 'de', 'description', $t$Drinnen, in der Mehrzweckhalle des Dorfs. Am selben Tag gibt es nebenan in der Hofmet-Schüüre einen Herbstmarkt mit regionalen Produkten, und in der Turnhalle Mittagessen, Kuchen und ein Beizli. Parkplätze hat es direkt bei der Halle.$t$),
  ('hallenflohmarkt-arboldswil', 'fr', 'description', $t$À l'intérieur, dans la salle polyvalente du village. Le même jour, un marché d'automne de produits régionaux se tient à côté, dans la Hofmet-Schüüre, et la halle de gym propose repas de midi, gâteaux et boissons. Parking juste à côté de la salle.$t$),
  ('hallenflohmarkt-arboldswil', 'it', 'description', $t$Al coperto, nella sala multiuso del paese. Lo stesso giorno, accanto, nella Hofmet-Schüüre, c'è un mercato autunnale di prodotti regionali, e nella palestra si trovano pranzo, torte e bevande. Parcheggio proprio accanto alla sala.$t$),

  ('hinterhof-flohmarkt-st-gallen', 'en', 'description', $t$A small market in a back courtyard on Rorschacherstrasse, behind Restaurant Oechsli. Design, vintage and retro from the 1960s to the 1990s, antiques, plenty of second-hand clothes and old illuminated letters, with a few other dealers at small stalls. There are drinks and a grill in the garden. It runs in any weather, and the courtyard is step-free.$t$),
  ('hinterhof-flohmarkt-st-gallen', 'de', 'description', $t$Ein kleiner Markt in einem Hinterhof an der Rorschacherstrasse, hinter dem Restaurant Oechsli. Design, Vintage und Retro aus den 1960ern bis 1990ern, Antikes, viele Secondhand-Kleider und alte Leuchtbuchstaben, dazu ein paar weitere Händler mit kleinen Ständen. Im Garten gibt es Getränke und einen Grill. Er findet bei jedem Wetter statt, der Hof ist stufenlos.$t$),
  ('hinterhof-flohmarkt-st-gallen', 'fr', 'description', $t$Un petit marché dans une arrière-cour de la Rorschacherstrasse, derrière le restaurant Oechsli. Design, vintage et rétro des années 1960 à 1990, objets anciens, beaucoup de vêtements de seconde main et de vieilles lettres lumineuses, avec quelques autres marchands sur de petits stands. Boissons et grill au jardin. Par tous les temps ; la cour est accessible sans marches.$t$),
  ('hinterhof-flohmarkt-st-gallen', 'it', 'description', $t$Un piccolo mercato in un cortile interno della Rorschacherstrasse, dietro il ristorante Oechsli. Design, vintage e retrò dagli anni '60 agli anni '90, oggetti antichi, tanti vestiti usati e vecchie insegne luminose, con qualche altro venditore su piccole bancarelle. In giardino ci sono bevande e una griglia. Si tiene con qualsiasi tempo; il cortile è senza gradini.$t$),

  ('hallenflohmarkt-arboldswil', 'en', 'recurrence_text', $t$One Saturday in October, with an autumn market$t$),
  ('hallenflohmarkt-arboldswil', 'fr', 'recurrence_text', $t$Un samedi d'octobre, avec un marché d'automne$t$),
  ('hallenflohmarkt-arboldswil', 'it', 'recurrence_text', $t$Un sabato di ottobre, con un mercato autunnale$t$),
  ('disco-flohmi-dreigaenger-liebefeld', 'en', 'recurrence_text', $t$Several times a year, in the evening$t$),
  ('disco-flohmi-dreigaenger-liebefeld', 'fr', 'recurrence_text', $t$Plusieurs fois par an, en soirée$t$),
  ('disco-flohmi-dreigaenger-liebefeld', 'it', 'recurrence_text', $t$Più volte all'anno, di sera$t$),
  ('hinterhof-flohmarkt-st-gallen', 'en', 'recurrence_text', $t$About once a month, on a Saturday$t$),
  ('hinterhof-flohmarkt-st-gallen', 'fr', 'recurrence_text', $t$Environ une fois par mois, un samedi$t$),
  ('hinterhof-flohmarkt-st-gallen', 'it', 'recurrence_text', $t$Circa una volta al mese, di sabato$t$);

do $$
declare n int;
begin
  -- An empty database (the CI schema test) has nothing to correct.
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = d.value, updated_at = now()
    from public.markets m, new_text d
   where t.entity_type = 'market' and t.entity_id = m.id and t.field = d.field
     and m.slug = d.slug and t.locale = d.locale;
  insert into public.texts (entity_type, entity_id, locale, field, value)
  select 'market', m.id, d.locale, d.field, d.value
    from new_text d join public.markets m on m.slug = d.slug
   where not exists (select 1 from public.texts t where t.entity_type = 'market' and t.entity_id = m.id and t.field = d.field and t.locale = d.locale);
  select count(*) into n from public.texts t join public.markets m on m.id = t.entity_id join new_text d on d.slug = m.slug and d.locale = t.locale and d.field = t.field
   where t.entity_type = 'market' and t.value = d.value;
  if n <> 21 then raise exception 'expected 21 texts in place, found %', n; end if;
end $$;

commit;
