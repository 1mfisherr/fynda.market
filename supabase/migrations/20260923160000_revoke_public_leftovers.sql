-- The public API roles hold nothing.
--
-- Supabase's defaults give `anon` and `authenticated` every privilege on new
-- tables and functions in `public`. Earlier migrations revoked SELECT, INSERT,
-- UPDATE and DELETE; TRUNCATE, TRIGGER and REFERENCES were left on 16 tables
-- and views, and EXECUTE on eight functions (security audit, 2026-09-23).
-- None of it was reachable — the API has no verb for TRUNCATE, the functions
-- run with the caller's rights, and the anon key is published nowhere — but
-- "not reachable today" is an argument someone has to re-make every time
-- something changes. The site and the Functions never use these roles.
--
-- service_role keeps what it was explicitly granted, including EXECUTE on
-- cancellation_recipients (functions/a/[[path]].ts).

begin;

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
-- Functions are executable by PUBLIC by default, which anon inherits, so the
-- revoke has to be from PUBLIC and the roles that do use them get it back.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role, metabase_ro;

-- Tables and functions created from now on start with nothing for them either.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public grant execute on functions to service_role, metabase_ro;

commit;
