/**
 * The one place scripts get a database connection.
 *
 * Reads .env.local (then .env) itself, so no secret is ever passed on a command
 * line where it would land in shell history or a process list.
 *
 *   import { query, withClient, V1_URL } from './db.mjs';
 *   const rows = await query('select count(*) from markets');
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

import { requireConnectionString } from '../src/lib/connection-string.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const env = {};
  for (const name of ['.env', '.env.local']) {
    const file = join(root, name);
    if (!existsSync(file)) continue;
    for (const raw of readFileSync(file, 'utf8').split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const i = line.indexOf('=');
      env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = loadEnv();

// Same normalisation the build uses, so a string that works in one place cannot
// fail in the other. See src/lib/connection-string.ts.
export const DB_URL = requireConnectionString(env.SUPABASE_DB_URL, 'SUPABASE_DB_URL');
export const V1_URL = env.V1_DATABASE_URL && requireConnectionString(env.V1_DATABASE_URL, 'V1_DATABASE_URL');

/** Supabase terminates unencrypted connections; its cert chain is not in Node's store. */
const ssl = { rejectUnauthorized: false };

export async function withClient(url, fn) {
  const client = new pg.Client({ connectionString: url, ssl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function query(sql, params = [], url = DB_URL) {
  return withClient(url, async (c) => (await c.query(sql, params)).rows);
}
