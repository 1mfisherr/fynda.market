-- The first two Swiss markets researched by us rather than copied from the old site
-- (intake/ch/, import-intake.mjs, 2026-10-11; Delfim: "add both"):
--   Alpin-Flohmi La Neuveville, 5 Dec 2026 — a new stop of the Alpin-Flohmi series, which
--   shares one photo across its towns.
--   Nachtflohmarkt im Presswerk, Arbon, 29 Dec 2026 — the Presswerk's own night market, in the
--   hall its daytime market already shows; once a year between Christmas and New Year.
-- Both run in December only, so between editions they say "Usually in December".

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;

  update public.markets m set image_url = v.url, season_from = 12, season_to = 12, updated_at = now()
    from (values ('alpin-flohmi-la-neuveville', '/images/alpin-flohmi.webp'),
                 ('nachtflohmarkt-presswerk-arbon', '/images/flohmarkt-presswerk-arbon.webp')) as v(slug, url)
   where m.slug = v.slug and m.status = 'unverified';
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'photos: updated %, expected 2', n; end if;

  insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
  select 'market', m.id, 'image_url', to_jsonb(m.image_url), 'manual', 'shared with ' || v.sibling, now(), 'confirmed'
    from public.markets m
    join (values ('alpin-flohmi-la-neuveville', 'the other Alpin-Flohmi markets'),
                 ('nachtflohmarkt-presswerk-arbon', 'flohmarkt-presswerk-arbon (same hall)')) as v(slug, sibling) on v.slug = m.slug;

  update public.markets set status = 'active', updated_at = now()
   where status = 'unverified' and image_url is not null
     and slug in ('alpin-flohmi-la-neuveville', 'nachtflohmarkt-presswerk-arbon');
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'expected 2 markets to publish, found %', n; end if;
end $$;

commit;
