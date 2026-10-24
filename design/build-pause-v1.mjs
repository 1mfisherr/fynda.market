// Mockup: why a market pauses, on Petersplatz's real built page (Herbstmesse, 24 Oct 2026).
// Needs a build in dist/ first. Run: node design/build-pause-v1.mjs → design/pause-v1.html
import { readFileSync, writeFileSync } from 'node:fs';

const page = readFileSync('dist/en/market/flohmarkt-petersplatz-basel/index.html', 'utf8')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/(["(\s])\/(?!\/)/g, '$1https://fynda.market/');

const clock = /(<p class="clock"[^>]*>[^<]*<\/p>)/;
if (!clock.test(page)) throw new Error('hours line not found');
const style = '<style>.pause{margin-block-start:6px;color:var(--color-grey);font-size:15px;line-height:1.4;max-width:30ch}</style></head>';
const variant = (line) => page.replace('</head>', style).replace(clock, `$1<p class="pause">${line}</p>`);

const phones = [
  ['Now', 'The page today.', page],
  ['A', 'Says what is happening on the square.', variant("No market while the Herbstmesse, Basel's autumn fair, has the square.")],
  ['B', 'Shorter, plain.', variant("Paused for the Herbstmesse, Basel's autumn fair.")],
  ['C', 'The square, not the market.', variant('Until then the square belongs to the Herbstmesse.')],
];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

writeFileSync('design/pause-v1.html', `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pause line v1</title>
<style>body{margin:0;padding:24px 16px 60px;background:#2A2926;color:#fff;font:15px/1.5 "Schibsted Grotesk","Helvetica Neue",Arial,sans-serif}
h1{font-size:22px;margin:0 0 6px}p.lead{color:#B5B1A8;max-width:720px;margin:0 0 22px}
.row{display:flex;gap:22px;flex-wrap:wrap}.ph{width:375px}.ph b{font-size:16px}.ph span{color:#B5B1A8;font-size:13px;margin-left:6px}
iframe{display:block;width:375px;height:760px;border:6px solid #000;border-radius:26px;background:#fff;margin-top:8px}</style>
<h1>Why a market pauses: Flohmarkt Petersplatz, Basel</h1>
<p class="lead">Petersplatz runs every Saturday, but the Herbstmesse takes the square from mid-October, so its next date is 21 November. Today the page jumps to 21 Nov with no word why. One grey line under the hours, shown only while a break we know the reason for is on. Three wordings to pick from.</p>
<div class="row">${phones.map(([k, note, html]) => `<div class="ph"><b>${k}</b><span>${note}</span><iframe srcdoc="${esc(html)}"></iframe></div>`).join('')}</div>`);
console.log('design/pause-v1.html');
