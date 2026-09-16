/**
 * Where an organiser's buttons land — /a/{token}/…
 *
 *   /a/{token}/{occurrence}/on         it's on
 *   /a/{token}/{occurrence}/cancelled  cancelled → "just this date, or stopped?"
 *   /a/{token}/{occurrence}/changed    → the edit page
 *   /a/{token}/edit                    the edit page
 *
 * The token is the organiser's identity (functions/_organiser.ts). Every write
 * checks that the date belongs to a market this organiser stands behind — a
 * valid link for market A must not be able to cancel market B.
 *
 * "On" and "just this date" change the database at once and ask GitHub to
 * publish; the page says "within the hour" and means it. "The market has
 * stopped" goes to Delfim, because closing a market for good is not a thing
 * one tap from a mail should do.
 *
 * Mail scanners follow links. A GET on /on acts immediately only when the
 * request carries Sec-Fetch-User: ?1 — set by browsers on a navigation a person
 * started, never by a link checker. Anything else sees one button that POSTs.
 */

import { offerDecision, type AdminEnv } from '../_admin';
import { ipHash } from '../_form';
import { dayLabel, type Locale, type MailEnv } from '../_mail';
import { organiserFromToken, type Organiser } from '../_organiser';
import { copyFor, type OrganiserCopy } from '../_organiser-copy';
import { escape, page } from '../_page';
import { requestPublish, type PublishEnv } from '../_publish';
import { insertOne, selectOne, selectRows, updateRows, UUID } from '../_rest';

interface Env extends AdminEnv, MailEnv, PublishEnv {}

interface Occurrence {
  id: string;
  market_id: string;
  date: string;
  status: string;
}

interface Market {
  id: string;
  slug: string;
  organiser_id: string | null;
  venue_id: string;
}

const MARKET_WORD: Record<string, string> = { de: 'markt', fr: 'marche', it: 'mercato', en: 'market' };

export const onRequestGet: PagesFunction<Env> = (ctx) => handle(ctx);
export const onRequestPost: PagesFunction<Env> = (ctx) => handle(ctx);

async function handle({ request, env, params, waitUntil }: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  const parts = Array.isArray(params.path) ? params.path : [String(params.path ?? '')];
  const [token = '', second = '', verb = ''] = parts;

  const organiser = await organiserFromToken(env, token);
  if (!organiser) {
    const c = copyFor(null);
    return page('en', c.invalidTitle, `<h1>${escape(c.invalidTitle)}</h1><p>${escape(c.invalidBody)}</p>`, { status: 404 });
  }

  const locale = (organiser.locale ?? 'en') as Locale;
  const c = copyFor(locale);

  if (second === 'edit' || verb === 'changed') {
    // Day 3 replaces this with the five-field page.
    return page(locale, c.editSoonTitle, `<h1>${escape(c.editSoonTitle)}</h1><p>${escape(c.editSoonBody)}</p>`);
  }

  if (!UUID.test(second) || !['on', 'cancelled'].includes(verb)) {
    return page(locale, c.invalidTitle, `<h1>${escape(c.invalidTitle)}</h1><p>${escape(c.invalidBody)}</p>`, { status: 404 });
  }

  const occurrence = await selectOne<Occurrence>(env, 'occurrences', `id=eq.${second}`, 'id,market_id,date,status');
  const market = occurrence
    ? await selectOne<Market>(env, 'markets', `id=eq.${occurrence.market_id}`, 'id,slug,organiser_id,venue_id')
    : null;

  if (!occurrence || !market || market.organiser_id !== organiser.id) {
    return page(locale, c.notYoursTitle, `<h1>${escape(c.notYoursTitle)}</h1><p>${escape(c.notYoursBody)}</p>`, { status: 403 });
  }

  const names = await labels(env, market, locale);
  const fill = (s: string) => s.replace('%m', names.market).replace('%d', dayLabel(locale, occurrence.date));
  const pageLink = `<p class="meta"><a href="https://fynda.market/${locale}/${MARKET_WORD[locale]}/${market.slug}/">${escape(c.toPage)}</a></p>`;
  const self = new URL(request.url).pathname;

  const record = async (answer: 'on' | 'cancelled', scope: 'date' | 'market') =>
    insertOne(env, 'organiser_answers', {
      organiser_id: organiser.id,
      market_id: market.id,
      occurrence_id: occurrence.id,
      answer,
      scope,
      ip_hash: await ipHash(env, request, 'answer'),
    });

  /* ---- it's on ---------------------------------------------------------- */

  if (verb === 'on') {
    const personClicked = request.headers.get('sec-fetch-user') === '?1';
    if (request.method === 'GET' && !personClicked) {
      return page(locale, fill(c.confirmTitle), `
        <h1>${escape(fill(c.confirmTitle))}</h1>
        <p>${escape(c.confirmBody)}</p>
        <form method="post" action="${self}"><button class="btn" type="submit">${escape(c.confirmButton)}</button></form>
        ${pageLink}`);
    }

    const now = new Date().toISOString();
    await updateRows(env, 'occurrences', `id=eq.${occurrence.id}`, {
      status: 'confirmed', origin: 'organiser', confirmed_at: now, updated_at: now,
    });
    await updateRows(env, 'markets', `id=eq.${market.id}`, {
      verified_by: 'organiser', verified_at: now, updated_at: now,
    });
    await record('on', 'date');
    waitUntil(requestPublish(env, `organiser confirmed ${market.slug} ${occurrence.date}`));

    return page(locale, c.onTitle, `<h1 class="status">${escape(c.onTitle)}</h1><p>${escape(fill(c.onBody))}</p>${pageLink}`);
  }

  /* ---- cancelled -------------------------------------------------------- */

  const scope = request.method === 'POST' ? await scopeOf(request) : null;

  if (!scope) {
    return page(locale, fill(c.cancelTitle), `
      <h1>${escape(fill(c.cancelTitle))}</h1>
      <p>${escape(c.cancelBody)}</p>
      <form method="post" action="${self}">
        <button class="btn" type="submit" name="scope" value="date">${escape(c.cancelDate)}</button>
        <button class="btn secondary" type="submit" name="scope" value="market">${escape(c.cancelMarket)}</button>
      </form>
      ${pageLink}`);
  }

  if (scope === 'date') {
    const now = new Date().toISOString();
    await updateRows(env, 'occurrences', `id=eq.${occurrence.id}`, {
      status: 'cancelled', origin: 'organiser', cancellation_note: 'organiser', updated_at: now,
    });
    await updateRows(env, 'markets', `id=eq.${market.id}`, {
      verified_by: 'organiser', verified_at: now, updated_at: now,
    });
    await record('cancelled', 'date');
    waitUntil(requestPublish(env, `organiser cancelled ${market.slug} ${occurrence.date}`));
    // Day 4: the alert to subscribers nearby goes here.

    return page(locale, c.cancelledTitle, `<h1 class="status">${escape(c.cancelledTitle)}</h1><p>${escape(fill(c.cancelledBody))}</p>${pageLink}`);
  }

  // The market has stopped: Delfim decides.
  const answer = await record('cancelled', 'market');
  waitUntil(offerDecision(
    env,
    new URL(request.url).origin,
    'market_stopped',
    { answer_id: answer?.id ?? null, market_id: market.id },
    `MARKET STOPPED? ${names.market} (${market.slug})\n${organiser.name} <${organiser.email ?? '—'}> says the market no longer takes place.\nApprove = mark permanently closed. Reject = leave as is.`
  ));

  return page(locale, c.stoppedTitle, `<h1>${escape(c.stoppedTitle)}</h1><p>${escape(c.stoppedBody)}</p>${pageLink}`);
}

async function scopeOf(request: Request): Promise<'date' | 'market' | null> {
  try {
    const data = await request.formData();
    const scope = String(data.get('scope') ?? '');
    return scope === 'date' || scope === 'market' ? scope : null;
  } catch {
    return null;
  }
}

/** The market's and town's names in the organiser's language, falling back to any. */
async function labels(env: Env, market: Market, locale: Locale): Promise<{ market: string; town: string }> {
  const marketNames = await selectRows<{ locale: string; value: string }>(
    env, 'texts', `entity_type=eq.market&entity_id=eq.${market.id}&field=eq.name`, 'locale,value'
  );
  const venue = await selectOne<{ city_id: string }>(env, 'venues', `id=eq.${market.venue_id}`, 'city_id');
  const townNames = venue
    ? await selectRows<{ locale: string; value: string }>(
        env, 'texts', `entity_type=eq.city&entity_id=eq.${venue.city_id}&field=eq.name`, 'locale,value'
      )
    : [];
  const pick = (rows: { locale: string; value: string }[]) =>
    rows.find((r) => r.locale === locale)?.value ?? rows.find((r) => r.locale === 'en')?.value ?? rows[0]?.value ?? market.slug;
  return { market: pick(marketNames), town: pick(townNames) };
}

export type { Organiser, OrganiserCopy };
