# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story of how things got here is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-09-27.

---

## Now

**Two countries since 2026-09-22.** Live at `fynda.market`: 286 markets — 222 Swiss in four locales, 64 German in de and en — across 148 towns, 23 cantons and 16 Bundesländer, 1,669 pages of which 1,630 are in the sitemap. Rebuilt nightly on GitHub at 23:07 UTC (just after midnight in Zurich) and again at 03:07, because GitHub starts scheduled jobs up to five hours late; ten guardrails and 30 tests gate every publish.

| Running | State |
|---|---|
| **Newsletter** | Friday digest, sent (last two Fridays went out). Scheduled 02:07 UTC so it lands in the morning. The card sits after the dated markets on town, canton and market pages and says what it sends — *The weekend around Basel, in your inbox* (`design/newsletter.html`); one form per page. A town signup keeps its town, and "elsewhere" is the reader's own country. 2 subscribers. Resend **free plan**: 100 mails a day |
| **Forms** | `/n` `/r` `/o` `/u` write rows and ping Telegram (an address's domain only); at most 5 posts an hour per connection, 3 for claims. Queues: `open_reports`, `open_organiser_claims` |
| **Organisers** | Built end to end and proven (claim → Telegram Approve → personal link → seven-day mail → stamp / cancellation / alert → edit page). **Not started:** no welcome letter sent yet — step 1 below. The seven-day mail only goes to organisers who got the welcome or opened their page; the daily job is a dry run until `ORGANISER_SENDING=on` |
| **Analytics** | First-party (`reference/analytics-research/build-plan.md`). Metabase stays on Delfim's PC (Delfim, 2026-09-23). The `bot_likely` view holds: 25–100 real people a day since 16 Sep, 75% on a phone, mostly from Google. `?intern=1` on any page stops a browser being counted, once per device. The tab's session id only with cookie consent. Robots keep 90 days in `crawler_hits`, then fold nightly into `crawler_daily` |
| **Speed** | Real users, phones, p75: LCP 0.6 s, INP 86 ms, CLS 0. A market page is ~170 KB. `/_astro/*` cached a year |
| **Backups** | Nightly 22:37 UTC, encrypted with age, 90 days in GitHub artifacts. Private key in `.env.local` and Delfim's password manager only. **Never restored yet** — step 1 |
| **Security** | RLS on every table, no policies; the public API roles hold nothing (2026-09-23). Frame and HTTPS headers on every page, including the Functions' pages. Static files skip the Functions (`public/_routes.json`) |
| **Search Console** | 7 days to 2026-09-24: 231 clicks (week before: 94), 9,945 impressions, position ~8, 80% of clicks on a phone. Click rate by page: canton 4.2%, town 2.6%, market 1.1% — market pages get 45% of impressions but only 22% of clicks. Germany: 2 pages seen once each, no clicks — too new. AI features: 311 impressions, same pages as search. Market titles changed 2026-09-23 (next date, year from that date) — the 2026-10-04 export is the first real read. A fresh export every Sunday into `docs/GSCdata/`. SEO plan: `reference/seo-research/plan.md`, re-read 2026-10-16 |
| **Copy** | Voice settled (`BRAND.md` §Voice); visitors du / vous / tu, organisers Sie / vous / tu. Descriptions cleaned 2026-09-23: no dates, stale years, hype, keyword tails or template filler left. Organiser mails reread: German that reads as German in both countries (*innerhalb*, not *innert*), no country named, full sentences |
| **Front door & place** | One block per country on the home page, flags, no country picker, no geo redirect. One town search (`TownSearch.astro`) on home and Near me; Near me groups by distance bands. The chosen town is a pill in the header |
| **Photos** | Every market has one — 226 Swiss, 64 German. Real ones arrive through organisers. A shared market link previews with its own photo (`/share/*.jpg`, 900 × 472, made at build) |
| **Market page** (2026-09-26, `design/market-v1.html`) | The status line knows the hour — *Opens in 40 min · Open now · Closes in 1 h 10 min · Over for today, next Sat 3 Oct* — and today's list rows everywhere say *Closes in…* and fade when over. *Also today, nearby* under the buttons: ≤3 same-day markets within 15 km. Share (the phone's own sheet). **Distance on cards**: after a visitor picks a town, every list card within 50 km carries "4 km", and the market page's strip "19 km · from Zurich" (`design/distance-v1.html`); a town picked before 2026-09-26 has no coordinates until picked again. Home shows the visitor's own country first in *This weekend* (picked town, else browser language region). Town search on the 404s |

Not built: tags shown to visitors · country page (parked) · text search · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

1. **Delfim's desktop session** — the build side is done; these need his accounts.
   1. ~~DMARC~~ — done 2026-09-24, `p=none`, reports to contact@fynda.market. SPF and DKIM for Resend already right.
   2. **Organiser welcome letters.** GitHub → Actions → *Organiser welcome* → *Run workflow* → your own address in the **third** box ("Send a preview…"), the rest empty → read it. Then again with *send* ticked: 90 go (Resend free: 100 a day). Next day once more for the other 68. "Did it leave?" is a query on `organiser_mail_sends`, not a guess.
   3. Then repository variable `ORGANISER_SENDING=on` — the daily seven-day mail starts for those who got the letter.
   4. **Restore one backup** to prove the key opens it (commands at the top of `.github/workflows/backup.yml`).
   5. **Search Console and Bing:** add the German paths.
2. **Next session: the annual dates mail**, with an *Upload your dates* box on the organiser page (PDF or flyer photo → Telegram → typed in). Must exist before December. Then **Germany deep in four cities**. The rest of the product review, with Delfim's verdicts, is in `IDEAS.md`.
3. **Read, on these dates** — nothing to build until then.
   - 2026-10-04 and 2026-10-11 Search Console exports: do market titles lift market-page click rate above 1.1%; does Germany earn anything; Bremen (1 market) and Saarland (2) excluded as thin → they lose their page. (2026-09-27 export ended 2026-09-24 — too early for both.)
   - Four weeks after the letters: organiser answer rate (`organiser_funnel`). >25% build more for organisers, 10–25% keep as a data feed, <10% stop.
   - 2026-10-21: Near me allow rate, `geo_prompt` granted ÷ requested. Below ~30% the button is in the wrong place.
   - Newsletter: sign-ups per form view now the card has moved.
   - From 2026-10-10: the *nearby* block — `market_click` events whose page is a market page (it is the only list there), against market-page views. If nobody clicks it, it goes. Share taps are not counted (the event vocabulary would need a migration).
4. **Analytics partitioning**, October.
5. **More markets, both countries.** Berlin: 19 more recurring markets researched 2026-09-26 and left for spring (`intake/batch-berlin/README.md`). `intake/README.md`, `node scripts/import-intake.mjs intake/<country>`; they arrive `unverified`. `confirm.mjs` needs an `--until` before the next big confirmation round (it stamps every future date).
6. Buffer.

Parked: country page (the front door carries the towns); German text search (settle compounds in `STACK.md` first).

---

## Open decisions and ceilings

Each waits on Delfim or on data. Don't assume an answer.

- **Ceilings (measured 2026-09-23).** Resend free sends 100 a day and the digest goes in one morning → paid plan before ~80 subscribers. Cloudflare Pages takes 20,000 files per deploy: 2,779 now, ~6–8 per market → images to R2 before ~2,500 more markets. Near me carries every market (275 KB at 277) → split by country or load as data past ~800. Database 40 MB of 500. Build 21 s.
- **German silent visits count as bots** (`bot_likely` rule 1 predates Germany). Revisit when German traffic exists to check against.
- **A native speaker's pass** over DE/FR/IT.
- **Tags** — nothing fills them yet. Revisit when organisers supply facts.
- **Content floor** counts characters and should count verified facts. Fix before any bulk prose generation.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales** — let Search Console decide.
- Closed: photos stay, real ones via organisers; dateless markets stay `active`; logo shipped; analytics first-party, everything kept; `x-default` English; no Swiss beachhead — the focus is Europe; Metabase on Delfim's PC only (2026-09-23).

---

## Data

**Audits, 2026-09-23** — SEO, data quality, UI, copy, conversion, analytics, performance, architecture, scalability, organisers, security, operations; each one's fixes are in the commit that names it. Data quality: 14 random upcoming markets checked against the organisers' own sites, **every date right**; one closing time fixed (Wetzikon); 11 dead links fixed; Flohdom Bahrenfeld's one-off cancellation on 3 Oct added from kreaktiva.de.

222 Swiss markets in four locales, 64 German in de and en, all `active` — Berlin 14 since 2026-09-27 (nine added, photos from Delfim; Ostbahnhof and Leo photos are small, 460 and 600 px — replace when better ones turn up). 33 Swiss markets carry *Confirmed by the organiser* from v1 (April–August 2026); a bulk stamp on 2026-09-19 wiped it by accident and `20260927120000_restore_organiser_verified.sql` put it back (applied 2026-09-27) — any bulk update must leave `verified_by = 'organiser'` alone. These 33 are the warmest organisers for the welcome letter. 217 organisers with a live market, 158 with an e-mail and a personal link (54 found on their own sites 2026-09-24), 59 with only a website or phone — for those, no address is published on the site, or only a town hall's (`scripts/import-organiser-emails.mjs <csv> --apply` adds addresses; the same workflow welcomes them). Thinnest regions: Bremen 1, Saarland 2. About 60 markets carry no upcoming date — annual ones awaiting next year, listed under *No date yet*; the organiser mail is how those fill. Known and fine: markets with no stated fee, German dates derived from a stated rhythm and shown as *not yet confirmed*. The 64 markets added 2026-09-20 keep opening times, fees and parking notes in `market_private.admin_notes` until a facts pass reads them. Missing everywhere: tags, size, indoor/outdoor — the organiser page collects those.

How the import works: `ARCHITECTURE.md` §Import.
