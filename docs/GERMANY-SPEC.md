# Germany — what is left

Germany went live 2026-09-22: 55 markets, 43 towns, 16 Bundesländer, in German and English. How it is built is in `ARCHITECTURE.md` (§Locales, §Import), `PAGES.md` (§Home) and `PLAN.md`. This file now holds only the unfinished part; delete it when the list below is empty.

## Still to do

1. **Infrastructure, before the traffic grows.** Cloudflare Queues in front of the analytics insert, Supabase Pro, images to R2 when `public/images/` stops fitting in git (`reference/analytics-research/build-plan.md` phase 4). 48 MB today.
2. **German organisers.** The welcome letter and the seven-day mail already speak German; the letter's "in der Schweiz" line has to become the country's before a German organiser is written to. 46 German organisers are on file, 42 with a personal link, none mailed.
3. **Search Console and Bing** — add the German paths, then read the Sunday exports. **Two things to watch for four weeks:** whether the German section earns anything at all, and whether Bremen (1 market) and Saarland (2) get excluded as thin. If they do, they stop having their own page.
4. **More German markets.** The intake takes any number: research agents write one JSON per market into `intake/de/` (`intake/README.md` is the shape and the one rule — a directory may only say a market exists, every fact comes from the organiser's own page), then `node scripts/import-intake.mjs intake/de`. They arrive as `unverified` and publish when someone flips them.
5. **Delete `scripts/preview-germany.mjs`** once nothing is waiting behind `unverified` again.

## Settled, so nobody re-opens it

- **No country picker, anywhere.** Six comparable sites were read live on 2026-09-22 — Booking, Airbnb, GetYourGuide, Eventbrite, Meetup, TheFork — and not one has one. Every one asks for a town; the country is a heading.
- **No geo redirect on the root.** Two of those six guessed the wrong city from the same Zurich IP this site serves (Eventbrite: Helsinki, then Azerbaijan; Meetup: Basel), and Google's own guidance is against it. `/` keeps one unconditional redirect.
- **No country page** (Delfim). If one is ever built it is a hub — the city list first, then real writing — never Eventbrite's or Meetup's, whose country pages are a heading and a feed with no city links at all.
- **No map on the front door** (Delfim: "gimmicky").
- **Every Bundesland gets a page**, however few markets it holds — the rule Switzerland already runs on. Watched, per item 3.
- **The place pill is a shortcut, not a picker.** One place-chooser on the site: the SearchControl.
