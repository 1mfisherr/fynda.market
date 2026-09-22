// Mockup: the remembered place and the front-door map, 2026-09-22.
// node design/build-front-door.mjs <ch-points.json>  →  design/front-door.html
// Swiss dots are the 222 live markets; German dots are illustrative.
import { readFileSync, writeFileSync } from 'node:fs';

const ch = JSON.parse(readFileSync(process.argv[2], 'utf8'));

/* Illustrative German clusters — where demand is, not data we have. */
let seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const cities = [[52.52, 13.4, 22], [53.55, 10.0, 12], [48.14, 11.58, 16], [50.94, 6.96, 14], [51.23, 6.78, 8], [50.11, 8.68, 10], [48.78, 9.18, 10], [51.34, 12.37, 7], [51.05, 13.74, 6], [49.45, 11.08, 6], [52.37, 9.73, 6], [53.08, 8.8, 4], [47.99, 7.85, 5], [51.96, 7.63, 5], [49.01, 8.4, 5], [50.73, 7.1, 4], [51.51, 7.47, 6], [52.27, 10.52, 3], [49.48, 8.47, 4]];
const de = [];
for (const [lat, lng, n] of cities) for (let i = 0; i < n; i++) de.push([lat + (rnd() - 0.5) * 0.9, lng + (rnd() - 0.5) * 1.3]);

/* Projection: plain degrees, longitude squeezed by cos(50°). */
const LAT0 = 55.2, LAT1 = 45.6, LNG0 = 5.6, LNG1 = 15.3, COS = 0.643;
const W = 320, H = Math.round(W * ((LAT0 - LAT1) / ((LNG1 - LNG0) * COS)));
const X = (lng) => ((lng - LNG0) / (LNG1 - LNG0)) * W;
const Y = (lat) => ((LAT0 - lat) / (LAT0 - LAT1)) * H;
const poly = (pts) => pts.map(([lng, lat]) => `${X(lng).toFixed(1)},${Y(lat).toFixed(1)}`).join(' ');

const CH = [[5.96, 46.13], [6.8, 46.42], [6.12, 46.9], [6.9, 47.4], [7.6, 47.58], [8.6, 47.8], [9.6, 47.55], [10.5, 46.9], [10.1, 46.25], [9.05, 45.82], [8.45, 46.25], [7.05, 45.9]];
const DE = [[6.0, 51.8], [7.2, 53.3], [8.6, 53.9], [10.0, 54.6], [11.0, 54.4], [14.2, 53.9], [14.8, 51.0], [12.1, 50.3], [13.8, 48.7], [12.7, 47.7], [10.4, 47.5], [7.6, 47.6], [8.2, 48.9], [6.4, 49.5], [6.0, 51.0]];

const dots = (pts, cls) => pts.map(([lat, lng]) => `<circle class="${cls}" cx="${X(lng).toFixed(1)}" cy="${Y(lat).toFixed(1)}" r="2.2"/>`).join('');

const map = `
<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Where fynda.market has markets">
  <polygon class="land" points="${poly(DE)}"/>
  <polygon class="land" points="${poly(CH)}"/>
  <g>${dots(de, 'dot soon')}</g>
  <g>${dots(ch, 'dot')}</g>
  <text class="lbl" x="${X(9.6).toFixed(0)}" y="${Y(51.9).toFixed(0)}">Germany</text>
  <text class="cnt" x="${X(9.6).toFixed(0)}" y="${(Y(51.9) + 14).toFixed(0)}">150 markets · from November</text>
  <text class="lbl" x="${X(8.2).toFixed(0)}" y="${(Y(45.75)).toFixed(0)}">Switzerland</text>
  <text class="cnt" x="${X(8.2).toFixed(0)}" y="${(Y(45.75) + 14).toFixed(0)}">222 markets · 14 this weekend</text>
</svg>`;

const row = (name, town, day, badge = '') => `
  <li class="row">
    <div><div class="n">${name}</div><div class="m">${town}${badge ? ` · <span class="ok">${badge}</span>` : ''}</div></div>
    <div class="d">${day}</div>
  </li>`;

const header = (pill, open = false) => `
  <header class="bar">
    <span class="wm">f<span class="y">y</span>nda.market</span>
    <button class="pill${open ? ' open' : ''}" aria-expanded="${open}">${pill}</button>
  </header>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Front door — mockup</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @font-face { font-family: 'Schibsted Grotesk'; src: url('../public/fonts/schibsted-grotesk-latin.woff2') format('woff2'); font-weight: 400 800; }
  :root { --ink: #111110; --paper: #fff; --muted: #6E6C68; --hint: #75706A; --line: #E8E6E2; --soft: #F5F4F2; --accent: #FF4A2B; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #DEDCD7; font-family: 'Schibsted Grotesk', system-ui, sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }
  .stage { display: flex; gap: 28px; padding: 36px 28px; align-items: flex-start; overflow-x: auto; }
  .col { flex: 0 0 375px; }
  .cap { font-size: 13px; color: #3F3D3A; margin: 0 0 10px; line-height: 1.45; }
  .cap b { color: var(--ink); }
  .phone { width: 375px; min-height: 780px; background: var(--paper); border-radius: 22px; box-shadow: 0 10px 40px rgba(0,0,0,.14); overflow: hidden; }
  .bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 14px; border-bottom: 1px solid var(--line); }
  .wm { font-weight: 800; font-size: 19px; letter-spacing: -0.02em; }
  .wm .y { color: var(--accent); }
  .pill { font: inherit; font-weight: 600; font-size: 14px; color: var(--ink); background: var(--paper); border: 1px solid var(--ink); border-radius: 999px; padding: 7px 12px; cursor: pointer; }
  .pill.open { background: var(--ink); color: #fff; }
  .pill::after { content: ' ▾'; font-size: 11px; }
  .pad { padding: 20px 16px; }
  h1 { font-size: 28px; line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 6px; font-weight: 700; }
  .lede { color: var(--muted); font-size: 16px; margin: 0 0 18px; line-height: 1.4; }
  .in { display: block; width: 100%; padding: 14px 16px; border: 1px solid var(--ink); border-radius: 6px; font: inherit; font-size: 16px; color: var(--hint); background: var(--paper); text-align: left; }
  .btn { display: block; width: 100%; margin-top: 10px; padding: 14px 16px; border-radius: 6px; font: inherit; font-weight: 600; font-size: 16px; background: var(--ink); color: #fff; border: 1px solid var(--ink); }
  .btn.ghost { background: var(--paper); color: var(--ink); }
  .maptitle { display: flex; justify-content: space-between; align-items: baseline; margin: 26px 0 8px; }
  .maptitle h2 { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--hint); font-weight: 500; margin: 0; }
  .maptitle span { font-size: 13px; color: var(--hint); }
  .mapbox { background: var(--soft); border-radius: 8px; padding: 6px; }
  .land { fill: #fff; stroke: #C9C6C0; stroke-width: 1; }
  .dot { fill: var(--accent); }
  .dot.soon { fill: #C9C6C0; }
  .lbl { font-size: 12px; font-weight: 700; fill: var(--ink); }
  .cnt { font-size: 10px; fill: var(--muted); }
  .foot { color: var(--hint); font-size: 13px; margin: 18px 0 0; line-height: 1.5; }
  .foot a { color: var(--ink); text-decoration: underline; }
  h2.sec { font-size: 20px; letter-spacing: -0.015em; margin: 0 0 4px; }
  .sub { color: var(--muted); font-size: 14px; margin: 0 0 8px; }
  ul.list { list-style: none; margin: 0; padding: 0; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--line); }
  .row .n { font-weight: 600; font-size: 16px; }
  .row .m { color: var(--muted); font-size: 13px; margin-top: 2px; }
  .row .d { color: var(--accent); font-weight: 700; font-size: 14px; white-space: nowrap; }
  .ok { color: var(--muted); }
  .more { display: block; margin: 14px 0 26px; font-weight: 600; color: var(--ink); text-decoration: underline; font-size: 15px; }
  .sheet { border-top: 1px solid var(--line); background: var(--paper); padding: 20px 16px 24px; }
  .sheet .now { font-size: 13px; color: var(--hint); letter-spacing: .08em; text-transform: uppercase; margin: 0 0 6px; }
  .sheet .cur { font-size: 22px; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.015em; }
  .sug { list-style: none; margin: 10px 0 0; padding: 0; }
  .sug li { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 16px; }
  .sug li span { color: var(--muted); font-size: 14px; }
  .dim { opacity: .35; pointer-events: none; }
  .ctry { display: flex; justify-content: space-between; align-items: baseline; margin: 28px 0 6px; border-bottom: 1px solid var(--ink); padding-bottom: 8px; }
  .ctry h2 { font-size: 18px; margin: 0; letter-spacing: -0.015em; }
  .ctry span { font-size: 13px; color: var(--muted); }
  .towns { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; column-gap: 16px; }
  .towns a { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid var(--line); color: var(--ink); text-decoration: none; font-size: 16px; }
  .towns a span { color: var(--muted); font-size: 14px; }
  .towns.soon a { color: var(--hint); }
  .all { display: block; margin: 12px 0 0; font-weight: 600; color: var(--ink); font-size: 15px; }
  .or { text-align: center; color: var(--hint); font-size: 13px; margin: 22px 0 10px; }
  .tile { display: block; padding: 16px; border: 1px solid var(--ink); border-radius: 6px; margin-top: 10px; color: var(--ink); text-decoration: none; }
  .tile b { display: block; font-size: 18px; letter-spacing: -0.015em; }
  .tile span { display: block; color: var(--muted); font-size: 14px; margin-top: 3px; }
</style></head>
<body>
<div class="stage">

<div class="col">
  <p class="cap"><b>1A · The front door — towns, under a country heading.</b> People think in towns, so the browse path is towns. The country is a heading with a count, never a control. Grows to a third country by adding a heading.</p>
  <div class="phone">
    ${header('Where are you?')}
    <div class="pad">
      <h1>The next flea market near you.</h1>
      <p class="lede">Dates checked, cancellations shown. Say where you are and we'll keep it.</p>
      <button class="in">Town or postcode…</button>
      <button class="btn">Use my location</button>
      <div class="ctry"><h2>Switzerland</h2><span>222 markets · 14 this weekend</span></div>
      <ul class="towns">
        <li><a href="#"><b>Zürich</b><span>29</span></a></li><li><a href="#"><b>Bern</b><span>17</span></a></li><li><a href="#"><b>Basel</b><span>14</span></a></li><li><a href="#"><b>Genève</b><span>11</span></a></li><li><a href="#"><b>Lausanne</b><span>9</span></a></li><li><a href="#"><b>Luzern</b><span>8</span></a></li><li><a href="#"><b>Winterthur</b><span>6</span></a></li><li><a href="#"><b>St. Gallen</b><span>5</span></a></li>
      </ul>
      <a class="all" href="#">All 105 towns and 23 cantons →</a>
      <div class="ctry"><h2>Germany</h2><span>from November</span></div>
      <ul class="towns soon">
        <li><a href="#"><b>Berlin</b><span></span></a></li><li><a href="#"><b>München</b><span></span></a></li><li><a href="#"><b>Hamburg</b><span></span></a></li><li><a href="#"><b>Köln</b><span></span></a></li>
      </ul>
    </div>
  </div>
</div>

<div class="col">
  <p class="cap"><b>1B · The front door — one question, two answers.</b> The plainest version. The country tiles are the choice you asked for; each is the country page. Honest at two or three countries, a menu at eight.</p>
  <div class="phone">
    ${header('Where are you?')}
    <div class="pad">
      <h1>The next flea market near you.</h1>
      <p class="lede">Dates checked, cancellations shown. Say where you are and we'll keep it.</p>
      <button class="in">Town or postcode…</button>
      <button class="btn">Use my location</button>
      <p class="or">or browse a country</p>
      <a class="tile" href="#"><b>Switzerland</b><span>222 markets · 105 towns · 14 this weekend</span></a>
      <a class="tile" href="#"><b>Germany</b><span>150 markets · from November</span></a>
      <h2 class="sec" style="margin-top:30px">This weekend</h2>
      <p class="sub">Everywhere we are</p>
      <ul class="list">
        ${row('Flohmarkt Kanzlei', 'Zürich', 'Sat', 'Confirmed by the organiser')}
        ${row('Brocante de Plainpalais', 'Genève', 'Sat')}
        ${row('Flohmarkt Petersplatz', 'Basel', 'Sat')}
      </ul>
    </div>
  </div>
</div>

<div class="col">
  <p class="cap"><b>2 · Every visit after.</b> The place is remembered. The country never appears — Zürich is Zürich. This is the home page, and Near me, and what the newsletter is about.</p>
  <div class="phone">
    ${header('Zürich')}
    <div class="pad">
      <h2 class="sec">This weekend near Zürich</h2>
      <p class="sub">Saturday 26 and Sunday 27 September</p>
      <ul class="list">
        ${row('Flohmarkt Kanzlei', 'Zürich · 2 km', 'Sat', 'Confirmed by the organiser')}
        ${row('Flohmarkt Bürkliplatz', 'Zürich · 1 km', 'Sat')}
        ${row('Flohmi Helvetiaplatz', 'Zürich · 2 km', 'Sun')}
        ${row('Flohmarkt Rathausplatz', 'Wettingen · 22 km', 'Sat', 'Confirmed by the organiser')}
      </ul>
      <a class="more" href="#">All 31 within 25 km →</a>
      <h2 class="sec">Later this autumn</h2>
      <p class="sub">Worth the drive</p>
      <ul class="list">
        ${row('Brocante de Carouge', 'Carouge · 224 km', '4 Oct')}
        ${row('Nachtflohmarkt Markthalle', 'Basel · 75 km', '10 Oct')}
      </ul>
    </div>
  </div>
</div>

<div class="col">
  <p class="cap"><b>3 · Changing place — and country.</b> Tap the pill. Type any town we cover. "München" moves you to Germany; nobody has to say the word.</p>
  <div class="phone">
    ${header('Zürich', true)}
    <div class="sheet">
      <p class="now">Your place</p>
      <p class="cur">Zürich, Switzerland</p>
      <button class="in" style="color:var(--ink)">Münch<span style="color:var(--hint)">en</span></button>
      <ul class="sug">
        <li><b>München</b><span>Bayern, Germany · 34 markets</span></li>
        <li>Münchenstein<span>Basel-Landschaft, Switzerland · 2</span></li>
        <li>Münchenbuchsee<span>Bern, Switzerland · 1</span></li>
      </ul>
      <button class="btn ghost">Use my location instead</button>
      <p class="foot">We keep this on your device only. Change it whenever you travel.</p>
    </div>
    <div class="pad dim">
      <h2 class="sec">This weekend near Zürich</h2>
      <ul class="list">
        ${row('Flohmarkt Kanzlei', 'Zürich · 2 km', 'Sat')}
        ${row('Flohmarkt Bürkliplatz', 'Zürich · 1 km', 'Sat')}
      </ul>
    </div>
  </div>
</div>

</div>
</body></html>`;

writeFileSync('design/front-door.html', html);
console.log('design/front-door.html', ch.length, 'Swiss dots,', de.length, 'illustrative German dots, map', W, 'x', H);
