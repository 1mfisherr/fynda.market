---
paths:
  - "functions/**"
---

# Pages Functions

- **Never import from `src/`.** A Function runs on Cloudflare with its own globals and must not pull in Astro's module graph or DOM lib. `_mail.ts` keeps its own copy of the digest's shape for that reason — change `src/lib/digest.ts` and you change `_mail.ts` by hand; nothing compares them.
- Type-checked by `npm run check:functions` (`tsconfig.functions.json`), not by `astro check`.
- **One endpoint per table.** `/n`, `/r`, `/o`, `/u` share `_form.ts`: origin check, honeypot, timing floor, IP hash, Telegram ping, insert. A new form reuses it rather than adding a branch on a posted string.
- Writes go as the service role: RLS is bypassed, a table `GRANT` is still required, and PostgREST needs SELECT for an upsert with `return=representation`.
- Every form endpoint also answers a plain `<form method="post">` with a redirect to an anchor — it must work with JavaScript off.
- Anything in `waitUntil()` fails silently. Log rejections; read the Cloudflare log before trusting an empty table.
- Event `props` shapes are fixed by a check constraint per event name in `20260829130000_analytics_events.sql`. A row that does not match is dropped, not errored.
- A change here is verified by posting to the **live** endpoint after deploy and reading the row back with `scripts/db.mjs`. That habit found every bug in this directory so far.
