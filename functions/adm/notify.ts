/**
 * POST /adm/notify — the Market Watch run on Delfim's PC asks the site to send
 * its report to Telegram, because the Telegram key lives only here.
 *
 * Body: {run: <watch_runs id>, s: HMAC(ADMIN_SIGNING_SECRET, "notify|<run>")}.
 * The text is never taken from the request: it is the report the run stored in
 * watch_runs, so a forged call could at worst re-send a report — and a report
 * is sent once (`notified_at`). Long reports go as several messages, split
 * between findings, under Telegram's 4,096-character limit.
 */

import { hmacHex, json, ping, type FormEnv } from '../_form';
import { selectOne, updateRows, UUID, type RestEnv } from '../_rest';

interface Env extends FormEnv, RestEnv { ADMIN_SIGNING_SECRET?: string }

interface Run { id: string; report: string | null; notified_at: string | null }

const LIMIT = 3900;

function chunks(report: string): string[] {
  const out: string[] = [];
  let current = '';
  for (const part of report.split('\n\n')) {
    const next = current ? `${current}\n\n${part}` : part;
    if (next.length > LIMIT && current) { out.push(current); current = part.slice(0, LIMIT); }
    else current = next.slice(0, LIMIT);
  }
  if (current) out.push(current);
  return out;
}

function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const secret = env.ADMIN_SIGNING_SECRET?.trim();
  if (!secret) return json(503, { ok: false, error: 'no_secret' });

  const body = (await request.json().catch(() => null)) as { run?: unknown; s?: unknown } | null;
  const run = String(body?.run ?? '');
  const sig = String(body?.s ?? '');
  if (!UUID.test(run) || !sameHex(await hmacHex(secret, `notify|${run}`), sig)) return json(403, { ok: false, error: 'bad_signature' });

  const row = await selectOne<Run>(env, 'watch_runs', `id=eq.${run}`, 'id,report,notified_at');
  if (!row) return json(404, { ok: false, error: 'no_run' });
  if (row.notified_at) return json(200, { ok: true, sent: 0, already: true });
  if (!row.report) return json(200, { ok: true, sent: 0 });

  const parts = chunks(row.report);
  for (const part of parts) await ping(env, part);
  await updateRows(env, 'watch_runs', `id=eq.${run}`, { notified_at: new Date().toISOString() });
  return json(200, { ok: true, sent: parts.length });
};
