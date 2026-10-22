---
paths:
  - "supabase/**"
---

# Migrations

- Name: `YYYYMMDDHHMMSS_snake_name.sql`. Applied only by `node scripts/migrate.mjs <file>`, in a transaction; committing one does nothing. CI cannot tell you it ran: after applying, hit the live endpoint and read the row back. Say in the commit or in `PLAN.md` when it was applied to the live database.
- **RLS on, no policies, on every new table.** Then grant explicitly: the service role gets what its Function needs; `metabase_ro` gets SELECT on views, never on `reports` or `market_private`. A view runs with its owner's rights, so granting the view is how a reader gets the narrow window and not the wide one.
- A visitor-written table (`reports`, `organiser_claims`, `newsletter_subscribers`) holds the evidence as typed (`market_text`) alongside our reading of it (`market_id`); null id means a person matches it.
- Do not weaken the 120-day trigger on generated occurrences (`docs/ARCHITECTURE.md` §Dates).
- Retired slugs stay in the ledger forever (`20260903100000_slug_ledger.sql`); a rename inserts, never updates.
- CI replays every migration on an empty database (`.github/workflows/ci.yml`, `postgis/postgis:16-3.4`, `search_path = "$user", public, extensions` as on Supabase), then the tests. A data migration's row-count checks open with `if not exists (select 1 from public.markets) then return; end if;`, or they fail there.
- `supabase/tests/schema_test.sql` needs Docker, which often fails to start here. Say "untested" rather than "tested".
