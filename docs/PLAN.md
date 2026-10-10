# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-10-10.

---

## Now

Live at `fynda.market` since 2026-09-04, two countries since 2026-09-22: **343 markets** — 263 Swiss in four locales, 80 German in de and en — in 174 towns, 23 cantons and 16 Bundesländer; 1,980 pages, 1,948 in the sitemap. 94 markets have no upcoming date (annual ones between editions). Rebuilt nightly by GitHub at 23:07 UTC and again at 03:07 (GitHub starts late); ten guardrails and 75 tests gate every publish.

| Running | State |
|---|---|
| **Pages with no date** (2026-10-10, `design/nodate-v1.html`) | A market between editions says *Back in April* / *Usually in September* from the months it runs (`season_from`/`season_to`, 155 markets), else when it last ran; *Tell me when it's back* (`/b` → `date_alerts`, one mail sent by the nightly publish once a date appears, an unticked box for the weekly mail); *Meanwhile, nearby*. Town pages: undated rows say when they are back, the alert when nothing is dated, *Towns nearby*. `PAGES.md` |
| **Market page extras** (2026-10-10, `design/next-v1.html`) | The decision strip carries what decides a trip: what's sold (81 tags on 76 markets, from each market's own text, quotes in `intake/tags/`), stalls, setting, who sells, a fee, rain. *Earlier this year* — the record of past dates. *Were you there?* — one tap after a date (`/v` → `date_answers`); a yes makes the date *Seen on*, a no pings Telegram. *12 people are waiting for your next date* on the organiser page, in the welcome letter and (from 3) on the claim card |
| **Newsletter** | Friday digest at 02:07 UTC, 6 subscribers. The card says what it sends — *The weekend around Basel, in your inbox*; one form per page. Resend **free plan**: 100 mails a day |
| **Keeping dates true** | Switzerland copied weekly from v1 (`sync-v1.mjs --apply`, inside the Market Watch run; Delfim, 2026-10-09); differences settled in our favour are in `intake/sync-v1/keep-ours.json` and corrected in v1 too. Open, the pages don't settle them: Puces du CPO 23 Dec 2027, Fribourg Vieille Ville 16:00 or 16:30. Everywhere else the **Market Watch** (`ARCHITECTURE.md` §Watch), weekly on Delfim's PC after a login; approve or dismiss its findings in Telegram. What is left to build: `WATCH-SPEC.md` |
| **Market Finder** | Two four-city runs (Berlin, Hamburg, München, Köln). Live from them: Daglfing, Midnightbazar (München), Nachtflohmarkt Gleishalle (Hamburg), Friedrichshagen, KiezKram (Berlin), Ebertplatz, Martinsmarkt (Köln). Unread leads: a camera fair (Berlin), Krims & Krams at Bahnwärter Thiel (München). 28 German candidates outside the four cities wait for January (`intake/finder/check-de-2026-10-09.json`) |
| **Forms** | `/n` `/b` `/v` `/r` `/o` `/u` write rows and ping Telegram (an address's domain only); capped per connection per hour. Queues: `open_reports`, `open_organiser_claims` |
| **Organisers** | Built end to end (claim → Telegram Approve → personal link → seven-day mail → stamp / cancellation / alert → edit page). **No welcome letter sent yet** — step 1 below. The seven-day mail is a dry run until `ORGANISER_SENDING=on`. Bergflohmarkt Chur carries `test = true` |
| **Copy** | Voice in `BRAND.md` §Voice; visitors du / vous / tu, organisers Sie / vous / tu. 2026-10-10: the interface, organiser page and mails, and the market descriptions, edited for voice in German, French and Italian (an editor pass, not a human native speaker): calques out, regional words that read oddly across the border out. Descriptions carry nothing for sellers — no pitch prices, booking or registration, in any language |
| **Search Console** | **Hit by Google's September 2026 spam update** (from 24 Sep): impressions ~1,000/day → ~12, position 8 → 49, every page type; no manual action. Likely weights (audit 2026-10-07): thin town pages, German texts near-identical to the old site's, +81% pages before the update, titles with a year and no date (fixed 2026-10-09). **Response (Delfim, 2026-10-07): keep working and growing, no cuts in a panic.** Exports every Sunday into `docs/GSCdata/` |
| **Analytics** | First-party, read in Metabase on Delfim's PC. Before the drop 25–100 real people a day, 75% on a phone; since 5 Oct 1–2. On undated market pages 88% arrived from Google and 84% left without a tap (2026-10-10). `?intern=1` stops a browser being counted |
| **Speed** | Phones p75: LCP 0.6 s, INP 86 ms, CLS 0. A market page ~170 KB |
| **Backups** | Nightly 22:37 UTC, encrypted, 90 days in GitHub artifacts; restored once into a throwaway database 2026-10-07, every count matched. Recipe in `.github/workflows/backup.yml` — never onto the live database |
| **Security** | RLS on every table, no policies; public API roles hold nothing. Frame and HTTPS headers on every page. Static files skip the Functions (`public/_routes.json`) |
| **Stickers** | A QR code and *Every flea market near you* (Delfim, 2026-09-30); final design not chosen; drafts in `stickers/` (gitignored). The code opens `fynda.market/s`, which lands on home in the phone's language, tagged `utm_source=sticker` |

Not built: country page (parked) · text search · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

**Until the end of 2026: perfect the website, add markets slowly, city by city. From January: expansion** — more of Germany, then other countries, with the finder (Delfim, 2026-10-09).

1. **Delfim's focused session** (his accounts; he wants a session to look properly, 2026-10-10):
   1. **Organiser welcome letters.** GitHub → Actions → *Organiser welcome* → *Run workflow* → his own address in the **third** box ("Send a preview…"), the rest empty → read it. Then again with *send* ticked: 90 go (Resend free: 100 a day); the next day the rest. "Did it leave?" is a query on `organiser_mail_sends`. The 33 who confirmed on v1 are the warmest.
   2. Then repository variable `ORGANISER_SENDING=on` — the daily seven-day mail starts for those who got the letter.
2. **A later session (Delfim): who sells and how big.** A facts pass for `seller_mix` and stall counts from organisers' pages, through `set-market-facts.mjs` with quotes — size is what visitors decide on and we hold it for 18 markets.
3. **Before December: the annual dates mail**, with an *Upload your dates* box on the organiser page (PDF or flyer photo → Claude reads the dates → Delfim approves in Telegram). It says *N people are waiting* where they are. Paid from the **Claude Startups** membership (accepted 2026-10, under flightbrief.news — check the terms cover fynda; $1,000 API credit, check the expiry; Applied AI office hours — book one for this).
4. **Organiser share kit** (proposed 2026-10-10, not yet decided): a link and QR code each organiser can put on their site and posters — a way in that is not Google.
5. **Germany deep in four cities.** Berlin: 19 more recurring markets researched 2026-09-26, left for spring (`intake/batch-berlin/README.md`). Köln: five Melan car-park markets stay `unverified` until someone has a photo (GLOBUS Marsdorf, METRO Godorf, SELGROS Butzweilerhof, PORTA Lind, ROLLER Marsdorf); for spring Immenhof (23 May 2027), Cölln's P6 (4 Apr 2027), Weidenpesch's spectator-area market (6 May 2027). München: the Theresienwiese BRK market next. `intake/README.md`, `import-intake.mjs`; markets arrive `unverified`.
6. **Analytics partitioning**, October.
7. Buffer.

**Read, on these dates** — nothing to build until then:
- 2026-10-11 Search Console export: does Germany earn anything; Bremen (1 market) and Saarland (2) as thin → lose their page?
- 2026-10-25 and 2026-11-01 exports: the titles (no year without a date since 2026-10-09), and Stücki, Flohmi am See, GZ Bachwiesen, Schadaumärit (1.8% clicks on 20 Sep; all run 18 Oct) — above 3% means the new titles work.
- 2026-10-21: Near me allow rate (`geo_prompt` granted ÷ requested); below ~30% the button is in the wrong place. Expect too little data.
- 2026-11-07: *Tell me when it's back* — `date_alerts` rows (and weekly ticks: `newsletter_subscribers` from undated pages) against undated market-page views, where 84% left without a tap before. *Were you there?* answers per day-after view. The nearby block: `market_click` on market pages — if nobody clicks it, it goes.
- Four weeks after the letters: organiser answer rate (`organiser_funnel`). >25% build more for organisers, 10–25% keep as a data feed, <10% stop.

Parked: country page (the front door carries the towns); German text search (settle compounds in `STACK.md` first).

---

## Open decisions and ceilings

Each waits on Delfim or on data. Don't assume an answer.

- **Ceilings.** Resend free: 100 mails a day → paid plan before ~80 subscribers. Cloudflare Pages: 20,000 files per deploy (~2,800 now, ~6–8 per market) → images to R2 before ~2,500 more markets. Near me carries every market → split by country or load as data past ~800. Database ~50 MB of 500.
- **German silent visits count as bots** (`bot_likely` rule 1 predates Germany). Revisit when German traffic exists.
- **A human native speaker** over DE/FR/IT — the 2026-10-10 passes were an editor's, not a native speaker's.
- **Bürkliplatz**: its German and English texts differ (230 vs 220 stands) — check against the organiser.
- **Content floor** counts characters and should count verified facts. Fix before any bulk prose generation.
- **Would vendors pay for anything?** Five conversations settle it. `IDEAS.md`.
- **Cross-border locales** — let Search Console decide.
- Rejected 2026-10-10: cash/TWINT as a fact, getting-there advice by hand, exact predicted dates, a month strip on town pages, a map, a rain forecast on market day (too hard for now).
- Closed: the old site stays live as an independent competitor — no noindex, no redirect (2026-10-07); growth in Germany continues through the Google drop (2026-10-07); the bare address goes to `/en/` (2026-09-28); dateless markets stay `active` and keep their page (2026-10-10); photos stay, real ones via organisers; analytics first-party; `x-default` English; Metabase on Delfim's PC only; a closed market redirects to its town, or home (`scripts/redirects.mjs`).

---

## Data

**343 markets, all `active`**; 5 closed (four Marchés du Tunnel, Prélaz-Valency). 33 Swiss markets carry *Confirmed by the organiser* from v1; a trigger refuses to move a market off `verified_by = organiser` unless the session sets `fynda.allow_unverify`. 217 organisers with a live market, 158 with an e-mail and a personal link (`scripts/import-organiser-emails.mjs` adds addresses). Thinnest regions: Bremen 1, Saarland 2. Weihnachtsdekomarkt Strengelbach waits for a photo. Known and fine: markets with no stated fee; German dates derived from a stated rhythm, shown as *not yet confirmed*. The 64 markets added 2026-09-20 keep times, fees and parking notes in `market_private.admin_notes` until a facts pass reads them.

**Facts** (`set-market-facts.mjs`, every fact with its source URL and quote, never overwriting): setting known for 168, stalls 18, rain 41, tags 81, who sells 0. Websites give indoor/outdoor for ~8 in 10 markets, stalls and rain for ~1 in 10 — the rest come from organisers. Holstenhallen Neumünster and Bülach stay blank on setting: one value per market cannot say "outdoor in September, indoor in winter". The "checked" stamp means a date check, not a facts check (Delfim, 2026-09-28).

**Follow-ups found in texts, not yet acted on:** Hardmatt Strengelbach runs a flea market every Saturday morning (not listed); Modellbau Kreuzlingen has a fair in Amriswil on 3–4 April 2027; Mercalibro Bellinzona changed hands in 2026 (its link points to the old organiser); Hallenflohmarkt Uster has a new team since March 2026 (organiser record).

**History.** Every change to a market, date, venue, text or tag lands in `history` (append-only), and `market_stats_monthly` holds one row per month per country and region from September 2026.

**Data as a product** (Delfim wants to sell it one day): the market facts with their provenance and history, never visitor rows — counts over 10+ people only. Not before ~10,000 dates. `reference/analytics-research/monetise.md`.

How the import works: `ARCHITECTURE.md` §Import.
