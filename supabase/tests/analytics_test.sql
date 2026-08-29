-- Behavioural tests for the analytics schema.
--
-- The registry constraint is the whole point of this design: it is what stops
-- a broken collector persisting identifying data. An untested constraint is a
-- comment.

\set ON_ERROR_STOP on

begin;

create or replace function pg_temp.expect_failure(p_sql text, p_label text)
  returns void
  language plpgsql
as $$
begin
  begin
    execute p_sql;
  exception when others then
    raise notice 'PASS  %  (rejected: %)', p_label, left(sqlerrm, 60);
    return;
  end;
  raise exception 'FAIL  % — the statement was allowed and should not have been', p_label;
end
$$;

create or replace function pg_temp.expect(p_condition boolean, p_label text)
  returns void
  language plpgsql
as $$
begin
  if p_condition then
    raise notice 'PASS  %', p_label;
  else
    raise exception 'FAIL  %', p_label;
  end if;
end
$$;

-- A valid hash: 64 hex characters.
\set hash '''aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'''

/* -- 1. the event registry ------------------------------------------------ */

insert into public.analytics_events
  (occurred_at, event_name, visitor_day_hash, page_type, path, props)
values
  (now(), 'page_view', :hash, 'home', '/de/', '{}'::jsonb);

select pg_temp.expect(
  (select count(*) = 1 from public.analytics_events),
  'a well-formed page_view is accepted'
);

select pg_temp.expect_failure(format($sql$
  insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, page_type, props)
  values (now(), 'page_view', %L, 'home', '{"session_token":"abc"}'::jsonb)
$sql$, :hash), 'a page_view carrying an extra key is refused');

select pg_temp.expect_failure(format($sql$
  insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, props)
  values (now(), 'invented_event', %L, '{}'::jsonb)
$sql$, :hash), 'an event name outside the registry is refused');

/* -- 2. personal data cannot reach a search term -------------------------- */

select pg_temp.expect_failure(format($sql$
  insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, props)
  values (now(), 'search', %L, '{"term":"delfim@example.com","results_count":3}'::jsonb)
$sql$, :hash), 'a search term containing an email address is refused');

select pg_temp.expect_failure(format($sql$
  insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, props)
  values (now(), 'search', %L, '{"term":"ruf mich an 079 123 45 67","results_count":1}'::jsonb)
$sql$, :hash), 'a search term containing a phone number is refused');

insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, page_type, props)
values (now(), 'search', :hash, 'home', '{"term":"flohmarkt zuerich","results_count":4}'::jsonb);

select pg_temp.expect(
  (select count(*) = 1 from public.analytics_events where event_name = 'search'),
  'an ordinary search term is accepted'
);

/* -- 3. no_results is its own event --------------------------------------- */

insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, page_type, props)
values (now(), 'no_results', :hash, 'filter', '{"term":"flohmarkt uster","filters":{"zeit":"heute"}}'::jsonb);

select pg_temp.expect(
  (select count(*) = 1 from public.analytics_events where event_name = 'no_results'),
  'no_results is recordable on its own, not hidden inside search'
);

/* -- 4. paths never carry query strings ----------------------------------- */

select pg_temp.expect_failure(format($sql$
  insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, path, props)
  values (now(), 'page_view', %L, '/de/?email=someone@example.com', '{}'::jsonb)
$sql$, :hash), 'a path containing a query string is refused');

/* -- 5. identity is a daily hash and nothing else -------------------------- */

select pg_temp.expect_failure(format($sql$
  insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, props)
  values (now(), 'page_view', 'not-a-hash', '{}'::jsonb)
$sql$, :hash), 'a visitor hash that is not a sha256 hex digest is refused');

select pg_temp.expect(
  not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'analytics_events'
      and column_name in ('anonymous_id', 'ip', 'ip_address', 'user_agent', 'email')
  ),
  'there is no persistent identifier, raw IP or user agent column'
);

/* -- 6. page_type is constrained to the page types we actually have -------- */

select pg_temp.expect_failure(format($sql$
  insert into public.analytics_events (occurred_at, event_name, visitor_day_hash, page_type, props)
  values (now(), 'page_view', %L, 'occurrence', '{}'::jsonb)
$sql$, :hash), 'a page_type we deliberately do not build is refused');

/* -- 7. rollup and retention ---------------------------------------------- */

select pg_temp.expect(
  (select public.analytics_rollup(current_date)) >= 1,
  'the daily rollup writes aggregate rows'
);

select pg_temp.expect(
  (select sum(events) from public.analytics_daily) = (select count(*) from public.analytics_events),
  'the rollup accounts for every raw event'
);

-- Backdate one event past the window, without rolling that day up.
update public.analytics_events
   set occurred_at = now() - interval '200 days'
 where event_name = 'no_results';

select pg_temp.expect_failure(
  'select public.analytics_prune(90)',
  'pruning is refused while an old day has never been rolled up'
);

select public.analytics_rollup((now() - interval '200 days')::date);

select pg_temp.expect(
  (select public.analytics_prune(90)) = 1,
  'pruning removes the old raw event once its day is aggregated'
);

select pg_temp.expect(
  (select sum(events) from public.analytics_daily) > (select count(*) from public.analytics_events),
  'the aggregate outlives the raw rows it was built from'
);

/* -- 8. search console ----------------------------------------------------- */

insert into public.search_console_daily (day, page, query, page_type, clicks, impressions, position)
values
  (current_date - 3,  '/de/zuerich/', 'flohmarkt zürich', 'city', 40, 1000, 4.2),
  (current_date - 10, '/de/zuerich/', 'flohmarkt zürich', 'city', 50, 2000, 3.9);

select pg_temp.expect(
  (select impressions_change_pct = -50.0 from public.search_console_weekly_change where page_type = 'city'),
  'the weekly change view reports a halving of impressions as -50%'
);

rollback;
