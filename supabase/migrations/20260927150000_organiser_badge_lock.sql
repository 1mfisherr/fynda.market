-- "Confirmed by the organiser" cannot be taken away by accident.
--
-- On 2026-09-19 one bulk update set every market's verified_by to 'team' and
-- wiped the 33 organiser confirmations carried over from v1 (restored in
-- 20260927120000). A line in a doc did not stop it; this does. Any UPDATE
-- that moves a market off 'organiser' is refused, unless the session says on
-- purpose that it means to:
--
--   begin;
--   set local fynda.allow_unverify = 'on';
--   update public.markets set verified_by = 'team' where slug = '…';
--   commit;
--
-- An organiser confirming again sets 'organiser' again, which passes.

begin;

create or replace function public.keep_organiser_verification()
returns trigger
language plpgsql
as $$
begin
  if old.verified_by = 'organiser'
     and new.verified_by is distinct from 'organiser'
     and coalesce(current_setting('fynda.allow_unverify', true), '') <> 'on' then
    raise exception 'market % is confirmed by its organiser; set local fynda.allow_unverify = ''on'' to change that on purpose', old.slug;
  end if;
  return new;
end;
$$;

create trigger markets_keep_organiser_verification
  before update of verified_by on public.markets
  for each row execute function public.keep_organiser_verification();

commit;
