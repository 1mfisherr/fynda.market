/**
 * Newsletter signup — POST /n.
 *
 * The first form on this site that did not open the visitor's mail program, and
 * now one of four: /r takes a report, /o an organiser claim and /b a "tell me
 * when it's back". Everything they agree about lives in `_form.ts`, and putting
 * an address on the weekly list — which /b can do too — in `_newsletter.ts`;
 * what is left here is what only this signup decides.
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
import { recentFrom } from './_rest';
import {
  EMAIL, crossOrigin, ipHash, json, looksLikeBot, pathFrom,
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
  const locale = (path && localeOf(path)) ?? 'de';

  /*
   * How to answer. `fetch` asks for JSON and gets it; the browser's own form
   * post gets sent back to the page. Both say the same three things.
   */
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const back = path ?? '/';

  /*
   * Which set of result messages to land on. The utility pages own `#form-*`;
   * the signup block that sits on every other page owns `#sub-*`. Without this
   * the two would need one set of ids between them, and a page carrying both
   * would have them twice.
   */
  const prefix = /^[a-z]{1,10}$/.test(String(body.anchor ?? '')) ? String(body.anchor) : 'form';
  const done = () => (wantsJson ? json(200, { ok: true }) : seeOther(`${back}#${prefix}-done`));
  /** Saved nothing on purpose, and says so to nobody: the caller is a bot. */
  const quiet = () => (wantsJson ? json(202, { ok: true }) : seeOther(`${back}#${prefix}-done`));
  const failed = (status: number, error: string, hash: string) =>
    wantsJson ? json(status, { ok: false, error }) : seeOther(`${back}#${prefix}-${hash}`);

  // The honeypot, and a fill no person could have typed. Both answer nothing.
  if (trapped(body) || tooFast(body)) return quiet();

  const email = text(body.email, 254)?.toLowerCase() ?? null;
  if (!email || !EMAIL.test(email)) return failed(422, 'email', 'invalid');

  /*
   * The canton, as a slug, resolved against the database rather than trusted.
   *
   * It used to be a town the visitor typed, which is how the first real signup
   * arrived with the town "Ua". Nothing was wrong with the validation — the
   * field should never have been a question. The form now carries the canton
   * from the page the visitor was standing on, and posts the slug that is
   * already public in that page's URL.
   */
  const regionSlug = text(body.region, 80)?.toLowerCase() ?? null;

  /*
   * The other shape: a place and a distance. A city page and a market page send
   * this instead of a canton, because "near me" is the question those pages are
   * about — a canton is thirty times bigger in Graubünden than in Zug, so the
   * same subscription means very different things to two readers.
   */
  const citySlug = text(body.city, 80)?.toLowerCase() ?? null;
  const radius = Number(body.radius);

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    // Nothing is configured, so nothing can be saved. Say so plainly rather
    // than showing a success the visitor did not get.
    return failed(503, 'unavailable', 'failed');
  }

  /*
   * A city wins where both arrive, because it is the more precise of the two
   * and the database refuses a row holding both anyway — see the check
   * constraint in migration 20260910160000.
   */
  const city_id = await resolveSlug(env, 'city', citySlug);
  const region_id = city_id ? null : await resolveSlug(env, 'region', regionSlug);

  /* Clamped rather than rejected: a radius nobody can type wrong. The offered
     values are in src/lib/geo.ts. */
  const radius_km = city_id
    ? Math.min(200, Math.max(1, Number.isFinite(radius) ? Math.round(radius) : 25))
    : null;

  /* Five signups an hour from one connection. Each one mails a welcome to the
     address typed, so without a cap the form could be used to mail strangers. */
  const signup_ip_hash = await ipHash(env, request, 'newsletter');
  if ((await recentFrom(env, 'newsletter_subscribers', 'signup_ip_hash', 'created_at', signup_ip_hash)) >= 5) return quiet();

  const saved = await subscribe(env, waitUntil, {
    email,
    locale: locale as Locale,
    region_id,
    city_id,
    radius_km,
    source_path: path,
    referrer_host: referrerHost(request),
    signup_ip_hash,
    // The exact words shown next to the button, kept so consent can be shown rather than asserted.
    consent_text: text(body.consent_text, 500),
    where: city_id ? `${radius_km} km um ${citySlug}` : region_id ? String(regionSlug) : '',
  });

  return saved ? done() : failed(500, 'save_failed', 'failed');
};
