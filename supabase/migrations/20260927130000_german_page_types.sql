-- German country and Bundesland page views, filed as what they are.
--
-- functions/_collect.ts knew only the Swiss path words, so from Germany's
-- launch on 2026-09-22 until the fix on 2026-09-27 /de/deutschland/ and
-- /de/deutschland/bundesland/<land>/ (and their /en/germany/ twins) were
-- recorded with page_type 'other'. Town and market pages were unaffected.
-- Same rule as pageTypeOf: two path parts is the country, four with the
-- region word third is a region.

begin;

update public.analytics_events
   set page_type = case when path ~ '^/(de|en)/(deutschland|germany)/$' then 'country' else 'region' end
 where page_type = 'other'
   and path ~ '^/(de|en)/(deutschland|germany)/((bundesland|state)/[a-z0-9-]+/)?$';

update public.crawler_hits
   set page_type = case when path ~ '^/(de|en)/(deutschland|germany)/$' then 'country' else 'region' end
 where page_type = 'other'
   and path ~ '^/(de|en)/(deutschland|germany)/((bundesland|state)/[a-z0-9-]+/)?$';

commit;
