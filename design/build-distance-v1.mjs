// Mockup: distance on cards, 2026-09-26.
// node design/build-distance-v1.mjs <markets.json>  →  design/distance-v1.html
// Reads the live-data build in dist/ (run `npm run deploy -- --build-only`
// first) and fills the distance pill every card already has, as if the visitor
// had picked Zurich. markets.json: slug → lat/lng, scraped from the Near me
// page. Styles are inlined from dist so the file stands alone.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const coords = Object.fromEntries(JSON.parse(readFileSync(process.argv[2], 'utf8')).map((m) => [m.slug, m]));
const ZURICH = { lat: 47.3769, lng: 8.5417 };
const MAX = 50;

const km = (a, b) => {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const label = (d) => (d < 1 ? `${d.toFixed(1)} km` : `${Math.round(d)} km`);

function page(path, { edit = (h) => h, scrollTo = null, height = 780 } = {}) {
  let h = readFileSync(join(dist, path, 'index.html'), 'utf8');
  // Inline the stylesheets, so the mockup does not depend on a running preview.
  h = h.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => `<style>${readFileSync(join(dist, href), 'utf8')}</style>`);
  h = h.replace(/<script[\s\S]*?<\/script>/g, '');
  // Every card: the pill, when the market is within 50 km of Zurich.
  h = h.replace(/(<article class="card[^"]*"[^>]*>)([\s\S]*?)(<\/article>)/g, (whole, open, body, close) => {
    const slug = body.match(/\/(?:market|markt)\/([^/]+)\//)?.[1];
    const c = slug && coords[slug];
    if (!c || /<span class="km"[^>]*>[^<]+<\/span>/.test(body)) return whole;
    const d = km(ZURICH, c);
    if (d > MAX) return whole;
    return open + body.replace(/<span class="km" data-distance hidden([^>]*)><\/span>/, `<span class="km"$1>${label(d)}</span>`) + close;
  });
  // The header pill: the town the visitor picked.
  h = h.replace(/<a class="pill" href="\/" data-place-pill hidden([^>]*)> <span data-place-name([^>]*)><\/span>/, '<a class="pill" href="/"$1> <span data-place-name$2>Zurich</span>');
  h = edit(h)
    .replace('<head>', '<head><base href="https://fynda.market/">')
    .replace('</head>', '<style>.cookies{display:none!important}</style></head>')
    .replace('</body>', `<script>addEventListener('load',()=>{${scrollTo ? `const t=document.querySelector(${JSON.stringify(scrollTo)});if(t)scrollTo(0,t.getBoundingClientRect().top+scrollY-12);` : ''}document.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))})</script></body>`);
  return `<iframe class="phone" style="height:${height}px" srcdoc="${h.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`;
}

// The market page: the empty slot in the decision strip, filled.
const winterthur = coords['flohmarkt-winterthur-altstadt'];
const strip = (h) => h.replace(/<li data-distance hidden([^>]*)><b data-distance-value([^>]*)><\/b><span data-distance-label([^>]*)><\/span><\/li>/,
  `<li$1><b data-distance-value$2>${label(km(ZURICH, winterthur))}</b><span data-distance-label$3>from Zurich</span></li>`);
// The home page: the visitor is in Switzerland, so the Swiss six lead.
const swiss = (h) => h.replace('<div data-weekend="all"', '<div data-weekend="all" hidden').replace('<div data-weekend="CH" hidden', '<div data-weekend="CH"');

const phones = [
  ['Zurich town page', 'The header shows the town you picked. Every card gets the pill — all 17 Zurich markets are within 8 km — top right, on the date line.', page('en/switzerland/zurich', { height: 1100 })],
  ['Canton of Aargau', 'Only the ones within 50 km of Zurich — Baden, Wohlen, Aarau. Further away: no pill, the card as today.', page('en/switzerland/canton/aargau', { scrollTo: 'main h2', height: 780 })],
  ['Home, This weekend', 'The Swiss six lead (today’s change), and the ones near Zurich carry the pill. Geneva and Lugano do not.', page('en', { edit: swiss, scrollTo: '[data-weekend="CH"]' })],
  ['A market page', 'The empty slot in the fact strip, first: <i>19 km from Zurich</i>. Only within 50 km. (The pills lower down, in <i>Also today, nearby</i>, stay measured from this market.)', page('en/market/flohmarkt-winterthur-altstadt', { edit: strip, scrollTo: '.head' })],
];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Distance on cards — mockup v1</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @font-face { font-family: 'Schibsted Grotesk'; src: url('../public/fonts/schibsted-grotesk-latin.woff2') format('woff2'); font-weight: 400 900; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #DEDCD7; font-family: 'Schibsted Grotesk', system-ui, sans-serif; color: #111110; }
  .intro { max-width: 1100px; margin: 28px auto 0; padding: 0 28px; }
  .intro h1 { font-size: 26px; margin: 0 0 6px; letter-spacing: -.02em; }
  .intro p { margin: 0 0 6px; color: #3F3D3A; font-size: 15px; line-height: 1.5; max-width: 820px; }
  .stage { display: flex; gap: 26px; padding: 24px 28px 40px; align-items: flex-start; overflow-x: auto; }
  .col { flex: 0 0 375px; }
  .cap { font-size: 13px; color: #3F3D3A; margin: 0 0 10px; line-height: 1.45; min-height: 78px; }
  .cap b { color: #111110; font-size: 15px; display: block; margin-bottom: 3px; }
  .phone { display: block; width: 375px; border: 0; background: #fff; border-radius: 22px; box-shadow: 0 10px 40px rgba(0,0,0,.14); }
</style></head><body>
<div class="intro">
  <h1>Distance on cards — mockup v1</h1>
  <p>Not a new section: the black pill every card already has, filled in. This is what a visitor sees after picking <b>Zurich</b> in the town search (the pill in the header says so). Straight-line distance, only up to <b>50 km</b>; beyond that the card stays as it is. Someone who never picked a town sees today's site, unchanged. Real markets, real distances.</p>
</div>
<div class="stage">
  ${phones.map(([t, c, p]) => `<div class="col"><div class="cap"><b>${t}</b>${c}</div>${p}</div>`).join('\n  ')}
</div>
</body></html>`;
writeFileSync(new URL('./distance-v1.html', import.meta.url), html);
console.log('wrote design/distance-v1.html', (html.length / 1024).toFixed(0), 'KB');
