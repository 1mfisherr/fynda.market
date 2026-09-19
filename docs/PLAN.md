# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story of how things got here is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-09-20.

---

## Now

Live at `fynda.market` since 2026-09-04: 158 published markets, 58 towns, 14 cantons, four locales, ~950 pages. Rebuilt nightly at 03:00 UTC on GitHub; ten guardrails and the tests gate every publish.

| Running | State |
|---|---|
| **Newsletter** | Friday digest since 2026-09-11, welcome and unsubscribe in four languages, pause and monthly options, Resend delivery events in. 1 subscriber |
| **Forms** | `/n` `/r` `/o` `/u` write rows and ping Telegram; queues are the views `open_reports`, `open_organiser_claims` |
| **Organisers** | Live 2026-09-16, proven end to end. Claim → Telegram Approve → personal link → seven-day mail with three buttons → stamp / cancellation / alert → edit page. Daily job runs as a **dry run** until `ORGANISER_SENDING=on` |
| **Analytics** | Everything first-party (2026-09-17): page views with market/town/canton and lead time, time on page and scroll, sessions, Web Vitals, errors, 404s, towns, browser language, robots in `crawler_hits` with AI roles. Metabase: six dashboards, bots-or-people filter. ~10–30 real people a day, 85% of raw views are crawlers, two thirds from Google, 60% on a phone, ChatGPT sends a couple of visits a day |
| **Backups** | Nightly 02:30 UTC, encrypted, 90 days in GitHub artifacts (`.github/workflows/backup.yml`). The private key is in `.env.local` and Delfim's password manager only |
| **Search Console** | 7 days to 2026-09-18: 83 clicks, 7,555 impressions, position 9.8. Page 1 without clicks: CTR 0.6% at positions 4–6. SEO session 2026-09-18 (`reference/seo-research/plan.md`): titles without the brand suffix and with the next date, data-built descriptions, 404s out of the sitemap, root a real 301, `llms.txt` gone, IndexNow after every publish. **Re-read 2026-10-16** |
| **Performance** | Lighthouse mobile 97–99, first paint 1.2 s, font self-hosted, 720px hero on phones |
| **Photos** | Every market has one; one is real. Real ones arrive through organisers |

Not built: tags on any market · country page · text search · distance on cards · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

**Germany live by end of November 2026** (Delfim, 2026-09-16). Ten weeks.

1. **Organisers, round one.** 22 organisers have an address and a personal link (loaded 2026-09-19 from the fleafind export; nothing sent). All 22 run occasional or annual markets, which is the case the seven-day mail is for (Delfim, 2026-09-19). Before sending: rewrite the welcome mail's first paragraph for people who did not ask (no mention of the predecessor site — Delfim, 2026-09-19), in four languages; then `--welcome` to the 22; then `ORGANISER_SENDING=on`. Delfim wants a few things polished first. Afterwards, e-mails for the ~90 with only a website. `scripts/import-organiser-emails.mjs <csv> --apply --welcome` loads them; `ORGANISER_SENDING=on` turns the daily mail live. **Read the answer rate after four weeks** (`organiser_funnel`): >25% extend, 10–25% keep as a data feed, <10% stop building for organisers.
2. **Analytics v2** — built 2026-09-17 (`reference/analytics-research/build-plan.md` phases 1–3). Left: partitioning, in October. Dropped 2026-09-19: the key-forgetting job (all data stays as is — Delfim) and the edge `suspect` flag (checked a week of rows: the `bot_likely` view already catches 1,268 of 1,478 visitor-days and the 210 it passes are on Swiss ISPs or arrive from Google — nothing for an edge flag to add). Before Germany: Queues, Supabase Pro, R2. No GA4, no Clarity. Read the Engagement dashboard after a week of data.
3. **Visual pass and UI audit** — done 2026-09-17: all twelve page types at 375 and 1440, every form and interaction driven live. Fixed: locale 404s, header tap targets, the saved-page plural, the radius shown before a location, the home card's radius promise, Route now opens directions, English storage keys, one honeypot component. Cloudflare's email obfuscation switched off (Delfim, 2026-09-18). Left: a fresh Search Console export every Sunday (`docs/GSCdata/`) before judging the 15 Sept title rewrite. Day grouping is one function (`groupByDay` in `lists.ts`) since 2026-09-19. **Copy pass** started 2026-09-19: brand line and voice settled (`BRAND.md` §Voice), home and market pages rewritten in four languages — the site stops talking about itself. One stamp grammar: "Checked 19 Sep" / "Confirmed by the organiser, 19 Sep" / "Not confirmed yet"; a date row carries a word only when it is an exception (say the exception, never the rule). Fixed on the way: far-off dates carry their year, cancelled dates are not counted as upcoming, the address no longer repeats itself. Town and canton heads now compute "checked 19 Sep" from the listed dates (`lastChecked` in `lists.ts`) and say nothing on a town without dates. Canton page done 2026-09-19 ("Towns" not "Cities" everywhere, the row day badge no longer German on every locale). About page rewritten 2026-09-19 in Delfim's voice, first person, claiming only what the pages show. Near me, the organiser page and the newsletter page done 2026-09-19 (the newsletter page now says what the code does: Friday, plus a same-day note when a date is cancelled). Report page done 2026-09-20 — every page type now speaks in the settled voice. du/Sie sweep done 2026-09-20: visitors are du / vous / tu on every page and in every mail (newsletter welcome, report ack, alert, digest); organisers are Sie in German, vous in French, tu in Italian, as their mails already were. Legal pages stay formal. The newsletter welcome mail no longer says "once a week, never more". Left: a native speaker's pass over DE/FR/IT before the organiser mail goes out. Still open from the live-copy audit (2026-09-19): the report link still has two names in the footer and on the report page, du/Sie mixed in German and tu/Lei in Italian.
4. **Near me and the search control** — built and live 2026-09-18: one editorial control on home and Near me, Near me's four states, the distance pill, gutters on Near me and canton lists, `geo_prompt` events (migration applied the same day). `PAGES.md` §Home and §Near me, `BRAND.md` §Controls. **Read the allow rate after four weeks:** `geo_prompt` granted ÷ requested; below ~30% the button is in the wrong place. One `DateFilters` look on every page (checked live 2026-09-19).
5. **Market watch agent.** Runs on fleafind and stays there (Delfim, 2026-09-19); its source pages are in our `facts` as `source_page`. A new one is built for other countries when they come.
6. **Germany** (weeks 6–9): data intake, de+en locale, Bundesland pages, country pages, home becomes the country chooser. **Region template:** one design for canton, Bundesland and any later district, decided on real German counts — a list of every market works at 29 (Zurich) and not at 300 (Bavaria). Not a Swiss redesign: canton pages are the best-earning type per page (7 days to 2026-09-18: 0.5 clicks/page vs 0.3 town, 0.2 market).
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

162 markets, 2,378 occurrences, 58 towns, 14 cantons, 115 organisers (22 with an e-mail and a link), 1,782 facts. Complete on all 161: descriptions, names and slugs in four locales, coordinates, source URLs. Missing: 1 postal code, 2 websites, 2 fees, every tag, and for every market size and indoor/outdoor — the organiser page collects those. Prose quality is a spot-check, not a known defect. Data-quality pass 2026-09-19: 13 dead organiser links replaced, 16 missing opening times filled from organiser sites (10 still unpublished by the organisers), one wrong-town description fixed; dates spot-checked against nine organiser calendars, all matching; every upcoming date stamped as verified 2026-09-19 from Delfim's fleafind export (`scripts/confirm.mjs` is the tool for any later check). 46 markets carry no upcoming date — annual ones awaiting 2027 — which the organiser mail is for. Alpin-Flohmi Interlaken added 2026-09-19 with a photo from Delfim (town Interlaken; the hall is in Wilderswil).

How the import works: `ARCHITECTURE.md` §Import.
