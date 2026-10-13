// Second check for the 2026-10 rewrite: no new text may lean on the wording of a page it cites.
//   node intake/descriptions-rewrite-2026-10/check-sources.mjs
// The writers read organiser and tourism pages; swapping the old site's sentences for a
// tourism office's would move the duplicate, not remove it. Each text is compared with the
// visible text of every page in its `sources` (4-word runs, as check.mjs does); over 15% is listed.
import fs from 'node:fs';

const MAX = 0.15;
const dir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const out = new Map();
for (const f of fs.readdirSync(dir).filter((f) => /^out-\d+\.json$/.test(f)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/))))
  for (const o of JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'))) out.set(o.slug, o);

const words = (t) => (t ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\d\s]/gu, ' ').split(/\s+/).filter(Boolean);
const grams = (t, n = 4) => { const w = words(t); const g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(' ')); return g; };
const overlap = (a, B) => { const A = grams(a); if (!A.size) return 0; let n = 0; for (const g of A) if (B.has(g)) n++; return n / A.size; };
const visible = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;|&\w+;/g, ' ');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pages = new Map();
async function page(url) {
  if (pages.has(url)) return pages.get(url);
  let text = null;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (fynda.market text check)' }, signal: AbortSignal.timeout(15000) });
    const type = r.headers.get('content-type') ?? '';
    if (r.ok && type.includes('html')) text = visible(await r.text());
  } catch { /* unreachable: reported below */ }
  pages.set(url, text);
  await sleep(800);
  return text;
}

const flagged = [];
let unreadable = 0;
for (const o of out.values()) {
  for (const url of [...new Set((o.sources ?? []).map((s) => s.url).filter(Boolean))]) {
    const text = await page(url);
    if (text === null) { unreadable++; continue; }
    const B = grams(text);
    for (const [l, t] of Object.entries(o.description ?? {})) {
      const x = overlap(t, B);
      if (x > MAX) flagged.push(`${o.slug} ${l}: ${Math.round(x * 100)}% of its 4-word runs are on ${url}`);
    }
  }
}
console.log(`${out.size} markets · ${pages.size} source pages read · ${unreadable} source links unreadable (PDFs, blocked, gone) · ${flagged.length} texts over ${MAX * 100}%`);
for (const f of flagged) console.log('  -', f);
process.exit(0);
