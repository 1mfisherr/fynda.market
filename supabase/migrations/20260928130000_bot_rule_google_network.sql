-- Two holes in the bot verdict, measured 2026-09-28 over every row we hold.
--
-- 5 (new). Any row from Google's own network (as_org 'Google…'). Two kinds
--    arrive from there and neither is a person on our page:
--    - Search results prefetched by Chrome: a page_view with Google's
--      referrer, from Google's network, and nothing after it — the reader's
--      own taps land under a different visitor id. 105 visitor-days, 110
--      views, 88 of them "Swiss".
--    - Robots in Google's data centres that run our script: 29 US
--      visitor-days, four of which scrolled to 100% in 12–14 s and tapped
--      Directions — 5 of 54 directions clicks since 17 September.
--    125 visitor-days flip. Of the CH, LI and DE visitor-days with an
--    outbound click, none touches Google's network (73 CH, 1 DE, 1 LI).
--
-- 1 (tightened). "Never interacted" counted our script's own page_leave and
--    web_vitals rows, and the newsletter card coming into view, as
--    interaction — so a robot that ran the script was a person. Outside
--    Germany it now counts only something the visitor did. Germany keeps the
--    old reading until there is German traffic to check the rule against
--    (PLAN.md, open decisions): 6 silent German phones would flip otherwise.
--
-- The view's columns are unchanged; every dependent view picks the new
-- verdict up as it is.

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
    max(occurred_at)                                                                    as last_seen,
    count(*) filter (where event_name not in ('page_view', 'page_leave', 'web_vitals', 'newsletter_form_view')) as actions,
    bool_or(as_org ilike 'google%')                                                     as google_network
  from public.analytics_events
  group by 1, 2
)
select
  visitor_day_hash, day, views, interactions, any_referrer, only_utility, any_content,
  country, device_class, first_seen, last_seen,
  (
    (coalesce(any_referrer, false) = false
       and coalesce(country, '') not in ('CH', 'LI')
       and (interactions = 0 or (coalesce(country, '') <> 'DE' and actions = 0)))
    or (coalesce(only_utility, false) and interactions = 0)
    or views > 60
    or (views > 20 and not coalesce(any_content, false))
    or coalesce(google_network, false)
  ) as bot_likely
from pv;

commit;
