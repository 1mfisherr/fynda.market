/**
 * Downloading organisers' pages the way a polite guest would.
 *
 * - We say who we are (USER_AGENT) and obey robots.txt.
 * - One request at a time per host, a few seconds apart; a handful of hosts at once.
 * - We send back the ETag / Last-Modified a server gave us; "304 Not Modified" costs nothing.
 * - Bytes are decoded by the page's own charset: Node's res.text() assumes UTF-8
 *   and turns a windows-1252 "März" into "M�rz", which breaks month matching.
 * - A page with almost no text is opened in Edge (already on Windows), once.
 * - A challenge page, a 429 or a login wall is never fought: the source is
 *   marked and a person deals with it (docs/WATCH-SPEC.md §Fetching rules).
 */

import { execFile } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import robotsParser from 'robots-parser';

const run = promisify(execFile);

export const USER_AGENT = 'Mozilla/5.0 (compatible; fyndaBot/1.0; +https://fynda.market/en/about/)';
const ACCEPT_LANGUAGE = 'de-DE,de;q=0.9,de-CH;q=0.8,fr;q=0.7,it;q=0.6,en;q=0.5';
const TIMEOUT_MS = 20_000;
const MAX_BYTES = 5 * 1024 * 1024;
const HOST_GAP_MS = [3000, 5000];
const BROWSER_BELOW_CHARS = 300;
const PDFTOTEXT = ['pdftotext', 'C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hostOf = (url) => { try { return new URL(url).host.toLowerCase(); } catch { return url; } };

/* ---------------------------------------------------------------------------
 * robots.txt, one read per host per run
 * ------------------------------------------------------------------------- */

const robots = new Map();

/** 'allow' | 'deny' | 'skip' (the host could not say; try again tomorrow). RFC 9309: a 4xx means allowed. */
async function robotsSays(url) {
  const origin = new URL(url).origin;
  if (!robots.has(origin)) {
    robots.set(origin, (async () => {
      try {
        const res = await fetch(`${origin}/robots.txt`, { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (res.status >= 500) return null;
        if (res.status >= 400) return robotsParser(`${origin}/robots.txt`, '');
        return robotsParser(`${origin}/robots.txt`, (await res.text()).slice(0, 500_000));
      } catch {
        return null;
      }
    })());
  }
  const parser = await robots.get(origin);
  if (!parser) return 'skip';
  return parser.isAllowed(url, 'fyndaBot') === false ? 'deny' : 'allow';
}

/* ---------------------------------------------------------------------------
 * decoding
 * ------------------------------------------------------------------------- */

function charsetOf(contentType, bytes) {
  const header = /charset=["']?([\w-]+)/i.exec(contentType ?? '')?.[1];
  if (header) return header.toLowerCase();
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 4096));
  return (/<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ?? 'utf-8').toLowerCase();
}

export function decode(bytes, contentType) {
  let charset = charsetOf(contentType, bytes);
  if (charset === 'iso-8859-1' || charset === 'latin1') charset = 'windows-1252'; // what browsers do
  try {
    const text = new TextDecoder(charset).decode(bytes);
    // A page that says UTF-8 and is not: many replacement characters.
    if (charset === 'utf-8' && (text.match(/\uFFFD/g)?.length ?? 0) > 5) return new TextDecoder('windows-1252').decode(bytes);
    return text;
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

/* ---------------------------------------------------------------------------
 * one request
 * ------------------------------------------------------------------------- */

async function request(url, previous) {
  const headers = { 'user-agent': USER_AGENT, 'accept-language': ACCEPT_LANGUAGE, accept: 'text/html,application/xhtml+xml,application/pdf,text/calendar;q=0.9,*/*;q=0.5' };
  if (previous?.etag) headers['if-none-match'] = previous.etag;
  if (previous?.last_modified) headers['if-modified-since'] = previous.last_modified;
  const res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
  const length = Number(res.headers.get('content-length') ?? 0);
  if (length > MAX_BYTES) return { res, bytes: new Uint8Array(), tooBig: true };
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { res, bytes, tooBig: bytes.length > MAX_BYTES };
}

/** Some servers refuse Node's TLS handshake and answer curl; same honest User-Agent. */
async function curl(url) {
  const dir = mkdtempSync(join(tmpdir(), 'fynda-watch-'));
  const body = join(dir, 'body');
  try {
    const { stdout } = await run('curl', ['-sS', '-L', '--compressed', '--max-time', '20', '--max-redirs', '5', '--max-filesize', String(MAX_BYTES),
      '-A', USER_AGENT, '-H', `Accept-Language: ${ACCEPT_LANGUAGE}`, '-o', body, '-w', '%{http_code}\t%{content_type}\t%{url_effective}', url], { maxBuffer: 1 << 20 });
    const [status, type, finalUrl] = stdout.trim().split('\t');
    return { status: Number(status), type, finalUrl, bytes: existsSync(body) ? new Uint8Array(readFileSync(body)) : new Uint8Array() };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

let browser = null;
async function rendered(url) {
  if (!browser) {
    const { chromium } = await import('playwright-core');
    browser = chromium.launch({ channel: 'msedge', headless: true });
  }
  const context = await (await browser).newContext({ locale: 'de-DE' });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
    await page.waitForTimeout(2000);
    return { html: await page.content(), finalUrl: page.url() };
  } finally {
    await context.close();
  }
}
export async function closeBrowser() { if (browser) await (await browser).close(); browser = null; }

async function pdfToText(bytes) {
  const dir = mkdtempSync(join(tmpdir(), 'fynda-pdf-'));
  const file = join(dir, 'page.pdf');
  writeFileSync(file, bytes);
  try {
    for (const bin of PDFTOTEXT) {
      try {
        const { stdout } = await run(bin, ['-layout', '-enc', 'UTF-8', file, '-'], { maxBuffer: 16 << 20 });
        return stdout;
      } catch (e) { if (e.code !== 'ENOENT') return ''; }
    }
    return null;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const isPdf = (type, bytes) => /application\/pdf/i.test(type) || new TextDecoder('latin1').decode(bytes.subarray(0, 5)) === '%PDF-';
const isIcs = (type, text) => /text\/calendar/i.test(type) || /^BEGIN:VCALENDAR/m.test(text.slice(0, 200));
const textLength = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;

/**
 * Fetch one source.
 *
 * @param {{url: string, access: string}} source
 * @param {{etag?: string, last_modified?: string}|null} previous  the last watch_pages row
 * @returns {Promise<{outcome: string, status?: number, finalUrl?: string, renderer?: string, etag?: string|null,
 *   lastModified?: string|null, kind?: 'html'|'pdf'|'ics', body?: string, note?: string}>}
 */
export async function fetchSource(source, previous) {
  const { url } = source;
  const allowed = await robotsSays(url);
  if (allowed === 'deny') return { outcome: 'robots', note: 'robots.txt disallows us' };
  if (allowed === 'skip') return { outcome: 'unreachable', note: 'robots.txt did not answer' };

  let status, type, finalUrl, bytes, etag = null, lastModified = null, renderer = 'fetch', note;
  try {
    const { res, bytes: b, tooBig } = await request(url, previous);
    if (tooBig) return { outcome: 'unsupported', status: res.status, note: 'larger than 5 MB' };
    if (res.headers.get('cf-mitigated') === 'challenge') return { outcome: 'blocked', status: res.status, note: 'Cloudflare challenge' };
    if (res.status === 304) return { outcome: 'not_modified', status: 304, finalUrl: url, etag: previous?.etag ?? null, lastModified: previous?.last_modified ?? null };
    if (res.status === 429 || res.status === 503) return { outcome: 'unreachable', status: res.status, note: `busy (${res.status}), skipped until next week` };
    ({ status } = res);
    type = res.headers.get('content-type') ?? '';
    finalUrl = res.url;
    bytes = b;
    etag = res.headers.get('etag');
    lastModified = res.headers.get('last-modified');
  } catch (error) {
    note = String(error.cause?.code ?? error.name ?? error);
  }

  // Refused or failed outright: one more try with curl, which some servers prefer.
  if (status === undefined || status === 403 || status === 406) {
    try {
      const c = await curl(url);
      if (c.status && c.status !== 403 && c.status !== 406) {
        ({ status, type, finalUrl, bytes } = c);
        renderer = 'curl';
      } else if (c.status) {
        status = c.status;
      }
    } catch (error) {
      note = note ?? String(error.code ?? error);
    }
  }
  if (status === undefined) return { outcome: 'unreachable', note };
  if (status === 404 || status === 410) return { outcome: 'not_found', status, finalUrl };
  if (status === 401 || status === 403 || status === 406) return { outcome: 'blocked', status, finalUrl, note: `HTTP ${status}` };
  if (status >= 400) return { outcome: 'unreachable', status, finalUrl, note: `HTTP ${status}` };

  if (isPdf(type, bytes)) {
    const text = await pdfToText(bytes);
    if (text === null) return { outcome: 'unsupported', status, finalUrl, note: 'pdftotext not found' };
    return { outcome: 'read', status, finalUrl, renderer: 'pdftotext', etag, lastModified, kind: 'pdf', body: text };
  }
  if (!/html|text\/plain|text\/calendar|xml/i.test(type) && type) return { outcome: 'unsupported', status, finalUrl, note: type.split(';')[0] };

  let body = decode(bytes, type);
  if (isIcs(type, body)) return { outcome: 'read', status, finalUrl, renderer, etag, lastModified, kind: 'ics', body };

  // Almost no text, or a script shell: let Edge build the page.
  if (source.access === 'browser' || textLength(body) < BROWSER_BELOW_CHARS || /enable javascript|javascript aktivieren|activer javascript/i.test(body.slice(0, 20000))) {
    try {
      const r = await rendered(finalUrl ?? url);
      body = r.html;
      finalUrl = r.finalUrl;
      renderer = 'edge';
    } catch (error) {
      note = `browser failed: ${String(error.message ?? error).slice(0, 80)}`;
    }
  }
  return { outcome: 'read', status, finalUrl, renderer, etag, lastModified, kind: 'html', body, note };
}

/**
 * Run `work` over sources: one at a time per host with a pause between, `lanes` hosts at once.
 * Order is shuffled so no host sees us at the same minute every day.
 */
export async function politely(sources, work, lanes = 5, gap = HOST_GAP_MS) {
  const byHost = new Map();
  for (const s of [...sources].sort(() => Math.random() - 0.5)) {
    const h = hostOf(s.url);
    byHost.set(h, [...(byHost.get(h) ?? []), s]);
  }
  const queues = [...byHost.values()];
  const results = [];
  async function lane() {
    while (queues.length) {
      const queue = queues.shift();
      for (let i = 0; i < queue.length; i++) {
        results.push(await work(queue[i]));
        if (i < queue.length - 1) await sleep(gap[0] + Math.random() * (gap[1] - gap[0]));
      }
    }
  }
  await Promise.all(Array.from({ length: lanes }, lane));
  return results;
}
