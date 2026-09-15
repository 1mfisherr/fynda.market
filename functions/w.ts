/**
 * Resend webhook — POST /w
 *
 * What happened to a mail after it left: delivered, opened, clicked, bounced,
 * complained. Resend posts one event at a time, signed the Svix way, and
 * retries anything that does not get a 2xx back — so this returns 200 only
 * once the rows are written, and 500 when the database refused, which is what
 * makes a retry the right thing.
 *
 * Three writes per event, in this order:
 *
 *   1. newsletter_events — the event as received, keyed on Svix's delivery
 *      id. A webhook delivered twice inserts once; nothing below is harmful
 *      to repeat either, but the log stays honest.
 *   2. newsletter_sends — the first-time stamp for this mail (opened_at,
 *      clicked_at, …), matched on Resend's email id, which the digest wrote
 *      onto the row when the batch call answered.
 *   3. newsletter_subscribers — on a permanent bounce or a spam complaint,
 *      the same suppression the unsubscribe link applies. Matched on the
 *      address rather than the send row, so a welcome mail that bounces (no
 *      send row) is suppressed too.
 *
 * The signature check is the whole of the authentication. It is done by hand
 * against the raw body — a dependency for one HMAC is a dependency to keep
 * updated, and the Function must not pull in the site's module graph anyway.
 * Svix: signed content is `${id}.${timestamp}.${body}`, key is the base64
 * after `whsec_`, signature header holds one or more `v1,<base64>`.
 *
 * Setting it up (once, by hand): Resend → Webhooks → Add endpoint
 * https://fynda.market/w with the email.* events; the signing secret it shows
 * becomes the Cloudflare Pages secret RESEND_WEBHOOK_SECRET. Open and click
 * tracking is a per-domain switch in Resend → Domains, and without it the
 * only events are delivered and bounced.
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_WEBHOOK_SECRET: string;
}

interface ResendEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    to?: string[];
    click?: { link?: string };
    bounce?: { type?: string; subType?: string; message?: string };
  };
}

/** Svix keeps a five-minute window against replay. */
const TOLERANCE_SECONDS = 5 * 60;

const decodeBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const encodeBase64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)));

async function verify(request: Request, body: string, secret: string): Promise<boolean> {
  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signatures = request.headers.get('svix-signature');
  if (!id || !timestamp || !signatures) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    decodeBase64(secret.replace(/^whsec_/, '')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expected = encodeBase64(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`))
  );

  // Any one matching v1 signature is enough: Svix sends several during a
  // secret rotation.
  return signatures.split(' ').some((entry) => {
    const [version, value] = entry.split(',');
    return version === 'v1' && value?.length === expected.length && timingSafeEqual(value, expected);
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The stamp each event type sets on the send row, first time only. */
const STAMP: Record<string, string> = {
  'email.delivered': 'delivered_at',
  'email.opened': 'opened_at',
  'email.clicked': 'clicked_at',
  'email.bounced': 'bounced_at',
  'email.complained': 'complained_at',
};

async function rest(env: Env, path: string, init: RequestInit & { prefer?: string }): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: init.prefer ?? 'return=minimal',
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.RESEND_WEBHOOK_SECRET) {
    return new Response('not configured', { status: 503 });
  }

  const body = await request.text();
  if (!(await verify(request, body, env.RESEND_WEBHOOK_SECRET))) {
    return new Response('bad signature', { status: 401 });
  }

  let event: ResendEvent;
  try { event = JSON.parse(body); } catch { return new Response('bad json', { status: 400 }); }

  // Domain and contact events exist too; nothing here wants them.
  const emailId = event.data?.email_id;
  if (!event.type?.startsWith('email.') || !emailId) return new Response(null, { status: 204 });

  const svixId = request.headers.get('svix-id')!;
  const occurredAt = event.created_at ?? new Date().toISOString();

  // 1. The log. `on_conflict` with ignore-duplicates is INSERT … ON CONFLICT
  //    DO NOTHING, so a redelivered webhook is a no-op here and harmless below.
  const logged = await rest(env, 'newsletter_events?on_conflict=svix_id', {
    method: 'POST',
    prefer: 'return=minimal,resolution=ignore-duplicates',
    body: JSON.stringify({
      svix_id: svixId,
      email_id: emailId,
      type: event.type,
      occurred_at: occurredAt,
      link: event.data.click?.link ?? null,
      payload: event,
    }),
  });
  if (!logged.ok) {
    console.log('webhook event insert rejected', logged.status, await logged.text());
    return new Response('db', { status: 500 });
  }

  // 2. The first-time stamp on the send. The `is.null` filter is what makes
  //    it first-time: a second open matches no row.
  const column = STAMP[event.type];
  if (column) {
    const stamped = await rest(env, `newsletter_sends?email_id=eq.${emailId}&${column}=is.null`, {
      method: 'PATCH',
      body: JSON.stringify({ [column]: occurredAt }),
    });
    if (!stamped.ok) console.log('webhook stamp rejected', stamped.status, await stamped.text());
  }

  // 3. Suppression. A permanent bounce or a complaint ends the subscription
  //    exactly as the unsubscribe link would — and a transient bounce (a full
  //    mailbox) does not.
  const permanent = event.type === 'email.bounced' && event.data.bounce?.type === 'Permanent';
  const complained = event.type === 'email.complained';
  const address = event.data.to?.[0]?.trim().toLowerCase();
  if ((permanent || complained) && address) {
    const suppressed = await rest(
      env,
      `newsletter_subscribers?email=ilike.${encodeURIComponent(address)}&unsubscribed_at=is.null`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          unsubscribed_at: occurredAt,
          source_path: null,
          referrer_host: null,
          signup_ip_hash: null,
        }),
      }
    );
    if (!suppressed.ok) console.log('webhook suppression rejected', suppressed.status, await suppressed.text());
  }

  return new Response(null, { status: 204 });
};
