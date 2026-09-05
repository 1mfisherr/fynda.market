-- Who last verified the market, recovered from v1.
--
-- v1 held `verified_by` on the market — 'organiser' for 33 of 161, 'team' for
-- 126, 'community' for 2 — beside a `last_verified_at`. The import read the
-- date and dropped the who, so every row in this database claimed 'import' and
-- the site could not tell an organiser-confirmed market from a scraped one.
-- The v1 rows survived in market_private.raw_import; this is where they land.
--
-- It sits on the market, not the occurrence, because that is what v1 recorded:
-- an organiser confirmed the market's details, not one particular Saturday.
-- occurrences.origin stays the per-date answer for when an organiser tells us
-- about a specific date.

begin;

alter table public.markets
  add column verified_by text
    check (verified_by is null or verified_by in ('team', 'organiser', 'community')),
  add column verified_at timestamptz;

comment on column public.markets.verified_by is
  'Who last checked this market. Only ''organiser'' lets a page say the organiser stands behind it — and it ages, so verified_at is shown with it.';

commit;
