/**
 * Where Delfim's Telegram links land — GET /adm/{action}/{approve|reject}?s=…
 *
 * One handler for every decision the site offers him. `_admin.ts` checks the
 * signature and that the link is unused and fresh; this file does what the
 * decision means and shows him a plain page saying what happened. Every path
 * out of here marks the action used, so a link can never act twice.
 *
 * The claim is the one that matters today: approve turns a form row into an
 * organiser with an e-mail, a market that points at them, a personal link, and
 * a welcome mail carrying it. Nothing on the site changes until the organiser
 * presses a button themselves — the stamp says what they said, not what we did.
 */

import { markUsed, verifyDecision, type AdminAction, type AdminEnv } from '../_admin';
import { organiserWelcome, sendMail, type Locale, type MailEnv } from '../_mail';
import { editUrl, mintLink, type Organiser } from '../_organiser';
import { escape, page } from '../_page';
import { insertOne, selectOne, updateRows, UUID } from '../_rest';
import { requestPublish } from '../_publish';

interface Env extends AdminEnv, MailEnv { GITHUB_DISPATCH_TOKEN?: string }

interface Claim {
  id: string;
  market_id: string | null;
  market_text: string;
  town: string | null;
  organiser_name: string;
  email: string;
  locale: Locale;
  handled: boolean;
}

interface Market {
  id: string;
  slug: string;
  organiser_id: string | null;
}

// The translated path word, as src/lib/i18n.ts spells it (a Function may not import it).
const MARKET_WORD: Record<string, string> = { de: 'markt', fr: 'marche', it: 'mercato', en: 'market' };

const done = (title: string, lines: string[], status = 200) =>
  page('en', title, `<h1>${escape(title)}</h1>${lines.map((l) => `<p>${l}</p>`).join('')}`, { status });

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const parts = Array.isArray(params.path) ? params.path : [String(params.path ?? '')];
  const [id = '', verb = ''] = parts;
  const sig = new URL(request.url).searchParams.get('s');

  const verified = await verifyDecision(env, id, verb, sig);
  if (!verified.ok) {
    const why: Record<typeof verified.reason, string> = {
      bad_link: 'This link is not one we sent, or it has been altered.',
      expired: 'This link is older than fourteen days. The row is still in the queue; decide it from the database.',
      used: 'This one has already been decided. Nothing happened this time.',
      no_secret: 'ADMIN_SIGNING_SECRET is not set on Cloudflare, so no link can be checked.',
    };
    return done('Nothing done', [escape(why[verified.reason])], 400);
  }

  const { action } = verified;
  const origin = new URL(request.url).origin;

  if (action.kind === 'claim') return claim(env, origin, action, verb as 'approve' | 'reject');
  if (action.kind === 'market_stopped') return stopped(env, action, verb as 'approve' | 'reject');

  // edit arrives with day 3 of the spec.
  return done('Not yet', [`Decisions of kind <code>${escape(action.kind)}</code> are not wired up yet.`], 501);
};

async function claim(env: Env, origin: string, action: AdminAction, verb: 'approve' | 'reject'): Promise<Response> {
  const claimId = String(action.payload.claim_id ?? '');
  if (!UUID.test(claimId)) return done('Nothing done', ['The action names no claim.'], 500);

  const row = await selectOne<Claim>(env, 'organiser_claims', `id=eq.${claimId}`,
    'id,market_id,market_text,town,organiser_name,email,locale,handled');
  if (!row) return done('Nothing done', ['That claim no longer exists.'], 404);

  const now = new Date().toISOString();

  if (verb === 'reject') {
    await updateRows(env, 'organiser_claims', `id=eq.${claimId}`, { handled: true, handled_at: now, handler_note: 'rejected' });
    await markUsed(env, action.id, 'rejected');
    return done('Rejected', [
      `The claim for <b>${escape(row.market_text)}</b> by ${escape(row.organiser_name)} is marked handled. No mail was sent.`,
    ]);
  }

  if (row.handled) {
    await markUsed(env, action.id, 'approved');
    return done('Already handled', ['This claim was dealt with before. Nothing changed.']);
  }

  /*
   * A claim without a market id cannot be approved from a link: we would be
   * guessing which market the person meant, and a wrong guess hands someone
   * a page that is not theirs. It stays in the queue for a human match.
   */
  if (!row.market_id) {
    return done('Match the market first', [
      `<b>${escape(row.organiser_name)}</b> &lt;${escape(row.email)}&gt; claims “${escape(row.market_text)}”${row.town ? ` in ${escape(row.town)}` : ''}, but the claim carries no market id.`,
      'Set <code>market_id</code> on the claim in the database, then open this link again — it is still valid.',
    ], 409);
  }

  const market = await selectOne<Market>(env, 'markets', `id=eq.${row.market_id}`, 'id,slug,organiser_id');
  if (!market) return done('Nothing done', ['The market on this claim no longer exists.'], 404);

  /*
   * Who the organiser row is, in this order:
   *   1. an organiser already carrying this e-mail — a second market for someone
   *      we know, so it joins their one link rather than minting another;
   *   2. the organiser the market already points at — an imported row with a
   *      website and no address, which now gets one;
   *   3. a new row.
   */
  const email = row.email.toLowerCase();
  let organiser = await selectOne<Organiser>(env, 'organisers', `email=eq.${encodeURIComponent(email)}`, 'id,name,email,locale');

  if (!organiser && market.organiser_id) {
    const [updated] = await updateRows<Organiser>(env, 'organisers', `id=eq.${market.organiser_id}`, {
      email, locale: row.locale, updated_at: now,
    });
    organiser = updated ?? null;
  }

  if (!organiser) {
    organiser = await insertOne<Organiser>(env, 'organisers', {
      name: row.organiser_name, email, locale: row.locale, channel_type: 'email', channel_value: email,
    });
  }

  if (!organiser) return done('Nothing done', ['Could not create or update the organiser row. Check the Cloudflare log.'], 500);

  if (market.organiser_id !== organiser.id) {
    const linked = await updateRows(env, 'markets', `id=eq.${market.id}`, { organiser_id: organiser.id, updated_at: now });
    if (linked.length === 0) return done('Nothing done', ['Could not point the market at the organiser. Check the Cloudflare log.'], 500);
  }

  const token = await mintLink(env, organiser.id);
  if (!token) return done('Nothing done', ['Could not mint the personal link. Check the Cloudflare log.'], 500);

  const url = editUrl(origin, token);
  const mailed = await sendMail(env, {
    to: email,
    ...organiserWelcome(row.locale, row.organiser_name, row.market_text, url),
  });

  await updateRows(env, 'organiser_claims', `id=eq.${claimId}`, {
    handled: true, handled_at: now, handler_note: mailed ? 'approved, link sent' : 'approved, mail failed',
  });
  await markUsed(env, action.id, 'approved');

  return done('Approved', [
    `<b>${escape(row.market_text)}</b> now belongs to <b>${escape(organiser.name)}</b> &lt;${escape(email)}&gt;.`,
    mailed
      ? `The welcome mail with their personal link is on its way, in ${escape(row.locale.toUpperCase())}.`
      : '<span class="status">The welcome mail could not be sent.</span> The link exists; re-send it from the database or mint a new one.',
    `<span class="meta">Market page: <a href="https://fynda.market/${row.locale}/${MARKET_WORD[row.locale] ?? 'market'}/${escape(market.slug)}/">${escape(market.slug)}</a></span>`,
  ]);
}

/**
 * An organiser said their market no longer takes place. Approve closes it for
 * good: the page stays — a retired address never dies — and says so; no future
 * date is rendered. Reject leaves everything as it was.
 */
async function stopped(env: Env, action: AdminAction, verb: 'approve' | 'reject'): Promise<Response> {
  const marketId = String(action.payload.market_id ?? '');
  if (!UUID.test(marketId)) return done('Nothing done', ['The action names no market.'], 500);

  const market = await selectOne<Market>(env, 'markets', `id=eq.${marketId}`, 'id,slug,organiser_id');
  if (!market) return done('Nothing done', ['That market no longer exists.'], 404);

  if (verb === 'reject') {
    await markUsed(env, action.id, 'rejected');
    return done('Left as is', [`<b>${escape(market.slug)}</b> stays active. Nothing changed.`]);
  }

  const now = new Date().toISOString();
  const rows = await updateRows(env, 'markets', `id=eq.${market.id}`, { status: 'permanently_closed', updated_at: now });
  if (rows.length === 0) return done('Nothing done', ['Could not update the market. Check the Cloudflare log.'], 500);

  await markUsed(env, action.id, 'approved');
  const publish = await requestPublish(env, `market closed ${market.slug}`);
  return done('Closed', [
    `<b>${escape(market.slug)}</b> is now permanently closed. Its page stays and says so.`,
    `<span class="meta">Publish: ${escape(publish)}.</span>`,
  ]);
}
