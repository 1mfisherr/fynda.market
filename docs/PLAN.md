# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story of how things got here is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-09-23.

---

## Now

**Two countries since 2026-09-22.** Live at `fynda.market`: 277 markets — 222 Swiss in four locales, 55 German in de and en — across 148 towns, 23 cantons and 16 Bundesländer, 1,669 pages of which 1,636 are in the sitemap. Rebuilt nightly at 03:00 UTC on GitHub; ten guardrails and the tests gate every publish.

Germany was researched, imported, photographed and built in one day, and published the same evening. Every German market's dates were read from the organiser's own page, which is stored as its source. Nothing about Switzerland changed.

| Running | State |
|---|---|
| **Newsletter** | Friday digest since 2026-09-11, welcome and unsubscribe in four languages, pause and monthly options, Resend delivery events in. 1 subscriber |
| **Forms** | `/n` `/r` `/o` `/u` write rows and ping Telegram; queues are the views `open_reports`, `open_organiser_claims` |
| **Organisers** | Live 2026-09-16, proven end to end; the page rebuilt 2026-09-21 (`PAGES.md` §Organiser page). Claim → Telegram Approve → personal link → seven-day mail with three buttons → stamp / cancellation / alert → edit page. Daily job runs as a **dry run** until `ORGANISER_SENDING=on` |
| **Analytics** | Everything first-party (2026-09-17): page views with market/town/canton and lead time, time on page and scroll, sessions, Web Vitals, errors, 404s, towns, browser language, robots in `crawler_hits` with AI roles. Metabase: six dashboards, bots-or-people filter. ~10–30 real people a day, 85% of raw views are crawlers, two thirds from Google, 60% on a phone, ChatGPT sends a couple of visits a day. Audit 2026-09-23: the bot flag holds (25–100 real people a day since 16 Sep, 75% on a phone); our own browsers are now excluded with `?intern=1` on any page, once per device; the tab's session id is kept only with cookie consent, the daily hash groups everyone else |
| **Backups** | Nightly 02:30 UTC, encrypted, 90 days in GitHub artifacts (`.github/workflows/backup.yml`). The private key is in `.env.local` and Delfim's password manager only |
| **Search Console** | 7 days to 2026-09-17: 94 clicks, 7,836 impressions, position ~10; 78% of impressions on a phone. Canton pages earn most per page (Bern 7, Aargau 6 clicks); market pages with 500 impressions get 2–3. Germany: 151 impressions, 0 clicks. Titles rewritten 2026-09-15 — only two days of data since (16 Sep: 19 clicks, CTR 3.0%); **the 2026-09-27 export is the first that can judge it.** A fresh export every Sunday into `docs/GSCdata/`. SEO plan: `reference/seo-research/plan.md`, **re-read 2026-10-16** SEO audit 2026-09-23: the technical side clean across all 1,669 pages; fixed the next date in every market title, the year taken from that date, city-state twins, conflicting home hreflang, 160-character descriptions, German fees shown in CHF, and `<lastmod>`. Market titles changed again, so judge them on the exports from 2026-10-04 on |
| **Copy** | Brand line and voice settled 2026-09-19 (`BRAND.md` §Voice): every page type and every mail rewritten in four languages, the site no longer talks about itself, one stamp grammar, visitors du / vous / tu and organisers Sie / vous / tu everywhere. Market descriptions cleaned 2026-09-23: dates, stale years, hype, keyword tails and template filler out of every text (0 left on the sweep); 34 markets that had generic filler in some languages now carry one real description in all four. Left: a native speaker's pass over DE/FR/IT |
| **Performance** | Lighthouse mobile 97–99, first paint 1.2 s, font self-hosted, 720px hero on phones |
| **Photos** | Every market has one — 226 Swiss, 55 German (Delfim, 2026-09-22). Real ones arrive through organisers |
| **Front door** | The home page carries one block per country — flag, name, counts, towns, regions. No country picker anywhere: six comparable sites were read live on 2026-09-22 and not one has one; they all ask for a town. The root keeps a plain redirect, and the visitor's country is never guessed — two of those six guessed wrong from a Zurich IP |
| **Your town** | Picked in the search control, kept in browser storage, shown as a card on the home page and as a pill in the header of every other page (`PlacePill.astro`, 2026-09-22). A shortcut, not a second place-chooser |

Not built: tags shown to visitors (organisers can set them since 2026-09-21; nothing renders until some are set) · country page (parked, Delfim 2026-09-22) · text search · distance on cards · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

**Germany live by end of November 2026** (Delfim, 2026-09-16). Ten weeks.

0. **Organiser page — done.** Rebuilt 2026-09-21, reshaped 2026-09-22 after Delfim drove it as an organiser (`PAGES.md` §Organiser page): one form, the next date is a question answered with the one Confirm button at the foot, the opening introduces Delfim, a link to the visitor's page. Every write proven live and reverted. Nothing left here.
1. **Organisers, round one — Delfim's.** He sends the welcome and talks to organisers himself (2026-09-22); the build side is finished. 63 organisers have an address and a personal link; the letter goes to all 63 at once, once (`organiser_mail_sends`). **To send:** GitHub → Actions → *Organiser welcome* → *Run workflow* → your address in the **third** box ("Send a preview…"), everything else empty → read it in your inbox; then again with *send* ticked. "Did it leave?" is a query on `newsletter_events`, not a guess (three attempts on 2026-09-20 sent nothing: wrong workflow, empty box). Then `ORGANISER_SENDING=on` for the daily mail. E-mails for the ~90 with only a website: `scripts/import-organiser-emails.mjs <csv> --apply`, the same workflow welcomes them. **Read the answer rate after four weeks** (`organiser_funnel`): >25% extend, 10–25% keep as a data feed, <10% stop building for organisers.
2. **Analytics v2** — built 2026-09-17 (`reference/analytics-research/build-plan.md` phases 1–3). Left: partitioning, in October. Dropped 2026-09-19: the key-forgetting job (all data stays as is — Delfim) and the edge `suspect` flag (checked a week of rows: the `bot_likely` view already catches 1,268 of 1,478 visitor-days and the 210 it passes are on Swiss ISPs or arrive from Google — nothing for an edge flag to add). Before Germany: Queues, Supabase Pro, R2. No GA4, no Clarity. Read the Engagement dashboard after a week of data.
3. **Visual pass, UI audit, copy** — done 2026-09-17 and 2026-09-19/20. Every page type and interaction driven live at 375 and 1440; every line of interface copy rewritten in the settled voice. Market descriptions cleaned 2026-09-23 (see Copy above).
4. **Near me and the search control** — built and live 2026-09-18: one editorial control on home and Near me, Near me's four states, the distance pill, gutters on Near me and canton lists, `geo_prompt` events (migration applied the same day). `PAGES.md` §Home and §Near me, `BRAND.md` §Controls. **Read the allow rate after four weeks:** `geo_prompt` granted ÷ requested; below ~30% the button is in the wrong place. One `DateFilters` look on every page (checked live 2026-09-19).
5. **Market watch agent.** Runs on fleafind and stays there (Delfim, 2026-09-19); its source pages are in our `facts` as `source_page`. A new one is built for other countries when they come.
6. **Germany — live 2026-09-22.** Built and published in a day: 55 markets from the organisers' own pages (`intake/`, `scripts/import-intake.mjs`), Delfim's 55 photographs, the country in the URL tree with `de-DE` beside `de-CH`, the region word country-aware in path and copy, the front door, the place pill. `GERMANY-SPEC.md` holds what is left — Queues, Supabase Pro, R2 before the traffic grows, and the German organisers. **Watch for four weeks:** the Sunday Search Console exports, and whether Bremen and Saarland (1 and 2 markets) earn anything or get excluded as thin.
7. Buffer.

SEO follow-ups (`reference/seo-research/plan.md`): Bing Webmaster Tools registered 2026-09-18 — read its AI Performance report monthly; Delfim opens the Search Console *Generative AI* report; image sitemap once real photos exist.

Parked, not urgent: country page (Delfim, 2026-09-22 — the front door carries the towns, so nothing needs it); German text search (settle the compound-word question in `STACK.md` first; v1 saw 64 searches against 281 filter uses).

---

## Open decisions

Each waits on Delfim or on data. Don't assume an answer.

- **Distance on cards.** Blocked: the town picker stores a name, not coordinates. Never print a guessed distance.
- **Tags.** Nothing fills them yet; a tag that filters to nothing is a dead end. Revisit when organisers supply facts. Small when it comes.
- **Content floor** counts characters and should count verified facts. Fix before any bulk prose generation.
- **Two newsletter forms in a row** on home, city, canton and market pages (card, then footer). Needs a layout decision, not a one-liner.
- **Ceilings, measured 2026-09-23** (scalability audit). Cloudflare Pages takes 20,000 files per deploy: 2,779 today, ~6–8 per market, so images to R2 before ~2,500 more markets. The Near-me page carries every market (275 KB of HTML at 277): split it by country or load it as data past ~800. Resend's free plan sends 100 mails a day and the digest goes out in one morning: the paid plan before ~80 subscribers. Database 40 MB of 500. Build 21 s.
- **A Metabase host, €6/month** — only when looking without Docker is worth it.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales.** The structure allows it; let Search Console decide.
- Decided and closed: photos stay as they are, real ones via organisers (2026-09-15); the four dateless markets stay `active` (2026-09-15); the logo, chosen and shipped (2026-09-17); analytics stay first-party and keep everything, behaviour included (2026-09-17); `x-default` is English (2026-09-18); no Swiss beachhead region — the focus is Europe (2026-09-19).

---

## Data

**Data-quality audit 2026-09-23:** every active market has a photo on disk, coordinates within 8 km of its town, a well-formed postal code, sane hours, no duplicate dates. A random 14 upcoming markets were checked against the organisers' own sites: **every date right**, one closing time wrong (Wetzikon, 16:00 → 15:00, fixed), two unverifiable (Dietikon's page lists no dates, flosch.ch refuses bots). 256 links checked: 4 dead links on market pages fixed or accepted (glarus.swiss refuses bots, works for people), 7 dead organiser links replaced. The checked markets carry today's stamp. Known and fine: 88 markets with no stated fee, 70 Swiss markets awaiting next year's date, 265 German dates derived from a stated rhythm and shown as *not yet confirmed*. One tool gap: `confirm.mjs` stamps every future date of a market, including ones beyond what the source page lists — give it an `--until` before the next big confirmation round.

226 Swiss markets, 2,583 occurrences, 105 towns, 23 cantons, 173 organisers (63 with an e-mail and a link); plus 55 German markets, unverified, 467 occurrences, 38 towns, all 16 Bundesländer, 46 organisers (42 with a link). Thinnest: Bremen 1, Saarland 2; every other Bundesland has 3 or more. Photos: all 55 supplied by Delfim 2026-09-22 and imported (`scripts/import-photos.mjs`, three sizes each in `public/images/`); every German market has one, so nothing blocks the flip to `active` but step 2. Complete on all 226: descriptions, names and slugs in four locales, rhythm line in four, coordinates, source URLs, a photo. The 64 added 2026-09-20 (`import-v1-additions.mjs`) were researched on fleafind from organiser sites on 2026-09-19/20; their opening times, fees and parking notes sit in `market_private.admin_notes` until a facts pass reads them. Nine cantons are new and thin — Uri and Glarus hold only annual markets with no 2027 date yet, listed under *No date yet*. Missing: 1 postal code, 2 websites, 2 fees, every tag, and for every market size and indoor/outdoor — the organiser page collects those. Prose quality is a spot-check, not a known defect. Data-quality pass 2026-09-19: 13 dead organiser links replaced, 16 missing opening times filled from organiser sites (10 still unpublished by the organisers), one wrong-town description fixed; dates spot-checked against nine organiser calendars, all matching; every upcoming date stamped as verified 2026-09-19 from Delfim's fleafind export (`scripts/confirm.mjs` is the tool for any later check). 60 markets carry no upcoming date — annual ones awaiting 2027 — which the organiser mail is for; since 2026-09-20 they are listed on their town and canton pages rather than hidden. Alpin-Flohmi Interlaken added 2026-09-19 with a photo from Delfim (town Interlaken; the hall is in Wilderswil).

How the import works: `ARCHITECTURE.md` §Import.
