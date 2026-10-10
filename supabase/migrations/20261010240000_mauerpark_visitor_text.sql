-- Mauerpark's description told visitors how sellers book ("reservable private stalls",
-- "private sellers get priority", "covered rental stalls") — seller information, which the
-- descriptions carry for nobody (docs/PLAN.md §Copy). Rewritten to what a visitor decides on:
-- who sells, what sort of goods, cover. Organiser review, 2026-10-10.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = v.value, updated_at = now()
    from public.markets m,
         (values
           ('de', $t$Jeden Sonntag an der Bernauer Straße, direkt am Mauerpark. Rund 100 private Stände und dazu gewerbliche Händler, mehr Gebrauchtes als Neuware. Einige Stände sind überdacht.$t$),
           ('en', $t$Every Sunday on Bernauer Straße, right beside Mauerpark. About 100 private stalls plus traders, and more second-hand than new. Some stalls are covered.$t$)
         ) as v(locale, value)
   where m.slug = 'flohmarkt-am-mauerpark-berlin' and t.entity_type = 'market' and t.entity_id = m.id
     and t.field = 'description' and t.locale = v.locale;
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'updated %, expected 2', n; end if;
end $$;

commit;
