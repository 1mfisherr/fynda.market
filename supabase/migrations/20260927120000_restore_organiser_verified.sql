-- Give back the organiser's confirmation to the 33 markets that had it.
--
-- 20260905140000 read v1's `verified_by` home: 33 markets an organiser had
-- confirmed between April and August 2026. On 2026-09-19 every upcoming date
-- was stamped as checked from Delfim's export, and the same pass set every
-- market's verified_by to 'team' — one statement, one timestamp — which wiped
-- the 33. Nobody decided that; their pages lost "Confirmed by the organiser"
-- and started asking those organisers to claim a market they already had.
--
-- The source is the same as the first time: market_private.raw_import, with
-- v1's own date. Only rows still saying 'team' are touched, so an organiser
-- who has confirmed since through their personal link keeps that newer answer.
-- occurrences.confirmed_at (our 2026-09-19 check of the dates) stays: that is
-- a separate, also true, claim.

begin;

update public.markets m
   set verified_by = 'organiser',
       verified_at = (mp.raw_import->>'last_verified_at')::timestamptz,
       updated_at  = now()
  from public.market_private mp
 where mp.market_id = m.id
   and mp.raw_import->>'verified_by' = 'organiser'
   and m.verified_by = 'team';

commit;
