-- Robots: 30 days of detail instead of 90, then the daily count as before.
--
-- crawler_hits ran at ~3,800 rows a day in the week to 2026-09-26, about
-- 400 bytes a row: 90 days would hold ~140 MB, three times everything else in
-- the database and over a quarter of the free plan, growing with every page
-- Germany adds. What is asked of a robot visit older than a month is a count,
-- which crawler_daily keeps forever. scripts/prune-logs.mjs passes 30.

begin;

comment on table public.crawler_daily is
  'crawler_hits older than 30 days, counted per day, robot and page type. Written by fold_crawler_hits(), called nightly by scripts/prune-logs.mjs.';

commit;
