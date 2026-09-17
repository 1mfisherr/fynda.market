# Stack

What runs, where, and the constraints behind each choice — what is actually running, not a plan.

**One line:** Astro static build, published to Cloudflare Pages by a script; Supabase Postgres + PostGIS read once per build; a handful of Pages Functions for the things a static site cannot do; GitHub Actions for the nightly rebuild, the Friday digest and the daily organiser mail; Resend for e-mail; Metabase locally. **Cost today: the domain.**

---

## The choices

| Component | Choice | Why |
|---|---|---|
| Framework | **Astro 7, `output: 'static'`, no islands** | v1's two SEO bug classes — cache staleness and Suspense layout shift — cannot happen in a static file. And the whole URL space exists as files in `dist/`, which is what makes the guardrails checkable at all |
| Hosting | **Cloudflare Pages**, uploaded by `scripts/deploy.mjs` via `wrangler` | Static requests free and unlimited, egress free. v1's 378K billable middleware invocations are unpriceable here |
| Publishing | **Locally or from GitHub Actions — never Cloudflare's own builder.** `publish.yml` runs the same `deploy.mjs` nightly at 03:00 UTC | Building on Cloudflare cost five hours across six failed deploys, none about the site: a password copied into a second place, a "retry" that replays the old commit, a Git link that dropped, an IPv6-only database host. Building elsewhere removes all of it |
| Runtime code | **Pages Functions** in `functions/`: `_middleware.ts` (page views), `e.ts` (events), `n.ts` / `r.ts` / `o.ts` / `u.ts` (newsletter, report, claim, unsubscribe), `w.ts` (Resend's delivery webhook) | The only things a static site cannot do: count a visit and accept a form. Nothing reads the database at runtime |
| Database | **Supabase Postgres 17 + PostGIS**, `eu-west-1`, read by the build through `pg` (`src/lib/supabase.ts`) | Radius search is one indexed function. Free tier carries the pilot |
| "Today", "this weekend" | Baked in at the 03:00 build; whether a market is open *now* is filled in by the browser | A page written at 03:00 cannot know 14:00. Without JavaScript the page still says "Heute" and the hours |
| Scheduled work | **GitHub Actions cron + plain Node scripts:** `publish.yml` nightly (and on demand, `workflow_dispatch` from a Function when an organiser presses a button), `digest.yml` Friday 06:00 UTC, `organisers.yml` daily 06:00 UTC behind `ORGANISER_SENDING` | Three jobs. No Temporal, Airflow, n8n, LangChain. The AI-driven discovery and freshness loops with a `proposals` table are designed (below) and not built |
| E-mail | **Resend** batch API, one sender `fynda.market <contact@fynda.market>`, list and consent in our Postgres. Inbound through Cloudflare Email Routing | Segmentation is a `where` clause, not a per-contact fee. Never Audiences/Broadcasts — they bill on stored contacts |
| Images | **WebP in `public/images/`**, two sizes per market, committed | 157 markets × 2 files is small enough to live in git. R2 when it is not |
| Analytics | Own events in our Postgres, read locally with Metabase; Search Console by CSV import | See §Analytics |
| Language | TypeScript strict. `tsconfig.functions.json` checks `functions/` separately | A Pages Function needs Cloudflare's globals and must not inherit Astro's DOM lib |
| Tests | Node's own runner, 26 tests, all on the digest | The digest is the one thing that sends wrong information to real people and cannot be taken back. Not a coverage target |

## Secrets and where they live

| Secret | Where | Used by |
|---|---|---|
| `SUPABASE_DB_URL`, `V1_DATABASE_URL` | `.env.local`; the first also a GitHub secret | Build, scripts, `publish.yml`, `digest.yml` |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `.env.local` and GitHub secrets | `deploy.mjs` |
| `RESEND_API_KEY` | Cloudflare Pages secret and GitHub secret | Welcome mail, digest |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Cloudflare Pages secrets | The form ping (bot: @fyndamarketbot) |
| `RESEND_WEBHOOK_SECRET` | Cloudflare Pages secret | `functions/w.ts` verifies Resend's delivery events with it. A changed Pages secret needs a redeploy to be seen |
| `ADMIN_SIGNING_SECRET` | Cloudflare Pages secret, GitHub secret, `.env.local` | Signs the Approve/Reject links in Telegram and derives every organiser link (`functions/_link.ts`). **Must be the same value in all three places** or every button lands on "link no longer valid" |
| `GITHUB_DISPATCH_TOKEN` | Cloudflare Pages secret | Fine-grained token, Actions: write, this repo only. A button press runs `publish.yml` now instead of at 03:00 (`functions/_publish.ts`) |
| `ORGANISER_SENDING` | GitHub Actions **variable**, `on` | Anything else turns the daily organiser mail into a dry run |
| `NEWSLETTER_SENDING` | GitHub Actions **variable**, `on` | Anything else turns the Friday run into a dry run — and put the "being set up" hedge back into `utility-copy.ts` and `_mail.ts` in the same commit |

## Verified constraints

Facts that cost money or a rebuild if wrong.

- **PostGIS lives in the `extensions` schema and cannot be moved afterwards.** Changing your mind means dropping and recreating it.
- **Region `eu-west-1` (Ireland) cannot be changed after project creation.** Zurich was a preference, not a requirement: the database is read at build time, so latency reaches nobody. What is given up is the claim that data never leaves Switzerland; our trust claim is about dates being right.
- **Cloudflare D1 has no geospatial capability at all.** Radius search is the product, so D1 is disqualified, not inconvenient.
- **Supabase's direct host is IPv6-only.** Use the session pooler, `aws-1-eu-west-1.pooler.supabase.com:5432` (2026-09-04).
- **Every table has RLS on with no policies.** The build connects as the owner, which is exempt; `metabase_ro` sees only what it is granted; the Functions write as the service role, which bypasses RLS and *still* needs a table `GRANT`. PostgREST refuses an upsert without SELECT (2026-09-06).
- **Free tiers:** Supabase 500 MB / 5 GB egress, pauses after 7 days idle (the nightly build prevents it). Cloudflare Pages Functions 100k requests/day. Resend 3,000 mails/month, 100/day. All far above pilot scale.
- **Cloudflare acquired Astro on 16 January 2026.** Framework and host are one vendor; Astro stays open source.

## The German compound-word trap

**Postgres full-text search does not split German compounds.** `to_tsvector('german', ...)` will not match `Flohmarkt` inside `Kinderflohmarkt`, `Hallenflohmarkt` or `Nachtflohmarkt` — the category words this product is built on. Fixes, in order of likelihood: a Hunspell German dictionary as a text-search dictionary (**whether Supabase allows loading one is unverified**), `pg_trgm` trigram matching (noisier, works today), or an alias table per market type, which is probably wanted anyway since `Trödelmarkt` is dialect, not a synonym.

**Decide before the search box is built** (`PLAN.md` Next §5). Cheap now, a re-index later.

## Analytics

The requirement is **own the data, collect everything, keep it private** — not "count pageviews". Metabase is a dashboard that reads a database; it collects nothing.

**Collection.** `functions/_middleware.ts` counts page views at the edge before the HTML is served — no client JS, so a blocker cannot remove them. `functions/e.ts` takes interaction events from the browser, because "clicked directions" exists nowhere else. Both write `analytics_events` through `functions/_collect.ts`, whose `props` shapes are fixed by a check constraint per event: obey it exactly, or a second vocabulary splits the numbers. **Every row carries `page_type`** — the one property that would have shown v1's collapse.

**Identity, two layers.** Layer 1, always: `HMAC(ip + user agent)` under a key that carries the date, so one person is one hash today and another tomorrow. Layer 2, with consent: `fynda_consent=granted` and `fynda_id` (a uuid, 13 months), both first-party cookies set by `CookieBanner.astro`; `_collect.ts` writes `visitor_id` only when the first says granted, and the table refuses it otherwise. "Only essential" keeps layer 1. Any third-party analytics tool loads only behind the same consent and is named in the privacy page the day it is added. Switzerland needs no banner for this; Germany does, so it exists from day one. *[Judgement, not legal advice — an hour of a lawyer before monetisation.]*

**Bots, after the fact.** What the edge filter passes still includes scraper farms wearing browser headers — 80–90% of page views in the first fortnight. `analytics_visitor_days` gives every visitor-day a `bot_likely` verdict (rules in its migration, 2026-09-17), and `analytics_events_classified` is the raw table with that verdict beside each row. Dashboards read the classified view; the raw table is untouched. An edge-time flag and a crawler table are next (`reference/analytics-research/build-plan.md`).

**Retention.** Nothing is deleted; there is deliberately no prune, and no aggregate table — at ~300 rows a day Metabase reads the raw table directly. If that ever gets slow, an aggregate arrives as its own migration, on evidence. The daily hash key is `ANALYTICS_SALT + date`; the salt is permanent, so rows stay linkable to an IP for whoever holds it — the key-forgetting job in the build plan fixes that.

**Reading.** Metabase under Docker on this machine, five dashboards built by `metabase/dashboards.py`, `metabase/README.md`. It reads as `metabase_ro`, which cannot see `reports` or `market_private` but can read the two triage views. Search Console is imported from the free CSV export by `scripts/import-gsc.mjs` — Google keeps 16 months and never backfills, so the habit matters more than the schedule.

**Bots.** `isProbablyBotRequest` drops a request whose user-agent names a bot, that comes from a cloud or hosting network (`request.cf.asOrganization`), that sends no `Accept-Language`, or that sends no `Sec-Fetch-Mode` — every browser since 2023 sends the last two on every request, and an HTTP client wearing a browser's name does not. Forms use only the user-agent test, so a person on a VPN can still report a market.

## Designed, not built

Four AI loops — discovery, freshness, performance, content proposals — as plain scripts on GitHub Actions calling the Claude API with Zod-validated structured output, inserting into a `proposals` table (`kind, payload, evidence, status, …`). **Nothing publishes without a row flipping to `approved`**, enforced by the write path; approval is one admin route behind Cloudflare Access, Telegram as the doorbell. Budget $10–30/month, capped. Graduate to the Agent SDK only when a loop demonstrably needs multi-step tool use.

## What not to use

| Tempting | Why not |
|---|---|
| **Next.js on Vercel** | Re-couples us to the two cost mechanisms that burned v1 and the two bug classes that hurt its SEO |
| **A headless CMS** | The database *is* the CMS. A CMS is a second source of truth for a worse version of `facts` |
| **An ORM with a migration religion** (Prisma) | Plain SQL migrations, `pg` at build time. Drizzle if typed query building is ever wanted |
| **A VPS for the boring parts** | Saves ~$29/month, costs an unpaid sysadmin job held by someone who can't debug it at 2am |
| **Cloudflare's Git integration** | See Publishing above |
| **A locale matrix** | Four locales × unbounded pages is the named killer |

---

owner: Delfim
last_reviewed: 2026-09-16
