/**
 * Keeps the robot log from filling the database.
 *
 *   node scripts/prune-logs.mjs
 *
 * crawler_hits older than 90 days are counted into crawler_daily and deleted
 * (migration 20260923140000_crawler_daily.sql). Runs nightly after the
 * publish (.github/workflows/publish.yml); safe to run again at any time.
 */
import { query } from './db.mjs';

const [{ folded }] = await query('select public.fold_crawler_hits(90) as folded');
console.log(`prune-logs: ${folded} robot rows older than 90 days folded into crawler_daily`);
process.exit(0);
