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
import { sendMail, welcomeMail, type Locale, type MailEnv } from './_mail';

interface Env extends CollectEnv, MailEnv {
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

/**
 * The answer to a form the browser posted itself, with no JavaScript in the
 * way: send them back to the page they came from, at the fragment that reveals
 * the right sentence. The page carries all three outcomes and CSS `:target`
 * picks one, so the words stay in the visitor's own language and are written
 * in exactly one place.
 */
const seeOther = (to: string) =>
  new Response(null, { status: 303, headers: { location: to, 'cache-control': 'no-store' } });

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

  /*
   * Two encodings, one handler. `fetch` sends JSON; a browser posting the form
   * on its own — no JavaScript, or a script that never loaded — sends
   * urlencoded fields. The second is the one that has to keep working, because
   * it is the one that needs nothing of the visitor's device.
   */
  let body: Record<string, unknown>;
  try {
    body = (request.headers.get('content-type') ?? '').includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch { return json(400, { ok: false, error: 'bad_request' }); }

  let path: string | null = null;
  if (typeof body.path === 'string' && body.path.startsWith('/')) {
    path = body.path.split('?')[0].split('#')[0].slice(0, 2048);
  }
  const locale = (path && localeOf(path)) ?? 'de';

  /*
   * How to answer. `fetch` asks for JSON and gets it; the browser's own form
   * post gets sent back to the page. Both say the same three things.
   */
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const back = path ?? '/';
  const done = () => (wantsJson ? json(200, { ok: true }) : seeOther(`${back}#signup-done`));
  /** Saved nothing on purpose, and says so to nobody: the caller is a bot. */
  const quiet = () => (wantsJson ? json(202, { ok: true }) : seeOther(`${back}#signup-done`));
  const failed = (status: number, error: string, hash: string) =>
    wantsJson ? json(status, { ok: false, error }) : seeOther(`${back}#${hash}`);

  // 1. The honeypot. The field is in the form, hidden from people and from
  //    screen readers; anything in it is a bot. Answer 202 so it learns nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') return quiet();

  /*
   * 2. Nobody focuses a field, types an address and submits inside one second.
   *
   * The number is milliseconds since the visitor first touched the form, NOT
   * since the page loaded. It used to be since page load, with a three-second
   * floor, which was invisible only because the form sat 750px down a page —
   * reaching it took longer than the limit. The moment the form moves up, or
   * appears on a city page, that floor starts catching real people and
   * answering them "you're in" while saving nothing. A signup that is thrown
   * away must never look like a signup that worked.
   *
   * Only checked when the browser actually sent a number. A form posted
   * without JavaScript carries no timing, and an address filled in by a
   * password manager may involve no keystrokes at all; neither is a bot.
   */
  const elapsed = body.elapsed_ms;
  if (typeof elapsed === 'number' && Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 1000) {
    return quiet();
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return failed(422, 'email', 'signup-invalid');
  }

  const townRaw = String(body.town ?? body.stadt ?? '').trim();
  const town = townRaw ? townRaw.slice(0, 80) : null;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    // Nothing is configured, so nothing can be saved. Say so plainly rather
    // than showing a success the visitor did not get.
    return failed(503, 'unavailable', 'signup-failed');
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
   *
   * The row comes back rather than nothing, because the welcome mail below
   * needs the unsubscribe token and this is the only place it is knowable
   * without a second query.
   */
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/newsletter_subscribers?on_conflict=email&select=unsubscribe_token`,
    {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(row),
    }
  );

  if (!res.ok) {
    console.log('newsletter insert rejected', res.status, await res.text());
    return failed(500, 'save_failed', 'signup-failed');
  }

  const saved = (await res.json().catch(() => [])) as Array<{ unsubscribe_token?: string }>;
  const token = saved[0]?.unsubscribe_token;

  /*
   * Told, then welcomed — both after the row is safe, and neither awaited.
   *
   * The welcome mail is what proves the address works and what carries the
   * unsubscribe link, which is why it goes out on every signup rather than
   * waiting for the first digest. A signup with no token back, or with sending
   * switched off, still succeeds: the address is on the list either way.
   */
  waitUntil(ping(env, `Newsletter: ${email}${town ? ` — ${town}` : ''} (${locale})`));
  if (token) {
    waitUntil(sendMail(env, { to: email, ...welcomeMail(locale as Locale, token) }));
  }

  return done();
};
