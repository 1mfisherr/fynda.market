/**
 * Report something wrong — POST /r.
 *
 * The front end of the only thing this site sells. PRODUCT.md: every competitor
 * concedes in its own help text that its dates cannot be trusted, and the one
 * thing none of them does is say when a date was last checked. That stamp is
 * only honest if there is a way for someone standing at a closed gate to tell
 * us -- and until now that way was "we open your mail program", which is where
 * a report goes to die.
 *
 * What arrives here is evidence, not an edit. Nothing on the site changes
 * because a row landed in `reports`; a person reads it, checks it, and only
 * then does the market page move. That is deliberate and it is the whole
 * difference between a freshness claim and a comment box.
 *
 * The market travels from the market page as an id, so most reports arrive
 * already attached to the right market. A report from the footer does not, and
 * is saved anyway with the words the person typed -- see the migration for why
 * dropping it would be the one unacceptable outcome.
 */

import { localeOf } from './_collect';
import {
  EMAIL, crossOrigin, insertRow, ipHash, json, looksLikeBot, marketExists,
  pathFrom, ping, readBody, seeOther, text, tooFast, trapped, type FormEnv,
} from './_form';
import { reportAck, sendMail, type Locale, type MailEnv } from './_mail';

interface Env extends FormEnv, MailEnv {}

/**
 * What the form's four choices mean in the database.
 *
 * The select posts these keys rather than its own visible labels, which are
 * written per language -- a German label reaching a check constraint that spells
 * things in English is a report lost to a 400. The market page's chips send the
 * same keys in `?grund=`, so there is one vocabulary between the page, the form
 * and the column.
 *
 * `permanently_closed` is a real report_type and is deliberately not offered:
 * "this market no longer exists" is a judgement about four markets we already
 * know about, not something to invite from a form.
 */
const REPORT_TYPES = new Set(['wrong_date', 'cancelled', 'wrong_location', 'other']);

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
  /** Saved nothing on purpose, and says so to nobody: the caller is a bot. */
  const quiet = () => (wantsJson ? json(202, { ok: true }) : seeOther(`${back}#form-done`));
  const failed = (status: number, error: string, hash: string) =>
    wantsJson ? json(status, { ok: false, error }) : seeOther(`${back}#${hash}`);

  if (trapped(body) || tooFast(body)) return quiet();

  /*
   * The market, as the person named it. Required, and it is the only required
   * field: someone who has just found a closed gate should have to tell us one
   * thing.
   */
  const market_text = text(body.markt, 300);
  if (!market_text) return failed(422, 'market', 'form-invalid');

  /*
   * An address is optional and the form says so. A report is worth having with
   * no way to reply -- demanding one costs more reports than it earns answers --
   * but a wrong one is worth saying something about, because someone who typed
   * it wanted to hear back.
   */
  const emailRaw = text(body.email, 254)?.toLowerCase() ?? null;
  if (emailRaw && !EMAIL.test(emailRaw)) return failed(422, 'email', 'form-invalid');

  const reason = String(body.grund ?? '').trim();
  const report_type = REPORT_TYPES.has(reason) ? reason : 'other';

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    // Nothing is configured, so nothing can be saved. Say so plainly rather
    // than showing a success the reporter did not get.
    return failed(503, 'unavailable', 'form-failed');
  }

  /*
   * The market id rides along from the market page. Checked rather than
   * trusted: it is in a query string anyone can edit, and a bad id would fail
   * the insert on its foreign key and take the whole report with it.
   */
  const mid = text(body.mid, 64);
  const market_id = mid && (await marketExists(env, mid)) ? mid : null;

  const id = await insertRow(env, 'reports', {
    market_id,
    market_text,
    report_type,
    note: text(body.nachricht, 4000),
    email: emailRaw,
    locale,
    source_path: path,
    reporter_ip_hash: await ipHash(env, request, 'report'),
  });

  if (!id) return failed(500, 'save_failed', 'form-failed');

  /*
   * Told, then answered -- both after the row is safe, and neither awaited. A
   * report that saved is a success whether or not the mail went out; the row is
   * in the queue either way.
   *
   * The acknowledgement is not a courtesy. It is the one moment this site can
   * say out loud that a person reads these, which is the claim the whole
   * freshness argument rests on.
   */
  const where = market_id ? '' : ' [unmatched]';
  waitUntil(ping(env, `Report (${report_type}): ${market_text}${where} — ${emailRaw ?? 'no address'} (${locale})`));
  if (emailRaw) {
    waitUntil(sendMail(env, { to: emailRaw, ...reportAck(locale as Locale, market_text) }));
  }

  return done();
};
