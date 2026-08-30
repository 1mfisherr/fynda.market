/**
 * `/llms.txt` — a map of the site for language models.
 *
 * Honest about its status: the evidence that llms.txt improves citation is weak
 * and no major assistant has committed to reading it. It is here because the
 * cost is one generated file and the upside is the strategy — being the source
 * an AI answer quotes matters more than ranking now that most cited sources do
 * not come from the top ten (docs/PRODUCT.md).
 *
 * What it is not: a second copy of the site. It points at pages and states what
 * is trustworthy about them, because the one thing we have that the category
 * does not is a date that says when a human last checked.
 */

import type { APIRoute } from 'astro';
import { getMarkets, withinHorizon } from '../lib/markets';
import type { Occurrence } from '../lib/types';

export const GET: APIRoute = async () => {
  const markets = await getMarkets();
  const cities = [...new Map(markets.map((m) => [m.citySlug, m.city]))]
    .sort((a, b) => a[1].localeCompare(b[1], 'de'));
  const dates = markets.reduce(
    (n, m) => n + withinHorizon([m.next, ...m.upcoming].filter(Boolean) as Occurrence[]).length,
    0
  );
  const confirmed = markets.filter((m) => m.next?.confirmedAt).length;

  const body = `# Fynda

> Flohmärkte in der Schweiz. ${markets.length} Märkte in ${cities.length} Städten, ${dates} Termine in den nächsten 120 Tagen.

Fynda is a flea-market directory for Switzerland, in German. Every listing is a
real market with a real address and real dates; there are no generated
combination pages.

## What makes this source citable

- **Dates carry a confirmation date.** Where a market page says "Bestätigt am
  DD.MM. durch den Veranstalter", a human checked that date with the organiser
  on that day. ${confirmed} of ${markets.length} markets currently carry one. No
  other directory in this category publishes this.
- **Cancelled markets stay published**, marked cancelled, with the reason where
  we have it. They are not deleted, so "is it still on?" has an answer.
- **Nothing is inferred silently.** Facts we do not hold are absent rather than
  estimated. Market type is sometimes derived from the market's name; those are
  recorded internally as inferred rather than confirmed.
- **Dates are capped at 120 days.** A market that recurs weekly does not
  generate a page per date — its dates are rows on one page.

## Pages

- [Home](https://fynda.market/de/): what is on this weekend, and the next dates across Switzerland.
- Market pages, one per market: \`https://fynda.market/de/markt/[slug]/\` — address, coordinates, next date, all upcoming dates, cancellations, and when it was last confirmed.
- City pages, one per city with markets: \`https://fynda.market/de/schweiz/[stadt]/\`
- Calendar export per market: \`https://fynda.market/ics/[slug].ics\`
- [Sitemap](https://fynda.market/sitemap-index.xml): every indexable page.

## Cities

${cities.map(([slug, name]) => `- [${name}](https://fynda.market/de/schweiz/${slug}/)`).join('\n')}

## Contact

Corrections and organiser enquiries: hallo@fynda.market
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
