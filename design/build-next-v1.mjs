// Mockup, 2026-10-10: the three ideas after "pages with no date" —
//   1. "12 people are waiting for your next date", for organisers
//   2. the record: a market's earlier dates on its page
//   3. "Were you there?" — one tap the day after a market
// node design/build-next-v1.mjs  →  design/next-v1.html
//
// Built from the site as it is built locally (`npm run deploy -- --build-only`
// first, so dist/ holds the live data) and from the organiser page's own shell
// (functions/_page.ts) and the welcome letter's own renderer (functions/_mail.ts).
// Every stylesheet, font and picture is packed into the file: the preview panel
// blocks anything fetched from elsewhere. Numbers marked as examples are examples.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { page } from '../functions/_page.ts';
import { organiserWelcome } from '../functions/_mail.ts';
import { COPY } from '../functions/_organiser-copy.ts';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const dist = join(root, 'dist');
const read = (p) => readFileSync(join(dist, p), 'utf8');
const dataUri = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`;
const asset = (path) => {
  const file = existsSync(join(dist, path)) ? join(dist, path) : join(root, 'public', path);
  const type = path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.png') ? 'image/png' : path.endsWith('.woff2') ? 'font/woff2' : 'image/webp';
  return dataUri(file, type);
};

/* Everything a page loads, inside the page. */
function pack(html, extraCss = '') {
  let h = html.replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<link rel="(?:preload|icon|apple-touch-icon|manifest|canonical|alternate)"[^>]*>/g, '');
  for (const m of [...h.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]) h = h.replace(m[0], `<style>${read(m[1])}</style>`);
  h = h.replace('</head>', `<style>.cookies{display:none!important}.mark-new{outline:2px dashed #ff4a2b;outline-offset:4px;border-radius:6px}${extraCss}</style></head>`);
  for (const p of new Set([...h.matchAll(/url\(["']?(\/fonts\/[^"')]+)["']?\)/g)].map((m) => m[1]))) h = h.replaceAll(p, asset(p));
  for (const p of new Set([...h.matchAll(/(?:src|srcset)="(\/(?:images|brand)\/[^"\s]+)"/g)].map((m) => m[1]))) h = h.replaceAll(`"${p}"`, `"${asset(p)}"`);
  h = h.replaceAll('https://fynda.market/brand/fynda-wordmark-mail.png', asset('/brand/fynda-wordmark-mail.png'));
  if (/(?:src|href)="\/(?:images|fonts|_astro|brand)\//.test(h)) throw new Error('something still loads from the site');
  return h.replace(/href="[^"#]*"/g, 'href="#"');
}

const frame = (html, { scrollTo = null, height = 760 } = {}) => {
  const doc = html.replace('</body>', `<script>addEventListener('load',()=>{${scrollTo ? `const t=document.querySelector(${JSON.stringify(scrollTo)});if(t)scrollTo(0,t.getBoundingClientRect().top+scrollY-16);` : ''}})</script></body>`);
  return `<iframe class="phone" style="height:${height}px" srcdoc="${doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`;
};
const swap = (h, re, to, label) => { if (!re.test(h)) throw new Error('not found: ' + label); return h.replace(re, to); };

/* ---------- 1. Waiting: the organiser page ---------- */

const c = COPY.en;
const W = 12; // example
const organiserPage = (nextBlock) => page('en', 'Flohmarkt am See Wollishofen', `
  <p class="eyebrow">${c.eyebrow}</p>
  <h1>Flohmarkt am See Wollishofen</h1>
  <p class="lede">Zurich · Every 1st Sunday of the month, April to October</p>
  <p class="lede" style="margin-top:-12px"><a href="#" style="color:#111110;font-weight:500">${c.viewPublic} ↗</a></p>
  <img class="photo" src="/images/flohmarkt-am-see-wollishofen-zuerich.webp" alt="" width="1440" height="900">
  <div class="why"><p>${c.hello}</p><p>${c.why.replace(/'/g, '&#39;')}</p></div>
  ${nextBlock}
  <h2 id="dates">${c.datesTitle}</h2>
  <p class="hint" style="font-size:15px">${c.datesIntro}</p>
  <ul class="list"><li><div class="top"><span class="quiet">${c.addDate}</span></div>
    <div class="under"><span class="times"><input type="date"></span><span class="times"><input type="time"> – <input type="time"></span></div></li></ul>
`, { wide: true });
const orgNow = organiserPage(`<div class="card"><h2>${c.nextTitle}</h2><p class="quiet">${c.nextNone}</p></div>`);
const orgNew = organiserPage(`<div class="card mark-new"><h2 style="margin:0">${W} people are waiting for your next date.</h2></div>`);
const orgHtml = async (res) => pack((await res.text()).replace('/brand/fynda-wordmark.svg', '/brand/fynda-wordmark.svg'));

/* ---------- 1. Waiting: the letter ---------- */

const letter = organiserWelcome('en', '', 'Flohmarkt am See Wollishofen', 'https://fynda.market/a/…/edit', 'listed');
const letterHtml = pack(swap(letter.html, /(<p style="margin:8px 0 24px;">\s*<a )/,
  `<p class="mark-new" style="margin:0 0 16px;">${W} people are waiting for your next date.</p>$1`, 'letter button'));

/* ---------- 1. Waiting: the public claim card ---------- */

const woll = read('en/market/flohmarkt-am-see-wollishofen-zuerich/index.html');
const claim = pack(swap(woll, /(<section class="cta"[^>]*>\s*<h2[^>]*>[^<]*<\/h2>\s*<p class="meta"[^>]*>)[^<]*(<\/p>)/,
  `$1<b class="mark-new">${W} people asked to be told when its next date is out.</b> Claim it to add the date — free, no account needed.$2`, 'claim card'));

/* ---------- 2. The record ---------- */

const RECORD_CSS = `
  .earlier { margin: var(--space-5) 0 var(--space-1); font-size: var(--text-small); font-weight: var(--weight-bold); }
  .record { margin: 0; color: var(--color-grey); font-size: var(--text-small); }
  .past li { color: var(--color-grey); }
  .past li > strong { font-weight: var(--weight-semibold); }
  .seen { color: var(--color-ink) !important; }
`;
const pastRows = (rows) => `<ul class="dates past list-reset" data-astro-cid-dtl3z72q>${rows.map(([d, word]) =>
  `<li data-astro-cid-dtl3z72q><strong data-astro-cid-dtl3z72q>${d}</strong><span data-astro-cid-dtl3z72q></span>${word ? `<em class="seen" data-astro-cid-dtl3z72q>${word}</em>` : ''}</li>`).join('')}</ul>`;
const recordWoll = pack(swap(woll, /(<p class="gutter no-dates"[^>]*>[\s\S]*?<\/p>)/,
  `$1<div class="gutter mark-new"><p class="earlier">Earlier this year</p>${pastRows([['Sun 4 Oct', ''], ['Sun 6 Sep', ''], ['Sun 9 Aug', '']])}</div>`, 'woll dates'), RECORD_CSS);

const buerkli = read('en/market/flohmarkt-buerkliplatz-zuerich/index.html');
const recordBuerkli = pack(swap(buerkli, /(<ul class="dates list-reset gutter"[\s\S]*?<\/ul>(?:\s*<div class="gutter more"[\s\S]*?<\/div>)?)/,
  `$1<div class="gutter mark-new"><p class="earlier">Earlier this year</p><p class="record">21 Saturdays since 2 May, none cancelled.</p>${pastRows([['Sat 3 Oct', 'Seen on'], ['Sat 26 Sep', ''], ['Sat 19 Sep', '']])}<button class="button" data-variant="quiet" data-astro-cid-dtl3z72q>All 21</button></div>`, 'buerkli dates'), RECORD_CSS);

/* ---------- 3. Were you there? ---------- */

const WAS_CSS = `
  .wason { display: grid; gap: var(--space-3); padding: var(--space-5); border-radius: var(--radius-md); background: var(--color-paper); }
  .wason h2 { margin: 0; font-size: var(--text-row-name); }
  .wason p { margin: 0; color: var(--color-grey); font-size: var(--text-small); }
  .wason .two { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
`;
const dayAfter = (inner) => {
  let h = swap(buerkli, /<div class="status"[\s\S]*?<\/div>/,
    `<div class="status" data-astro-cid-dtl3z72q><p class="word" data-astro-cid-dtl3z72q><strong data-astro-cid-dtl3z72q>Sat 17 Oct</strong></p><p class="clock" data-astro-cid-dtl3z72q>07:00–17:00 </p></div>`, 'status');
  h = h.replace(/<section id="nearby"[\s\S]*?<\/section>/, '');
  return pack(swap(h, /(<div class="detail"[^>]*>)/, `$1<div class="gutter" data-astro-cid-dtl3z72q><section class="wason mark-new">${inner}</section></div>`, 'detail'), WAS_CSS);
};
const wasAsk = dayAfter(`<h2>Were you there on Sat 10 Oct?</h2>
  <p>One tap tells the next person it really happened.</p>
  <div class="two"><button class="button" data-variant="secondary" data-block>Yes, it was on</button><button class="button" data-variant="secondary" data-block>No, it wasn't</button></div>`);
const wasThanks = dayAfter(`<h2>Thank you.</h2><p>That's how this page stays true.</p>`);

/* ---------- the sheet ---------- */

const col = (tag, title, text, body) => `<div class="col"><div class="cap"><span class="tag ${tag}">${tag === 'now' ? 'Live today' : 'Proposed'}</span><b>${title}</b>${text}</div>${body}</div>`;
const mail = (html) => `<div class="mailbox"><p class="mailhead"><b>${letter.subject}</b><br>From: fynda.market</p>${frame(html, { height: 700 }).replace('class="phone"', 'class="phone mail"')}</div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Waiting, the record, were you there — mockup v1</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @font-face { font-family: 'Schibsted Grotesk'; src: url('${asset('/fonts/schibsted-grotesk-latin.woff2')}') format('woff2'); font-weight: 400 900; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #DEDCD7; font-family: 'Schibsted Grotesk', system-ui, sans-serif; color: #111110; }
  .intro { max-width: 1100px; margin: 28px auto 0; padding: 0 28px; }
  .intro h1 { font-size: 26px; margin: 0 0 6px; letter-spacing: -.02em; }
  .intro p { margin: 0 0 6px; color: #3F3D3A; font-size: 15px; line-height: 1.5; max-width: 820px; }
  .row-title { margin: 22px 0 0; padding: 0 28px; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6E6A64; }
  .stage { display: flex; gap: 26px; padding: 14px 28px 30px; align-items: flex-start; overflow-x: auto; }
  .col { flex: 0 0 375px; }
  .cap { font-size: 13px; color: #3F3D3A; margin: 0 0 10px; line-height: 1.45; min-height: 96px; }
  .cap b { color: #111110; font-size: 15px; display: block; margin: 2px 0 3px; }
  .tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; }
  .tag.now { background: #CFCBC4; } .tag.new { background: #111110; color: #fff; }
  .phone { display: block; width: 375px; border: 0; background: #fff; border-radius: 22px; box-shadow: 0 10px 40px rgba(0,0,0,.14); }
  .mailbox { width: 375px; background: #fff; border-radius: 22px; box-shadow: 0 10px 40px rgba(0,0,0,.14); overflow: hidden; }
  .mailhead { margin: 0; padding: 14px 18px; border-bottom: 1px solid #e5e5e5; font-size: 13px; color: #6b6b70; line-height: 1.5; }
  .mailhead b { color: #111110; }
  .phone.mail { border-radius: 0; box-shadow: none; }
</style></head><body>
<div class="intro">
  <h1>Waiting, the record, were you there — mockup v1</h1>
  <p>Three ideas from the product session. Pages are the real site and the real organiser page; <b>12 people</b> is an example number — on the real page it is the count from the "tell me when it's back" sign-ups. The dashed outline marks what's new.</p>
  <p>Scroll sideways. The phones scroll too.</p>
</div>
<p class="row-title">1 · People waiting — for organisers</p>
<div class="stage">
  ${col('now', 'Organiser page, live today', 'A market with no date tells its organiser "No upcoming date on your page yet. Add one below." Nothing says why it matters.', frame(await orgHtml(orgNow), { scrollTo: '.card' }))}
  ${col('new', 'Organiser page, proposed', 'The same card says how many people are waiting — and nothing else. Shown from the first person; the count is never invented.', frame(await orgHtml(orgNew), { scrollTo: '.card' }))}
  ${col('new', 'The letter, proposed', 'One sentence before the button, only when people are waiting. It goes in the welcome letter now and the annual "what are your dates" letter in November.', mail(letterHtml))}
  ${col('new', 'Market page, proposed', 'Public, on the claim card: an organiser looking their own market up sees people are waiting. Shown from 3 people up.', frame(claim, { scrollTo: '.cta' }))}
</div>
<p class="row-title">2 · The record — earlier dates</p>
<div class="stage">
  ${col('new', 'No date: what it had this year', 'Under "No next date yet", the dates it had this year, newest first. It shows the market is real and regular.', frame(recordWoll, { scrollTo: '#dates' }))}
  ${col('new', 'A weekly market: one line, then the list', 'Under the coming dates: "21 Saturdays since 2 May, none cancelled", three dates, and the rest behind a button. A date someone confirmed with "Yes, it was on" says <i>Seen on</i>.', frame(recordBuerkli, { scrollTo: '#dates' }))}
</div>
<p class="row-title">3 · Were you there? — the day after</p>
<div class="stage">
  ${col('new', 'Bürkliplatz, the morning after', 'For two days after a date, one question under the buttons. On the day itself it appears once the market has closed.', frame(wasAsk, { scrollTo: '.actions' }))}
  ${col('new', 'After a tap', 'One line, and nothing else asked. "No" goes to us like a report; "Yes" marks the date as seen.', frame(wasThanks, { scrollTo: '.actions' }))}
</div>
</body></html>`;

writeFileSync(join(root, 'design', 'next-v1.html'), html);
console.log('wrote design/next-v1.html', (html.length / 1024 / 1024).toFixed(1), 'MB');
