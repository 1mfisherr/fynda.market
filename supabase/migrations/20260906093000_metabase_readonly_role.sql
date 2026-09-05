-- A read-only login for the dashboard.
--
-- Two layers decide what it can see, and they are deliberately different:
--
--   GRANT   is the allow-list. metabase_ro may SELECT on public, and on tables
--           added later, EXCEPT market_private (organiser emails, admin notes)
--           and reports (whatever a visitor typed into a form). Personal data
--           never reaches a dashboard.
--
--   BYPASSRLS is what makes those grants mean anything. Every table here has
--           row-level security enabled with zero policies, so the default
--           answer to any row is "no" — the site builds only because it
--           connects as the owner, which is exempt. A read-only role with no
--           bypass sees an empty database, not an error, which is the worst
--           possible failure: dashboards that quietly say zero.
--
-- The alternative was a SELECT policy per table. It ends up expressing exactly
-- the grant list a second time, and a table added without a policy silently
-- disappears from the dashboard. One allow-list is easier to audit than two.
--
-- The password is not here. It is generated locally, written to
-- metabase-password.txt, and that file is gitignored.

begin;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'metabase_ro') then
    create role metabase_ro nologin;
  end if;
end $$;

grant usage on schema public to metabase_ro;
grant select on all tables in schema public to metabase_ro;
alter default privileges in schema public grant select on tables to metabase_ro;

revoke select on public.market_private from metabase_ro;
revoke select on public.reports from metabase_ro;

-- BYPASSRLS is a role ATTRIBUTE, and attributes are not inherited through
-- GRANT the way privileges are. Setting it here would look right and change
-- nothing: the login user still reads an empty database. It has to be set on
-- whichever role actually logs in, which scripts/setup-metabase.mjs does when
-- it mints the password.
alter role metabase_ro bypassrls;

comment on role metabase_ro is
  'Read-only analytics role for Metabase. Sees everything in public except market_private and reports. Never granted INSERT/UPDATE/DELETE.';

commit;
