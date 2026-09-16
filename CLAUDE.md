# Fynda

European flea-market directory. Live at `fynda.market` since 2026-09-04 — Switzerland in de/fr/it/en, Germany next. Repo `github.com/1mfisherr/fynda.market`.

Rebuild of fleafind.ch, which ranked #1 in Switzerland and lost ~97% of its traffic to a Google spam update on 2026-08-22 for generating ~8,500 URLs from 157 markets.

## Working with Delfim

Solo founder, non-technical, makes every final call. **You are the technical judgment he doesn't have — act like it.**

- Recommend, don't report. If a better tool or pattern exists and he hasn't asked, say so.
- Raise product, UX and technical concerns once, clearly, with the alternative and its cost. Then respect his call and drop it.
- Short, plain English. Put a plain-language version beside any jargon. Go long only when the topic needs it, and say why.
- Legal risk, edge cases, worst cases: one sentence, then move on. Over-cautioning stalls the project.
- Show evidence before claiming done: test output, a row read back, a screenshot. **Drive the live site; don't just read the code** — every serious bug so far was found that way.
- His German is limited. Everything you write for him is English. A plan that needs fluent German (calling organisers) is not one he can run.

## A session

1. Read `docs/PLAN.md`. Then only the doc the task needs — map in `docs/README.md`. Never `docs/archive/` unless asked.
2. Small and obviously safe → do it. Touches data, URLs or architecture → look, recommend, discuss, then build. Big or fuzzy → interview him, write a spec, build from it in a fresh session.
3. A decision made is a line changed in the doc it belongs in, the same session. Before ending, update `PLAN.md`. Rewrite superseded text in place — git is the changelog, the docs are not.

## Commands

| | |
|---|---|
| `npm run verify` | Before every push. Types (site and `functions/`), 26 tests, build, ten guardrails. Builds from fixtures unless `FYNDA_DATA_SOURCE=supabase`; a guardrail saying `SKIP` is waiting on data, not passing |
| `npm run deploy` | Runs the tests, builds against the live database, runs the guardrails, uploads to Cloudflare Pages. Refuses a fixtures build. GitHub runs the same script every night at 03:00 UTC. **`-- --build-only`** does everything but the upload; `npm run preview` then shows the real thing |
| `node scripts/migrate.mjs supabase/migrations/<file>.sql` | Applies one migration to the live database, in a transaction. **Nothing else applies migrations** — committing one does nothing |
| `npm test` | The 26 digest tests |
| `node scripts/send-digest.mjs` | Dry run of the Friday mail. `--send` sends, `--only=<address>` to one person |
| `docker compose -f metabase/docker-compose.yml up -d` | Metabase at `localhost:3000`. Docker often fails to start on this machine; say so rather than call untested SQL tested |

`gh` is not installed. Credentials live in `.env.local`; scripts reach the database through `scripts/db.mjs` (`query(sql, params)`).

## Settled — don't re-open

| | |
|---|---|
| Name, domain | Fynda, `fynda.market` |
| Markets | Switzerland now, Germany next. Multi-country data model since commit one |
| Languages | CH: de, fr, it, en. Any other country: its own + English. A locale exists only where its content exists |
| Not German-first | Nothing shared across locales is German — addresses, slugs, internal names, defaults. Where one language must stand for all, it is **English** |
| Money | Users pay nothing, ever. Revenue is organisers and local advertising, deferred. No AdSense |
| What it is | A visitor tool; SEO is the acquisition base. The organiser surface is a claim form and a contact address |
| Stack | Astro static + Cloudflare Pages + Supabase/PostGIS. **Cloudflare, not Vercel.** `docs/STACK.md` |
| URLs | `/{locale}/{country}/{city}/`. Words translated, names not. Built only by `src/lib/i18n.ts`. A published address never dies — 301s, guardrail 9 |
| Imports | From the live v1 Supabase project only. Local backups and `supabase start` are stale — read for shape, never import |
| Analytics | Our own events in our Postgres, read with self-hosted Metabase, plus Search Console by hand. **A first-party cookie behind a banner** (Delfim, 2026-09-16): with consent, a returning browser is recognised; third-party tools (GA4, Clarity) may be added behind the same consent. The privacy page describes what the code does, in calm words — never a promise the next tool would break |
| Brand | White, near-black, one accent for dates and status only. Schibsted Grotesk. `docs/BRAND.md` |
| Tags | In the data model; filters, not URLs; small set |
| Newsletter | Friday 06:00 UTC, list in our Postgres, a subscription is 25 km around a town or a canton |
| Photos | Every market has one. Stock never ships |

Every rule in these docs is current best judgment, not law. A rule that blocks something good is a bug in the doc: say what it protected against, why that is outweighed, and change doc and config in the same commit. Never route around one silently. The one forbidden move is loosening a guardrail threshold to turn a red build green.

## The rule that must not be broken

v1 had no future-date limit on occurrence pages, times four locales. One weekly market made 208 URLs; 91% of the site earned nothing; Google called it spam.

> **A page exists because there is content for it — never because a URL pattern permits it.**

Every page generator has a hard cap (dates: 120 days) and a minimum content floor, and `scripts/guardrails.mjs` fails the build on both. This is not a reason to be timid about page types — date pages converted best on v1. The failure was unbounded generation.

## Gotchas that have each cost hours

- **Every table has RLS on and no policies.** The build works because it connects as the owner. A new role gets an empty database, not an error — check what it can *see*.
- **Verify cannot tell you a migration ran.** CI has no database. After applying one, post to the live endpoint and read the row back.
- **`data/*.json` is build output and it is committed.** A fixtures `verify` overwrites it with six markets; check `git diff data/` before committing.
- **Analytics inserts fail silently** (`waitUntil`). Read the Cloudflare log before believing there was no traffic.
- **Use Supabase's session pooler**, `aws-1-eu-west-1.pooler.supabase.com`. The direct host is IPv6-only.
- `.claude/rules/` holds the rules for `functions/`, `supabase/migrations/` and `src/styles/`. They load when you touch those files.

When compacting, keep the files changed, the commands run with their results, and every decision Delfim made.
