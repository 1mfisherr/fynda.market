-- A venue name is shared by every language, so it carries no words of any one of them
-- (CLAUDE.md, Settled: nothing shared across locales is German — nor English prose).
-- "Straße des 17. Juni, at S-Bahnhof Tiergarten" put English on the German page
-- (product review, 2026-10-10); the station goes in brackets, as elsewhere.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.venues) then return; end if;
  update public.venues set name = 'Straße des 17. Juni (S-Bahnhof Tiergarten)', updated_at = now()
   where id = 'ef5169ed-b4ee-4a6d-beee-de5c2ac99680' and name = 'Straße des 17. Juni, at S-Bahnhof Tiergarten';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'updated %, expected 1', n; end if;
end $$;

commit;
