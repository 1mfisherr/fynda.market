/**
 * "Tell me when it's back" — POST /b.
 *
 * On a market page with no date, and on a town page with nothing dated, in
 * place of the weekly card (PAGES.md, 2026-10-10). One address, one market or
 * one town, and one e-mail the night a date appears — scripts/send-date-alerts.mjs
 * sends it after the nightly rebuild and then clears the address. Nothing else
 * is promised and nothing else is sent, so there is no welcome mail: the one
 * mail is the alert itself.
 *
 * The form carries the weekly mail as an unticked offer beside it. A tick puts
 * the address on the weekly list exactly as the card would (`_newsletter.ts`),
 * around the same town, with the tick's own words as the consent.
 *
 * Answers like /n: JSON to the page's script, a redirect to `#sub-*` for a
 * browser that posted the form itself.
 */

import { localeOf } from './_collect';
import { recentFrom } from './_rest';
import {
  EMAIL, crossOrigin, domainOf, ipHash, json, looksLikeBot, marketExists, pathFrom, ping,
  readBody, referrerHost, seeOther, text, tooFast, trapped,
} from './_form';
import { resolveSlug, subscribe, type NewsletterEnv } from './_newsletter';
import type { Locale } from './_mail';

export const onRequestPost: PagesFunction<NewsletterEnv> = async ({ request, env, waitUntil }) => {
  if (crossOrigin(request)) return json(403, { ok: false });
  if (looksLikeBot(request)) return json(202, { ok: true });

  const body = await readBody(request);
  if (!body) return json(400, { ok: false, error: 'bad_request' });

  const path = pathFrom(body);
  const locale = ((path && localeOf(path)) ?? 'de') as Locale;
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const back = path ?? '/';
  const prefix = /^[a-z]{1,10}$/.test(String(body.anchor ?? '')) ? String(body.anchor) : 'form';
  const done = () => (wantsJson ? json(200, { ok: true }) : seeOther(`${back}#${prefix}-done`));
  const quiet = () => (wantsJson ? json(202, { ok: true }) : seeOther(`${back}#${prefix}-done`));
  const failed = (status: number, error: string, hash: string) =>
    wantsJson ? json(status, { ok: false, error }) : seeOther(`${back}#${prefix}-${hash}`);

  if (trapped(body) || tooFast(body)) return quiet();

  const email = text(body.email, 254)?.toLowerCase() ?? null;
  if (!email || !EMAIL.test(email)) return failed(422, 'email', 'invalid');

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return failed(503, 'unavailable', 'failed');

  /*
   * What it is about: the market the page names, checked rather than trusted,
   * or — with no market — the town. The town is resolved either way, because
   * the weekly tick subscribes around it.
   */
  const citySlug = text(body.city, 80)?.toLowerCase() ?? null;
  const city_id = await resolveSlug(env, 'city', citySlug);
  const marketId = text(body.market, 40);
  const market_id = marketId && (await marketExists(env, marketId)) ? marketId : null;
  if (!market_id && !city_id) return failed(422, 'target', 'failed');

  /* The same cap as the weekly card: five an hour from one connection. */
  const signup_ip_hash = await ipHash(env, request, 'date-alert');
  if ((await recentFrom(env, 'date_alerts', 'signup_ip_hash', 'created_at', signup_ip_hash)) >= 5) return quiet();

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/date_alerts`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      email,
      locale,
      market_id,
      city_id: market_id ? null : city_id,
      source_path: path,
      consent_text: text(body.consent_text, 500),
      signup_ip_hash,
    }),
  });

  /* 409: this address already waits for this market or town — the same
     request twice, and the answer is the same "done". */
  if (!res.ok && res.status !== 409) {
    console.log('date_alerts insert rejected', res.status, await res.text());
    return failed(500, 'save_failed', 'failed');
  }
  if (res.ok) waitUntil(ping(env, `Tell me when it's back: ${domainOf(email)} — ${market_id ? `market ${path ?? ''}` : `town ${citySlug}`} (${locale})`));

  /* The tick. Its failure does not undo the alert, which is what was asked for.
     The distance is the card's, clamped the same way /n clamps it. */
  if (body.weekly && city_id) {
    const radius = Number(body.radius);
    const radius_km = Math.min(200, Math.max(1, Number.isFinite(radius) ? Math.round(radius) : 25));
    await subscribe(env, waitUntil, {
      email,
      locale,
      region_id: null,
      city_id,
      radius_km,
      source_path: path,
      referrer_host: referrerHost(request),
      signup_ip_hash: await ipHash(env, request, 'newsletter'),
      consent_text: text(body.weekly_consent, 500),
      where: `${radius_km} km um ${citySlug}`,
    });
  }

  return done();
};
