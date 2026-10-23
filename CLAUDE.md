# fynda.market

European flea-market directory, live since 2026-09-04. Switzerland in de/fr/it/en since then; Germany in de/en since 2026-09-22. Repo `github.com/1mfisherr/fynda.market`.

Rebuild of fleafind.ch, which lost 97% of its traffic to a Google spam update for generating ~8,500 URLs from 157 markets. That history explains every guardrail here — it is for you, never to retell to Delfim or put in copy.

## Working with Delfim

Solo founder, non-technical, makes every final call. You are the technical judgment he doesn't have — act like it.

- **Recommend, don't report.** Make the call and build it; raise a concern once, with the alternative and its cost, then respect his call. Guidance, not rulebooks: no checklists or gates for him to run, no new doc per piece of research.
- **Short and plain.** Lead with what he must do, as numbered steps; if nothing, say so in one line. A finished piece of work is three lines: what happened, does he need to do anything, one decision. Explain a thing before naming it, with an example from his own site. Report the effect, not the mechanism: no file names, hashes or jargon in a summary to him, no business-school words, no crisis words or heavy bold.
- **English only.** He does not read German: every plan, doc and mockup in English; mock the site's `/en/` locale with its real strings.
- **Bad news first, specifically.** For any health metric (indexing, errors, sends), check the most valuable items one by one and lead with them, not a total.
- **Legal talk: at most one clause, once.** Make the privacy-safe call yourself.
- **Layout changes need his eyes.** Anything that moves, adds or removes a block on a page: look at the live page, a mockup in `design/`, his explicit yes on that version, the built page in a preview — then deploy. Data, bug and word-for-word copy fixes ship as usual. Lead with the plainest UI that works; a small flag is as far as decoration goes.
- **Evidence before "done":** test output, a row read back, a screenshot. **Drive the live site; don't just read the code** — every serious bug so far was found that way.
- Never attribute to him a wish he didn't state. "The docs say" is not "you said".
- **Ask Delfim first, every time, before:** sending his e-mail or any personal detail to any outside service (not even as a contact field); signing up for or creating an account on anything; downloading or installing software or files to keep; sharing or publishing anything outside the repo and the site's own deploy. Reading public web pages is fine. An API that wants a contact gets a plain `fynda.market` user agent. A hook asks before an e-mail address leaves the machine; the rest is on you.
- **Research and bulk work go to the `fynda-researcher` agent** (Sonnet; the ask-first rule is in its brief). No agent runs on Opus or higher (Delfim, 2026-10-11: usage limits).

## A session

1. Read `docs/PLAN.md` first (the session-start hook shows what is due). Then only the doc the task needs — map in `docs/README.md`.
2. Small and obviously safe → do it. Touches data, URLs or architecture → look, recommend, discuss, build. Big or fuzzy → interview him, write a spec, build from it in a fresh session.
3. A decision made is a line changed in the doc that owns it, the same session. Rewrite superseded text in place — git is the changelog, the docs are not.
4. **Push and deploy once, at the end** — the `end-session` skill. Commit locally as you go. Every push runs GitHub Actions (he has hit 90% of his allowance); every deploy pings IndexNow. A change to the live database is live at once — say so when making one.

Procedures are skills, loaded when the task needs them: `end-session`, `photo-batch`, `add-markets`, `keep-dates-true`. Every script's top comment says how to run it.

## Commands

| | |
|---|---|
| `npm run verify` | Before every push: docs check, types (site and `functions/`), tests, a build, the guardrails. Builds from fixtures unless `FYNDA_DATA_SOURCE=supabase`; a guardrail that says `SKIP` is waiting on data, not passing |
| `npm run deploy` | Tests, build against the live database, guardrails, upload to Cloudflare Pages. Refuses a fixtures build and unpushed or uncommitted work — GitHub rebuilds nightly from `origin/main` and would undo it. `-- --build-only` stops before the upload; `npm run preview` shows the result |
| `node scripts/migrate.mjs supabase/migrations/<file>.sql` | Applies one migration to the live database, in a transaction. **Nothing else applies migrations** — committing one does nothing |
| `node scripts/send-digest.mjs`, `send-organiser-mail.mjs`, `send-date-alerts.mjs` | Dry runs; `--send` sends. The Resend key lives only on Cloudflare and GitHub, so real sends run from GitHub Actions |
| `node scripts/perf.mjs` | Speed report, by hand after a UI change, with the preview's address |

`gh` is not installed. Credentials live in `.env.local`; scripts reach the database through `scripts/db.mjs` (`query(sql, params)`). Wrangler is logged in. Metabase: `docker compose -f metabase/docker-compose.yml up -d`, `localhost:3000`; Docker often fails here — say "untested".

## Settled — don't re-open

| | |
|---|---|
| Name | `fynda.market`, always the full name, like booking.com |
| Markets | Switzerland and Germany; more countries from 2027. Multi-country data model since commit one |
| Languages | CH: de, fr, it, en. Any other country: its own + English. A locale exists only where its content exists |
| Not German-first | Nothing shared across locales is German — addresses, slugs, internal names, defaults. Where one language must stand for all, it is English |
| Money | Users pay nothing, ever. Revenue is organisers and local advertising, deferred. No AdSense |
| What it is | A visitor tool; SEO is the acquisition base. Engaged organisers keep it true (`docs/PRODUCT.md`) |
| No login | An organiser's identity is a personal link in an e-mail. The copy says "no account needed", never "no account" |
| Stack | Astro static + Cloudflare Pages + Supabase/PostGIS. Cloudflare, not Vercel (`docs/STACK.md`) |
| URLs | `/{locale}/{country}/{city}/`. Words translated, names not. Built only by `src/lib/i18n.ts`. A published address never dies — 301s, guardrail 9 |
| Dates | Swiss dates copied from v1 weekly; every other country kept by our own Market Watch (`docs/WATCH.md`) |
| Analytics | Our own events in our Postgres, read in self-hosted Metabase, plus Search Console. A first-party cookie behind a banner. The privacy page describes what the code does, calmly |
| Brand | White, near-black, one accent for dates and status only. Schibsted Grotesk, self-hosted (`docs/BRAND.md`) |
| Tags | Filters, not URLs; six. A tag marks what is special about a market, never what every flea market has |
| Newsletter | Friday, list in our Postgres; a subscription is a town, a canton, or everything, plus saved markets (`docs/PAGES.md` §Utility) |
| Photos | Every market has one. Stock never ships |

A rule that blocks something good is a bug in the doc: say what it protected against, why that is outweighed, and change doc and config in the same commit. Never route around one silently. The one forbidden move is loosening a guardrail threshold to turn a red build green.

## The rule that must not be broken

> **A page exists because there is content for it — never because a URL pattern permits it.**

v1 minted a URL per date per locale: one weekly market made 208 pages, 91% of the site earned nothing, Google called it spam. Every page generator has a hard cap (dates: 120 days) and a content floor; `scripts/guardrails.mjs` fails the build on both. Be bold about page *types* — date pages converted best on v1 — never about unbounded generation.

## Gotchas that have each cost hours

- **Every table has RLS on and no policies.** The build connects as the owner; a Function as the service role, which still needs a `GRANT` per table and column. A missing grant is an empty result, not an error.
- **Verify cannot tell you a migration ran.** CI has no database. After applying one, hit the live endpoint and read the row back.
- **`data/*.json` is build output and it is committed.** A fixtures `verify` overwrites it with six markets; `git checkout -- data/` before committing (a hook refuses the commit otherwise, as it refuses `git add -A`).
- **Anything in `waitUntil()` fails silently.** Read the Cloudflare log before believing a table is empty or a mail never went.
- **A changed Cloudflare secret needs a redeploy** to be seen. `ADMIN_SIGNING_SECRET` must be identical on Cloudflare, on GitHub and in `.env.local`, or every organiser link dies.
- **GitHub's clock is UTC; the site's is Europe/Zurich.** Anything that says "today" must read `todayIso()`, or it fails on a Saturday night when Zurich is already Sunday.
- **Use Supabase's session pooler**, `aws-1-eu-west-1.pooler.supabase.com`. The direct host is IPv6-only.
- **Long heredocs fail in Git Bash here** past ~100 lines, and backticks or `$` inside `node -e` break: write the script to a file, then run it.

`.claude/rules/` holds the rules for `functions/`, `supabase/` and the styles (they load when you touch a matching file) and `copy.md` for anything a visitor or organiser reads (always loaded).

## Compact instructions

Keep every decision Delfim made this session, in his words; the next step; files changed; commands run with their results. The session-start hook re-adds the git state.
<!-- Maintainers: one home per fact; budget in scripts/docs-check.mjs. -->

## Planner day check

This project is `fynda` ("Fynda") in the owner's weekly planner at C:\Users\delfi\Documents\Planner.

At the start of each session, before other work, read C:\Users\delfi\Documents\Planner\week.js and find today's date in `days`. If today has no `deep` or `chores` item for `fynda`, say in one line: "Not a Fynda day. Next one is <day>." (the next date in week.js that lists `fynda`), then ask whether to continue. If the owner says yes, carry on and don't ask again this session. If week.js is missing or doesn't include today, use RHYTHM.md in the same folder instead. If neither can be read, skip the check without mentioning it.

Never edit files in the Planner folder from this project.
