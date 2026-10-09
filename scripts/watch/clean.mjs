/**
 * A downloaded page → the lines a person would read, plus anything exact the
 * page carries for machines (JSON-LD events, calendar links).
 *
 * Not Mozilla Readability: it throws away anything whose class says sidebar,
 * header or banner, which is exactly where "next dates" boxes sit. We keep the
 * whole page and remove only what is never content.
 *
 * Struck-through text is kept and wrapped in ~~ ~~, because a struck date is a
 * cancellation (dates.mjs reads the marker).
 */

import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';
import { createHash } from 'node:crypto';

// Consent tools and page furniture that are never about a market.
const NOISE = [
  'script:not([type="application/ld+json"])', 'style', 'noscript', 'svg', 'iframe', 'template', 'canvas', 'form',
  '#CybotCookiebotDialog', '#onetrust-consent-sdk', '#usercentrics-root', '#BorlabsCookieBox', '.borlabs-cookie',
  '#cookie-law-info-bar', '.cookie-notice', '#cookie-notice', '.cc-window', '#cmplz-cookiebanner-container', '[aria-modal="true"][role="dialog"]',
].join(',');

const PARKED_RE = /domain (?:is )?for sale|diese domain (?:kann|steht)|domain kaufen|this domain may be for sale|buy this domain|parked free|domaine à vendre|dominio in vendita/i;
const CHALLENGE_RE = /just a moment|attention required|client challenge|access denied|are you human|verify you are|security check|bot verification/i;

/** One line per block, NFC, no empty lines, no line twice in a row. */
function toLines(text) {
  const lines = [];
  for (const raw of text.normalize('NFC').split('\n')) {
    const line = raw.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();
    if (line && line !== lines[lines.length - 1]) lines.push(line);
  }
  return lines;
}

/** JSON-LD Event objects, wherever they sit in the graph. */
function events($) {
  const out = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    const type = [].concat(node['@type'] ?? []).map(String);
    if (type.some((t) => /Event$/.test(t)) && node.startDate) {
      out.push({
        name: String(node.name ?? ''),
        start: String(node.startDate),
        end: node.endDate ? String(node.endDate) : null,
        status: node.eventStatus ? String(node.eventStatus).replace(/^https?:\/\/schema\.org\//, '') : null,
        place: typeof node.location === 'object' ? String(node.location?.name ?? '') : String(node.location ?? ''),
      });
    }
    for (const value of Object.values(node)) if (value && typeof value === 'object') visit(value);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try { visit(JSON.parse($(el).text())); } catch { /* a broken block is not our problem */ }
  });
  return out;
}

/**
 * @param {string} html
 * @param {string} baseUrl   for resolving calendar links
 * @returns {{title: string, lines: string[], events: object[], calendars: string[], parked: boolean, challenge: boolean}}
 */
export function cleanHtml(html, baseUrl) {
  const $ = cheerio.load(html);
  const title = $('title').first().text().replace(/\s+/g, ' ').trim();
  const found = events($);
  const calendars = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (/\.ics(\?|$)|webcal:|\/ical\/|calendar\/ical/i.test(href)) {
      try { calendars.add(new URL(href.replace(/^webcal:/i, 'https:'), baseUrl).href); } catch { /* not a URL */ }
    }
  });

  $(NOISE).remove();
  // Line-through, however it is written, survives as ~~text~~.
  $('del, s, strike, [style*="line-through"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) $(el).replaceWith(` ~~${text}~~ `);
  });

  const text = convert($.html(), {
    wordwrap: false,
    preserveNewlines: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' },
      { selector: 'h1', options: { uppercase: false } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
      { selector: 'h4', options: { uppercase: false } },
      { selector: 'h5', options: { uppercase: false } },
      { selector: 'h6', options: { uppercase: false } },
      { selector: 'table', format: 'dataTable', options: { uppercaseHeaderCells: false, colSpacing: 2, maxColumnWidth: 120 } },
      { selector: 'ul', options: { itemPrefix: '– ' } },
    ],
  });
  const lines = toLines(text);
  const body = lines.join(' ');
  return {
    title,
    lines,
    events: found,
    calendars: [...calendars],
    parked: PARKED_RE.test(body) && lines.length < 80,
    challenge: CHALLENGE_RE.test(title) && lines.length < 40,
  };
}

/** Lines from a PDF's text (pdftotext -layout): columns collapse to one space. */
export function cleanText(text) {
  return toLines(text.replace(/ {2,}/g, '  '));
}

/**
 * Drop lines that change by themselves — the source's own rules plus the usual
 * suspects, and any line carrying today's date ("Heute, 09.10.2026"): a page
 * that prints the date would otherwise look changed, and dated, every day.
 */
export function withoutNoise(lines, ignore = [], today = null) {
  const [y, m, d] = today ? today.split('-') : [];
  const todayForms = today ? [today, `${d}.${m}.${y}`, `${+d}.${+m}.${y}`, `${d}/${m}/${y}`, `${+d}/${+m}/${y}`] : [];
  const rules = [
    /^©|copyright|\(c\) 20\d\d/i,
    /zuletzt aktualisiert|letzte änderung|stand:|mis à jour|dernière mise à jour|aggiornat[oa]|last updated|updated on/i,
    /besucher(?:zähler)?:?\s*\d|visitors?:?\s*\d|\d+\s+(?:aufrufe|views)/i,
    ...ignore.map((r) => new RegExp(r, 'i')),
  ];
  return lines.filter((line) => !rules.some((r) => r.test(line)) && !todayForms.some((f) => line.includes(f)));
}

/** A fingerprint of what the watcher reads, not of the HTML around it. */
export const hashLines = (lines) => createHash('sha256').update(lines.join('\n'), 'utf8').digest('hex');

/** Short, stable id for one line — what `watch_pages.seen` remembers. */
export const lineId = (line) => createHash('sha1').update(line.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12);
