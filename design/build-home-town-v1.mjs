// Mockup: the home page's "This weekend" led by the visitor's own town, 2026-10-14.
// node design/build-home-town-v1.mjs <live /en/ home.html>  →  design/home-town-v1.html
// The live English home page, its own CSS loaded through <base>. Three phones: today
// (the whole country), a first visit whose town is guessed from the connection
// (Zurich), and a returning visitor who picked Bern before. The markets are the real
// ones for 17–18 Oct within 30 km, read from the live database that day.
import { readFileSync, writeFileSync } from 'node:fs';

const live = readFileSync(process.argv[2], 'utf8');
const ROW = 'data-astro-cid-hdyrtumq';
const LIST = 'data-astro-cid-5qqjv3h6';
const SEC = 'data-astro-cid-w6ymvdtg';

const img = (url, size) => url.replace(/\.webp$/, `-${size}.webp`);
const tag = (kind) => kind === 'kinderflohmarkt'
  ? `<i class="tag" style="--tag:var(--line-kinder)" ${ROW}>Kids</i> ` : '';

function card(m, feature) {
  const pic = feature
    ? `<picture data-astro-cid-rafaj4b3> <source media="(max-width: 899px)" srcset="${img(m.image, '720')}" data-astro-cid-rafaj4b3> <img src="${m.image}" alt width="720" height="720" loading="eager" decoding="async" data-astro-cid-rafaj4b3> </picture>`
    : `<img src="${img(m.image, 'thumb')}" alt width="148" height="148" loading="eager" decoding="async" data-astro-cid-rafaj4b3>`;
  return `<article class="card ${feature ? 'feature' : 'row'}" ${ROW}> <div class="pic" ${ROW}>${pic}</div> <div class="body" ${ROW}> <p class="meta" ${ROW}> ${tag(m.kind)}<span class="day" ${ROW}>${m.day}</span> <span class="hours" ${ROW}>${m.hours}</span> </p> <h3 class="name" ${ROW}> <a href="/en/market/${m.slug}/" ${ROW}>${m.name}</a> </h3> <p class="where after" ${ROW}>${m.where}<span class="km" data-distance ${ROW}>${m.km} km</span></p> </div> </article>`;
}

const list = (markets) => `<div class="mark-new" ${LIST}> <div class="leads gutter" ${LIST}>${markets.slice(0, 2).map((m) => card(m, true)).join(' ')}</div> <div class="gutter" ${LIST}>${markets.slice(2).map((m) => card(m, false)).join(' ')}</div> </div>`;

const sat = 'Sat 17 Oct', sun = 'Sun 18 Oct';
const zurich = [
  { slug: 'flohmarkt-kanzlei-zuerich', name: 'Flohmarkt Kanzlei', where: 'Kanzleiareal (Helvetiaplatz) · Zurich', day: sat, hours: '07:20–16:00', km: '1.7', image: '/images/flohmarkt-kanzlei.webp' },
  { slug: 'rosenhof-markt-zuerich', name: 'Rosenhof-Markt', where: 'Rosenhof · Zurich', day: sat, hours: '10:00–18:00', km: '1.8', image: '/images/rosenhof-markt.webp' },
  { slug: 'flohmarkt-buerkliplatz-zuerich', name: 'Flohmarkt Bürkliplatz', where: 'Stadthausanlage · Zurich', day: sat, hours: '07:00–17:00', km: '2.4', image: '/images/flohmarkt-buerkliplatz-zuerich.webp' },
  { slug: 'kinderflohmarkt-gz-bachwiesen', name: 'Flohmarkt für Kindersachen GZ Bachwiesen', where: 'GZ Bachwiesen · Zurich', day: sun, hours: '10:00–16:00', km: '4', image: '/images/kinderflohmarkt-gz-bachwiesen.webp', kind: 'kinderflohmarkt' },
  { slug: 'flohmarkt-dietikon', name: 'Flohmarkt Dietikon', where: 'Bahnhofplatz / Kirchstrasse · Dietikon', day: sat, hours: '08:00–16:00', km: '10', image: '/images/flohmarkt-dietikon.webp' },
  { slug: 'flohmarkt-theaterplatz-baden', name: 'Flohmarkt Theaterplatz Baden', where: 'Theaterplatz · Baden', day: sat, hours: '09:00–16:00', km: '20', image: '/images/flohmarkt-theaterplatz-baden.webp' },
];
const bern = [
  { slug: 'progr-vintage-flea-market-bern', name: 'PROGR Vintage Flea Market', where: 'PROGR Turnhalle · Bern', day: sat, hours: '10:00–15:00', km: '1', image: '/images/progr-vintage-flea-market.webp' },
  { slug: 'flohmarkt-muensterplatz-bern', name: 'Flohmarkt Münsterplatz', where: 'Münsterplatz · Bern', day: sat, hours: '10:00–16:00', km: '1.2', image: '/images/flohmarkt-muensterplatz.webp' },
  { slug: 'flohmi-am-see-bern', name: 'Flohmi am See Bern', where: 'Werkhof Egelsee · Bern', day: sun, hours: '11:00–16:00', km: '2.4', image: '/images/flohmi-am-see-bern.webp' },
  { slug: 'flohmarkt-biel', name: 'Flohmarkt Biel/Bienne', where: 'Esplanade beim Kongresshaus · Biel/Bienne', day: sat, hours: '07:00–14:00', km: '25', image: '/images/flohmarkt-biel.webp' },
  { slug: 'floh-und-antiquitaetenmarkt-schadaumaerit-thun', name: 'Floh- und Antiquitätenmarkt (Schadaumärit)', where: 'Schadaugärtnerei · Thun', day: sun, hours: '10:00–16:00', km: '27', image: '/images/floh-und-antiquitaetenmarkt-schadaumaerit-thun.webp' },
];

const heading = `<h2 class="gutter" ${SEC}>This weekend</h2> <p class="lede gutter meta" ${SEC}>67 markets, 17 Oct and 18 Oct</p>`;
if (!live.includes(heading)) throw new Error('weekend heading not found');
const firstList = '<div data-weekend="all"';
const button = '>All 67 this weekend</button>';
if (!live.includes(firstList) || !live.includes(button)) throw new Error('weekend list or button not found');

function nearTown(town, count, change, markets) {
  return live
    .replace(heading, `<h2 class="gutter mark-new" ${SEC}>This weekend near ${town}</h2> <p class="lede gutter meta mark-new" ${SEC}>${count} markets within 30 km, 17 and 18 Oct · <a href="#" style="text-decoration:underline">${change}</a></p>`)
    .replace(firstList, list(markets) + firstList)
    .replace(button, '>All 67 this weekend, everywhere</button>');
}

const today = live;
const guessed = nearTown('Zurich', 9, 'Not near Zurich? Change', zurich);
const remembered = nearTown('Bern', 5, 'Change', bern)
  .replace(/(<a class="shortcut"[^>]*?) hidden/, '$1')
  .replace('<b data-shortcut-name></b>', '<b data-shortcut-name>Bern</b>');

function frame(html, scrollTo, hideOld) {
  const doc = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace('<head>', '<head><base href="https://fynda.market/">')
    .replace('</head>', `<style>.cookies{display:none!important}${hideOld ? '[data-weekend]{display:none!important}' : '[data-weekend]:not([data-weekend="all"]){display:none!important}'}.mark-new{outline:2px dashed #ff4a2b;outline-offset:2px;border-radius:6px}</style></head>`)
    .replace('</body>', `<script>addEventListener('load',()=>{let n=0;const go=()=>{const t=[...document.querySelectorAll('h2')].find(h=>h.textContent.startsWith(${JSON.stringify(scrollTo)}));if(t)scrollTo(0,t.getBoundingClientRect().top+scrollY-24);if(++n<80)setTimeout(go,150)};go();document.querySelectorAll('a,button').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))})</script></body>`);
  return `<iframe class="phone" srcdoc="${doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`;
}

const out = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Home by town v1</title>
<style>
  body { margin: 0; padding: 24px 16px 48px; background: #f5f4f2; font: 15px/1.5 system-ui, sans-serif; color: #111110; }
  .wrap { max-width: 1240px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  p.lede { margin: 0 0 8px; color: #6e6c68; max-width: 72ch; }
  .phones { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 20px; }
  .col { flex: 1 1 340px; max-width: 390px; }
  .col h2 { font-size: 14px; margin: 0 0 4px; }
  .col p { font-size: 13px; color: #6e6c68; margin: 0 0 8px; min-height: 3em; }
  .phone { width: 100%; height: 780px; border: 1px solid #e8e6e2; border-radius: 18px; background: #fff; }
</style></head><body><div class="wrap">
<h1>Home page: this weekend near your town</h1>
<p class="lede">The live English home page, scrolled to <i>This weekend</i>. Today everyone sees six markets from all over Switzerland and Germany. The change: the six closest to the visitor's town, nearest first, each with its distance. New things are outlined.</p>
<p class="lede">Which town: the one they picked before, if any. Otherwise a guess from their internet connection, which is sometimes wrong, so the line says <i>Not near Zurich? Change</i>. <i>Change</i> jumps to the town search above. With no guess at all, the page stays as it is today. Nothing is asked and nothing is stored about the visitor.</p>
<div class="phones">
  <div class="col"><h2>1 · Today, for everyone</h2><p>Geneva, Hamburg, Cologne, Lausanne, Berlin, Munich.</p>${frame(today, 'This weekend', false)}</div>
  <div class="col"><h2>2 · First visit, town guessed: Zurich</h2><p>The six nearest of the nine within 30 km.</p>${frame(guessed, 'This weekend near', true)}</div>
  <div class="col"><h2>3 · Came back, picked Bern before</h2><p>The black <i>Your town</i> card is already live today.</p>${frame(remembered, 'This weekend near', true)}</div>
</div></div></body></html>`;
writeFileSync(new URL('./home-town-v1.html', import.meta.url), out);
console.log('design/home-town-v1.html');
