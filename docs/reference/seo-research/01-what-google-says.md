# What Google (and Bing) actually say — applied to fynda.market

Research agent, 2026-09-18. Every Google page read that day from developers.google.com/search/docs (**G** below). Bing guidelines read rendered in a browser (no date shown). Quotes are exact and short; the "Applied" paragraph is the agent's reading for a directory with town, canton and market pages.

## 1. Title links — G/appearance/title-link (updated 2025-12-10)

No length limit: titles are "truncated in Google Search results as needed, typically to fit the device width." Google rewrites when a title is half-empty, has an **obsolete date** (its example: a stale "2020" replaced by the page's "2021"), is inaccurate, is "micro-boilerplate" repeated across pages, has no clear main heading, or is in the wrong language. It reads "Heading elements, such as `<h1>`"; make the main title "the first visible `<h1>` element." "Brand your titles concisely" at start or end with a hyphen/colon/pipe; Google may "omit the site name from the title link, if it's repetitive with the site name that's already shown." Avoid text "that varies by only a single piece of information" and stuffing like "Foobar, foo bar, foobars".

**Applied:** Hundreds of titles differing only by town name is the exact pattern Google names; add one real fact per page (next date, count). A year in the title is fine only while the page visibly shows dates in that year. H1 text = title text.

## 2. Snippets — G/appearance/snippet (2026-04-20)

Google builds snippets from page content but "sometimes uses the meta description HTML element if it might give users a more accurate description of the page." No length limit. "Create unique descriptions for each page… Identical or similar descriptions on every page of a site aren't helpful." For data-driven sites, "programmatic generation of the descriptions can be appropriate and are encouraged. Good descriptions are human-readable and diverse." Not keyword lists. Controls: `nosnippet`, `max-snippet:[n]`, `data-nosnippet`.

**Applied:** Generate from data: next date, venue, count, radius. A template with no data slots is the "identical or similar" case. Never use `nosnippet` (see 12).

## 3. Site names — G/appearance/site-names (2025-12-10)

Automated from the home page. "To indicate your site name preference, add WebSite structured data to your home page"; also `og:site_name`, `<title>`, headings. "The WebSite structured data must be on the home page… the domain or subdomain level root URI." "Google Search does not support site names at the subdirectory level." `alternateName` accepted.

**Applied:** One name for all locales. The `WebSite` markup must be reachable at `https://fynda.market/`; if the root only redirects, Google follows the redirect to what it then treats as the home page — so the root must not be a `noindex` meta-refresh page.

## 4. Duplicates, canonicals, aggregation — G/crawling-indexing/consolidate-duplicate-urls (2026-07-10); G/essentials/spam-policies (2026-08-28)

Redirects are "a strong signal"; `rel="canonical"` "a strong signal"; sitemap inclusion "a weak signal". "Do include a rel="canonical" link on the canonical page itself"; absolute URLs; with hreflang "specify a canonical page in the same language"; "Don't use the robots.txt file for canonicalization"; "We don't recommend using noindex to prevent selection of a canonical page." Spam: "Doorway abuse is when sites or pages are created to rank for specific, similar search queries," including "pages targeted at specific regions or cities that funnel users" and "substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy." "Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings," including "stitching or combining content from different web pages without adding value."

**Applied:** A canton page that is only the union of its town lists is the "substantially similar… closer to search results" case. It earns its URL by doing what no town page does: canton-wide weekend calendar, its own count, towns as browse layer. Test: if two pages would get the same templated title and description, one shouldn't exist. Every page self-canonicals within its own locale.

## 5. Sitemaps — G/crawling-indexing/sitemaps/build-sitemap (2026-07-08); /overview (2025-12-10); /image-sitemaps (2025-12-10)

"50MB (uncompressed) or 50,000 URLs" per file. "Google uses the `<lastmod>` value if it's consistently and verifiably accurate"; a significant update is "to the main content, the structured data, or links… an update to the copyright date is not." "Google ignores `<priority>` and `<changefreq>`." Absolute URLs, UTF-8, "the canonical URLs." Image sitemap: `<image:image>` + `<image:loc>`, up to 1,000 per URL.

**Applied:** Only 200, indexable, canonical URLs — no redirects, no noindex. `lastmod` = last real data change per page, never the nightly build time; stamping every URL nightly is "not verifiably accurate" and Google discards it site-wide. `<image:loc>` per market photo is one line each.

## 6. noindex, 404, soft 404 — G/crawling-indexing/block-indexing (2025-12-10); G/crawling-indexing/http-network-errors (2026-02-04)

noindex: Google "will drop that page entirely… regardless of whether other sites link to it"; it "must not be blocked by a robots.txt file." 4xx: Google "doesn't index URLs that return a 4xx status code." Soft 404: "If the content suggests an error… an empty page or an error message, Search Console will show a soft 404 error." 301/308 = "strong signal"; 302/307 = "weak signal". Custom 404 pages aren't discussed; only the status code matters.

**Applied:** A town page rendering "No markets found" with status 200 is a soft 404 — the content floor prevents it. Noindexed pages stay out of the sitemap.

## 7. hreflang — G/specialty/international/localized-versions (2025-12-22)

HTML link, HTTP header, or sitemap — "equivalent from Google's perspective." "Each language version must list itself as well as all other language versions"; "If two pages don't both point to each other, the tags will be ignored." Language ISO 639-1, optional region (`de-CH` valid); "You can't specify the country code by itself." `x-default` "is used when no other language/region matches the user's browser setting."

**Applied:** `de-CH`, `fr-CH`, `it-CH`, `en`, plus `x-default`. Choosing `de-CH` now means `de-DE` slots in cleanly for Germany. `x-default` is the page for someone who matches none of the four — by the house rule (English stands in where one language must stand for all), that is the English page.

## 8. Event structured data — G/appearance/structured-data/event (2026-09-08)

Rich result available in "Australia, Brazil, Canada, Germany, India, Latin America, Spain, United Kingdom, and United States" — Germany yes, Switzerland no. "Each event MUST have a unique URL (a leaf page)"; "only supports pages that focus on a single event… instead of pages that list schedules or multiple events." Required: `name`, `startDate` (ISO 8601 with offset), `location` with `name` and `address`. Recommended: `endDate`, `eventStatus`, `description`, `image` (≥720px), `offers`, `organizer`. `eventStatus`: EventScheduled, EventCancelled, EventPostponed, EventRescheduled. Don't mark up "business hours as events."

**Applied:** No rich result in Switzerland today; Germany from November. Market pages only. The one-Event-per-page rule in `ARCHITECTURE.md` and guardrail 6 stays; revisit "one Event per date" only with a German page in hand.

## 9. Breadcrumbs — G/appearance/structured-data/breadcrumb (2026-09-08)

`BreadcrumbList` → `ListItem` with `position`, `name`, `item` (URL; optional on the last item). "Breadcrumbs that represent a typical user path to a page, instead of mirroring the URL structure." Minimum two items.

## 10. Dates — G/appearance/publication-dates (2025-12-10)

"Google doesn't depend on a single date factor." Show a visible, labelled date ("Published", "Updated") and matching `datePublished`/`dateModified`; "Don't specify future dates, or the date of the action described on the page"; minimize other dates.

**Applied:** No "Updated: today" from the nightly build (helpful-content flags "changing the date of pages to make them seem fresh"). `dateModified` only on a real edit.

## 11. Helpful content — G/fundamentals/creating-helpful-content (2025-12-10)

Verbatim questions: "Does the content provide original information, reporting, research, or analysis?" "Does your site have a primary purpose or focus?" "Are you producing lots of content on many different topics in hopes that some of it might perform well…?" "Are you using extensive automation to produce content on many topics?" "Does your content leave readers feeling like they need to search again…?" "Are you changing the date of pages to make them seem fresh…?"

**Applied:** Organiser-verified dates, hours and photos are the "original information". The "search again" test is the page floor. A page minted to fill a URL pattern fails every question — that was v1.

## 12. AI features — G/appearance/ai-features (2025-12-10)

"A page must be indexed" and "eligible to be shown… with a snippet." "You don't need to create new machine readable files, AI text files, or markup." Ensure "structured data matches the visible text." "Sites appearing in AI features are included in the overall search traffic in Search Console."

**Applied:** Nothing to build; no llms.txt. No snippet-limiting tags anywhere.

## 13. Bing — bing.com/webmasters/help/webmaster-guidelines-30fba23a; indexnow.org/documentation

The guidelines cover "Bing search experiences, Copilot, and grounding API results." Sitemaps: "List only canonical URLs… Remove deleted or redirected URLs promptly… Include freshness signals (such as lastmod)." "Use redirects instead of canonical tags." "NOARCHIVE prevents content from being used in Copilot responses"; "NOCACHE limits Copilot to using only the URL, title, and snippet." Content: "Surface Key information early"; "Define Entities Clearly." "Missing, duplicate, or overly short title tags and meta descriptions may reduce… eligibility for grounding." Abuse list adds "Automatically Generated Content at Scale."

IndexNow: key 8–128 chars `[a-zA-Z0-9-]`, hosted at `https://fynda.market/{key}.txt`. `POST` JSON `{host, key, keyLocation, urlList}` to `api.indexnow.org/indexnow`, "up to 10,000 URLs per POST." One submission is "shared across all IndexNow-enabled search engines" (Bing, Yandex, Naver, Seznam, Yep; Google absent). "Not designed for submitting every URL on your site at once"; submit 404/410 and redirected URLs too.

**Applied:** After the nightly build, POST only the URLs whose content changed, appeared, or died. Each market page states its entity in the first sentence. No noarchive/nocache.

## Checklist

- **Titles**: descriptive, concise; H1 first and matching; no titles differing by one word; no keyword lists; a year only while the page shows that year's dates.
- **Snippets**: unique, data-filled description per page; programmatic is fine; no `nosnippet`/`max-snippet`.
- **Site name**: `WebSite` JSON-LD on the home page Google reaches from the root.
- **Canonicals**: self-referencing, absolute, same-locale.
- **Spam**: no page that is a subset/union of another without its own value.
- **Sitemaps**: canonical 200 URLs only; `lastmod` = real change; `<image:loc>` per market.
- **Status codes**: empty page = 404, never 200; 301 for moved addresses; noindex pages out of the sitemap.
- **hreflang**: self + all siblings; bidirectional; `x-default` = the language that stands for all.
- **Event**: market pages only; `name`/`startDate` with offset/`location.name`+`address`; `eventStatus`.
- **Breadcrumb**: country › canton › town; matches the visible trail.
- **Dates**: no build-time "Updated"; `dateModified` only on real edits.
- **AI features**: indexed + snippet-eligible is all; structured data = visible text.
- **Bing**: 301 not 302; 404 on delete; no noarchive/nocache; entity named in the first sentence.
- **IndexNow**: key file at root; POST changed URLs nightly; include deleted/redirected; never resubmit unchanged.
