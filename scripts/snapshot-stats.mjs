/**
 * The monthly photo of the directory (migration 20260927180000).
 *
 *   node scripts/snapshot-stats.mjs
 *
 * Recomputes this month's row per country and region in
 * market_stats_monthly. Runs nightly after the publish
 * (.github/workflows/publish.yml). The publish runs just after midnight in
 * Zurich, so on the 1st the month that has just ended is recomputed one last
 * time too — that is its closing state, and it is never touched again.
 * Safe to run again at any time.
 */
import { query } from './db.mjs';
import { todayIso } from '../src/lib/format.ts';

const today = todayIso();
const months = [today.slice(0, 7) + '-01'];
if (today.endsWith('-01')) {
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() - 1);
  months.unshift(d.toISOString().slice(0, 10));
}

for (const month of months) {
  const [{ written }] = await query('select public.snapshot_market_stats($1::date) as written', [month]);
  console.log(`snapshot-stats: ${written} rows for ${month.slice(0, 7)} in market_stats_monthly`);
}
process.exit(0);
