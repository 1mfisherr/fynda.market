#!/usr/bin/env node
/**
 * Build the site with the German markets switched on, look at it, switch them
 * back — without publishing anything.
 *
 *   node scripts/preview-germany.mjs
 *
 * The markets arrive as `unverified`, which `publishable_markets` does not
 * carry, so the build cannot see them and there is nothing to check. This
 * flips them to `active`, runs the same build the deploy runs, and flips them
 * back in a `finally` — so a crash in the middle still leaves the database as
 * it found it. Nothing is uploaded: the nightly job builds from `origin/main`
 * against whatever the database says at 03:00 UTC, which by then is `unverified`
 * again.
 *
 * Delete this file the day Germany goes live; it exists for the days before.
 */

import { spawnSync } from 'node:child_process';
import { query, DB_URL } from './db.mjs';

const ids = await query(`
  select m.id from public.markets m
    join public.venues v on v.id = m.venue_id
    join public.cities c on c.id = v.city_id
    join public.regions r on r.id = c.region_id
    join public.countries co on co.id = r.country_id
   where co.iso2 = 'DE' and m.status = 'unverified'`);

if (!ids.length) {
  console.log('No unverified German markets — nothing to preview.');
  process.exit(0);
}

/* A hard kill would skip the `finally` and leave them active for the 03:00
   build. Catch the interrupt and put them back before going. */
const off = async () => {
  await query(`update public.markets set status = 'unverified' where id = any($1::uuid[])`, [ids.map((r) => r.id)]);
};
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await off(); console.log('Interrupted — switched back.'); process.exit(1); });
}

console.log(`Switching ${ids.length} German market(s) on…`);
await query(`update public.markets set status = 'active' where id = any($1::uuid[])`, [ids.map((r) => r.id)]);

try {
  const run = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true, env: { ...process.env, SUPABASE_DB_URL: DB_URL, FYNDA_DATA_SOURCE: 'supabase' } });
  if (run.status !== 0) console.log('\nThe build failed — see above. The markets are being switched back anyway.');
  else spawnSync('node', ['scripts/guardrails.mjs'], { stdio: 'inherit', shell: true });
} finally {
  await off();
  const left = await query(`select count(*) n from public.markets where id = any($1::uuid[]) and status <> 'unverified'`, [ids.map((r) => r.id)]);
  console.log(`\nSwitched back: ${Number(left[0].n) === 0 ? 'all unverified again' : `${left[0].n} STILL ACTIVE — fix this before the nightly build`}.`);
}
process.exit(0);
