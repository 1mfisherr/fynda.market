-- The adults' flea market at GZ Heuried is closed (Delfim, 2026-11-05): the GZ wrote through the
-- report form on 3 Nov that it doesn't take place and asked for it to go; its own programme lists
-- no date. The market's status was set in the live database by hand; this migration removes the
-- sentence in the children's market description that pointed to it.
-- Applied to the live database 2026-11-05.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t
     set value = replace(t.value, v.sentence, ''), updated_at = now()
    from (values
      ('de', $t$ Die kommen anders zum Zug: Zweimal im Jahr veranstaltet dasselbe GZ einen Flohmarkt, auf dem alles für Erwachsene verkauft werden darf.$t$),
      ('fr', $t$ Les grands ont leur tour à d'autres dates : le même centre de quartier organise deux marchés aux puces par an où l'on peut vendre tout ce qui concerne les adultes.$t$),
      ('it', $t$ Per quelle c'è un'altra occasione: lo stesso centro di quartiere organizza due mercatini all'anno dove si può vendere di tutto per adulti.$t$),
      ('en', $t$ Those get their own turn: the same community centre holds two flea markets a year where anything for adults may be sold.$t$)
    ) as v(locale, sentence)
   where t.entity_type = 'market' and t.entity_id = '69cd50fc-9003-41ca-99e9-3288e69d9729'
     and t.field = 'description' and t.locale = v.locale
     and position(v.sentence in t.value) > 0;
  get diagnostics n = row_count;
  if n <> 4 then raise exception 'GZ Heuried children''s description: updated %, expected 4', n; end if;
end $$;

commit;
