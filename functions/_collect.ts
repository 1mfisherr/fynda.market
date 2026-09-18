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
  | 'newsletter_submit' | 'organiser_contact' | 'report_open'
  // since 2026-09-17
  | 'page_leave' | 'web_vitals' | 'js_error' | 'not_found' | 'newsletter_form_start'
  | 'rage_click' | 'dead_click' | 'language_switch'
  // since 2026-09-18
  | 'geo_prompt';

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
  /** Browser width in CSS px; only the browser knows it. */
  viewport_w?: number | null;
  /** Market pages: days from now to the next date, read from the page's meta tag. */
  days_until_date?: number | null;
  /** HTTP status of the page the edge served. */
  status?: number | null;
  props?: Record<string, unknown>;
}

/** What Cloudflare knows about the connection, free on every plan. */
interface CfInfo {
  country?: string;
  city?: string;
  regionCode?: string;
  timezone?: string;
  asn?: number;
  asOrganization?: string;
  clientTcpRtt?: number;
  httpProtocol?: string;
  isEUCountry?: string;
  verifiedBotCategory?: string;
}
const cfOf = (request: Request): CfInfo => (request as Request & { cf?: CfInfo }).cf ?? {};

const LOCALES = new Set(['de', 'fr', 'it', 'en']);

// The translated path words, copied from src/lib/i18n.ts (a Function may not
// import it). A new locale or a renamed utility page is a change here too.
const COUNTRY = new Set(['schweiz', 'suisse', 'svizzera', 'switzerland']);
const UTILITY = new Set([
  'melden', 'signaler', 'segnalare', 'report',
  'newsletter',
  'gemerkt', 'favoris', 'salvati', 'saved',
  'impressum', 'mentions-legales', 'note-legali', 'imprint',
  'datenschutz', 'confidentialite', 'privacy',
  'nutzungsbedingungen', 'conditions-generales', 'condizioni-generali', 'terms',
  'ueber-uns', 'a-propos', 'chi-siamo', 'about',
]);

/** Our page types, exactly as the check constraint spells them. */
export function pageTypeOf(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 'other';
  if (parts.length === 1 && LOCALES.has(parts[0])) return 'home';

  const [, section, third] = parts;
  if (['markt', 'marche', 'mercato', 'market'].includes(section)) return 'market';
  if (['umkreis', 'a-proximite', 'nei-dintorni', 'nearby'].includes(section)) return 'filter';
  if (['veranstalter', 'organisateurs', 'organizzatori', 'organisers'].includes(section)) return 'organiser';
  // Forms, saved markets, legal text, About: one bucket, so "how many people
  // opened a form" is a question the table can answer.
  if (parts.length === 2 && UTILITY.has(section)) return 'utility';
  // /{locale}/{country}/ is the country; /kanton/{region}/ under it a region;
  // /{locale}/{country}/{city}/ a city.
  if (parts.length === 2 && COUNTRY.has(section)) return 'country';
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

/**
 * Hosting and cloud networks. A person reads this site from Swisscom, Sunrise,
 * Salt or a phone; a request from an Amazon or Hetzner address is a machine,
 * whatever its user-agent string claims. Cloud providers only, no transit
 * carriers, because the cost of a false positive is a real visitor.
 */
const DATACENTRE_ORG =
  /amazon|aws|google cloud|microsoft|azure|digitalocean|hetzner|ovh|linode|akamai|alibaba|tencent|oracle|vultr|choopa|contabo|scaleway|leaseweb|m247|hostinger|ionos|fastly|huawei|upcloud|kamatera|hivelocity|colocrossing|quadranet|psychz|zenlayer|datacamp|servers\.com|hostwinds|hostroyale|packethub|g-core|gcore|stark industries|aeza|3xk|nybula|clouvider|bl networks|xtom|netcup|strato|serverion|hostpapa|rackspace|limestone|rackdog/i;

/**
 * The request-level check the two counters use. Adds two signals to the
 * user-agent test above, both learned from the first ten days of data, when
 * two thirds of "visitors" were sweeps that passed the string match:
 *
 * - the network Cloudflare says the request came from (`cf.asOrganization`);
 * - whether the browser said what language it speaks. Every real browser
 *   sends Accept-Language on every request; crawlers that fake a Chrome
 *   user-agent very often forget it;
 * - whether it sent the Sec-Fetch-* headers. Every browser since 2023
 *   (Chrome 76, Firefox 90, Safari 16.4) attaches `Sec-Fetch-Mode` to every
 *   request it makes — page loads, fetches and beacons alike. An HTTP client
 *   wearing a browser's user-agent string does not. The first two signals
 *   alone let a full-site crawl through on the morning of 2026-09-15: 880
 *   hits from residential addresses in a dozen countries, one per URL, with a
 *   language header and a Chrome name, evenly across the four locales.
 *
 * Forms keep the narrower check: a person on a VPN that exits in a cloud
 * should still be able to report a cancelled market.
 */
export function isProbablyBotRequest(request: Request): boolean {
  return botReason(request) !== null;
}

export type BotReason = 'ua' | 'no_language' | 'no_sec_fetch' | 'datacentre';

/** Why the request is a machine, or null when it looks like a person. */
export function botReason(request: Request): BotReason | null {
  if (isProbablyBot(request.headers.get('user-agent'))) return 'ua';
  if (!request.headers.get('accept-language')) return 'no_language';
  if (!request.headers.get('sec-fetch-mode')) return 'no_sec_fetch';
  const org = cfOf(request).asOrganization;
  return !!org && DATACENTRE_ORG.test(org) ? 'datacentre' : null;
}

/**
 * Who the robot is and what it is for. Since 2026-09-17 a robot is written to
 * crawler_hits instead of being dropped, because "does ChatGPT read our
 * pages" is a question with a price on it.
 *
 * `user` is the interesting role: ChatGPT-User, Claude-User and
 * Perplexity-User fetch a page because a human just asked the assistant about
 * it — the nearest thing to a real-time demand signal a directory can have.
 * Order matters: the -User agents are matched before the crawlers that share
 * their prefix.
 */
const CRAWLERS: [RegExp, string, string][] = [
  [/ChatGPT-User/i, 'ChatGPT-User', 'user'],
  [/Claude-User/i, 'Claude-User', 'user'],
  [/Perplexity-User/i, 'Perplexity-User', 'user'],
  [/GPTBot/i, 'GPTBot', 'training'],
  [/OAI-SearchBot/i, 'OAI-SearchBot', 'search'],
  [/Claude-SearchBot/i, 'Claude-SearchBot', 'search'],
  [/ClaudeBot|anthropic-ai/i, 'ClaudeBot', 'training'],
  [/PerplexityBot/i, 'PerplexityBot', 'search'],
  [/Google-Extended/i, 'Google-Extended', 'training'],
  [/Googlebot|Google-InspectionTool|Storebot-Google/i, 'Googlebot', 'search'],
  [/GoogleOther/i, 'GoogleOther', 'other'],
  [/bingbot/i, 'bingbot', 'search'],
  [/Applebot-Extended/i, 'Applebot-Extended', 'training'],
  [/Applebot/i, 'Applebot', 'search'],
  [/DuckAssistBot/i, 'DuckAssistBot', 'search'],
  [/DuckDuckBot/i, 'DuckDuckBot', 'search'],
  [/Amazonbot/i, 'Amazonbot', 'search'],
  [/CCBot/i, 'CCBot', 'training'],
  [/Bytespider/i, 'Bytespider', 'training'],
  [/meta-externalagent|FacebookBot/i, 'meta-externalagent', 'training'],
  [/facebookexternalhit/i, 'facebookexternalhit', 'social'],
  [/Twitterbot/i, 'Twitterbot', 'social'],
  [/LinkedInBot/i, 'LinkedInBot', 'social'],
  [/WhatsApp/i, 'WhatsApp', 'social'],
  [/TelegramBot/i, 'TelegramBot', 'social'],
  [/Slackbot|Slack-ImgProxy/i, 'Slackbot', 'social'],
  [/Discordbot/i, 'Discordbot', 'social'],
  [/Pinterestbot/i, 'Pinterestbot', 'social'],
  [/YandexBot/i, 'YandexBot', 'search'],
  [/Baiduspider/i, 'Baiduspider', 'search'],
  [/PetalBot/i, 'PetalBot', 'search'],
  [/SemrushBot/i, 'SemrushBot', 'seo'],
  [/AhrefsBot/i, 'AhrefsBot', 'seo'],
  [/MJ12bot/i, 'MJ12bot', 'seo'],
  [/DotBot/i, 'DotBot', 'seo'],
  [/DataForSeoBot/i, 'DataForSeoBot', 'seo'],
  [/Screaming Frog/i, 'ScreamingFrog', 'seo'],
  [/ia_archiver|archive\.org_bot/i, 'archive.org', 'other'],
  [/UptimeRobot|Pingdom|StatusCake|Site24x7/i, 'uptime-monitor', 'monitor'],
  [/Lighthouse|PageSpeed/i, 'Lighthouse', 'monitor'],
];

export function classifyCrawler(ua: string | null): { bot_name: string; bot_role: string } {
  if (!ua) return { bot_name: 'unnamed', bot_role: 'other' };
  for (const [re, name, role] of CRAWLERS) if (re.test(ua)) return { bot_name: name, bot_role: role };
  // Something that called itself a bot but is not on the list: keep the word
  // it used, so a new crawler shows up by name in the table.
  const m = ua.match(/([A-Za-z0-9_.-]{2,40}(?:bot|crawler|spider))/i);
  if (m) return { bot_name: m[1].slice(0, 80), bot_role: 'other' };
  if (/python-requests|curl|wget|go-http-client|okhttp|java\/|libwww|scrapy|httpx|aiohttp|node-fetch|axios/i.test(ua)) {
    return { bot_name: ua.split(/[\s/]/)[0].slice(0, 80) || 'http-client', bot_role: 'other' };
  }
  return { bot_name: 'unnamed', bot_role: 'other' };
}

/**
 * The row for a robot. No person is in it: no hash, no cookie, only the
 * robot's name, its network, and what it read.
 */
export async function recordCrawler(
  env: Env, request: Request, reason: BotReason,
  input: { path: string; page_type?: string | null; locale?: string | null; market_id?: string | null; status?: number | null },
): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  const ua = request.headers.get('user-agent');
  const cf = cfOf(request);
  const row = {
    occurred_at: new Date().toISOString(),
    ...classifyCrawler(ua),
    reason,
    user_agent: ua ? ua.slice(0, 512) : null,
    asn: typeof cf.asn === 'number' ? cf.asn : null,
    as_org: cf.asOrganization ? cf.asOrganization.slice(0, 200) : null,
    country: cf.country && cf.country.length === 2 ? cf.country : null,
    path: input.path.split('?')[0].slice(0, 2048),
    page_type: input.page_type ?? null,
    locale: input.locale ?? null,
    market_id: input.market_id ?? null,
    status: input.status ?? null,
    verified_category: cf.verifiedBotCategory || null,
  };
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/crawler_hits`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.log('crawler insert rejected', res.status, await res.text());
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** name=value pairs, first occurrence wins, values not decoded (ours never need it). */
export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const name = part.slice(0, i).trim();
    if (name && !(name in out)) out[name] = part.slice(i + 1).trim();
  }
  return out;
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
  // terms or a session token from the site that linked to us. When the
  // referrer is our own site it is the previous page, and that path is kept:
  // it is how a visit is followed from page to page without a cookie.
  let referrer_host: string | null = null;
  let prev_path: string | null = null;
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const ref = new URL(referer);
      if (ref.hostname === new URL(request.url).hostname) prev_path = ref.pathname.slice(0, 2048);
      else referrer_host = ref.hostname;
    } catch { /* a malformed referrer is not worth a failed insert */ }
  }

  const url = new URL(request.url);
  const cf = cfOf(request);

  // The first language the browser asks for, two letters. Beside `locale` it
  // says whether a French speaker landed on the German page.
  const lang = request.headers.get('accept-language')?.trim().slice(0, 2).toLowerCase() ?? null;
  const browser_lang = lang && /^[a-z]{2}$/.test(lang) ? lang : null;

  /*
   * The second identity layer, since 2026-09-16: a first-party cookie the
   * banner sets once the visitor accepts. `fynda_consent=granted` is the
   * consent, `fynda_id` the identifier that lets a returning browser be
   * recognised. Without the first, the second is ignored even if present —
   * and the table's own constraint refuses a visitor_id without consent.
   */
  const cookies = parseCookies(request.headers.get('cookie'));
  const granted = cookies.fynda_consent === 'granted';
  const visitor_id = granted && cookies.fynda_id && UUID_RE.test(cookies.fynda_id) ? cookies.fynda_id : null;

  const row = {
    occurred_at: new Date().toISOString(),
    event_name: input.event_name,
    visitor_day_hash,
    visitor_id,
    consent_state: visitor_id ? 'granted' : 'none',
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
    country: cf.country && cf.country.length === 2 ? cf.country : null,
    // Free on every request; a town and a canton, never a street. Cloudflare
    // sometimes returns an empty string, which the constraint would refuse.
    browser_lang,
    city: cf.city ? cf.city.slice(0, 120) : null,
    region_code: cf.regionCode && /^[A-Z0-9]{1,6}$/.test(cf.regionCode) ? cf.regionCode : null,
    timezone: cf.timezone && /^[A-Za-z_/+-]{1,64}$/.test(cf.timezone) ? cf.timezone : null,
    asn: typeof cf.asn === 'number' ? cf.asn : null,
    as_org: cf.asOrganization ? cf.asOrganization.slice(0, 200) : null,
    rtt_ms: typeof cf.clientTcpRtt === 'number' && cf.clientTcpRtt >= 0 && cf.clientTcpRtt <= 60000 ? Math.round(cf.clientTcpRtt) : null,
    http_protocol: cf.httpProtocol ?? null,
    is_eu: cf.isEUCountry === '1' ? true : cf.country ? false : null,
    viewport_w: typeof input.viewport_w === 'number' && input.viewport_w >= 100 && input.viewport_w <= 10000 ? Math.round(input.viewport_w) : null,
    days_until_date: typeof input.days_until_date === 'number' && input.days_until_date >= -1 && input.days_until_date <= 400 ? Math.round(input.days_until_date) : null,
    status: input.status ?? null,
    prev_path,
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
