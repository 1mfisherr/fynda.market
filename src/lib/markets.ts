/**
 * The one query layer.
 *
 * docs/STACK.md: the build reads the database once per build through a typed
 * query module, and the runtime API later consumes the same functions. Pages
 * never talk to a data source directly, so swapping fixtures for Supabase is a
 * change in this file only.
 */

import type { Market, Occurrence } from './types';
import { sampleMarkets } from './fixtures.ts';
import { thisWeekend, todayIso } from './format.ts';


/**
 * Server-side only; Astro exposes non-PUBLIC_ vars to the build, not the client.
 * Read via both paths so this module works inside Astro (import.meta.env) and
 * under plain Node, which is how scripts/emit-data.mjs runs it.
 */
const env: Record<string, string | undefined> =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ??
  (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ??
  {};

const source = env.FYNDA_DATA_SOURCE ?? 'fixtures';

/**
 * The publication horizon, in days. Must match occurrenceHorizonDays in
 * guardrails.config.json and the trigger in the initial migration.
 *
 * The database stores a human-confirmed date however far out it is — that is a
 * real fact. This is the other half of the rule: nothing beyond the horizon is
 * ever rendered. Storage is not the risk, publication is.
 */
export const HORIZON_DAYS = 120;

export function withinHorizon(dates: Occurrence[], today = todayIso()): Occurrence[] {
  const limit = new Date(today);
  limit.setDate(limit.getDate() + HORIZON_DAYS);
  const limitIso = limit.toISOString().slice(0, 10);
  return dates.filter((o) => o.date >= today && o.date <= limitIso);
}

let warned = false;

/**
 * Every market that may be published.
 *
 * When Supabase exists this becomes a select over the `publishable_markets`
 * view, which already encodes the rule that a page needs content behind it.
 */
export async function getMarkets(): Promise<Market[]> {
  if (source === 'supabase') {
    const { fetchMarkets } = await import('./supabase.ts');
    const markets = await fetchMarkets();
    if (markets.length === 0) {
      // An empty result is a broken connection or an unimported database, not
      // a site with no markets. Building it would publish an empty directory.
      throw new Error('FYNDA_DATA_SOURCE=supabase returned no markets. Run scripts/import-v1.mjs.');
    }
    return markets;
  }

  if (!warned) {
    warned = true;
    console.warn(
      '\n  [data] Using SAMPLE markets from src/lib/fixtures.ts.\n' +
        '        Not real listings. Must not be deployed. See PLAN.md 1.4 and 3.4.\n'
    );
  }

  return sampleMarkets();
}

/** Markets with a non-cancelled date on the coming Saturday or Sunday. */
export function onThisWeekend(markets: Market[], today = todayIso()): Market[] {
  const { start, end } = thisWeekend(today);
  return markets
    .filter((m) => m.next && m.next.date >= start && m.next.date <= end && m.next.status !== 'cancelled')
    .sort(byDateThenTime);
}

/**
 * The rest, soonest first — including cancelled ones.
 *
 * A cancellation is the single most useful thing we can tell someone, and
 * nobody in the category shows it properly (docs/PRODUCT.md). Hiding it would
 * throw away the reason this site deserves to exist.
 */
export function upNext(markets: Market[], exclude: Market[], today = todayIso()): Market[] {
  const excluded = new Set(exclude.map((m) => m.slug));
  return markets
    .filter((m) => !excluded.has(m.slug) && m.next && m.next.date >= today)
    .sort(byDateThenTime);
}

function byDateThenTime(a: Market, b: Market): number {
  const ad = a.next?.date ?? '', bd = b.next?.date ?? '';
  if (ad !== bd) return ad < bd ? -1 : 1;
  return (a.next?.startTime ?? '') < (b.next?.startTime ?? '') ? -1 : 1;
}

/** Is this date confirmed by a human against a source? */
export function isConfirmed(o?: Occurrence): boolean {
  return o?.status === 'confirmed';
}
