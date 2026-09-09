/**
 * Newsletter signup — POST /n.
 *
 * The first form on this site that did not open the visitor's mail program, and
 * now one of three: /r takes a report and /o an organiser claim. Everything the
 * three agree about lives in `_form.ts`; what is left here is what only a
 * signup decides.
 *
 * It writes a row and answers; the page then says "you're in" without leaving.
 *
 * Deliberately small. There is no confirmation mail to click, because the
 * privacy policy promises the subscription is active immediately, and because
 * a confirmation step loses roughly a third of the people who meant to join.
 * What is kept instead is evidence of consent: when, from which page, in which
 * language, and the words they agreed to.
 *
 * If anything here fails, the page falls back to the mail program it used
 * before, so a broken endpoint cannot be worse than no endpoint.
 */

import { localeOf } from './_collect';
import {
  EMAIL, crossOrigin, ipHash, json, looksLikeBot, pathFrom, ping,
  readBody, referrerHost, seeOther, text, tooFast, trapped, type FormEnv,
} from './_form';
import { sendMail, welcomeMail, type Locale, type MailEnv } from './_mail';

interface Env extends FormEnv, MailEnv {}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  if (crossOrigin(request)) return json(403, { ok: false });
  if (looksLikeBot(request)) return json(202, { ok: true });

  const body = await readBody(request);
  if (!body) return json(400, { ok: false, error: 'bad_request' });

  const path = pathFrom(body);
  const locale = (path && localeOf(path)) ?? 'de';

  /*
   * How to answer. `fetch` asks for JSON and gets it; the browser's own form
   * post gets sent back to the page. Both say the same three things.
   */
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const back = path ?? '/';
  const done = () => (wantsJson ? json(200, { ok: true }) : seeOther(`${back}#form-done`));
  /** Saved nothing on purpose, and says so to nobody: the caller is a bot. */
  const quiet = () => (wantsJson ? json(202, { ok: true }) : seeOther(`${back}#form-done`));
  const failed = (status: number, error: string, hash: string) =>
    wantsJson ? json(status, { ok: false, error }) : seeOther(`${back}#${hash}`);

  // The honeypot, and a fill no person could have typed. Both answer nothing.
  if (trapped(body) || tooFast(body)) return quiet();

  const email = text(body.email, 254)?.toLowerCase() ?? null;
  if (!email || !EMAIL.test(email)) return failed(422, 'email', 'form-invalid');

  const town = text(body.town ?? body.stadt, 80);

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    // Nothing is configured, so nothing can be saved. Say so plainly rather
    // than showing a success the visitor did not get.
    return failed(503, 'unavailable', 'form-failed');
  }

  const row: Record<string, unknown> = {
    email,
    town,
    locale,
    source_path: path,
    referrer_host: referrerHost(request),
    signup_ip_hash: await ipHash(env, request, 'newsletter'),
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
  const consent = text(body.consent_text, 500);
  if (consent) row.consent_text = consent;

  /*
   * Upsert on the address rather than a plain insert, which is why this does
   * not use `_form.ts`'s `insertRow`. A second signup from the same person
   * updates their town and undoes an earlier unsubscribe — it must never fail
   * with a duplicate-key error that the page would show as "something went
   * wrong". created_at and unsubscribe_token are left alone, so old unsubscribe
   * links keep working.
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
    return failed(500, 'save_failed', 'form-failed');
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
