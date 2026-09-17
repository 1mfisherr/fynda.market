-- Bots out of the numbers, without throwing a row away.
--
-- The edge filter (functions/_collect.ts) drops the obvious machines. What it
-- passes still includes scraper farms wearing real browser headers: on
-- 2026-09-14, 874 one-hit "visitors" made 893 views; the four report-form
-- pages had ~430 views in eleven days against two real opens. Left in, they
-- double the visitor count and make every chart a lie.
--
-- This does not delete or drop anything. It reads the rows we have and says,
-- per visitor per day, whether that day's behaviour looks like a person. The
-- verdict rides on a view, so it can be tightened by replacing the view, and
-- every past row gets the new verdict for free. An edge-time `suspect` flag
-- comes later (docs/reference/analytics-research/build-plan.md) and will
-- feed the same view.
--
-- A visitor-day is BOT_LIKELY when any of these hold:
--   1. No referrer on any page view, no interaction at all, and not in
--      Switzerland or Liechtenstein. Real visits arrive from Google and carry
--      its referrer; a scraper arrives from nowhere. Checked before applying:
--      of the silent visitor-days from France 212 of 221 were this, one on a
--      phone, ~130 distinct pages a day; from Germany 82 of 85. Swiss silent
--      days (40 of 219, half on phones) are people typing the address, and
--      stay counted.
--   2. Every page it touched is a utility page (report form, newsletter,
--      legal) and it never interacted. Nobody starts at the report form.
--   3. More than 60 page views in a day. The most a person managed in the
--      first two weeks was 41.
--   4. More than 20 views and never a page with a market on it.
--
-- Nothing here is a fact about a person, so nothing here is personal data
-- beyond what the row already was.

begin;

create or replace view public.analytics_visitor_days as
with pv as (
  select
    visitor_day_hash,
    occurred_at::date as day,
    count(*) filter (where event_name = 'page_view')                                    as views,
    count(*) filter (where event_name <> 'page_view')                                   as interactions,
    bool_or(referrer_host is not null) filter (where event_name = 'page_view')          as any_referrer,
    bool_and(page_type in ('utility', 'other')) filter (where event_name = 'page_view') as only_utility,
    bool_or(page_type in ('market', 'city', 'region', 'home', 'filter'))               as any_content,
    min(country)                                                                        as country,
    min(device_class)                                                                   as device_class,
    min(occurred_at)                                                                    as first_seen,
    max(occurred_at)                                                                    as last_seen
  from public.analytics_events
  group by 1, 2
)
select
  *,
  (
    (coalesce(any_referrer, false) = false and interactions = 0
       and coalesce(country, '') not in ('CH', 'LI'))
    or (coalesce(only_utility, false) and interactions = 0)
    or views > 60
    or (views > 20 and not coalesce(any_content, false))
  ) as bot_likely
from pv;

comment on view public.analytics_visitor_days is
  'One row per visitor per day with the bot verdict. The rules are in the migration that created it.';

-- Every event, with the verdict of its visitor-day beside it. Metabase reads
-- this instead of the raw table; one filter, bot_likely = false, gives the
-- human numbers on any chart.
create or replace view public.analytics_events_classified as
select e.*, coalesce(v.bot_likely, false) as bot_likely
from public.analytics_events e
left join public.analytics_visitor_days v
  on v.visitor_day_hash = e.visitor_day_hash and v.day = e.occurred_at::date;

comment on view public.analytics_events_classified is
  'analytics_events plus bot_likely from analytics_visitor_days. What dashboards read.';

grant select on public.analytics_visitor_days to metabase_ro;
grant select on public.analytics_events_classified to metabase_ro;

commit;
