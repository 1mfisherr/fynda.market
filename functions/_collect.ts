/**
 * The one place an event is turned into a row.
 *
 * Both entry points — the edge middleware and the browser endpoint — come
 * through here, so the privacy rules are written once and cannot drift apart.
 *
 * How a visitor is counted without being identified:
 *
 *   visitor_day_hash = HMAC-SHA256(ip + user agent, secret + today's date)
 *
 * The key changes at midnight UTC, so the same person is one hash today and a
 * different one tomorrow. That counts people within a day — which is what
 * "visitors" means on a dashboard — while making it impossible to follow
 * anyone across days, or to work backwards to an IP. No cookie, no
 * localStorage, nothing stored on the device, so no consent banner.
 *
 * The raw IP is never written anywhere. It exists inside this function for the
 * length of one hash and is gone.
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Rotates the daily hash key. Any long random string; changing it resets counting. */
  ANALYTICS_SALT: string;
}

/** Mirrors the check constraint on analytics_events.event_name. */
export type EventName =
  | 'page_view' | 'search' | 'no_results' | 'filter_changed' | 'market_click'
  | 'outbound_click' | 'calendar_add' | 'market_save' | 'newsletter_form_view'
  | 'newsletter_submit' | 'organiser_contact' | 'report_open';

export interface EventInput {
  event_name: EventName;
  path?: string;
  page_type?: string | null;
  locale?: string | null;
  market_id?: string | null;
  city_slug?: string | null;
  region_slug?: string | null;
  session_id?: string | null;
  page_view_id?: string | null;
  props?: Record<string, unknown>;
}

const LOCALES = new Set(['de', 'fr', 'it', 'en']);

/** Our page types, exactly as the check constraint spells them. */
export function pageTypeOf(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 'other';
  if (parts.length === 1 && LOCALES.has(parts[0])) return 'home';

  const [, section, third] = parts;
  if (['markt', 'marche', 'mercato', 'market'].includes(section)) return 'market';
  if (['umkreis', 'a-proximite', 'nei-dintorni', 'nearby'].includes(section)) return 'filter';
  if (['veranstalter', 'organisateurs', 'organizzatori', 'organisers'].includes(section)) return 'organiser';
  // /{locale}/{country}/kanton/{region}/ is a region; /{locale}/{country}/{city}/ is a city.
  if (parts.length === 4 && ['kanton', 'canton', 'cantone'].includes(third)) return 'region';
  if (parts.length === 3) return 'city';
  return 'other';
}

export function localeOf(pathname: string): string | null {
  const first = pathname.split('/').filter(Boolean)[0];
  return first && LOCALES.has(first) ? first : null;
}

/**
 * Cheap and deliberately incomplete. It is here to stop obvious crawlers from
 * inflating page views, not to be a bot-detection product — a missed bot costs
 * us a slightly high number, a false positive costs us a real visitor.
 */
export function isProbablyBot(ua: string | null): boolean {
  if (!ua) return true;
  return /bot|crawler|spider|crawling|slurp|bingpreview|headless|lighthouse|curl|wget|python-requests|monitor|preview/i.test(ua);
}

export function deviceClassOf(ua: string | null): string | null {
  if (!ua) return null;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** HMAC-SHA256 as lowercase hex, which is the shape the check constraint wants. */
async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function collect(env: Env, request: Request, input: EventInput): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.ANALYTICS_SALT) return;

  const ua = request.headers.get('user-agent');
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '';

  // The key carries today's date, so it rotates on its own at midnight UTC.
  const today = new Date().toISOString().slice(0, 10);
  const visitor_day_hash = await hmacHex(`${env.ANALYTICS_SALT}:${today}`, `${ip}|${ua ?? ''}`);

  // Referrer host only — never the full URL, which can carry someone's search
  // terms or a session token from the site that linked to us.
  let referrer_host: string | null = null;
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const host = new URL(referer).hostname;
      referrer_host = host === new URL(request.url).hostname ? null : host;
    } catch { /* a malformed referrer is not worth a failed insert */ }
  }

  const url = new URL(request.url);
  const cf = (request as Request & { cf?: { country?: string } }).cf;

  const row = {
    occurred_at: new Date().toISOString(),
    event_name: input.event_name,
    visitor_day_hash,
    // Layer 2 stays null: a persistent id is what would need a banner, and we
    // have not asked. The table's own constraint refuses one without consent.
    consent_state: 'none',
    session_id: input.session_id ?? null,
    page_view_id: input.page_view_id ?? null,
    locale: input.locale ?? null,
    page_type: input.page_type ?? null,
    path: input.path ?? url.pathname,
    market_id: input.market_id ?? null,
    city_slug: input.city_slug ?? null,
    region_slug: input.region_slug ?? null,
    referrer_host,
    utm_source: url.searchParams.get('utm_source'),
    utm_medium: url.searchParams.get('utm_medium'),
    utm_campaign: url.searchParams.get('utm_campaign'),
    device_class: deviceClassOf(ua),
    country: cf?.country && cf.country.length === 2 ? cf.country : null,
    props: input.props ?? {},
  };

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  // A rejected insert is silent everywhere else: it is fired into waitUntil()
  // so it cannot slow a page, which also means a bad row leaves no trace but an
  // empty table. This line is how a constraint violation becomes findable in
  // the Cloudflare log instead of a mystery three weeks later.
  if (!res.ok) console.log('analytics insert rejected', res.status, await res.text());
}
