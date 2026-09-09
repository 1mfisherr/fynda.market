/**
 * "This is my market" — POST /o.
 *
 * The supply side, and the only form on this site where the person filling it
 * in is worth more to us than the answer they give. PRODUCT.md's reference case
 * is Bandsintown over Songkick: whoever the organiser tells first when it rains
 * owns the truth, and this row is the start of that relationship.
 *
 * So nothing here is ever thrown away, and nothing is automated. A claim does
 * not change a market page, does not set `verified_by`, and does not mark
 * anything confirmed. It puts a person's name, their market and a way to reach
 * them in front of Delfim, who answers it himself -- which is what the form
 * promises and, at 157 markets, what it should keep promising.
 */

import { localeOf } from './_collect';
import {
  EMAIL, crossOrigin, insertRow, ipHash, json, looksLikeBot, marketExists,
  pathFrom, ping, readBody, seeOther, text, tooFast, trapped, type FormEnv,
} from './_form';
import { claimAck, sendMail, type Locale, type MailEnv } from './_mail';

interface Env extends FormEnv, MailEnv {}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  if (crossOrigin(request)) return json(403, { ok: false });
  if (looksLikeBot(request)) return json(202, { ok: true });

  const body = await readBody(request);
  if (!body) return json(400, { ok: false, error: 'bad_request' });

  const path = pathFrom(body);
  const locale = (path && localeOf(path)) ?? 'de';

  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const back = path ?? '/';
  const done = () => (wantsJson ? json(200, { ok: true }) : seeOther(`${back}#form-done`));
  const quiet = () => (wantsJson ? json(202, { ok: true }) : seeOther(`${back}#form-done`));
  const failed = (status: number, error: string, hash: string) =>
    wantsJson ? json(status, { ok: false, error }) : seeOther(`${back}#${hash}`);

  if (trapped(body) || tooFast(body)) return quiet();

  /*
   * Four required fields, and every one of them is required for a reason the
   * organiser would recognise: who you are, how to reach you, which market, and
   * where it is. There is no fifth. An organiser filling this in is doing us
   * the favour.
   */
  const organiser_name = text(body.name, 200);
  const market_text = text(body.markt, 300);
  const email = text(body.email, 254)?.toLowerCase() ?? null;

  if (!organiser_name || !market_text) return failed(422, 'required', 'form-invalid');
  if (!email || !EMAIL.test(email)) return failed(422, 'email', 'form-invalid');

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return failed(503, 'unavailable', 'form-failed');
  }

  /*
   * The market id rides along from the claim card on the market page, which is
   * where most of these will come from -- 124 of 157 markets carry that card.
   * Checked rather than trusted, for the same reason as the report form: a bad
   * id in a query string must not be able to fail the insert.
   */
  const mid = text(body.mid, 64);
  const market_id = mid && (await marketExists(env, mid)) ? mid : null;

  const town = text(body.ort, 120);

  const id = await insertRow(env, 'organiser_claims', {
    market_id,
    market_text,
    town,
    organiser_name,
    email,
    message: text(body.nachricht, 4000),
    locale,
    source_path: path,
    claim_ip_hash: await ipHash(env, request, 'claim'),
  });

  if (!id) return failed(500, 'save_failed', 'form-failed');

  /*
   * The ping is louder than the newsletter's on purpose: a claim is the one
   * submission that decays if it sits for a week. Somebody has offered to be
   * the source of truth for a market and is waiting to hear back.
   */
  const where = market_id ? '' : ' [unmatched]';
  waitUntil(ping(
    env,
    `ORGANISER: ${market_text}${where}\n${organiser_name} <${email}>\n${town ?? '—'} (${locale})`
  ));
  waitUntil(sendMail(env, { to: email, ...claimAck(locale as Locale, market_text) }));

  return done();
};
