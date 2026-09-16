/**
 * The organiser's identity: a link.
 *
 * There is no login. The token in the URL is 32 random bytes; the table holds
 * its SHA-256 and nothing else, so a copy of the database cannot become a set
 * of working links. One live link per organiser — minting a new one revokes
 * the old, which is also how a leaked link is dealt with.
 */

import { insertOne, selectOne, updateRows, type RestEnv } from './_rest';

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

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Revoke whatever link the organiser had, mint a fresh one, return the token for the mail. */
export async function mintLink(env: RestEnv, organiserId: string): Promise<string | null> {
  await updateRows(env, 'organiser_links', `organiser_id=eq.${organiserId}&revoked_at=is.null`, {
    revoked_at: new Date().toISOString(),
  });

  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = base64url(bytes);

  const row = await insertOne<OrganiserLink>(env, 'organiser_links', {
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

export const editUrl = (origin: string, token: string) => `${origin}/a/${token}/edit`;
