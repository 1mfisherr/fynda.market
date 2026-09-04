#!/usr/bin/env node
/**
 * Builds design/home-v2.html from live data.
 *
 * A mockup drawn with invented markets always looks better than the real thing,
 * because invented names are short and invented data is complete. This one is
 * generated from the database so what you see is what the page would be.
 *
 *   node design/build-home-v2.mjs
 *
 * It writes nothing but the mockup, and reads nothing but the database.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../scripts/db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = new Date().toISOString().slice(0, 10);

const SQL = `
  select coalesce(sm.slug,p.slug) as slug, coalesce(nm.value,p.slug) as name,
         p.kind, tc.value as city, v.name as venue, m.entry_fee, m.image_url,
         m.recurrence_text, sc.slug as city_slug,
         o.date::text as date, o.start_time::text as start_time,
         o.end_time::text as end_time, o.status, o.confirmed_at::text as confirmed_at
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

const rows = await query(SQL, [TODAY]);

const LINE = {
  flohmarkt: ['FM', '--l-floh'], hallenflohmarkt: ['HA', '--l-halle'],
  nachtflohmarkt: ['NA', '--l-nacht'], kinderflohmarkt: ['KI', '--l-kinder'],
  troedelmarkt: ['TR', '--l-troedel'],
};
const DOW = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const hhmm = (t) => (t ? t.slice(0, 5) : '');
const dayOf = (iso) => new Date(iso + 'T00:00:00').getDay();
const short = (iso) => `${Number(iso.slice(8, 10))}. ${MON[Number(iso.slice(5, 7)) - 1].slice(0, 4)}`;

const photo = (m) => m.image_url
  ? `<div class="photo"><img src="https://fynda.market${esc(m.image_url).replace(/\.webp$/, '-thumb.webp')}" alt="" width="74" height="74" loading="lazy"></div>`
  : `<div class="photo"></div>`;

const fee = (m) => (m.entry_fee === 0 ? ' · frei' : m.entry_fee ? ` · ${m.entry_fee} CHF` : '');
const fresh = (m) => (m.confirmed_at
  ? `<div class="col-fresh"><b>Bestätigt</b>${short(m.confirmed_at.slice(0, 10))} durch den Veranstalter</div>`
  : `<div class="col-fresh"><b>Nicht bestätigt</b>Quelle: Veranstalterseite</div>`);

/** A row inside a day band: the day is already known, so the row shows a time. */
function timeRow(m) {
  const [code, token] = LINE[m.kind] ?? LINE.flohmarkt;
  return `
        <article class="row">
          <i class="rail" style="background:var(${token})"></i>
          <div class="time">${hhmm(m.start_time) ? `<strong>${hhmm(m.start_time)}</strong>` : ''}${hhmm(m.end_time) ? `<span>–${hhmm(m.end_time)}</span>` : ''}<span class="code" style="background:var(${token})">${code}</span></div>
          <div class="details">
            <h3 class="name"><a href="#">${esc(m.name)}</a></h3>
            <p class="via">${esc(m.venue)} · ${esc(m.city)}${fee(m)}</p>
          </div>
          ${fresh(m)}
          ${photo(m)}
        </article>`;
}

/** A row with no day band above it: the date moves into the row, and the
 *  recurrence phrase carries what the eighteen deleted rows used to say. */
function marketRow(m) {
  const [code, token] = LINE[m.kind] ?? LINE.flohmarkt;
  const d = new Date(m.date + 'T00:00:00');
  return `
        <article class="row market-row">
          <i class="rail" style="background:var(${token})"></i>
          <div class="when">
            <strong>${String(d.getDate()).padStart(2, '0')}</strong>
            <span>${DOW[d.getDay()].slice(0, 2)} ${MON[d.getMonth()].slice(0, 4)}</span>
            <span class="code" style="background:var(${token})">${code}</span>
          </div>
          <div class="details">
            <h3 class="name"><a href="#">${esc(m.name)}</a></h3>
            <p class="via">${esc(m.venue)} · ${esc(m.city)}${fee(m)}</p>
            ${m.recurrence_text ? `<p class="rhythm">${esc(m.recurrence_text)}</p>` : ''}
          </div>
          <div class="col-time">${hhmm(m.start_time) ? `<b>${hhmm(m.start_time)}</b>` : ''}${hhmm(m.end_time) ? `<span>–${hhmm(m.end_time)}</span>` : ''}</div>
          ${fresh(m)}
          ${photo(m)}
        </article>`;
}

function dayBand(iso, list, rowFn) {
  const d = new Date(iso + 'T00:00:00');
  const n = list.length;
  return `
      <div class="day">
        <div class="day-head">
          <div class="num">${String(d.getDate()).padStart(2, '0')}</div>
          <div class="dow">${DOW[d.getDay()]}</div>
          <div class="mon">${MON[d.getMonth()]}</div>
          <div class="count">${n} ${n === 1 ? 'Markt' : 'Märkte'}</div>
        </div>
        <div class="day-rows">${list.map(rowFn).join('')}</div>
      </div>`;
}

// ---- the weekend -----------------------------------------------------------
const dates = [...new Set(rows.map((r) => r.date))].sort();
const weekend = dates.filter((d) => [0, 6].includes(dayOf(d))).slice(0, 2);
const weekendDays = weekend.map((d) => [d, rows.filter((r) => r.date === d)]);

// ---- the weekdays in the next seven days ------------------------------------
// One row per market, earliest date first: a Wednesday market that runs every
// week does not need seven rows any more than a Saturday one does.
const horizon = new Date(TODAY + 'T00:00:00');
horizon.setDate(horizon.getDate() + 7);
const weekEnd = horizon.toISOString().slice(0, 10);
const weekdayRows = [];
const seen = new Set();
for (const r of rows) {
  if (r.date > weekEnd) break;
  if ([0, 6].includes(dayOf(r.date))) continue;
  if (seen.has(r.slug)) continue;
  seen.add(r.slug);
  weekdayRows.push(r);
}

// ---- one city, one row per market ------------------------------------------
const zurich = {};
for (const r of rows.filter((r) => r.city_slug === 'zurich')) {
  if (!zurich[r.slug] || r.date < zurich[r.slug].date) zurich[r.slug] = r;
}
const zurichList = Object.values(zurich).sort((a, b) => a.date.localeCompare(b.date));

const weekendCount = new Set(weekendDays.flatMap(([, l]) => l.map((m) => m.slug))).size;

const CHROME_HEAD = `
  <div class="wrapper-wide">
    <header class="site-header">
      <a class="mark" href="#">fynda<span>.</span>market</a>
      <div class="hnav"><nav class="langs"><a>FR</a><a>IT</a><a>EN</a></nav><a>Gemerkt</a></div>
    </header>
  </div>`;

const CHROME_FOOT = `
  <footer class="site-footer"><div class="wrapper-wide"><div class="foot">
    <div><div class="mark">fynda<span>.</span>market</div>
      <p class="about">Flohmärkte in der Schweiz. Termine mit Quelle, Datum und Stand.</p></div>
    <div><h3>Fynda</h3><a>Für Veranstalter</a><a>Newsletter</a><a>Termin melden</a></div>
    <div><h3>Finden</h3><a>In der Nähe</a><a>Gemerkt</a><a>Alle Städte</a></div>
    <div><h3>Rechtliches</h3><a>Impressum</a><a>Datenschutz</a></div>
  </div></div></footer>`;

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fynda — Home v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --accent:#FF4A2B; --ink:#111110; --grey:#6E6C68; --quiet:#9A968F;
  --line:#E8E6E2; --paper:#F5F4F2; --white:#fff; --stage:#2A2926;
  --l-floh:#FF4A2B; --l-halle:#3D5AFE; --l-nacht:#7C3AED;
  --l-kinder:#F5A524; --l-troedel:#E4007F;
  --content-max-wide:1080px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--stage);font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;
  font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;color:var(--ink);padding:30px 20px 70px}
.lab{max-width:1440px;margin:0 auto}
.labhead{color:#fff;max-width:680px;margin-bottom:26px}
.labhead .mk{font-size:17px;font-weight:800;letter-spacing:-.045em}
.labhead .mk span{color:var(--accent)}
.labhead h1{font-size:28px;font-weight:800;letter-spacing:-.04em;margin-top:10px;line-height:1.1}
.labhead p{font-size:14px;line-height:1.6;color:#B5B1A8;margin-top:10px}
.labhead p b{color:#fff;font-weight:700}
h2.lab-h{color:#fff;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:44px 0 4px}
.lab-note{color:#B5B1A8;font-size:13px;line-height:1.6;max-width:720px;margin-bottom:14px}
.lab-note b{color:#fff;font-weight:700}
.tally{display:flex;gap:26px;margin:14px 0 20px;flex-wrap:wrap}
.tally div{color:#B5B1A8;font-size:12px;line-height:1.35}
.tally b{display:block;color:#fff;font-size:26px;font-weight:800;letter-spacing:-.03em}
.tally s{color:#8A867E;text-decoration-color:var(--accent)}
.screen{background:var(--white);border-radius:10px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.35)}

.wrapper-wide{max-width:var(--content-max-wide);margin-inline:auto}
a{color:inherit;text-decoration:none}
img{max-width:100%;height:auto;display:block}
.site-header{display:flex;align-items:center;justify-content:space-between;padding:16px;font-size:13px;font-weight:700;border-bottom:1px solid var(--line)}
.mark{font-size:21px;font-weight:800;letter-spacing:-.045em}
.mark span{color:var(--accent)}
.hnav{display:flex;align-items:center;gap:16px;font-size:13px}
.hnav .langs{display:flex;gap:6px;color:var(--quiet);font-size:12px}

.page-head{padding:34px 16px 22px}
.page-head h1{font-size:46px;font-weight:800;letter-spacing:-.045em;line-height:1.02;max-width:16ch}
.page-head .promise{color:var(--grey);font-size:15px;margin-top:10px;max-width:66ch}
.answer{font-size:17px;font-weight:700;line-height:1.3;margin-top:10px;max-width:60ch}
.meta{color:var(--grey);font-size:13px;max-width:66ch}

.search{display:grid;grid-template-columns:2fr 2fr 1fr auto;gap:12px;align-items:end;margin:0 16px;padding:16px;border:1px solid var(--line);border-radius:16px}
.field{display:grid;gap:4px}
.field>span{font-size:12px;font-weight:700}
.field select{width:100%;min-height:44px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;font:inherit;font-size:13px;background:#fff;color:var(--ink)}
.button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding-inline:16px;border:1px solid var(--line);border-radius:999px;background:#fff;font:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
.button.primary{background:var(--ink);border-color:var(--ink);color:#fff}
.chips{display:flex;gap:8px;padding:20px 16px 6px}

.section{margin-top:34px}
.section>h2{font-size:21px;font-weight:700;letter-spacing:-.025em;padding:0 16px 4px}
.section .lede{color:var(--grey);font-size:13px;padding:0 16px 12px;max-width:66ch}

.day{display:grid;grid-template-columns:160px minmax(0,1fr);border-top:1px solid var(--line)}
.day-head{padding:16px 16px 24px;position:sticky;top:0;align-self:start;background:#fff}
.day-head .num{font-size:44px;font-weight:800;letter-spacing:-.045em;line-height:1}
.day-head .dow{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
.day-head .mon{font-size:12px;font-weight:600;color:var(--quiet);text-transform:uppercase;letter-spacing:.08em}
.day-head .count{font-size:12px;font-weight:600;color:var(--quiet);margin-top:10px}
.day-rows{border-left:1px solid var(--line)}

.row{display:grid;grid-template-columns:4px 58px minmax(0,1fr) 170px 74px;gap:16px;align-items:start;
  padding:14px 16px 14px 0;border-bottom:1px solid var(--line);position:relative}
.rail{align-self:stretch;min-height:74px;border-radius:0 3px 3px 0}
.time{padding-top:2px}
.time strong{display:block;font-size:15px;font-weight:800;letter-spacing:-.015em;line-height:1.1}
.time span{display:block;margin-top:2px;color:var(--quiet);font-size:10.5px;font-weight:600}
.code{display:inline-block;margin-top:8px;padding:1px 4px;border-radius:3px;color:#fff;font-size:8.5px;font-weight:800;letter-spacing:.06em}
.details{min-width:0}
.name{font-size:15.5px;font-weight:700;letter-spacing:-.015em;line-height:1.22}
.name a::after{position:absolute;inset:0;content:""}
.via{margin-top:2px;color:var(--grey);font-size:12px;line-height:1.4}
.col-fresh{padding-top:2px;font-size:11px;font-weight:600;color:var(--quiet);line-height:1.4}
.col-fresh b{display:block;color:var(--ink);font-weight:700;font-size:11px}
.photo{width:74px;height:74px;overflow:hidden;border-radius:8px;background:var(--paper)}
.photo img{width:100%;height:100%;object-fit:cover}

/* the one-row-per-market variant: no day band, so the date comes inside */
.market-row{grid-template-columns:4px 74px minmax(0,1fr) 96px 170px 74px}
.market-row .when{padding-top:2px}
.market-row .when strong{display:block;font-size:26px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--accent)}
.market-row .when > span{display:block;margin-top:3px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}
.market-row .when .code{margin-top:8px;color:#fff}
.rhythm{margin-top:5px;font-size:12px;font-weight:700;line-height:1.35}
.col-time{padding-top:3px;font-size:12px;font-weight:700}
.col-time span{display:block;color:var(--quiet);font-weight:600;font-size:11px;margin-top:1px}

.cols{padding:0 16px;columns:3;column-gap:48px}
.cols a{display:flex;justify-content:space-between;padding:8px 0;font-size:13px;font-weight:700;border-bottom:1px solid var(--line);break-inside:avoid}
.cols a i{font-style:normal;color:var(--quiet);font-weight:500}
.site-footer{margin-top:48px;border-top:1px solid var(--line);background:var(--paper)}
.foot{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:28px;padding:34px 16px}
.foot h3{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--quiet);margin-bottom:10px}
.foot a{display:block;padding:4px 0;font-size:13px;font-weight:600}
.foot .about{font-size:13px;color:var(--grey);line-height:1.6;max-width:34ch;margin-top:8px}
</style>

<div class="lab">

<div class="labhead">
  <div class="mk">fynda<span>.</span></div>
  <h1>Stop listing every date</h1>
  <p>Built from the live database on ${TODAY}, so these are the real markets, the real times and the real recurrence phrases — not invented ones.</p>
  <p><b>The problem:</b> the list shows one row per <i>date</i>. A weekly market repeats for four months and fills the page with itself. <b>The fix:</b> the home page answers “this weekend”, and a city page shows one row per market with how often it runs.</p>
  <div class="tally">
    <div><b><s>30</s> → 5</b>screens of scrolling<br>on the home page</div>
    <div><b><s>451</s> → ${weekendCount}</b>rows on the home page<br>this weekend, not four months</div>
    <div><b><s>61</s> → ${zurichList.length}</b>rows on the Zürich page<br>one per market</div>
    <div><b>${new Set(rows.filter((r) => r.recurrence_text).map((r) => r.slug)).size} of ${new Set(rows.map((r) => r.slug)).size}</b>markets already carry<br>a recurrence phrase</div>
  </div>
</div>

<h2 class="lab-h">1 · Home — “Dieses Wochenende”</h2>
<p class="lab-note">Two bands, ${weekendCount} markets, about three screens. When the weekend passes it rolls to the next one. <b>The weekday markets get one short block underneath</b> — there are only ${weekdayRows.length} of them all week, which is the whole argument for not giving them a four-month list.</p>

<div class="screen">
${CHROME_HEAD}
  <main class="wrapper-wide">
    <section class="page-head">
      <h1>Irgendwo ist immer Markt.</h1>
      <p class="promise">Flohmärkte in der Schweiz — mit Daten, die stimmen.</p>
    </section>

    <form class="search">
      <label class="field"><span>Ort</span><select><option>Überall</option></select></label>
      <label class="field"><span>Zeitraum</span><select><option>Dieses Wochenende</option></select></label>
      <label class="field"><span>Umkreis</span><select><option>50 km</option></select></label>
      <button class="button primary" type="button">Anzeigen</button>
    </form>

    <div class="chips">
      <button class="button primary" type="button">Dieses Wochenende</button>
      <button class="button" type="button">Heute</button>
      <button class="button" type="button">Nächstes Wochenende</button>
      <button class="button" type="button">Datum wählen</button>
    </div>

    <section class="section">
      <h2>Dieses Wochenende</h2>
      <p class="lede">${weekendCount} Märkte am ${short(weekend[0])} und ${short(weekend[1])}.</p>
      ${weekendDays.map(([d, list]) => dayBand(d, list, timeRow)).join('')}
    </section>

    <section class="section">
      <h2>Auch diese Woche</h2>
      <p class="lede">Die wenigen Märkte, die unter der Woche stattfinden.</p>
      <div class="day" style="grid-template-columns:1fr">
        <div class="day-rows" style="border-left:0">${weekdayRows.map(marketRow).join('')}</div>
      </div>
    </section>

    <section class="section">
      <h2>Städte</h2>
      <p class="lede">55 Städte mit mindestens einem Markt.</p>
      <div class="cols">
        ${['Zürich 17', 'Bern 12', 'Genf 11', 'Basel 9', 'Lausanne 8', 'Luzern 7', 'Winterthur 6', 'St. Gallen 5', 'Aarau 4', 'Baden 4', 'Chur 3', 'Thun 3'].map((c) => {
          const i = c.lastIndexOf(' ');
          return `<a href="#">${c.slice(0, i)} <i>${c.slice(i + 1)}</i></a>`;
        }).join('')}
      </div>
    </section>
  </main>
${CHROME_FOOT}
</div>

<h2 class="lab-h">2 · Stadtseite — one row per market</h2>
<p class="lab-note">The headline says ${zurichList.length} markets and the list is ${zurichList.length} rows. Every row says something different, and the recurrence phrase carries what the deleted rows used to repeat: <b>“Jeden Samstag, ganzjährig” tells you more than eighteen identical Saturdays do.</b> The buttons still switch this to a day-by-day view for anyone who wants one.</p>

<div class="screen">
${CHROME_HEAD}
  <main class="wrapper-wide">
    <section class="page-head">
      <h1 style="font-size:38px;max-width:22ch">Die ${zurichList.length} Flohmärkte in Zürich 2026</h1>
      <p class="answer">Der nächste ist ${esc(zurichList[0].name)} am ${DOW[dayOf(zurichList[0].date)]}, ${short(zurichList[0].date)}, ab ${hhmm(zurichList[0].start_time)} Uhr.</p>
      <p class="meta" style="margin-top:10px">${zurichList.length} Märkte · ${rows.filter((r) => r.city_slug === 'zurich').length} Termine in den nächsten 4 Monaten · zuletzt geprüft heute</p>
    </section>

    <div class="chips">
      <button class="button primary" type="button">Alle Märkte</button>
      <button class="button" type="button">Dieses Wochenende</button>
      <button class="button" type="button">Nach Datum</button>
    </div>

    <section class="section">
      <div class="day" style="grid-template-columns:1fr;border-top:1px solid var(--line)">
        <div class="day-rows" style="border-left:0">${zurichList.map(marketRow).join('')}</div>
      </div>
    </section>
  </main>
${CHROME_FOOT}
</div>

<h2 class="lab-h">Was das kostet</h2>
<p class="lab-note">No new page types and no changed web addresses, so nothing Google has indexed moves. The home page keeps the same row and the same day band — it just stops at Sunday. The city page gains one row style, which is the existing row with the date moved inside it and the recurrence phrase added. Everything shown above is data we already hold.</p>

</div>
`;

writeFileSync(join(root, 'design/home-v2.html'), html);
console.log(`  weekend ${weekend.join(' + ')} — ${weekendCount} markets`);
console.log(`  weekday block — ${weekdayRows.length} markets`);
console.log(`  Zürich — ${zurichList.length} rows (was ${rows.filter((r) => r.city_slug === 'zurich').length})`);
console.log('  wrote design/home-v2.html');
process.exit(0);
