# What to collect — research report, 2026-09-17

## 1. What mature tools capture automatically that the pipeline does not

| Signal | Who captures it | Worth it for a directory? | Privacy/consent cost |
|---|---|---|---|
| **Engagement time** (active tab time, sent on leave/tab-switch) | GA4 `engagement_time_msec`, Plausible, Matomo heartbeat | **Yes** — the only way to tell a bounce from a satisfied one-page visit. Directory visits are legitimately short; "read the market page then left" is success, not failure | None extra: a `page_leave{active_ms}` beacon keyed by the existing `page_view_id` needs no identifier |
| **Scroll depth** (max % on leave) | Plausible tracks 1–100 % on every page; PostHog on `$pageleave`; GA4 only fires at 90 % | **Yes**, on market and city pages: did they reach dates/directions/organiser box? | None; same beacon |
| **Web Vitals** LCP / INP / CLS | Cloudflare RUM beacon, PostHog, GA4 via web-vitals.js | **Moderate**: static Astro is already fast, but INP on filter interactions and CLS from photo loading matter for SEO. Cloudflare's own RUM **drops Swiss and EU visitors by design** (changelog 2025-02-25), so it is useless for fynda.market; self-collect with the `web-vitals` library via `sendBeacon` | None if sent as metric name, value, rating, path only |
| **Viewport / screen size** | All of them | Low-moderate; `device_class` covers 80 %. Add viewport width bucket to `page_view` props | None |
| **Browser language vs. site locale** | Matomo, GA4 (from Accept-Language) | **High** for a 4-locale site: the mismatch rate tells you if /de/ is catching French speakers, and whether the language switcher is found. Capture server-side from `Accept-Language` (first tag only) at the edge — no JS | Negligible; store primary tag only (`fr`, not the full header, which is a fingerprint vector) |
| **Connection quality** | Cloudflare `clientTcpRtt` | Low; RTT bucket is free at the edge | None |
| **Bounce / exit** definition | GA4: engaged session = >10 s, 2+ pages, or a conversion; Plausible: single-pageview visit | Define your own: a bounce on a market page with >15 s active or an outbound/calendar click is a *success* | None |
| **Rage clicks / dead clicks** | PostHog (3 clicks within 30 px and 1 s), Clarity | **Yes, cheaply**: emit `rage_click{selector}` and `dead_click{selector}`. Skip heatmaps | None if you store only a CSS selector, not coordinates |
| **Session replay** | Clarity, PostHog | **No**. Clarity mandates consent in EEA/UK/CH since 31 Oct 2025, needs input masking and a DPIA; the data would sit on Microsoft's servers | Consent required; high |
| **JS errors** | PostHog, Sentry | **Yes**, small: `window.onerror` → `js_error{message,file,line}` | None |
| **404s** | Plausible via a goal | **High**: 404s from old fleafind.ch URLs are lost traffic; add `page_view{status:404}` at the edge with `referrer_host` | None |
| **Form abandonment** | GA4 `form_start`/`form_submit` | Yes for newsletter: add `newsletter_form_start` (first focus) so abandonment is a ratio | None |
| **Section visibility** | none automatic | Better than scroll %: `IntersectionObserver` on named sections (`dates`, `map`, `organiser`, `nearby`) → `section_seen{section}` once per page view | None |

Sources: GA4 enhanced measurement (accs-net.com/glossary/enhanced-measurement), Plausible metrics and scroll-depth docs, PostHog autocapture docs, Clarity semantic metrics, Cloudflare RUM beacon docs and the 2025-02-25 changelog excluding the EU, DebugBear Core Web Vitals JS guide, FlowConsent on Clarity consent.

## 2. AI answer-engine traffic in 2025–2026

**Referrers to classify** as `traffic_class = ai_assistant` (the pipeline stores `referrer_host` and UTMs, so this is a classifier column, not new collection):

- `chatgpt.com`, `chat.openai.com` — ChatGPT also appends `utm_source=chatgpt.com` to links; match on either.
- `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`, `bing.com/chat`, `you.com`, `poe.com`, `meta.ai`, `deepseek.com`, `grok.com`, `x.ai`. GA4 added a native "AI Assistant" channel on 13 May 2026 covering ChatGPT, Gemini, DeepSeek, Copilot, Grok; it misses Perplexity. Share as of April 2026: ChatGPT 77 %, Gemini 9 %, Perplexity 8 %, Copilot 4 %, Claude 3 %.
- **Google AI Overviews / AI Mode cannot be separated by referrer**: links carry `noreferrer` or plain `google.com`, so they land in organic. The only source is Search Console's Generative AI report, worldwide since 31 Aug 2026, which gives impressions but no clicks or queries. Add its export to the existing CSV import.

**Crawlers — store, don't drop.** Three bot roles per vendor:

| Role | User agents | Meaning for fynda.market |
|---|---|---|
| Training | `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider`, `Applebot-Extended`, `meta-externalagent` | Your data entering models; evidence if you ever license it |
| Search index | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Amazonbot`, `DuckAssistBot` | Being citable in answer engines |
| User-triggered fetch | `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `Google-Agent`/`Gemini` fetches | **A human asked an AI about this market right now** — the closest thing to a real-time demand signal; belongs in the same dashboards as `page_view` |

Recommendation: a separate `crawler_hits` table (occurred_at, bot_name, bot_role, path, market_id, verified bool, asn, status) — never in `analytics_events`, so guardrail and funnel numbers stay clean. Verify identity by ASN or the published IP lists: `openai.com/gptbot.json`, `searchbot.json`, `chatgpt-user.json`; Anthropic publishes `claude.com/crawling/bots.json`. User agents alone are unreliable: one study found 991 spoofed for 468 genuine, and Cloudflare caught Perplexity crawling with a fake Chrome UA and rotating ASNs, delisting it as a verified bot (Aug 2025). Cloudflare's **AI Crawl Control** is free on all plans and shows per-crawler counts and robots.txt compliance, with categories Search / Agent / Training — use it as a cross-check, but own the raw rows.

Legal note: crawler rows contain no personal data, so they are the one dataset you can keep forever and sell without a consent question.

Sources: OpenAI bots doc (developers.openai.com/api/docs/bots), Anthropic crawler clarification (ppc.land), icoda AI-referrer regex, nicelookingdata on the GA4 AI channel, Search Engine Land on AI Mode being untrackable, CrawlRaven on the GSC Generative AI report, dev.to study of spoofed AI user agents, Cloudflare/Slashdot on Perplexity stealth crawling, Cloudflare AI Crawl Control and verified-bot-categories docs.

## 3. Domain signals for a local-events directory

What the comparables measure:

- **Google Business Profile**: unique daily views, direction requests, calls, website clicks, discovery vs. direct searches. Your equivalents: `outbound_click{click_type}` split into `directions`, `website`, `phone`, `social`. Directions is the strongest visit-intent signal a directory has — store it as its own click type.
- **Yelp** counts bookmarks, check-ins, calls and messages together as "customer leads". Do the same: a `leads` view over `market_save + calendar_add + directions + organiser_contact`, per market per week — the number you show organisers.
- **Eventbrite** reports last-touch traffic source per event and page visits excluding bots. You already have the columns; the missing piece is a per-market weekly rollup.
- **PredictHQ** sells "predicted attendance", "local rank" and event radius. Your data can feed a homemade version: page views + saves in the 14 days before a date, normalised by town population. That is the monetisable dataset.
- **Ticketing lead-time curves** ("bathtub": spike at announcement, quiet middle, final 2–3 day surge).

Signals to add or derive:

1. **Lead time**: on every market/date page view, store `days_until_next_date` (integer) in props. Computed at build time, costs nothing, yields the interest curve per market type and per canton.
2. **Weekend vs. weekday intent**: derive from `occurred_at` in the visitor's timezone — day-of-week × hour heatmap per locale.
3. **Geo intent**: `distance_km` bucket between visitor city (edge geo) and market coordinates, stored as a bucket (`<10`, `10–25`, `25–50`, `50+`), never raw coordinates. Answers "does anyone travel for this market" and "is the 25 km newsletter radius right".
4. **Repeat interest**: with the daily hash you get "same visitor, same market, same day"; cross-day repeats need the consent cookie. Report both, labelled.
5. **Search gap map**: `no_results{term}` grouped by locale and geo — the queue of towns and market types to add. Add whether the visitor then clicked (`market_click` after `search` within the same `page_view_id`).
6. **Date-page demand**: views per `(market_id, date)` vs. views of the market page — which date pages earn their existence (the v1 lesson, measured).

Sources: Google Business Profile performance help, Yelp business metrics, Eventbrite traffic and conversion report, PredictHQ predicted attendance docs, Tickts forecasting guide.

## 4. Free Cloudflare edge fields and their sensitivity

`request.cf` is populated on every Pages Function request. The Workers doc lists `city`, `region`, `regionCode`, `postalCode`, `latitude`, `longitude`, `timezone`, `continent`, `isEUCountry`, `asn`, `asOrganization`, `colo`, `httpProtocol`, `tlsVersion`, `tlsCipher`, `clientTcpRtt`, `clientAcceptEncoding` under "All plans have access to"; geolocation is confirmed free-tier. `botManagement.score`, `ja4`, `detectionIds` need the paid Bot Management add-on; `verifiedBotCategory` is reported to work on free Workers — log it once from a Function and read the row back before relying on it.

Sensitivity:

- **City / region / timezone / ASN / RTT / protocol / TLS**: pseudonymous personal data under GDPR when joined to a visitor hash (Breyer), but low-risk and within what audience measurement is expected to hold; store city/canton and ASN.
- **postalCode + latitude/longitude**: in a Swiss village, postcode + timestamp + UA singles out a person; store only a distance bucket. Keeping precise geo beside a hash turns pseudonymous rows into re-identifiable ones and weakens the "no personal data" line on the privacy page.
- **HMAC daily hash**: EDPB Guidelines 01/2025 treat keyed hashing as pseudonymisation, not anonymisation, so the raw rows are personal data until the key is destroyed; document the key deletion.
- **Swiss position**: FDPIC guidelines revised 6 Oct 2025 — the Telecommunications Act (Art. 45c) requires information and an opt-out; tracking cookies face strict requirements and in HÄRTING's reading need a banner in practice. The current design already meets that; for German visitors, the CNIL-style exemption (own-site, no cross-site, ≤25-month retention) is the model German DPAs also accept.
- `isEUCountry` is useful for consent gating and the Germany launch.

Sources: Cloudflare Workers Request docs, Cloudflare community on free-tier geolocation, XenForo thread on verifiedBotCategory, IAPP on Breyer, EDPB Guidelines 01/2025 on pseudonymisation, HÄRTING and MME on the FDPIC 2025 cookie guidelines, CNIL sheet 16.

## 5. The ten weekly questions a founder should answer

1. Visits, engaged visits (>15 s active or any intent event) and AI-assistant visits, by locale — trend vs. last week.
2. Which markets and towns got demand (views + leads) with no upcoming date — content to chase.
3. Top `no_results` terms by locale — gap map.
4. Lead-time curve: median `days_until_next_date` at view, this week vs. 4-week baseline.
5. Leads per market (save + calendar + directions + contact) — the top 20 and the zero list.
6. Share of visitors whose browser language ≠ page locale, and how many switched.
7. Page types by engagement: which date pages earn their place; which never got a human view in 30 days.
8. Search Console: query clusters gaining impressions but losing clicks; AI Overview impressions.
9. Crawler table: which AI bots fetched which markets, and `*-User` fetches (humans asking AI about a market).
10. Breakage: 404s by referrer, JS errors by page, rage/dead clicks by selector, INP p75 on filter pages.

## Ranked recommendations

1. **`page_leave` beacon** with `active_ms`, `max_scroll_pct`, sections seen, keyed by `page_view_id` — no identifier, no consent change.
2. **Crawler table**, separate from `analytics_events`, with bot role and ASN verification; stop dropping AI bots at the edge.
3. **AI-referrer classification** column and `utm_source=chatgpt.com` match, plus the Search Console Generative AI CSV.
4. **`days_until_next_date`** on every market/date view, and `outbound_click` split into `directions` / `website` / `phone`.
5. **Edge fields**: `Accept-Language` primary tag, `city`, `region`, `timezone`, `asn`, `clientTcpRtt` bucket, `isEUCountry`; distance bucket to market. Never postcode or lat/long.
6. **404 and JS-error events**, `newsletter_form_start`, `rage_click`/`dead_click` with selector only.
7. **Self-collected Web Vitals** (LCP/INP/CLS, path, rating) — Cloudflare's RUM excludes Switzerland.
8. **Weekly Metabase dashboard** answering the ten questions; per-market lead rollup becomes the organiser e-mail later.
9. **Retention policy** written down: raw rows 13 months, hash-linked geo columns nulled after 30 days, crawler rows indefinite.
10. **Do not add** session replay, heatmaps with coordinates, or any third-party script.
