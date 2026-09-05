#!/usr/bin/env node
/**
 * Builds design/row-v3.html — the list row, now and proposed, on live data.
 *
 *   node design/build-row-v3.mjs
 *
 * The same eight Zürich markets are rendered twice so the two can be compared
 * without arguing about the content. Deliberately low-detail: this is about
 * weight and spacing, not about polish.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../scripts/db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = new Date().toISOString().slice(0, 10);

const rows = await query(`
  select coalesce(nm.value,p.slug) as name, p.kind, tc.value as city, v.name as venue,
         m.entry_fee, m.image_url, m.recurrence_text,
         o.date::text as date, o.start_time::text as start_time, o.end_time::text as end_time,
         o.confirmed_at::text as confirmed_at
    from publishable_markets p
    join markets m on m.id=p.id
    join venues v on v.id=p.venue_id
    join texts tc on tc.entity_type='city' and tc.entity_id=p.city_id and tc.locale='de' and tc.field='name'
    join slugs sc on sc.entity_type='city' and sc.entity_id=p.city_id and sc.locale='de' and sc.is_current
    left join texts nm on nm.entity_type='market' and nm.entity_id=p.id and nm.locale='de' and nm.field='name'
    join occurrences o on o.market_id=p.id
   where o.date >= $1 and sc.slug = 'zurich'
   order by o.date, o.start_time nulls last`, [TODAY]);

const first = new Map();
for (const r of rows) if (!first.has(r.name)) first.set(r.name, r);
const list = [...first.values()].slice(0, 8);

const LINE = { flohmarkt: ['FM', '--l-floh'], hallenflohmarkt: ['HA', '--l-halle'],
  nachtflohmarkt: ['NA', '--l-nacht'], kinderflohmarkt: ['KI', '--l-kinder'],
  troedelmarkt: ['TR', '--l-troedel'] };
const DOW = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MON = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const hhmm = (t) => (t ? t.slice(0, 5) : '');
const d = (iso) => new Date(iso + 'T00:00:00');
const short = (iso) => `${Number(iso.slice(8, 10))}. ${MON[Number(iso.slice(5, 7)) - 1]}`;
const img = (m) => m.image_url
  ? `<div class="photo"><img src="https://fynda.market${esc(m.image_url).replace(/\.webp$/, '-thumb.webp')}" alt="" loading="lazy"></div>`
  : `<div class="photo"></div>`;

const dateCell = (m) => {
  const [code, token] = LINE[m.kind] ?? LINE.flohmarkt;
  return `<div class="when">
        <strong>${String(d(m.date).getDate()).padStart(2, '0')}</strong>
        <span>${DOW[d(m.date).getDay()]} ${MON[d(m.date).getMonth()]}</span>
        <span class="code" style="background:var(${token})">${code}</span>
      </div>`;
};
const rail = (m) => `<i class="rail" style="background:var(${(LINE[m.kind] ?? LINE.flohmarkt)[1]})"></i>`;
const hours = (m) => hhmm(m.start_time) ? `<p class="hours">${hhmm(m.start_time)}${m.end_time ? `<span>–${hhmm(m.end_time)}</span>` : ''}</p>` : '<p class="hours"></p>';
const fresh = (m) => `<div class="col-fresh"><b>Bestätigt</b>${m.confirmed_at ? short(m.confirmed_at.slice(0, 10)) : '—'}</div>`;

/* ---- now: three lines, two of them bold black, city and "frei" on every one */
const rowNow = (m) => `
    <article class="row now">
      ${rail(m)}${dateCell(m)}
      <div class="details">
        <h3 class="name">${esc(m.name)}</h3>
        <p class="via">${esc(m.venue)} · ${esc(m.city)}${m.entry_fee === 0 ? ' · frei' : m.entry_fee ? ` · ${m.entry_fee} CHF` : ''}</p>
        ${m.recurrence_text ? `<p class="rhythm">${esc(m.recurrence_text)}</p>` : ''}
      </div>
      ${hours(m)}${fresh(m)}${img(m)}
    </article>`;

/* ---- proposed: one loud thing, a descending staircase, nothing repeated */
const rowNext = (m) => `
    <article class="row next">
      ${rail(m)}${dateCell(m)}
      <div class="details">
        <h3 class="name">${esc(m.name)}</h3>
        ${m.recurrence_text ? `<p class="rhythm">${esc(m.recurrence_text)}</p>` : ''}
        <p class="via">${esc(m.venue)}${m.entry_fee > 0 ? ` · ${m.entry_fee} CHF` : ''}</p>
      </div>
      ${hours(m)}${fresh(m)}${img(m)}
    </article>`;

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fynda — Row v3</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --accent:#FF4A2B; --ink:#111110; --grey:#6E6C68; --quiet:#9A968F;
  --line:#E8E6E2; --paper:#F5F4F2; --stage:#2A2926;
  --l-floh:#FF4A2B; --l-halle:#3D5AFE; --l-nacht:#7C3AED; --l-kinder:#F5A524; --l-troedel:#E4007F;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--stage);color:var(--ink);padding:34px 20px 80px;
  font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
.lab{max-width:1200px;margin:0 auto}
.labhead{color:#fff;max-width:640px}
.labhead .mk{font-size:17px;font-weight:800;letter-spacing:-.045em}
.labhead .mk span{color:var(--accent)}
.labhead h1{font-size:28px;font-weight:800;letter-spacing:-.04em;margin-top:10px;line-height:1.1}
.labhead p{font-size:14px;line-height:1.6;color:#B5B1A8;margin-top:10px}
.labhead p b{color:#fff;font-weight:700}
h2.lab-h{color:#fff;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:40px 0 6px}
.lab-note{color:#B5B1A8;font-size:13px;line-height:1.6;max-width:680px;margin-bottom:14px}
.lab-note b{color:#fff;font-weight:700}
.panel{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.35)}
.pad{padding:8px 20px 20px}

/* ---------- shared row skeleton (identical in both) ---------- */
.row{display:grid;grid-template-columns:4px 78px minmax(0,1fr) 120px 150px 92px;
  gap:18px;align-items:start;padding:18px 0 18px 0;border-bottom:1px solid var(--line);position:relative}
.rail{align-self:stretch;min-height:74px;border-radius:0 3px 3px 0}
.when strong{display:block;font-size:26px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--accent)}
.when > span{display:block;margin-top:4px;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}
.code{display:inline-block;margin-top:9px;padding:1px 5px;border-radius:3px;color:#fff;font-size:9px;font-weight:800;letter-spacing:.06em}
.details{min-width:0}
.name{font-size:19px;font-weight:700;letter-spacing:-.015em;line-height:1.2}
.hours{font-size:13px;font-weight:700;color:var(--grey);padding-top:3px}
.hours span{color:var(--quiet);font-weight:600}
.col-fresh{padding-top:3px;font-size:12px;font-weight:600;color:var(--quiet);line-height:1.4}
.col-fresh b{display:block;color:var(--ink);font-weight:700}
.photo{width:92px;height:74px;overflow:hidden;border-radius:8px;background:var(--paper)}
.photo img{width:100%;height:100%;object-fit:cover}

/* ---------- NOW: two black bold lines, city and "frei" on every row ---------- */
.now .via{margin-top:4px;color:var(--grey);font-size:14px;line-height:1.4}
.now .rhythm{margin-top:5px;font-size:14px;font-weight:700;color:var(--ink);line-height:1.4}

/* ---------- PROPOSED: three distinct weights, descending ---------- */
.next{padding:22px 0}
.next .name{font-size:20px}
.next .rhythm{margin-top:7px;font-size:14px;font-weight:600;color:var(--grey);line-height:1.4}
.next .via{margin-top:4px;font-size:13px;font-weight:400;color:var(--quiet);line-height:1.4}

.legend{display:flex;gap:22px;flex-wrap:wrap;margin:10px 0 0}
.legend div{color:#B5B1A8;font-size:12px;line-height:1.4}
.legend b{display:block;color:#fff;font-size:22px;font-weight:800;letter-spacing:-.03em}
</style>

<div class="lab">
<div class="labhead">
  <div class="mk">fynda<span>.</span></div>
  <h1>The row — where do you look?</h1>
  <p>The same eight Zürich markets, from the live database, rendered twice. Low detail on purpose: this is about <b>weight and space</b>, not polish.</p>
  <div class="legend">
    <div><b>151 / 157</b>markets are free, so<br>“frei” is not information</div>
    <div><b>14 / 14</b>rows on the Zürich page<br>say “Zürich”</div>
    <div><b>2</b>bold black lines per row<br>competing to be read first</div>
  </div>
</div>

<h2 class="lab-h">Now</h2>
<p class="lab-note">Three lines. The name is bold black — and so is the rhythm underneath it, so the eye has two winners and picks neither. Between them sits the least important thing on the row, at a louder weight than the rhythm: <b>the venue, plus the city you already know, plus a price that 96% of markets share.</b></p>
<div class="panel"><div class="pad">${list.map(rowNow).join('')}</div></div>

<h2 class="lab-h">Proposed</h2>
<p class="lab-note"><b>One loud thing: the name.</b> Then a staircase down — the rhythm in grey medium, the venue quieter still. Three weights, no ties, so there is one place to land and a clear order to read in.<br><br><b>Two things deleted.</b> The city, because the page is the city. The word “frei”, because it is true of 151 of 157 markets — a price now appears <i>only</i> when there is one, which is the whole rule: <b>say the exception, not the rule.</b><br><br>Same information order as the decision: which market → how often can I go → where exactly. Plus the row breathes, because there is less in it.</p>
<div class="panel"><div class="pad">${list.map(rowNext).join('')}</div></div>

<h2 class="lab-h">What it costs</h2>
<p class="lab-note">Three CSS lines and one deletion. No new components, no data, no changed web addresses. The same rule then applies everywhere a list appears — home, canton, radius, saved.</p>
</div>
`;

writeFileSync(join(root, 'design/row-v3.html'), html);
console.log(`  ${list.length} Zürich markets, both versions — design/row-v3.html`);
process.exit(0);
