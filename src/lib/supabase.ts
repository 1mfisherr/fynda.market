/**
 * The Supabase read, for the build.
 *
 * One query, run once per build, returning every publishable market with its
 * dates. Astro is static: there is no request-time database, so the shape here
 * is "everything at once" rather than "one row at a time".
 *
 * Only `publishable_markets` is read, never `markets`. The view is where the
 * rule lives that a page needs content behind it — querying the table directly
 * would route around the one thing that stops v1 happening again.
 */

import pg from 'pg';
import type { Market, MarketKind, Occurrence, OccurrenceStatus } from './types';
import { requireConnectionString } from './connection-string.ts';

interface Row {
  slug: string;
  name: string;
  description: string | null;
  kind: MarketKind;
  city: string;
  city_slug: string;
  region: string;
  region_slug: string;
  country_slug: string;
  timezone: string;
  venue_name: string;
  address_line: string;
  postal_code: string | null;
  lat: number;
  lng: number;
  entry_fee: string | null;
  image_url: string | null;
  website_url: string | null;
  recurrence_text: string | null;
  organiser_name: string | null;
  verified_by: Market['verifiedBy'] | null;
  verified_at: string | null;
  occurrences: {
    date: string;
    start_time: string | null;
    end_time: string | null;
    status: OccurrenceStatus;
    origin: Occurrence['origin'] | null;
    cancellation_note: string | null;
    confirmed_at: string | null;
  }[] | null;
}

/**
 * Dates from today forward only, and cancelled ones included: a cancellation is
 * the most useful thing on the page. The 120-day horizon is applied in
 * markets.ts, on everything, so it is one rule in one place.
 */
const SQL = `
  select
    coalesce(sm.slug, p.slug)                      as slug,
    coalesce(nm.value, p.slug)                     as name,
    ds.value                                        as description,
    p.kind,
    tc.value                                        as city,
    sc.slug                                         as city_slug,
    tr.value                                        as region,
    sr.slug                                         as region_slug,
    sk.slug                                         as country_slug,
    v.timezone,
    v.name                                          as venue_name,
    v.address_line,
    v.postal_code,
    extensions.st_y(v.point::extensions.geometry)   as lat,
    extensions.st_x(v.point::extensions.geometry)   as lng,
    m.entry_fee,
    m.image_url,
    m.website_url,
    m.verified_by,
    m.verified_at,
    org.name                                        as organiser_name,
    coalesce(rt.value, m.recurrence_text)           as recurrence_text,
    (
      select jsonb_agg(o order by o.date)
        from (
          select date::text, start_time::text, end_time::text, status, origin,
                 cancellation_note, confirmed_at
            from public.occurrences
           where market_id = p.id and date >= current_date
           order by date
        ) o
    )                                               as occurrences
  from public.publishable_markets p
  join public.markets m on m.id = p.id
  join public.venues v on v.id = p.venue_id
  left join public.organisers org on org.id = m.organiser_id
  join public.slugs sc on sc.entity_type = 'city' and sc.entity_id = p.city_id
                      and sc.locale = $1 and sc.is_current
  join public.texts tc on tc.entity_type = 'city' and tc.entity_id = p.city_id
                      and tc.locale = $1 and tc.field = 'name'
  join public.slugs sr on sr.entity_type = 'region' and sr.entity_id = p.region_id
                      and sr.locale = $1 and sr.is_current
  join public.slugs sk on sk.entity_type = 'country' and sk.entity_id = p.country_id
                      and sk.locale = $1 and sk.is_current
  join public.texts tr on tr.entity_type = 'region' and tr.entity_id = p.region_id
                      and tr.locale = $1 and tr.field = 'name'
  left join public.slugs sm on sm.entity_type = 'market' and sm.entity_id = p.id
                           and sm.locale = $1 and sm.is_current
  left join public.texts nm on nm.entity_type = 'market' and nm.entity_id = p.id
                           and nm.locale = $1 and nm.field = 'name'
  left join public.texts ds on ds.entity_type = 'market' and ds.entity_id = p.id
                           and ds.locale = $1 and ds.field = 'description'
  -- The German column is the fallback, so a locale we have not written yet
  -- still renders the sentence we do hold rather than nothing.
  left join public.texts rt on rt.entity_type = 'market' and rt.entity_id = p.id
                           and rt.locale = $1 and rt.field = 'recurrence_text'
  order by p.slug
`;

function toOccurrence(row: NonNullable<Row['occurrences']>[number]): Occurrence {
  return {
    date: row.date,
    startTime: row.start_time?.slice(0, 5) ?? undefined,
    endTime: row.end_time?.slice(0, 5) ?? undefined,
    status: row.status,
    cancellationNote: row.cancellation_note ?? undefined,
    // A timestamptz in the database, a calendar date on the page. The German
    // formatters parse YYYY-MM-DD and nothing else, so it is narrowed here
    // rather than in a template — "Bestätigt am NaN. undefined" otherwise.
    confirmedAt: row.confirmed_at?.slice(0, 10) ?? undefined,
    origin: row.origin ?? undefined,
  };
}

export async function fetchMarkets(locale = 'de'): Promise<Market[]> {
  // Normalised, not read raw: a single leading space in the Cloudflare variable
  // made `pg` read the host as `base` and the build died with ENOTFOUND.
  const connectionString = requireConnectionString(process.env.SUPABASE_DB_URL, 'SUPABASE_DB_URL');

  // Supabase terminates unencrypted connections and its chain is not in Node's
  // store — the same trade scripts/db.mjs makes, for the same reason.
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const { rows } = await client.query<Row>(SQL, [locale]);

    return rows.map((row) => {
      const dates = (row.occurrences ?? []).map(toOccurrence);
      // The first non-cancelled date is the one the page emits as its single
      // schema.org Event; everything after it is visible content, not markup.
      const nextIndex = dates.findIndex((o) => o.status !== 'cancelled');

      return {
        slug: row.slug,
        name: row.name,
        description: row.description ?? undefined,
        kind: row.kind,
        city: row.city,
        citySlug: row.city_slug,
        region: row.region,
        regionSlug: row.region_slug,
        countrySlug: row.country_slug,
        timezone: row.timezone,
        venueName: row.venue_name,
        addressLine: row.address_line,
        postalCode: row.postal_code ?? undefined,
        lat: row.lat,
        lng: row.lng,
        next: nextIndex === -1 ? undefined : dates[nextIndex],
        upcoming: dates.filter((_, i) => i !== nextIndex),
        imageUrl: row.image_url ?? undefined,
        recurrenceText: row.recurrence_text ?? undefined,
        verifiedBy: row.verified_by ?? undefined,
        verifiedAt: row.verified_at?.slice(0, 10) ?? undefined,
        organiserName: row.organiser_name ?? undefined,
        websiteUrl: row.website_url ?? undefined,
        entryFee: row.entry_fee === null ? undefined : Number(row.entry_fee),
      };
    });
  } finally {
    await client.end();
  }
}
