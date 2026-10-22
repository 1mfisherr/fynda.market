---
paths:
  - "functions/**"
---

# Pages Functions

- **Never import from `src/`.** A Function runs on Cloudflare with its own globals and must not pull in Astro's module graph or DOM lib. `_mail.ts` keeps its own copy of the digest's shape for that reason — change `src/lib/digest.ts` and you change `_mail.ts` by hand; nothing compares them.
- Type-checked by `npm run check:functions` (`tsconfig.functions.json`), not by `astro check`.
- **Form endpoints share `_form.ts`** (`n b v f k r o`): origin check, honeypot, timing floor, IP hash, Telegram ping, insert. A new form reuses it rather than adding a branch on a posted string. `u.ts` (unsubscribe) is the exception: a token link, not a form.
- Reads and updates go through `_rest.ts` (PostgREST as the service role, every rejection logged). Pages a Function renders use `_page.ts`, which mirrors the site's wordmark and tokens by hand — change `Wordmark.astro` or `tokens.css`, change it too. Delfim's one-tap decisions are signed links from `_admin.ts`; an organiser's identity is a token from `_link.ts`, the one module the Node scripts import, so it imports nothing.
- Writes go as the service role: PostgREST needs SELECT for an upsert with `return=representation`.
- Every form endpoint also answers a plain `<form method="post">` with a redirect to an anchor — it must work with JavaScript off.
- Log rejections inside `waitUntil()` — nothing else will tell you a write there failed.
- Event `props` shapes are fixed by a check constraint per event name, last redefined by the newest migration that touches `analytics_events` (`grep -l analytics_events supabase/migrations/*`). A row that does not match is dropped, not errored.
- Verify a change by posting to the **live** endpoint after deploy and reading the row back with `scripts/db.mjs`.
