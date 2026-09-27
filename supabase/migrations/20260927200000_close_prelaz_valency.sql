-- Vide-grenier Prélaz-Valency has ended: it was one weekend (30-31 May 2026)
-- inside the City of Lausanne's Caravane des quartiers, which goes to a
-- different quarter each year (20260927190000). Delfim, 2026-09-27: a market
-- that has ended sends its visitors to its town's page. The page leaves the
-- build; scripts/redirects.mjs points its four addresses at /…/lausanne/.

begin;

update public.markets
   set status = 'permanently_closed', updated_at = now()
 where slug = 'vide-grenier-prelaz-valency-lausanne';

commit;
