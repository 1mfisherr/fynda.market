#!/usr/bin/env node
/**
 * Builds design/home-v7.html — the whole home page, both states, live data.
 *
 *   node design/build-home-v7.mjs
 *
 * Not a fragment and not a wireframe: real photographs, real names, real
 * times, every block top to bottom, and responsive. Two full pages:
 *
 *   1. A stranger. Claim → six markets → "where are you".
 *   2. Someone whose browser remembers Zürich. Their weekend, then nearby.
 *
 * The order is the argument, from the research on 2026-09-05: show the goods
 * before asking for anything, put the number that proves the promise first,
 * and never render a nationwide list as if it were useful to one person.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../scripts/db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = new Date().toISOString().slice(0, 10);

const MARKETS = `
  select coalesce(nm.value,p.slug) as name, p.kind, tc.value as city, sc.slug as city_slug,
         v.name as venue, m.image_url, coalesce(sm.slug,p.slug) as slug,
         extensions.st_y(v.point::extensions.geometry) as lat,
         extensions.st_x(v.point::extensions.geometry) as lng,
         o.date::text as date, o.start_time::text as start_time, o.end_time::text as end_time,
         o.status, o.confirmed_at::text as confirmed_at
    from publishable_markets p
    join markets m on m.id=p.id
    join venues v on v.id=p.venue_id
    join texts tc on tc.entity_type='city' and tc.entity_id=p.city_id and tc.locale='de' and tc.field='name'
    join slugs sc on sc.entity_type='city' and sc.entity_id=p.city_id and sc.locale='de' and sc.is_current
    left join slugs sm on sm.entity_type='market' and sm.entity_id=p.id and sm.locale='de' and sm.is_current
    left join texts nm on nm.entity_type='market' and nm.entity_id=p.id and nm.locale='de' and nm.field='name'
    join occurrences o on o.market_id=p.id
   where o.date >= $1
   order by o.date, o.start_time nulls last`;

const CITY_COUNTS = `
  select tc.value as city, sc.slug, count(*) n
    from publishable_markets p
    join texts tc on tc.entity_type='city' and tc.entity_id=p.city_id and tc.locale='de' and tc.field='name'
    join slugs sc on sc.entity_type='city' and sc.entity_id=p.city_id and sc.locale='de' and sc.is_current
   group by 1,2 order by 3 desc, 1`;

const REGIONS = `
  select tr.value as name, count(*) n
    from publishable_markets p
    join texts tr on tr.entity_type='region' and tr.entity_id=p.region_id and tr.locale='de' and tr.field='name'
   group by 1 order by 2 desc, 1`;

const rows = await query(MARKETS, [TODAY]);
const cityCounts = await query(CITY_COUNTS);
const regions = await query(REGIONS);

const TOTAL = { markets: 157, cities: 55, regions: 14 };

const dayOf = (iso) => new Date(iso + 'T00:00:00').getDay();
const dates = [...new Set(rows.map((r) => r.date))].sort();
const weekend = dates.filter((d) => [0, 6].includes(dayOf(d))).slice(0, 2);
const wknd = rows.filter((r) => weekend.includes(r.date));
const horizonCount = rows.length;

const DOW = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MON = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hhmm = (t) => (t ? t.slice(0, 5) : '');
const short = (iso) => `${Number(iso.slice(8, 10))}. ${MON[Number(iso.slice(5, 7)) - 1]}`;
const dayLabel = (m) => { const d = new Date(m.date + 'T00:00:00'); return `${DOW[d.getDay()]} ${d.getDate()}.`; };
const hours = (m) => (hhmm(m.start_time) ? `${hhmm(m.start_time)}${m.end_time ? `–${hhmm(m.end_time)}` : ''}` : '');

const KIND = { hallenflohmarkt: ['Halle', '--l-halle'], nachtflohmarkt: ['Nacht', '--l-nacht'],
  kinderflohmarkt: ['Kinder', '--l-kinder'], troedelmarkt: ['Trödel', '--l-troedel'] };
const kindTag = (m) => (KIND[m.kind] ? `<i class="tag" style="background:var(${KIND[m.kind][1]})">${KIND[m.kind][0]}</i>` : '');

const STALE = 90;
const flagOf = (m) => {
  if (m.status === 'cancelled') return ['fällt aus', 'bad'];
  if (!m.confirmed_at) return ['nicht bestätigt', 'warn'];
  const age = (Date.parse(TODAY) - Date.parse(m.confirmed_at.slice(0, 10))) / 86400000;
  return age > STALE ? [`geprüft ${short(m.confirmed_at.slice(0, 10))}`, 'warn'] : null;
};
const flagTag = (m) => { const f = flagOf(m); return f ? `<span class="flag ${f[1]}">${f[0]}</span>` : ''; };

/* The illustration, from components/PlaceholderArt.astro — permanent furniture,
   never an empty box. Deterministic per slug so a market looks the same twice. */
const ART = [['#F0E6DC', '#C9A886', '#A8845E'], ['#E4E9EE', '#A6B4C2', '#8496A8'],
  ['#EDE7F5', '#B9AAD4', '#9787BC'], ['#E6EDE7', '#A9C0AE', '#87A38E']];
const art = (seed) => {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [g, ink, deep] = ART[h % ART.length];
  return `<svg class="shot" viewBox="0 0 224 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="224" height="140" fill="${g}"/>
    <g fill="${ink}"><path d="M40 96h80v7H40z"/><path d="M46 80h68v14H46z"/><path d="M54 66h52v12H54z"/></g>
    <g fill="${deep}"><circle cx="163" cy="60" r="13"/><path d="M160 70h6v33h-6z"/><path d="M150 101h26v5h-26z"/>
      <circle cx="66" cy="58" r="7"/><path d="M84 52h16v12H84z"/></g></svg>`;
};
const pic = (m) => (m.image_url
  ? `<img class="shot" src="https://fynda.market${esc(m.image_url)}" alt="" loading="lazy">`
  : art(m.slug));

const feature = (m, showCity = true) => `
        <a class="feat" href="#">
          <div class="pic">${pic(m)}</div>
          <p class="meta"><span class="day">${dayLabel(m)}</span>${hours(m) ? `<span class="hrs">${hours(m)}</span>` : ''}${flagTag(m)}</p>
          <h3>${esc(m.name)}${kindTag(m)}</h3>
          <p class="where">${esc(m.venue)}${showCity ? ` · ${esc(m.city)}` : ''}</p>
        </a>`;

const row = (m, showCity = true, dist) => `
        <a class="row" href="#">
          <div class="thumb">${pic(m)}</div>
          <div>
            <p class="meta"><span class="day">${dayLabel(m)}</span>${flagTag(m)}</p>
            <h3>${esc(m.name)}${kindTag(m)}</h3>
            <p class="where">${esc(m.venue)}${showCity ? ` · ${esc(m.city)}` : ''}${dist ? ` · ${dist}` : ''}</p>
          </div>
          <span class="hrs">${hours(m)}</span>
        </a>`;

/* ---- state 1: a stranger. Two large, four compact, then the way out. ------ */
const bigCity = new Map(cityCounts.map((c) => [c.slug, Number(c.n)]));
const ranked = [...wknd].sort((a, b) => (bigCity.get(b.city_slug) ?? 0) - (bigCity.get(a.city_slug) ?? 0));
const seenCity = new Set();
const pickSix = [];
for (const m of ranked) {              // one per city, biggest cities first
  if (seenCity.has(m.city_slug)) continue;
  seenCity.add(m.city_slug);
  pickSix.push(m);
  if (pickSix.length === 6) break;
}

/* ---- state 2: the browser remembers Zürich ------------------------------- */
const ZH = wknd.filter((m) => m.city_slug === 'zurich');
const zhTotal = bigCity.get('zurich') ?? 0;
const zhPoint = ZH[0] ? { lat: Number(ZH[0].lat), lng: Number(ZH[0].lng) } : { lat: 47.3769, lng: 8.5417 };
const km = (a, b) => {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const near = wknd
  .filter((m) => m.city_slug !== 'zurich')
  .map((m) => ({ m, d: km(zhPoint, { lat: Number(m.lat), lng: Number(m.lng) }) }))
  .filter((x) => x.d <= 50)
  .sort((a, b) => a.d - b.d)
  .slice(0, 4);

const towns = cityCounts.slice(0, 7);

const CHROME = `
    <header class="site-head">
      <a class="mark" href="#">fynda<span>.</span>market</a>
      <nav><span class="langs">FR IT EN</span><a href="#">Gemerkt</a></nav>
    </header>`;

const TAIL = `
      <section class="block">
        <div class="block-h"><h2>Kantone</h2><span>${TOTAL.regions} Kantone</span></div>
        <div class="pills">${regions.map((r) => `<a class="pill" href="#">${esc(r.name)} <i>${r.n}</i></a>`).join('')}</div>
      </section>

      <section class="block">
        <div class="block-h"><h2>Marktarten</h2></div>
        <div class="types">
          ${[['Flohmarkt', '--l-floh'], ['Hallenflohmarkt', '--l-halle'], ['Nachtflohmarkt', '--l-nacht'],
             ['Kinderflohmarkt', '--l-kinder'], ['Trödelmarkt', '--l-troedel']]
            .map(([n, t]) => `<a class="type" href="#"><span style="background:var(${t})"></span>${n}</a>`).join('')}
        </div>
      </section>

      <section class="block trust">
        <div class="block-h"><h2>Woher unsere Daten kommen</h2></div>
        <ol>
          <li><b>Termine prüfen.</b> Jeder Termin hat eine Quelle, und wir schreiben dazu, wann wir sie zuletzt gesehen haben.</li>
          <li><b>Veranstalter bestätigen.</b> Wo möglich fragen wir direkt nach — das ist das «Bestätigt am» auf jeder Marktseite.</li>
          <li><b>Absagen sichtbar machen.</b> Ein abgesagter Markt verschwindet nicht. Er bleibt stehen, durchgestrichen, mit Grund.</li>
        </ol>
        <p class="counts">${TOTAL.markets} Märkte · ${horizonCount} Termine in den nächsten 4 Monaten · ${TOTAL.cities} Städte · ${TOTAL.regions} Kantone</p>
      </section>

      <section class="block">
        <div class="block-h"><h2>Häufige Fragen</h2></div>
        <div class="faq">
          <div><h3>Findet der Markt wirklich statt?</h3><p>Bei jedem Termin steht, wann wir ihn zuletzt mit dem Veranstalter bestätigt haben. Steht dort nichts, haben wir ihn noch nicht geprüft — und sagen das auch.</p></div>
          <div><h3>Was passiert bei Regen?</h3><p>Absagen melden wir, sobald wir davon wissen. Der Termin bleibt sichtbar und durchgestrichen. Hallenmärkte sind als solche gekennzeichnet.</p></div>
          <div><h3>Kostet der Eintritt etwas?</h3><p>Die meisten Flohmärkte sind gratis. Wo Eintritt verlangt wird, steht der Betrag auf der Marktseite.</p></div>
          <div><h3>Wie trage ich einen Markt ein?</h3><p>Über das Formular für Veranstalter, ohne Konto und ohne Gebühr.</p></div>
        </div>
      </section>

      <section class="cta">
        <div><h2>Freitags eine E-Mail</h2><p>Was am Wochenende in Ihrer Stadt läuft. Keine Werbung, jederzeit abbestellbar.</p></div>
        <span class="btn dark">Newsletter</span>
      </section>

      <section class="cta">
        <div><h2>Das ist Ihre Marktseite</h2><p>Sie organisieren einen Markt? Übernehmen Sie die Seite, korrigieren Sie Termine, kostenlos.</p></div>
        <span class="btn">Für Veranstalter</span>
      </section>
    </div>

    <footer class="site-foot">
      <div class="foot-in">
        <div><div class="mark">fynda<span>.</span>market</div>
          <p>Flohmärkte in der Schweiz. Termine mit Quelle, Datum und Stand — und wir sagen, wenn wir etwas nicht wissen.</p></div>
        <div><h4>Fynda</h4><a href="#">Für Veranstalter</a><a href="#">Newsletter</a><a href="#">Termin melden</a></div>
        <div><h4>Finden</h4><a href="#">In der Nähe</a><a href="#">Gemerkt</a><a href="#">Alle Städte</a></div>
        <div><h4>Rechtliches</h4><a href="#">Impressum</a><a href="#">Datenschutz</a></div>
      </div>
      <p class="copy">© 2026 Fynda</p>
    </footer>`;

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fynda — Home v7</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --accent:#FF4A2B; --ink:#111110; --grey:#6E6C68; --quiet:#9A968F;
  --line:#E8E6E2; --paper:#F5F4F2; --stage:#2A2926;
  --l-floh:#FF4A2B; --l-halle:#3D5AFE; --l-nacht:#7C3AED; --l-kinder:#F5A524; --l-troedel:#E4007F;
  --t-h1:clamp(34px,calc(30px + 1.07vw),46px);
  --t-h2:clamp(21px,calc(18.8px + .59vw),27px);
  --t-feat:clamp(19px,calc(17px + .53vw),24px);
  --t-name:clamp(16px,calc(14.3px + .45vw),20px);
  --t-body:clamp(13.5px,calc(12.1px + .38vw),17px);
  --t-small:clamp(12.5px,calc(11.2px + .35vw),15.5px);
  --wrap:1180px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--stage);color:#fff;padding:26px 14px 70px;overflow-wrap:break-word;
  font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
.lab{max-width:var(--wrap);margin:0 auto}
.lab>.mk{font-size:17px;font-weight:800;letter-spacing:-.045em}
.lab>.mk span{color:var(--accent)}
.lab>h1{font-size:25px;font-weight:800;letter-spacing:-.04em;margin-top:10px;line-height:1.12}
.lab>.note{color:#B5B1A8;font-size:13.5px;line-height:1.6;margin-top:10px;max-width:680px}
.lab>.note b{color:#fff;font-weight:700}
.state{font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin:46px 0 10px}
.state em{font-style:normal;color:var(--accent)}

.page{background:#fff;color:var(--ink);border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.35)}
a{color:inherit;text-decoration:none;display:block}
img,svg{display:block;max-width:100%}
.in{max-width:var(--wrap);margin:0 auto;padding:0 16px 40px}

.site-head{display:flex;align-items:center;justify-content:space-between;gap:14px;
  max-width:var(--wrap);margin:0 auto;padding:15px 16px;border-bottom:1px solid var(--line)}
.mark{font-size:20px;font-weight:800;letter-spacing:-.045em}
.mark span{color:var(--accent)}
.site-head nav{display:flex;align-items:center;gap:16px;font-size:var(--t-small);font-weight:700}
.langs{color:var(--quiet);font-weight:600}

/* ---- the claim ---- */
.claim{padding:30px 0 4px}
.claim h1{font-size:var(--t-h1);font-weight:800;letter-spacing:-.045em;line-height:1.03;max-width:15ch}
.claim .promise{margin-top:12px;font-size:var(--t-feat);font-weight:700;letter-spacing:-.02em;line-height:1.28;max-width:30ch}
.claim .promise b{color:var(--accent);font-weight:800}
.claim .sub{margin-top:10px;font-size:var(--t-body);color:var(--grey);line-height:1.55;max-width:56ch}

/* ---- sections ---- */
.block{margin-top:36px}
.block-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  padding-bottom:9px;border-bottom:2px solid var(--ink)}
.block-h h2{font-size:var(--t-h2);font-weight:800;letter-spacing:-.03em}
.block-h span{color:var(--quiet);font-size:var(--t-small);font-weight:600;white-space:nowrap}

.meta{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.day{color:var(--accent);font-size:var(--t-small);font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.hrs{color:var(--grey);font-size:var(--t-small);font-weight:600;white-space:nowrap}
.flag{font-size:var(--t-small);font-weight:700}
.flag.warn{color:var(--grey)}.flag.bad{color:var(--accent)}
.where{margin-top:3px;color:var(--quiet);font-size:var(--t-small);line-height:1.4}
.tag{display:inline-block;vertical-align:2px;margin-left:6px;padding:2px 8px;border-radius:99px;color:#fff;
  font-size:11px;font-style:normal;font-weight:800;letter-spacing:.04em;white-space:nowrap}

.feats{display:grid;gap:20px;margin-top:18px}
@media(min-width:720px){.feats{grid-template-columns:1fr 1fr}}
.feat .pic{aspect-ratio:16/10;border-radius:12px;overflow:hidden;background:var(--paper);margin-bottom:11px}
.feat .pic .shot{width:100%;height:100%;object-fit:cover}
.feat h3{font-size:var(--t-feat);font-weight:800;letter-spacing:-.03em;line-height:1.14;margin-top:5px}

.rows{margin-top:6px}
.row{display:grid;grid-template-columns:68px minmax(0,1fr) auto;gap:14px;align-items:center;
  padding:14px 0;border-bottom:1px solid var(--line)}
@media(min-width:720px){.row{grid-template-columns:88px minmax(0,1fr) auto;gap:20px}}
.row .thumb{aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--paper)}
.row .thumb .shot{width:100%;height:100%;object-fit:cover}
.row h3{font-size:var(--t-name);font-weight:700;letter-spacing:-.02em;line-height:1.2;margin-top:3px}
.more{display:flex;align-items:center;justify-content:center;min-height:48px;margin-top:16px;
  border:1px dashed var(--line);border-radius:99px;color:var(--grey);font-size:var(--t-body);font-weight:700}

/* ---- the place chooser, below the goods ---- */
.pick{margin-top:34px;padding:22px 18px;border:1px solid var(--line);border-radius:18px;background:var(--paper)}
.pick h2{font-size:var(--t-h2);font-weight:800;letter-spacing:-.03em}
.pick p{margin-top:5px;color:var(--grey);font-size:var(--t-body)}
.towns{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px}
.town{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 17px;border-radius:99px;
  border:1px solid var(--line);background:#fff;font-size:var(--t-name);font-weight:700}
.town i{font-style:normal;color:var(--quiet);font-weight:600;font-size:var(--t-small)}
.town.near{background:var(--ink);color:#fff;border-color:var(--ink)}

.mine{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;
  padding:13px 16px;border-radius:12px;background:var(--ink);color:#fff}
.mine b{font-size:var(--t-name);font-weight:800;letter-spacing:-.02em}
.mine span{font-size:var(--t-small);font-weight:700;color:#B5B1A8}

/* ---- tail blocks ---- */
.pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.pill{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 15px;border-radius:99px;
  border:1px solid var(--line);font-size:var(--t-small);font-weight:700}
.pill i{font-style:normal;color:var(--quiet);font-weight:600}
.types{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px}
.type{display:flex;align-items:center;gap:10px;padding:14px;border:1px solid var(--line);border-radius:14px;
  font-size:var(--t-small);font-weight:700}
.type span{width:26px;height:26px;border-radius:8px;flex:none}
.trust ol{margin:14px 0 0 18px;font-size:var(--t-body);line-height:1.6;color:var(--grey)}
.trust ol b{color:var(--ink);font-weight:700}
.trust .counts{margin-top:14px;color:var(--quiet);font-size:var(--t-small);font-weight:600}
.faq{display:grid;gap:18px;margin-top:16px}
@media(min-width:720px){.faq{grid-template-columns:1fr 1fr;gap:22px 34px}}
.faq h3{font-size:var(--t-name);font-weight:700;letter-spacing:-.02em}
.faq p{margin-top:5px;color:var(--grey);font-size:var(--t-body);line-height:1.55;max-width:52ch}
.cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-top:22px;
  padding:22px 18px;border:1px solid var(--line);border-radius:18px}
.cta h2{font-size:var(--t-name);font-weight:800;letter-spacing:-.02em}
.cta p{margin-top:4px;color:var(--grey);font-size:var(--t-small);max-width:46ch}
.btn{display:inline-flex;align-items:center;min-height:46px;padding:0 20px;border-radius:99px;
  border:1px solid var(--line);font-size:var(--t-small);font-weight:700;white-space:nowrap}
.btn.dark{background:var(--ink);color:#fff;border-color:var(--ink)}

.site-foot{background:var(--paper);border-top:1px solid var(--line);padding:32px 0 22px}
.foot-in{max-width:var(--wrap);margin:0 auto;padding:0 16px;display:grid;gap:26px}
@media(min-width:720px){.foot-in{grid-template-columns:1.5fr 1fr 1fr 1fr;gap:30px}}
.foot-in p{margin-top:8px;color:var(--grey);font-size:var(--t-small);line-height:1.6;max-width:34ch}
.foot-in h4{font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--quiet);margin-bottom:9px}
.foot-in a{padding:5px 0;font-size:var(--t-small);font-weight:600}
.copy{max-width:var(--wrap);margin:22px auto 0;padding:16px 16px 0;border-top:1px solid var(--line);
  color:var(--quiet);font-size:12px}
</style>

<div class="lab">
  <div class="mk">fynda<span>.</span></div>
  <h1>Home page — the whole thing</h1>
  <p class="note">Live data, real photographs, every block top to bottom. <b>Responsive — drag the window narrow for the phone.</b> Two complete pages: what a stranger gets, and what someone whose browser remembers a town gets.</p>

<p class="state"><em>1 · First visit</em> — nobody knows where you are</p>
<div class="page">
${CHROME}
    <div class="in">
      <section class="claim">
        <h1>Irgendwo ist immer Markt.</h1>
        <p class="promise"><b>${TOTAL.markets} Flohmärkte</b> in der Schweiz — jeder Termin mit Quelle und Prüfdatum.</p>
        <p class="sub">Wir schreiben zu jedem Termin, wann wir ihn zuletzt beim Veranstalter bestätigt haben. Absagen bleiben stehen, mit Grund. Sonst macht das niemand.</p>
      </section>

      <section class="block">
        <div class="block-h"><h2>Dieses Wochenende</h2><span>${wknd.length} Märkte · ${short(weekend[0])}–${short(weekend[1])}</span></div>
        <div class="feats">${pickSix.slice(0, 2).map((m) => feature(m)).join('')}</div>
        <div class="rows">${pickSix.slice(2).map((m) => row(m)).join('')}</div>
        <a class="more" href="#">Alle ${wknd.length} Märkte am Wochenende</a>
      </section>

      <section class="pick">
        <h2>Wo sind Sie?</h2>
        <p>Einmal wählen — beim nächsten Besuch startet Fynda dort. Kein Konto.</p>
        <div class="towns">
          <span class="town near">In meiner Nähe</span>
          ${towns.map((t) => `<a class="town" href="#">${esc(t.city)} <i>${t.n}</i></a>`).join('')}
          <a class="town" href="#">Alle ${TOTAL.cities} Städte</a>
        </div>
      </section>
${TAIL}
</div>

<p class="state"><em>2 · Second visit</em> — the browser remembered Zürich. Still no account.</p>
<div class="page">
${CHROME}
    <div class="in">
      <section class="claim">
        <h1>Dieses Wochenende in Zürich.</h1>
        <p class="promise"><b>${ZH.length} Märkte</b> am ${short(weekend[0])} und ${short(weekend[1])}.</p>
      </section>

      <div class="mine"><b>Zürich</b><span>ÄNDERN</span></div>

      <section class="block" style="margin-top:22px">
        <div class="feats">${ZH.slice(0, 2).map((m) => feature(m, false)).join('')}</div>
        <div class="rows">${ZH.slice(2).map((m) => row(m, false)).join('')}</div>
        <a class="more" href="#">Alle ${zhTotal} Flohmärkte in Zürich</a>
      </section>

      <section class="block">
        <div class="block-h"><h2>In der Nähe</h2><span>Innerhalb 50 km</span></div>
        <div class="rows">${near.map(({ m, d }) => row(m, true, `${d.toFixed(0)} km`)).join('')}</div>
      </section>
${TAIL}
</div>

<p class="state">What this is arguing</p>
<p class="note"><b>The claim is first, and it is a number.</b> Trust signal, head-term content and the sentence an AI answer can quote — one line, three jobs. No search form above it: that card stood between a visitor and the goods, and it is the pattern the one competitor with no listings on its home page uses.</p>
<p class="note"><b>Six markets, not ${wknd.length}.</b> Two large, four compact, one button. A nationwide list is useless to any single person; this is a taste, and the chooser underneath is the way out of it.</p>
<p class="note"><b>The chooser sits below the markets.</b> Above them it is a form. Below them it reads as "and now make it yours".</p>
<p class="note"><b>The second visit is a different page.</b> One tap, remembered in the browser — the same mechanism Gemerkt already uses. Distances come from the chosen town, so "In der Nähe" works without ever asking for a location permission.</p>
</div>
`;

writeFileSync(join(root, 'design/home-v7.html'), html);
console.log(`  weekend ${wknd.length} · six from ${seenCity.size} cities · Zürich ${ZH.length} · nearby ${near.length}`);
process.exit(0);
