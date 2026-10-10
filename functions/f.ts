/**
 * "One more, if you know" — POST /f.
 *
 * After a yes to "Were you there?" the card asks one thing the market's page
 * is missing: how big it was, who was selling, indoors or out (PAGES.md,
 * Delfim 2026-10-10). One tap, anonymous — the market, the field, the answer,
 * the page, a hashed connection to count people and cap repeats.
 *
 * Nobody's answer is published on its own. fact_answer_settle() publishes a
 * value once three different connections agree; until then each answer
 * reaches Delfim in Telegram with Approve / Reject (functions/adm). Either way
 * it lands only where the market has no value yet.
 *
 * Answers JSON to the page's script; a browser that posted the form itself
 * goes back to the page at #wason-done.
 */

import { offerDecision, type AdminEnv } from './_admin';
import { crossOrigin, ipHash, json, looksLikeBot, pathFrom, ping, readBody, seeOther } from './_form';
import { insertOne, recentFrom, rpc, selectOne, UUID } from './_rest';

const VALUES: Record<string, string[]> = {
  size_band: ['small', 'medium', 'large'],
  seller_mix: ['private', 'mixed', 'trader'],
  setting: ['indoor', 'outdoor', 'both'],
};

/* Delfim reads English (the site's own words, src/lib/strings.ts en). */
const SAYS: Record<string, Record<string, string>> = {
  size_band: { small: 'under 30 stalls', medium: '30–100 stalls', large: 'over 100 stalls' },
  seller_mix: { private: 'mostly private people', mixed: 'private people and dealers', trader: 'mostly dealers' },
  setting: { indoor: 'indoors', outdoor: 'outdoors', both: 'indoors and out' },
};

export const onRequestPost: PagesFunction<AdminEnv> = async ({ request, env, waitUntil }) => {
  if (crossOrigin(request)) return json(403, { ok: false });
  if (looksLikeBot(request)) return json(202, { ok: true });

  const body = await readBody(request);
  if (!body) return json(400, { ok: false });

  const path = pathFrom(body);
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const done = () => (wantsJson ? json(200, { ok: true }) : seeOther(`${path ?? '/'}#wason-done`));

  const market = String(body.market ?? '');
  const occurrence = String(body.occurrence ?? '');
  const field = String(body.field ?? '');
  const value = String(body.value ?? '');
  if (!UUID.test(market) || !VALUES[field]?.includes(value)) return json(422, { ok: false });
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json(503, { ok: false });

  /* A real market — an id from a page anyone can read is checked, not trusted. */
  const row = await selectOne<{ id: string; slug: string; stall_count: number | null } & Record<string, unknown>>(
    env, 'markets', `id=eq.${market}`, `id,slug,stall_count,${field}`);
  if (!row) return json(422, { ok: false });

  /* Ten answers an hour from one connection is more than any person gives. */
  const ip_hash = await ipHash(env, request, 'fact-answer');
  if ((await recentFrom(env, 'fact_answers', 'ip_hash', 'created_at', ip_hash)) >= 10) return done();

  const saved = await insertOne(env, 'fact_answers', {
    market_id: market,
    occurrence_id: UUID.test(occurrence) ? occurrence : null,
    field, value, source_path: path, ip_hash,
  });
  if (!saved) return json(500, { ok: false });

  /* Already known — by the organiser, our research, or three visitors before
     this one: kept as evidence, nothing to decide. */
  if (row[field] != null || (field === 'size_band' && row.stall_count != null)) return done();

  waitUntil((async () => {
    const said = await rpc<string>(env, 'fact_answer_settle', { p_market: market, p_field: field });
    const line = `A visitor says ${row.slug} is ${SAYS[field][value]} (${path ?? '?'}).`;
    if (said === 'applied') await ping(env, `${line}\nThree people agree — published; on the page after tonight's build.`);
    else await offerDecision(env, new URL(request.url).origin, 'fact', { market_id: market, field, value },
      `${line}\n${said ?? 'Could not count the answers'} agree so far. Approve to publish it now.`);
  })());
  return done();
};
