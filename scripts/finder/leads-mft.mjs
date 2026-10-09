#!/usr/bin/env node
/**
 * Market Finder, step 1: the recurring markets meine-flohmarkt-termine.de lists
 * (docs/WATCH-SPEC.md §The finder). Online since 2004; its robots.txt allows
 * the detail pages, and ~90% of its recurring German markets link to their
 * organiser.
 *
 *   node scripts/finder/leads-mft.mjs            → intake/finder/leads-mft-<today>.json
 *   --limit <n>                                  only the first n series (a smoke test)
 *
 * A directory may only tell us a market exists (intake/README.md). From each
 * series we keep its name, town, postcode, country, the organiser's website and
 * the directory page it came from — no text, no photos, and its dates are only
 * counted, never kept: every date is read later from the organiser's own page.
 *
 * Recurring = the sitemap has 3 or more dated pages for the same series.
 * Children's, yard, garage, private-household and women's markets are left out:
 * they are one-off or private sales, not what the site lists.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { fetchSource, politely } from '../watch/fetch.mjs';
import { todayIso } from '../../src/lib/format.ts';

const SITEMAP = 'https://meine-flohmarkt-termine.de/sitemaps/mft/eventdetail-sitemap.xml';
const LIMIT = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : null;
// The directory lists every kind of event; a lead must say flea, junk or antique market in its name.
const FLEA = /floh|trodel|troedel|trödel|antik|sammler|krempel|raritat|vintage|second-?hand|flowmarkt|nachtmarkt-?floh/i;
const SKIP = /kinder|kids|baby|hof-?flohmarkt|garagen|strassenflohmarkt|haushalt|privat|frauen|maedchen|mädchen|madels|mädels|ladies|damen|schul|kita|basar-fur-kinder|kleiderbasar|spielzeug|nachbarschaft/i;

const sitemap = await fetchSource({ url: SITEMAP, access: 'fetch' }, null);
if (sitemap.outcome !== 'read') throw new Error(`sitemap: ${sitemap.outcome} ${sitemap.note ?? ''}`);
const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

// /{slug}/{id}/details — one page per date; a series is its slug.
const series = new Map();
for (const url of urls) {
  const m = url.match(/meine-flohmarkt-termine\.de\/([^/]+)\/\d+\/details/);
  if (m) series.set(m[1], [...(series.get(m[1]) ?? []), url]);
}
let recurring = [...series].filter(([slug, list]) => list.length >= 3 && FLEA.test(slug) && !SKIP.test(slug));
if (LIMIT) recurring = recurring.slice(0, LIMIT);
console.log(`${urls.length} dated pages, ${series.size} series, ${recurring.length} recurring flea, junk or antique (children's, yard and private sales left out).`);

const leads = [];
await politely(recurring.map(([slug, list]) => ({ url: list[0], slug, count: list.length })), async (s) => {
  const got = await fetchSource({ url: s.url, access: 'fetch' }, null);
  if (got.outcome !== 'read') return;
  const $ = cheerio.load(got.body);
  let event = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try { const j = JSON.parse($(el).text()); if (j['@type'] === 'Event') event = j; } catch { /* skip */ }
  });
  if (!event) return;
  const address = event.location?.address ?? {};
  const organiser = $('a').filter((_, el) => /Website des Veranstalters/i.test($(el).text())).first().attr('href')
    ?? $('a').filter((_, el) => /Website der\s+Veranstaltung/i.test($(el).text().replace(/\s+/g, ' '))).first().attr('href') ?? null;
  leads.push({
    name: String(event.name ?? '').trim(),
    town: String(address.addressLocality ?? '').trim(),
    postcode: String(address.postalCode ?? '').trim(),
    country: String(address.addressCountry ?? '').trim().toUpperCase().slice(0, 2),
    organiser_url: organiser,
    directory_url: s.url,
    dates_listed: s.count,
  });
}, 2, [1000, 1500]);

const out = new URL(`../../intake/finder/leads-mft-${todayIso()}.json`, import.meta.url);
mkdirSync(new URL('.', out), { recursive: true });
writeFileSync(out, JSON.stringify(leads.sort((a, b) => a.postcode.localeCompare(b.postcode)), null, 1) + '\n');
const byCountry = leads.reduce((c, l) => ({ ...c, [l.country || '?']: (c[l.country || '?'] ?? 0) + 1 }), {});
console.log(`${leads.length} leads (${Object.entries(byCountry).map(([k, v]) => `${k} ${v}`).join(', ')}), ${leads.filter((l) => l.organiser_url).length} with an organiser link → ${out.pathname}`);
process.exit(0);
