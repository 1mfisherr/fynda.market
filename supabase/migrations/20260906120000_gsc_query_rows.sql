-- The decay view counts pages, not queries.
--
-- Search Console's export gives one file per dimension and never crosses two,
-- so a query row has no page and therefore no page_type. Those rows are worth
-- keeping — v1's most valuable single finding lived in them, that explicit-date
-- searches converted at seven times the site average — but they are not pages,
-- and letting them fall into the weekly comparison would add a null group whose
-- numbers answer a different question.
--
-- One line per side, so a query row can never be mistaken for a page type in
-- decline.

begin;

create or replace view public.search_console_weekly_change as
  with recent as (
    select page_type,
           sum(clicks) as clicks,
           sum(impressions) as impressions
    from public.search_console_daily
    where day > current_date - 7 and page_type is not null
    group by page_type
  ),
  prior as (
    select page_type,
           sum(clicks) as clicks,
           sum(impressions) as impressions
    from public.search_console_daily
    where day <= current_date - 7 and day > current_date - 14 and page_type is not null
    group by page_type
  )
  select
    coalesce(r.page_type, p.page_type) as page_type,
    coalesce(r.clicks, 0)              as clicks_this_week,
    coalesce(p.clicks, 0)              as clicks_last_week,
    coalesce(r.impressions, 0)         as impressions_this_week,
    coalesce(p.impressions, 0)         as impressions_last_week,
    case
      when coalesce(p.impressions, 0) = 0 then null
      else round(
        (coalesce(r.impressions, 0) - p.impressions)::numeric / p.impressions * 100, 1
      )
    end as impressions_change_pct
  from recent r
  full outer join prior p on p.page_type = r.page_type;

/*
 * The same question, asked in a way that does not depend on when you exported.
 *
 * The view above compares two fixed seven-day windows, which assumes an import
 * lands inside each one — true of a daily API pull, not of a person exporting
 * a CSV when they remember. This compares the two most recent imports to each
 * other, whatever days they happen to fall on, so a fortnight's gap still
 * answers "which page type is losing ground".
 */
create or replace view public.search_console_last_two_imports as
  with days as (
    select distinct day from public.search_console_daily
     where page_type is not null
     order by day desc limit 2
  ),
  newest as (select max(day) as day from days),
  older  as (select min(day) as day from days),
  recent as (
    select page_type, sum(clicks) clicks, sum(impressions) impressions
      from public.search_console_daily
     where page_type is not null and day = (select day from newest)
     group by page_type
  ),
  prior as (
    select page_type, sum(clicks) clicks, sum(impressions) impressions
      from public.search_console_daily
     where page_type is not null and day = (select day from older)
       and (select day from older) <> (select day from newest)
     group by page_type
  )
  select
    coalesce(r.page_type, p.page_type)  as page_type,
    (select day from newest)            as this_import,
    (select day from older)             as previous_import,
    coalesce(r.clicks, 0)               as clicks_now,
    coalesce(p.clicks, 0)               as clicks_before,
    coalesce(r.impressions, 0)          as impressions_now,
    coalesce(p.impressions, 0)          as impressions_before,
    case
      when coalesce(p.impressions, 0) = 0 then null
      else round((coalesce(r.impressions, 0) - p.impressions)::numeric / p.impressions * 100, 1)
    end as impressions_change_pct
  from recent r
  full outer join prior p on p.page_type = r.page_type;

comment on view public.search_console_last_two_imports is
  'Which page type is losing impressions, comparing the two most recent imports whenever they happened. The fixed-window view assumes a regular pull; this one does not.';

grant select on public.search_console_last_two_imports to metabase_ro;

commit;
