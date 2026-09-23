-- Robots, kept for 90 days and counted forever.
--
-- crawler_hits grows by ~2,900 rows a day (2026-09-23), about 1 MB, and had
-- no end: at that rate it alone fills the free plan's 500 MB inside a year,
-- sooner as the site grows. The questions asked of it after three months are
-- counts — which robot, how often, which kind of page — so the old rows fold
-- into one row per day per robot per page type, and the raw rows go.
--
-- The fold and the delete are one function, run nightly by
-- scripts/prune-logs.mjs after the publish. Idempotent: a day is folded once,
-- because the delete removes what was folded in the same transaction.

begin;

create table public.crawler_daily (
  day        date    not null,
  bot_name   text    not null,
  bot_role   text    not null,
  reason     text    not null,
  page_type  text    not null default '',
  hits       integer not null,
  primary key (day, bot_name, bot_role, reason, page_type)
);

alter table public.crawler_daily enable row level security;
grant select on public.crawler_daily to metabase_ro;

comment on table public.crawler_daily is
  'crawler_hits older than 90 days, counted per day, robot and page type. Written by fold_crawler_hits().';

create or replace function public.fold_crawler_hits(keep_days integer default 90)
returns integer
language plpgsql
as $$
declare
  cutoff timestamptz := date_trunc('day', now()) - make_interval(days => keep_days);
  folded integer;
begin
  insert into public.crawler_daily (day, bot_name, bot_role, reason, page_type, hits)
  select occurred_at::date, bot_name, bot_role, reason, coalesce(page_type, ''), count(*)
    from public.crawler_hits
   where occurred_at < cutoff
   group by 1, 2, 3, 4, 5
  on conflict (day, bot_name, bot_role, reason, page_type)
  do update set hits = public.crawler_daily.hits + excluded.hits;

  delete from public.crawler_hits where occurred_at < cutoff;
  get diagnostics folded = row_count;
  return folded;
end;
$$;

revoke all on function public.fold_crawler_hits(integer) from public;

commit;
