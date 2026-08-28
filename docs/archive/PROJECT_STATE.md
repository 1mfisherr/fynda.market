# FleaFind — Project State

Last updated: 2026-08-05

This document is a current operational snapshot, not a build diary. Production data and deployed behavior take precedence over checked-in generated files and older documentation.

## Current production scale

As of 2026-08-05:

- 157 active public schedule rows.
- 151 canonical market hubs after `market_group ?? slug` grouping.
- 1,818 approved public occurrence rows in the active-only `public_market_dates` projection.
- 628 market locale rows: exactly four per active market.
- 26 municipalities, 1 region, 10 Zürich-region memberships and 16 city-guide records.
- Every active public market has coordinates, an image, structured address fields and a valid `verified_by` value.
- Every active market has an internal source URL; 149 expose a public `website_url`.

The homepage's “142 markets” number is a narrower display statistic for verified canonical markets within the registry-city scope. It is not the total production inventory. Use the explicit definitions above in operational reporting.

The base `market_dates` table retains 2,235 rows, including 417 historical/future rows belonging to four permanently closed Tunnel schedules. The public catalogue correctly reads the active-only projection and excludes those schedules.

## Public catalogue and data boundary

Supabase is the canonical write database. Public pages read a versioned deploy-time catalogue generated from the privileged `public_markets` projection plus approved public occurrences, locales, city guides and geography.

`src/lib/supabase/queries.ts` and `src/lib/supabase/geography.ts` remain the public data-access layer. Public page renders make no direct Supabase reads. Temporal routes resolve against the Zurich clock at request time; static public data remains fixed for the lifetime of a deployment.

The 2026-08-05 production search index is current and CDN-cached. Anonymous production access succeeds only for approved public projections; base/private tables reject anonymous access.

Local state is not currently a production mirror:

- The checked-in `src/generated/public-catalogue.json` was generated 2026-08-01 and still reports 161 public rows, 152 hubs and 2,236 occurrences.
- Local Supabase is currently empty and seeding is disabled.
- `scripts/data/markets/` is not a complete recovery mirror of production.
- The catalogue generator correctly aborts on an empty source, so this drift does not silently publish an empty catalogue.

Always verify the configured database before trusting a local catalogue or local rendered result.

## SEO and organic-search baseline

Source exports: `docs/GSCdata/05.08.2-26 - 28 days/` and `docs/GSCdata/05.08.26 - 90 days/`.

### Last 28 days: 2026-07-07 through 2026-08-03

- 1,878 Google Search clicks.
- 46,996 impressions.
- 4.00% CTR.
- Weighted average position 8.45.

### Prior 28 days: 2026-06-09 through 2026-07-06

- 935 clicks.
- 30,478 impressions.
- 3.07% CTR.
- Weighted average position 9.30.

Recent versus prior 28 days:

- Clicks: +101%.
- Impressions: +54%.
- CTR: +0.93 percentage points.
- Weighted average position improved by 0.85.

The increase is real, but the export alone cannot separate product/SEO gains from July seasonality.

The last-three-month export covers 92 days, 2026-05-04 through 2026-08-03:

- 3,982 clicks.
- 115,035 impressions.
- 3.46% CTR.
- Weighted average position 8.82.

### What is producing search traffic

Within the 1,000-row page export for the last 28 days:

- Place hubs: 493 clicks.
- Place temporal pages: 471 clicks.
- Market hubs: 435 clicks.
- Occurrence pages: 333 clicks.
- National temporal pages: 140 clicks.
- Homepage/country/other pages: 39 clicks.

About half of page-dimension clicks therefore come from place and place-temporal pages, while roughly 40% come from market and occurrence entities. No single page family is carrying the site.

The visible top-1,000 query export contains no FleaFind brand query. Discovery is overwhelmingly non-branded. Exact-date queries account for 183 visible clicks at a 16.62% CTR, strongly validating date-specific inventory as an acquisition moat. Query exports omit anonymised/low-volume queries, so query-category percentages apply only to visible rows.

### Geography Gate A conclusion

The Zürich pilot has passed its acquisition-safety gate:

- The direct Zürich regional hubs produced 201 clicks and 5,262 impressions in the latest 28 days.
- The German regional hub alone produced 184 clicks and 4,503 impressions at 4.09% CTR.
- Recent regional-hub daily clicks and impressions are materially above the earlier part of the 92-day export.
- The overall site grew rather than showing a geography-related collapse.
- Live route, canonical, hreflang, JSON-LD and sitemap checks are healthy.

The supplied performance export cannot fully prove Page Indexing/crawl status. Eight of the ten Zürich member municipalities appear in the last-28 page export; Adliswil and Rafz may simply fall below its 1,000-row limit. Run one manual GSC Page Indexing/URL Inspection check before the first new-region release.

Gate A no longer blocks all geography work. Roll out one region at a time rather than all five together. Current demand makes Basel the strongest next pilot: Basel place pages generated 207 clicks in the recent export, including 153 clicks from temporal pages. Luzern, Bern and Lausanne also show meaningful demand.

## Live sitemap and rendering

The production sitemap currently contains 2,780 URLs, exactly 695 per locale:

- 604 market-hub URLs: 151 canonical hubs × 4 locales.
- 1,540 occurrence URLs: 385 eligible occurrences in the 90-day sitemap horizon × 4 locales.
- 104 place-hub URLs: 26 × 4 locales.
- Complete locale alternates plus `x-default` on every entry.

Sampled home, country, regional, municipality, weekend, market, occurrence and `/submit` pages return server-rendered canonicals, complete hreflang and head-rendered JSON-LD.

## Traffic measurement

### Vercel Analytics, latest 30 days supplied 2026-08-05

- 4,791 visitors.
- 10,608 page views.
- 63% bounce rate.
- Switzerland: 62% of visitors.
- China: 8% and falling after Cloudflare controls.
- Google supplied about 2,000 referred visitors; DuckDuckGo 266, Bing 194, Ecosia 147 and ChatGPT 21.

Use this as a broad all-channel edge-traffic baseline, not an exact human-user count. Vercel's number includes traffic that browser analytics and consented tools do not observe.

### GA4, 2026-07-08 through 2026-08-04

- 522 active users.
- 499 new users.
- 2,793 recorded views.
- 454 Google-organic sessions.

GA4 loads only after analytics-cookie opt-in. Its low count is therefore expected to undercount all visitors and is not, by itself, evidence that the tag is broken. The 454 Google sessions are about 24% of GSC's 1,878 clicks, which is plausible for a consented subset. Verify the acceptance/firing path, but do not use GA4 as FleaFind's total-audience counter.

GSC clicks, Vercel visitors, GA4 users and first-party events are different units and should not be reconciled as if they were the same metric.

### First-party analytics

Phase 1 is deployed and collecting. Metabase is connected and working. At the 2026-08-05 audit point, the collector held 549 events over roughly 42 hours, including all eight event types and 384 page views.

This proves the pipeline, not user behavior. The dataset is too young and potentially test-contaminated for product decisions. Current validation work is event parity, bot/internal filtering, provider-webhook evidence and a compact weekly decision report.

Open governance decision: the deployed client creates a 13-month `ff_aid` for every tracked visitor, while the approved analytics plan described persistent identity only after consent or newsletter interaction. Privacy text does not yet describe the deployed first-party persistent identifier. Do not silently rewrite history to bless the deviation; choose either the documented two-tier model or an explicitly disclosed persistent-everyone model.

## Catalogue trust and Market Watch

Production currently has 39 active market rows with no future occurrence. Only 109 markets have an occurrence in the next 90 days.

Record-level verifier attribution is complete, but freshness is not:

- 43 of 157 market records have `last_verified_at` within 90 days.
- Of 386 occurrence rows in the next 90 days, 320 were verified within 90 days and 24 have no `verified_at`.

Market Watch v1 was a useful manual prompt prototype, not an operational freshness system. Its embedded list is incomplete and stale. `docs/current/market-watch.md` now defines Market Watch v2: a source registry, parity-checked preparation runner, risk-based weekly Codex task, complete audit ledger and human approval gate.

The scheduled task must remain proposal-only and must not receive service-role or deployment credentials. Market Watch v2 is not “live” until the runner exists and two supervised scheduled runs complete without silent omissions.

## Newsletter

The full newsletter pipeline is implemented: single opt-in, subscriber storage, campaign generation, previews, cron build/send, suppression, Resend webhook handling and admin views. New signups become subscribed immediately; no confirmation email is sent. The legacy confirmation route remains available for links sent before the 2026-08-23 change.

Production evidence as of 2026-08-23:

- 12 subscriber rows before the single-opt-in change: 5 confirmed, 6 pending, 1 unsubscribed. The six pending rows were moved to confirmed without sending an email, leaving 11 subscribed and 1 unsubscribed.
- One campaign sent for 2026-07-31 through 2026-08-02.
- 3/3 send rows have provider message IDs; zero send failures.
- Resend reported all 14 recent confirmation messages as delivered. Inbox tab placement is not visible to Resend.

The send path is real. Gmail inbox-versus-Promotions placement and the full webhook lifecycle remain unproven. The mark-before-send crash gap remains a documented reliability tradeoff.

## Reports, organiser contact and missing-market intake

Market and occurrence pages store corrections in `reports`. Organiser contacts use `organiser_requests`. `/submit` searches existing listings first; missing markets are stored in `market_suggestions`, not sent through mailto.

All three new-row paths feed the Vault-backed `submission-alert` Edge Function and the admin reports view.

Production usage at the audit point:

- 9 reports, all resolved.
- 1 organiser request, resolved.
- 0 market suggestions.

The workflows function, but adoption is not yet proven at scale.

## Geography and content state

All 17 registry cities resolve through the surviving Regional or Municipality hub paths. The old `CityHubTemplate` is gone.

Regional rendering is still Zürich-specific in application code. Any additional region requires deliberate membership approval, route/canonical/sitemap verification and one-at-a-time observation.

Sixteen localized city-guide records, the 17 registry guide paragraphs and admin short-description fields remain unused by public pages. Do not create a standalone prose-revival phase; reuse them only when a chosen geography, data-authority or structured-depth phase needs them.

## Design state

The design system and main public surfaces are structurally sound. Detail-level UI polish is deliberately parked while Delfim focuses on autonomous, clear-finish phases. Do not restore homepage polish or CSS consolidation as an immediate roadmap priority unless Delfim reopens that work.

## Current open issues

### URL lifecycle

- The old Tunnel group URL redirects correctly, but 16 localized weekday-member URLs now return 404 after the four schedules were retired.
- The old high-traffic Winterthur Altstadt hub slug, `/markt/floh-troedlermarkt-winterthur-altstadt`, now returns 404 instead of redirecting to `/markt/flohmarkt-winterthur-altstadt`. Its old occurrence URLs render a noindex 404 fallback through an HTTP 200 streaming response. The old hub received 53 clicks and 3,064 impressions in the three-month GSC export.

Treat these as defects, not a strategy phase. Any fix must check hub and occurrence redirects, canonicals and sitemap together.

### Measurement and reliability

- Resolve the first-party analytics identity/privacy mismatch.
- Verify newsletter provider events end to end.
- Prove Sentry browser and server capture with deliberate events; code/configuration alone is insufficient.
- Establish a trusted weekly first-party/GSC/Metabase report after enough observation data exists.

### Operational recovery

- Restore a dependable local bootstrap or safe production-snapshot workflow.
- Stop treating the checked-in catalogue or intake directory as complete production recovery sources.

## Current recommended sequence

1. Build and supervise Market Watch v2.
2. In parallel, finish analytics/newsletter validation and fix the small URL/privacy integrity defects.
3. After Market Watch v2 is stable, choose one leverage phase. Based on current GSC demand, a single Basel regional pilot is now admissible; ROADMAP.md records the full menu, including bounded search work, retention, distribution, organiser maintenance, recovery and proposal-only coverage/demand loops.

See `ROADMAP.md` for the phase-level plan.
