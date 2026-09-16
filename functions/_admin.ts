/**
 * Delfim's one tap.
 *
 * Every decision this site asks of him — approve a claim, accept that a market
 * has stopped, publish an edit — arrives in Telegram as a message with two
 * links, Approve and Reject. Each link names an `admin_actions` row and carries
 * an HMAC of the row id and the verb, signed with ADMIN_SIGNING_SECRET. The
 * row records whether it was used, so a link works once and for fourteen days.
 *
 * No bot webhook, no admin login, no dashboard: the secret is the door and
 * Telegram is where he already is. If the secret ever leaks, rotate it — every
 * outstanding link stops working, and nothing else is affected.
 */

import { hmacHex, ping, type FormEnv } from './_form';
import { insertOne, selectOne, updateRows, UUID, type RestEnv } from './_rest';

export interface AdminEnv extends FormEnv, RestEnv {
  ADMIN_SIGNING_SECRET?: string;
}

export type ActionKind = 'claim' | 'market_stopped' | 'edit';
export type Verb = 'approve' | 'reject';

export interface AdminAction {
  id: string;
  kind: ActionKind;
  payload: Record<string, unknown>;
  created_at: string;
  used_at: string | null;
  outcome: string | null;
}

const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

const sign = (env: AdminEnv, id: string, verb: Verb) =>
  hmacHex(env.ADMIN_SIGNING_SECRET!.trim(), `${id}|${verb}`);

/**
 * Write the action, build the two links, tell Delfim.
 *
 * `text` is the situation in his words — who, which market, what they said.
 * Returns the action id, or null when nothing could be offered (no secret set,
 * or the insert failed), in which case the caller still pings him the plain
 * text so nothing is lost, only the shortcut.
 */
export async function offerDecision(
  env: AdminEnv,
  origin: string,
  kind: ActionKind,
  payload: Record<string, unknown>,
  text: string
): Promise<string | null> {
  if (!env.ADMIN_SIGNING_SECRET?.trim()) {
    await ping(env, `${text}\n\n(no ADMIN_SIGNING_SECRET — decide by hand)`);
    return null;
  }

  const action = await insertOne<AdminAction>(env, 'admin_actions', { kind, payload });
  if (!action) {
    await ping(env, `${text}\n\n(could not write admin_actions — decide by hand)`);
    return null;
  }

  const link = async (verb: Verb) =>
    `${origin}/adm/${action.id}/${verb}?s=${await sign(env, action.id, verb)}`;

  await ping(env, `${text}\n\n✅ Approve: ${await link('approve')}\n❌ Reject: ${await link('reject')}`);
  return action.id;
}

export type Verified =
  | { ok: true; action: AdminAction }
  | { ok: false; reason: 'bad_link' | 'expired' | 'used' | 'no_secret' };

/** Check a link from Telegram. Does not mark it used — the caller does, after acting. */
export async function verifyDecision(
  env: AdminEnv,
  id: string,
  verb: string,
  sig: string | null
): Promise<Verified> {
  if (!env.ADMIN_SIGNING_SECRET?.trim()) return { ok: false, reason: 'no_secret' };
  if (!UUID.test(id) || (verb !== 'approve' && verb !== 'reject') || !sig) {
    return { ok: false, reason: 'bad_link' };
  }

  const expected = await sign(env, id, verb);
  if (!timingSafeEqual(expected, sig)) return { ok: false, reason: 'bad_link' };

  const action = await selectOne<AdminAction>(env, 'admin_actions', `id=eq.${id}`);
  if (!action) return { ok: false, reason: 'bad_link' };
  if (action.used_at) return { ok: false, reason: 'used' };
  if (Date.now() - new Date(action.created_at).getTime() > FOURTEEN_DAYS) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true, action };
}

export async function markUsed(env: AdminEnv, id: string, outcome: 'approved' | 'rejected') {
  await updateRows(env, 'admin_actions', `id=eq.${id}`, {
    used_at: new Date().toISOString(),
    outcome,
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
