/**
 * Newsletter signup — POST /n.
 *
 * The first form on this site that does not open the visitor's mail program.
 * It writes a row and answers; the page then says "you're in" without leaving.
 *
 * Deliberately small. There is no confirmation mail to click, because the
 * privacy policy promises the subscription is active immediately, and because
 * a confirmation step loses roughly a third of the people who meant to join.
 * What is kept instead is evidence of consent: when, from which page, in which
 * language, and the words they agreed to.
 *
 * Spam, in order of how much each one actually catches:
 *   1. A honeypot field a person never sees and a bot fills in.
 *   2. A form that was filled in impossibly fast.
 *   3. Same-origin only, and an obvious-crawler check.
 * No captcha. A captcha costs real people to stop a problem we do not have.
 *
 * If anything here fails, the page falls back to the mail program it used
 * before, so a broken endpoint cannot be worse than no endpoint.
 */

import { isProbablyBot, localeOf, type Env as CollectEnv } from './_collect';

interface Env extends CollectEnv {
  /** Optional. Set both and a signup pings Telegram; leave unset and it does not. */
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

/** Same shape as the analytics visitor hash: hex, and never reversible to an IP. */
async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Telling Delfim, in the place he actually looks.
 *
 * Best effort and never awaited into the response: a signup that saved must
 * report success even if Telegram is down or was never configured.
 */
async function ping(env: Env, text: string): Promise<void> {
  // Trimmed, and not optional. A secret set by piping a value into the CLI
  // arrives with the shell's trailing newline attached, which puts a line break
  // inside the request URL and inside the chat id. The first signup notified
  // nobody and said nothing about why.
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chat = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chat) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    // Telegram answers 200 with ok:false for a bad chat id, so the status alone
    // is not the answer. This line is the difference between a silent failure
    // and a findable one.
    if (!res.ok) console.log('telegram rejected', res.status, await res.text());
  } catch (error) {
    console.log('telegram unreachable', String(error));
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).hostname !== new URL(request.url).hostname) {
    return json(403, { ok: false });
  }
  if (isProbablyBot(request.headers.get('user-agent'))) return json(202, { ok: true });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'bad_request' }); }

  // 1. The honeypot. The field is in the form, hidden from people and from
  //    screen readers; anything in it is a bot. Answer 202 so it learns nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json(202, { ok: true });

  // 2. Nobody reads a form, types an address and submits inside three seconds.
  const elapsed = Number(body.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 3000) return json(202, { ok: true });

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return json(422, { ok: false, error: 'email' });
  }

  const townRaw = String(body.town ?? '').trim();
  const town = townRaw ? townRaw.slice(0, 80) : null;

  let path: string | null = null;
  if (typeof body.path === 'string' && body.path.startsWith('/')) {
    path = body.path.split('?')[0].split('#')[0].slice(0, 2048);
  }
  const locale = (path && localeOf(path)) ?? 'de';

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    // Nothing is configured, so nothing can be saved. Say so plainly rather
    // than showing a success the visitor did not get.
    return json(503, { ok: false, error: 'unavailable' });
  }

  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '';
  const signup_ip_hash = env.ANALYTICS_SALT
    ? await hmacHex(env.ANALYTICS_SALT, `newsletter|${ip}`)
    : null;

  let referrer_host: string | null = null;
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const host = new URL(referer).hostname;
      referrer_host = host === new URL(request.url).hostname ? null : host;
    } catch { /* ignore */ }
  }

  const row: Record<string, unknown> = {
    email,
    town,
    locale,
    source_path: path,
    referrer_host,
    signup_ip_hash,
    // A second signup un-does an earlier unsubscribe.
    unsubscribed_at: null,
  };

  /*
   * The exact words shown next to the button, kept so consent can be shown
   * rather than asserted.
   *
   * Only set when we have one. An upsert updates exactly the columns present
   * in the payload, so sending null here would let a later signup erase the
   * consent record of an earlier one — which is the one field that must not be
   * lost.
   */
  if (typeof body.consent_text === 'string' && body.consent_text.trim()) {
    row.consent_text = body.consent_text.slice(0, 500);
  }

  /*
   * Upsert on the address. A second signup from the same person updates their
   * town and undoes an earlier unsubscribe — it must never fail with a
   * duplicate-key error that the page would show as "something went wrong".
   * created_at and unsubscribe_token are left alone, so old unsubscribe links
   * keep working.
   */
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/newsletter_subscribers?on_conflict=email`,
    {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
    }
  );

  if (!res.ok) {
    console.log('newsletter insert rejected', res.status, await res.text());
    return json(500, { ok: false, error: 'save_failed' });
  }

  waitUntil(ping(env, `Newsletter: ${email}${town ? ` — ${town}` : ''} (${locale})`));

  return json(200, { ok: true });
};
