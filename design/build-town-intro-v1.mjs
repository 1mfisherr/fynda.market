// Mockup: a written paragraph on a big town's page, 2026-10-13.
// node design/build-town-intro-v1.mjs <live zurich.html>  →  design/town-intro-v1.html
// The live page fetched from fynda.market/en/switzerland/zurich/, its own CSS loaded
// through <base>; the only new markup is the paragraph, outlined. Every fact in it is
// read from the live database that day (stalls, seasons, venues, tags).
import { readFileSync, writeFileSync } from 'node:fs';

const live = readFileSync(process.argv[2], 'utf8');
const CID = 'data-astro-cid-w6ymvdtg';

const intro = `
<section class="section mark-new" ${CID}>
  <h2 class="gutter" ${CID}>Zurich's flea markets</h2>
  <div class="body gutter prose" ${CID}>
    <p>Two markets run every week. Kanzlei, at Helvetiaplatz, goes on all year with around 300 stalls; Bürkliplatz, by the lake, joins it from May to October and is the one for antiques. Rosenhof in the old town adds a third from March to November.</p>
    <p>Around them, the community centres hold their own markets a few times a year, many of them for children's things. Indoors there are fairs too: comics and records at the Volkshaus, clothes at Tanzwerk 101, gear for musicians at the Kronensaal.</p>
  </div>
</section>`;

const anchor = `<section class="section" ${CID}> <h2 class="gutter" ${CID}>Towns nearby`;
if (!live.includes(anchor)) throw new Error('Towns nearby section not found');

function frame(html, scrollTo) {
  const doc = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace('<head>', '<head><base href="https://fynda.market/">')
    .replace('</head>', `<style>.cookies{display:none!important}.mark-new{outline:2px dashed #ff4a2b;outline-offset:-4px;border-radius:6px}</style></head>`)
    .replace('</body>', `<script>addEventListener('load',()=>{${scrollTo ? `let n=0;const go=()=>{const t=document.querySelector(${JSON.stringify(scrollTo)});if(t)scrollTo(0,t.getBoundingClientRect().top+scrollY-40);if(++n<80)setTimeout(go,150)};go();` : ''}document.querySelectorAll('a,button').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))})</script></body>`);
  return `<iframe class="phone" srcdoc="${doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`;
}

const page = live.replace(anchor, intro + anchor);
const out = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Town intro v1</title>
<style>
  body { margin: 0; padding: 24px 16px 48px; background: #f5f4f2; font: 15px/1.5 system-ui, sans-serif; color: #111110; }
  .wrap { max-width: 900px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  p.lede { margin: 0 0 20px; color: #6e6c68; max-width: 66ch; }
  .phones { display: flex; gap: 24px; flex-wrap: wrap; }
  .col { flex: 1 1 340px; max-width: 390px; }
  .col h2 { font-size: 14px; margin: 0 0 8px; }
  .phone { width: 100%; height: 780px; border: 1px solid #e8e6e2; border-radius: 18px; background: #fff; }
</style></head><body><div class="wrap">
<h1>A written paragraph for big towns: Zurich</h1>
<p class="lede">The live English Zurich page. The only new thing is the outlined paragraph, under the markets and above <i>Towns nearby</i>, so the list still comes first on a phone. Only for towns with four or more markets (about 15), each written by hand from that town's own markets. Never a template, so no two towns share a sentence.</p>
<div class="phones">
  <div class="col"><h2>Top of the page (unchanged)</h2>${frame(page, null)}</div>
  <div class="col"><h2>Further down: the new paragraph</h2>${frame(page, '.mark-new')}</div>
</div></div></body></html>`;
writeFileSync(new URL('./town-intro-v1.html', import.meta.url), out);
console.log('design/town-intro-v1.html');
