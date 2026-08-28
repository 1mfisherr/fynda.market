# Tech Stack — Recommendation

Written 2026-08-27, against `ARCHITECTURE_PROPOSAL_V1.md`, `COLLAPSE_CAUSE.md`, `SEARCH_BEHAVIOUR.md`, `SERP_EVIDENCE.md`, `ARCHITECTURE_IDEAS.md`, `STRATEGY_DEEP_DIVE.md`, and the predecessor's known failure modes (unbounded page generation, Vercel middleware invoicing 378K invocations/month, egress costs, App Router cache staleness, unguarded Suspense layout shift).

**Epistemic labels:** `[VERIFIED]` = checked against the named source on 2026-08-27, URL given · `[REPORTED]` = secondary source, not confirmed on the vendor's page today · `[JUDGEMENT]` = engineering opinion, argued not measured. Pricing pages change; every number below carries its check date implicitly (2026-08-27) and should be re-verified before contracts are signed.

**The one-paragraph version:** Astro (static output) on Cloudflare Workers, keeping Supabase Postgres + PostGIS as the database. TypeScript strict everywhere, Zod at every boundary. Background loops as GitHub Actions cron jobs calling the Claude API, writing proposals into Postgres, approved by a human on a small admin page. Plausible for analytics, Resend for email with the subscriber list in our own Postgres, photos in R2 optimised at build time. Roughly **$25–45/month at launch**, scaling to ~$150/month at a million pageviews.

---

## 1. Framework and rendering: Astro, fully static output

**Recommendation: Astro 5.x, `output: 'static'`, with Preact islands for the interactive layer.**

### The real trade-off

The site is ~240 content-dense pages that change at most daily, plus a thin interactive layer (date/radius/type filters hitting a light API). That is Astro's exact design center: HTML by default, zero JavaScript unless a component explicitly opts in (`client:load`), no hydration of anything that didn't ask for it. `[JUDGEMENT]`, but widely corroborated — Astro pages ship ~0–15KB JS vs 85–250KB for a comparable Next.js page ([comparison, 2026](https://www.cosmicjs.com/blog/astro-vs-nextjs-2026) `[REPORTED]`).

Against the hard constraints:

- **Constraint 4 (the predecessor's specific bugs).** The layout-shift bug came from an unguarded React Suspense boundary; the stale-page bugs came from Next.js App Router caching semantics (`force-dynamic`, `revalidate`, fetch cache, router cache — four interacting cache layers). **Astro static output has neither mechanism.** There is no Suspense in a static HTML page and no runtime cache to misconfigure — the page is a file. This is not "Astro developers are more careful"; the failure modes are structurally absent. That is the strongest single argument in this document.
- **Constraint 5 (CI enforces architecture).** A static build makes the guardrails *checkable at all*: the complete URL space exists as files in `dist/` after every build, so the URL-to-entity ratio and per-page content assertions are a script over a directory (§6). With SSR, the URL space is only enumerable by convention — you'd be checking the sitemap, not the truth. **SSG is what makes the non-negotiable CI requirement cheap and honest.** This weighed heavily in the choice.
- **Constraint 1 (AI writes everything).** Astro is boring by construction: components are HTML with frontmatter, routing is files, content is typed collections. It is extremely well represented in training data by 2026, and its error messages are among the best in the ecosystem. The islands use **Preact** — React-compatible syntax, ~4KB — so the interactive components are written in the dialect AI is most fluent in, without shipping React.
- **Constraint 3 (LCP < 2s on 4G).** Static HTML + explicit image dimensions (§9) + no framework JS on content pages. Lighthouse-100 is Astro's default state, not an optimisation project.

### What is being traded away — plainly

1. **Next.js is the single most AI-fluent framework.** Claude writes more Next.js than anything else, and the founder knows its shape. This is a real cost. I judge it smaller than the cost of Next.js's cache/Suspense complexity, because those are precisely the subtleties AI gets wrong *confidently* — the predecessor repo is the evidence. Astro's smaller surface area means less to get wrong, which matters more than peak familiarity. `[JUDGEMENT]`
2. **If the product grows a heavy authenticated app** (a real organiser dashboard, complex client state), Astro is the weaker host. The docs' own position is that organisers will never use a dashboard (`ARCHITECTURE_IDEAS.md` Part 1) — the organiser interface is WhatsApp. If that reverses, the right move is a separate small app (possibly Next.js) on a subdomain, not a rewrite; the API-shaped core (§3) makes that cheap.
3. **A framework migration has a real one-time cost** even with AI doing the typing: ~1–2 weeks of the 2–3 week build budget in `STRATEGY_DEEP_DIVE.md` §7 Phase 1. Since v2 is a rewrite anyway (new URL scheme, new data model, new name), the marginal cost is near zero. This would be a much harder call if v1 were being evolved rather than replaced.

### Why not the others

- **Next.js** — see above. Additionally: its rendering flexibility (ISR, PPR, streaming) is solving problems this site does not have, and each mode is a way to reproduce the stale-page bug. On Vercel it re-couples us to the invocation/egress cost model that burned v1 (§2).
- **SvelteKit** — technically fine, meaningfully less training data than Astro/React, and its default posture is "app framework that can prerender" rather than "content site that can hydrate". Wrong default for this product. Ruled out primarily by constraint 1.
- **Remix / React Router 7** — the project has been through two identity migrations in three years; conventions churn is the opposite of what an AI-maintained codebase needs. Also SSR-first, so the CI argument bites.
- **Eleventy / plain SSG** — would serve the 240 pages, but the API layer, admin page and islands would then live in a second framework. Astro covers all of it in one set of conventions.

### Rendering and build cadence

- All four launch page types **prerendered at build time**. Rebuild on a schedule (2×/day is enough for a daily-changing dataset — 06:00 and 14:00 CET) plus an on-demand build triggered by webhook when a proposal is approved (§5). "Today / this weekend" state on home and city pages is computed client-side or by a tiny island against the API, never baked into HTML that can go stale overnight — the predecessor's `force-dynamic` pages existed to solve exactly this, and a 2-line island solves it without a server.
- The filter/radius API lives in the same repo as Astro server endpoints (`src/pages/api/*`), deployed as a Cloudflare Worker (§2). Pages consume the same query layer (§3), satisfying constraint 8 — a future WebMCP tool or public API is another thin adapter over the same functions.
- **Build time at scale:** 240 pages builds in well under a minute; Astro static builds of 5,000–10,000 mostly-templated pages run a few minutes on GitHub Actions. `[REPORTED — community benchmarks; not measured]`. The graduation gates cap growth long before build time becomes a constraint, and if it ever does, the answer is build sharding, not a framework change.

---

## 2. Hosting: Cloudflare Workers (static assets + API in one deploy)

**Recommendation: Cloudflare, via Astro's Cloudflare adapter — static assets served from the edge, API endpoints as Worker invocations. Deploy with `wrangler` from GitHub Actions (never Cloudflare's auto-build — the CI gate must sit in front of the deploy, §6).**

### Why this specifically answers the predecessor's failure modes

`[VERIFIED — https://developers.cloudflare.com/workers/platform/pricing/, checked 2026-08-27]`:

- **"Requests to static assets are free and unlimited."** The middleware misconfiguration that produced 378K billable edge invocations/month on Vercel is *unpriceable* here: a static page request is not an invocation and cannot become one by config accident.
- **"No additional charges for data transfer (egress) or throughput (bandwidth)."** The egress cost problem is structurally eliminated, not optimised.
- Free plan: 100,000 Worker requests/day, 10ms CPU each. Paid plan: **$5/month** including 10M requests and 30M CPU-ms; $0.30/additional million requests.

Only API calls (filters, radius search) and the admin page invoke the Worker. At launch traffic those fit inside the free plan with an order of magnitude of headroom.

### Honest cost model (monthly)

Assumptions: ~82% mobile, ~1.3 API calls per pageview (filter interactions), images served as static assets.

| Monthly pageviews | Cloudflare | Vercel Pro | Netlify | Hetzner VPS |
|---|---|---|---|---|
| 10k | **$0** | $20 (Hobby bans commercial use) | $0–19 | ~$5 |
| 100k | **$0–5** | $20 | $19+ | ~$5 |
| 1M | **$5–10** | $20 + overages, realistically $40–100 (edge requests $2/M beyond 10M, fast data transfer $0.15/GB beyond 1TB) | $19 + bandwidth overages, likely $50+ | ~$10 |

Vercel figures `[VERIFIED — https://vercel.com/pricing, checked 2026-08-27]`: Pro $20/mo with $20 usage credit; edge requests 10M included then "from $2 per 1M"; fast data transfer 1TB included then $0.15/GB; function invocations 1M included then from $0.60/M. Note the shape: at 1M pageviews, *every* page request is a billable edge request on Vercel; on Cloudflare, none are. Netlify figures `[REPORTED — not re-verified today]`. Cloudflare figures `[VERIFIED]` as above.

### Trade-offs named

- **The Workers runtime is not Node.** Most npm packages work under the Node compatibility layer; some (native bindings, long-lived sockets) do not. Mitigation: the runtime surface is deliberately tiny (query API + admin), and DB access is over HTTP (§3). Anything incompatible runs in GitHub Actions instead (§5).
- **Vercel's DX (preview deploys, build logs, framework integration) is genuinely better.** Cloudflare's is adequate, `wrangler` is well documented and AI-fluent, and preview deploys exist. We are trading polish for a cost model that cannot ambush a pre-revenue solo founder. That trade is correct here.
- **A VPS is cheaper at 1M pageviews and infinitely flexible** — and turns a non-technical founder into a sysadmin (TLS renewal, kernel patches, monitoring, backup verification), with AI as the only ops engineer. Rejected on constraint 1, not on cost.

---

## 3. Database and geospatial: keep Supabase (Postgres + PostGIS)

**Don't change this.** Postgres is the most AI-fluent database in existence; PostGIS is the boring, correct answer to constraint 7; Supabase's free tier carries the whole Swiss pilot; and the founder already knows its shape. Every alternative is worse on at least one hard constraint:

- **Neon** — excellent serverless Postgres, but PostGIS setup is manual, there's no bundled storage/auth if ever needed, and it buys nothing Supabase lacks here.
- **Cloudflare D1** — SQLite: no PostGIS, weak for the relational depth of the provenance model. Ruled out.
- **SQLite/Turso, or "just JSON files in the repo"** — tempting for 240 static pages, but the background loops (§5) need a real concurrent write store, and the occurrence ledger is the company's core asset (`STRATEGY_DEEP_DIVE.md` Layer 3). The asset does not live in a build artefact.

Pricing `[REPORTED — aggregated from https://supabase.com/pricing via secondary sources, checked 2026-08-27]`: Free tier $0 — 500MB database, 5GB egress, projects pause after 7 days of inactivity (the freshness loop writes daily, so pausing is moot). Pro $25/mo — 8GB database, 250GB egress, then $0.09/GB. The entire Swiss + German dataset (50k occurrences/year, per-fact provenance) fits in the free tier's 500MB for a long time; text and photos dominate storage, and photos live in R2 (§9).

**Egress discipline (the predecessor's pain):** two read paths only. (1) The build reads the DB once per build — the deploy-time catalogue pattern from v1 was actually sound; keep the *pattern*, drop the ceremony (a typed query module, not a parity-checked JSON artefact). (2) The runtime API reads via `supabase-js` (HTTP/PostgREST — works natively in Workers, no connection pool management) with Cloudflare's cache API in front at 60–300s TTL, so repeated identical filter queries never reach Postgres. At 1M pageviews, DB egress stays in single-digit GB. `[JUDGEMENT on the numbers; the mechanism is standard]`

### Data model (constraint 6: multi-country, multi-language, per-fact provenance from commit one)

Current-state tables, normalised, every geographic level first-class:

```
countries    (id, iso2, slug)                          -- 'de', 'ch'
regions      (id, country_id, slug, kind)              -- Bundesland / Kanton; kind='ADM1'
cities       (id, region_id, slug, point geography)
venues       (id, city_id, name, address, point geography(Point,4326))
markets      (id, venue_id, organiser_id, slug, status, recurrence_rrule text null,
              recurrence_text text null)
occurrences  (id, market_id, date date, start_time, end_time, status, origin)
              -- status: scheduled|confirmed|cancelled|unverified ; origin: manual|generated|organiser
organisers   (id, name, channel_type, channel_value, response_latency_median interval)
*_i18n       (entity_id, locale, field, value)         -- names/descriptions per locale
```

Two rules make it genuinely multi-country rather than nominally: **no free-text place names in queries** (everything joins through the geography tree — the URL `/de/deutschland/koeln/` is `locale + country.slug + city.slug`), and **no default locale in the schema** (German is just the first row in `*_i18n`; a locale ships only when its content exists — the rule with a body count from `COLLAPSE_CAUSE.md` §6).

**Provenance** is an append-only ledger beside the current state, not columns bolted onto it:

```
facts (id, entity_type, entity_id, field, value jsonb,
       source_type,        -- organiser_whatsapp | organiser_email | website_crawl | manual | press
       source_ref,         -- URL, phone number id, admin user
       observed_at timestamptz, recorded_at timestamptz,
       confidence, superseded_by uuid null)
```

Nothing is overwritten, only superseded — the schema decision `STRATEGY_DEEP_DIVE.md` §2 Layer 3 calls "the single cheapest moat-relevant engineering decision available." The freshness loop's queue is a SQL view over this table: staleness (now − max `observed_at` per entity) × traffic (from analytics import, §7) × volatility (historical change frequency, also computable from `facts`).

### Radius search

`venues.point geography` + GIST index; the #1 German query pattern (`in der Nähe`) is:

```sql
select m.* from markets m join venues v using (venue_id)
where ST_DWithin(v.point, ST_MakePoint($lng,$lat)::geography, $radius_m)
order by ST_Distance(v.point, ST_MakePoint($lng,$lat)::geography);
```

On tens of thousands of venues this is sub-10ms on Supabase's smallest instance — this dataset is small by PostGIS standards by three orders of magnitude. `[JUDGEMENT, uncontroversial]` Cost of radius search at any plausible traffic: effectively zero, cached 60s at the edge keyed on a rounded lat/lng grid so nearby users share cache entries.

---

## 4. Dates: concrete rows always; recurrence rules stored, but only as a bounded generator

The settled part stays settled: **occurrences are rows**, filterable and displayable, because people search `flohmarkt 2.8.26` (17.5% CTR on explicit-date queries, `SEARCH_BEHAVIOUR.md` §1) and filter by date range.

**Recommendation on the open part: store recurrence too — as an RFC 5545 RRULE string on the market (`recurrence_rrule`), plus the human-readable phrase (`recurrence_text`, "jeden 1. Sonntag, März–Oktober").** Three reasons:

1. **It is the cheap way to keep many concrete dates accurate** — the actual question `ARCHITECTURE_IDEAS.md` Part 6 §3 narrowed to. A generator job expands each rule into proposed occurrence rows within a **hard-capped horizon (120 days — the cap the predecessor shipped 8 days too late, now a named constant with a test asserting no occurrence beyond it is ever emitted)**, marked `origin='generated', status='unverified'`. The freshness loop's job is to flip `unverified` → `confirmed` via the organiser channel before the date approaches.
2. **Stated-vs-actual recurrence is ledger data.** "First-Sunday markets that actually skip August" (`STRATEGY_DEEP_DIVE.md` Layer 3) is only computable if the stated rule is stored. The diff between rule output and confirmed reality is the reliability score nobody else can compute.
3. RRULE is a standard with mature libraries (`rrule` on npm) and deep training-data presence — AI handles it correctly; a bespoke recurrence DSL would be a bug farm. `[JUDGEMENT]`

**The guardrail that matters:** pages and API responses render **only occurrence rows, never rules.** The rule is upstream plumbing. Unverified generated occurrences render with honest "nicht bestätigt" state (or are excluded from "jetzt geöffnet"-class answers entirely) — freshness as a displayed property, which is the product thesis.

---

## 5. The AI background loops: GitHub Actions cron + Postgres queues + one admin page

**Recommendation: no workflow engine, no queue infrastructure, no agent framework.** Four loops at ~0.1 events/second (the `ANALYTICS_PLAN.md` observation generalises) need:

- **Scheduler:** GitHub Actions `schedule:` workflows — discovery weekly, freshness daily, performance weekly, content proposals as part of discovery. Free tier: 2,000 minutes/month on private repos `[REPORTED — well-established GitHub pricing, not re-checked today]`; the loops fit with room to spare, and jobs may run up to 6 hours — no Worker CPU-limit gymnastics. Each loop is a plain TypeScript script calling the Claude API (structured outputs, Zod-validated) — or, where a loop is genuinely agentic (reading an organiser's site and diffing facts), the Claude Agent SDK in headless mode. Start with plain scripts; graduate a loop to the SDK only when it demonstrably needs multi-step tool use.
- **Queue:** a `proposals` table in Postgres (`kind, payload jsonb, evidence jsonb, status pending|approved|rejected, created_by_loop, decided_by, decided_at`). Loops insert; nothing publishes without a row flipping to `approved` — the hard line from `ARCHITECTURE_IDEAS.md` Part 4 loop 3, enforced by the write path, not by policy.
- **Human approval:** one server-rendered Astro admin route behind **Cloudflare Access** (free for up to 50 users `[REPORTED]`): list pending proposals with evidence and diff, approve/reject buttons. Approval writes the fact (with provenance `source_type='manual'` or the loop's original source), and fires the build webhook (§1). Keep the predecessor's proven Telegram-notification pattern as the "something needs you" doorbell — the founder should not have to poll an admin page.
- **Freshness ranking** is the SQL view from §3 — the loop reads the top N, re-checks sources, proposes diffs. **Performance loop** pulls the GSC API and Plausible API weekly into Postgres and posts a per-page-type trend summary to Telegram (§7).

Expected Claude API cost at pilot scale (a few hundred markets, top-of-queue daily): **$10–30/month** `[JUDGEEMENT — depends on model choice and crawl volume; meterable and capped via spend limits]`.

**Why not the alternatives:** Temporal/Airflow/Prefect are operational commitments sized for teams; n8n/Zapier put core business logic in a GUI no one can code-review; LangChain-style frameworks add an abstraction layer over an API that is already simple, and AI writes raw Claude API calls more reliably than framework incantations. Every one of these fails constraint 1 or 2. If a loop ever outgrows Actions (it won't soon), the scripts port anywhere — they're just Node processes with env vars.

---

## 6. CI guardrails: concretely

The gates run in GitHub Actions on every push; **the deploy step is ordered after them, so a red check is a blocked deploy**, not a warning. This works because the build is fully static (§1) — the checks interrogate `dist/` as ground truth, not a sitemap that might lie.

**Check 1 — URL-to-entity ratio (the collapse detector).**
Post-build script: recursively enumerate every `dist/**/index.html`; classify each path against an explicit allowlist of route patterns (`/de/`, `/de/deutschland/`, `/de/deutschland/[region]/`, `/de/deutschland/[region-city]/`, `/de/markt/[slug]/`). Then:
- **Any path matching no allowed pattern → fail.** (A new page type cannot ship by accident; adding a pattern is a reviewed diff to the allowlist — the graduation gate as code.)
- Load entity counts from the build's own catalogue query; assert `total_pages / market_count ≤ 2.0` (launch reality is ~1.2; 2.0 leaves graduation headroom). Fail loudly with both numbers printed. The predecessor hit 60:1 with nothing watching; this check would have failed its build months before the spam update.
- Assert per-pattern instance counts are within declared bounds (e.g. region pages == 16 for DE).

**Check 2 — minimum content per page (the thinness detector).**
Parse each built HTML file with `linkedom`/`cheerio` (fast, AI-fluent). Per page type, assert against semantic hooks the templates deliberately expose (`data-testid="market-card"`, `data-testid="occurrence-row"`):
- City page: ≥ 3 market cards (the Gate-1 density floor from `ARCHITECTURE_PROPOSAL_V1.md` §3, machine-enforced; below floor → the page must not have been generated, so its existence is the bug).
- Market page: ≥ 1 future occurrence row *or* an explicit "keine Termine bestätigt" state block; name, address, coordinates present.
- Every page: exactly one JSON-LD block, parsed and validated with Zod schemas typed via `schema-dts` (Event/Place/BreadcrumbList complete — constraint 4's structured-data requirement, enforced not hoped).
- **Horizon check:** no rendered occurrence date > 120 days out (§4's cap, verified at the output layer too).

**Check 3 — parity and vitals.**
Sitemap URLs ⊆ dist pages ⊆ sitemap (no orphans in either direction); every `<img>` carries explicit `width`/`height` (the CLS bug class, made unshippable); Lighthouse CI on a sample of 5 pages per type with LCP budget asserted on emulated 4G (advisory for the first month, then blocking).

Total implementation: ~300 lines of TypeScript scripts, no products to buy, runs in seconds. The reason this is cheap is the SSG decision — that causality ran forwards into the framework choice, as constraint 5 demanded.

---

## 7. Analytics: Plausible (EU cloud) + GSC API, both pulled into Postgres weekly

**Recommendation: Plausible Analytics, EU-hosted cloud, $9/month** (Starter, 10k pageviews; ~$19 at 100k; ~$69 at 1M `[REPORTED — https://plausible.io, tiers per secondary sources checked 2026-08-27]`).

- Cookieless by design, EU company, EU hosting — runs banner-free under GDPR/nFADP; this is the canonical "no cookie banner" choice and the `ANALYTICS_PLAN.md` Tier-1 conclusion carries over.
- **The crisis question — "which page type is decaying" — is answered by one custom property:** every pageview tagged `page_type` (market/city/region/home). The performance loop (§5) pulls the Plausible Stats API *and* the GSC API weekly into Postgres tables and computes per-page-type week-over-week trend; a Telegram alert fires on a sustained decline. GSC is the more important half — the predecessor's collapse was visible in impressions days before anything else — and pulling it into our own Postgres means never again being unable to answer basic questions during a crisis.
- **$0 alternative, named honestly:** Umami Cloud's free tier (100k events/month `[REPORTED — https://umami.is/pricing checked 2026-08-27]`) does the same job. I still recommend paying Plausible: it is the more established, EU-domiciled, boringly documented option, and $9 is the wrong place to save money when the requirement is "must answer questions during a crisis." Take Umami if the €9 genuinely matters at launch. `[JUDGEMENT]`
- Keep Cloudflare's built-in analytics as the free all-traffic baseline (it sees bots — useful given the 57.5%-automated-traffic thesis in `ARCHITECTURE_IDEAS.md` Part 3), and never reconcile it against Plausible as if they measured the same thing (`PROJECT_STATE.md`'s hard-won lesson).

Not GA4: cookie banner, consent-mode complexity, and the predecessor demonstrated it goes unanswered in a crisis anyway.

---

## 8. Email/newsletter: Resend, subscriber list in our own Postgres

**Recommendation: keep Resend — but only its transactional/batch API. The subscriber list, city segmentation, consent records, and send ledger live in our Postgres**, exactly as the predecessor's `NEWSLETTER_PLAN.md` already designed and partially shipped (double opt-in, batch sends ≤100 with idempotency keys, webhook-driven suppression, DKIM/DMARC on a `mail.` subdomain). That work survives the rewrite nearly intact — port it, don't redesign it.

- **Do not use Resend Audiences/Broadcasts:** marketing pricing bills on stored contacts (~$40/month for 5,000 contacts `[REPORTED — https://resend.com/pricing via secondary sources, checked 2026-08-27]`). City segmentation is one SQL `where` clause on our own table; paying per-contact for a worse version of a query we already own is the wrong shape.
- Cost: free tier 3,000 emails/month, 100/day `[REPORTED, same sources]` — covers launch (the 100/day cap is the binding constraint; batch city sends spread across days until Pro). **$20/month Pro (50k emails)** the month the list outgrows it. React-email templates — AI-fluent, already in use.
- Alternatives named: Listmonk (free, excellent, self-hosted — fails constraint 1: it comes with a VPS and an ops duty); Brevo (free 300/day — clunkier API, heavier product). Resend is already integrated, already DPA'd in the privacy policy work, and its API is the one AI writes without documentation open.

---

## 9. Images: originals in R2, optimised at build time, served as free static assets

Real photography from market visits — hundreds of images at launch, low thousands over time.

- **Storage:** Cloudflare R2. Free: 10GB storage, zero egress, generous operation quotas; then $0.015/GB/month `[VERIFIED — https://developers.cloudflare.com/r2/pricing/ figures via search, and consistent with the Workers pricing page's zero-egress posture, checked 2026-08-27]`. Originals uploaded full-resolution; R2 is the archive of record.
- **Optimisation:** Astro's built-in image pipeline at build time — responsive AVIF/WebP variants with **explicit width/height emitted into the HTML** (the CLS guard is the default output, and CI Check 3 enforces it). The variants land in `dist/` and are served as static assets: **free, unlimited, no per-request transformation cost, no runtime image service to misconfigure.**
- **Escape hatch, pre-decided:** when the photo library is large enough that build-time transforms measurably slow the build (thousands of images), switch `image.service` to Cloudflare Image Transformations — 5,000 unique transformations/month free, then $0.50/1,000 `[REPORTED — https://developers.cloudflare.com/images/pricing, checked 2026-08-27]`. One config change, not an architecture change.
- Cost at launch: **$0.** At scale: single-digit dollars.

---

## 10. What NOT to use

| Tempting choice | Why it's wrong here |
|---|---|
| **Next.js on Vercel** (the incumbent) | Re-couples the product to the two cost mechanisms that burned v1 (billable middleware invocations, egress) and the two bug classes that hurt its SEO (multi-layer cache staleness, Suspense CLS). Peak AI familiarity doesn't compensate for a framework whose sharpest edges are exactly where AI is most confidently wrong. |
| **A headless CMS** (Sanity, Contentful, Strapi, Payload) | The database *is* the CMS; content is structured data with provenance, edited through the approval flow. A CMS adds a second source of truth, a second permission model, and $0–300/month for a worse version of the `facts` table. |
| **Workflow/agent infrastructure** (Temporal, Airflow, n8n, LangChain/LangGraph) | Four loops at 0.1 events/sec. Cron + Postgres + plain scripts is the whole requirement; everything else is an operational dependency a solo non-technical founder has to keep alive. |
| **Search infrastructure** (Algolia, Typesense, Meilisearch, Elasticsearch) | The query surface is filters over ~10⁴ rows — Postgres with two indexes. Full-text search is not a launch feature; if it ever is, Postgres `tsvector` first. |
| **Cloudflare D1/KV as primary store** | No PostGIS, weak relational model for the ledger. KV is fine later as a cache, never as truth. |
| **An ORM with its own migration religion** (Prisma) | Adds a schema DSL and a query dialect between AI and the database it knows best. Use `supabase-js` at runtime and plain SQL migrations (`supabase migration`); if typed query-building is wanted, Drizzle — it stays close to SQL. `[JUDGEMENT — Prisma works; it's the wrong default for an AI-maintained solo codebase]` |
| **Kubernetes, Docker-compose stacks, microservices, monorepo tooling (Nx/Turborepo)** | One repo, one Astro app, one Worker, some Actions scripts. Every piece of coordination machinery is surface area for the only engineer (an AI) to get lost in. |
| **Self-hosting the boring parts** (Listmonk, Plausible CE, Umami self-host) on a VPS | Saves ~$29/month, costs an unpaid sysadmin job held by someone who can't debug it at 2am. The managed tiers are the constraint-1 tax, and it's cheap. |
| **A locale matrix at launch** | Not a tool, but the stack must not invite it: one locale in `*_i18n` until a second has content. Four locales × unbounded pages is the named killer (`COLLAPSE_CAUSE.md` §6.1). |

---

## The recommended stack, one line each

| Component | Choice | One-line justification |
|---|---|---|
| Language | **TypeScript strict + Zod at boundaries** | Strong types are the code review the solo founder can't do. |
| Framework | **Astro 5, static output, Preact islands** | The predecessor's two SEO bug classes are structurally impossible in static HTML, and SSG makes the CI gates cheap and honest. |
| Hosting | **Cloudflare Workers** (deploy via `wrangler` from GitHub Actions) | Static requests free and unlimited, zero egress fees — v1's two cost failure modes cannot recur. $0→$5/mo. |
| Database | **Supabase Postgres + PostGIS** (unchanged) | The most AI-fluent database, radius search solved by one indexed function, free tier covers the pilot. Don't change this. |
| Dates | **Concrete occurrence rows; RRULE stored as a 120-day-capped generator** | Rows serve the queries people actually type; the rule powers freshness and the reliability ledger; the cap is the collapse lesson as a constant. |
| AI loops | **GitHub Actions cron + Claude API + Postgres `proposals` queue + Cloudflare-Access admin page + Telegram alerts** | Proportionate to one human approver; nothing publishes without a row flipping to approved. |
| CI | **GitHub Actions: route allowlist, ≤2.0 URL-to-entity ratio, per-type content floors, JSON-LD validation, horizon check — deploy ordered after** | ~300 lines that would have caught v1's death months early. |
| Analytics | **Plausible EU ($9/mo) + GSC API, both pulled into Postgres weekly** | Cookie-banner-free from commit one, and the decay question becomes a SQL query we own. |
| Email | **Resend batch API; list, consent and segments in our Postgres** | Free at launch, $20/mo at scale; city segmentation is a `where` clause, not a per-contact fee. |
| Images | **R2 originals + Astro build-time optimisation, served static** | $0, zero egress, explicit dimensions emitted by default. |

### Realistic monthly cost at launch

| Item | Cost |
|---|---|
| Cloudflare (free plan; $5 optional headroom) | $0–5 |
| Supabase free tier | $0 |
| Plausible Starter | $9 |
| Resend free tier | $0 |
| R2 + images | $0 |
| GitHub (private repo, Actions free tier) | $0 |
| Claude API (loops, pilot scale) | $10–30 |
| Domain (fynda.market, amortised) | ~$3 |
| **Total** | **≈ $25–45/month** |

At 1M monthly pageviews: Cloudflare ~$5–10, Supabase Pro $25, Plausible ~$69, Resend $20, loops ~$30 → **≈ $150/month**, scaling with traffic and nothing else. No single line item can surprise-10× without a config change that CI and spend caps sit in front of.

### The three trades this stack makes, restated honestly

1. **Astro over Next.js trades peak AI familiarity for a smaller surface of things AI can get subtly wrong.** If the product pivots to a heavy authenticated app, this gets revisited — via a subdomain app, not a rewrite.
2. **Cloudflare over Vercel trades developer-experience polish for a cost model with no ambush geometry.** Some npm packages won't run in the Worker; the design keeps the Worker surface tiny so it rarely matters.
3. **Managed services (Plausible, Resend, Supabase) over self-hosting trades ~$35/month for zero ops.** For a solo non-technical founder that is the cheapest money in the whole budget.

---

owner: Delfim
last_reviewed: 2026-08-27
status: recommendation — argue with the trades, then build Phase 1 on it
