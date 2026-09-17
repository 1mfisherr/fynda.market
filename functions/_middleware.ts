/**
 * Page views, counted at the edge.
 *
 * This runs on Cloudflare before the HTML is served, so a page view is
 * recorded whether or not the visitor runs our JavaScript. That is the whole
 * reason it lives here rather than in a script tag: an ad blocker cannot
 * remove it, a consent tool cannot break it, and the number that would have
 * shown v1's collapse — views per page type — stays complete.
 *
 * Interaction events are the opposite case. "Clicked directions" only exists
 * in a browser, so those come from functions/e.ts instead. The split is
 * deliberate: the complete number is the one we cannot afford to lose.
 *
 * Since 2026-09-17 three more things happen here:
 *
 * - A robot is written to crawler_hits instead of being dropped — which
 *   robot, which page. Visitor numbers stay clean because it is another
 *   table; "does ChatGPT read our market pages" gets an answer.
 * - A 404 is a `not_found` event, with where the link came from.
 * - The page says which market, town and canton it is about in <meta> tags
 *   in its <head> (Base.astro), and the edge reads them off the first few
 *   kilobytes of the response. That is how a page view carries a market id
 *   without the edge knowing the database.
 *
 * Nothing here blocks the response. The inserts are handed to waitUntil(),
 * so a slow or broken database costs the visitor nothing.
 */

import { collect, botReason, recordCrawler, pageTypeOf, localeOf, type Env } from './_collect';

const META_RE = /<meta\s+name="fynda:(market|city|region|next)"\s+content="([^"]*)"/g;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * The page's own description of itself, from its <head>. Reads at most the
 * first 8 KB of one copy of the body; the visitor gets the other copy
 * untouched. The tags sit right after <title>, so they are always inside.
 */
async function readPageMeta(response: Response): Promise<{ response: Response; meta: Record<string, string> }> {
  const meta: Record<string, string> = {};
  if (!response.body) return { response, meta };
  const [forUs, forThem] = response.body.tee();
  const reader = forUs.getReader();
  let text = '';
  const decoder = new TextDecoder();
  try {
    while (text.length < 8192) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      if (text.includes('</head>')) break;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  for (const m of text.matchAll(META_RE)) meta[m[1]] = m[2];
  return { response: new Response(forThem, response), meta };
}

/** Whole days from now to a YYYY-MM-DD, or null. -1 means the date is past. */
function daysUntil(date: string | undefined): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const days = Math.floor((Date.parse(date + 'T00:00:00Z') - Date.now()) / 86400000);
  return days < -1 ? -1 : Math.min(days, 400);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env, waitUntil } = context;
  const response = await next();

  // Only real page loads. Assets and redirects are not page views, and
  // counting them would inflate exactly the number we most need to trust.
  const isHtml = (response.headers.get('content-type') ?? '').includes('text/html');
  if (request.method !== 'GET' || !isHtml) return response;
  if (response.status !== 200 && response.status !== 404) return response;

  const url = new URL(request.url);

  /*
   * `/` is not a page. It is a two-line HTML stub that redirects to /de/, and
   * because it answers 200 with text/html it was passing every test above:
   * 458 of the first 1,695 page views were it. Every one of them was recorded
   * with no locale and a page type of `other`, and anyone who actually
   * followed it was then counted a second time on the home page.
   *
   * Counting it as `home` would be the other wrong answer — it would fold the
   * bots that never follow the redirect into the number for the page that has
   * content on it.
   */
  if (url.pathname === '/') return response;

  const page_type = pageTypeOf(url.pathname);
  const locale = localeOf(url.pathname);

  // A robot: its own table, and no further reading of the page.
  const reason = botReason(request);
  if (reason) {
    waitUntil(recordCrawler(env, request, reason, { path: url.pathname, page_type, locale, status: response.status }));
    return response;
  }

  if (response.status === 404) {
    waitUntil(collect(env, request, { event_name: 'not_found', path: url.pathname, page_type, locale, status: 404 }));
    return response;
  }

  const { response: passed, meta } = await readPageMeta(response);
  waitUntil(
    collect(env, request, {
      event_name: 'page_view',
      path: url.pathname,
      page_type,
      locale,
      status: 200,
      market_id: meta.market && UUID_RE.test(meta.market) ? meta.market : null,
      city_slug: meta.city && SLUG_RE.test(meta.city) ? meta.city : null,
      region_slug: meta.region && SLUG_RE.test(meta.region) ? meta.region : null,
      days_until_date: daysUntil(meta.next),
    })
  );

  return passed;
};
