/**
 * The one query layer.
 *
 * docs/STACK.md: the build reads the database once per build through a typed
 * query module, and the runtime API later consumes the same functions. Pages
 * never talk to a data source directly, so swapping fixtures for Supabase is a
 * change in this file only.
 */

import type { Market, Occurrence } from './types';
import { sampleMarkets } from './fixtures';
import { thisWeekend, todayIso } from './format';

// Server-side only. Astro exposes non-PUBLIC_ vars to the build, not the client.
const source = import.meta.env.FYNDA_DATA_SOURCE ?? 'fixtures';

let warned = false;

/**
 * Every market that may be published.
 *
 * When Supabase exists this becomes a select over the `publishable_markets`
 * view, which already encodes the rule that a page needs content behind it.
 */
export async function getMarkets(): Promise<Market[]> {
  if (source === 'supabase') {
    // PLAN.md step 3.4. Failing loudly beats silently shipping sample rows.
    throw new Error(
      'FYNDA_DATA_SOURCE=supabase, but the Supabase query layer is not built yet (PLAN.md 3.4).'
    );
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
