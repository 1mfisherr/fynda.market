-- One slug per place, and a ledger of the ones it used to have.
--
-- Two changes, and they are the same change.
--
-- 1. A city, canton or market now carries the SAME slug in every language.
--    Zürich is /de/schweiz/zuerich/, /fr/suisse/zuerich/, /it/svizzera/zuerich/.
--    The page still reads "Zurigo" in Italian — `texts` is untouched. Only the
--    address stops moving. Of 55 Swiss cities, 45 already had one name in all
--    four languages; the machinery existed for ten. A place name is a proper
--    noun, and the four-address version meant fixing a translation, merging a
--    commune or adding a language rewrote live URLs.
--
--    The country segment is the exception and stays per locale — schweiz /
--    suisse / svizzera / switzerland. It is a WORD, not a name, and it belongs
--    with markt / marche / mercato: a fixed, hand-written set of about fifty
--    that never grows with the data. It is also the segment "flohmarkt schweiz"
--    is actually searched with.
--
-- 2. Nothing in the old schema could express "this URL used to be that one".
--    The primary key was one row per (entity, locale), so a rename overwrote
--    the old slug and every inbound link and ranking died with it. Swiss
--    communes merge constantly — roughly 3,000 down to 2,100 in thirty years —
--    so renames are routine, not an edge case.
--
--    A slug row is now kept forever and marked `is_current = false` when it is
--    replaced. The build turns the retired rows into 301s (see
--    scripts/redirects.mjs), so an address Fynda has ever published keeps
--    working. This is the same guarantee GetYourGuide and Tripadvisor buy with
--    a numeric id in the path — `-l73`, `g188113` — without putting the id in
--    the path, which is exactly the generated-directory look that the v1
--    post-mortem says to avoid.

alter table public.slugs
  add column is_current boolean not null default true;

comment on column public.slugs.is_current is
  'False once a slug has been replaced. The row is never deleted: it is what the build emits as a 301, so an address we have published keeps working forever.';

-- An entity may now hold many slugs per locale — one live, the rest retired.
alter table public.slugs drop constraint slugs_pkey;
alter table public.slugs add primary key (entity_type, entity_id, locale, slug);

-- ...but only ever one live one.
create unique index slugs_one_current
  on public.slugs (entity_type, entity_id, locale)
  where is_current;

comment on index public.slugs_one_current is
  'One live slug per entity per locale. Retiring the old row is therefore not optional — the insert of the new one fails until it happens.';

-- slugs_entity_type_locale_slug_key (unique on entity_type, locale, slug) is
-- deliberately left alone. It now also means a retired slug can never be handed
-- to a different entity, which is what stops a redirect quietly pointing at the
-- wrong place after a rename.

comment on column public.slugs.slug is
  'ASCII, transliterated in the language the place actually speaks: zuerich and buelach are German towns, geneve and fribourg are French ones. Not blind accent-stripping — Hölstein BL and Holstein are different places. guardrails.config.json forbids non-ASCII in URLs.';

comment on table public.slugs is
  'Every URL segment that names an entity, live and retired. Cities, cantons and markets carry one slug across all locales; only the country segment is translated. Written by scripts/localise-places.mjs.';
