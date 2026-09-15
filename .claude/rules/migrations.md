---
paths:
  - "supabase/**"
---

# Migrations

- Name: `YYYYMMDDHHMMSS_snake_name.sql`. Applied **only** by `node scripts/migrate.mjs <file>`, which wraps it in a transaction. Committing a migration does not run it, CI has no database, and `verify` cannot tell. Say in the commit or in `PLAN.md` when it was applied to the live database.
- **RLS on, no policies, on every new table.** Then grant explicitly: the service role gets what its Function needs; `metabase_ro` gets SELECT on views, never on `reports` or `market_private`. A view runs with its owner's rights, so granting the view is how a reader gets the narrow window and not the wide one.
- A visitor-written table (`reports`, `organiser_claims`, `newsletter_subscribers`) holds the evidence as typed (`market_text`) alongside our reading of it (`market_id`); null id means a person matches it.
- Generated occurrences beyond 120 days are refused by trigger. Hand-entered confirmed dates are not capped. Do not weaken either.
- Retired slugs stay in the ledger forever (`20260903100000_slug_ledger.sql`); a rename inserts, never updates.
- `supabase/tests/schema_test.sql` needs Docker, which often fails to start here. Say "untested" rather than "tested".
