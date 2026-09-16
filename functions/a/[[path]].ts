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
import { cancellationMail, dayLabel, sendBatch, type Locale, type MailEnv } from '../_mail';
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

  /* ---- the edit page ---------------------------------------------------- */

  if (second === 'edit' || verb === 'changed') {
    // /a/{token}/edit/{market}  or  /a/{token}/{occurrence}/changed
    let marketId: string | null = second === 'edit' ? (UUID.test(verb) ? verb : null) : null;
    if (verb === 'changed' && UUID.test(second)) {
      const occ = await selectOne<Occurrence>(env, 'occurrences', `id=eq.${second}`, 'id,market_id,date,status');
      marketId = occ?.market_id ?? null;
      // The button press is the answer the funnel counts, so it is recorded
      // here, with its date — the edit page's own form no longer knows which
      // mail brought the organiser. Only for a date that is theirs.
      if (occ && request.method === 'GET' && request.headers.get('sec-fetch-user') === '?1') {
        const owner = await selectOne<Market>(env, 'markets', `id=eq.${occ.market_id}`, 'id,slug,organiser_id,venue_id');
        if (owner?.organiser_id === organiser.id) {
          await insertOne(env, 'organiser_answers', {
            organiser_id: organiser.id, market_id: occ.market_id, occurrence_id: occ.id,
            answer: 'changed', scope: 'date', ip_hash: await ipHash(env, request, 'answer'),
          });
        }
      }
    }

    const mine = await selectRows<Market>(env, 'markets', `organiser_id=eq.${organiser.id}&status=eq.active`, 'id,slug,organiser_id,venue_id');
    if (mine.length === 0) {
      return page(locale, c.notYoursTitle, `<h1>${escape(c.notYoursTitle)}</h1><p>${escape(c.notYoursBody)}</p>`, { status: 403 });
    }
    if (!marketId && mine.length === 1) marketId = mine[0].id;

    if (!marketId) {
      // Several markets, none named: choose.
      const rows = await Promise.all(mine.map(async (m) => {
        const n = await labels(env, m, locale);
        return `<p><a class="btn secondary" href="/a/${token}/edit/${m.id}">${escape(n.market)} — ${escape(n.town)}</a></p>`;
      }));
      return page(locale, c.chooseMarket, `<h1>${escape(c.chooseMarket)}</h1>${rows.join('')}`);
    }

    const market = mine.find((m) => m.id === marketId);
    if (!market) {
      return page(locale, c.notYoursTitle, `<h1>${escape(c.notYoursTitle)}</h1><p>${escape(c.notYoursBody)}</p>`, { status: 403 });
    }

    if (request.method === 'POST') {
      const saved = await saveEdit(env, request, organiser, market);
      waitUntil(requestPublish(env, `organiser edited ${market.slug}`));
      const names = await labels(env, market, locale);
      return page(locale, c.savedTitle, `
        <h1 class="status">${escape(c.savedTitle)}</h1>
        <p>${escape(c.savedBody)}</p>
        <p class="meta">${escape(saved)}</p>
        <p class="meta"><a href="https://fynda.market/${locale}/${MARKET_WORD[locale]}/${market.slug}/">${escape(names.market)}</a></p>`);
    }

    return editPage(env, token, market, locale, c);
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
    waitUntil(alertSubscribers(env, occurrence, market, names, new Date(now)));

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

/* -------------------------------------------------------------------------- */
/* The edit page                                                              */
/* -------------------------------------------------------------------------- */

interface Facts {
  stall_count: number | null;
  setting: string | null;
  rain_policy: string | null;
}

interface Dated {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
}

const hm = (t: string | null) => (t ? t.slice(0, 5) : '');
const today = () => new Date().toISOString().slice(0, 10);

/** Upcoming dates the organiser can act on: from today, not cancelled, at most a year out. */
async function upcoming(env: Env, marketId: string): Promise<Dated[]> {
  const to = new Date(); to.setFullYear(to.getFullYear() + 1);
  return selectRows<Dated>(
    env, 'occurrences',
    `market_id=eq.${marketId}&date=gte.${today()}&date=lte.${to.toISOString().slice(0, 10)}&status=neq.cancelled&order=date.asc&limit=24`,
    'id,date,start_time,end_time,status'
  );
}

async function editPage(env: Env, token: string, market: Market, locale: Locale, c: OrganiserCopy): Promise<Response> {
  const [names, facts, dates] = await Promise.all([
    labels(env, market, locale),
    selectOne<Facts>(env, 'markets', `id=eq.${market.id}`, 'stall_count,setting,rain_policy'),
    upcoming(env, market.id),
  ]);

  const radio = (name: string, value: string, label: string, current: string | null) =>
    `<label><input type="radio" name="${name}" value="${value}"${current === value ? ' checked' : ''}><span>${escape(label)}</span></label>`;

  const existing = dates.map((d) => `
    <div class="row">
      <span><b>${escape(dayLabel(locale, d.date))}</b></span>
      <span>
        <input type="time" name="start_${d.id}" value="${hm(d.start_time)}" style="width:auto"> – <input type="time" name="end_${d.id}" value="${hm(d.end_time)}" style="width:auto">
        &nbsp; <label style="font-size:14px"><input type="checkbox" name="remove_${d.id}" value="1"> ${escape(c.removeLabel)}</label>
      </span>
    </div>`).join('');

  const blank = [1, 2, 3].map((n) => `
    <div class="row">
      <span><label for="new_date_${n}" style="font-size:14px">${escape(c.newDateLabel.replace('%n', String(n)))}</label></span>
      <span>
        <input type="date" id="new_date_${n}" name="new_date_${n}" min="${today()}" style="width:auto">
        <input type="time" name="new_start_${n}" style="width:auto"> – <input type="time" name="new_end_${n}" style="width:auto">
      </span>
    </div>`).join('');

  const body = `
    <h1>${escape(c.editTitle.replace('%m', names.market))}</h1>
    <p class="meta">${escape(c.editIntro)}</p>
    <form method="post" action="/a/${token}/edit/${market.id}">
      <div class="field">
        <label>${escape(c.datesLabel)}</label>
        ${existing}${blank}
      </div>
      <div class="field">
        <label for="stalls">${escape(c.stallsLabel)}</label>
        <input type="number" id="stalls" name="stalls" min="1" max="5000" inputmode="numeric" value="${facts?.stall_count ?? ''}">
      </div>
      <div class="field">
        <label>${escape(c.settingLabel)}</label>
        <div class="seg">
          ${radio('setting', 'indoor', c.settingIndoor, facts?.setting ?? null)}
          ${radio('setting', 'outdoor', c.settingOutdoor, facts?.setting ?? null)}
          ${radio('setting', 'both', c.settingBoth, facts?.setting ?? null)}
        </div>
      </div>
      <div class="field">
        <label>${escape(c.rainLabel)}</label>
        <div class="seg">
          ${radio('rain', 'runs', c.rainRuns, facts?.rain_policy ?? null)}
          ${radio('rain', 'cancelled', c.rainCancelled, facts?.rain_policy ?? null)}
          ${radio('rain', 'decided_on_the_day', c.rainDecided, facts?.rain_policy ?? null)}
        </div>
      </div>
      <div class="field">
        <label>${escape(c.photoLabel)}</label>
        <p class="meta">${escape(c.photoHint)}</p>
      </div>
      <button class="btn" type="submit">${escape(c.save)}</button>
    </form>`;

  return page(locale, c.editTitle.replace('%m', names.market), body);
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Apply the form. Returns a one-line summary for the page and the log. */
async function saveEdit(env: Env, request: Request, organiser: Organiser, market: Market): Promise<string> {
  let form: FormData;
  try { form = await request.formData(); } catch { return 'nothing read'; }
  const get = (k: string) => String(form.get(k) ?? '').trim();
  const now = new Date().toISOString();
  const done: string[] = [];

  /* The three facts. Empty means "unchanged", never "cleared". */
  const patch: Record<string, unknown> = { updated_at: now };
  const stalls = Number(get('stalls'));
  if (get('stalls') && Number.isInteger(stalls) && stalls > 0 && stalls <= 5000) patch.stall_count = stalls;
  const setting = get('setting');
  if (['indoor', 'outdoor', 'both'].includes(setting)) patch.setting = setting;
  const rain = get('rain');
  if (['runs', 'cancelled', 'decided_on_the_day'].includes(rain)) patch.rain_policy = rain;
  if (Object.keys(patch).length > 1) {
    await updateRows(env, 'markets', `id=eq.${market.id}`, patch);
    done.push(`${Object.keys(patch).length - 1} fact(s)`);
  }

  /* Existing dates: times changed, or removed (= cancelled by the organiser). */
  const dates = await upcoming(env, market.id);
  let removed = 0, retimed = 0;
  for (const d of dates) {
    if (get(`remove_${d.id}`) === '1') {
      await updateRows(env, 'occurrences', `id=eq.${d.id}`, {
        status: 'cancelled', origin: 'organiser', cancellation_note: 'organiser', updated_at: now,
      });
      removed += 1;
      continue;
    }
    const start = get(`start_${d.id}`), end = get(`end_${d.id}`);
    const change: Record<string, unknown> = {};
    if (TIME.test(start) && start !== hm(d.start_time)) change.start_time = start;
    if (TIME.test(end) && end !== hm(d.end_time)) change.end_time = end;
    if (Object.keys(change).length) {
      await updateRows(env, 'occurrences', `id=eq.${d.id}`, { ...change, origin: 'organiser', updated_at: now });
      retimed += 1;
    }
  }
  if (removed) done.push(`${removed} date(s) removed`);
  if (retimed) done.push(`${retimed} time(s) changed`);

  /* New dates: confirmed by the organiser on arrival. A duplicate date is
     refused by the unique key and logged, not errored. */
  let added = 0;
  for (const n of [1, 2, 3]) {
    const date = get(`new_date_${n}`);
    if (!DATE.test(date) || date < today()) continue;
    const start = get(`new_start_${n}`), end = get(`new_end_${n}`);
    const row = await insertOne(env, 'occurrences', {
      market_id: market.id, date,
      start_time: TIME.test(start) ? start : null,
      end_time: TIME.test(end) ? end : null,
      status: 'confirmed', origin: 'organiser', confirmed_at: now,
    });
    if (row) added += 1;
  }
  if (added) done.push(`${added} date(s) added`);

  if (done.length) {
    await updateRows(env, 'markets', `id=eq.${market.id}`, { verified_by: 'organiser', verified_at: now, updated_at: now });
  }
  // No answer row here: the press of "something changed" was recorded when the
  // link was opened, with its date. A save from the welcome link is an edit,
  // not an answer to a mail.
  console.log(`organiser ${organiser.id} edited ${market.slug}: ${done.join(', ') || 'nothing'}`);

  return done.length ? done.join(', ') : 'nothing changed';
}

/* -------------------------------------------------------------------------- */
/* Telling the people who saved a Saturday for it                             */
/* -------------------------------------------------------------------------- */

interface Recipient {
  id: string;
  email: string;
  locale: string;
  unsubscribe_token: string;
}

/**
 * Everyone whose subscription covers this market and has not been told about
 * this date — the SQL function does the matching, the same rule the digest
 * uses. Rows are written before the send; a batch that fails takes its rows
 * back so the next attempt can try again.
 */
async function alertSubscribers(env: Env, occurrence: Occurrence, market: Market, names: { market: string; town: string }, toldAt: Date): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;

  let recipients: Recipient[] = [];
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/cancellation_recipients`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_occurrence: occurrence.id }),
    });
    if (!res.ok) { console.log('cancellation_recipients rejected', res.status, await res.text()); return; }
    recipients = (await res.json()) as Recipient[];
  } catch (error) {
    console.log('cancellation_recipients failed', String(error));
    return;
  }
  if (recipients.length === 0) return;

  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);

    // Written first, and as one insert: the key refuses a second mail.
    const rows = chunk.map((r) => ({ subscriber_id: r.id, occurrence_id: occurrence.id }));
    const written = await fetch(`${env.SUPABASE_URL}/rest/v1/newsletter_alerts`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(rows),
    });
    if (!written.ok) { console.log('newsletter_alerts insert rejected', written.status, await written.text()); continue; }

    const mails = chunk.map((r) => {
      const locale = (r.locale ?? 'en') as Locale;
      // The names the mail carries are the organiser's-language ones; a mixed
      // list is rare and a market name is a market name.
      return {
        to: r.email,
        ...cancellationMail(
          locale, names.market, names.town, occurrence.date, toldAt,
          `https://fynda.market/${locale}/${MARKET_WORD[locale]}/${market.slug}/`,
          r.unsubscribe_token
        ),
      };
    });

    const result = await sendBatch(env, mails);
    if (result.error) {
      console.log('cancellation alert batch failed', result.error);
      // Take the rows back so a retry can send.
      const ids = chunk.map((r) => r.id).join(',');
      await fetch(`${env.SUPABASE_URL}/rest/v1/newsletter_alerts?occurrence_id=eq.${occurrence.id}&subscriber_id=in.(${ids})`, {
        method: 'DELETE',
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
      });
    } else {
      console.log(`cancellation alert: ${result.sent} sent for ${market.slug} ${occurrence.date}`);
    }
  }
}
