# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story of how things got here is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-09-28.

---

## Now

**Two countries since 2026-09-22.** Live at `fynda.market`: 285 markets — 221 Swiss in four locales, 64 German in de and en — across 148 towns, 23 cantons and 16 Bundesländer, 1,669 pages of which 1,630 are in the sitemap. Rebuilt nightly on GitHub at 23:07 UTC (just after midnight in Zurich) and again at 03:07, because GitHub starts scheduled jobs up to five hours late; ten guardrails and 36 tests gate every publish.

| Running | State |
|---|---|
| **Newsletter** | Friday digest, sent (last two Fridays went out). Scheduled 02:07 UTC so it lands in the morning. The card sits after the dated markets on town, canton and market pages and says what it sends — *The weekend around Basel, in your inbox* (`design/newsletter.html`); one form per page. A town signup keeps its town, and "elsewhere" is the reader's own country. 2 subscribers. Resend **free plan**: 100 mails a day |
| **Forms** | `/n` `/r` `/o` `/u` write rows and ping Telegram (an address's domain only); at most 5 posts an hour per connection, 3 for claims. Queues: `open_reports`, `open_organiser_claims` |
| **Organisers** | Built end to end and proven (claim → Telegram Approve → personal link → seven-day mail → stamp / cancellation / alert → edit page). Their page links the terms since 2026-09-28 ("everything you send stays yours"). **Not started:** no welcome letter sent yet — step 1 below. The seven-day mail only goes to organisers who got the welcome or opened their page; the daily job is a dry run until `ORGANISER_SENDING=on`. The 2026-09-16 test on Bergflohmarkt Chur carries `test = true` and stays out of `organiser_funnel` |
| **Analytics** | First-party (`reference/analytics-research/build-plan.md`). Metabase stays on Delfim's PC (Delfim, 2026-09-23). The `bot_likely` view holds: 25–100 real people a day since 16 Sep, 75% on a phone, mostly from Google. Tightened 2026-09-28: anything from Google's own network is a bot (Chrome prefetch, data-centre robots that even tapped Directions), and our script's own page_leave/web_vitals no longer count as a person interacting — 145 visitor-days since 17 Sep flipped, real directions clicks 93 → 88. What people do (12 days to 28 Sep): every outbound click comes from a market page, 28% of market-page views on the day or the day before end in one against 11% at 8–30 days out; the newsletter card was seen by 369 people and signed up 3 — placement is not the problem. `?intern=1` on any page stops a browser being counted, once per device. The tab's session id only with cookie consent. German country and Bundesland views are counted as `country`/`region` since 2026-09-27 (they were `other`; a test now fails if a country's path words are missing from `_collect.ts`). Robots keep 30 days in `crawler_hits`, then fold nightly into `crawler_daily` |
| **Speed** | Real users, phones, p75: LCP 0.6 s, INP 86 ms, CLS 0. A market page is ~170 KB. `/_astro/*` cached a year |
| **Backups** | Nightly 22:37 UTC, encrypted with age, 90 days in GitHub artifacts. Private key in `.env.local` and Delfim's password manager only. **Never restored yet** — step 1 |
| **Security** | RLS on every table, no policies; the public API roles hold nothing (2026-09-23). Frame and HTTPS headers on every page, including the Functions' pages. Static files skip the Functions (`public/_routes.json`) |
| **Search Console** | 7 days to 2026-09-24: 231 clicks (week before: 94), 9,945 impressions, position ~8, 80% of clicks on a phone. Click rate by page: canton 4.2%, town 2.6%, market 1.1% — market pages get 45% of impressions but only 22% of clicks. Germany: 2 pages seen once each, no clicks — too new. AI features: 311 impressions, same pages as search. Market titles changed 2026-09-23 (next date, year from that date) — the 2026-10-04 export is the first real read. A fresh export every Sunday into `docs/GSCdata/`. SEO plan: `reference/seo-research/plan.md`, re-read 2026-10-16 |
| **Copy** | Voice settled (`BRAND.md` §Voice); visitors du / vous / tu, organisers Sie / vous / tu. Descriptions cleaned 2026-09-23: no dates, stale years, hype, keyword tails or template filler left. Organiser mails reread: German that reads as German in both countries (*innerhalb*, not *innert*), no country named, full sentences |
| **Front door & place** | One block per country on the home page, flags, no country picker, no geo redirect. One town search (`TownSearch.astro`) on home and Near me; Near me groups by distance bands. The chosen town is a pill in the header |
| **Photos** | Every market has one. Real ones arrive through organisers. A shared market link previews with its own photo (`/share/*.jpg`, 900 × 472, made at build) |
| **Market page** (2026-09-26, `design/market-v1.html`) | The status line knows the hour — *Opens in 40 min · Open now · Closes in 1 h 10 min · Over for today, next Sat 3 Oct* — and today's list rows everywhere say *Closes in…* and fade when over. *Also today, nearby* under the buttons: ≤3 same-day markets within 15 km. Share (the phone's own sheet). **Distance on cards**: after a visitor picks a town, every list card within 50 km carries "4 km", and the market page's strip "19 km · from Zurich" (`design/distance-v1.html`); a town picked before 2026-09-26 has no coordinates until picked again. Home shows the visitor's own country first in *This weekend* (picked town, else browser language region). Town search on the 404s |

Not built: tags shown to visitors · country page (parked) · text search · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

1. **Delfim's desktop session** — the build side is done; these need his accounts.
   1. ~~DMARC~~ — done 2026-09-24, `p=none`, reports to contact@fynda.market. SPF and DKIM for Resend already right.
   2. **Organiser welcome letters.** GitHub → Actions → *Organiser welcome* → *Run workflow* → your own address in the **third** box ("Send a preview…"), the rest empty → read it. Then again with *send* ticked: 90 go (Resend free: 100 a day). Next day once more for the other 68. "Did it leave?" is a query on `organiser_mail_sends`, not a guess. The 33 who confirmed on v1 are the warmest.
   3. Then repository variable `ORGANISER_SENDING=on` — the daily seven-day mail starts for those who got the letter.
   4. **Restore one backup** to prove the key opens it (commands at the top of `.github/workflows/backup.yml`).
   5. ~~Search Console and Bing~~ — done 2026-09-28: the domain property and sitemap already covered Germany; sitemap resubmitted, five German pages pushed on both.
2. **Next session: the annual dates mail**, with an *Upload your dates* box on the organiser page (PDF or flyer photo → Telegram → typed in). Must exist before December. Then **Germany deep in four cities**. The rest of the product review, with Delfim's verdicts, is in `IDEAS.md`.
3. **Read, on these dates** — nothing to build until then.
   - 2026-10-04 and 2026-10-11 Search Console exports: does Germany earn anything; Bremen (1 market) and Saarland (2) excluded as thin → they lose their page. (2026-09-27 export ended 2026-09-24 — too early for both.)
   - **2026-10-25 export: do the new market titles work?** Stücki, Flohmi am See, GZ Bachwiesen and Schadaumärit had 1,611 impressions and 1.8% clicks on 20 Sep with the old titles; all four run again 18 Oct. Above 3% means yes.
   - Four weeks after the letters: organiser answer rate (`organiser_funnel`). >25% build more for organisers, 10–25% keep as a data feed, <10% stop.
   - 2026-10-21: Near me allow rate, `geo_prompt` granted ÷ requested. Below ~30% the button is in the wrong place. Checked 2026-09-28: the event fires; only 4 people have tapped the button at all, because a visitor with a town already picked is sent straight to it. Expect too little data to judge.
   - Newsletter: sign-ups per form view now the card has moved.
   - From 2026-10-10: the *nearby* block — `market_click` events whose page is a market page (it is the only list there), against market-page views. If nobody clicks it, it goes. Share taps are not counted (the event vocabulary would need a migration).
4. ~~Search wins~~ — built 2026-09-28: a market title drops "nächster Termin" before it drops the place, and never uses a street address as the place (68 of 285 titles changed; Kanzlei is "Kanzleiareal (Helvetiaplatz)" now); the snippet is date, time, place, setting and the next two dates instead of the title again; an annual market between editions says when it last ran, on its page and in its snippet, and so does a town with nothing upcoming (30 town pages). Read it with the market titles on 2026-10-25.
5. **Germany: Hamburg, München, Köln are thin** — 7 markets listed of ~45 real ones (Köln 1 of ~14). Fastest: three organisers already on file run ~7 more — Cölln Konzept (Nippes, Riehl, Südbrücke, RheinEnergieStadion), kreaktiva (Flohdom Horner Rennbahn), marktkultur (Museum der Arbeit, Immenhof). Then Galopprennbahn Weidenpesch, Daglfing, Midnightbazar. Takes `intake/`, with the date mail.
6. **Analytics partitioning**, October.
7. **More markets, both countries.** Berlin: 19 more recurring markets researched 2026-09-26 and left for spring (`intake/batch-berlin/README.md`). `intake/README.md`, `node scripts/import-intake.mjs intake/<country>`; they arrive `unverified`. `confirm.mjs` stamps every future date unless given the dates seen — name them.
8. Buffer.

Parked: country page (the front door carries the towns); German text search (settle compounds in `STACK.md` first).

---

## Open decisions and ceilings

Each waits on Delfim or on data. Don't assume an answer.

- **Ceilings (measured 2026-09-23).** Resend free sends 100 a day and the digest goes in one morning → paid plan before ~80 subscribers. Cloudflare Pages takes 20,000 files per deploy: 2,779 now, ~6–8 per market → images to R2 before ~2,500 more markets. Near me carries every market (275 KB at 277) → split by country or load as data past ~800. Database ~50 MB of 500 (2026-09-27, with `history`). Build 21 s.
- **German silent visits count as bots** (`bot_likely` rule 1 predates Germany). Revisit when German traffic exists to check against.
- **A native speaker's pass** over DE/FR/IT.
- **Tags** — nothing fills them yet. Revisit when organisers supply facts.
- **Content floor** counts characters and should count verified facts. Fix before any bulk prose generation.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales** — let Search Console decide.
- Closed: the bare address goes to `/en/`, not `/de/` (Delfim, 2026-09-28); photos stay, real ones via organisers; dateless markets stay `active`; logo shipped; analytics first-party, everything kept; `x-default` English; no Swiss beachhead — the focus is Europe; Metabase on Delfim's PC only (2026-09-23); a market that has ended (`permanently_closed`) sends every address to its town page, or the home page if the town has none left — `scripts/redirects.mjs` (2026-09-27, first: Prélaz-Valency).

---

## Data

**Audits, 2026-09-23** — SEO, data quality, UI, copy, conversion, analytics, performance, architecture, scalability, organisers, security, operations; each one's fixes are in the commit that names it. Data quality: 14 random upcoming markets checked against the organisers' own sites, **every date right**; one closing time fixed (Wetzikon); 11 dead links fixed; Flohdom Bahrenfeld's one-off cancellation on 3 Oct added from kreaktiva.de.

221 Swiss markets in four locales, 64 German in de and en, all `active` — Berlin 14 since 2026-09-27 (nine added, photos from Delfim; Ostbahnhof and Leo photos are small, 460 and 600 px — replace when better ones turn up). 5 closed (four Marchés du Tunnel from v1, Prélaz-Valency). 33 Swiss markets carry *Confirmed by the organiser* from v1 (April–August 2026); a bulk stamp on 2026-09-19 wiped it and `20260927120000` put it back; a trigger now refuses to move a market off `verified_by = organiser` unless the session sets `fynda.allow_unverify`. 217 organisers with a live market, 158 with an e-mail and a personal link (54 found on their own sites 2026-09-24), 59 with only a website or phone — for those, no address is published on the site, or only a town hall's (`scripts/import-organiser-emails.mjs <csv> --apply` adds addresses; the same workflow welcomes them). Thinnest regions: Bremen 1, Saarland 2. About 60 markets carry no upcoming date — annual ones awaiting next year, listed under *No date yet*; the organiser mail is how those fill. Known and fine: markets with no stated fee, German dates derived from a stated rhythm and shown as *not yet confirmed*. The 64 markets added 2026-09-20 keep opening times, fees and parking notes in `market_private.admin_notes` until a facts pass reads them.

**Facts pass, 2026-09-27/28.** Sonnet agents read organisers' pages for indoor/outdoor, stall count and rain; every fact checked by hand before `scripts/set-market-facts.mjs` writes it (batches with quotes in `intake/facts/`; never overwrites). 210 of 286 checked: setting known for 168 (120 outdoor, 38 indoor, 10 both), stalls 18, rain 41. Websites give indoor/outdoor for ~8 in 10 markets, stalls and rain for ~1 in 10 — the rest come from organisers; the other ~76 markets have thin or dead websites. What the pass turned up is fixed (migrations `20260927190000`–`…210000`: EcoBroc, 17 Terra, Prélaz-Valency, the Yverdon/Bulle/St. Johann addresses and times, Obere Mühle's two editions). Still open: Subingen's stalls are at homes plus a table point at Wohnheim Kontiki, not the square (no coordinates yet); Holstenhallen Neumünster (outdoor in Sep, Halle 5 Nov–Jan) and Bülach (outdoor pitches in spring and autumn) stay blank — one setting per market cannot say either. The "checked" stamp moved to 2026-09-27 only where dates were compared that day (EcoBroc, Yverdon, Bulle, Rüti Pratteln) — Delfim, 2026-09-28: the stamp means a date check, not a facts check.

**Phone walkthrough, 2026-09-28** (migration `20260928120000`): Rumine's "until 16:30 in winter" was never the city's — one set of hours all year; Dampfzentrale runs April–September, not October; 22 place names that were sentences ("bei der Eishalle", "Karte auf kreisflohmi.ch") are names now. Barfüsserplatz Basel and Dampfzentrale show *no date yet* correctly — the organisers have published nothing further.

**History since 2026-09-27.** Every change to a market, date, venue, text or tag lands in `history` (before, after, who, when; append-only), and `market_stats_monthly` holds one row per month per country and region, starting September 2026.

**Data as a product** (Delfim wants to sell it one day). The asset is the market facts with their provenance and history, not visitor behaviour. Not before ~10,000 dates across two countries (`reference/analytics-research/monetise.md`). The terms allow sharing and licensing what people send since 2026-09-27, and the organiser page links them. Never sell visitor rows — counts over 10+ people only.

How the import works: `ARCHITECTURE.md` §Import.
