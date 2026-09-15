# Plan

Where the project stands and what happens next. **Read this first, every session. Update it before ending one.** Status, order, open decisions — never history; git and `archive/` hold that.

Updated 2026-09-15.

---

## Now

**Live at `fynda.market` since 2026-09-04.** 944 pages from 157 published markets, 55 cities and 14 cantons in four locales; 912 indexable, 1.00 URL per entity per locale against v1's ~60. Rebuilt nightly at 03:00 UTC on GitHub; ten guardrails and 26 tests gate every publish.

What is running:

- **Newsletter.** Signup on every page; a subscription is 25 km around a town, or a canton. Friday digest sends since 2026-09-11 (`digest.yml`, `NEWSLETTER_SENDING=on`, batches of 100 through Resend, one `newsletter_sends` row per subscriber per issue written *before* the send). Welcome mail and unsubscribe in all four languages. **1 active subscriber.**
- **Every form writes a row.** `/n` newsletter, `/r` report, `/o` organiser claim, `/u` unsubscribe — each pings Telegram. The queues are the views `open_reports` and `open_organiser_claims`; `metabase/README.md` turns them into a dashboard with a daily alert. **0 reports, 0 claims so far.**
- **Analytics.** Page views counted at the edge, interactions from the browser, both into our Postgres since 2026-09-06. **Read 2026-09-15, ten days in:** a steady **10–25 Swiss visitors a day**, two thirds from Google, 60% on a phone; 77% see one page and leave, and the commonest thing done on a market page is an outbound click to Maps or the organiser — the job the page is for. Market pages land most, then city, then canton (Bern and Aargau land real visitors — the "weakest page type" is earning). Time chips get used; the place picker in the home search card was used **once** in two weeks. 0 newsletter signups from real visitors, 1 report, 1 save. **Numbers are only readable with `country='CH'`** — the user-agent bot filter lets through 400+ US "visitors" a week and a 589-hit sweep on the 15th. Search Console (import of 2026-09-06, stale): 1,094 impressions, 12 clicks, average position 11–16; 60% of impressions are queries carrying "2026", which the titles already do.
- **Photographs.** Every market page has one at 1440px and 148px. One is real (Plainpalais, from the operator); 156 are illustrations or v1 files.

What is not: organiser tooling beyond the claim form · tags on any market · a country page · text search · open/click tracking on mail · a distance on cards.

---

## Next, in order

1. **Make the numbers trustworthy: flag datacentre traffic by ASN.** `request.cf.asOrganization` / `asn` is available to the Function and unused; `isProbablyBot` reads only the user-agent string. Until this lands every count needs a `country='CH'` clause and Germany cannot be read at all. Then a fresh Search Console export (`metabase/README.md` has the steps) — the one in the database is from launch week.
2. **"Less often" / "pause" on the unsubscribe page.** Token, page and row all exist; today the page is a dead end.
3. **Resend webhook for opens and clicks.** Nothing else can retire dead addresses, and dead addresses drag sender reputation down.
4. **The one-week-out confirmation mail to organisers.** "Yes, it's on" — two buttons, no login. 23 markets qualify, ~35 dates over 120 days. `organiser_claims` can hold the answer; who is asked, how often, and what silence means are undecided.
5. **Ask organisers for size and indoor/outdoor.** The two facts that decide a forty-minute drive, held for none of 161 markets, and unobtainable by scraping. This is what the organiser page is for.
6. **Country page** `/{locale}/{country}/`. Route allowed, nothing built; breadcrumbs join it when it exists.
7. **German text search.** Settle the compound-word question (`STACK.md`) before any search box exists. Not urgent: v1 saw 64 searches in 26 days against 281 filter uses.

---

## Still open

Decisions, not tasks. Each waits on Delfim or on data. Don't assume an answer.

- **The beachhead region** — Zürich or Luzern. Photos, descriptions and organiser outreach concentrate wherever this lands.
- **The compact brand mark.** Wordmark v6 in `design/screens/`, curved-`y` direction; the `f.` tile was rejected. Nothing approved or installed. `design/logo-research.md`.
- **Where photographs come from.** Organiser claims scale; Delfim shooting them works today. Decide before promising a real photo per market.
- **Distance on cards and in the market page's decision strip.** Blocked because `fynda:stadt` stores a name and an href, not coordinates. The fix is in the home page's town picker; the `<li data-distance>` slot is already in the markup. Never print a guessed distance.
- **Analytics vocabulary — one migration, three decisions.** `page_type` has no `utility` value, so the report pages (third-busiest thing on the site) land in `other`; `newsletter_form_view.placement` should name the form (`card|footer`), not the page; `organiser_contact` has no emitter. And `analytics_rollup()` is called by nothing — schedule it beside the digest or delete it.
- **The tag taxonomy.** Small. 60+ categories killed v1.
- **The content floor counts characters and should count verified facts.** Fix before any bulk prose generation.
- **Zofingen is filed under Aarau**, 25 km away. Fixing it creates a city and mints eight URLs.
- **Four vanished markets** — Eiszentrum Luzern, Mall of Switzerland Ebikon, GZ Hottingen, GZ Schindlergut — gone from their organisers' sites, still `active`. Close them or leave them.
- **A Metabase host, €6/month.** Only when looking without starting Docker is worth it.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales.** The structure allows it; let Search Console decide.

---

## Data

161 markets, 2,357 occurrences, 55 cities, 14 cantons, 107 organisers, 1,782 facts (2026-09-05). Complete on all 161: descriptions, names, slugs in four locales, coordinates, source URLs. Missing: 1 postal code, 2 websites, 2 fees, 2 organiser contacts, every tag — and, for every market, size and indoor/outdoor. 37 of 157 have no announced date this month; that is Swiss September, not a fault.

How the import works and what it decided: `ARCHITECTURE.md` §Import.

---

owner: Delfim
last_reviewed: 2026-09-15
