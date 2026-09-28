-- Who took a market's photo, where the licence asks us to say so.
--
-- Photos from Wikimedia Commons under CC BY or CC BY-SA may be used only with
-- the photographer's name and the licence beside them. The first arrive
-- 2026-09-28 for the Köln and Hamburg markets; the market page prints this
-- under the photo. Null for Delfim's own photos and anything that needs no
-- credit.
--
-- {"author": "…", "licence": "CC BY-SA 4.0", "licence_url": "https://…",
--  "source_url": "https://commons.wikimedia.org/wiki/File:…"}

begin;

alter table public.markets add column image_credit jsonb
  check (image_credit is null or (image_credit ? 'author' and image_credit ? 'licence' and image_credit ? 'source_url'));

comment on column public.markets.image_credit is
  'Photographer and licence for a photo whose licence requires a credit (CC BY, CC BY-SA). Printed under the photo on the market page.';

commit;
