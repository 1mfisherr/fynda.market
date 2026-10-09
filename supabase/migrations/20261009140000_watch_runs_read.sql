-- /adm/notify marks a run sent through _rest.ts's updateRows, which asks for the
-- updated row back (return=representation) and so needs SELECT on every column,
-- not only the three it reads. A run's counts and report hold nothing private.
grant select on public.watch_runs to service_role;
