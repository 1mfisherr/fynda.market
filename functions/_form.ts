/**
 * The plumbing every form endpoint needs, written once.
 *
 * Three endpoints now take a form post — /n the newsletter, /r a report, /o an
 * organiser claim — and they agree about all the boring parts: how a browser
 * that posted the form itself is answered, how an IP becomes a hash, how a bot
 * is turned away, and how Delfim is told. The first version of this lived
 * inside /n. Copying it twice is how three endpoints slowly stop behaving the
 * same way, which on a form means one of them quietly saving nothing.
 *
 * What is NOT here is anything a particular form decides: which fields are
 * required, what counts as valid, what gets written. Those belong to the
 * endpoint.
 */

import { isProbablyBot } from './_collect';

export interface FormEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  /** Rotates. The same salt the analytics collector hashes visitors with. */
  ANALYTICS_SALT?: string;
  /** Set both and a submission pings Telegram; leave unset and it does not. */
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

/**
 * The answer to a form the browser posted itself, with no JavaScript in the
 * way: send them back to the page they came from, at the fragment that reveals
 * the right sentence. The page carries every outcome and CSS `:target` picks
 * one, so the words stay in the visitor's own language and are written in
 * exactly one place.
 */
export const seeOther = (to: string) =>
  new Response(null, { status: 303, headers: { location: to, 'cache-control': 'no-store' } });

/** Same shape as the analytics visitor hash: hex, and never reversible to an IP. */
export async function hmacHex(key: string, message: string): Promise<string> {
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
 * Best effort and never awaited into the response: a submission that saved must
 * report success even if Telegram is down or was never configured.
 */
export async function ping(env: FormEnv, text: string): Promise<void> {
  // Trimmed, and not optional. A secret set by piping a value into the CLI
  // arrives with the shell's trailing newline attached, which puts a line break
  // inside the request URL and inside the chat id. The first newsletter signup
  // notified nobody and said nothing about why.
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

/** True when the post came from somewhere that is not this site. */
export function crossOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).hostname !== new URL(request.url).hostname;
  } catch {
    return true;
  }
}

export const looksLikeBot = (request: Request) =>
  isProbablyBot(request.headers.get('user-agent'));

/**
 * Two encodings, one handler. `fetch` sends JSON; a browser posting the form on
 * its own -- no JavaScript, or a script that never loaded -- sends urlencoded
 * fields. The second is the one that has to keep working, because it is the one
 * that needs nothing of the visitor's device.
 *
 * Returns null when the body could not be read at all.
 */
export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return (request.headers.get('content-type') ?? '').includes('application/json')
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return null;
  }
}

/** A same-site path, or null. Query and fragment are dropped. */
export function pathFrom(body: Record<string, unknown>): string | null {
  if (typeof body.path !== 'string' || !body.path.startsWith('/')) return null;
  return body.path.split('?')[0].split('#')[0].slice(0, 2048);
}

/**
 * Nobody focuses a field, types an answer and submits inside one second.
 *
 * The number is milliseconds since the visitor first touched the form, NOT
 * since the page loaded -- a floor measured from page load catches real people
 * the moment the form moves up a page, and it answers them with a success while
 * saving nothing. Only checked when the browser actually sent a number: a form
 * posted without JavaScript carries no timing, and a password manager may fill
 * a field with no keystroke at all.
 */
export function tooFast(body: Record<string, unknown>): boolean {
  const elapsed = body.elapsed_ms;
  return (
    typeof elapsed === 'number' && Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 1000
  );
}

/** Anything in the honeypot came from a bot: the field is hidden from people. */
export const trapped = (body: Record<string, unknown>) =>
  typeof body.website === 'string' && body.website.trim() !== '';

/** Hashed with a purpose prefix, so the same IP is a different hash per form. */
export async function ipHash(
  env: FormEnv,
  request: Request,
  purpose: string
): Promise<string | null> {
  if (!env.ANALYTICS_SALT) return null;
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '';
  return hmacHex(env.ANALYTICS_SALT, `${purpose}|${ip}`);
}

/** The referring host, or null when it was us or unreadable. */
export function referrerHost(request: Request): string | null {
  const referer = request.headers.get('referer');
  if (!referer) return null;
  try {
    const host = new URL(referer).hostname;
    return host === new URL(request.url).hostname ? null : host;
  } catch {
    return null;
  }
}

/**
 * One insert, through PostgREST, as the service role.
 *
 * Returns the created row's id, or null when the write failed -- and logs the
 * body PostgREST sent back, because a rejected insert is otherwise invisible:
 * an empty table and no error anywhere. That is how the missing GRANT on the
 * newsletter table stayed hidden until someone posted a real address.
 */
export async function insertRow(
  env: FormEnv,
  table: string,
  row: Record<string, unknown>
): Promise<string | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?select=id`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    console.log(`${table} insert rejected`, res.status, await res.text());
    return null;
  }

  const saved = (await res.json().catch(() => [])) as Array<{ id?: string }>;
  return saved[0]?.id ?? null;
}

/**
 * Does this market id exist?
 *
 * The id arrives in a query string on a page anyone can read, so it is checked
 * rather than trusted -- a foreign key violation would fail the whole insert
 * and lose the report, which is the one outcome worth writing this to avoid.
 * A no is not an error: the row is saved with a null id and the text the person
 * typed, and lands in the queue a human matches.
 */
export async function marketExists(env: FormEnv, id: string): Promise<boolean> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return false;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false;

  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/markets?id=eq.${id}&select=id&limit=1`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!res.ok) return false;
    const rows = (await res.json().catch(() => [])) as unknown[];
    return rows.length > 0;
  } catch {
    return false;
  }
}

export const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

/** Trimmed, capped, and null rather than an empty string. */
export const text = (value: unknown, max: number): string | null => {
  const trimmed = String(value ?? '').trim();
  return trimmed ? trimmed.slice(0, max) : null;
};
