/**
 * The organiser's identity: a link.
 *
 * There is no login. The token in the URL is derived — HMAC of the link's id
 * under ADMIN_SIGNING_SECRET — and the table holds only its SHA-256 for
 * lookup. Two things follow: a copy of the database yields no working links
 * without the secret, and the daily mail script (which holds the same secret
 * on GitHub) can put the organiser's link into the buttons without the token
 * ever being stored. One live link per organiser — minting a new one revokes
 * the old, which is also how a leaked link is dealt with.
 */

import { insertOne, selectOne, updateRows, UUID, type RestEnv } from './_rest';
import { sha256Hex, tokenFor } from './_link';

export { answerUrl, editUrl, tokenFor } from './_link';

export interface LinkEnv extends RestEnv {
  ADMIN_SIGNING_SECRET?: string;
}

export interface Organiser {
  id: string;
  name: string;
  email: string | null;
  locale: string | null;
}

export interface OrganiserLink {
  id: string;
  organiser_id: string;
  token_hash: string;
  revoked_at: string | null;
}

/** Revoke whatever link the organiser had, mint a fresh one, return the token for the mail. */
export async function mintLink(env: LinkEnv, organiserId: string): Promise<string | null> {
  if (!env.ADMIN_SIGNING_SECRET?.trim()) return null;

  await updateRows(env, 'organiser_links', `organiser_id=eq.${organiserId}&revoked_at=is.null`, {
    revoked_at: new Date().toISOString(),
  });

  const id = crypto.randomUUID();
  const token = await tokenFor(env.ADMIN_SIGNING_SECRET, id);
  const row = await insertOne<OrganiserLink>(env, 'organiser_links', {
    id,
    organiser_id: organiserId,
    token_hash: await sha256Hex(token),
  });
  return row ? token : null;
}

/** The organiser a token stands for, or null. Touches last_used_at. */
export async function organiserFromToken(env: RestEnv, token: string): Promise<Organiser | null> {
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;
  const hash = await sha256Hex(token);
  const link = await selectOne<OrganiserLink>(
    env, 'organiser_links', `token_hash=eq.${hash}&revoked_at=is.null`, 'id,organiser_id,token_hash,revoked_at'
  );
  if (!link) return null;

  const organiser = await selectOne<Organiser>(
    env, 'organisers', `id=eq.${link.organiser_id}`, 'id,name,email,locale'
  );
  if (organiser) {
    await updateRows(env, 'organiser_links', `id=eq.${link.id}`, { last_used_at: new Date().toISOString() });
  }
  return organiser;
}

export { UUID };
