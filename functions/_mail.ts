/**
 * The one place this site sends an e-mail.
 *
 * Every form eventually comes through here — the newsletter today, the report
 * and organiser forms next — so the sender, the failure behaviour and the
 * unsubscribe headers are written once and cannot drift apart.
 *
 * Sending goes through Resend. The key is a Cloudflare Pages secret; with no
 * key set, `sendMail` does nothing and says so, which is what keeps a local or
 * preview deployment from mailing real people.
 *
 * Nothing here is ever awaited into a visitor's response. A signup that saved
 * is a success whether or not the welcome mail went out — the address is in
 * our database either way, and a mail that failed can be sent again.
 */

export interface MailEnv {
  /** Resend API key. Unset = sending is off, not broken. */
  RESEND_API_KEY?: string;
}

/**
 * Who the mail is from.
 *
 * The same address the site prints on every page, and the same address
 * Cloudflare Email Routing forwards to Delfim — so a reply lands somewhere a
 * person reads, rather than in a no-reply hole.
 */
export const FROM = 'Fynda <contact@fynda.market>';
export const SITE = 'https://fynda.market';

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Extra headers. Used for the one-click unsubscribe. */
  headers?: Record<string, string>;
}

/**
 * Returns true when the mail was accepted by Resend.
 *
 * Never throws: a caller is always a request that has already succeeded at the
 * thing the visitor asked for.
 */
export async function sendMail(env: MailEnv, mail: Mail): Promise<boolean> {
  const key = env.RESEND_API_KEY?.trim();
  if (!key) {
    console.log('mail skipped, no RESEND_API_KEY', mail.subject);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.headers ? { headers: mail.headers } : {}),
      }),
    });

    if (!res.ok) {
      // Resend answers with a JSON body naming the problem — an unverified
      // domain, a malformed from, a revoked key. Log it, or a silent failure is
      // indistinguishable from a mail nobody opened.
      console.log('resend rejected', res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.log('resend unreachable', String(error));
    return false;
  }
}

/**
 * Up to a hundred mails in one call — what the weekly digest sends through.
 *
 * Resend's own limit is 100 per call, and batching is what removes the need
 * for a queue at this size: the provider absorbs the orchestration, so the
 * send job stays a script that runs once a week rather than infrastructure
 * that has to be kept alive.
 *
 * Reports rather than throws, and reports the whole batch as one outcome. The
 * caller has already written a row per recipient saying "this issue has been
 * sent to them"; if the call fails it has to be able to take those rows back,
 * and a half-known result is no use for that.
 */
export async function sendBatch(
  env: MailEnv,
  mails: Mail[]
): Promise<{ sent: number; error?: string }> {
  const key = env.RESEND_API_KEY?.trim();
  if (!key) return { sent: 0, error: 'no RESEND_API_KEY' };
  if (mails.length === 0) return { sent: 0 };
  if (mails.length > 100) return { sent: 0, error: `batch of ${mails.length}, Resend allows 100` };

  try {
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(
        mails.map((mail) => ({
          from: FROM,
          to: [mail.to],
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          ...(mail.headers ? { headers: mail.headers } : {}),
        }))
      ),
    });

    if (!res.ok) return { sent: 0, error: `${res.status} ${await res.text()}` };

    const body = (await res.json().catch(() => ({}))) as { data?: unknown[] };
    return { sent: Array.isArray(body.data) ? body.data.length : mails.length };
  } catch (error) {
    return { sent: 0, error: String(error) };
  }
}

/* -------------------------------------------------------------------------- */
/* The welcome mail                                                           */
/* -------------------------------------------------------------------------- */

export type Locale = 'de' | 'fr' | 'it' | 'en';

export const unsubscribeUrl = (token: string) => `${SITE}/u?t=${token}`;

interface Welcome {
  subject: string;
  /** Sentences, in order. Rendered as paragraphs in HTML and lines in text. */
  body: string[];
  unsubscribe: string;
}

/**
 * Four languages, because the site has four and a subscriber signed up in one
 * of them. Deliberately short: it confirms the address works, says what is
 * coming and when, and carries the unsubscribe link that makes the next mail
 * lawful to send.
 *
 * It names the day, because the day is now real: NEWSLETTER_SENDING was set
 * on 2026-09-09 and the digest goes out at 06:00 UTC every Friday. For the two
 * weeks before that these lines said the mail was "being set up" instead —
 * true at the time, and the right thing to say rather than name a Friday that
 * would pass with nothing in anybody's inbox. If sending is ever switched off
 * again, put that hedge back in the same commit.
 */
const WELCOME: Record<Locale, Welcome> = {
  de: {
    subject: 'Sie sind dabei — fynda.market',
    body: [
      'Ihre E-Mail-Adresse steht auf der Liste. Die erste Ausgabe kommt am Freitagmorgen.',
      'Neue Termine, die dazugekommen sind, und Absagen, damit Sie nicht umsonst hinfahren. Einmal pro Woche, nie öfter.',
      'Wenn Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail einfach — oder melden Sie sich unten mit einem Klick wieder ab.',
    ],
    unsubscribe: 'Abmelden',
  },
  fr: {
    subject: 'Vous êtes inscrit — fynda.market',
    body: [
      "Votre adresse est sur la liste. Le premier numéro arrive vendredi matin.",
      'Les nouvelles dates ajoutées, et les annulations, pour ne pas vous déplacer pour rien. Une fois par semaine, jamais plus.',
      "Si vous ne vous êtes pas inscrit, ignorez simplement cet e-mail — ou désinscrivez-vous ci-dessous en un clic.",
    ],
    unsubscribe: 'Se désinscrire',
  },
  it: {
    subject: 'Sei iscritto — fynda.market',
    body: [
      'Il tuo indirizzo è nella lista. Il primo numero arriva venerdì mattina.',
      'Le nuove date aggiunte e le cancellazioni, per non fare il viaggio a vuoto. Una volta a settimana, mai di più.',
      'Se non ti sei iscritto tu, ignora questa e-mail — oppure cancellati qui sotto con un clic.',
    ],
    unsubscribe: 'Cancellati',
  },
  en: {
    subject: 'You’re in — fynda.market',
    body: [
      'Your address is on the list. The first one arrives on Friday morning.',
      'New dates that have been added, and cancellations, so you don’t make the trip for nothing. Once a week, never more.',
      'If you didn’t sign up, just ignore this e-mail — or unsubscribe below in one click.',
    ],
    unsubscribe: 'Unsubscribe',
  },
};

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The dates in these mails, in the reader's own language.
 *
 * `Intl` rather than the site's own weekday tables, because those live in
 * src/lib and this file is bundled into a Pages Function: importing across
 * that line pulls the whole interface-strings module into a Worker that needs
 * four month names. The BCP-47 tags are the one thing duplicated, and they are
 * the same four `LOCALE` carries.
 */
const TAG: Record<Locale, string> = {
  de: 'de-CH', fr: 'fr-CH', it: 'it-CH', en: 'en-GB',
};

/** A YYYY-MM-DD read as a day on a calendar, never as an instant in UTC. */
const asDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const day = (locale: Locale, iso: string) =>
  new Intl.DateTimeFormat(TAG[locale], { weekday: 'long', day: 'numeric', month: 'long' })
    .format(asDate(iso));

/** "12. – 13. September", collapsed to one date where both are the same. */
const range = (locale: Locale, from: string, to: string) => {
  const fmt = new Intl.DateTimeFormat(TAG[locale], { day: 'numeric', month: 'long' });
  return from === to ? fmt.format(asDate(from)) : `${fmt.format(asDate(from))} – ${fmt.format(asDate(to))}`;
};


/**
 * The one column every mail this site sends is built in.
 *
 * Built by hand rather than from the site's own components: mail clients throw
 * away stylesheets, ignore custom fonts and disagree about everything else, so
 * this is one column, inline styles and no images. The brand shows up as the
 * wordmark and the accent on the one link, and stops there.
 *
 * `footer` is optional because only one kind of mail has one. A newsletter must
 * carry an unsubscribe link and an answer to a form must not: putting one on a
 * transactional mail offers to unsubscribe somebody from a conversation they
 * started, and teaches the mail client to file the answer as marketing.
 */
function column(locale: Locale, body: string[], footer?: string): string {
  const paragraphs = body
    .map((line) => `<p style="margin:0 0 16px;">${escape(line)}</p>`)
    .join('');

  return `<!doctype html>
<html lang="${locale}"><body style="margin:0;padding:24px;background:#ffffff;">
<div style="max-width:520px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#16161a;">
  <p style="margin:0 0 24px;font-size:20px;font-weight:700;letter-spacing:-0.01em;">fynda.market</p>
  ${paragraphs}${footer ?? ''}
</div>
</body></html>`;
}

export function welcomeMail(locale: Locale, token: string): Omit<Mail, 'to'> {
  const copy = WELCOME[locale] ?? WELCOME.de;
  const url = unsubscribeUrl(token);

  const footer = `
  <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e5e5e5;font-size:13px;color:#6b6b70;">
    <a href="${url}" style="color:#6b6b70;">${escape(copy.unsubscribe)}</a>
  </p>`;

  const html = column(locale, copy.body, footer);
  const text = `fynda.market\n\n${copy.body.join('\n\n')}\n\n${copy.unsubscribe}: ${url}\n`;

  return {
    subject: copy.subject,
    html,
    text,
    /*
     * The unsubscribe a mail client offers in its own chrome. Gmail and Apple
     * Mail put a button next to the sender when these two are present, and
     * treat a list without them as a reason to filter. One-click means the
     * client POSTs the URL itself, which /u accepts.
     */
    headers: {
      'List-Unsubscribe': `<${url}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

/* -------------------------------------------------------------------------- */
/* The two answers a form sends                                               */
/* -------------------------------------------------------------------------- */

/**
 * What a report and a claim get back, in the language the form was in.
 *
 * Both are deliberately short and neither promises a date. What they do say is
 * the one thing that makes the freshness stamp on every market page mean
 * anything: a person reads this. `%s` is the market as the sender named it,
 * quoted back so they can see we understood which one they meant — and so an
 * organiser who claimed the wrong market notices straight away.
 *
 * No unsubscribe footer, and that is not an oversight: these are answers to
 * something somebody sent us, not a list they joined.
 */
interface Ack {
  subject: string;
  body: string[];
}

const REPORT_ACK: Record<Locale, Ack> = {
  de: {
    subject: 'Danke — wir prüfen das',
    body: [
      'Ihre Meldung ist angekommen: %s.',
      'Wir prüfen jede Meldung von Hand, bevor sich auf der Marktseite etwas ändert — und schreiben dort dann hin, wann wir das zuletzt geprüft haben. Das dauert in der Regel ein bis zwei Tage.',
      'Automatisch ändert sich nichts. Das ist Absicht: ein falsch übernommener Hinweis wäre schlimmer als gar keiner.',
    ],
  },
  fr: {
    subject: 'Merci — nous vérifions',
    body: [
      'Votre signalement nous est parvenu : %s.',
      "Nous vérifions chaque signalement à la main avant de modifier quoi que ce soit sur la page de la brocante — et nous y indiquons ensuite la date de cette vérification. Cela prend en général un à deux jours.",
      "Rien ne change automatiquement. C'est voulu : une correction reprise à tort serait pire que pas de correction du tout.",
    ],
  },
  it: {
    subject: 'Grazie — controlliamo noi',
    body: [
      'La tua segnalazione è arrivata: %s.',
      'Controlliamo ogni segnalazione a mano prima di cambiare qualcosa sulla pagina del mercato — e lì scriviamo poi quando lo abbiamo verificato. Di solito ci vogliono uno o due giorni.',
      'Nulla cambia automaticamente. È voluto: una correzione presa per buona a torto sarebbe peggio di nessuna correzione.',
    ],
  },
  en: {
    subject: 'Thanks — we’ll check it',
    body: [
      'Your report has arrived: %s.',
      'We check every report by hand before anything changes on the market page — and then we write there when we last checked. This usually takes a day or two.',
      'Nothing changes automatically. That is deliberate: a correction taken on trust and wrong would be worse than none at all.',
    ],
  },
};

const CLAIM_ACK: Record<Locale, Ack> = {
  de: {
    subject: 'Ihre Marktseite — wir melden uns',
    body: [
      'Danke, dass Sie sich gemeldet haben: %s.',
      'Delfim schreibt Ihnen persönlich zurück, meist innert weniger Tage. Bis dahin ändert sich an Ihrer Marktseite nichts — bevor wir dort etwas anfassen, fragen wir Sie.',
      'Kostenlos, ohne Konto, für immer. Wenn Sie in der Zwischenzeit etwas ergänzen möchten, antworten Sie einfach auf diese E-Mail.',
    ],
  },
  fr: {
    subject: 'Votre page — nous vous répondons',
    body: [
      'Merci de nous avoir écrit : %s.',
      "Delfim vous répondra personnellement, en général en quelques jours. D'ici là, rien ne change sur votre page — avant d'y toucher, nous vous demandons.",
      "Gratuit, sans compte, pour toujours. Si vous voulez ajouter quelque chose entre-temps, répondez simplement à cet e-mail.",
    ],
  },
  it: {
    subject: 'La tua pagina — ti rispondiamo',
    body: [
      'Grazie per averci scritto: %s.',
      'Delfim ti risponderà personalmente, di solito in pochi giorni. Fino ad allora sulla tua pagina non cambia nulla — prima di toccare qualcosa, te lo chiediamo.',
      'Gratuito, senza account, per sempre. Se nel frattempo vuoi aggiungere qualcosa, rispondi semplicemente a questa e-mail.',
    ],
  },
  en: {
    subject: 'Your market page — we’ll be in touch',
    body: [
      'Thanks for getting in touch: %s.',
      'Delfim will write back personally, usually within a few days. Until then nothing on your market page changes — before we touch anything there, we ask you.',
      'Free, no account, forever. If you want to add something in the meantime, just reply to this e-mail.',
    ],
  },
};

/** The market name goes in as text; `column` escapes it on the way to the HTML. */
function ack(locale: Locale, table: Record<Locale, Ack>, market: string): Omit<Mail, 'to'> {
  const copy = table[locale] ?? table.de;
  const body = copy.body.map((line) => line.replace('%s', market));
  return {
    subject: copy.subject,
    html: column(locale, body),
    text: `fynda.market\n\n${body.join('\n\n')}\n`,
  };
}

export const reportAck = (locale: Locale, market: string) => ack(locale, REPORT_ACK, market);
export const claimAck = (locale: Locale, market: string) => ack(locale, CLAIM_ACK, market);

/* -------------------------------------------------------------------------- */
/* The weekly digest                                                          */
/* -------------------------------------------------------------------------- */

/**
 * One line of the issue, already flattened by src/lib/digest.ts.
 *
 * Declared here rather than imported so that nothing in a Pages Function
 * depends on the site's own module graph. The shape is small enough that the
 * duplication costs less than the coupling would.
 *
 * The cost of that duplication, found 2026-09-09: this copy had drifted from
 * the real one and was missing two fields the digest passes and this file
 * reads. Nothing caught it, because `functions/` is excluded from tsconfig and
 * `npm run check` therefore never looked at this file. `npm run check:functions`
 * does, and it runs inside `verify` -- a duplicated interface is only a boundary
 * if something compares it to the thing it duplicates.
 */
export interface DigestLine {
  name: string;
  town: string;
  date: string;
  startTime?: string;
  endTime?: string;
  /** Site-relative; made absolute below, because a mail has no page to sit on. */
  path: string;
  cancelled: boolean;
  cancellationNote?: string;
  badge?: { label: string; colour: string };
  /** The square thumbnail, site-relative. Absent means no photograph. */
  image?: string;
  /** The wide photograph, for the one market shown large. */
  hero?: string;
}

export interface DigestIssue {
  from: string;
  to: string;
  /** "Kanton Zürich", already in the reader's own language. */
  region?: string;
  /** Shown large, above the lists. */
  lead?: DigestLine;
  /**
   * Whether the lead is a market in the reader's own canton.
   *
   * It decides which day band the lead sits under, because a picture of
   * somewhere they cannot get to is a worse opening than one of somewhere they
   * can. src/lib/digest.ts computes it and this copy of the shape was missing
   * it, for the reason at the top of this block.
   */
  leadInRegion: boolean;
  own: DigestLine[];
  elsewhere: DigestLine[];
  total: number;
  more: { href: string; count: number; region?: string };
}

interface DigestCopy {
  /** `{dates}` is the weekend, "12. – 13. September". */
  subject: string;
  subjectRegion: string;
  /** The line the inbox shows beside the subject. Numbers, front-loaded. */
  preheaderRegion: string;
  preheaderNone: string;
  preheaderCountry: string;
  headline: string;
  headlineRegion: string;
  countOne: string;
  countMany: string;
  /** The section label over their own canton's markets. */
  inRegion: string;
  elsewhere: string;
  /** Under their canton's heading when nothing is on in it. */
  nothingHere: string;
  cancelled: string;
  more: string;
  /** The same link when what got cut was their own canton's markets. */
  moreRegion: string;
  unsubscribe: string;
  /** Why they are getting this, above the unsubscribe link. */
  why: string;
}

const DIGEST: Record<Locale, DigestCopy> = {
  de: {
    subject: 'Flohmärkte am Wochenende — {dates}',
    subjectRegion: 'Flohmärkte im {region} — {dates}',
    preheaderRegion: '{own} im {region}, {rest} anderswo in der Schweiz.',
    preheaderNone: 'Nichts im {region} an diesem Wochenende — aber {rest} anderswo.',
    preheaderCountry: 'Alle Flohmärkte des Wochenendes, mit den Absagen.',
    headline: 'Dieses Wochenende',
    headlineRegion: 'Dieses Wochenende im {region}',
    countOne: '{total} Flohmarkt',
    countMany: '{total} Flohmärkte',
    inRegion: 'Im {region}',
    elsewhere: 'Anderswo in der Schweiz',
    nothingHere: 'Hier ist an diesem Wochenende nichts angekündigt.',
    cancelled: 'Abgesagt',
    more: 'Alle {count} Märkte ansehen',
    moreRegion: 'Alle {count} Märkte im {region}',
    unsubscribe: 'Abmelden',
    why: 'Sie bekommen diese E-Mail, weil Sie sich auf fynda.market dafür eingetragen haben.',
  },
  fr: {
    subject: 'Brocantes ce week-end — {dates}',
    subjectRegion: 'Brocantes dans le {region} — {dates}',
    preheaderRegion: '{own} dans le {region}, {rest} ailleurs en Suisse.',
    preheaderNone: 'Rien dans le {region} ce week-end — mais {rest} ailleurs.',
    preheaderCountry: 'Toutes les brocantes du week-end, annulations comprises.',
    headline: 'Ce week-end',
    headlineRegion: 'Ce week-end dans le {region}',
    countOne: '{total} brocante',
    countMany: '{total} brocantes',
    inRegion: 'Dans le {region}',
    elsewhere: 'Ailleurs en Suisse',
    nothingHere: "Rien n'est annoncé ici ce week-end.",
    cancelled: 'Annulée',
    more: 'Voir les {count} brocantes',
    moreRegion: 'Voir les {count} brocantes dans le {region}',
    unsubscribe: 'Se désinscrire',
    why: 'Vous recevez cet e-mail parce que vous vous êtes inscrit sur fynda.market.',
  },
  it: {
    subject: 'Mercatini questo fine settimana — {dates}',
    subjectRegion: 'Mercatini nel {region} — {dates}',
    preheaderRegion: '{own} nel {region}, {rest} altrove in Svizzera.',
    preheaderNone: 'Niente nel {region} questo fine settimana — ma {rest} altrove.',
    preheaderCountry: 'Tutti i mercatini del fine settimana, cancellazioni incluse.',
    headline: 'Questo fine settimana',
    headlineRegion: 'Questo fine settimana nel {region}',
    countOne: '{total} mercatino',
    countMany: '{total} mercatini',
    inRegion: 'Nel {region}',
    elsewhere: 'Altrove in Svizzera',
    nothingHere: 'Qui non è annunciato nulla per questo fine settimana.',
    cancelled: 'Annullato',
    more: 'Vedere tutti i {count} mercatini',
    moreRegion: 'Vedere tutti i {count} mercatini nel {region}',
    unsubscribe: 'Cancellati',
    why: 'Riceve questa e-mail perché si è iscritto su fynda.market.',
  },
  en: {
    subject: 'Flea markets this weekend — {dates}',
    subjectRegion: 'Flea markets in the {region} — {dates}',
    preheaderRegion: '{own} in the {region}, {rest} elsewhere in Switzerland.',
    preheaderNone: 'Nothing in the {region} this weekend — but {rest} elsewhere.',
    preheaderCountry: 'Every flea market on this weekend, cancellations included.',
    headline: 'This weekend',
    headlineRegion: 'This weekend in the {region}',
    countOne: '{total} flea market',
    countMany: '{total} flea markets',
    inRegion: 'In the {region}',
    elsewhere: 'Elsewhere in Switzerland',
    nothingHere: 'Nothing is announced here this weekend.',
    cancelled: 'Cancelled',
    more: 'See all {count} markets',
    moreRegion: 'See all {count} markets in the {region}',
    unsubscribe: 'Unsubscribe',
    why: 'You are getting this e-mail because you signed up for it on fynda.market.',
  },
};

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

/** "07:00–17:00", or just the opening time, or nothing at all. */
const clock = (line: DigestLine) => {
  const from = line.startTime?.slice(0, 5);
  const to = line.endTime?.slice(0, 5);
  if (from && to) return `${from}–${to}`;
  return from ?? '';
};

/** Lines in the order given, grouped under the day they fall on. */
function byDay(lines: DigestLine[]): Array<[string, DigestLine[]]> {
  const days = new Map<string, DigestLine[]>();
  for (const line of lines) {
    const held = days.get(line.date) ?? [];
    held.push(line);
    days.set(line.date, held);
  }
  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/* --------------------------------------------------------------------------
 * The pieces of the layout
 *
 * One column, 600px, tables, inline styles on everything. The classes carry
 * only the dark-mode overrides and one mobile breakpoint: Gmail strips the
 * <style> block entirely and inverts the palette itself, so nothing may
 * depend on a rule surviving.
 * ------------------------------------------------------------------------ */

const PAD = 'padding-left:32px;padding-right:32px;';
const RULE = '#E8E6E2';
const INK = '#111110';
const GREY = '#6E6C68';
const ACCENT = '#FF4A2B';
const PAPER = '#EDEBE7';

/** Small, spaced, upper case: the label over a block of days. */
const sectionHtml = (text: string) => `
  <tr><td class="pad grey" style="${PAD}padding-top:30px;padding-bottom:2px;font-size:12px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:${GREY};">${escape(text)}</td></tr>`;

/**
 * The day band.
 *
 * The one place the accent appears in a list, and the reason it can: the date
 * is the fact a reader is scanning for, and saying it once per day rather than
 * once per row is what keeps it loud. The rows underneath then need no colour
 * of their own.
 */
const dayHtml = (locale: Locale, date: string) => `
  <tr><td class="pad" style="${PAD}padding-top:22px;padding-bottom:8px;font-size:15px;font-weight:700;color:${ACCENT};">${escape(day(locale, date))}</td></tr>`;

/**
 * The photograph beside a row.
 *
 * `alt` is deliberately empty: the market's name is the next thing in the
 * markup, so a screen reader that also read the picture would say it twice,
 * and a blocked image leaves a gap rather than a duplicate. The width and
 * height attributes are there as well as in the style because Outlook reads
 * the attributes and ignores the rest.
 *
 * A market with no photograph keeps its square anyway, in paper grey — the
 * column has to line up down the whole list, and an empty tile says nothing
 * untrue. Every one of the 157 has a picture today; this is for the 158th.
 */
const photoHtml = (line: DigestLine) =>
  line.image
    ? `<img src="${SITE}${line.image}" width="80" height="80" alt="" style="display:block;width:80px;height:80px;border-radius:6px;border:0;outline:none;text-decoration:none;">`
    : `<div class="tile" style="width:80px;height:80px;border-radius:6px;background:${PAPER};"></div>`;

function rowHtml(line: DigestLine, copy: DigestCopy): string {
  const url = `${SITE}${line.path}`;
  const where = [clock(line), line.town].filter(Boolean).join(' · ');

  /* On the quiet line, not beside the name. Next to the name it sat on the end
     of whatever length that name happened to be, and "Flohmarkt Paulusheim
     (Kinderartikelboerse)" pushed it past the edge of the card — a table cell
     has no width to be pushed against. It is metadata; it belongs with the
     other metadata. */
  const badge = line.badge
    ? ` <span style="display:inline-block;margin-left:4px;padding:1px 6px;border-radius:3px;background:${line.badge.colour};color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:0.04em;">${escape(line.badge.label)}</span>`
    : '';

  /* A cancellation is the most useful thing in the whole e-mail. It is said in
     a word, struck through, and it loses the type colour — the system says
     "not happening" without needing a badge to say it (docs/BRAND.md). */
  const title = line.cancelled
    ? `<s class="grey" style="color:${GREY};">${escape(line.name)}</s> <span style="color:${ACCENT};">${escape(copy.cancelled)}</span>`
    : `<a href="${url}" class="ink" style="color:${INK};text-decoration:none;">${escape(line.name)}</a>`;

  const note = line.cancellationNote
    ? `<div class="grey" style="padding-top:2px;font-size:14px;color:${GREY};">${escape(line.cancellationNote)}</div>`
    : '';

  /* Two cells rather than a float: Outlook's rendering engine is Word's, and
     Word has no floats. A fixed-width first cell is the one layout that holds
     everywhere. */
  return `
  <tr><td class="pad rule" style="${PAD}padding-top:14px;padding-bottom:14px;border-top:1px solid ${RULE};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="80" valign="top" style="width:80px;padding-right:14px;">
        <a href="${url}" style="text-decoration:none;">${photoHtml(line)}</a>
      </td>
      <td valign="middle">
        <div class="ink" style="font-size:17px;font-weight:700;line-height:1.3;color:${INK};word-break:break-word;">${title}</div>
        <div class="grey" style="padding-top:4px;font-size:14px;line-height:1.5;color:${GREY};">${escape(where)}${badge}</div>
        ${note}
      </td>
    </tr></table>
  </td></tr>`;
}

/**
 * The one market shown large.
 *
 * The wide photograph rather than the square, scaled to the column: the heroes
 * are not one shape — 900x500 and 1440x1080 both exist — so the height is left
 * to the picture. `width` as an attribute as well as in the style, because
 * Outlook reads the attribute and nothing else.
 */
function leadHtml(line: DigestLine, copy: DigestCopy): string {
  const url = `${SITE}${line.path}`;
  const where = [clock(line), line.town].filter(Boolean).join(' · ');

  const badge = line.badge
    ? ` <span style="display:inline-block;margin-left:4px;padding:1px 6px;border-radius:3px;background:${line.badge.colour};color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:0.04em;">${escape(line.badge.label)}</span>`
    : '';

  const title = line.cancelled
    ? `<s class="grey" style="color:${GREY};">${escape(line.name)}</s> <span style="color:${ACCENT};">${escape(copy.cancelled)}</span>`
    : `<a href="${url}" class="ink" style="color:${INK};text-decoration:none;">${escape(line.name)}</a>`;

  const picture = line.hero
    ? `<a href="${url}" style="text-decoration:none;"><img src="${SITE}${line.hero}" width="536" alt="" style="display:block;width:100%;max-width:536px;height:auto;border-radius:8px;border:0;outline:none;"></a>`
    : `<div class="tile" style="width:100%;height:200px;border-radius:8px;background:${PAPER};"></div>`;

  return `
  <tr><td class="pad rule" style="${PAD}padding-top:14px;border-top:1px solid ${RULE};">${picture}</td></tr>
  <tr><td class="pad" style="${PAD}padding-top:12px;padding-bottom:14px;">
    <div class="ink" style="font-size:21px;font-weight:800;letter-spacing:-0.015em;line-height:1.2;color:${INK};word-break:break-word;">${title}</div>
    <div class="grey" style="padding-top:4px;font-size:14px;line-height:1.5;color:${GREY};">${escape(where)}${badge}</div>
    ${line.cancellationNote ? `<div class="grey" style="padding-top:2px;font-size:14px;color:${GREY};">${escape(line.cancellationNote)}</div>` : ''}
  </td></tr>`;
}

/**
 * Day bands, with every market under the day it falls on.
 *
 * `leadPath` marks the one market shown large. It is rendered in place rather
 * than above the list, because printing its date beside it and then again on
 * the band underneath said "Samstag, 12. September" twice in a row.
 */
const daysHtml = (locale: Locale, lines: DigestLine[], copy: DigestCopy, leadPath?: string) =>
  byDay(lines)
    .map(([date, group]) =>
      dayHtml(locale, date) +
      group
        .map((line) => (leadPath && line.path === leadPath ? leadHtml(line, copy) : rowHtml(line, copy)))
        .join('')
    )
    .join('');

/**
 * The weekly issue, in the subscriber's own language.
 *
 * Built by hand for the same reason the welcome mail is: mail clients throw
 * away stylesheets, ignore web fonts and disagree about everything else. No
 * images at all — most clients block them by default, and a market photograph
 * that does not load is worse than one that was never promised.
 */
export function digestMail(locale: Locale, issue: DigestIssue, token: string): Omit<Mail, 'to'> {
  const copy = DIGEST[locale] ?? DIGEST.de;
  const url = unsubscribeUrl(token);
  const dates = range(locale, issue.from, issue.to);
  const region = issue.region ?? '';
  const rest = issue.elsewhere.length;

  const subject = region ? fill(copy.subjectRegion, { region, dates }) : fill(copy.subject, { dates });
  const headline = region ? fill(copy.headlineRegion, { region }) : copy.headline;
  const count = fill(issue.total === 1 ? copy.countOne : copy.countMany, { total: issue.total });

  const preheader = !region
    ? copy.preheaderCountry
    : issue.own.length === 0
      ? fill(copy.preheaderNone, { region, rest })
      : fill(copy.preheaderRegion, { own: issue.own.length, region, rest });

  /* The lead goes back into whichever list it came out of — the digest says
     which — so the day it falls on is printed once, by the band above it. */
  const leadPath = issue.lead?.path;
  const ownLines = issue.leadInRegion && issue.lead ? [issue.lead, ...issue.own] : issue.own;
  const elseLines = !issue.leadInRegion && issue.lead ? [issue.lead, ...issue.elsewhere] : issue.elsewhere;

  const nothingRow = `<tr><td class="pad grey rule" style="${PAD}padding-top:12px;padding-bottom:12px;border-top:1px solid ${RULE};font-size:15px;color:${GREY};">${escape(copy.nothingHere)}</td></tr>`;

  let ownBlock = '';
  let elsewhereBlock = '';

  if (!region) {
    // No canton, so nothing to divide into sections.
    elsewhereBlock = daysHtml(locale, elseLines, copy, leadPath);
  } else {
    ownBlock =
      sectionHtml(fill(copy.inRegion, { region })) +
      (ownLines.length ? daysHtml(locale, ownLines, copy, leadPath) : nothingRow);

    if (elseLines.length) {
      elsewhereBlock = sectionHtml(copy.elsewhere) + daysHtml(locale, elseLines, copy, leadPath);
    }
  }

  const moreLabel = issue.more.region
    ? fill(copy.moreRegion, { count: issue.more.count, region: issue.more.region })
    : fill(copy.more, { count: issue.more.count });

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escape(subject)}</title>
<style>
  /* Apple Mail and Outlook honour this. Gmail strips it and inverts the
     palette itself, which is why every colour is also written inline. */
  @media (prefers-color-scheme: dark) {
    .page { background:#0E0E0D !important; }
    .card { background:#161513 !important; }
    .ink, .ink a { color:#F2F0EC !important; }
    .grey, .grey a { color:#A5A19A !important; }
    .rule { border-color:#2E2D2A !important; }
    .tile { background:#232220 !important; }
    .cta { background:#F2F0EC !important; }
    .cta a { color:#111110 !important; }
  }
  @media (max-width:600px) {
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:24px !important; }
  }
</style>
</head>
<body class="page" style="margin:0;padding:0;background:#F5F4F2;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(preheader)}&#8203;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;</div>
<table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F4F2;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" class="card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

      <tr><td class="pad ink" style="${PAD}padding-top:32px;font-size:15px;font-weight:700;letter-spacing:-0.01em;color:${INK};">fynda<span style="color:${ACCENT};">.</span>market</td></tr>

      <tr><td class="pad" style="${PAD}padding-top:22px;">
        <div class="h1 ink" style="font-size:28px;font-weight:800;letter-spacing:-0.025em;line-height:1.14;color:${INK};">${escape(headline)}</div>
        <div class="grey" style="padding-top:6px;font-size:15px;color:${GREY};">${escape(dates)} · ${escape(count)}</div>
      </td></tr>

      ${ownBlock}
      ${elsewhereBlock}

      <tr><td class="pad" style="${PAD}padding-top:28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td class="cta" style="background:${INK};border-radius:999px;">
            <a href="${SITE}${issue.more.href}" style="display:inline-block;padding:13px 26px;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;">${escape(moreLabel)}</a>
          </td>
        </tr></table>
      </td></tr>

      <tr><td class="pad rule grey" style="${PAD}margin-top:30px;padding-top:20px;padding-bottom:32px;border-top:1px solid ${RULE};font-size:13px;line-height:1.5;color:${GREY};">
        ${escape(copy.why)}<br>
        <a href="${url}" class="grey" style="color:${GREY};">${escape(copy.unsubscribe)}</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  /* The plain-text half is not a fallback nobody reads — it is what a screen
     reader and a text-only client get, and what some filters score. Same
     structure, same order, no markup. */
  const lines: string[] = ['fynda.market', '', headline, `${dates} · ${count}`, ''];

  const textDays = (rows: DigestLine[]) => {
    for (const [date, group] of byDay(rows)) {
      lines.push(day(locale, date).toUpperCase(), '');
      for (const row of group) {
        const where = [clock(row), row.town].filter(Boolean).join(' · ');
        lines.push(row.cancelled ? `${row.name} — ${copy.cancelled}` : row.name);
        lines.push(`  ${where}${row.badge ? ` · ${row.badge.label}` : ''}`);
        if (row.cancellationNote) lines.push(`  ${row.cancellationNote}`);
        lines.push(`  ${SITE}${row.path}`, '');
      }
    }
  };

  if (!region) {
    textDays(elseLines);
  } else {
    lines.push(fill(copy.inRegion, { region }).toUpperCase(), '');
    if (ownLines.length) textDays(ownLines);
    else lines.push(copy.nothingHere, '');

    if (elseLines.length) {
      lines.push(copy.elsewhere.toUpperCase(), '');
      textDays(elseLines);
    }
  }

  lines.push(
    `${moreLabel}: ${SITE}${issue.more.href}`,
    '',
    copy.why,
    `${copy.unsubscribe}: ${url}`
  );

  return {
    subject,
    html,
    text: lines.join('\n'),
    headers: {
      'List-Unsubscribe': `<${url}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}
