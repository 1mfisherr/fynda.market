# fynda.market

European flea-market directory, live since 2026-09-04. Switzerland in de/fr/it/en since then; Germany in de/en since 2026-09-22. Repo `github.com/1mfisherr/fynda.market`.

Rebuild of fleafind.ch, which lost 97% of its traffic to a Google spam update for generating ~8,500 URLs from 157 markets. That history explains every guardrail here.

## Working with Delfim

Solo founder, non-technical, makes every final call. You are the technical judgment he doesn't have — act like it.

- Recommend, don't report. Raise a concern once, with the alternative and its cost; then respect his call.
- Plain English, short. A plain-language version beside any jargon. Legal risk and edge cases: one sentence.
- Evidence before "done": test output, a row read back, a screenshot. **Drive the live site; don't just read the code** — every serious bug so far was found that way.
- Everything you write for him is English; his German is limited. A plan that needs fluent German is not one he can run.
- Never attribute to him a wish he didn't state. "The docs say" is not "you said".
- **Ask Delfim first, every time, before:** sending his e-mail or any personal detail to any outside service (not even as a "contact" in a request); signing up for, or creating an account on, anything; downloading or installing software, packages or files to keep; sharing or publishing anything outside the repo and the site's own deploy. Reading public web pages for research is allowed. An API that wants a contact gets a plain `fynda.market` user agent. Every agent's brief carries this rule (Delfim, 2026-10-11, after his e-mail went to a map service unasked).
- Research and bulk agents run on Sonnet (`model: "sonnet"`), never Opus or higher (Delfim, 2026-10-11: usage limits).

## A session

1. Read `docs/PLAN.md`. Then only the doc the task needs — map in `docs/README.md`. Never `docs/archive/` unless asked.
2. Small and obviously safe → do it. Touches data, URLs or architecture → look, recommend, discuss, build. Big or fuzzy → interview him, write a spec, build from it in a fresh session.
3. A decision made is a line changed in the doc that owns it, the same session. Rewrite superseded text in place — git is the changelog, the docs are not. Before ending, rewrite `PLAN.md` as state: what you did goes in the commit message, a running log (photo batches, a watch run) beside its work. `scripts/docs-size.mjs` warns at 15 KB and fails `verify` and `deploy` at 20 KB; the fix is cutting.
4. **Push and deploy once, at the end of the session — never after each step.** Commit locally as you go; `git push` and `npm run deploy` only when the session ends or Delfim says "push now". Every push runs GitHub Actions (he has hit 90% of his allowance) and every deploy pings IndexNow. A change to the live database is live at once — say so when making one.

## Commands

| | |
|---|---|
| `npm run verify` | Before every push: the read-first docs' size, types (site and `functions/`), the tests, a build, eleven guardrails. Builds from fixtures unless `FYNDA_DATA_SOURCE=supabase`; a guardrail that says `SKIP` is waiting on data, not passing |
| `npm run deploy` | Tests, build against the live database, guardrails, upload to Cloudflare Pages. Refuses a fixtures build and refuses unpushed or uncommitted work — GitHub rebuilds nightly just after midnight Zurich time (23:07 UTC, again at 03:07; GitHub often starts hours late) from `origin/main` and would undo it. `-- --build-only` stops before the upload; `npm run preview` shows the result |
| `node scripts/migrate.mjs supabase/migrations/<file>.sql` | Applies one migration to the live database, in a transaction. **Nothing else applies migrations** — committing one does nothing |
| `node scripts/import-v1-additions.mjs --dry-run` | What v1 has that we don't; without the flag it adds them and never touches what exists. `--hidden` adds them unpublished, so v1's texts can be rewritten in our words first. The full sequence: `docs/ARCHITECTURE.md` §Import |
| `node scripts/sync-v1.mjs` | v1's Swiss dates against ours: adds, cancellations, hours, status. `--apply` writes, stamped with v1's check date — the weekly watch run does this itself. Holds back anything that would undo our own edits (`--accept-flagged` after reading the organiser's page); `intake/sync-v1/keep-ours.json` is what we settled in our favour — fix those in v1 too |
| `node scripts/import-photos.mjs "<folder>" --dry` | A folder of photos named after the markets: matches by name, writes hero, 720 and thumb into `public/images/`, sets `image_url` and a fact. Refuses to write until every file matches |
| `node scripts/import-intake.mjs intake/<country> --dry-run` | Researched markets (`intake/README.md`) into the database as `unverified` — not built until flipped to `active`. Without the flag it writes; never touches what exists |
| `node scripts/confirm.mjs <slug> --source <url> <date…> --apply` | After checking a market's dates against its organiser's site. Moves the "confirmed on" stamp to today and writes the source to the ledger. Name the dates you saw — without them it stamps every future date. The stamp means *dates checked*; a facts check does not move it (Delfim, 2026-09-28) |
| `node scripts/watch/run.mjs --dry` | The Market Watch as a dry run: what it would stamp and ask, without writing or asking AI. Without flags it is the weekly run Windows starts at login (`--if-due`, `scripts/watch/schedule.ps1`); last output in `watch-data/last-run.log`. New markets' pages: `node scripts/watch/sources.mjs --apply` |
| `node scripts/finder/leads-mft.mjs`, then `check.mjs intake/finder/leads-mft-<date>.json` | Markets we lack, kept if the organiser's page shows a date → `intake/finder/check-<country>-<date>.json`, turned into intake files by hand |
| `node scripts/set-market-facts.mjs intake/facts/<batch>.json` | Researched indoor/outdoor, stall count, rain into `markets` and the facts ledger, each with its URL. Dry run without `--apply`; never overwrites a value already set. Check every agent fact by hand first — a range, an old figure, another edition's venue are the usual misses |
| `node scripts/send-digest.mjs`, `node scripts/send-organiser-mail.mjs`, `node scripts/send-date-alerts.mjs` | Dry runs. The date alerts ("tell me when it's back") go by themselves after each nightly publish. `--send` sends; the digest and organiser mail take `--only=<address>` for one person. The Resend key lives only on Cloudflare and GitHub, so real sends run from GitHub Actions |
| `node scripts/perf.mjs` | Speed: real visitors' last seven days, then Lighthouse on six pages as a slow phone. Report only. By hand after a UI change, with the preview's address |
| `docker compose -f metabase/docker-compose.yml up -d` | Metabase at `localhost:3000`. Docker often fails to start here; say "untested" rather than "tested" |

`gh` is not installed. Credentials live in `.env.local`; scripts reach the database through `scripts/db.mjs` (`query(sql, params)`). Wrangler is logged in, so Pages secrets can be set from here.

## Settled — don't re-open

| | |
|---|---|
| Name | `fynda.market`, always the full name, like booking.com |
| Markets | Switzerland and Germany; more countries from 2027. Multi-country data model since commit one |
| Languages | CH: de, fr, it, en. Any other country: its own + English. A locale exists only where its content exists |
| Not German-first | Nothing shared across locales is German — addresses, slugs, internal names, defaults. Where one language must stand for all, it is English |
| Money | Users pay nothing, ever. Revenue is organisers and local advertising, deferred. No AdSense |
| What it is | A visitor tool; SEO is the acquisition base. Engaged organisers are what keep it true (`docs/PRODUCT.md`) |
| No login | An organiser's identity is a personal link in an e-mail. Accounts may come; the copy says "no account needed", never "no account" |
| Stack | Astro static + Cloudflare Pages + Supabase/PostGIS. Cloudflare, not Vercel. `docs/STACK.md` |
| URLs | `/{locale}/{country}/{city}/`. Words translated, names not. Built only by `src/lib/i18n.ts`. A published address never dies — 301s, guardrail 9 |
| Imports | From the live v1 Supabase project only. Local backups are stale — read for shape, never import. Swiss dates are copied from v1 weekly; every other country is kept by our own Market Watch (Delfim, 2026-10-09) |
| Analytics | Our own events in our Postgres, read with self-hosted Metabase, plus Search Console. A first-party cookie behind a banner; third-party tools may be added behind the same consent. The privacy page describes what the code does, calmly — never a promise the next tool would break |
| Brand | White, near-black, one accent for dates and status only. Schibsted Grotesk, self-hosted. `docs/BRAND.md` |
| Tags | Filters, not URLs; six. Shown on the market page as *what's sold* — from the organiser, or read off their own page with the quote kept (`intake/tags/`, `set-market-facts.mjs`). A tag marks what is special about a market, never what every flea market has |
| Newsletter | Friday 02:07 UTC, list in our Postgres; a subscription is a town (distance chosen each week, `docs/PAGES.md`), a canton, or everything — plus the markets someone saved, which lead their mail (`/k`) |
| Photos | Every market has one. Stock never ships |

A rule that blocks something good is a bug in the doc: say what it protected against, why that is outweighed, and change doc and config in the same commit. Never route around one silently. The one forbidden move is loosening a guardrail threshold to turn a red build green.

## The rule that must not be broken

> **A page exists because there is content for it — never because a URL pattern permits it.**

v1 minted a URL per date per locale: one weekly market made 208 pages, 91% of the site earned nothing, Google called it spam. Every page generator has a hard cap (dates: 120 days) and a content floor; `scripts/guardrails.mjs` fails the build on both. Be bold about page *types* — date pages converted best on v1 — never about unbounded generation.

## Gotchas that have each cost hours

- **Every table has RLS on and no policies.** The build connects as the owner; a Function as the service role, which still needs a `GRANT` per table and column. A missing grant is an empty result, not an error.
- **Verify cannot tell you a migration ran.** CI has no database. After applying one, hit the live endpoint and read the row back.
- **Never `git add -A`.** It has twice swept scratch files (an agent's scraped HTML, an audit dump) into a commit. Name the paths, or `git add -u` plus the new files you meant.
- **`data/*.json` is build output and it is committed.** A fixtures `verify` overwrites it with six markets; `git checkout -- data/` before committing.
- **Anything in `waitUntil()` fails silently.** Read the Cloudflare log before believing a table is empty or a mail never went.
- **A changed Cloudflare secret needs a redeploy** to be seen. `ADMIN_SIGNING_SECRET` must be identical on Cloudflare, on GitHub and in `.env.local`, or every organiser link dies.
- **GitHub's clock is UTC; the site's is Europe/Zurich.** Anything that says "today" — tests, scripts — must read `todayIso()`, or it fails on a Saturday night when Zurich is already Sunday.
- **Use Supabase's session pooler**, `aws-1-eu-west-1.pooler.supabase.com`. The direct host is IPv6-only.
- `.claude/rules/` holds the rules for `functions/`, `supabase/`, the templates and styles, and anything a visitor or organiser reads (`copy.md`). Each loads when you read or edit a matching file and drops out at compaction until the next one. **Writing copy anywhere else — intake JSON, a mail draft, a chat answer with copy in it — read `.claude/rules/copy.md` first.**

When compacting, keep the files changed, the commands run with their results, and every decision Delfim made.
