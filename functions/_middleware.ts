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
 * Nothing here blocks the response. The insert is handed to waitUntil(), so a
 * slow or broken database costs the visitor nothing.
 */

import { collect, isProbablyBot, pageTypeOf, localeOf, type Env } from './_collect';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env, waitUntil } = context;
  const response = await next();

  // Only real page loads. Assets, redirects and errors are not page views, and
  // counting them would inflate exactly the number we most need to trust.
  const isHtml = (response.headers.get('content-type') ?? '').includes('text/html');
  if (request.method !== 'GET' || response.status !== 200 || !isHtml) return response;
  if (isProbablyBot(request.headers.get('user-agent'))) return response;

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

  waitUntil(
    collect(env, request, {
      event_name: 'page_view',
      path: url.pathname,
      page_type: pageTypeOf(url.pathname),
      locale: localeOf(url.pathname),
    })
  );

  return response;
};
