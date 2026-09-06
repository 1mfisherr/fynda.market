-- The signup endpoint's access to the list.
--
-- Same shape as the analytics collector's grants: the service role bypasses
-- row-level security but still needs a plain table GRANT, and without one every
-- signup came back as "save failed". Found by posting a real address to the
-- live endpoint rather than by reading the code.
--
-- SELECT, INSERT and UPDATE. UPDATE because a repeat signup from an address
-- already on the list is an upsert — it updates the town and undoes an earlier
-- unsubscribe. SELECT because PostgREST refuses an upsert without it even when
-- the request asks for nothing back; that was the actual 403.
--
-- No DELETE: an unsubscribe sets a timestamp, it does not remove the row, which
-- is what keeps the suppression record the privacy policy promises.

begin;

grant usage on schema public to service_role;
grant select, insert, update on public.newsletter_subscribers to service_role;

commit;
