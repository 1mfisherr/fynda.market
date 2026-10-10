-- Six descriptions said something their organiser's own page does not (facts pass, 2026-10-10,
-- every figure read on the organiser's page and kept with its quote in
-- intake/facts/2026-10-10-from-descriptions.json):
--   Kanzlei Zürich        "up to 400 sellers"   → the site says up to 300
--   Flughafen Kloten      "more than 400 stands" → the site says about 450, capped there
--   Karlshorst (big one)  "around 500"          → the site expects 300 exhibitors
--   Cottbus, Magdeburg, Leipzig Alte Messe: the English said "dealers" for the German
--   Händler, which means the people at the stalls; all three take private sellers too.
-- One exact phrase replaced per text; the count must match, or nothing changes.

begin;

do $$
declare n int; total int := 0;
begin
  if not exists (select 1 from public.markets) then return; end if;

  update public.texts t set value = replace(t.value, v.old, v.new), updated_at = now()
    from public.markets m,
         (values
           ('flohmarkt-kanzlei-zuerich', 'en', 'up to 400 sellers', 'up to 300 sellers'),
           ('flohmarkt-kanzlei-zuerich', 'de', 'Bis zu 400 Verkäuferinnen und Verkäufer', 'Bis zu 300 Verkäuferinnen und Verkäufer'),
           ('flohmarkt-kanzlei-zuerich', 'fr', 'jusqu''à 400 vendeurs', 'jusqu''à 300 vendeurs'),
           ('flohmarkt-kanzlei-zuerich', 'it', 'fino a 400 venditori', 'fino a 300 venditori'),
           ('flughafen-flohmarkt-kloten-zuerich', 'en', 'with more than 400 stands', 'with around 450 stands'),
           ('flughafen-flohmarkt-kloten-zuerich', 'de', 'mit über 400 Ständen', 'mit rund 450 Ständen'),
           ('flughafen-flohmarkt-kloten-zuerich', 'fr', 'de plus de 400 stands', 'd''environ 450 stands'),
           ('flughafen-flohmarkt-kloten-zuerich', 'it', 'con oltre 400 bancarelle', 'con circa 450 bancarelle'),
           ('riesenflohmarkt-trabrennbahn-karlshorst-berlin', 'en', 'around 500 exhibitors', 'around 300 exhibitors'),
           ('riesenflohmarkt-trabrennbahn-karlshorst-berlin', 'de', 'rund 500 Aussteller', 'rund 300 Aussteller'),
           ('nachtflohmarkt-cottbus', 'en', 'Well over 100 dealers;', 'Well over 100 sellers, private and professional;'),
           ('nachtflohmarkt-magdeburg', 'en', 'Around 250 dealers,', 'Around 250 sellers, private and professional,'),
           ('troedelmarkt-alte-messe-leipzig', 'en', '100 to 200 dealers,', '100 to 200 sellers,')
         ) as v(slug, locale, old, new)
   where m.slug = v.slug and t.entity_type = 'market' and t.entity_id = m.id
     and t.field = 'description' and t.locale = v.locale
     and position(v.old in t.value) > 0;
  get diagnostics n = row_count;
  if n <> 13 then raise exception 'updated %, expected 13', n; end if;
end $$;

commit;
