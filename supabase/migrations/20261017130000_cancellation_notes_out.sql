-- A cancellation reason copied from v1 is one line in one language ("Feiertag: kein Markt (Ville de Lausanne).")
-- that every locale printed. A cancelled date now carries its status alone; sync-v1 and import-v1-additions no longer copy it.
-- 'organiser' is the marker an organiser's own cancellation writes, never shown; it stays.
begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.occurrences set cancellation_note = null, updated_at = now()
   where cancellation_note is not null and cancellation_note <> 'organiser';
  get diagnostics n = row_count;
  if n <> 16 then raise exception 'cancellation notes: cleared %, expected 16', n; end if;
end $$;

commit;
