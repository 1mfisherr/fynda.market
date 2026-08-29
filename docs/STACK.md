# Stack

The technical choices and the constraints behind them. Written 2026-08-27, pruned 2026-08-29.

**One line:** Astro static on Cloudflare Workers, Supabase Postgres + PostGIS, background loops as GitHub Actions cron jobs calling the Claude API, self-hosted Metabase for analytics, Resend for email, photos in R2. **Roughly $30–50/month at launch.**

---

## The choices

| Component | Choice | Why |
|---|---|---|
| Language | TypeScript strict, Zod at every boundary | Strong types are the code review a solo founder can't do |
| Framework | **Astro 7, `output: 'static'`, Preact islands** | v1's two SEO bug classes — multi-layer cache staleness and Suspense layout shift — are structurally impossible in a static file. And a static build makes the CI guardrails checkable at all: the whole URL space exists as files in `dist/` |
| Hosting | **Cloudflare Workers**, deployed by `wrangler` from GitHub Actions | Static requests are free and unlimited; egress is free. v1's 378K billable middleware invocations are unpriceable here. $0–5/mo |
| Database | **Supabase Postgres + PostGIS**, region `eu-central-2` (Zurich) | Most AI-fluent database there is; radius search is one indexed function. Free tier carries the pilot |
| Dates | Concrete rows; RRULE stored as a bounded generator | See `ARCHITECTURE.md` §Dates |
| Background loops | GitHub Actions cron + Claude API + a `proposals` table + one admin page | Four loops at 0.1 events/second. Anything more is an operational dependency nobody can keep alive |
| Analytics | Own events in our Postgres + self-hosted Metabase + the GSC API | See §Analytics |
| Email | Resend batch API; list and consent in our Postgres | City segmentation is a `where` clause, not a per-contact fee |
| Images | R2 originals, Astro build-time optimisation, served static | $0, zero egress, explicit dimensions emitted by default |

**Never deploy through Cloudflare's auto-build.** The CI gate has to sit in front of the deploy step.

## Verified constraints

Facts that cost money or a rebuild if got wrong. Checked 2026-08-29 unless noted.

- **PostGIS must be installed into the `extensions` schema and cannot be moved afterwards** — not relocatable since PostGIS 2.3. Changing your mind means dropping and recreating it. Get it right in the first migration. ([docs](https://supabase.com/docs/guides/database/extensions/postgis))
- **`eu-central-2` is Zurich.** Swiss pilot, Swiss data-protection sensibilities. ([regions](https://supabase.com/docs/guides/platform/regions))
- **Cloudflare D1 has no geospatial capability at all** — R*Tree, Geopoly and SpatiaLite all unsupported. Radius search is the product, so D1 is disqualified as a primary store, not merely inconvenient. ([limits](https://developers.cloudflare.com/d1/platform/limits/))
- **Cloudflare acquired Astro on 16 January 2026.** Framework and host are now one vendor; Astro stays open source. This retired the main risk in the hosting choice.
- **Supabase free tier** — 500MB database, 5GB egress, pauses after 7 days of inactivity (the freshness loop writes daily, so that's moot). Pro is $25/mo. The whole Swiss + German dataset fits free for a long time; photos live in R2.
- **Cloudflare Workers** — free plan 100k requests/day; paid $5/mo for 10M. Only API calls and the admin page invoke the Worker at all.
- **R2** — 10GB and zero egress free, then $0.015/GB/month.
- **Resend** — free 3,000 emails/month, 100/day; $20/mo Pro at 50k. Do not use Audiences/Broadcasts: marketing pricing bills on stored contacts.

## The German compound-word trap

**Postgres full-text search does not split German compound nouns.** `to_tsvector('german', ...)` will not match `Flohmarkt` inside `Kinderflohmarkt`, `Hallenflohmarkt` or `Nachtflohmarkt` — the exact category words this product is built on. The stock German dictionary stems; it does not decompound.

The fix is a Hunspell/Ispell German dictionary configured as a text-search dictionary. **Whether Supabase permits loading custom dictionary files on a managed instance is unverified — check before relying on it.** Fallbacks: `pg_trgm` trigram matching (`flohmarkt` matches `kinderflohmarkt` naturally, at the cost of some noise), or an explicit alias table per market type — likely wanted anyway, since `Trödelmarkt` is an NRW dialect word rather than a synonym.

**Decide before the search box is built.** Cheap now, a re-index later. (`PLAN.md` step 3.5.)

## Reading the database

Two read paths only, which is what keeps egress boring:

1. **The build reads it once per build.** A typed query module, not a parity-checked JSON artefact. Rebuild twice daily (06:00 and 14:00 CET) plus an on-demand build when a proposal is approved.
2. **The runtime API reads via `supabase-js`** (HTTP/PostgREST, works natively in Workers, no pool management) with Cloudflare's cache API in front at 60–300s.

"Today / this weekend" state is computed client-side or by a small island against the API — never baked into HTML that can go stale overnight. v1's `force-dynamic` pages existed to solve exactly this; a two-line island solves it without a server.

Radius search is `ST_DWithin` on `venues.point` with a GIST index — sub-10ms at this scale, cached 60s at the edge on a rounded lat/lng grid so nearby users share cache entries. Geometry lives on the venue, which is small and static; occurrences are filtered by market and date, never spatially. **There is no case for Typesense, Meilisearch or Algolia. Postgres does all of it.**

## The background loops

Four loops — discovery, freshness, performance, content proposals — as plain TypeScript scripts on GitHub Actions cron, calling the Claude API with Zod-validated structured outputs. Graduate a loop to the Claude Agent SDK only when it demonstrably needs multi-step tool use.

- **Queue:** a `proposals` table (`kind, payload, evidence, status, created_by_loop, decided_by, decided_at`). Loops insert. **Nothing publishes without a row flipping to `approved`** — enforced by the write path, not by policy.
- **Approval:** one server-rendered Astro admin route behind Cloudflare Access. Approving writes the fact with its provenance and fires the build webhook. A Telegram message is the doorbell, so nobody has to poll an admin page — v1's pattern, and it worked.
- **Cost:** $10–30/month of Claude API at pilot scale, metered and capped with spend limits.

No Temporal, Airflow, n8n or LangChain. Cron plus Postgres plus plain scripts is the entire requirement.

## Analytics

**Decided 2026-08-29.** The requirement is not "count pageviews privately" — it is **own the data, collect everything, keep it private.** This supersedes an earlier Plausible recommendation.

Two pieces, and they are not the same thing: **Metabase is a dashboard that reads a database. It collects nothing.**

1. **Collection** — a Worker endpoint writing first-party events into our own Postgres. **Prefer server-side collection at the edge:** immune to ad blockers, no client JS, can't be broken by a consent tool. The cost is viewport and scroll data, which this product doesn't need. v1 already proved the pattern (`analytics_events`, `outbound_click_events`, 12,385 rows, and an `IP_HASH_PEPPER` showing the hashing was already right) — **read that schema before designing the new one.**
2. **Reading** — Metabase, self-hosted against the same Postgres. ~$5–15/month for a small always-on host, plus occasional updates. That is the honest cost of owning the data.
3. **Search Console** — pull the GSC API weekly into Postgres. **The more important half.** v1's collapse was visible in impressions before it was visible anywhere else. Alert on sustained per-page-type decline.

**Every event carries `page_type`.** That one property answers the only question that mattered during the collapse: *which page type is decaying.*

**Staying banner-free** constrains how, not whether: no cookies, no `localStorage` identifier, no cross-site tracking, no ad-network sharing — those are what trigger consent, not analytics as such. Never store a raw IP; hash it with a salt that rotates. Country derived from IP and then discarded is fine; a persistent per-person identifier is not. **The line moves if the data is ever used for advertising or sold on** — revisit before monetisation ships, not after.

Not GA4: needs consent, and v1 showed it goes unanswered in a crisis anyway.

**Decided 2026-08-29, in the schema.** No persistent visitor identifier of any kind — v1 carried an `anonymous_id` that survived across days, which is precisely what triggers consent. All that remains is `HMAC(ip + user agent, salt)` with the salt rotating daily: it counts a visitor within one day and is useless the next. The cost is accepted — no cross-day funnels, no returning-visitor rate. Raw events are deleted after 90 days; the daily aggregate is kept forever, and pruning refuses to run for any day that was never rolled up.

**Design the event schema before the first page ships** (`PLAN.md` step 3.3). Events not collected cannot be recovered. At minimum: search performed, results viewed, result clicked, market viewed, add-to-calendar, directions clicked, organiser contact clicked, newsletter signup, filter changed, and **no-results** — the most valuable and the most commonly forgotten.

## What not to use

| Tempting | Why it's wrong here |
|---|---|
| **Next.js on Vercel** | Re-couples us to the two cost mechanisms that burned v1 (billable invocations, egress) and the two bug classes that hurt its SEO. Peak AI familiarity doesn't compensate for a framework whose sharpest edges are where AI is most confidently wrong |
| **A headless CMS** | The database *is* the CMS. A CMS adds a second source of truth and a second permission model, for a worse version of the `facts` table |
| **An ORM with its own migration religion** (Prisma) | Puts a schema DSL between AI and the database it knows best. `supabase-js` at runtime, plain SQL migrations. Drizzle if typed query building is ever wanted |
| **Self-hosting the boring parts** on a VPS | Saves ~$29/month, costs an unpaid sysadmin job held by someone who can't debug it at 2am. Metabase is the one deliberate exception, because owning the data requires it |
| **A locale matrix** | One locale until a second has real content. Four locales x unbounded pages is the named killer |

## Cost at launch

Cloudflare $0–5 · Supabase $0 · Metabase host $5–15 · Resend $0 · R2 $0 · GitHub $0 · Claude API $10–30 · domain ~$3 → **roughly $30–50/month.** At 1M pageviews, about $150. No line item can surprise-10x without a config change that CI and spend caps sit in front of.

---

owner: Delfim
last_reviewed: 2026-08-29
