# Being cited by AI answers — what is proven, what is plausible, September 2026

Research agent, 2026-09-18. Primary sources (Google, OpenAI, Anthropic, Perplexity, Microsoft) and 2025–2026 studies with real data. Honesty note at the end.

## 1. Google AI Overviews and AI Mode

**What Google says.** Both "may use a 'query fan-out' technique", draw from the normal index, and need "no additional requirements … nor other special optimizations". Structured data should "match the visible text"; the only controls are `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`. — https://developers.google.com/search/docs/appearance/ai-features. Google-Extended only governs Gemini training and "does not impact a site's inclusion in Google Search". — https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers

**Overlap with organic.** Ahrefs, July 2025, 1.9M citations: 76.1% of cited pages ranked top-10. — https://ahrefs.com/blog/search-rankings-ai-citations. Ahrefs' March 2026 re-run: 38% top-10, 31% at 11–100, 31% beyond 100. — https://www.searchenginejournal.com/google-ai-overview-citations-from-top-ranking-pages-drop-sharply/568637/. BrightEdge, Sept 2025: only 16.7% of citations from the top 10. — https://www.brightedge.com/resources/weekly-ai-search-insights/rank-overlap-after-16-months-of-aio. Ranking helps but is no longer the gate; matching the sub-query is.

**Trigger rates.** Ahrefs, 146M SERPs, Sept 2025: AIOs on 20.5% of SERPs; 57.9% of question queries, only **7.9% of local searches**. — https://ahrefs.com/blog/ai-overview-triggers/. Germany: SISTRIX, 100M keywords, Feb 2026: AIOs on ~20% of keywords, position-1 CTR falls 27% → 11%. — https://www.sistrix.de/news/ai-overviews-in-deutschland-so-stark-sinken-die-klickraten-wirklich/. **Switzerland: no Swiss-specific dataset exists.** Nothing measured flea-market or event queries.

**Local queries and AI Mode.** Profound, July 2026: google.com citations in AI Mode rose 8.4×, almost all Google Business Profile panels on local-intent queries. — https://www.tryprofound.com/blog/google-com-is-now-ai-mode-s-2-cited-domain

**Click effect of being cited.** Seer, 5.47M queries, Jan 2025–Feb 2026: on AIO queries, cited pages get 2.36% CTR vs 0.94% uncited, still 38% below no-AIO queries. — https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-2026-update

**Search Console.** The Generative AI performance report shows **impressions only** for AI Overviews and AI Mode, worldwide since 31 Aug 2026. — https://support.google.com/webmasters/answer/16984139

## 2. ChatGPT, Perplexity, Claude, Copilot

- **OpenAI**: OAI-SearchBot indexes for ChatGPT search; GPTBot is training; ChatGPT-User is a user-triggered fetch. Sites disallowing OAI-SearchBot "will not be shown in ChatGPT search answers". — https://developers.openai.com/api/docs/bots. ChatGPT runs its own index but still queries Google, Bing and others. — https://peec.ai/blog/chatgpt-built-its-own-search-index
- **Perplexity**: PerplexityBot "is designed to surface and link websites in search results", not training. — https://docs.perplexity.ai/guides/bots
- **Anthropic**: ClaudeBot (training), Claude-SearchBot (indexing), Claude-User (user fetch); blocking Claude-SearchBot "may reduce your site's visibility". — https://support.claude.com/en/articles/8896518
- **Copilot/Bing**: Bing's Feb 2026 guidelines define GEO as "content eligibility for grounding": facts "stated directly rather than implied", "entity names … clear and consistent", "essential information near the top". — https://www.searchenginejournal.com/bing-adds-geo-to-official-guidelines-expands-ai-abuse-definitions/568442/

**What correlates with citation.** Kevin Indig's ChatGPT study (18,012 citations): 44.2% come from the first 30% of a page; DATE and NUMBER entities are the strongest predictors; 78.4% of question-linked citations came from headings. — https://searchengineland.com/chatgpt-citations-content-study-469483. Ahrefs, 17M citations: AI-cited content is 25.7% fresher than organic. — https://ahrefs.com/blog/fresh-content. Only 2.37% of URLs are cited by all three of ChatGPT/Perplexity/AIO for the same prompt.

**Directory/local citation share.** Profound's 680M-citation dataset: Yelp 0.8%, TripAdvisor 0.6% on Perplexity only. — https://www.tryprofound.com/blog/ai-platform-citation-patterns. No study covers event listings.

## 3. Technical hygiene

- **robots.txt**: allow the retrieval bots (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Claude-User, ChatGPT-User, Googlebot, Bingbot). Training bots (GPTBot, ClaudeBot, Google-Extended, CCBot, Applebot-Extended) are separate switches; blocking training costs nothing in citations per the vendor docs.
- **llms.txt**: Mueller, June 2025: "no AI system currently uses llms.txt". — https://www.seroundtable.com/google-ai-llms-txt-39607.html. Ahrefs, 137k domains, May 2026: 97% of llms.txt files got zero requests; "no major LLM provider currently supports llms.txt". — https://ahrefs.com/blog/llmstxt-study/. Skip it.
- **Bing/IndexNow**: Bing's AI Performance report (Feb 2026) shows citations, cited pages and "grounding queries" for Copilot; IndexNow "keeps information fresh across search and AI experiences". — https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- **Rendering**: "none of the major AI crawlers currently render JavaScript"; ChatGPT spent 34.82% of fetches on 404s. — https://vercel.com/blog/the-rise-of-the-ai-crawler. Static HTML already satisfies this; the 301 guardrail matters.

## 4. Content patterns

The answer sentence, explicit dates/numbers and "last checked" line already match the strongest measured signals. `<details>` is fine because the text is in the HTML. No primary source shows any AI system reading Organization/sameAs or an About page — plausible entity hygiene, not evidence.

## 5. Measuring it

Referrers: chatgpt.com, gemini.google.com, perplexity.ai, claude.ai; missing referrers land in "direct", so AI traffic is "a floor … not a ceiling". — https://www.seerinteractive.com/insights/are-ai-sites-like-chatgpt-sending-your-website-traffic. ChatGPT adds `utm_source=chatgpt.com`. Cloudflare's crawl-to-refer ratio hit 70,900:1 for Anthropic in June 2025 — bot logs cannot tell you whether you were cited. — https://blog.cloudflare.com/ai-search-crawl-refer-ratio-on-radar/

## Ten actions, ranked by the agent

1. Explicit robots.txt allows for the search bots (proven).
2. Bing Webmaster Tools + IndexNow after the nightly build; read the AI Performance report monthly (proven route into Copilot).
3. Keep the answer sentence first and dense with date, time, place, count (proven correlation).
4. Real freshness: `dateModified` and the visible "last checked" line change only when something actually changes (proven correlation).
5. Question headings on city pages — "When is the next flea market in Zürich?" (plausible).
6. Turn on the GSC Generative AI report (proven measurement, impressions only).
7. Classify AI referrers in event logging and treat the number as a floor (proven).
8. One canonical name per market and organiser across all four locales (plausible).
9. No llms.txt, no nosnippet/noarchive/nocache (proven).
10. Watch Google's own panels: AI Mode answers local intent from Business Profiles; the directory's edge is the aggregated "next date in this city" no panel offers (directional).

**Honesty note**: 1, 2, 6, 7, 9 rest on vendor documentation or large logs. 3, 4, 5, 8 rest on correlational studies of mostly English commercial content; none tested event directories or Swiss pages. The local trigger rate (7.9%) suggests most of fynda's traffic will stay classic search for now.
