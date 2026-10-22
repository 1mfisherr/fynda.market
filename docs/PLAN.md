# Plan

What is true now and what happens next. **Read first, every session; rewrite before ending one.**

This page is state, not a log. A session changes the lines it made untrue. What it did goes in the commit message. A running log, like the photo batches, lives beside its work (`intake/photos/README.md`). `npm run verify` warns past 15 KB and fails past 20 KB. The October detail this page used to carry is in `archive/PLAN-log-2026-10.md`.

Updated 2026-10-22.

---

## Now

Live at `fynda.market` since 2026-09-04, Germany since 2026-09-22: **343 markets**, 260 Swiss in de/fr/it/en and 83 German in de/en, in 175 towns, 23 cantons and 16 Bundesländer. 1,532 pages, 1,500 of them in the sitemap. 94 markets have no upcoming date (annual ones between editions). Rebuilt nightly by GitHub (23:07 UTC, again at 03:07). Eleven guardrails and 84 tests gate every publish.

| Running | State |
|---|---|
| **Google** | Impressions fell overnight on 1 Oct, from ~1,000 a day to almost none, and have not come back. It matches Google's September 2026 spam update: a judgement of the whole site, not a fault — the 13 Oct audit found it technically clean. Every page type and language is equally out, including the old top earners (Zürich, Basel, Bern, Genève). The likeliest reasons were pages that looked like the old site's (texts rewritten 13 Oct; photos in progress) and one-market town pages (folded 20 Oct). See **Recovery plan** below. Search Console exports go into `docs/GSCdata/` every Sunday |
| **Indexing** (read 18 Oct, data to 11 Oct) | 263 indexed and still falling (peak 576 on 19 Sep). 976 *crawled – not indexed*, 550 *discovered*. `robots.txt` keeps crawlers off the per-market form addresses (`/*?markt=`) and the calendar files (`/ics/`); none of the 1,500 sitemap pages is blocked (checked 22 Oct). *Validate fix* and *Request indexing* do nothing for a site-wide demotion — don't use them |
| **Town and region pages** | A town or region needs two markets for its own page. A one-market town's address 301s to its market (since 20 Oct, guardrail 11), and so does Bremen's. Towns of four or more markets have a **What row** (`src/lib/town-facts.ts`) and a paragraph written by hand, never generated. `PAGES.md` §City, §Region |
| **Market pages** | What decides a trip (what's sold, stalls, setting, who sells, fee, rain), *Earlier this year*, *Were you there?*, *Tell me when it's back* for markets between editions, *Meanwhile, nearby*. `PAGES.md` §Market |
| **Newsletter** | Friday 02:07 UTC, 6 subscribers. Saved markets by e-mail (`/k`) lead the mail. Resend free plan: 100 mails a day. `PAGES.md` §Newsletter |
| **Keeping dates true** | Switzerland copied weekly from v1 (`sync-v1.mjs`, inside the Market Watch). Everything else is the **Market Watch**, weekly on Delfim's PC; he approves its findings in Telegram (`ARCHITECTURE.md` §Watch, what's left to build in `WATCH-SPEC.md`). A cancelled date carries no reason text. Open: Puces du CPO 23 Dec 2027; Fribourg Vieille Ville 16:00 or 16:30; Weberplatz Potsdam's source is a 2016 page — dismiss its *source broken* |
| **Organisers** | Built end to end: claim, personal link, date mail, cancellation, alerts, edit page. 20 welcome letters went 2026-10-12; one link opened (VAL Bern), no edits, no stops. The date mail is a dry run until `ORGANISER_SENDING=on`. Bergflohmarkt Chur is `test = true` |
| **Copy** | Voice: `BRAND.md` §Voice and `.claude/rules/copy.md`. Visitors du/vous/tu, organisers Sie/vous/tu. DE/FR/IT had an editor's pass on 10 Oct, not a native speaker's |
| **Analytics** | First-party, read in Metabase on Delfim's PC. Before the drop 25–100 people a day, 75% on phones, two-thirds from Google; since then single digits to ~25. A market-page landing leaves 82% of the time after ~18 s. `?intern=1` stops a browser being counted |
| **Speed** | Real visitors on phones well inside Google's "good"; lab scores 94–100. `scripts/perf.mjs` runs weekly in the Market Watch report, and by hand after a UI change |
| **Backups** | Nightly 22:37 UTC, encrypted, 90 days in GitHub; restore tested 2026-10-07. Never onto the live database |
| **Stickers** | A QR code to `fynda.market/s` and *Every flea market near you*; design not chosen; drafts in `stickers/` (gitignored) |

---

## Recovery plan (2026-10-20)

Google's own pages say recovery from a spam update comes when its systems "learn over a period of months" that the site complies, usually at a later update. There is no button and no request to file. Documented recoveries came at the next update, five months in one case. So, in order:

1. One-market towns folded into their markets — done.
2. The market page gets what nobody else has: real photos (`intake/photos/README.md`), the checked-on stamp, facts with their sources.
3. Languages stay as they are: no case found of a site recovering by cutting them.
4. Links from organisers: the welcome letters and the dates box (below). The safest links there are.
5. Bing Webmaster Tools, which needs Delfim's sign-in. Bing, and ChatGPT through Bing, are the doors still open.

Don't: a new domain (the demotion can follow it), mass AI rewrites, faked freshness, more page types, the Indexing API.

---

## Next, in order

**Until the end of 2026: perfect the site, add markets slowly. From January: expansion**, more of Germany and then other countries, with the finder (Delfim, 2026-10-09).

1. **Organiser welcome letters.** No more until one organiser answers with a reply or an edit (Delfim, 2026-10-14). Then 90 a day until all 192 have one, the German ones included. To send: GitHub → Actions → *Organiser welcome* → *Run workflow*; a preview goes to the address in the last box. "Did it leave?" is a query on `organiser_mail_sends`. After that, set `ORGANISER_SENDING=on`.
2. **Photos.** Replace the old site's pictures, 20 at a time, Sonnet agents finding and Delfim choosing: `intake/photos/README.md`. 137 left.
3. **Delfim: call or write to ten organisers** the letter reached. The list is in `calls/` on his PC (gitignored: phone numbers). He calls once traffic picks up (his call, 2026-10-14). Claude's view, said once: the calls are part of how traffic comes back.
4. **Organiser share kit**: a link, a poster QR code, a badge for organisers with a personal link, visit counts. **Proposed 2026-10-14, no answer yet:** lead it with a **dates box** an organiser pastes on their own site — their next dates, kept current, linking to us. Ask on the calls before building.
5. **Owed to organisers:** the photo upload they were promised.
6. **Small, decided:** say why a market pauses (*Paused for the Herbstmesse until 21 Nov*) where we hold the reason.
7. **Germany, deep in four cities.** Berlin: 19 markets researched, left for spring (`intake/batch-berlin/README.md`). Köln: ROLLER Marsdorf stays `unverified` until Melan lists a date; GLOBUS Marsdorf and SELGROS Butzweilerhof have no photo; for spring, Immenhof (23 May 2027), Cölln P6 (4 Apr 2027), Weidenpesch (6 May 2027). Finder leads: a camera fair (Berlin), Krims & Krams at Bahnwärter Thiel (München); 28 German candidates outside the four cities wait for January (`intake/finder/check-de-2026-10-09.json`).
8. **Analytics partitioning.** Claude's advice: wait until traffic returns (database 50 MB of 500). Not decided.

**Read on these dates.** Nothing to build until then:
- Overdue (was 19 Oct): the 20 welcome letters — link opens, edits, stops. Delfim: replies, Resend bounces.
- Overdue (was 21 Oct): Near me allow rate (`geo_prompt` granted ÷ requested). Below ~30%, the button is in the wrong place.
- 2026-10-24, Market Watch: does the Telegram report read cleanly?
- 2026-10-25 and 2026-11-01 exports: indexed above 263; *excluded by noindex* falling from 1,569. The folded towns' addresses (Rafz, Worb, Schaffhausen, Adliswil, Wettingen, Liesberg) show *Page with redirect*, and their market pages are indexed. Titles: Stücki, Flohmi am See, GZ Bachwiesen, Schadaumärit above 3% clicks (were 1.8%).
- 2026-11-07: *Tell me when it's back* rows against undated market-page views (84% used to leave without a tap). *Were you there?* answers. *Meanwhile, nearby* clicks — if nobody clicks it, it goes. Home `market_click` per view since *This weekend near…* (14 Oct).
- Four weeks after the next letters: organiser answer rate (`organiser_funnel`). Over 25%, build more for organisers; 10–25%, keep it as a data feed; under 10%, stop.

---

## Open decisions and ceilings

Each waits on Delfim or on data. Don't assume an answer.

- **Unclear facts, look again in January** (the welcome letters may answer first): Wollishofen am See, Kofmehl, Cozy Sunday Stellwerk, Folie Voltaire, Mosergarten, Paulusheim, Friedrichshagen, GZ Heuried, Hottingen, Schindlergut. Also Glarus (both; the site blocks automated reading), Weinfelden's date (next 27 Mar 2027), Baden's season, Biel's "twelve Saturdays", Bürkliplatz 230 or 220 stands. **Delfim to decide:** Ladies-Flohmarkt Root and Kinderflohmarkt GZ Schindlergut have no organiser page.
- **Delfim's own photos** of markets near him ("would be nice", 2026-10-14). Waiting for his town.
- **A native speaker** over DE/FR/IT.
- **German silent visits count as bots** (`bot_likely` rule 1 predates Germany). Revisit when German traffic exists.
- **Content floor** counts characters; it should count verified facts. Fix before any bulk prose.
- **Would vendors pay for anything?** Five conversations would settle it. `IDEAS.md`.
- **Cross-border locales**: let Search Console decide.
- **Claude Startups** membership (accepted October 2026, under the flightbrief.news address): $1,000 of API credit, no use planned yet.
- **Ceilings.** Cloudflare `_redirects`: 2,000 lines, 1,054 used; another fold this size needs Bulk Redirects. Resend free: 100 a day, so a paid plan before ~80 subscribers. Cloudflare Pages: 20,000 files, ~2,800 used; images to R2 before ~2,500 more markets. Near me carries every market; split it past ~800. Database ~50 MB of 500.
- **Rejected, don't propose again:** the annual dates mail; the *Upload your dates* box; size on each row and bigger markets first; neighbourhood names on town rows; nearest stop and walking time; a calendar feed per town; cash/TWINT as a fact; getting-there advice by hand; exact predicted dates; a month strip on town pages; a map; a rain forecast.
- **Closed:** flea markets only, no Christmas or weekly markets (2026-10-14). The old site stays live as an independent competitor. Germany keeps growing through the drop. The bare address goes to `/en/`. Dateless markets stay `active` with their page. Analytics first-party; Metabase on Delfim's PC only. A closed market redirects to its town, or home.
- **Not built:** country page (parked; the front door carries the towns), German text search (settle compounds in `STACK.md` first), organiser photo upload (owed, above). *Markets here ran on N days this year* waits until 2027, when a full year of dates exists.

---

## Data

- **Markets.** 343 `active`, 10 closed. Five of the closed ones are *merged*: a closed market with a `hub_market_id` takes its dates from the hub (Plainpalais, Rumine), and its address 301s there. Fribourg's Cathédrale and Place Python stay two markets.
- **Organisers.** 33 Swiss markets carry *Confirmed by the organiser*; a trigger refuses to undo that unless the session sets `fynda.allow_unverify`. 217 organisers with a live market, 158 with an e-mail and a personal link.
- **Dates.** A date derived from an organiser's stated rhythm counts as checked on the day we read their page. A date v1 calls tentative is not published. No page says *Not confirmed yet*.
- **Facts.** Every fact carries its source URL and quote, and is never overwritten (`set-market-facts.mjs`). Setting is known for 278 markets, who sells 101, rain 70, stalls 51, tags 81. Websites give indoor/outdoor for ~8 in 10 markets and the rest rarely; the gaps come from organisers and visitors (`/f`). The "checked" stamp means dates checked, not facts (Delfim, 2026-09-28). Holstenhallen Neumünster and Bülach stay blank on setting: they are outdoor in summer and indoor in winter. The 64 markets added 2026-09-20 keep times, fees and parking in `market_private.admin_notes` until a facts pass reads them.
- **Photos.** 137 of 260 Swiss photos are still the old site's (`intake/photos/README.md`).
- **History.** Every change to a market, date, venue, text or tag lands in `history` (append-only). `market_stats_monthly` holds a row per month per region since September 2026.
- **Found in texts, not yet acted on:**
  - Hardmatt Strengelbach runs a Saturday-morning flea market (not listed).
  - Modellbau Kreuzlingen has an Amriswil fair on 3–4 Apr 2027.
  - Mercalibro Bellinzona changed hands; its link points to the old organiser.
  - Hallenflohmarkt Uster has a new team since March 2026.
  - Romanshorn: fliba says "am Hafen, beim Seepark (Hafenstr. 68)", we say "beim alten Fähreplatz".
  - Amriswil's flyer names a different contact from Romanshorn's.
- **Data as a product** (one day): facts with provenance and history, never visitor rows, and only counts over 10+ people. Not before ~10,000 dates. `reference/analytics-research/monetise.md`.
