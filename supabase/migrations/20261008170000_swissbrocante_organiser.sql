-- SwissBrocante, untangled before the welcome letters (2026-10-08).
--
-- One row was "Association pour l'animation du Quartier de Rive / Swiss
-- Brocante" with SwissBrocante's address, and held both Brocantissima Morges
-- (SwissBrocante's: swissbrocante.org/morges) and Brocante de Rive Nyon (the
-- Quartier de Rive association's: quartierderive.ch, which already has its own
-- row with Puces de Nyon). Brocante Lutry sat under the Société de
-- Développement de Lutry, but swissbrocante.org/brocante-lutry runs it and SD
-- Lutry's site does not list it; SD Lutry keeps its vide-grenier.
--
-- Personal links belong to the organiser row, not the market, and no answers,
-- edits or mails exist on any of the three rows yet, so moving markets is safe.

begin;

update public.organisers
   set name = 'SwissBrocante', channel_type = 'website', channel_value = 'https://swissbrocante.org/', updated_at = now()
 where id = 'fe6d7a3c-a166-4a1a-b0d3-81bda2805da6' and email = 'info@swissbrocante.org';

do $$
declare n int;
begin
  -- An empty database (the CI schema test) has nothing to correct.
  if not exists (select 1 from public.markets) then return; end if;
  update public.markets set organiser_id = 'cbf19ae2-8bbd-4197-a25f-5f7e00597848', updated_at = now()
   where slug = 'brocante-de-rive-nyon' and organiser_id = 'fe6d7a3c-a166-4a1a-b0d3-81bda2805da6';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Nyon: expected 1, got %', n; end if;

  update public.markets set organiser_id = 'fe6d7a3c-a166-4a1a-b0d3-81bda2805da6',
         website_url = 'https://swissbrocante.org/brocante-lutry', updated_at = now()
   where slug = 'brocante-lutry' and organiser_id = 'a78c4209-b3ef-49db-a05b-c1b9a385e769';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Lutry: expected 1, got %', n; end if;
end $$;

commit;
