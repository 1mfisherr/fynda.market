/**
 * Putting an address on the weekly list — the part two endpoints share.
 *
 * /n is the weekly card's own endpoint. /b, "tell me when it's back", carries
 * the weekly mail as an unticked offer beside its alert, and a tick there must
 * do exactly what the card does: the same row, the same welcome, the same
 * Telegram line. So the subscription lives here once rather than in /n with a
 * second copy in /b (functions.md: one endpoint per table, shared parts in a
 * module). What each form accepts and how it answers stays with the endpoint.
 */

import { domainOf, ping, type FormEnv } from './_form';
import { sendMail, welcomeMail, type Locale, type MailEnv } from './_mail';

export interface NewsletterEnv extends FormEnv, MailEnv {}

/**
 * A town or canton slug from the page, resolved against the database rather
 * than trusted. A slug we do not hold resolves to nothing, and nothing is what
 * an absent one means too — so a made-up value cannot reach a row.
 */
export async function resolveSlug(env: FormEnv, kind: 'region' | 'city', slug: string | null): Promise<string | null> {
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const found = (await fetch(
    `${env.SUPABASE_URL}/rest/v1/slugs?entity_type=eq.${kind}&slug=eq.${encodeURIComponent(slug)}&select=entity_id&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  )
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])) as Array<{ entity_id?: string }>;
  return found[0]?.entity_id ?? null;
}

export interface Subscription {
  email: string;
  locale: Locale;
  /** At most one of the two: a canton, or a town and a distance. Neither is the whole country. */
  region_id: string | null;
  city_id: string | null;
  radius_km: number | null;
  source_path: string | null;
  referrer_host: string | null;
  signup_ip_hash: string | null;
  /** The exact words shown beside the button. Never sent as null — see below. */
  consent_text: string | null;
  /** For the Telegram line only: "25 km um zurich". */
  where: string;
}

/**
 * The upsert, then the ping and the welcome.
 *
 * Upsert on the address: a second signup updates the place and undoes an
 * earlier unsubscribe, and must never fail with a duplicate key the page would
 * show as "something went wrong". created_at and unsubscribe_token are left
 * alone, so old unsubscribe links keep working. The token comes back because
 * the welcome mail carries it.
 *
 * `consent_text` is only sent when there is one: an upsert updates exactly the
 * columns present, so a null here would let a later signup erase an earlier
 * one's consent record — the one field that must not be lost.
 *
 * The welcome proves the address works and carries the unsubscribe link, so it
 * goes on every signup. Neither it nor the ping is awaited, and a failure of
 * either still leaves the address on the list.
 */
export async function subscribe(
  env: NewsletterEnv,
  waitUntil: (promise: Promise<unknown>) => void,
  sub: Subscription
): Promise<boolean> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return false;

  const { consent_text, where, ...rest } = sub;
  const row: Record<string, unknown> = { ...rest, unsubscribed_at: null };
  if (consent_text) row.consent_text = consent_text;

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
    return false;
  }

  const saved = (await res.json().catch(() => [])) as Array<{ unsubscribe_token?: string }>;
  const token = saved[0]?.unsubscribe_token;

  waitUntil(ping(env, `Newsletter: ${domainOf(sub.email)}${where ? ` — ${where}` : ''} (${sub.locale})`));
  if (token) waitUntil(sendMail(env, { to: sub.email, ...welcomeMail(sub.locale, token) }));
  return true;
}
