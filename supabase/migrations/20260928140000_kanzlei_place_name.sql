-- Flohmarkt Kanzlei's place was its street address, "Kanzleistrasse 56".
-- People search "kanzlei" and "helvetiaplatz" (Search Console, 18–24 Sep:
-- 259 impressions, no clicks), and the organiser names the place
-- "Kanzleiareal", "beim Helvetiaplatz" (flohmarktkanzlei.ch, read 2026-09-28).
-- The street address stays in address_line.

begin;

update public.venues set name = 'Kanzleiareal (Helvetiaplatz)', updated_at = now()
 where id = (select venue_id from public.markets where slug = 'flohmarkt-kanzlei-zuerich')
   and name = 'Kanzleistrasse 56';

update public.texts set value = 'Kanzleiareal (Helvetiaplatz)', updated_at = now()
 where entity_type = 'venue' and field = 'name' and value = 'Kanzleistrasse 56'
   and entity_id = (select venue_id from public.markets where slug = 'flohmarkt-kanzlei-zuerich');

commit;
