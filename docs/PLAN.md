# Plan

What is true now and what happens next. **Read first, every session; update before ending one.** Status and decisions only — the story is in git and `archive/PLAN-log-2026-09.md`.

Updated 2026-10-10 (evening).

---

## Now

Live at `fynda.market` since 2026-09-04, two countries since 2026-09-22: **343 markets** — 263 Swiss in four locales, 80 German in de and en — in 174 towns, 23 cantons and 16 Bundesländer; 1,980 pages, 1,948 in the sitemap. 94 markets have no upcoming date (annual ones between editions). Rebuilt nightly by GitHub at 23:07 UTC and again at 03:07 (GitHub starts late); ten guardrails and 75 tests gate every publish.

| Running | State |
|---|---|
| **Pages with no date** (2026-10-10, `design/nodate-v1.html`) | A market between editions says *Back in April* / *Usually in September* from the months it runs (`season_from`/`season_to`, 155 markets), else when it last ran; *Tell me when it's back* (`/b` → `date_alerts`, one mail sent by the nightly publish once a date appears, an unticked box for the weekly mail); *Meanwhile, nearby*. Town pages: undated rows say when they are back, the alert when nothing is dated, *Towns nearby*. `PAGES.md` |
| **Market page extras** (2026-10-10, `design/next-v1.html`) | The decision strip carries what decides a trip: what's sold (81 tags on 76 markets, from each market's own text, quotes in `intake/tags/`), stalls, setting, who sells, a fee, rain. *Earlier this year* — the record of past dates. *Were you there?* — one tap after a date (`/v` → `date_answers`); a yes makes the date *Seen on*, a no pings Telegram; after a yes, one question about a fact the page lacks — size, who sells, indoors or out (`/f` → `fact_answers`): three visitors agreeing publish it, else Approve in Telegram. *12 people are waiting for your next date* on the organiser page, in the welcome letter and (from 3) on the claim card |
| **Newsletter** | Friday digest at 02:07 UTC, 6 subscribers. The card says what it sends — *The weekend around Basel, in your inbox*; one form per page. Resend **free plan**: 100 mails a day |
| **Keeping dates true** | Switzerland copied weekly from v1 (`sync-v1.mjs --apply`, inside the Market Watch run; Delfim, 2026-10-09); differences settled in our favour are in `intake/sync-v1/keep-ours.json` and corrected in v1 too. Open, the pages don't settle them: Puces du CPO 23 Dec 2027, Fribourg Vieille Ville 16:00 or 16:30. Everywhere else the **Market Watch** (`ARCHITECTURE.md` §Watch), weekly on Delfim's PC after a login; approve or dismiss its findings in Telegram. What is left to build: `WATCH-SPEC.md` |
| **Market Finder** | Two four-city runs (Berlin, Hamburg, München, Köln). Live from them: Daglfing, Midnightbazar (München), Nachtflohmarkt Gleishalle (Hamburg), Friedrichshagen, KiezKram (Berlin), Ebertplatz, Martinsmarkt (Köln). Unread leads: a camera fair (Berlin), Krims & Krams at Bahnwärter Thiel (München). 28 German candidates outside the four cities wait for January (`intake/finder/check-de-2026-10-09.json`) |
| **Forms** | `/n` `/b` `/v` `/f` `/r` `/o` `/u` write rows and ping Telegram (an address's domain only); capped per connection per hour. Queues: `open_reports`, `open_organiser_claims` |
| **Organisers** | Built end to end (claim → Telegram Approve → personal link → seven-day mail → stamp / cancellation / alert → edit page). **No welcome letter sent yet** — step 1 below. The seven-day mail is a dry run until `ORGANISER_SENDING=on`. Bergflohmarkt Chur carries `test = true` |
| **Copy** | Voice in `BRAND.md` §Voice; visitors du / vous / tu, organisers Sie / vous / tu. 2026-10-10: the interface, organiser page and mails, and the market descriptions, edited for voice in German, French and Italian (an editor pass, not a human native speaker): calques out, regional words that read oddly across the border out. Descriptions carry nothing for sellers — no pitch prices, booking or registration, in any language |
| **Search Console** | **A site-wide drop on 1 Oct, overnight** (not 24 Sep — 28–30 Sep were normal): impressions ~1,000/day → 12, the few left at positions 4–7. Not a fault of ours (2026-10-10 forensics): Googlebot kept crawling and got 200s, no noindex on sitemap pages, no 5xx, code frozen 28 Sep–7 Oct; no manual action, no security issue. **Google judges the site, not a page**: Indexing → Pages on 4 Oct — 346 indexed, 547 *crawled – not indexed*, 896 *discovered – not indexed*, 1,569 *excluded by noindex* (our per-market form addresses — blocked 2026-10-10). Zürich's Google-selected canonical is our own, so not a copy of the old site — for that page. The sitemap was last read 28 Sep: every page dated *today* every night; dates now from what a page says (2026-10-10) — **resubmit it after the deploy**. Response (Delfim, 2026-10-07): keep working and growing, no cuts in a panic. Exports every Sunday into `docs/GSCdata/` |
| **Analytics** | First-party, read in Metabase on Delfim's PC. Before the drop 25–100 real people a day, 75% on a phone; since 5 Oct 1–2. On undated market pages 88% arrived from Google and 84% left without a tap (2026-10-10). `?intern=1` stops a browser being counted |
| **Speed** | Real visitors on phones, p75: main content in 0.7 s, taps answered in 88 ms, no layout shift — all well inside Google's "good". Audit 2026-10-10 (Lighthouse as a slow phone): pages scored 94–100, Near me 75. Fixed the same day: styles inlined into each page (three small files held the first paint ~0.2 s), the lead photo of home and town pages fetched first, photos kept by browsers past their day while they recheck, Near me no longer jumps when it opens its place sheet (shift 0.77 → 0), the page-view counter no longer makes the visitor wait while it reads the page, the cookie banner's link says what it is. **Weekly check**: `scripts/perf.mjs` — real visitors' numbers and six lab pages, in the Market Watch's Telegram report, a ⚠ when a number crosses Google's line or gets clearly worse; no budgets, nothing blocks a publish (Delfim). Run it by hand after a UI change: `node scripts/perf.mjs http://localhost:4322` against `npm run preview` |
| **Backups** | Nightly 22:37 UTC, encrypted, 90 days in GitHub artifacts; restored once into a throwaway database 2026-10-07, every count matched. Recipe in `.github/workflows/backup.yml` — never onto the live database |
| **Security** | RLS on every table, no policies; public API roles hold nothing. Frame and HTTPS headers on every page. Static files skip the Functions (`public/_routes.json`) |
| **Stickers** | A QR code and *Every flea market near you* (Delfim, 2026-09-30); final design not chosen; drafts in `stickers/` (gitignored). The code opens `fynda.market/s`, which lands on home in the phone's language, tagged `utm_source=sticker` |

Not built: country page (parked) · text search · organiser photo upload · the annual "what are your dates" mail.

---

## Next, in order

**Until the end of 2026: perfect the website, add markets slowly, city by city. From January: expansion** — more of Germany, then other countries, with the finder (Delfim, 2026-10-09).

1. **Organiser mail, fixed 2026-10-10** (organiser review): every organiser mail ends with a stop link (`/a/{token}/stop`, also the one-click header; `organisers.mail_stopped_at`, migration `20261010210000` applied) and the imprint; the sender reads *Delfim · fynda.market*; no company name in the greeting; one date mail covers an organiser's unasked dates from 7 days to 5 weeks out, so a weekly market hears from us about once a month; the letter's verb agrees for several markets and says "found online", not "on your website"; organisers whose markets carry *Confirmed by the organiser* are sent first. German organisers' edit page spells *draußen* and keeps a fee in euros, from the venue's timezone (2026-10-10).
2. **Delfim: organiser welcome letters** — ready. GitHub → Actions → *Organiser welcome* → *Run workflow* → his own address in the **third** box ("Send a preview…"), the rest empty → read it. Then again with *send* ticked: 90 go (Resend free: 100 a day); the next day the rest. "Did it leave?" is a query on `organiser_mail_sends`. Then repository variable `ORGANISER_SENDING=on`.
3. **Done 2026-10-10 (not yet live): town pages the next 7 days day by day** — a market under every day it runs (Berlin's Sunday said 7 markets when 12 ran), and *Tomorrow within 25 km* when the town has nothing tomorrow (product review 2026-10-10).
4. **Done 2026-10-10 for what our descriptions said (stalls 18 → 39, who sells 0 → 26); next, organisers' pages for the rest — facts pass: size and who sells** — first from our own descriptions (Kanzlei "up to 400 sellers", Bürkliplatz "220 stands", strips empty), then organisers' pages, through `set-market-facts.mjs` with quotes. Visitors now answer too (`/f`).
5. **A reason to come back**: *Saved* as a Friday mail of your saved markets this weekend; the signup form converts 2 of 426 views.
6. **Before December: the annual dates mail**, with an *Upload your dates* box on the organiser page (PDF or flyer photo → Claude reads the dates → Delfim approves in Telegram). Paid from the **Claude Startups** membership (accepted 2026-10, under flightbrief.news — check the terms cover fynda; $1,000 API credit, check the expiry; Applied AI office hours — book one for this).
7. **Organiser share kit** (proposed 2026-10-10, not yet decided): a link and QR code for their site, posters and Facebook events — a way in that is not Google.
8. **Germany deep in four cities.** Berlin: 19 more recurring markets researched 2026-09-26, left for spring (`intake/batch-berlin/README.md`). Köln: five Melan car-park markets stay `unverified` until someone has a photo (GLOBUS Marsdorf, METRO Godorf, SELGROS Butzweilerhof, PORTA Lind, ROLLER Marsdorf); for spring Immenhof (23 May 2027), Cölln's P6 (4 Apr 2027), Weidenpesch's spectator-area market (6 May 2027). München (5 markets for 1.5 million): the Theresienwiese BRK market next. `intake/README.md`, `import-intake.mjs`; markets arrive `unverified`.
9. **Analytics partitioning**, October.
10. Buffer.

**Read, on these dates** — nothing to build until then:
- 2026-10-17: Search Console → Indexing → Sitemaps *Last read* after the resubmit; Indexing → Pages — *excluded by noindex* falling, *discovered – not indexed* shrinking.
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

**343 markets, all `active`**; 5 closed (four Marchés du Tunnel, Prélaz-Valency). 33 Swiss markets carry *Confirmed by the organiser* from v1; a trigger refuses to move a market off `verified_by = organiser` unless the session sets `fynda.allow_unverify`. 217 organisers with a live market, 158 with an e-mail and a personal link (`scripts/import-organiser-emails.mjs` adds addresses). Thinnest regions: Bremen 1, Saarland 2. Weihnachtsdekomarkt Strengelbach waits for a photo. Known and fine: markets with no stated fee. A date derived from the rhythm an organiser states is checked as of the day we read their page — 373 German dates stamped so 2026-10-10 (Delfim: "who am I not to trust it?"); A date v1 calls tentative (next year's, not yet on the organiser's page) is not published at all; the market says when it is usually back. No page says *Not confirmed yet*. The 64 markets added 2026-09-20 keep times, fees and parking notes in `market_private.admin_notes` until a facts pass reads them.

**Facts** (`set-market-facts.mjs`, every fact with its source URL and quote, never overwriting): setting known for 168, stalls 39, rain 41, tags 81, who sells 26 (2026-10-10: a pass over what our own descriptions said, each figure read on the organiser's page, `intake/facts/2026-10-10-from-descriptions.json`; six descriptions that disagreed with their organiser corrected, migration `20261010220000`). Websites give indoor/outdoor for ~8 in 10 markets, stalls and rain for ~1 in 10 — the rest come from organisers. Holstenhallen Neumünster and Bülach stay blank on setting: one value per market cannot say "outdoor in September, indoor in winter". The "checked" stamp means a date check, not a facts check (Delfim, 2026-09-28).

**Follow-ups found in texts, not yet acted on:** Hardmatt Strengelbach runs a flea market every Saturday morning (not listed); Modellbau Kreuzlingen has a fair in Amriswil on 3–4 April 2027; Mercalibro Bellinzona changed hands in 2026 (its link points to the old organiser); Hallenflohmarkt Uster has a new team since March 2026 (organiser record).

**History.** Every change to a market, date, venue, text or tag lands in `history` (append-only), and `market_stats_monthly` holds one row per month per country and region from September 2026.

**Data as a product** (Delfim wants to sell it one day): the market facts with their provenance and history, never visitor rows — counts over 10+ people only. Not before ~10,000 dates. `reference/analytics-research/monetise.md`.

How the import works: `ARCHITECTURE.md` §Import.
