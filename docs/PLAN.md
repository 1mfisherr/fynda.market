# Plan

What is true now and what happens next. **Read first, every session; rewrite before ending one.**

This page is state, not a log. A session changes the lines it made untrue. What it did goes in the commit message. A running log, like the photo batches, lives beside its work (`intake/photos/README.md`). `scripts/docs-check.mjs` warns past 15 KB and fails past 20 KB.

Updated 2026-10-27.

**Left off:** nothing half-done. **27 Oct, live:** the 30 German markets with stamps older than 14 days read by hand — every one stamped 27 Oct (Hannover from the city's calendar), Flohdom Hamburg 31 Oct and Mauerpark 25 Oct (storm) cancelled, Gelsenkirchen 21 Nov ends 11:00, 31 listed dates added; hours added for Wismar, Hansamarkt Berlin, Bochum. The Watch now stamps dates an organiser's stated rule produces (`WATCH.md`); the record line counts "since" our first date. Not added, on purpose: rule-only dates (Berlin's 15 and 22 Nov Sundays, holidays). Open: Agra Leipzig's 29–30 Dec (image says "29. – 30. DEZ.", a Tuesday–Wednesday). `www.fynda.market` 301s to the bare address. **Fix in v1:** the 26 Oct list went to the other AI; the next `sync-v1.mjs` dry run shows whether it landed. New for v1 (27 Oct): Sarnen-Center 14 Nov ("2nd Saturday, not March"); Alpin-Flohmi Luzern 12 Nov 17:30–20:00; ACE Café Rothenburg from 08:00; Zürcher Schallplattenbörse 22 Nov missing, its 4 Apr 2027 not on the organiser's page; Mercalibro's 4 Nov and 2 Dec and Rudolf Steiner Schule Basel's 10–11 Apr 2027 not on theirs. 11 Swiss and 9 German markets still have dates without hours: the organisers publish none. **Saturday 31 Oct:** close Enter Retrotechnikmarkt (Delfim, 2026-10-26); its address then 301s to its town.

---

## Now

Live at `fynda.market` since 2026-09-04, Germany since 2026-09-22: **341 markets**, 258 Swiss in de/fr/it/en and 83 German in de/en, in 175 towns, 23 cantons and 16 Bundesländer. About 1,520 pages, 1,488 of them in the sitemap. 128 markets have no upcoming date (rising through winter) (annual ones between editions). Rebuilt nightly by GitHub (23:07 UTC, again at 03:07). Eleven guardrails and 84 tests gate every publish.

| Running | State |
|---|---|
| **Google** | Impressions fell overnight on 1 Oct, from ~1,000 a day to almost none, and have not come back: 0–2 a day from 19 to 24 Oct, no click since 3 Oct (25 Oct export). It matches Google's September 2026 spam update: a judgement of the whole site, not a fault — the 13 Oct audit found it technically clean, and Search Console shows no manual action (Delfim, 26 Oct). Every page type and language is equally out, including the old top earners (Zürich, Basel, Bern, Genève). The likeliest reasons were pages that looked like the old site's (texts rewritten 13 Oct; photos in progress) and one-market town pages (folded 20 Oct). See **Recovery plan** below. Search Console exports go into `docs/GSCdata/` every Sunday |
| **Indexing** (read 27 Oct, data to 23 Oct) | 245 indexed and still falling slowly (253 on 19 Oct, peak 576 on 19 Sep). 1,010 *crawled – not indexed*, 533 *discovered*, 1,569 *noindex*. *Page with redirect* is 3, all intended: the bare address (http and https) and `/it/svizzera/affoltern-am-albis/`, the first folded town Google has recrawled; its "new reason" and "fix failed" mails of 27 Oct need nothing. The top town and canton pages answer 200 with their own canonical, and the folded towns 301 to their markets (checked live 26 Oct). `robots.txt` keeps crawlers off the per-market form addresses (`/*?markt=`) and the calendar files (`/ics/`); none of the 1,500 sitemap pages is blocked (checked 22 Oct). *Validate fix* and *Request indexing* do nothing for a site-wide demotion — don't use them |
| **Town and region pages** | A town or region needs two markets for its own page. A one-market town's address 301s to its market (since 20 Oct, guardrail 11), and so does Bremen's. Towns of four or more markets have a **What row** (`src/lib/town-facts.ts`) and a paragraph written by hand, never generated. `PAGES.md` §City, §Region |
| **Market pages** | The date, the square under the name and *Add it to my Friday e-mail* in the first screen (26 Oct); what decides a trip (what's sold, stalls, setting, who sells, fee, rain), *Earlier this year*, *Were you there?*, *Tell me when it's back* for markets between editions, *Meanwhile, nearby*. `MARKET-PAGE.md` §Market |
| **Newsletter** | Friday 02:07 UTC, 7 subscribers (the 7th, 23 Oct, a real visitor from a Neuchâtel market page). Saved markets by e-mail (`/k`) lead the mail. Resend free plan: 100 mails a day. `PAGES.md` §Utility, `MARKET-PAGE.md` §Market |
| **Keeping dates true** | Switzerland copied weekly from v1 (`sync-v1.mjs`, inside the Market Watch; last by hand 26 Oct, right after v1's own run). Everything else is the **Market Watch**, weekly on Delfim's PC; he approves its findings in Telegram (`WATCH.md`). A cancelled date carries no reason text. Open: Puces du CPO 23 Dec 2027. Weberplatz Potsdam's page (2016, rhythm only, no date list) is off the watch list. The Watch stamps nothing on pages that only state a rule ("jeden Samstag"), so German stamps age until a hand check (last 27 Oct) or the rule-page reader (`WATCH.md` §Left to build) |
| **Organisers** | Built end to end: claim, personal link, date mail, cancellation, alerts, edit page. 20 welcome letters went 2026-10-12; two links opened that day (one VAL Bern), nothing since, no edits, answers or stops (read 23 Oct). No replies in Delfim's inbox (23 Oct). The date mail is a dry run until `ORGANISER_SENDING=on`. Bergflohmarkt Chur is `test = true` |
| **Copy** | Voice: `BRAND.md` §Voice and `.claude/rules/copy.md`. Visitors du/vous/tu, organisers Sie/vous/tu. DE/FR/IT had an editor's pass on 10 Oct, not a native speaker's |
| **Analytics** | First-party, read in Metabase on Delfim's PC. **Germany leads since mid-October, through ChatGPT:** 83 German visitor-days in the 14 days to 27 Oct against 57 Swiss, nearly all on German mobile networks and most tagged `utm_source=chatgpt.com`; ChatGPT-User fetched our pages 488 times. Before the drop 25–100 people a day, 75% on phones, two-thirds from Google; since then 1–27 a day, about 6 in the week of 19 Oct; Google sends almost no one since 5 Oct (read 23 Oct). Market-page landings since 20 Sep: a third go on or tap Directions/website, half read and leave, 4% leave within 5 s (read 26 Oct; the old "82% leave" counted a Directions tap as leaving). The gap is coming back: fewer than 2 in 100 save — hence the Friday e-mail button (26 Oct). `?intern=1` stops a browser being counted |
| **Speed** | Real visitors on phones well inside Google's "good"; lab scores 94–100. `scripts/perf.mjs` runs weekly in the Market Watch report, and by hand after a UI change |
| **Backups** | Nightly 22:37 UTC, encrypted, 90 days in GitHub; restore tested 2026-10-07. Never onto the live database |
| **Stickers** | A QR code to `fynda.market/s` and *Every flea market near you*; design not chosen; drafts in `stickers/` (gitignored) |

---

## Recovery plan (2026-10-20)

Google's own pages say recovery from a spam update comes when its systems "learn over a period of months" that the site complies, usually at a later update. There is no button and no request to file. Documented recoveries came at the next update, five months in one case; a site hit in August 2026 came back during the September update (Glenn Gabe). Our 1 Oct drop matches that update's second wave (30 Sep); experts name templated pages made at scale as its target. Google ran four spam updates in 2026 (March, June, August, September), so each new one is a chance (research read 26 Oct; Reddit blocks our tools). So, in order:

1. One-market towns folded into their markets — done.
2. The market page gets what nobody else has: real photos (`intake/photos/README.md`), the checked-on stamp, facts with their sources.
3. Languages stay as they are: no case found of a site recovering by cutting them.
4. Links from organisers: the welcome letters and the dates box (below). The safest links there are.
5. Bing Webmaster Tools: connected (seen 23 Oct). 38 impressions, 0 clicks since 20 Sep. Its IndexNow "batch mode" warning came from re-check days sending ~950 pages; since 23 Oct the "checked on" stamp no longer counts as a change (`ARCHITECTURE.md`, on `<lastmod>`). Bing, and ChatGPT through Bing, are the doors still open.

Don't: a new domain (the demotion can follow it), mass AI rewrites, faked freshness, more page types, the Indexing API.

---

## Next, in order

**Until the end of 2026: perfect the site, add markets slowly. From January: expansion**, more of Germany and then other countries, with the finder (Delfim, 2026-10-09). **Germany deep before France** (Delfim, 2026-10-27: "yes this order please"): German visitors already come, through ChatGPT; France waits until Germany is deep and a spam update has passed.

1. **Organiser welcome letters.** No more until one organiser answers with a reply or an edit (Delfim, 2026-10-14). Then 90 a day until all 192 have one, the German ones included. To send: GitHub → Actions → *Organiser welcome* → *Run workflow*; a preview goes to the address in the last box. "Did it leave?" is a query on `organiser_mail_sends`. After that, set `ORGANISER_SENDING=on`.
2. **Photos.** Replace the old site's pictures, 20 at a time, Sonnet agents finding and Delfim choosing: `intake/photos/README.md`. 55 left, nearly all searched already, so stock unless an organiser sends one.
3. **Delfim: call or write to ten organisers** the letter reached. The list is in `calls/` on his PC (gitignored: phone numbers). He calls once traffic picks up (his call, 2026-10-14). Claude's view, said once: the calls are part of how traffic comes back.
4. **Organiser share kit**: a link, a poster QR code, a badge for organisers with a personal link, visit counts. **Proposed 2026-10-14, no answer yet:** lead it with a **dates box** an organiser pastes on their own site — their next dates, kept current, linking to us. Ask on the calls before building.
5. **Owed to organisers:** the photo upload they were promised.
6. **Why a market pauses:** live since 2026-10-24 (wording B). Add a break whenever a market's own page names one (`MARKET-PAGE.md` §Market 3); next candidate, Puces du CPO's Christmas break once its dates are out. Mercato Maghetti's winter break has no reason on Lugano's page: no line (27 Oct).
7. **Germany, deep in four cities.** Berlin: 19 markets researched, left for spring (`intake/batch-berlin/README.md`). Köln: ROLLER Marsdorf stays `unverified` until Melan lists a date; GLOBUS Marsdorf and SELGROS Butzweilerhof have no photo; for spring, Immenhof (23 May 2027), Cölln P6 (4 Apr 2027), Weidenpesch (6 May 2027). Finder leads: a camera fair (Berlin), Krims & Krams at Bahnwärter Thiel (München); 28 German candidates outside the four cities wait for January (`intake/finder/check-de-2026-10-09.json`).
8. **Analytics partitioning.** Claude's advice: wait until traffic returns (database 107 MB of 500, half of it the last 30 days of robot rows). Not decided.

**Read on these dates.** Nothing to build until then:
- 2026-12-01: Near me allow rate (`geo_prompt` granted ÷ requested). Below ~30%, the button is in the wrong place. On 23 Oct only 7 people had been asked, 2 allowed: too few to judge.
- 2026-11-01 export, **with the indexing report** (Indexing → Pages → Export): indexed above 253; Google's data then reaches past the 20 Oct fold for the first time; *excluded by noindex* falling from 1,569. The folded towns' addresses (Rafz, Worb, Schaffhausen, Adliswil, Wettingen, Liesberg) show *Page with redirect*, and their market pages are indexed. Titles: Stücki, Flohmi am See, GZ Bachwiesen, Schadaumärit above 3% clicks (were 1.8%).
- 2026-11-07: *Add it to my Friday e-mail* taps (`market_save`, `action: remind`) and the sign-ups after them, against the 3 saves in 270 landings before. *Tell me when it's back* rows against undated market-page views (84% used to leave without a tap). *Were you there?* answers. *Meanwhile, nearby* clicks — if nobody clicks it, it goes. Home `market_click` per view since *This weekend near…* (14 Oct).
- Four weeks after the next letters: organiser answer rate (`organiser_funnel`). Over 25%, build more for organisers; 10–25%, keep it as a data feed; under 10%, stop.

---

## Open decisions and ceilings

Each waits on Delfim or on data. Don't assume an answer.

- **Unclear facts, look again in January** (the welcome letters may answer first): Wollishofen am See, Kofmehl, Cozy Sunday Stellwerk, Folie Voltaire, Mosergarten, Paulusheim, Friedrichshagen, GZ Heuried, Hottingen. Also Glarus (both; the site blocks automated reading), Weinfelden's date (next 27 Mar 2027), Baden's season, Biel's "twelve Saturdays", Bürkliplatz 230 or 220 stands. Roggenweg Zofingen: no trace after September 2023, may have stopped.
- **Delfim's own photos** of markets near him ("would be nice", 2026-10-14). Waiting for his town.
- **A native speaker** over DE/FR/IT.
- **German silent visits count as bots** (`bot_likely` rule 1 predates Germany). Revisit when German traffic exists.
- **Content floor** counts characters; it should count verified facts. Fix before any bulk prose.
- **Would vendors pay for anything?** Five conversations would settle it. `IDEAS.md`.
- **Cross-border locales**: let Search Console decide.
- **Claude Startups** membership (accepted October 2026, under the flightbrief.news address): $1,000 of API credit, no use planned yet.
- **Ceilings.** Cloudflare `_redirects`: 2,000 lines, ~1,150 used; another fold this size needs Bulk Redirects. Resend free: 100 a day, so a paid plan before ~80 subscribers. Cloudflare Pages: 20,000 files, ~2,800 used; images to R2 before ~2,500 more markets. Near me carries every market; split it past ~800. Database 107 MB of 500 (27 Oct); the nightly backup leaves out the robot rows.
- **Rejected, don't propose again:** the annual dates mail; the *Upload your dates* box; size on each row and bigger markets first; neighbourhood names on town rows; nearest stop and walking time; a calendar feed per town; cash/TWINT as a fact; getting-there advice by hand; exact predicted dates; a month strip on town pages; a map; a rain forecast.
- **Closed:** flea markets only, no Christmas or weekly markets (2026-10-14). A charity's second-hand rooms open on set days (one seller, donated goods, like Hardmatt Strengelbach's Saturday mornings) are a second-hand shop, not a flea market: not listed (Claude's call, 2026-10-24). The old site stays live as an independent competitor. Germany keeps growing through the drop. The bare address goes to `/en/`. Dateless markets stay `active` with their page. Analytics first-party; Metabase on Delfim's PC only. A closed market redirects to its town, or home.
- **Not built:** country page (parked; the front door carries the towns), German text search (settle compounds in `STACK.md` first), organiser photo upload (owed, above). *Markets here ran on N days this year* waits until 2027, when a full year of dates exists.

---

## Data

- **Markets.** 341 `active`, 12 closed (Ladies-Flohmarkt Root and Kinderflohmarkt GZ Schindlergut closed 23 Oct, Delfim: no organiser page, no date). Five of the closed ones are *merged*: a closed market with a `hub_market_id` takes its dates from the hub (Plainpalais, Rumine), and its address 301s there. Fribourg's Cathédrale and Place Python stay two markets.
- **Organisers.** 33 Swiss markets carry *Confirmed by the organiser*; a trigger refuses to undo that unless the session sets `fynda.allow_unverify`. 217 organisers with a live market, 158 with an e-mail and a personal link.
- **Dates.** A date derived from an organiser's stated rhythm counts as checked on the day we read their page. A date v1 calls tentative is not published. No page says *Not confirmed yet*.
- **Facts.** Every fact carries its source URL and quote, and is never overwritten (`set-market-facts.mjs`). Setting is known for 278 markets, who sells 101, rain 70, stalls 51, tags 81. Websites give indoor/outdoor for ~8 in 10 markets and the rest rarely; the gaps come from organisers and visitors (`/f`). The "checked" stamp means dates checked, not facts (Delfim, 2026-09-28). Holstenhallen Neumünster and Bülach stay blank on setting: they are outdoor in summer and indoor in winter. The 64 markets added 2026-09-20 keep times, fees and parking in `market_private.admin_notes` until a facts pass reads them.
- **Photos.** 55 of 258 Swiss photos are still the old site's (44 replaced 26 Oct, 40 of them stock) (`intake/photos/README.md`).
- **History.** Every change to a market, date, venue, text or tag lands in `history` (append-only). `market_stats_monthly` holds a row per month per region since September 2026.
- **Found in texts, not yet acted on:**
  - Modellbau Kreuzlingen has an Amriswil fair on 3–4 Apr 2027 (its stall-table shop, read 24 Oct), in neither database. No hall or hours published yet: look again in January, then it goes into v1 like any Swiss market.
  - Amriswil's flyer names a different contact from Romanshorn's.
- **Data as a product** (one day): facts with provenance and history, never visitor rows, and only counts over 10+ people. Not before ~10,000 dates. `reference/analytics-research/monetise.md`.
