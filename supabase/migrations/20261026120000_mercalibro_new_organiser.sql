-- Mercalibro Bellinzona changed hands in 2026: Flamingo Edizioni stepped back and
-- the Cooperativa Area runs it (laRegione, 28 Aug 2026; the Cooperativa's own site
-- announces "MercaLibro compie 30 anni!"). The market's link already pointed at the
-- Cooperativa; its organiser row still named Flamingo with their address.
--
-- The row is renamed and readdressed in place, not replaced: nothing was ever mailed
-- to it (no organiser_mail_sends row), so the link it holds has never left the
-- database and passes to the Cooperativa with the row.
begin;

do $$
declare
  org uuid; n int;
begin
  if not exists (select 1 from public.markets) then return; end if;

  select organiser_id into org from public.markets where slug = 'mercalibro-bellinzona';
  if org is null then raise exception 'mercalibro: no organiser'; end if;
  if exists (select 1 from public.organiser_mail_sends where organiser_id = org) then
    raise exception 'mercalibro: the old organiser was mailed; revoke its link first';
  end if;
  select count(*) into n from public.markets where organiser_id = org;
  if n <> 1 then raise exception 'mercalibro: organiser has % markets', n; end if;

  update public.organisers
     set name = 'Cooperativa Area',
         channel_type = 'email',
         channel_value = 'direzione@cooperativa-area.ch',
         email = 'direzione@cooperativa-area.ch',
         updated_at = now()
   where id = org and name = 'Flamingo Edizioni';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'mercalibro: expected Flamingo Edizioni, updated % rows', n; end if;
end $$;

commit;
