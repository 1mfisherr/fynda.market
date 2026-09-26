// Mockup: the market page, 2026-09-26 — nearby that day, the clock line, share.
// node design/build-market-v1.mjs <dir with live pages>  →  design/market-v1.html
// The dir holds buerkli.html, mauer.html, nearby.html, zurich.html fetched from
// fynda.market. Each phone is the live page with its own CSS (loaded from
// fynda.market through <base>), edited; nothing here is invented markup except
// the new blocks. Markets, distances and times are real.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const read = (f) => readFileSync(join(dir, f), 'utf8');
const buerkli = read('buerkli.html'), mauer = read('mauer.html'), nearby = read('nearby.html'), zurich = read('zurich.html');
const styleOf = (h) => [...h.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const extraCss = styleOf(nearby) + '\n' + styleOf(zurich);

const MARKET = 'data-astro-cid-dtl3z72q', SECTION = 'data-astro-cid-w6ymvdtg';

/* The new bits, styled with the site's own tokens. */
const newCss = `
  .cookies { display: none !important; }
  .keep.two { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
  .card .state { color: var(--color-accent-text); font-weight: var(--weight-bold); }
  .card .km:not([hidden]) { font-weight: var(--weight-bold); }
  .card.over { opacity: .45; }
  .card.over .state { color: var(--color-quiet); }
  .next-line { margin: var(--space-1) 0 0; font-weight: var(--weight-bold); }
  .next-line a { color: inherit; }
  .nearby-list { display: grid; gap: var(--space-3); }
  .nearby-note { margin: var(--space-2) 0 0; color: var(--color-grey); font-size: var(--text-small); }
  .word strong.over[data-astro-cid-dtl3z72q] { color: var(--color-ink); }
  .mark-new { outline: 2px dashed #ff4a2b; outline-offset: 6px; border-radius: 6px; }
`;

function frame(html, { scrollTo = null, height = 780 } = {}) {
  let doc = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace('<head>', `<head><base href="https://fynda.market/">`)
    .replace('</head>', `<style>${extraCss}</style><style>${newCss}</style></head>`)
    .replace('</body>', `<script>addEventListener('load',()=>{${scrollTo ? `const t=document.querySelector(${JSON.stringify(scrollTo)});if(t)scrollTo(0,t.getBoundingClientRect().top+scrollY-12);` : ''}document.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))})</script></body>`);
  const esc = doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<iframe class="phone" style="height:${height}px" srcdoc="${esc}"></iframe>`;
}

/* A card from the Near me page, the component every list uses, with the
   distance shown and one state line when there is an exception to say. */
function card(slug, { km, state = '', over = false, hours = null, day = null } = {}) {
  const re = new RegExp(`<article class="card row"[^>]*>(?:(?!</article>)[\\s\\S])*?/market/${slug}/[\\s\\S]*?</article>`);
  let c = nearby.match(re)?.[0];
  if (!c) throw new Error('no card ' + slug);
  c = c.replace(/<span class="km" data-distance hidden([^>]*)><\/span>/, `<span class="km"$1>${km}</span>`);
  if (hours) c = c.replace(/(<span class="hours"[^>]*>)[^<]*(<\/span>)/, `$1${hours}$2`);
  if (day) c = c.replace(/(<span class="day"[^>]*>)[^<]*(<\/span>)/, `$1${day}$2`);
  if (state) c = c.replace(/(<p class="rhythm")/, `<p class="state" data-astro-cid-hdyrtumq>${state}</p>$1`);
  if (over) c = c.replace('class="card row"', 'class="card row over"');
  return c;
}

function nearbySection(title, cards, note = '') {
  return `<section id="nearby" class="section sub mark-new" ${SECTION}>
    <h2 class="gutter" data-level="sub" ${SECTION}>${title}</h2>
    <div class="body" ${SECTION}><div class="gutter nearby-list">${cards.join('')}</div>${note ? `<p class="gutter nearby-note">${note}</p>` : ''}</div>
  </section>`;
}

const SHARE_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v7h14v-7"/></svg>`;
const withShare = (h) => h.replace(/<div class="keep gutter"([^>]*)>([\s\S]*?)<\/div>/, (_, a, inner) =>
  `<div class="keep gutter two"${a}>${inner.replace('Add to calendar', 'Calendar')}<a href="#" class="button mark-new" data-variant="secondary" data-block ${MARKET}="true">${SHARE_ICON}Share</a></div>`);

/* The hero status: the word, the live line, the clock. */
const status = (h, { word, wordClass = '', live = '', clock, next = '' }) => h.replace(/<div class="status"[\s\S]*?<\/div>/, `<div class="status mark-new" ${MARKET}>
  <p class="word" ${MARKET}><strong class="${wordClass}" ${MARKET}>${word}</strong>${live ? ` <span class="live" ${MARKET}><i ${MARKET}></i><b ${MARKET}>${live}</b></span>` : ''}</p>
  <p class="clock" ${MARKET}>${clock}</p>${next ? `<p class="next-line" ${MARKET}>${next}</p>` : ''}</div>`);

const afterActions = (h, section) => h.replace(/(<div class="detail")/, `${section}$1`);

/* ---------- the phones ---------- */

// 1. Now, 17:24: closed at 17:00, still shouts Today.
const p1 = frame(buerkli);

// 2. Proposed, 17:24: over for today, and the two still open close by.
const p2 = frame(afterActions(withShare(status(buerkli, {
  word: 'Over for today', wordClass: 'over',
  clock: '<span style="color:var(--color-grey);font-weight:400">It ran 07:00–17:00</span>',
  next: 'Next: Sat 3 Oct, 07:00–17:00',
})), nearbySection('Still open nearby', [
  card('rosenhof-markt-zuerich', { km: '0.7 km', state: 'Closes in 36 min' }),
  card('kreisflohmi-zuerich', { km: '1.8 km', state: 'Closes in 36 min' }),
])), { scrollTo: '.head' });

// 3. Proposed, 10:40: open, and the rest of today close by, scrolled to the block.
const p3 = frame(afterActions(withShare(status(buerkli, {
  word: 'Today', live: 'Open now', clock: '07:00–17:00',
})), nearbySection('Also today, nearby', [
  card('rosenhof-markt-zuerich', { km: '0.7 km' }),
  card('flohmarkt-kanzlei-zuerich', { km: '1.5 km' }),
  card('kreisflohmi-zuerich', { km: '1.8 km', state: 'Opens at 11:00' }),
], 'Straight-line distance.')), { scrollTo: '.actions' });

// 4. Berlin, seen on Friday: nearby that Sunday.
const p4 = frame(afterActions(withShare(status(mauer, { word: 'Sun 27 Sep', clock: '10:00–18:00' }).replace(' mark-new', '')), nearbySection('Also on Sun 27 Sep, nearby', [
  card('flohmarkt-am-arkonaplatz-berlin', { km: '0.4 km' }),
  card('flohmarkt-am-rathaus-schoeneberg-berlin', { km: '7.4 km', hours: '08:00–16:00', day: 'Sun 27' }),
], 'Straight-line distance.')), { scrollTo: '.actions' });

// 5. The top of the page through one day (Mauerpark, Sun 27 Sep, 10:00–18:00).
const states = [
  ['Friday', { word: 'Sun 27 Sep', clock: '10:00–18:00' }, 'Unchanged — the times already answer it.'],
  ['09:20', { word: 'Today', live: 'Opens in 40 min', clock: '10:00–18:00' }, 'New: before it opens.'],
  ['13:00', { word: 'Today', live: 'Open now', clock: '10:00–18:00' }, 'As today, minus the rounded hours.'],
  ['16:50', { word: 'Today', live: 'Closes in 1 h 10 min', clock: '10:00–18:00' }, 'New: minutes, in the last two hours.'],
  ['18:30', { word: 'Over for today', wordClass: 'over', clock: '<span style="color:var(--color-grey);font-weight:400">It ran 10:00–18:00</span>', next: 'Next: Sun 4 Oct, 10:00–18:00' }, 'New: today it still says Today in red.'],
];
const heroOnly = (s) => {
  const m = status(mauer, s).match(/<div class="status[\s\S]*?<\/div>/)[0];
  return mauer.replace(/<main[\s\S]*<\/main>/, `<main class="stack wrapper"><div class="market" style="padding:4px 0"><div class="head gutter" ${MARKET}>${m.replace(' mark-new', '')}</div></div></main>`)
    .replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/, '');
};
const p5 = `<div class="states">${states.map(([t, s, note]) => `<div class="st"><p class="t"><b>${t}</b> ${note}</p>${frame(heroOnly(s), { height: s.next ? 150 : 118 })}</div>`).join('')}</div>`;

// 6. Zurich, Today filter at 16:20: the list says which are still worth the trip.
const zStates = {
  'flohmarkt-buerkliplatz-zuerich': ['Closes in 40 min'],
  'flosch-schwamendingen-zuerich': ['Closes in 40 min'],
  'rosenhof-markt-zuerich': [''],
  'kreisflohmi-zuerich': [''],
  'flohmarkt-kanzlei-zuerich': ['Over', true],
  'flohmi-bullingerhof-zuerich': ['Over', true],
  'flohmarkt-gz-seebach': ['Over', true],
};
let z = zurich;
const zRows = [];
for (const [slug, [state, over]] of Object.entries(zStates)) {
  const re = new RegExp(`<article class="card[^"]*"[^>]*data-date="2026-09-26"(?:(?!</article>)[\\s\\S])*?/market/${slug}/[\\s\\S]*?</article>`);
  let c = z.match(re)?.[0];
  if (!c) { console.warn('zurich row missing', slug); continue; }
  if (state) c = c.replace(/(<p class="rhythm")/, `<p class="state" data-astro-cid-hdyrtumq>${state}</p>$1`);
  if (over) c = c.replace(/class="card ([^"]*)"/, 'class="card $1 over"');
  zRows.push(c);
}
z = z.replace(/(<main[^>]*>[\s\S]*?<div class="when[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)[\s\S]*<\/main>/, (_, head) => `${head.replace('aria-pressed="true" data-filter="all"', 'aria-pressed="false" data-filter="all"').replace('aria-pressed="false" data-filter="today"', 'aria-pressed="true" data-filter="today"')}<div class="gutter nearby-list mark-new" style="margin-top:16px">${zRows.join('')}</div></main>`);
const p6 = frame(z, { scrollTo: '.when' });

// 7. What a shared link looks like in a chat.
const chat = (img, title, desc, note) => `
  <div class="bubble">
    <div class="lp"><img src="${img}" alt=""><div class="lpt"><b>${title}</b><span>${desc}</span><i>fynda.market</i></div></div>
    <p class="url">https://fynda.market/en/market/flohmarkt-buerkliplatz-zuerich/</p>
    <p class="tm">10:42 ✓✓</p>
  </div><p class="chatnote">${note}</p>`;
const p7 = `<div class="chat">
  <p class="who">Now</p>
  ${chat('https://fynda.market/og-image.png', 'Flohmarkt Bürkliplatz – Zurich – next on 26 Sep 2026', 'Flea market, Zurich. The next one is Flohmarkt Bürkliplatz on Sat 26 Sep, 07:00–17:00…', 'The same fynda.market card for every market.')}
  <p class="who">Proposed</p>
  ${chat('https://fynda.market/images/flohmarkt-buerkliplatz-zuerich-720.webp', 'Flohmarkt Bürkliplatz – Zurich – next on 26 Sep 2026', 'Flea market, Zurich. The next one is Flohmarkt Bürkliplatz on Sat 26 Sep, 07:00–17:00…', 'The market’s own photo. Name and date stay as text under it, so they are never stale.')}
</div>`;

const col = (tag, title, text, body) => `<div class="col"><div class="cap"><span class="tag ${tag}">${tag === 'now' ? 'Live today' : 'Proposed'}</span><b>${title}</b>${text}</div>${body}</div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Market page — mockup v1</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @font-face { font-family: 'Schibsted Grotesk'; src: url('../public/fonts/schibsted-grotesk-latin.woff2') format('woff2'); font-weight: 400 900; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #DEDCD7; font-family: 'Schibsted Grotesk', system-ui, sans-serif; color: #111110; -webkit-font-smoothing: antialiased; }
  .intro { max-width: 1100px; margin: 28px auto 0; padding: 0 28px; }
  .intro h1 { font-size: 26px; margin: 0 0 6px; letter-spacing: -.02em; }
  .intro p { margin: 0 0 6px; color: #3F3D3A; font-size: 15px; line-height: 1.5; max-width: 820px; }
  .stage { display: flex; gap: 26px; padding: 24px 28px 40px; align-items: flex-start; overflow-x: auto; }
  .col { flex: 0 0 375px; }
  .cap { font-size: 13px; color: #3F3D3A; margin: 0 0 10px; line-height: 1.45; min-height: 118px; }
  .cap b { color: #111110; font-size: 15px; display: block; margin: 2px 0 3px; }
  .tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
  .tag.now { background: #CFCBC4; } .tag.new { background: #111110; color: #fff; }
  .phone { display: block; width: 375px; border: 0; background: #fff; border-radius: 22px; box-shadow: 0 10px 40px rgba(0,0,0,.14); }
  .states .st { margin-bottom: 14px; } .states .t { margin: 0 0 5px; font-size: 13px; color: #3F3D3A; } .states .t b { color: #111110; margin-right: 4px; }
  .states .phone { border-radius: 14px; }
  .chat { width: 375px; background: #EFEAE2; border-radius: 22px; padding: 18px 14px; box-shadow: 0 10px 40px rgba(0,0,0,.14); }
  .who { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #6E6A64; margin: 4px 0 8px; }
  .bubble { margin-left: auto; width: 300px; background: #D9FDD3; border-radius: 10px; padding: 4px; font-family: system-ui, sans-serif; box-shadow: 0 1px 1px rgba(0,0,0,.08); }
  .lp { background: rgba(0,0,0,.05); border-radius: 7px; overflow: hidden; }
  .lp img { display: block; width: 100%; height: 150px; object-fit: cover; }
  .lpt { padding: 7px 9px 8px; display: grid; gap: 2px; font-size: 12.5px; line-height: 1.3; }
  .lpt span { color: #555; } .lpt i { font-style: normal; color: #777; font-size: 11.5px; }
  .url { margin: 5px 6px 0; font-size: 13px; color: #027EB5; word-break: break-all; }
  .tm { margin: 2px 6px 2px; text-align: right; font-size: 11px; color: #667; }
  .chatnote { font-size: 12.5px; color: #3F3D3A; margin: 8px 4px 18px; text-align: right; }
</style></head><body>
<div class="intro">
  <h1>Market page — mockup v1</h1>
  <p>Three things on one page: <b>nearby that day</b>, <b>a clock line that knows the hour</b>, and <b>Share</b>. Every market, distance and time here is real, taken from the live site on Saturday 26 September. The dashed outline marks what is new.</p>
  <p>Scroll sideways. Phones scroll too.</p>
</div>
<div class="stage">
  ${col('now', 'Today at 17:24, live', 'Bürkliplatz closed at 17:00. The page still says <i>Today</i> in red, and nothing else on it helps.', p1)}
  ${col('new', 'Same moment, proposed', '<i>Over for today</i>, the next date — and the two markets still open less than 2 km away. Only markets still open are listed.', p2)}
  ${col('new', 'The morning, proposed', 'Under the buttons: the other markets that day, closest first, with the one thing that matters about each. Kreisflohmi opens at 11:00, so it says so. <b style="display:inline;font-size:13px">Calendar</b> and <b style="display:inline;font-size:13px">Share</b> share a row.', p3)}
  ${col('new', 'Berlin, seen on Friday', 'Before the day, no clock — just the markets that Sunday, with their times. This is where it earns most: Berlin has a dozen at once.', p4)}
  ${col('new', 'The top of the page, through one day', 'Mauerpark, Sunday 27 September. One small line under the big word, in the accent colour because it is status.', p5)}
  ${col('new', 'Zurich, Today, at 16:20', 'The same clock on list rows. Closing soon says so; finished markets fade. Order stays as it is.', p6)}
  ${col('new', 'Shared in a chat', 'Share opens the phone’s own share sheet — WhatsApp, Signal, Messages, whatever the person uses. On a computer it copies the link.', p7)}
</div>
</body></html>`;

writeFileSync(new URL('./market-v1.html', import.meta.url), html);
console.log('wrote design/market-v1.html', (html.length / 1024).toFixed(0), 'KB');
