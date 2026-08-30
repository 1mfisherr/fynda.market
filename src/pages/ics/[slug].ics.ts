/**
 * One calendar file per market — `/ics/[slug].ics`.
 *
 * The audience's entire job is "remember this Sunday", and exactly one site in
 * the whole category offers a calendar export (docs/PRODUCT.md). It is also the
 * cheapest retention loop available: once a market is in someone's calendar we
 * no longer need them to come back in order to be useful to them.
 *
 * A file, not a page. It carries no URL that competes for a query, so it adds
 * nothing to the page count the guardrails police.
 */

import type { APIRoute } from 'astro';
import { getMarkets, withinHorizon } from '../../lib/markets';
import type { Market, Occurrence } from '../../lib/types';

export async function getStaticPaths() {
  const markets = await getMarkets();
  return markets.map((market) => ({ params: { slug: market.slug }, props: { market } }));
}

/** RFC 5545: these characters carry meaning in a property value. */
const esc = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/**
 * Local date-time with no Z and no offset, paired with TZID. A flea market
 * happens at nine in the morning where it stands, whatever the reader's phone
 * is set to — a local time plus a zone is exactly that claim.
 */
const stamp = (date: string, time?: string) =>
  `${date.replace(/-/g, '')}T${(time ?? '09:00').slice(0, 5).replace(':', '')}00`;

/**
 * Lines over 75 octets must be folded, and a long German market name in a
 * SUMMARY passes that easily. Unfolded, strict parsers drop the property.
 */
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const parts: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (start === 0 ? 75 : 74), bytes.length);
    // Never split inside a multi-byte character.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    parts.push((start === 0 ? '' : ' ') + bytes.subarray(start, end).toString('utf8'));
    start = end;
  }
  return parts.join('\r\n');
}

/**
 * v1's address_line frequently already contains the venue name and the city
 * ("Dynamo Jugendkulturhaus, Wasserwerkstrasse 21, 8006 Zürich"), so joining
 * the three parts blindly produces "Stadthausanlage, Stadthausanlage, 8001
 * Zürich, Zürich" in the visitor's calendar. Add only what is missing.
 */
function locationOf(market: Market): string {
  const parts = [market.addressLine];
  if (!market.addressLine.includes(market.venueName)) parts.unshift(market.venueName);
  if (!market.addressLine.includes(market.city)) parts.push(market.city);
  return parts.join(', ');
}

function event(market: Market, occurrence: Occurrence, generatedAt: string): string[] {
  const location = locationOf(market);
  return [
    'BEGIN:VEVENT',
    `UID:${market.slug}-${occurrence.date}@fynda.market`,
    `DTSTAMP:${generatedAt}`,
    `DTSTART;TZID=${market.timezone}:${stamp(occurrence.date, occurrence.startTime)}`,
    ...(occurrence.endTime
      ? [`DTEND;TZID=${market.timezone}:${stamp(occurrence.date, occurrence.endTime)}`]
      : []),
    fold(`SUMMARY:${esc(market.name)}`),
    fold(`LOCATION:${esc(location)}`),
    fold(`URL:https://fynda.market/de/markt/${market.slug}/`),
    // A cancelled date is exported as cancelled rather than dropped: a calendar
    // that quietly loses the entry cannot tell anyone it was called off.
    `STATUS:${occurrence.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    ...(occurrence.cancellationNote ? [fold(`DESCRIPTION:${esc(occurrence.cancellationNote)}`)] : []),
    'END:VEVENT',
  ];
}

export const GET: APIRoute = ({ props }) => {
  const market = props.market as Market;
  const dates = withinHorizon([market.next, ...market.upcoming].filter(Boolean) as Occurrence[]);

  // DTSTAMP is when this object was written, not when the market happens, and
  // it is the one property that must be UTC.
  const generatedAt = `${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`;

  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fynda//fynda.market//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...dates.flatMap((occurrence) => event(market, occurrence, generatedAt)),
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${market.slug}.ics"`,
    },
  });
};
