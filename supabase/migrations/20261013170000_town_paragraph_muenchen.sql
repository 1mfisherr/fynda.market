-- München's paragraph gains the Theresienwiese, published the same evening (Delfim, 2026-10-13);
-- two clauses cut to stay within the 1000 characters every town keeps (intake/town-intros/out-4.json).

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = v.value, updated_at = now()
    from (values ('de', $t$Der Flohmarkt Daglfing steht direkt neben der Trabrennbahn und läuft zweimal die Woche, außer an Feiertagen. Dazu gehört ein Antikmarkt unter alten Bäumen; es gibt Spielzeug, Kinderkleidung und Babysachen, und bei Regen haben im Antikhaus ein Restaurant und ein Café offen. Im Olympiapark macht der Flohmarkt auf der Parkharfe im selben Rhythmus weiter, getragen vom Bayerischen Roten Kreuz.

Dreimal im Jahr füllt die Auer Dult neun Tage lang den Mariahilfplatz in der Au: rund 250 Stände mit Geschirr, Haushaltswaren, Antiquitäten und Spielzeug, daneben Fahrgeschäfte. Der Flohmarkt München-Riem nimmt an ausgewählten Terminen von April bis November das Freigelände der Messe ein, seit 1993. Und an den Abenden zum Wochenende zieht der Midnightbazar in die alte Paketposthalle: Die meisten Verkäufer räumen ihren eigenen Haushalt aus, draußen stehen Foodtrucks. Jeden April überlässt das Bayerische Rote Kreuz die Theresienwiese während des Frühlingsfests für einen Tag den Privatleuten.$t$),
                 ('en', $t$Flohmarkt Daglfing sits right beside the trotting track and runs twice a week, except on public holidays. An antiques market under old trees comes with it, plus toys, children's clothes and baby things; if it rains, the antiques house has a restaurant and a café. Flohmarkt im Olympiapark keeps the same rhythm on the Parkharfe, run by the Bavarian Red Cross.

Auer Dult fills the Mariahilfplatz in the Au for nine days, three times a year, with around 250 stalls of tableware, household goods, antiques and toys, plus fairground rides; the October round is the Kirchweihdult. Flohmarkt München-Riem takes the open-air grounds of Messe München on selected dates from April to November, and has done since 1993. On weekend evenings, Midnightbazar moves into the old Paketposthalle: most sellers are clearing out their own homes, food trucks stand outside. Each April, during the Frühlingsfest, the Bavarian Red Cross gives the Theresienwiese over to private sellers for a single day.$t$)) as v(locale, value)
   where t.entity_type = 'city' and t.entity_id = 'a7ee87ac-3351-4ae5-938e-62dc73a1aae7' and t.field = 'description' and t.locale = v.locale;
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'München paragraph: updated %, expected 2', n; end if;
end $$;

commit;
