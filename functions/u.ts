/**
 * Unsubscribe — GET or POST /u?t=<token>
 *
 * The link at the bottom of every newsletter. It has to work in one click,
 * from a mail client, with no login and no form to fill in, so the token in
 * the URL is the whole of the authentication: unguessable, stable for the life
 * of the row, and good for nothing except leaving the list.
 *
 * GET is a person clicking the link and gets a page back. POST is the mail
 * client doing it on their behalf — Gmail and Apple Mail show an unsubscribe
 * button of their own when a mail carries List-Unsubscribe-Post, and they POST
 * this URL without ever opening it. Both do exactly the same thing.
 *
 * Leaving does not delete the row. It sets `unsubscribed_at` and wipes the
 * identifying extras, which leaves the minimal suppression record the privacy
 * policy promises: an address we must not write to again, and the dates the
 * consent was given and withdrawn.
 *
 * The page is written here rather than built by Astro. It is reached once,
 * from an e-mail, by someone who is leaving — a route in the site's own build
 * would mean four new URLs, four new sitemap exclusions and a guardrail change
 * for a page nobody navigates to.
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

type Locale = 'de' | 'fr' | 'it' | 'en';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COPY: Record<Locale, { title: string; done: string; note: string; back: string }> = {
  de: {
    title: 'Abgemeldet',
    done: 'Sie sind abgemeldet.',
    note: 'Wir schreiben Ihnen nicht mehr. Sie können sich jederzeit wieder anmelden.',
    back: 'Zurück zu fynda.market',
  },
  fr: {
    title: 'Désinscrit',
    done: 'Vous êtes désinscrit.',
    note: 'Nous ne vous écrirons plus. Vous pouvez vous réinscrire à tout moment.',
    back: 'Retour à fynda.market',
  },
  it: {
    title: 'Cancellato',
    done: 'Sei stato cancellato.',
    note: 'Non ti scriveremo più. Puoi iscriverti di nuovo quando vuoi.',
    back: 'Torna a fynda.market',
  },
  en: {
    title: 'Unsubscribed',
    done: 'You’re unsubscribed.',
    note: 'We won’t write to you again. You can sign up again any time.',
    back: 'Back to fynda.market',
  },
};

const INVALID = {
  title: 'Link not valid',
  done: 'This unsubscribe link is no longer valid.',
  note: 'It may already have been used. If you are still getting mail from us, reply to any of it and we will take you off the list by hand.',
  back: 'Back to fynda.market',
};

/**
 * One column, system fonts, brand colours inline. Same reasoning as the mail
 * itself: this page is not part of the site's build and must not depend on a
 * stylesheet it cannot see.
 */
function page(locale: string, copy: { title: string; done: string; note: string; back: string }, status: number) {
  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${copy.title} — fynda.market</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff;">
<main style="max-width:480px;margin:12vh auto 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#16161a;">
  <p style="margin:0 0 32px;font-size:20px;font-weight:700;letter-spacing:-0.01em;">fynda.market</p>
  <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;letter-spacing:-0.02em;">${copy.done}</h1>
  <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#6b6b70;">${copy.note}</p>
  <p style="margin:0;font-size:16px;"><a href="https://fynda.market/" style="color:#16161a;">${copy.back}</a></p>
</main>
</body></html>`;

  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/**
 * Returns the locale of the row it unsubscribed, or null when the token
 * matched nothing.
 *
 * PATCH rather than a read followed by a write: one round trip, and a token
 * that matches nothing simply returns no rows.
 */
async function unsubscribe(env: Env, token: string): Promise<Locale | null> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/newsletter_subscribers?unsubscribe_token=eq.${token}&select=locale`,
    {
      method: 'PATCH',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        unsubscribed_at: new Date().toISOString(),
        // The identifying extras go. consent_text stays: it is the evidence of
        // what was agreed to, and the record of consent and its withdrawal is
        // the reason the row is kept at all.
        town: null,
        source_path: null,
        referrer_host: null,
        signup_ip_hash: null,
      }),
    }
  );

  if (!res.ok) {
    console.log('unsubscribe rejected', res.status, await res.text());
    return null;
  }

  const rows = (await res.json()) as Array<{ locale?: string }>;
  const locale = rows[0]?.locale;
  return locale === 'de' || locale === 'fr' || locale === 'it' || locale === 'en' ? locale : null;
}

async function handle(request: Request, env: Env): Promise<Response> {
  const token = new URL(request.url).searchParams.get('t')?.trim() ?? '';

  if (!UUID.test(token)) return page('en', INVALID, 400);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return page('en', INVALID, 503);

  const locale = await unsubscribe(env, token);
  if (!locale) return page('en', INVALID, 404);

  return page(locale, COPY[locale], 200);
}

export const onRequestGet: PagesFunction<Env> = ({ request, env }) => handle(request, env);

/*
 * One-click, from the mail client. It sends `List-Unsubscribe=One-Click` as a
 * form body and reads only the status code, so there is nothing to render — but
 * it must do the same work, and it must not require the body to be anything in
 * particular.
 */
export const onRequestPost: PagesFunction<Env> = ({ request, env }) => handle(request, env);
