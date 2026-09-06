/**
 * Where the browser sends the events only a browser can know.
 *
 * Clicking directions, adding to a calendar, saving a market, changing a
 * filter — none of these are requests to us, so the edge never sees them.
 * Page views deliberately do NOT come through here; they are counted in
 * _middleware.ts where an ad blocker cannot reach them.
 *
 * The client is trusted for what it did, never for who it is. Identity is
 * derived here from the connection, exactly as it is for a page view, so a
 * forged body can add a noisy row but can never claim to be someone else.
 */

import { collect, type Env, type EventName, isProbablyBot, pageTypeOf, localeOf } from './_collect';

/** Everything except page_view, which is the edge's job. */
const ALLOWED = new Set<EventName>([
  'search', 'no_results', 'filter_changed', 'market_click', 'outbound_click',
  'calendar_add', 'market_save', 'newsletter_form_view', 'newsletter_submit',
  'organiser_contact', 'report_open',
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidOrNull = (v: unknown) => (typeof v === 'string' && UUID.test(v) ? v : null);
const slugOrNull = (v: unknown) =>
  typeof v === 'string' && /^[a-z0-9-]{1,120}$/.test(v) ? v : null;

// 204 with no body: sendBeacon ignores the response, and there is nothing to say.
const done = () => new Response(null, { status: 204 });

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  // Same-origin only. The endpoint answers no cross-site request, so there is
  // no CORS header here on purpose.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).hostname !== new URL(request.url).hostname) return done();
  if (isProbablyBot(request.headers.get('user-agent'))) return done();

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return done(); }

  const name = body.event_name as EventName;
  if (!ALLOWED.has(name)) return done();

  // The path is taken from what the page reports, but only ever as a path —
  // a query string is where personal data ends up by accident, and the column
  // has a constraint that would reject one anyway.
  let path: string | undefined;
  if (typeof body.path === 'string' && body.path.startsWith('/')) {
    path = body.path.split('?')[0].split('#')[0].slice(0, 2048);
  }

  // Props are the event's own detail — which filter, which link. Capped so a
  // broken or hostile page cannot write an essay into the table.
  let props: Record<string, unknown> = {};
  if (body.props && typeof body.props === 'object' && !Array.isArray(body.props)) {
    for (const [k, v] of Object.entries(body.props as Record<string, unknown>)) {
      if (Object.keys(props).length >= 12) break;
      if (typeof v === 'string') props[k] = v.slice(0, 200);
      else if (typeof v === 'number' || typeof v === 'boolean') props[k] = v;
    }
  }

  waitUntil(
    collect(env, request, {
      event_name: name,
      path,
      page_type: path ? pageTypeOf(path) : null,
      locale: path ? localeOf(path) : null,
      market_id: uuidOrNull(body.market_id),
      city_slug: slugOrNull(body.city_slug),
      region_slug: slugOrNull(body.region_slug),
      session_id: uuidOrNull(body.session_id),
      page_view_id: uuidOrNull(body.page_view_id),
      props,
    })
  );

  return done();
};
