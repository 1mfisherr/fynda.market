/**
 * Your saved markets, by e-mail — /k (Delfim, 2026-10-10, design/saved-mail-v1.html).
 *
 *   POST { email, slugs, path, consent_text }  sign up: the saved list goes with the address
 *   POST { token, slugs }                     this browser's list changed: replace it
 *   GET  ?t={token}                            the list, for the Saved page on another phone
 *
 * The list lives in saved_markets against the address's newsletter_subscribers
 * row; the Friday digest (scripts/send-digest.mjs) says which of them are on.
 *
 * Who may change what. A new address gets its token back, and that browser
 * keeps the list in step from then on. An address already on the list does
 * NOT get its token back — anyone can type anyone's address — and a signup
 * from it can only add markets, never remove them; the token reaches its owner
 * in the next mail ("Your saved markets"). The token is the newsletter's own
 * unsubscribe token: whoever holds it can already stop the mail.
 *
 * A saved market with no date yet gets a "tell me when it's back" alert, so
 * the mail's "we'll write the day it has one" is true.
 */

import {
  EMAIL, crossOrigin, domainOf, ipHash, json, looksLikeBot, pathFrom, ping,
  readBody, referrerHost, text, tooFast, trapped, type FormEnv,
} from './_form';
import { localeOf } from './_collect';
import { savedWelcomeMail, sendMail, type Locale, type MailEnv } from './_mail';
import { deleteRows, insertOne, recentFrom, selectOne, selectRows, UUID } from './_rest';

interface Env extends FormEnv, MailEnv {}
interface Subscriber { id: string; email: string; locale: Locale; unsubscribe_token: string; unsubscribed_at: string | null }

const SLUG = /^[a-z0-9-]{2,120}$/;
const MAX = 60;

/** Published markets for these slugs — ids, never trusted from the page. */
async function marketsFor(env: Env, slugs: string[]): Promise<{ id: string; slug: string }[]> {
  const clean = [...new Set(slugs.filter((s) => SLUG.test(s)))].slice(0, MAX);
  if (clean.length === 0) return [];
  return selectRows<{ id: string; slug: string }>(env, 'markets', `slug=in.(${clean.join(',')})&status=eq.active`, 'id,slug');
}

/** A "tell me when it's back" for each market with no date ahead, once. */
async function alertUndated(env: Env, email: string, locale: Locale, ids: string[], path: string | null) {
  if (ids.length === 0) return;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date());
  const dated = new Set((await selectRows<{ market_id: string }>(env, 'occurrences',
    `market_id=in.(${ids.join(',')})&date=gte.${today}&status=neq.cancelled`, 'market_id')).map((r) => r.market_id));
  const open = new Set((await selectRows<{ market_id: string }>(env, 'date_alerts',
    `email=eq.${encodeURIComponent(email)}&market_id=in.(${ids.join(',')})`, 'market_id')).map((r) => r.market_id));
  await Promise.all(ids.filter((id) => !dated.has(id) && !open.has(id)).map((market_id) =>
    insertOne(env, 'date_alerts', { email, locale, market_id, source_path: path, consent_text: 'saved markets by e-mail' })));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const token = new URL(request.url).searchParams.get('t') ?? '';
  if (!UUID.test(token)) return json(404, { ok: false });
  const sub = await selectOne<Subscriber>(env, 'newsletter_subscribers', `unsubscribe_token=eq.${token}&unsubscribed_at=is.null`, 'id');
  if (!sub) return json(404, { ok: false });
  const rows = await selectRows<{ markets: { slug: string } }>(env, 'saved_markets', `subscriber_id=eq.${sub.id}`, 'markets(slug)');
  return json(200, { ok: true, slugs: rows.map((r) => r.markets?.slug).filter(Boolean) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  if (crossOrigin(request)) return json(403, { ok: false });
  if (looksLikeBot(request)) return json(202, { ok: true });
  const body = await readBody(request);
  if (!body) return json(400, { ok: false });
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json(503, { ok: false });

  const path = pathFrom(body);
  const locale = ((path && localeOf(path)) ?? 'en') as Locale;
  const slugs = Array.isArray(body.slugs) ? body.slugs.map(String) : [];
  const markets = await marketsFor(env, slugs);
  const ids = markets.map((m) => m.id);

  /* ---- this browser's list changed --------------------------------------- */
  const token = String(body.token ?? '');
  if (token) {
    if (!UUID.test(token)) return json(404, { ok: false });
    const sub = await selectOne<Subscriber>(env, 'newsletter_subscribers',
      `unsubscribe_token=eq.${token}&unsubscribed_at=is.null`, 'id,email,locale,unsubscribe_token,unsubscribed_at');
    if (!sub) return json(404, { ok: false });
    await deleteRows(env, 'saved_markets', `subscriber_id=eq.${sub.id}`);
    await Promise.all(ids.map((market_id) => insertOne(env, 'saved_markets', { subscriber_id: sub.id, market_id })));
    waitUntil(alertUndated(env, sub.email, sub.locale, ids, path));
    return json(200, { ok: true, saved: ids.length });
  }

  /* ---- a signup ---------------------------------------------------------- */
  if (trapped(body) || tooFast(body)) return json(202, { ok: true });
  const email = text(body.email, 254)?.toLowerCase() ?? null;
  if (!email || !EMAIL.test(email)) return json(422, { ok: false, error: 'email' });
  if (ids.length === 0) return json(422, { ok: false, error: 'nothing_saved' });

  /* Five signups an hour from one connection, as the newsletter: each one mails the address typed. */
  const signup_ip_hash = await ipHash(env, request, 'newsletter');
  if ((await recentFrom(env, 'newsletter_subscribers', 'signup_ip_hash', 'created_at', signup_ip_hash)) >= 5) return json(202, { ok: true });

  const existing = await selectOne<Subscriber>(env, 'newsletter_subscribers',
    `email=eq.${encodeURIComponent(email)}`, 'id,email,locale,unsubscribe_token,unsubscribed_at');

  if (existing && !existing.unsubscribed_at) {
    // Theirs already: add, never remove, and no token back (see the top).
    const have = new Set((await selectRows<{ market_id: string }>(env, 'saved_markets', `subscriber_id=eq.${existing.id}`, 'market_id')).map((r) => r.market_id));
    await Promise.all(ids.filter((id) => !have.has(id)).map((market_id) => insertOne(env, 'saved_markets', { subscriber_id: existing.id, market_id })));
    waitUntil(alertUndated(env, email, existing.locale, ids, path));
    waitUntil(ping(env, `Saved markets: ${domainOf(email)} added ${ids.length} (already on the list)`));
    return json(200, { ok: true });
  }

  /* New, or back after an unsubscribe: only their saved markets, no area block. */
  const country = String((request as Request & { cf?: { country?: string } }).cf?.country ?? 'ch').toLowerCase();
  const row = {
    email, locale,
    country: /^[a-z]{2}$/.test(country) ? country : 'ch',
    area_digest: false,
    region_id: null, city_id: null, radius_km: null,
    unsubscribed_at: null,
    source_path: path,
    referrer_host: referrerHost(request),
    signup_ip_hash,
    consent_text: text(body.consent_text, 500) ?? 'saved markets by e-mail',
  };
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/newsletter_subscribers?on_conflict=email&select=id,unsubscribe_token`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) { console.log('saved signup rejected', res.status, await res.text()); return json(500, { ok: false }); }
  const [sub] = (await res.json().catch(() => [])) as { id: string; unsubscribe_token: string }[];
  if (!sub) return json(500, { ok: false });

  await deleteRows(env, 'saved_markets', `subscriber_id=eq.${sub.id}`);
  await Promise.all(ids.map((market_id) => insertOne(env, 'saved_markets', { subscriber_id: sub.id, market_id })));
  waitUntil(alertUndated(env, email, locale, ids, path));
  waitUntil(ping(env, `Saved markets: ${domainOf(email)} — ${ids.length} market(s) (${locale})`));
  waitUntil(sendMail(env, { to: email, ...savedWelcomeMail(locale, sub.unsubscribe_token, markets.length) }));
  return json(200, { ok: true, token: sub.unsubscribe_token });
};
