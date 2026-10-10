// Mockup: market and town pages with no upcoming date, 2026-10-10.
// node design/build-nodate-v1.mjs <dir with live pages>  →  design/nodate-v1.html
// The dir holds wollishofen.html, uster.html, rafz.html, zurich.html fetched from
// fynda.market/en/. Each phone is the live page with its own CSS (loaded from
// fynda.market through <base>), edited; only the new blocks are new markup.
// Markets, dates, distances and facts are real, read from the live database
// on Saturday 10 October.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const read = (f) => readFileSync(join(dir, f), 'utf8');
const woll = read('wollishofen.html'), uster = read('uster.html'), rafz = read('rafz.html'), zurich = read('zurich.html');
const styleOf = (h) => [...h.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const extraCss = styleOf(zurich) + '\n' + styleOf(rafz);

const MARKET = 'data-astro-cid-dtl3z72q', SECTION = 'data-astro-cid-w6ymvdtg', CARD = 'data-astro-cid-hdyrtumq',
  SUB = 'data-astro-cid-7u2mu3qg', PILLS = 'data-astro-cid-e6vuipuh', TOWN = 'data-astro-cid-m6qunrq2';

const newCss = `
  .cookies { display: none !important; }
  .mark-new { outline: 2px dashed #ff4a2b; outline-offset: 6px; border-radius: 6px; }
  .status .next-line { margin: var(--space-1) 0 0; color: var(--color-grey); }
  .card .state { color: var(--color-accent-text); font-weight: var(--weight-bold); margin: 0; }
  .card .day { font-weight: var(--weight-bold); }
  .nearby-list { display: grid; gap: var(--space-3); }
  .more { display: inline-block; margin-top: var(--space-3); font-weight: var(--weight-bold); color: inherit; }
  .tick { display: flex; gap: 10px; align-items: flex-start; margin: var(--space-3) 0; font-size: var(--text-small); line-height: 1.4; }
  .tick input { width: 20px; height: 20px; margin: 0; flex: 0 0 auto; accent-color: var(--color-ink); }
  .fine { margin: var(--space-2) 0 0; color: var(--color-grey); font-size: var(--text-small); }
  .towns .pill .km { color: var(--color-grey); font-weight: 400; margin-left: 4px; }
  .held { display: grid; gap: 2px; }
  .mini { list-style: none; margin: 0; padding: 0; }
  .mini li { padding: var(--space-3) 0; border-bottom: 1px solid var(--color-line, #e6e3de); display: flex; gap: var(--space-3); align-items: center; }
  .mini img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex: 0 0 auto; }
  .mini li:first-child { padding-top: 0; }
  .mini a { color: inherit; text-decoration: none; font-weight: var(--weight-bold); }
  .mini p { margin: 2px 0 0; color: var(--color-grey); font-size: var(--text-small); }
  .mini .when { color: var(--color-accent-text); font-weight: var(--weight-bold); }
  .card .state.mark-new, .card.mark-new { outline-offset: 2px; }
  .strip.facts ul { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: var(--space-3) var(--space-4) !important; flex-wrap: initial; }
  .strip.facts li { border: 0 !important; padding: 0 !important; margin: 0 !important; }
  .status .rhythm-line { margin: var(--space-1) 0 0; color: var(--color-grey); }
`;

function frame(html, { scrollTo = null, height = 780 } = {}) {
  const doc = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace('<head>', `<head><base href="https://fynda.market/">`)
    .replace('</head>', `<style>${extraCss}</style><style>${newCss}</style></head>`)
    .replace('</body>', `<script>addEventListener('load',()=>{${scrollTo ? `const t=document.querySelector(${JSON.stringify(scrollTo)});if(t)scrollTo(0,t.getBoundingClientRect().top+scrollY-12);` : ''}document.querySelectorAll('a,button').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))})</script></body>`);
  if (process.env.DUMP) writeFileSync(join(process.env.DUMP, `p${++frame.n}.html`), doc);
  const esc = doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<iframe class="phone" style="height:${height}px" srcdoc="${esc}"></iframe>`;
}

frame.n = 0;
const must = (h, re, label) => { if (!re.test(h)) throw new Error('not found: ' + label); return h; };
const swap = (h, re, to, label) => must(h, re, label).replace(re, to);

/* A list card from the Zurich page, with the distance shown, a day, and a status line. */
function card(slug, { km = '', day = '', state = '', rhythm = null } = {}) {
  const re = new RegExp(`<article class="card row"(?:(?!</article>)[\\s\\S])*?/market/${slug}/[\\s\\S]*?</article>`);
  let c = zurich.match(re)?.[0] ?? rafz.match(re)?.[0];
  // Bürkliplatz is Zurich's feature card today; draw it as a row from Rosenhof's.
  if (!c && slug === 'flohmarkt-buerkliplatz-zuerich') c = card('rosenhof-markt-zuerich')
    .replaceAll('rosenhof-markt-zuerich', slug).replace('rosenhof-markt-thumb', 'flohmarkt-buerkliplatz-zuerich-thumb')
    .replace('>Rosenhof-Markt<', '>Flohmarkt Bürkliplatz<').replace('>10:00–18:00<', '>07:00–17:00<')
    .replace('>Every Saturday, March to November<', '>Every Saturday, May to October<').replace(/(<p class="where"[^>]*>)Rosenhof</, '$1Stadthausanlage<');
  if (!c) throw new Error('no card ' + slug);
  if (km) c = c.replace(/<span class="km" data-distance hidden([^>]*)><\/span>/, `<span class="km"$1>${km}</span>`);
  if (day) c = c.replace(/(<p class="meta"[^>]*>)/, `$1<span class="day" ${CARD}>${day}</span> `);
  if (state) c = c.replace(/(<p class="rhythm")/, `<p class="state" ${CARD}>${state}</p>$1`);
  if (rhythm) c = c.replace(/(<p class="rhythm"[^>]*>)[^<]*(<\/p>)/, `$1${rhythm}$2`);
  return c;
}

const section = (id, title, lede, inner, cls = 'section sub') => `<section${id ? ` id="${id}"` : ''} class="${cls} mark-new" ${SECTION}>
  <h2 class="gutter" data-level="sub" ${SECTION}>${title}</h2>${lede ? `<p class="lede gutter meta" ${SECTION}>${lede}</p>` : ''}
  <div class="body" ${SECTION}>${inner}</div></section>`;

/* "Tell me when it's back": the newsletter card's own markup and styles, one
   address, one optional tick for the Friday mail. One form per page. */
const notify = ({ title, text, tick }) => `<div class="gutter notify" ${MARKET}><section class="subscribe subscribe--card mark-new" ${SUB}>
  <p class="eyebrow" ${SUB}>When it's back</p>
  <h2 ${SUB}>${title}</h2>
  <p class="meta body" ${SUB}>${text}</p>
  <form class="subscribe-form" ${SUB}>
    <label class="field"><span>Email address</span><input type="email" placeholder="name@example.com"></label>
    <label class="tick"><input type="checkbox"><span>${tick}</span></label>
    <button type="button" class="button" data-variant="primary" data-block ${SUB}="true">Tell me</button>
  </form>
  <p class="fine" ${SUB}>One click stops it.</p>
</section></div>`;

const strip = (items, stamp = '') => `<div class="strip facts mark-new" ${MARKET}> <ul class="list-reset" ${MARKET}>${items.map(([v, l]) => `<li ${MARKET}><b ${MARKET}>${v}</b><span ${MARKET}>${l}</span></li>`).join('')}</ul>${stamp ? ` <p class="stamp" ${MARKET}>${stamp}</p>` : ''} </div>`;

const STRIP_RE = /<div class="strip"[\s\S]*?<\/ul>\s*<p class="stamp"[^>]*>[\s\S]*?<\/p>\s*<\/div>/;
const NEWSLETTER_RE = /<div class="gutter"[^>]*><section class="subscribe[\s\S]*?<\/section>[\s\S]*?<\/div>/;
const towns = (list) => `<section class="section towns mark-new" ${SECTION}><h2 class="gutter" ${SECTION}>Towns nearby</h2>
  <ul class="pills list-reset gutter" ${PILLS}>${list.map(([t, km]) => `<li ${PILLS}><a class="pill" href="#" ${PILLS}>${t}<span class="km">${km}</span></a></li>`).join('')}</ul></section>`;

/* ---------- Market page, no date: Flohmarkt am See Wollishofen ---------- */

let w = woll;
w = swap(w, STRIP_RE, `<div class="status mark-new" ${MARKET}>
  <p class="word" ${MARKET}><strong ${MARKET}>Back in April</strong></p>
  <p class="rhythm-line" ${MARKET}>Every 1st Sunday of the month, April to October. Last held Sun 4 Oct.</p></div>
  ${strip([['Outdoors, on the lawn', 'Setting'], ['Private people', 'Who sells'], ['Free', 'Entry'], ['Called off', 'If it rains']])}`, 'woll strip');
w = swap(w, /(<div class="detail")/, `${notify({
  title: 'Tell me when it’s back',
  text: 'One email, the day Flohmarkt am See Wollishofen puts out its 2027 dates. Nothing else.',
  tick: 'Also send me the weekend around Zurich, every Friday morning',
})}${section('nearby', 'Meanwhile, nearby', 'Markets with a date, closest first.', `<div class="gutter"><ul class="mini">${[
    ['Flohmarkt Bürkliplatz', 'Today', '07:00–17:00', '2.5 km', 'flohmarkt-buerkliplatz-zuerich-thumb'],
    ['Rosenhof-Markt', 'Today', '10:00–18:00', '3.2 km', 'rosenhof-markt-thumb'],
    ['Flohmarkt Kanzlei', 'Today', '07:20–16:00', '3.5 km', 'flohmarkt-kanzlei-thumb'],
  ].map(([n, d, h, km, img]) => `<li><img src="/images/${img}.webp" alt=""><div><a href="#">${n}</a><p><span class="when">${d}</span> · ${h} · ${km}</p></div></li>`).join('')}</ul>
    <a class="more" href="#">All 14 markets with a date in Zurich →</a></div>`)}$1`, 'woll detail');
w = swap(w, /<p class="gutter no-dates"[\s\S]*?<\/p>/, `<p class="gutter no-dates held mark-new" ${MARKET}><strong ${MARKET}>2027: not out yet.</strong> <span ${MARKET}>Held this year on Sun 9 Aug, Sun 6 Sep and Sun 4 Oct.</span></p>`, 'woll dates');
w = swap(w, NEWSLETTER_RE, '', 'woll newsletter');

/* ---------- Market page with a date: Hallenflohmarkt Uster ---------- */

let u = uster;
u = swap(u, STRIP_RE, strip([['Monthly, on a Sunday, October to April', 'How often'], ['Indoors', 'Setting'], ['Used goods only', 'What’s sold'], ['4', 'Upcoming dates']], 'Checked 9 Oct'), 'uster strip');

/* ---------- Town page, no date: Rafz ---------- */

let r = rafz;
r = swap(r, /<p class="answer"[^>]*>[\s\S]*?<\/p>/, `<p class="answer mark-new" ${TOWN}>Once a year, usually in September. Last held Sat 19 Sep.</p>`, 'rafz answer');
r = swap(r, /<div class="when gutter"[\s\S]*?<section id="undated"/, '<section id="undated"', 'rafz filters');
// The town's own market first, then the one form, then what's on around it.
r = swap(r, /<section id="undated"[\s\S]*?<\/section>(?=<aside)/, `<section id="undated" class="section" ${SECTION}>
  <h2 class="gutter" ${SECTION}>In Rafz</h2><div class="body" ${SECTION}><div class="gutter" ${TOWN}>
  ${card('strassenflohmarkt-rafz', { state: 'Usually in September', rhythm: 'Once a year · last held Sat 19 Sep' }).replace('class="card row"', 'class="card row mark-new"')}
  </div></div></section>
  ${notify({
    title: 'Tell me when Rafz has a date',
    text: 'One email, the day Strassenflohmarkt Rafz puts out its 2027 date. Nothing else.',
    tick: 'Also send me the weekend around Rafz, every Friday morning',
  })}`, 'rafz undated');
// (The filters, the empty dated list and the newsletter card all sat above #undated; they went with the filters.)
must(r, /class="gutter notify"/, 'rafz notify');
if (/data-subscribe-block/.test(r)) throw new Error('rafz: newsletter card still there');
r = swap(r, /(<ul class="pills)/, `${towns([['Neuhausen', '10 km'], ['Bülach', '11 km'], ['Schaffhausen', '12 km'], ['Kloten', '18 km'], ['Winterthur', '19 km']])}$1`, 'rafz towns');

/* ---------- Town page, Zurich: the undated list and the towns around it ---------- */

let z = zurich;
const states = {
  'flohmarkt-am-see-wollishofen-zuerich': 'Back in April',
  'kinderflohmarkt-gz-heuried': 'Back in spring',
  'kinderflohmarkt-gz-hottingen': 'Last held Sat 29 Aug',
  'kinderflohmarkt-gz-schindlergut': 'Last held Wed 2 Sep',
  'kreisflohmi-zuerich': 'Back in May',
};
z = swap(z, /(<section id="undated"[\s\S]*?<p class="lede[^>]*>)[\s\S]*?(<\/p>)/, `$1Their next dates aren’t out yet. Open one and we’ll tell you when they are.$2`, 'zurich lede');
z = z.replace(/<section id="undated"[\s\S]*?<\/section>/, (sec) => {
  for (const [slug, state] of Object.entries(states)) {
    sec = sec.replace(new RegExp(`(<article class="card row"(?:(?!</article>)[\\s\\S])*?/market/${slug}/(?:(?!</article>)[\\s\\S])*?)(<p class="rhythm")`), `$1<p class="state mark-new" ${CARD}>${state}</p>$2`);
  }
  return sec;
});
z = swap(z, /(<ul class="pills)/, `${towns([['Glattbrugg', '5 km'], ['Dübendorf', '6 km'], ['Zollikon', '6 km'], ['Schlieren', '7 km'], ['Rümlang', '7 km'], ['Kloten', '8 km'], ['Adliswil', '9 km'], ['Dietikon', '11 km'], ['Uster', '15 km']])}$1`, 'zurich towns');

/* ---------- The sheet ---------- */

const col = (tag, title, text, body) => `<div class="col"><div class="cap"><span class="tag ${tag}">${tag === 'now' ? 'Live today' : 'Proposed'}</span><b>${title}</b>${text}</div>${body}</div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>No date yet — mockup v1</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @font-face { font-family: 'Schibsted Grotesk'; src: url('https://fynda.market/fonts/schibsted-grotesk-latin.woff2') format('woff2'); font-weight: 400 900; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #DEDCD7; font-family: 'Schibsted Grotesk', system-ui, sans-serif; color: #111110; -webkit-font-smoothing: antialiased; }
  .intro { max-width: 1100px; margin: 28px auto 0; padding: 0 28px; }
  .intro h1 { font-size: 26px; margin: 0 0 6px; letter-spacing: -.02em; }
  .intro p { margin: 0 0 6px; color: #3F3D3A; font-size: 15px; line-height: 1.5; max-width: 820px; }
  .row-title { max-width: 1100px; margin: 18px 0 0; padding: 0 28px; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6E6A64; }
  .stage { display: flex; gap: 26px; padding: 14px 28px 30px; align-items: flex-start; overflow-x: auto; }
  .col { flex: 0 0 375px; }
  .cap { font-size: 13px; color: #3F3D3A; margin: 0 0 10px; line-height: 1.45; min-height: 104px; }
  .cap b { color: #111110; font-size: 15px; display: block; margin: 2px 0 3px; }
  .tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
  .tag.now { background: #CFCBC4; } .tag.new { background: #111110; color: #fff; }
  .phone { display: block; width: 375px; border: 0; background: #fff; border-radius: 22px; box-shadow: 0 10px 40px rgba(0,0,0,.14); }
</style></head><body>
<div class="intro">
  <h1>Pages with no date yet — mockup v1</h1>
  <p>A market between editions is a place with a season, not an event that ended. Each page says when it's usually back, offers to tell you, and shows what's on nearby meanwhile. Every market, date, distance and fact here is real, read from the live site on Saturday 10 October. The dashed outline marks what's new.</p>
  <p>Scroll sideways. The phones scroll too.</p>
</div>
<p class="row-title">Market page</p>
<div class="stage">
  ${col('now', 'Wollishofen, live today', '“No next date yet”, a newsletter for the whole area, and nothing to do. 84% of people who land on a page like this leave without tapping anything.', frame(woll))}
  ${col('new', 'Wollishofen, proposed — the top', '<i>Back in April</i> where the date would be, from its own rhythm. Under it, the facts we hold about it: outdoors, private people selling, free, called off in rain. Only facts we have; no blanks.', frame(w))}
  ${col('new', 'Wollishofen, proposed — further down', 'One e-mail box: <i>tell me when it’s back</i>, with an unticked box for the Friday weekend mail. Then three markets on today within 4 km. It replaces the newsletter card, so there is still one form per page.', frame(w, { scrollTo: '.notify' }))}
  ${col('new', 'Uster, with a date — same fact row', 'Pages with a date get the same row: indoors, used goods only. A market we know nothing more about shows only its rhythm, as today.', frame(u))}
</div>
<p class="row-title">Town page</p>
<div class="stage">
  ${col('now', 'Rafz, live today', 'The newsletter opens the page, above Rafz’s own market. Date filters for a town with no dates.', frame(rafz))}
  ${col('new', 'Rafz, proposed', 'The answer says when: <i>usually in September</i>. Rafz’s market first, then <i>tell me when Rafz has a date</i>, then what’s on within 25 km (as today), then the towns around it. The filters go when a town has no dates.', frame(r))}
  ${col('new', 'Zurich, proposed — the undated list', 'Each market without a date says when it’s back, or when it last ran. Under the list, the towns around Zurich: Kloten, Dübendorf and Dietikon were missing.', frame(z, { scrollTo: '#undated' }))}
</div>
</body></html>`;

writeFileSync(new URL('./nodate-v1.html', import.meta.url), html);
console.log('wrote design/nodate-v1.html', (html.length / 1024).toFixed(0), 'KB');

/* ---------- One phone, standalone: every stylesheet, font and picture packed into
   the file, because previews block anything fetched from fynda.market. ---------- */

const ORIGIN = 'https://fynda.market';
const b64 = async (path, type) => `data:${type};base64,${Buffer.from(await (await fetch(ORIGIN + path)).arrayBuffer()).toString('base64')}`;
async function standalone(page) {
  let h = page.replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<link rel="(?:preload|icon|apple-touch-icon|manifest|canonical|alternate)"[^>]*>/g, '');
  for (const m of [...h.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]) {
    h = h.replace(m[0], `<style>${await (await fetch(ORIGIN + m[1])).text()}</style>`);
  }
  h = h.replace('</head>', `<style>${extraCss}</style><style>${newCss}</style></head>`);
  for (const font of new Set([...h.matchAll(/url\(["']?(\/fonts\/[^"')]+)["']?\)/g)].map((m) => m[1]))) {
    h = h.replaceAll(font, await b64(font, 'font/woff2'));
  }
  for (const img of new Set([...h.matchAll(/(?:src|srcset)="(\/images\/[^"\s]+)"/g)].map((m) => m[1]))) {
    h = h.replaceAll(`"${img}"`, `"${await b64(img, 'image/webp')}"`);
  }
  for (const svg of new Set([...h.matchAll(/src="(\/brand\/[^"]+\.svg)"/g)].map((m) => m[1]))) {
    h = h.replaceAll(`"${svg}"`, `"${await b64(svg, 'image/svg+xml')}"`);
  }
  if (/="\/(?:images|fonts|_astro|brand)\//.test(h)) throw new Error('standalone: something still loads from the site');
  return h.replace(/<a href="https?:[^"]*"/g, '<a href="#"');
}
const phone = await standalone(w);
writeFileSync(new URL('./nodate-v1-phone.html', import.meta.url), phone);
console.log('wrote design/nodate-v1-phone.html', (phone.length / 1024).toFixed(0), 'KB');
