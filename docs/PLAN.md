# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story of how things got here is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-09-22.

---

## Now

Live at `fynda.market` since 2026-09-04: 222 published Swiss markets, 105 towns, 23 cantons, four locales, 1,440 pages. Rebuilt nightly at 03:00 UTC on GitHub; ten guardrails and the tests gate every publish.

**Germany is built and switched off.** 55 markets, 43 towns, all 16 Bundesländer, every one with a photograph and its dates read from the organiser's own page — sitting at `status = 'unverified'`, which the build does not carry, so no German page exists on the live site. Everything around them is done and deployed: the URLs, the hreflang, the country-aware copy, the front door. **The only thing left is Delfim saying publish**, after which it is one status update and a deploy. `node scripts/preview-germany.mjs` builds the whole site with them on, runs the guardrails and switches them back, without uploading.

| Running | State |
|---|---|
| **Newsletter** | Friday digest since 2026-09-11, welcome and unsubscribe in four languages, pause and monthly options, Resend delivery events in. 1 subscriber |
| **Forms** | `/n` `/r` `/o` `/u` write rows and ping Telegram; queues are the views `open_reports`, `open_organiser_claims` |
| **Organisers** | Live 2026-09-16, proven end to end; the page rebuilt 2026-09-21 (`PAGES.md` §Organiser page). Claim → Telegram Approve → personal link → seven-day mail with three buttons → stamp / cancellation / alert → edit page. Daily job runs as a **dry run** until `ORGANISER_SENDING=on` |
| **Analytics** | Everything first-party (2026-09-17): page views with market/town/canton and lead time, time on page and scroll, sessions, Web Vitals, errors, 404s, towns, browser language, robots in `crawler_hits` with AI roles. Metabase: six dashboards, bots-or-people filter. ~10–30 real people a day, 85% of raw views are crawlers, two thirds from Google, 60% on a phone, ChatGPT sends a couple of visits a day |
| **Backups** | Nightly 02:30 UTC, encrypted, 90 days in GitHub artifacts (`.github/workflows/backup.yml`). The private key is in `.env.local` and Delfim's password manager only |
| **Search Console** | 7 days to 2026-09-17: 94 clicks, 7,836 impressions, position ~10; 78% of impressions on a phone. Canton pages earn most per page (Bern 7, Aargau 6 clicks); market pages with 500 impressions get 2–3. Germany: 151 impressions, 0 clicks. Titles rewritten 2026-09-15 — only two days of data since (16 Sep: 19 clicks, CTR 3.0%); **the 2026-09-27 export is the first that can judge it.** A fresh export every Sunday into `docs/GSCdata/`. SEO plan: `reference/seo-research/plan.md`, **re-read 2026-10-16** |
| **Copy** | Brand line and voice settled 2026-09-19 (`BRAND.md` §Voice): every page type and every mail rewritten in four languages, the site no longer talks about itself, one stamp grammar, visitors du / vous / tu and organisers Sie / vous / tu everywhere. Left: a native speaker's pass over DE/FR/IT |
| **Performance** | Lighthouse mobile 97–99, first paint 1.2 s, font self-hosted, 720px hero on phones |
| **Photos** | Every market has one — 226 Swiss, 55 German (Delfim, 2026-09-22). Real ones arrive through organisers |
| **Front door** | The home page carries one block per country — flag, name, counts, towns, regions — and the block heading only appears with a second country, so today it reads as before (2026-09-22). No country picker anywhere: six comparable sites were read live and not one has one. The root keeps a plain redirect; the visitor's country is never guessed |
| **Your town** | Picked in the search control, kept in browser storage, shown as a card on the home page and as a pill in the header of every other page (`PlacePill.astro`, 2026-09-22). A shortcut, not a second place-chooser |

Not built: tags shown to visitors (organisers can set them since 2026-09-21; nothing renders until some are set) · country page (parked, Delfim 2026-09-22) · text search · distance on cards · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

**Germany live by end of November 2026** (Delfim, 2026-09-16). Ten weeks.

0. **Organiser page — done.** Rebuilt 2026-09-21, reshaped 2026-09-22 after Delfim drove it as an organiser (`PAGES.md` §Organiser page): one form, the next date is a question answered with the one Confirm button at the foot, the opening introduces Delfim, a link to the visitor's page. Every write proven live and reverted. Nothing left here.
1. **Organisers, round one — Delfim's.** He sends the welcome and talks to organisers himself (2026-09-22); the build side is finished. 63 organisers have an address and a personal link; the letter goes to all 63 at once, once (`organiser_mail_sends`). **To send:** GitHub → Actions → *Organiser welcome* → *Run workflow* → your address in the **third** box ("Send a preview…"), everything else empty → read it in your inbox; then again with *send* ticked. "Did it leave?" is a query on `newsletter_events`, not a guess (three attempts on 2026-09-20 sent nothing: wrong workflow, empty box). Then `ORGANISER_SENDING=on` for the daily mail. E-mails for the ~90 with only a website: `scripts/import-organiser-emails.mjs <csv> --apply`, the same workflow welcomes them. **Read the answer rate after four weeks** (`organiser_funnel`): >25% extend, 10–25% keep as a data feed, <10% stop building for organisers.
2. **Analytics v2** — built 2026-09-17 (`reference/analytics-research/build-plan.md` phases 1–3). Left: partitioning, in October. Dropped 2026-09-19: the key-forgetting job (all data stays as is — Delfim) and the edge `suspect` flag (checked a week of rows: the `bot_likely` view already catches 1,268 of 1,478 visitor-days and the 210 it passes are on Swiss ISPs or arrive from Google — nothing for an edge flag to add). Before Germany: Queues, Supabase Pro, R2. No GA4, no Clarity. Read the Engagement dashboard after a week of data.
3. **Visual pass, UI audit, copy** — done 2026-09-17 and 2026-09-19/20. Every page type and interaction driven live at 375 and 1440; every line of interface copy rewritten in the settled voice. Left: market descriptions (158, travel-guide voice, DE and EN sometimes disagree on facts) — after the content floor counts facts and organiser data arrives, not before.
4. **Near me and the search control** — built and live 2026-09-18: one editorial control on home and Near me, Near me's four states, the distance pill, gutters on Near me and canton lists, `geo_prompt` events (migration applied the same day). `PAGES.md` §Home and §Near me, `BRAND.md` §Controls. **Read the allow rate after four weeks:** `geo_prompt` granted ÷ requested; below ~30% the button is in the wrong place. One `DateFilters` look on every page (checked live 2026-09-19).
5. **Market watch agent.** Runs on fleafind and stays there (Delfim, 2026-09-19); its source pages are in our `facts` as `source_page`. A new one is built for other countries when they come.
6. **Germany — spec written 2026-09-22, build from `GERMANY-SPEC.md`, one step per fresh session.** Product shape approved by Delfim the same day: the visitor's *place* is the country switch (a remembered pill in the header, phones 2–3 of `design/front-door.html`); the front door is town lists under a country heading with a small flag (phone 1A); country pages are today's home per country; Near me ignores borders; the map was rejected as gimmicky. Data: agents use the main German directories as a lead list and read 50–60 major markets from the organisers' own sites (Delfim: start slowly but surely). Order: intake → tree → region template → country page, front door, pill, root redirect → flip live → Queues/Pro/R2 → German organisers. **Step 1 done 2026-09-22:** ten research agents in three rounds, 55 markets in 38 towns across all 16 Bundesländer, every fact from the organiser's own page (`intake/de/`, `intake/README.md`), descriptions in de and en, loaded by `scripts/import-intake.mjs` as `unverified` — 0 publishable, a live build read back unchanged at 1,440 pages after each round. 467 dates, 42 organiser links minted, nothing mailed. Delfim: start with 20, no publishing before he brings the photos. The Auer Dult stays in (Delfim, 2026-09-22); Mauerpark's organiser site is stale since 2022, the market runs. **Step 2 done 2026-09-22:** Germany is in the tree — `/de/deutschland/muenchen/`, `/en/germany/bundesland`→`state/bayern/`, `de-DE` and plain `en` on German pages, `de-CH` untouched on Swiss ones, the region word country-aware in the path and in the copy ("in Bayern", never "im Bundesland Bayern"). Built and checked with `scripts/preview-germany.mjs` — all ten guardrails green with the 55 switched on, and switched back after. **Step 3 settled the same day:** the region template needs no change — the largest German region holds 8 markets against Zürich's 29 — and every Bundesland gets a page however thin (Delfim: Bremen has 1, Saarland 2; Switzerland already ships one-market cantons). **Step 4, 2026-09-22:** the front door is built — one block per country, flag, counts, towns and regions, and no country picker anywhere (six comparable sites read live; not one has one). The root keeps its plain redirect: no geo guess, decided on evidence. The country page is parked (Delfim). The place pill is built too — the remembered town in the header of every page but home, a shortcut and not a second picker. **Left before Germany can go live: nothing but the word.** Flip the 55 to `active` (`scripts/preview-germany.mjs` shows what that looks like first), deploy, add the new paths to Search Console and Bing.
7. Buffer.

SEO follow-ups (`reference/seo-research/plan.md`): Bing Webmaster Tools registered 2026-09-18 — read its AI Performance report monthly; Delfim opens the Search Console *Generative AI* report; image sitemap once real photos exist.

Parked, not urgent: country page (arrives with Germany); German text search (settle the compound-word question in `STACK.md` first; v1 saw 64 searches against 281 filter uses).

---

## Open decisions

Each waits on Delfim or on data. Don't assume an answer.

- **Distance on cards.** Blocked: the town picker stores a name, not coordinates. Never print a guessed distance.
- **Tags.** Nothing fills them yet; a tag that filters to nothing is a dead end. Revisit when organisers supply facts. Small when it comes.
- **Content floor** counts characters and should count verified facts. Fix before any bulk prose generation.
- **Two newsletter forms in a row** on home, city, canton and market pages (card, then footer). Needs a layout decision, not a one-liner.
- **A Metabase host, €6/month** — only when looking without Docker is worth it.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales.** The structure allows it; let Search Console decide.
- Decided and closed: photos stay as they are, real ones via organisers (2026-09-15); the four dateless markets stay `active` (2026-09-15); the logo, chosen and shipped (2026-09-17); analytics stay first-party and keep everything, behaviour included (2026-09-17); `x-default` is English (2026-09-18); no Swiss beachhead region — the focus is Europe (2026-09-19).

---

## Data

226 Swiss markets, 2,583 occurrences, 105 towns, 23 cantons, 173 organisers (63 with an e-mail and a link); plus 55 German markets, unverified, 467 occurrences, 38 towns, all 16 Bundesländer, 46 organisers (42 with a link). Thinnest: Bremen 1, Saarland 2; every other Bundesland has 3 or more. Photos: all 55 supplied by Delfim 2026-09-22 and imported (`scripts/import-photos.mjs`, three sizes each in `public/images/`); every German market has one, so nothing blocks the flip to `active` but step 2. Complete on all 226: descriptions, names and slugs in four locales, rhythm line in four, coordinates, source URLs, a photo. The 64 added 2026-09-20 (`import-v1-additions.mjs`) were researched on fleafind from organiser sites on 2026-09-19/20; their opening times, fees and parking notes sit in `market_private.admin_notes` until a facts pass reads them. Nine cantons are new and thin — Uri and Glarus hold only annual markets with no 2027 date yet, listed under *No date yet*. Missing: 1 postal code, 2 websites, 2 fees, every tag, and for every market size and indoor/outdoor — the organiser page collects those. Prose quality is a spot-check, not a known defect. Data-quality pass 2026-09-19: 13 dead organiser links replaced, 16 missing opening times filled from organiser sites (10 still unpublished by the organisers), one wrong-town description fixed; dates spot-checked against nine organiser calendars, all matching; every upcoming date stamped as verified 2026-09-19 from Delfim's fleafind export (`scripts/confirm.mjs` is the tool for any later check). 60 markets carry no upcoming date — annual ones awaiting 2027 — which the organiser mail is for; since 2026-09-20 they are listed on their town and canton pages rather than hidden. Alpin-Flohmi Interlaken added 2026-09-19 with a photo from Delfim (town Interlaken; the hall is in Wilderswil).

How the import works: `ARCHITECTURE.md` §Import.
