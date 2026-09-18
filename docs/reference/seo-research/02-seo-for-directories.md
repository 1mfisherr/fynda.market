# SEO for fynda.market's page types — best practice and studies, September 2026

Research agent, 2026-09-18. Every claim tied to a page the agent fetched. Google Search Central first, then 2025–2026 studies (Zyppy, Backlinko, AWR, Sistrix, SEJ). Evidence marked thin where it is.

## 1. Spam, doorways and directories

**Spam policies** (updated 2026-08-28): *Scaled content abuse* is "many pages generated for the primary purpose of manipulating search rankings and not helping users"; examples include "scraping feeds, search results, or other content to generate many pages (including through automated transformations like synonymizing, translating, or other obfuscation techniques), where little value is provided to users." *Doorway abuse* is pages "created to rank for specific, similar search queries" that "lead users to intermediate pages that aren't as useful as the final destination." — https://developers.google.com/search/docs/essentials/spam-policies

**Helpful-content self-assessment** (2025-12-10) asks the questions that sank v1: "Are you producing lots of content on many different topics in hopes that some of it might perform well?", "Are you using extensive automation to produce content?", "Does the content provide substantial value when compared to other pages in search results?" — https://developers.google.com/search/docs/fundamentals/creating-helpful-content

**Google's doorway test (2015, still the clearest)**: are pages "an integral part of your site's user experience" or a funnel; do they "duplicate useful aggregations of items (locations, products, etc.) that already exist on the site"; do they "exist as an 'island'." — https://www.seroundtable.com/google-doorway-pages-algorithm-guidelines-updated-20004.html. Mueller on 1,300 "keyword + city" pages: "That sounds like doorway pages." — https://www.seroundtable.com/google-city-landing-pages-doorway-pages-28670.html

**March 2026 core update** shifted visibility "away from aggregators"; Lily Ray/Amsive on Sistrix data: "the company that owns the thing" beat "the platform people use to talk about the thing" (TripAdvisor −45, Yelp −33 visibility points). US, domain-level; local directories not analysed separately. — https://www.searchenginejournal.com/googles-march-core-update-shifted-visibility-away-from-aggregators/573621/

**For 157 markets / 56 cities**: city pages pass the 2015 test as long as each has a real list that exists nowhere else on the site with the same content, is linked from canton/home, and the canton page is not a second copy of the same list ("duplicate aggregations"). The risk is not 56 cities; it is two page types that show the same markets with a different heading.

## 2. Titles and descriptions

Google: no length limit, "truncated … to fit the device width"; "avoid repeated or boilerplate text"; Google replaces titles for half-empty text, **"obsolete dates not matching visible page content"**, boilerplate, and headings that disagree with the title. — https://developers.google.com/search/docs/appearance/title-link. Google shows the **site name separately** in results (from `WebSite` markup on the home page; not per subdirectory), so a "| brand" suffix is largely redundant. — https://developers.google.com/search/docs/appearance/site-names

Zyppy (80,959 titles): Google rewrote 61.6%; 51–60 characters had the lowest rewrite rate (39–42%); >70 characters 99.9%; pipes removed 41% vs dashes 19.7%; numbers survived 97.3% when the H1 also carried them. — https://zyppy.com/seo/google-title-rewrite-study/. Backlinko (4M results, Apr 2025): #1 = 27.6% CTR, top 3 = 54.4%, 40–60-character titles +8.9% CTR. — https://backlinko.com/google-ctr-stats. AWR Q1 2026: mobile position-1 CTR fell 2.2 pp quarter-on-quarter. — https://www.advancedwebranking.com/blog/ctr-google-2026-q1. No reputable study on "year in title" CTR — evidence thin; Google's rule: a year in the title must match visible page content or it gets rewritten.

Descriptions: Google uses the meta description when it "gives users a more accurate description … than content taken directly from the page"; unique per page; programmatic generation is fine if "human-readable, diverse"; page-specific facts. — https://developers.google.com/search/docs/appearance/snippet

## 3. Internal linking and structure

Google: "Every page you care about should have a link from at least one other page"; anchor text "descriptive, reasonably concise, and relevant"; "no magical ideal number of links." — https://developers.google.com/search/docs/crawling-indexing/links-crawlable. Breadcrumb markup still supported. Zyppy (23M links, Feb 2026, correlational): pages with 40–44 inbound internal links got ~4× the clicks of pages with 0–4; the effect reverses past ~45–50; anchor-text variety correlated strongly. — https://zyppy.com/seo/seo-study/

"Nearby cities" blocks: safe under the 2015 test when the target pages have their own content and the block is small and navigational; doorway-ish only when they exist to make thin pages reachable.

## 4. Freshness and dates

`lastmod` "should reflect the date and time of the last significant update"; Google uses it only "if it's consistently and verifiably … accurate"; `priority`/`changefreq` are ignored. — https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap. Mueller (Apr 2025) on stamping today's date everywhere: "It has no positive effect" and "makes it harder for search engines to spot truly updated pages." — https://www.searchenginejournal.com/googles-john-mueller-updating-xml-sitemap-dates-doesnt-help-seo/545547/. Visible dates: label them "Published"/"Last updated". — https://developers.google.com/search/docs/appearance/publication-dates

A nightly rebuild is neutral in itself; it hurts only if it bumps `lastmod`/`dateModified` on unchanged pages.

## 5. Multi-language

Each variant must list itself and all others; `x-default` is for users matching none of your languages. — https://developers.google.com/search/docs/specialty/international/localized-versions. One language per URL; Google reads visible text; don't redirect by guessed language; translating only boilerplate around identical content is flagged. — https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites. Machine translation: Google deleted its "block auto-translated pages" advice in June 2025; the test is quality per page. — https://www.searchenginejournal.com/google-removes-robots-txt-guidance-for-blocking-auto-translated-pages/548870/

## 6. Structured data

- **Event** (2026-09-08): "Each event MUST have a unique URL (a leaf page)"; "only supports pages that focus on a single event"; `name` must not contain the venue; `location` needs venue name + address. — https://developers.google.com/search/docs/appearance/structured-data/event
- **FAQPage**: rich result dropped 7 May 2026; leaving markup is harmless. — https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- **ItemList/carousel**: only Recipe, Course, Movie, Restaurant qualify — dead weight on city pages. — https://developers.google.com/search/docs/appearance/structured-data/carousel
- **LocalBusiness**: for business locations, not venues or events.
- **Organization + WebSite** on the home page: drives logo and site name. — https://developers.google.com/search/docs/appearance/structured-data/organization

## 7. Core Web Vitals

Thresholds: LCP 2.5 s, INP 200 ms, CLS 0.1. Google (Dec 2025): CWV "are used by our ranking systems", but relevance wins "even if the page experience is sub-par", and chasing perfect scores "may not be the best use of your time". At Lighthouse 97–99: done. — https://developers.google.com/search/docs/appearance/page-experience

## 8. Images

Descriptive file names, alt text "information-rich … in context of the page", images "near relevant text", real `<img>` not CSS backgrounds, image sitemap for URLs Google may miss. — https://developers.google.com/search/docs/appearance/google-images. No study on Google Images as a channel for "flohmarkt {city}" — thin.

## Top 10 actions, ranked by the agent

1. Make canton pages different from city pages — no repeated market list.
2. Titles 51–60 chars, dash not pipe, no brand suffix, year only where the page shows that year's dates; H1 repeats the title's numbers/year.
3. `WebSite` + `Organization` on the home page Google reaches, so results show "fynda.market" without eating title space.
4. Bump `lastmod`/`dateModified` only on real change.
5. One visible, labelled "Last checked" line per page and no competing dates.
6. Descriptions with page-specific facts.
7. No Event/ItemList on city pages; exactly one Event per market page with venue name + address.
8. Verify hreflang: self-reference, four-way return links, sensible `x-default`.
9. 10–40 inbound internal links per market page with varied anchors; "nearby" blocks kept to 3–6 real neighbours.
10. Photos named `{market-slug}-{city}`, plain-language alt, in the sitemap.

Not worth doing: FAQPage, LocalBusiness on markets, CWV work beyond what exists.
