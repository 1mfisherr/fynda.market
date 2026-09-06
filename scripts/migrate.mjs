/**
 * Applies a migration file to the live database.
 *
 * There is no migration runner in this project and one file at a time is all
 * it has ever needed:  node scripts/migrate.mjs supabase/migrations/<file>.sql
 *
 * The file is run as one statement block, so the `begin; ... commit;` the
 * migrations already carry is what makes it all-or-nothing.
 */
import { readFileSync } from 'node:fs';
import { DB_URL, withClient } from './db.mjs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/migrate.mjs <path to .sql>');
  process.exit(1);
}

const sql = readFileSync(file, 'utf8');
await withClient(DB_URL, async (client) => {
  await client.query(sql);
});
console.log(`applied ${file}`);
