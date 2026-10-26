# Stack

What runs, where, and the constraints behind each choice — what is actually running, not a plan.

**One line:** Astro static build, published to Cloudflare Pages by a script; Supabase Postgres + PostGIS read once per build; a handful of Pages Functions for the things a static site cannot do; GitHub Actions for the nightly rebuild, the Friday digest and the organiser mail; Resend for e-mail; Metabase locally.

---

## The choices

| Component | Choice | Why |
|---|---|---|
| Framework | **Astro, `output: 'static'`, no islands** | v1's two SEO bug classes — cache staleness and Suspense layout shift — cannot happen in a static file. And the whole URL space exists as files in `dist/`, which is what makes the guardrails checkable at all |
| Hosting | **Cloudflare Pages**, uploaded by `scripts/deploy.mjs` via `wrangler` | Static requests free and unlimited, egress free. v1's billable middleware invocations are unpriceable here |
| Publishing | **Locally or from GitHub Actions — never Cloudflare's own builder** | Building on Cloudflare failed repeatedly for reasons unrelated to the site: a password copied into a second place, a "retry" that replays the old commit, a dropped Git link, an IPv6-only database host. Building elsewhere removes all of it |
| Runtime code | **Pages Functions** in `functions/` (see below) | The only things a static site cannot do: count a visit and accept a form. Nothing reads the database at runtime to render a page |
| Database | **Supabase Postgres + PostGIS**, `eu-west-1`, read by the build through `pg` (`src/lib/supabase.ts`) | Radius search is one indexed function. Free tier carries the pilot |
| "Today", "this weekend" | Baked in at the nightly build; whether a market is open *now* is filled in by the browser | A page written at night cannot know 14:00. Without JavaScript the page still says "Heute" and the hours |
| E-mail | **Resend** batch API, one sender `fynda.market <contact@fynda.market>`, list and consent in our Postgres. Inbound through Cloudflare Email Routing | Segmentation is a `where` clause, not a per-contact fee. Never Audiences/Broadcasts — they bill on stored contacts |
| Images | **WebP in `public/images/`**, committed | Small enough to live in git. R2 when it is not |
| Analytics | Own events in our Postgres, read locally with Metabase; Search Console by CSV import | See §Analytics |
| Language | TypeScript strict. `tsconfig.functions.json` checks `functions/` separately | A Pages Function needs Cloudflare's globals and must not inherit Astro's DOM lib |
| Tests | Node's own runner (`npm test`) | Weighted to what cannot be taken back: the digest, the date reader, what a page says. Not a coverage target |

## Functions

`functions/` — one file per endpoint, `_`-prefixed files are shared modules.

| Endpoint | Does |
|---|---|
| `_middleware.ts` | Counts page views and robots at the edge |
| `e.ts` | The browser's analytics events |
| `n.ts`, `b.ts` | Newsletter signup; "tell me when it's back". `_newsletter.ts` is the weekly signup both make |
| `v.ts`, `f.ts` | "Were you there?" and the one fact question after a yes |
| `k.ts` | Saved markets |
| `r.ts`, `o.ts` | Report; organiser claim |
| `u.ts` | Unsubscribe |
| `w.ts` | Resend's delivery webhook |
| `s.ts` | The sticker's QR address; permanent, redirects to home in the visitor's language |
| `a/`, `adm/` | The organiser page; Telegram Approve / Dismiss and `/adm/notify` |

## Scheduled work

GitHub Actions cron plus plain Node scripts. GitHub starts scheduled jobs up to five hours late, hence the odd minutes. No Temporal, Airflow, n8n, LangChain.

| Workflow | When (UTC) | What |
|---|---|---|
| `publish.yml` | Nightly 23:07 (just after midnight in Zurich) and again 03:07; on demand when an organiser presses a button (`functions/_publish.ts`) | `deploy.mjs`, then the date alerts (`send-date-alerts.mjs`), the robot-log fold (`prune-logs.mjs`) and the monthly stats (`snapshot-stats.mjs`) |
| `digest.yml` | Friday 02:07 | The weekend digest; a dry run unless `NEWSLETTER_SENDING` is `on` |
| `organisers.yml` | Daily 04:07 | The seven-day question to organisers; a dry run unless `ORGANISER_SENDING` is `on` |
| `organiser-welcome.yml` | Never; by hand | The one-off welcome to imported organisers; a dry run unless "send" is ticked |
| `backup.yml` | Nightly 22:37 | Encrypted `pg_dump`, 90 days as GitHub artifacts; the restore recipe is in the file |
| `ci.yml` | Every push to `main` and pull requests | Types, tests, build, guardrails; the schema tests on an empty database |

## Secrets and where they live

| Secret | Where | Used by |
|---|---|---|
| `SUPABASE_DB_URL` | `.env.local`, GitHub secret | Build, scripts, every workflow that touches the database |
| `V1_DATABASE_URL` | `.env.local` | The v1 importers and `sync-v1.mjs` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Cloudflare Pages secrets | Every Function (PostgREST as the service role) |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `.env.local`, GitHub secrets | `deploy.mjs` |
| `RESEND_API_KEY` | Cloudflare Pages secret, GitHub secret | Welcome mails, digest, organiser mail, date alerts |
| `RESEND_WEBHOOK_SECRET` | Cloudflare Pages secret | `functions/w.ts` verifies Resend's delivery events |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Cloudflare Pages secrets | Form pings, Approve / Dismiss messages, `/adm/notify` (bot: @fyndamarketbot) |
| `ADMIN_SIGNING_SECRET` | Cloudflare Pages, GitHub, `.env.local` | Signs the Telegram links and derives every organiser link (`functions/_link.ts`). Same value in all three — see CLAUDE.md §Gotchas |
| `ANALYTICS_SALT` | Cloudflare Pages secret | The daily visitor hash key (see §Analytics) |
| `GITHUB_DISPATCH_TOKEN` | Cloudflare Pages secret | Fine-grained token, Actions: write, this repo only. A button press runs `publish.yml` now (`functions/_publish.ts`) |
| `CLAUDE_CODE_OAUTH_TOKEN` | `.env.local` | The Market Watch's AI step |
| `ORGANISER_SENDING`, `NEWSLETTER_SENDING` | GitHub Actions **variables**, `on` | Anything else is a dry run. Turning `NEWSLETTER_SENDING` off again means putting the "being set up" hedge back into `utility-copy.ts` and `_mail.ts` in the same commit |

## Verified constraints

Facts that cost money or a rebuild if wrong.

- **PostGIS lives in the `extensions` schema and cannot be moved afterwards.** Changing your mind means dropping and recreating it.
- **Region `eu-west-1` (Ireland) cannot be changed after project creation.** The database is read at build time, so latency reaches nobody. What is given up is the claim that data never leaves Switzerland; our trust claim is about dates being right.
- **Cloudflare D1 has no geospatial capability.** Radius search is the product, so D1 is disqualified.
- **PostgREST refuses an upsert without SELECT.** `metabase_ro` sees only what it is granted.
- **Free tiers:** Supabase 500 MB, pauses after 7 days idle (the nightly build prevents it). Cloudflare Pages Functions 100k requests/day. Resend 3,000 mails/month, 100/day.

## The German compound-word trap

**Postgres full-text search does not split German compounds.** `to_tsvector('german', ...)` will not match `Flohmarkt` inside `Kinderflohmarkt`, `Hallenflohmarkt` or `Nachtflohmarkt` — the category words this product is built on. Fixes, in order of likelihood: a Hunspell German dictionary as a text-search dictionary (**whether Supabase allows loading one is unverified**), `pg_trgm` trigram matching (noisier, works today), or an alias table per market type, which is probably wanted anyway since `Trödelmarkt` is dialect, not a synonym.

Settle this before any German text search is built; it is cheap now and a re-index later.

## Analytics

The requirement is **own the data, collect everything, keep it private** — not "count pageviews". Metabase is a dashboard that reads a database; it collects nothing.

**Collection**
- `functions/_middleware.ts` counts page views at the edge before the HTML is served — no client JS, so a blocker cannot remove them.
- It reads the page's own `<meta name="fynda:market|city|region|next">` tags off the response, so a view carries the market id, town, canton and days to the next date.
- It records 404s as `not_found`, and writes every robot to `crawler_hits` (name, role — training / search / *user*, meaning a person asked an AI about that page — network, path) instead of dropping it.
- `functions/e.ts` takes the browser's events: clicks, filters, saves, `page_leave` (visible time, scroll depth, sections seen), `web_vitals`, `js_error`, rage and dead clicks, newsletter form start, language switches.
- Both write `analytics_events` through `functions/_collect.ts`, which adds what Cloudflare knows on every request — town, canton, timezone, network, connection RTT, protocol, EU flag — plus the browser's first language and the previous page on our site.
- **`props` shapes are fixed by a check constraint per event:** obey it exactly, or a second vocabulary splits the numbers.
- **Every row carries `page_type`** — the one property that would have shown v1's collapse.

**Identity, two layers**
- Layer 1, always: `HMAC(ip + user agent)` under a key that carries the date, so one person is one hash today and another tomorrow.
- Layer 2, with consent: `fynda_consent=granted` and `fynda_id` (a uuid, 13 months), both first-party cookies set by `CookieBanner.astro`, a slim bar on a phone since 2026-10-26 (two lines over two equal buttons; it used to cover 40% of a first screen). `_collect.ts` writes `visitor_id` only when the first says granted, and the table refuses it otherwise. "Only essential" keeps layer 1.
- Any third-party analytics tool loads only behind the same consent and is named in the privacy page the day it is added. Germany needs a banner, so it exists from day one.

**Bots**
- Edge filter, `isProbablyBotRequest`: drops a request whose user-agent names a bot, that comes from a cloud or hosting network (`request.cf.asOrganization`), that sends no `Accept-Language`, or that sends no `Sec-Fetch-Mode` (every browser since 2023 sends the last two; an HTTP client wearing a browser's name does not). Forms use only the user-agent test, so a person on a VPN can still report a market.
- After the fact: scraper farms in browser headers still pass the edge. `analytics_visitor_days` gives every visitor-day a `bot_likely` verdict, and `analytics_events_classified` is the raw table with that verdict beside each row. Dashboards read the classified view; the raw table is untouched.

**Retention.** Nothing in `analytics_events` is deleted and there is no aggregate table; Metabase reads the raw table directly. If that gets slow, an aggregate arrives as its own migration, on evidence. The daily hash key is `ANALYTICS_SALT + date`; the salt is permanent, so rows stay linkable to an IP for whoever holds the salt. That is accepted: no re-hashing job. The privacy page promises hashed, unreadable IPs and nothing more, which is what the code does.

**Reading**
- Metabase under Docker on this machine, built by `metabase/dashboards.py` (`metabase/README.md`).
- Views for it: `analytics_events_classified`, `analytics_visitor_days`, `analytics_sessions` (cookieless sittings, bounce), `analytics_engagement` (page_leave flattened), `crawler_hits`.
- It reads as `metabase_ro`, which cannot see `reports` or `market_private` but can read the two triage views.
- Search Console is imported from the free CSV export by `scripts/import-gsc.mjs`. Google keeps 16 months and never backfills, so the habit matters more than the schedule.

## What not to use

| Tempting | Why not |
|---|---|
| **Next.js on Vercel** | Re-couples us to the two cost mechanisms that burned v1 and the two bug classes that hurt its SEO |
| **A headless CMS** | The database *is* the CMS. A CMS is a second source of truth for a worse version of `facts` |
| **An ORM with a migration religion** (Prisma) | Plain SQL migrations, `pg` at build time |
| **Cloudflare's Git integration** | See Publishing above |
| **A locale matrix** | Four locales × unbounded pages is the named killer |
