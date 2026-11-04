-- Derendingen's paragraph loses the Enter Retrotechnikmarkt, closed 2026-11-04 (Delfim, 2026-10-26:
-- off its organiser's calendar, both November dates cancelled). Two fairs are left, so "the rest"
-- becomes "the other two"; nothing else in the text changes.
-- Applied to the live database 2026-11-04.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t
     set value = replace(replace(t.value, v.sentence, ''), v.opener_was, v.opener_now), updated_at = now()
    from (values
      ('de', $t$Die übrigen sind Börsen$t$, $t$Die beiden anderen sind Börsen$t$,
             $t$ Im November bringt der Enter Retrotechnikmarkt Privatleute und Firmen mit historischer Technik zusammen: Dampfmaschinen, Motoren, Uhren, Radios, Schreibmaschinen, dazu Werkzeug und Ersatzteile.$t$),
      ('fr', $t$Les autres sont des bourses$t$, $t$Les deux autres sont des bourses$t$,
             $t$ En novembre, l'Enter Retrotechnikmarkt réunit particuliers et entreprises autour de la technique d'autrefois : machines à vapeur, moteurs, horloges, radios, machines à écrire, ordinateurs, plus outils et pièces détachées.$t$),
      ('it', $t$Gli altri sono fiere$t$, $t$Gli altri due sono fiere$t$,
             $t$ A novembre l'Enter Retrotechnikmarkt riunisce privati e aziende attorno alla tecnica d'epoca: macchine a vapore, motori, orologi, radio, macchine da scrivere, computer, più attrezzi e ricambi.$t$),
      ('en', $t$The rest are one-theme fairs$t$, $t$The other two are one-theme fairs$t$,
             $t$ In November the Enter Retrotechnikmarkt brings private sellers and companies with historic technology: steam engines, motors, clocks, radios, typewriters, computers, plus tools and spare parts.$t$)
    ) as v(locale, opener_was, opener_now, sentence)
   where t.entity_type = 'city' and t.entity_id = 'fc79cc7a-45c2-4c89-8785-88693cf96b0a'
     and t.field = 'description' and t.locale = v.locale
     and position(v.sentence in t.value) > 0 and position(v.opener_was in t.value) > 0;
  get diagnostics n = row_count;
  if n <> 4 then raise exception 'Derendingen paragraph: updated %, expected 4', n; end if;
  if exists (select 1 from public.texts where entity_type = 'city' and entity_id = 'fc79cc7a-45c2-4c89-8785-88693cf96b0a'
                and field = 'description' and value ilike '%retrotechnik%') then
    raise exception 'Derendingen paragraph still names the Retrotechnikmarkt';
  end if;
end $$;

commit;
