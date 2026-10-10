/**
 * "Were you there?" — POST /v.
 *
 * One tap on a market page, the day a market closed and the two days after:
 * it ran, or it did not (PAGES.md, 2026-10-10). Written to date_answers,
 * anonymous — the date, the answer, the page, a hashed connection to cap
 * repeats. A yes makes the date *Seen on* in the page's record at the next
 * build (view occurrence_seen); a no goes to Delfim in Telegram the way a
 * report does, because a market that did not happen is the thing this site
 * exists to catch.
 *
 * Answers JSON to the page's script; a browser that posted the form itself
 * goes back to the page at #wason-done.
 */

import { crossOrigin, ipHash, json, looksLikeBot, pathFrom, ping, readBody, seeOther, type FormEnv } from './_form';
import { insertOne, recentFrom, selectOne, UUID } from './_rest';

export const onRequestPost: PagesFunction<FormEnv> = async ({ request, env, waitUntil }) => {
  if (crossOrigin(request)) return json(403, { ok: false });
  if (looksLikeBot(request)) return json(202, { ok: true });

  const body = await readBody(request);
  if (!body) return json(400, { ok: false });

  const path = pathFrom(body);
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const done = () => (wantsJson ? json(200, { ok: true }) : seeOther(`${path ?? '/'}#wason-done`));

  const occurrence = String(body.occurrence ?? '');
  const answer = String(body.answer ?? '');
  if (!UUID.test(occurrence) || (answer !== 'on' && answer !== 'off')) return json(422, { ok: false });
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json(503, { ok: false });

  /* A real date that has started — today's or an earlier one — and nothing
     else: an id from a page anyone can read is checked, not trusted. */
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date());
  const date = await selectOne<{ id: string; date: string }>(env, 'occurrences', `id=eq.${occurrence}&date=lte.${today}`, 'id,date');
  if (!date) return json(422, { ok: false });

  /* Ten answers an hour from one connection is more than any person gives. */
  const ip_hash = await ipHash(env, request, 'date-answer');
  if ((await recentFrom(env, 'date_answers', 'ip_hash', 'created_at', ip_hash)) >= 10) return done();

  const saved = await insertOne(env, 'date_answers', { occurrence_id: occurrence, answer, source_path: path, ip_hash });
  if (!saved) return json(500, { ok: false });

  if (answer === 'off') waitUntil(ping(env, `Were you there? NO — ${path ?? '?'} (${date.date})`));
  return done();
};
