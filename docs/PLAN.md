# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story of how things got here is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-09-16.

---

## Now

Live at `fynda.market` since 2026-09-04: 157 published markets, 56 towns, 14 cantons, four locales, ~950 pages. Rebuilt nightly at 03:00 UTC on GitHub; ten guardrails and the tests gate every publish.

| Running | State |
|---|---|
| **Newsletter** | Friday digest since 2026-09-11, welcome and unsubscribe in four languages, pause and monthly options, Resend delivery events in. 1 subscriber |
| **Forms** | `/n` `/r` `/o` `/u` write rows and ping Telegram; queues are the views `open_reports`, `open_organiser_claims` |
| **Organisers** | Live 2026-09-16, proven end to end. Claim → Telegram Approve → personal link → seven-day mail with three buttons → stamp / cancellation / alert → edit page. Daily job runs as a **dry run** until `ORGANISER_SENDING=on` |
| **Analytics** | Page views at the edge, interactions from the browser, our Postgres, Metabase. Two identity layers: a daily hash always, a cookie id with consent. 10–25 Swiss visitors a day, two thirds from Google, 60% on a phone |
| **Search Console** | First nine days: 96 clicks, 7,700 impressions, position 15. City pages rank 5–8 with no clicks — rewritten 2026-09-15, re-read in October |
| **Performance** | Lighthouse mobile 97–99, first paint 1.2 s, font self-hosted, 720px hero on phones |
| **Photos** | Every market has one; one is real. Real ones arrive through organisers |

Not built: tags on any market · country page · text search · distance on cards · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

**Germany live by end of November 2026** (Delfim, 2026-09-16). Ten weeks.

1. **Organisers, round one.** Delfim picks two or three organisers he can reach and finds e-mails for the ~90 who have only a website. `scripts/import-organiser-emails.mjs <csv> --apply --welcome` loads them; `ORGANISER_SENDING=on` turns the daily mail live. **Read the answer rate after four weeks** (`organiser_funnel`): >25% extend, 10–25% keep as a data feed, <10% stop building for organisers.
2. **Analytics.** Send agents to work out what to measure to improve the site and what a monetisable dataset looks like; then GA4 / Clarity behind the consent already built, if they add anything our tables cannot.
3. **Visual pass** at 375 and 1440 with the logo; the organiser-page copy in Delfim's words. The logo is in since 2026-09-17 — header, footer, Function pages, mails, favicons and the share image (`docs/BRAND.md` §Wordmark).
4. **Market watch agent.** Delfim builds one for fleafind and brings it here; it becomes the German intake tool.
5. **Germany** (weeks 6–9): data intake, de+en locale, Bundesland pages, country pages, home becomes the country chooser.
6. Buffer.

Parked, not urgent: country page (arrives with Germany); German text search (settle the compound-word question in `STACK.md` first; v1 saw 64 searches against 281 filter uses).

---

## Open decisions

Each waits on Delfim or on data. Don't assume an answer.

- **Beachhead region** — Zürich or Luzern. Photos and outreach concentrate wherever this lands.
- **Distance on cards.** Blocked: the town picker stores a name, not coordinates. Never print a guessed distance.
- **Tags.** Nothing fills them yet; a tag that filters to nothing is a dead end. Revisit when organisers supply facts. Small when it comes.
- **Content floor** counts characters and should count verified facts. Fix before any bulk prose generation.
- **Two newsletter forms in a row** on home, city, canton and market pages (card, then footer). Needs a layout decision, not a one-liner.
- **A Metabase host, €6/month** — only when looking without Docker is worth it.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales.** The structure allows it; let Search Console decide.
- Decided and closed: photos stay as they are, real ones via organisers (2026-09-15); the four dateless markets stay `active` (2026-09-15); the logo, chosen and shipped (2026-09-17).

---

## Data

161 markets, 2,357 occurrences, 56 towns, 14 cantons, 114 organisers (23 with an e-mail), 1,782 facts. Complete on all 161: descriptions, names and slugs in four locales, coordinates, source URLs. Missing: 1 postal code, 2 websites, 2 fees, every tag, and for every market size and indoor/outdoor — the organiser page collects those. Prose quality is a spot-check, not a known defect.

How the import works: `ARCHITECTURE.md` §Import.
