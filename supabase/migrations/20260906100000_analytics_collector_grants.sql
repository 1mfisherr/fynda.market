-- The collector may append events, and do nothing else.
--
-- analytics_events was created with row-level security on and no grants, so
-- the API role that the edge collector authenticates as could not write to it.
-- The failure was silent from the visitor's side and invisible from ours: the
-- insert is fired into waitUntil() so it cannot slow a page down, which also
-- means a rejected insert leaves no trace anywhere except an empty table.
--
-- INSERT only. The collector has no reason to read events back, and no reason
-- ever to change or delete one — an event is an observation about something
-- that already happened, and rewriting the past is exactly what an append-only
-- ledger exists to prevent.

begin;

grant usage on schema public to service_role;
grant insert on public.analytics_events to service_role;

comment on table public.analytics_events is
  'Append-only event stream. The edge collector holds INSERT and nothing else; Metabase reads it through metabase_ro. No row is ever updated or deleted.';

commit;
