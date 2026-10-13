-- Ten market names came across from v1 with their umlauts spelled out ("Duebendorf",
-- "Kinderartikelboerse") — a slug's spelling that reached the page's H1 and title. Each is
-- the name the organiser writes; "4. Subiger Dorf Flohmarkt" also carried one edition's
-- number, wrong from the next one on. Found by the duplicate audit, 2026-10-13. The slugs
-- stay as they are: a published address never changes.

begin;

create temporary table fixed_name (slug text primary key, value text) on commit drop;
insert into fixed_name values
  ('breitsch-maerit-bern', 'Breitsch-Märit Bern'),
  ('cd-schallplatten-boerse-bern', 'Berner CD & Schallplatten-Börse'),
  ('flohmarkt-buelach-stadthalle', 'Flohmarkt Bülach (Stadthalle)'),
  ('flohmarkt-chilbiplatz-duebendorf', 'Flohmarkt Chilbiplatz Dübendorf'),
  ('flohmarkt-paulusheim-luzern', 'Flohmarkt Paulusheim (Kinderartikelbörse)'),
  ('flohmarkt-rueticenter-pratteln', 'Flohmarkt Rüticenter Pratteln'),
  ('flohmarkt-seeplatz-waedenswil', 'Flohmarkt Seeplatz Wädenswil'),
  ('maedelsflohmarkt-xxl-dietikon', 'Mädelsflohmarkt XXL Dietikon'),
  ('saeuliaemtler-flohmarkt-affoltern', 'Säuliämtler Flohmarkt'),
  ('subiger-dorf-flohmarkt', 'Subiger Dorf-Flohmarkt');

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = f.value, updated_at = now()
    from fixed_name f join public.markets m on m.slug = f.slug
   where t.entity_type = 'market' and t.entity_id = m.id and t.field = 'name' and t.value <> f.value;
  get diagnostics n = row_count;
  -- 39 of the 40 rows: the English Schallplatten-Börse is already right.
  if n <> 39 then raise exception 'expected 39 names to change, changed %', n; end if;
end $$;

commit;
