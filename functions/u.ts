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
 *
 * Since 2026-09-15 the page is not a dead end. Under "you're unsubscribed" it
 * offers two quieter ways back — once a month, or a three-month pause — as
 * buttons that POST here with `keep=monthly|pause`. The same token
 * authenticates the choice: what can end a subscription can make it quieter.
 * A mail client's one-click POST carries no `keep` and still unsubscribes
 * outright, as RFC 8058 requires.
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

type Locale = 'de' | 'fr' | 'it' | 'en';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Copy {
  title: string;
  done: string;
  note: string;
  back: string;
  instead: string;
  monthly: string;
  pause: string;
  monthlyDone: string;
  monthlyNote: string;
  pausedDone: string;
  pausedNote: (until: string) => string;
  leave: string;
}

const COPY: Record<Locale, Copy> = {
  de: {
    title: 'Abgemeldet',
    done: 'Sie sind abgemeldet.',
    note: 'Wir schreiben Ihnen nicht mehr. Sie können sich jederzeit wieder anmelden.',
    back: 'Zurück zu fynda.market',
    instead: 'Zu oft? Es geht auch leiser:',
    monthly: 'Nur einmal im Monat',
    pause: 'Drei Monate Pause',
    monthlyDone: 'Einmal im Monat.',
    monthlyNote: 'Sie bekommen nur noch die Ausgabe am ersten Freitag des Monats.',
    pausedDone: 'Pause.',
    pausedNote: (until) => `Bis ${until} schreiben wir Ihnen nicht. Danach geht es weiter wie bisher.`,
    leave: 'Doch ganz abmelden',
  },
  fr: {
    title: 'Désinscrit',
    done: 'Vous êtes désinscrit.',
    note: 'Nous ne vous écrirons plus. Vous pouvez vous réinscrire à tout moment.',
    back: 'Retour à fynda.market',
    instead: 'Trop souvent ? Il y a plus discret :',
    monthly: 'Une fois par mois seulement',
    pause: 'Une pause de trois mois',
    monthlyDone: 'Une fois par mois.',
    monthlyNote: 'Vous ne recevrez plus que l’édition du premier vendredi du mois.',
    pausedDone: 'En pause.',
    pausedNote: (until) => `Nous ne vous écrirons pas avant le ${until}. Ensuite, tout reprend comme avant.`,
    leave: 'Me désinscrire quand même',
  },
  it: {
    title: 'Cancellato',
    done: 'Sei stato cancellato.',
    note: 'Non ti scriveremo più. Puoi iscriverti di nuovo quando vuoi.',
    back: 'Torna a fynda.market',
    instead: 'Troppo spesso? C’è anche una via più tranquilla:',
    monthly: 'Solo una volta al mese',
    pause: 'Una pausa di tre mesi',
    monthlyDone: 'Una volta al mese.',
    monthlyNote: 'Riceverai solo l’edizione del primo venerdì del mese.',
    pausedDone: 'In pausa.',
    pausedNote: (until) => `Non ti scriveremo prima del ${until}. Poi si riprende come prima.`,
    leave: 'Cancellami comunque',
  },
  en: {
    title: 'Unsubscribed',
    done: 'You’re unsubscribed.',
    note: 'We won’t write to you again. You can sign up again any time.',
    back: 'Back to fynda.market',
    instead: 'Too often? There are quieter ways to stay:',
    monthly: 'Once a month only',
    pause: 'Pause for three months',
    monthlyDone: 'Once a month.',
    monthlyNote: 'You’ll only get the issue of the first Friday of the month.',
    pausedDone: 'Paused.',
    pausedNote: (until) => `We won’t write to you before ${until}. After that, it carries on as before.`,
    leave: 'Unsubscribe after all',
  },
};

const INVALID = {
  title: 'Link not valid',
  done: 'This unsubscribe link is no longer valid.',
  note: 'It may already have been used. If you are still getting mail from us, reply to any of it and we will take you off the list by hand.',
  back: 'Back to fynda.market',
};

/** The choice buttons. Inline like everything else here — no stylesheet. */
const BUTTON =
  'display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:14px 18px;border:1px solid #16161a;border-radius:999px;background:#ffffff;color:#16161a;font:inherit;font-size:16px;font-weight:700;cursor:pointer;text-align:center;';

/** A one-button form that POSTs back here with a `keep` choice. */
const choice = (token: string, keep: string, label: string) =>
  `<form method="post" action="/u?t=${token}&keep=${keep}" style="margin:0;"><button type="submit" style="${BUTTON}">${label}</button></form>`;

/**
 * One column, system fonts, brand colours inline. Same reasoning as the mail
 * itself: this page is not part of the site's build and must not depend on a
 * stylesheet it cannot see.
 */
function page(
  locale: string,
  copy: { title: string; done: string; note: string; back: string },
  status: number,
  actions = ''
) {
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
  ${actions}
  <p style="margin:0;font-size:16px;"><a href="https://fynda.market/" style="color:#16161a;">${copy.back}</a></p>
</main>
</body></html>`;

  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/**
 * Writes one change to the row the token names and returns its locale, or
 * null when the token matched nothing.
 *
 * PATCH rather than a read followed by a write: one round trip, and a token
 * that matches nothing simply returns no rows. Every field sent must exist —
 * PostgREST refuses the whole update otherwise, which is how the unsubscribe
 * link was dead from 2026-09-10 to 2026-09-15: it still sent `town`, a column
 * dropped four days after this file was written, and every click landed on
 * "Link not valid" with the row untouched.
 */
async function patch(env: Env, token: string, body: Record<string, unknown>): Promise<Locale | null> {
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
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    console.log('unsubscribe patch rejected', res.status, await res.text());
    return null;
  }

  const rows = (await res.json()) as Array<{ locale?: string }>;
  const locale = rows[0]?.locale;
  return locale === 'de' || locale === 'fr' || locale === 'it' || locale === 'en' ? locale : null;
}

const unsubscribe = (env: Env, token: string) =>
  patch(env, token, {
    unsubscribed_at: new Date().toISOString(),
    // The identifying extras go. consent_text stays: it is the evidence of
    // what was agreed to, and the record of consent and its withdrawal is
    // the reason the row is kept at all.
    source_path: null,
    referrer_host: null,
    signup_ip_hash: null,
  });

/** "15.12.2026" in German, French and Italian; "15 December 2026" in English. */
function formatUntil(date: Date, locale: Locale): string {
  if (locale === 'en') {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('t')?.trim() ?? '';
  const keep = request.method === 'POST' ? url.searchParams.get('keep') : null;

  if (!UUID.test(token)) return page('en', INVALID, 400);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return page('en', INVALID, 503);

  // A quieter way to stay, chosen on the unsubscribed page. Each undoes the
  // unsubscribe and sets the preference; "leave after all" is the plain
  // unsubscribe below, offered again on the confirmation.
  if (keep === 'monthly') {
    const locale = await patch(env, token, { unsubscribed_at: null, cadence: 'monthly', paused_until: null });
    if (!locale) return page('en', INVALID, 404);
    const c = COPY[locale];
    return page(locale, { title: c.monthlyDone, done: c.monthlyDone, note: c.monthlyNote, back: c.back }, 200, choice(token, 'leave', c.leave));
  }
  if (keep === 'pause') {
    const until = new Date();
    until.setDate(until.getDate() + 90);
    const locale = await patch(env, token, { unsubscribed_at: null, paused_until: until.toISOString().slice(0, 10) });
    if (!locale) return page('en', INVALID, 404);
    const c = COPY[locale];
    return page(locale, { title: c.pausedDone, done: c.pausedDone, note: c.pausedNote(formatUntil(until, locale)), back: c.back }, 200, choice(token, 'leave', c.leave));
  }

  const locale = await unsubscribe(env, token);
  if (!locale) return page('en', INVALID, 404);

  const c = COPY[locale];
  const actions =
    `<p style="margin:0 0 12px;font-size:16px;line-height:1.55;">${c.instead}</p>` +
    choice(token, 'monthly', c.monthly) +
    choice(token, 'pause', c.pause) +
    '<div style="height:20px"></div>';
  return page(locale, c, 200, actions);
}

export const onRequestGet: PagesFunction<Env> = ({ request, env }) => handle(request, env);

/*
 * One-click, from the mail client. It sends `List-Unsubscribe=One-Click` as a
 * form body and reads only the status code, so there is nothing to render — but
 * it must do the same work, and it must not require the body to be anything in
 * particular.
 */
export const onRequestPost: PagesFunction<Env> = ({ request, env }) => handle(request, env);
