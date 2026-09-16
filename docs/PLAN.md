# Plan

Where the project stands and what happens next. **Read this first, every session. Update it before ending one.** Status, order, open decisions — never history; git and `archive/` hold that.

Updated 2026-09-16.

---

## Now

**Live at `fynda.market` since 2026-09-04.** 948 pages from 157 published markets, 56 cities and 14 cantons in four locales; 916 indexable, 1.00 URL per entity per locale against v1's ~60. Rebuilt nightly at 03:00 UTC on GitHub; ten guardrails and 26 tests gate every publish.

What is running:

- **Newsletter.** Signup on every page; a subscription is 25 km around a town, or a canton. Friday digest sends since 2026-09-11 (`digest.yml`, `NEWSLETTER_SENDING=on`, batches of 100 through Resend, one `newsletter_sends` row per subscriber per issue written *before* the send). Welcome mail and unsubscribe in all four languages; **the unsubscribe page offers "once a month" and "pause three months"** instead of only the door (2026-09-15, migration `20260915180000`, applied). The link itself had been dead since the 10th — it sent a dropped column — and is fixed. **Resend's delivery webhook is live** (`functions/w.ts`, `link.fynda.market` for click tracking, verified 2026-09-15 with a test issue: sent → delivered → opened → clicked). A permanent bounce or a complaint suppresses the address at once; `newsletter_delivery` is the dashboard view. **1 active subscriber.**
- **Every form writes a row.** `/n` newsletter, `/r` report, `/o` organiser claim, `/u` unsubscribe — each pings Telegram. The queues are the views `open_reports` and `open_organiser_claims`; `metabase/README.md` turns them into a dashboard with a daily alert. **0 reports, 0 claims so far.**
- **Analytics.** Page views counted at the edge, interactions from the browser, both into our Postgres since 2026-09-06. **Read 2026-09-15, ten days in:** a steady **10–25 Swiss visitors a day**, two thirds from Google, 60% on a phone; 77% see one page and leave, and the commonest thing done on a market page is an outbound click to Maps or the organiser — the job the page is for. Market pages land most, then city, then canton (Bern and Aargau land real visitors — the "weakest page type" is earning). Time chips get used; the place picker in the home search card was used **once** in two weeks. 0 newsletter signups from real visitors, 1 report, 1 save. **The bot filter reads the network, the Accept-Language header and the Sec-Fetch-Mode header since 2026-09-15**, not just the user-agent string — the last one is what stopped a residential-proxy crawl that sent the other two. Before that, two thirds of rows were sweeps and every count needed `country='CH'`; rows before 2026-09-15 08:00 UTC still do. Check the next morning's non-CH count to confirm it held.
- **Search Console, export of 2026-09-12 (first nine days):** 96 clicks, 7,743 impressions, impressions climbing 55 → 2,030 a day, average position 15. 314 of 378 pages seen have no click yet. Market pages 51 clicks, city 27, canton 18. **City pages sit at position 5–8 with 100–200 impressions and no clicks** — Worb, Wettingen, Chur — and their search snippet is a generic sentence that never says when the next market is, where a market page's snippet does. Query shapes: place + "2026" is 40% of impressions; the titles already carry the year.
- **Photographs.** Every market page has one at 1440px and 148px. One is real (Plainpalais, from the operator); 156 are illustrations or v1 files.

What is not: organiser tooling beyond the claim form · tags on any market · a country page · text search · a distance on cards.

---

## Next, in order

**Deadline: Germany live by end of November 2026** (Delfim, 2026-09-16). Ten weeks. Order below is the route there; Swiss polish happens once, in week 5, not twice.

1. **Market watch agent.** Delfim is building one for fleafind and brings it here (2026-09-16); we adapt it for Fynda when it arrives. Weekly, per market: open the source URL, compare with what we hold, queue the findings. Same engine is the German intake tool.
2. **Organisers** (week 3). **Decided 2026-09-16, after `reference/organiser-research/`:** organisers are the focus — engaged organisers keep the data fresh, fresh data earns visitor trust. **No login, ever.** A personal link in an e-mail is the identity. Seven days before each date, one mail with three buttons — *it's on / cancelled / something changed*; the first two go live within the hour with the organiser stamp, the third opens a four-field page (dates, stalls, indoor/outdoor, photo) that waits for Delfim's OK. Once a year the mail asks for the season's dates. The market page's organiser block becomes the page's main ask — an offer to take the market over, with the page's reach as the reason — and a claimed page looks visibly different. Delfim supplies the missing organiser e-mails. Measure the answer rate after four weeks: >25% extend, 10–25% keep as a data feed, <10% stop building for organisers. **Spec: `specs/organisers.md`, five build days, start in a fresh session.**
3. **Performance** (week 4). Analytics vocabulary done 2026-09-16: `page_type` gained `utility` and `country`, `newsletter_form_view` (placement `card|footer|page`) and the `organiser_contact` funnel are emitted, `analytics_rollup()`/`analytics_daily` dropped. Migration `20260916120000`.
4. **UI/UX, copy, branding pass** with the logo, all page types, four locales (week 5).
5. **Germany** (weeks 6–9): data intake, de+en locale, Bundesland pages, country pages, home becomes the country chooser.
6. Buffer (week 10).

The earlier list, folded into the above:

1. **Watch the city pages.** Snippet, day headers, one feature row, dead chips gone, the within-25-km block on 28 sparse towns — all live 2026-09-15 (`PAGES.md` §City page). Read Search Console click-through on city pages in three weeks against today's ~1%, and `market_click` per city visitor.
4. **Country page** `/{locale}/{country}/`. Route allowed, nothing built; breadcrumbs join it when it exists.
5. **German text search.** Settle the compound-word question (`STACK.md`) before any search box exists. Not urgent: v1 saw 64 searches in 26 days against 281 filter uses.

---

## Still open

Decisions, not tasks. Each waits on Delfim or on data. Don't assume an answer.

- **The beachhead region** — Zürich or Luzern. Photos, descriptions and organiser outreach concentrate wherever this lands.
- **The logo.** Delfim has one to bring in (2026-09-15); nothing to decide here until it arrives. `design/logo-research.md` is the earlier exploration.
- ~~Where photographs come from~~ **Decided 2026-09-15:** the current photos stay; real ones arrive through organiser claims, not a shoot.
- **Distance on cards and in the market page's decision strip.** Blocked because `fynda:stadt` stores a name and an href, not coordinates. The fix is in the home page's town picker; the `<li data-distance>` slot is already in the markup. Never print a guessed distance.
- **Tags.** Wanted, kept in the data model, not yet worth showing: nothing fills them and a tag that filters to nothing is a dead end. Revisit when organisers supply facts (Delfim, 2026-09-15). Small when it comes — 60+ categories killed v1.
- **The content floor counts characters and should count verified facts.** Fix before any bulk prose generation.
- ~~Four vanished markets~~ **Decided 2026-09-15: leave them.** Eiszentrum Luzern, Mall of Switzerland Ebikon, GZ Hottingen, GZ Schindlergut stay `active` with no dates; their pages say so.
- **A Metabase host, €6/month.** Only when looking without starting Docker is worth it.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales.** The structure allows it; let Search Console decide.
- **Two newsletter forms in a row.** The card at the foot of home, city, canton and market pages is followed directly by the footer's own form. Removing the footer one on those pages empties the desktop footer's right column, so it needs a layout decision, not a one-liner.
- **Prose quality is now a spot-check, not a known defect.** 2026-09-15: umlauts restored in 102 German rows; accents restored in 79 French and Italian descriptions; six French rows that were German, and two German rows that were Italian (Lugano), translated; 27 German schedule clauses embedded in other-language prose translated; **the rhythm line ("Jeden Samstag, Mai–Oktober") now exists in all four languages for every active market** — 118 markets had been showing the German one on the French, Italian and English pages. A check that a description carries its own language's function words finds nothing left. What remains is whatever a native reader finds.

---

## Data

161 markets, 2,357 occurrences, 56 cities (Zofingen split from Aarau 2026-09-15), 14 cantons, 107 organisers, 1,782 facts (2026-09-05). Complete on all 161: descriptions, names, slugs in four locales, coordinates, source URLs. Missing: 1 postal code, 2 websites, 2 fees, 2 organiser contacts, every tag — and, for every market, size and indoor/outdoor. 37 of 157 have no announced date this month; that is Swiss September, not a fault.

How the import works and what it decided: `ARCHITECTURE.md` §Import.

---

owner: Delfim
last_reviewed: 2026-09-15
