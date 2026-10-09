#!/usr/bin/env node
/**
 * Market Finder, step 2: which leads are markets we lack, and does the
 * organiser's own page show a date for them? (docs/WATCH-SPEC.md §The finder)
 *
 *   node scripts/finder/check.mjs intake/finder/leads-mft-<date>.json [--country DE] [--limit n]
 *     → intake/finder/check-<date>.json: candidates, dropped (with the reason), known
 *
 * Nothing is written to the database. A candidate is a lead whose organiser
 * page, read with the watcher's own fetch, cleaner and date reader, shows at
 * least one upcoming date beside the market's name or town. A person (or an
 * agent following intake/README.md) turns candidates into intake files; the
 * import makes them `unverified`; nothing reaches the site until checked.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { query } from '../db.mjs';
import { todayIso } from '../../src/lib/format.ts';
import { fetchSource, politely, closeBrowser } from '../watch/fetch.mjs';
import { cleanHtml, cleanText, withoutNoise } from '../watch/clean.mjs';
import { extractDates, normalise } from '../watch/dates.mjs';
import { marketTokens } from '../watch/decide.mjs';

const args = process.argv.slice(2);
const file = args.find((a) => a.endsWith('.json'));
const COUNTRY = (args.includes('--country') ? args[args.indexOf('--country') + 1] : 'DE').toUpperCase();
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : null;
if (!file) { console.error('Usage: node scripts/finder/check.mjs intake/finder/leads-<…>.json [--country DE]'); process.exit(1); }

const today = todayIso();
const domain = (u) => { try { return new URL(u).host.toLowerCase().replace(/^www\./, ''); } catch { return null; } };
// Pages that are themselves directories or social networks are no organiser's page.
const NOT_ORGANISER = /(^|\.)(facebook|instagram|krencky24|marktcom|meine-flohmarkt-termine|flohmarkt-termine|meinestadt|eventbrite|kleinanzeigen)\.(com|de|net)$/i;
// What makes a line about a flea market rather than a Christmas market or a play.
const FLEA_WORD = /floh|trödel|troedel|trodel|antik|krempel|sammler|vintage|second/iu;
const SCHEDULE_LINK = /termin|veranstaltung|kalender|daten|dates|markttage|flohm|trödel|troedel|programm/i;

// Words that name a kind of place or day, not a market: "Platz", "Parkplatz", "Sonntag" match half of Germany.
const PLACE = new Set(['platz', 'parkplatz', 'gelände', 'gelaende', 'festplatz', 'halle', 'hallen', 'messehalle', 'messehallen', 'center',
  'zentrum', 'einkaufszentrum', 'strasse', 'straße', 'str', 'park', 'parkhaus', 'markthalle', 'stadthalle', 'antikflohmarkt',
  'flohmärkte', 'trödelmärkte', 'sammler', 'sammlermarkt', 'kunst', 'buchmarkt', 'großflohmarkt', 'grossflohmarkt', 'riesenflohmarkt',
  'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'sonnabend', 'mittwochströdelmarkt',
  'wochenende', 'jeden', 'überdacht', 'ueberdacht', 'ohne', 'standgebühr', 'berliner', 'hamburger', 'kölner', 'münchner']);
/** A market's own words: its name minus generic words, place words and its town. */
const ownWords = (name, town) => {
  const townWords = new Set(marketTokens({ name: town }));
  return marketTokens({ name }).filter((t) => !PLACE.has(t) && !townWords.has(t));
};

const leads = JSON.parse(readFileSync(file, 'utf8')).filter((l) => l.country === COUNTRY);

/* ---------------------------------------------------------------------------
 * already ours?
 * ------------------------------------------------------------------------- */

const ours = await query(`
  select m.slug, coalesce(n.value, ne.value, m.slug) as name, coalesce(cn.value, '') as town, coalesce(v.postal_code, '') as postcode,
         m.website_url, o.channel_value as organiser_url
    from public.markets m
    join public.venues v on v.id = m.venue_id
    left join public.organisers o on o.id = m.organiser_id
    left join public.texts n  on n.entity_type = 'market' and n.entity_id = m.id and n.field = 'name' and n.locale = 'de'
    left join public.texts ne on ne.entity_type = 'market' and ne.entity_id = m.id and ne.field = 'name' and ne.locale = 'en'
    left join public.texts cn on cn.entity_type = 'city' and cn.entity_id = v.city_id and cn.field = 'name' and cn.locale = 'de'`);
const ourIndex = ours.map((m) => ({
  ...m, tokens: new Set(ownWords(m.name, m.town)), domains: new Set([domain(m.website_url), domain(m.organiser_url)].filter(Boolean)),
  townKey: normalise(m.town),
}));

/** The market of ours in the same place sharing the most own words (or the organiser's site), if any. */
function known(lead) {
  const town = lead.town.split(',')[0];
  const tokens = ownWords(lead.name, lead.town);
  const d = domain(lead.organiser_url);
  const townKey = normalise(town);
  let best = null, bestScore = 0;
  for (const m of ourIndex) {
    const samePlace = (lead.postcode && m.postcode === lead.postcode) || (townKey && m.townKey === townKey);
    if (!samePlace) continue;
    const score = tokens.filter((t) => m.tokens.has(t)).length * 2 + (d && m.domains.has(d) && lead.postcode && m.postcode === lead.postcode ? 1 : 0);
    if (score > bestScore) { best = m; bestScore = score; }
  }
  return best;
}

const fresh = [];
const knownList = [];
for (const lead of leads) {
  const m = known(lead);
  if (m) knownList.push({ name: lead.name, town: lead.town, ours: m.slug });
  else fresh.push(lead);
}
let todo = fresh.filter((l) => l.organiser_url && !NOT_ORGANISER.test(domain(l.organiser_url) ?? ''));
const dropped = fresh.filter((l) => !todo.includes(l)).map((l) => ({ ...l, why: l.organiser_url ? 'organiser link is a directory or social page' : 'no organiser link' }));
if (LIMIT) todo = todo.slice(0, LIMIT);
console.log(`${leads.length} ${COUNTRY} leads: ${knownList.length} already ours, ${fresh.length} new; ${todo.length} with an organiser page to read.`);

/* ---------------------------------------------------------------------------
 * read the organiser's page — and, if it shows nothing, its schedule page
 * ------------------------------------------------------------------------- */

async function readPage(url) {
  const got = await fetchSource({ url, access: 'fetch' }, null);
  if (got.outcome !== 'read') return { got, lines: [], links: [] };
  if (got.kind === 'pdf') return { got, lines: withoutNoise(cleanText(got.body), [], today), links: [] };
  const c = cleanHtml(got.body, got.finalUrl ?? url);
  const $ = cheerio.load(got.body);
  const host = domain(got.finalUrl ?? url);
  const links = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    const text = $(el).text();
    try {
      const abs = new URL(href, got.finalUrl ?? url).href;
      if (domain(abs) === host && SCHEDULE_LINK.test(`${text} ${href}`) && !/\.(jpe?g|png|gif)$/i.test(abs)) links.push(abs.split('#')[0]);
    } catch { /* not a link */ }
  });
  const events = c.events.map((e) => [e.name, e.start.slice(0, 10), e.status ?? '', e.place].filter(Boolean).join(' · '));
  return { got, lines: withoutNoise([...c.lines, ...events], [], today), links: [...new Set(links)].slice(0, 2) };
}

/**
 * Upcoming dates on lines (or under headings) that name the market's town — an
 * organiser's page lists all its towns, so a date beside "Horb" is not Tuttlingen's —
 * or, for a lead with no town, its own words.
 */
function datesFor(lines, lead) {
  const town = normalise(lead.town.split(',')[0]);
  const own = ownWords(lead.name, lead.town);
  const lower = lines.map(normalise);
  const { dates } = extractDates(lines, { today });
  const dateLines = new Set(dates.map((d) => d.line));
  const heading = (i) => { for (let j = i - 1; j >= Math.max(0, i - 8); j--) if (!dateLines.has(j)) return lower[j]; return ''; };
  // The date's own line and the heading it sits under — never a neighbouring entry's line.
  const near = (i) => `${lower[i]} ${heading(i)}`;
  // A page about this one market (its own words or "Flohmarkt" in the first lines) needs no flea word on every line.
  const dedicated = lower.slice(0, 12).some((l) => (own.length && own.some((t) => l.includes(t))) || (town && l.includes(town) && FLEA_WORD.test(l)));
  return dates.filter((d) => {
    if (d.off || d.assumed) return false;
    const n = near(d.line);
    const place = (town && n.includes(town)) || own.some((t) => n.includes(t));
    return place && (dedicated || FLEA_WORD.test(n));
  });
}

const candidates = [];
await politely(todo.map((l) => ({ ...l, url: l.organiser_url })), async (lead) => {
  let page = await readPage(lead.url);
  let found = datesFor(page.lines, lead);
  let source = page.got.finalUrl ?? lead.url;
  for (const link of page.links) {
    if (found.length) break;
    const next = await readPage(link);
    const more = datesFor(next.lines, lead);
    if (more.length) { found = more; source = next.got.finalUrl ?? link; page = next; }
  }
  if (!found.length) {
    dropped.push({ ...lead, why: page.got.outcome === 'read' ? 'no upcoming date beside its name on the organiser page' : `organiser page ${page.got.outcome}` });
    return;
  }
  candidates.push({
    name: lead.name, town: lead.town, postcode: lead.postcode, organiser_url: lead.organiser_url,
    source_page: source, dates: found.map((d) => d.iso),
    evidence: [...new Set(found.slice(0, 3).map((d) => page.lines[d.line].slice(0, 160)))],
    directory_url: lead.directory_url,
  });
}, 5);
await closeBrowser();

// leads-mft-berlin-…-<date>.json → check-de-mft-berlin-…-<date>.json, beside it: one check per lead file.
const out = file.replace(/leads-([^/\\]+)\.json$/, `check-${COUNTRY.toLowerCase()}-$1.json`);
writeFileSync(out, JSON.stringify({ checked: today, candidates, dropped, known: knownList }, null, 1) + '\n');
console.log(`${candidates.length} candidate(s) with dates on the organiser's own page; ${dropped.length} dropped; ${knownList.length} already ours → ${out}`);
process.exit(0);
