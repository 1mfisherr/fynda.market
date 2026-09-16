/**
 * Reading and changing rows from a Function, as the service role.
 *
 * `_form.ts` has `insertRow` for the one thing a form does. The organiser
 * flow reads, updates and inserts across half a dozen tables, so the three
 * verbs live here once. Every call logs a rejected response: the service role
 * bypasses RLS but still needs a GRANT per table and per column, and a missing
 * one answers with an empty result, not an error anywhere a person looks.
 *
 * Filters are PostgREST query strings — `id=eq.<uuid>`, `revoked_at=is.null`.
 * Values are interpolated by the caller, so anything that came from a request
 * must be validated before it gets near one.
 */

export interface RestEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function headers(env: RestEnv, extra: Record<string, string> = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

const ready = (env: RestEnv) => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

export async function selectRows<T = Record<string, unknown>>(
  env: RestEnv,
  table: string,
  filter: string,
  columns = '*'
): Promise<T[]> {
  if (!ready(env)) return [];
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/${table}?${filter}&select=${encodeURIComponent(columns)}`,
      { headers: headers(env) }
    );
    if (!res.ok) {
      console.log(`${table} select rejected`, res.status, await res.text());
      return [];
    }
    return (await res.json()) as T[];
  } catch (error) {
    console.log(`${table} select failed`, String(error));
    return [];
  }
}

export async function selectOne<T = Record<string, unknown>>(
  env: RestEnv,
  table: string,
  filter: string,
  columns = '*'
): Promise<T | null> {
  const rows = await selectRows<T>(env, table, `${filter}&limit=1`, columns);
  return rows[0] ?? null;
}

/** Returns the updated rows (needs SELECT on the table, which every grant here has). */
export async function updateRows<T = Record<string, unknown>>(
  env: RestEnv,
  table: string,
  filter: string,
  patch: Record<string, unknown>
): Promise<T[]> {
  if (!ready(env)) return [];
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: headers(env, { Prefer: 'return=representation' }),
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      console.log(`${table} update rejected`, res.status, await res.text());
      return [];
    }
    return (await res.json().catch(() => [])) as T[];
  } catch (error) {
    console.log(`${table} update failed`, String(error));
    return [];
  }
}

/** Returns the created row, or null. */
export async function insertOne<T = Record<string, unknown>>(
  env: RestEnv,
  table: string,
  row: Record<string, unknown>
): Promise<T | null> {
  if (!ready(env)) return null;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: headers(env, { Prefer: 'return=representation' }),
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.log(`${table} insert rejected`, res.status, await res.text());
      return null;
    }
    const rows = (await res.json().catch(() => [])) as T[];
    return rows[0] ?? null;
  } catch (error) {
    console.log(`${table} insert failed`, String(error));
    return null;
  }
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
