"""
Builds the fynda.market dashboards in the local Metabase (metabase/README.md).

Re-runnable: it deletes everything in the "fynda.market" collection and
builds it again, so a change is a change here, not a click in Metabase.
Needs a Metabase session for the helper user: METABASE_SESSION in .env.local
(how to get one is in the README).

    python metabase/dashboards.py

What it builds, 2026-09-17: five dashboards, ~45 questions, all plain SQL
against the views metabase_ro may read. Dashboards 1 and 2 carry a "Bots"
filter bound to analytics_events_classified.bot_likely, default false, so
they show people; true shows the bots; cleared shows everything.
"""
import json, os, re, sys, uuid, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = dict(re.findall(r'^([A-Z_]+)=(.*)$', open(os.path.join(ROOT, '.env.local'), encoding='utf-8').read(), re.M))
tok = os.environ.get('METABASE_SESSION') or env.get('METABASE_SESSION')
if not tok: raise SystemExit('METABASE_SESSION missing in .env.local')

def api(path, method='GET', body=None):
    r = urllib.request.Request('http://localhost:3000/api' + path,
                               data=json.dumps(body).encode() if body is not None else None, method=method,
                               headers={'Content-Type': 'application/json', 'X-Metabase-Session': tok})
    try:
        b = urllib.request.urlopen(r).read(); return json.loads(b) if b else None
    except urllib.error.HTTPError as e:
        raise SystemExit(f'{method} {path} -> {e.code}: {e.read()[:600]}')

# The bot flag field, as Metabase numbers it after a sync. Looked up by name
# so a re-sync that renumbers fields does not break the filter.
md = api('/database/2/metadata')
BOT_FIELD = next(f['id'] for t in md['tables'] if t['name'] == 'analytics_events_classified' for f in t['fields'] if f['name'] == 'bot_likely')

cols = api('/collection'); col = next((c for c in cols if c.get('name') == 'fynda.market'), None)
if not col: col = api('/collection', 'POST', {'name': 'fynda.market', 'description': 'Built by metabase/dashboards.py.'})
CID = col['id']
# wipe earlier builds so this script can be re-run
for c in api(f'/collection/{CID}/items?models=card')['data']: api(f"/card/{c['id']}", 'DELETE')
for d in api(f'/collection/{CID}/items?models=dashboard')['data']: api(f"/dashboard/{d['id']}", 'DELETE')

E = "analytics_events_classified"
def tag():
    return {'id': str(uuid.uuid4()), 'name': 'bots', 'display-name': 'Bots', 'type': 'dimension',
            'dimension': ['field', BOT_FIELD, None], 'widget-type': 'boolean/=', 'default': [False]}

def card(name, sql, display='table', desc='', viz=None, bots=False):
    tags = {'bots': tag()} if bots else {}
    r = api('/card', 'POST', {'name': name, 'description': desc or None, 'collection_id': CID, 'display': display,
                                 'visualization_settings': viz or {},
                                 'dataset_query': {'type': 'native', 'database': 2,
                                                   'native': {'query': sql, 'template-tags': tags}}})
    r['_bots'] = bots; return r

def dashboard(name, desc, cards, bots_filter):
    params = [{'id': 'bots', 'name': 'Bots', 'slug': 'bots', 'type': 'boolean/=', 'default': [False]}] if bots_filter else []
    d = api('/dashboard', 'POST', {'name': name, 'description': desc, 'collection_id': CID, 'parameters': params})
    dcs = []; row = 0; col_ = 0; i = -1; lasth = 0
    for c, (w, h) in cards:
        if col_ + w > 24: row += lasth; col_ = 0
        dc = {'id': i, 'card_id': c['id'], 'row': row, 'col': col_, 'size_x': w, 'size_y': h, 'parameter_mappings': []}
        if bots_filter and c['_bots']:
            dc['parameter_mappings'] = [{'parameter_id': 'bots', 'card_id': c['id'], 'target': ['dimension', ['template-tag', 'bots']]}]
        dcs.append(dc); col_ += w; lasth = max(lasth, h) if col_ != w else h; i -= 1
    api(f"/dashboard/{d['id']}", 'PUT', {'dashcards': dcs, 'parameters': params})
    print('dashboard', d['id'], name, len(dcs), 'cards'); return d

B = " and {{bots}}"
SRC = "coalesce(referrer_host,'(direct / unknown)')"
STACK = {'stackable.stack_type': 'stacked'}

# ---------- 1. Visitors ----------
v = [
 (card('Real people, last 7 days', f"select count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and occurred_at > now()-interval '7 days'{B}", 'scalar', 'Distinct visitors in the last 7 days. A visitor is counted once per day.', bots=True), (6, 4)),
 (card('Page views, last 7 days', f"select count(*) as views from {E} where event_name='page_view' and occurred_at > now()-interval '7 days'{B}", 'scalar', bots=True), (6, 4)),
 (card('Yesterday: people', f"select count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and occurred_at::date = current_date-1{B}", 'scalar', bots=True), (6, 4)),
 (card('Yesterday: views', f"select count(*) as views from {E} where event_name='page_view' and occurred_at::date = current_date-1{B}", 'scalar', bots=True), (6, 4)),
 (card('People per day', f"select occurred_at::date as day, count(distinct visitor_day_hash) as people from {E} where event_name='page_view'{B} group by 1 order by 1", 'line', 'One person = one visitor hash per day.', bots=True), (12, 6)),
 (card('Page views per day', f"select occurred_at::date as day, count(*) as views from {E} where event_name='page_view'{B} group by 1 order by 1", 'line', bots=True), (12, 6)),
 (card('Where they are (country, 30 days)', f"select coalesce(country,'?') as country, count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc limit 12", 'row', bots=True), (8, 6)),
 (card('Phone or desktop (30 days)', f"select device_class, count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc", 'pie', bots=True), (8, 6)),
 (card('Site language (30 days)', f"select coalesce(locale,'?') as language, count(*) as views from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc", 'pie', bots=True), (8, 6)),
 (card('Where they come from (30 days)', f"select {SRC} as source, count(distinct visitor_day_hash) as people, count(*) as views from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc limit 15", 'table', 'Google shows as www.google.com. "direct / unknown" is a typed address, a bookmark, an app, or a browser that sends nothing.', bots=True), (12, 6)),
 (card('Hour of day (Swiss time, 30 days)', f"select extract(hour from occurred_at at time zone 'Europe/Zurich')::int as hour, count(*) as views from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B} group by 1 order by 1", 'bar', bots=True), (12, 6)),
 (card('Cookie choice (30 days)', f"select case consent_state when 'granted' then 'Accepted' else 'Only essential / no choice yet' end as choice, count(distinct visitor_day_hash) as people from {E} where occurred_at > now()-interval '30 days'{B} group by 1", 'pie', 'How many accepted the cookie. Only accepted visitors can be recognised across days.', bots=True), (8, 6)),
 (card('Returning people (accepted cookie, 30 days)', f"select count(distinct visitor_id) as people_seen_on_2plus_days from (select visitor_id from {E} where visitor_id is not null and occurred_at > now()-interval '30 days'{B} group by 1 having count(distinct occurred_at::date) > 1) t", 'scalar', bots=True), (8, 6)),
 (card('Views per person per day (30 days)', f"select round(count(*)::numeric / nullif(count(distinct (visitor_day_hash, occurred_at::date)),0), 2) as views_per_person from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B}", 'scalar', bots=True), (8, 6)),
]
dashboard('1 - Visitors', 'Who comes to fynda.market. The Bots filter is false by default: people only. Set it to true to see only bots, or clear it to see everything.', v, True)

# ---------- 2. Pages & markets ----------
LEADS = "count(*) filter (where event_name='market_save') as saves, count(*) filter (where event_name='calendar_add') as calendar_adds, count(*) filter (where event_name='outbound_click') as outbound_clicks, count(*) filter (where event_name='organiser_contact') as contacts"
p = [
 (card('Views by page type per day', f"select occurred_at::date as day, coalesce(page_type,'?') as page_type, count(*) as views from {E} where event_name='page_view'{B} group by 1,2 order by 1", 'area', 'market = a market page, city = a town page, region = a canton page, utility = forms and legal pages.', STACK, bots=True), (24, 7)),
 (card('Top pages (30 days)', f"select path, count(*) as views, count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc limit 25", 'table', bots=True), (12, 8)),
 (card('Top markets (30 days)', f"select regexp_replace(path, '^/[a-z]{{2}}/[^/]+/', '') as market_page, count(*) as views, count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and page_type='market' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc limit 25", 'table', 'Market pages by views. Page views carry no market id yet, so the name is the page address: the slug in that language.', bots=True), (12, 8)),
 (card('Leads per market (30 days)', f"select m.slug as market, {LEADS}, count(*) as total from {E} join publishable_markets m on m.id = {E}.market_id where event_name in ('market_save','calendar_add','outbound_click','organiser_contact') and occurred_at > now()-interval '30 days'{B} group by 1 order by total desc limit 25", 'table', 'A lead is a sign someone means to go: saved it, added the date to a calendar, clicked through to the map or organiser, or contacted the organiser. What organisers will be shown.', bots=True), (12, 8)),
 (card('What people do (30 days)', f"select event_name as action, count(*) as times from {E} where event_name <> 'page_view' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc", 'row', bots=True), (12, 8)),
 (card('Outbound clicks by type (30 days)', f"select props->>'click_type' as click_type, count(*) as clicks from {E} where event_name='outbound_click' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc", 'bar', bots=True), (8, 6)),
 (card('Filters people use (30 days)', f"select props->>'filter' as filter, props->>'value' as value, count(*) as times from {E} where event_name='filter_changed' and occurred_at > now()-interval '30 days'{B} group by 1,2 order by 3 desc limit 20", 'table', bots=True), (8, 6)),
 (card('Searches with no results (90 days)', f"select coalesce(locale,'?') as language, props->>'term' as searched_for, count(*) as times from {E} where event_name='no_results' and occurred_at > now()-interval '90 days'{B} group by 1,2 order by 3 desc limit 30", 'table', 'The gap map: what people looked for and did not find. Towns and market types to add.', bots=True), (8, 6)),
 (card('Where on the page markets get clicked (30 days)', f"select props->>'surface' as surface, count(*) as clicks, round(avg((props->>'position')::numeric),1) as avg_position from {E} where event_name='market_click' and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc", 'table', 'weekend_rail = the weekend strip on the home page; list = the main list.', bots=True), (12, 5)),
 (card('Newsletter: form seen vs submitted (30 days)', f"select count(*) filter (where event_name='newsletter_form_view') as form_seen, count(*) filter (where event_name='newsletter_submit') as submitted from {E} where occurred_at > now()-interval '30 days'{B}", 'table', bots=True), (12, 5)),
]
dashboard('2 - Pages & markets', 'What people look at and do. Same Bots filter as dashboard 1.', p, True)

# ---------- 3. Bots & AI ----------
AI = "('chatgpt.com','chat.openai.com','perplexity.ai','www.perplexity.ai','claude.ai','gemini.google.com','copilot.microsoft.com','you.com','poe.com','meta.ai','deepseek.com','chat.deepseek.com','grok.com','x.ai')"
AIW = f"(referrer_host in {AI} or utm_source in ('chatgpt.com','perplexity','openai'))"
b = [
 (card('People vs bots per day', "select day, case when bot_likely then 'bots' else 'people' end as who, count(*) as visitors from analytics_visitor_days group by 1,2 order by 1", 'bar', 'Every visitor-day gets a verdict: bot or person. The rules are in supabase/migrations/20260917100000_analytics_bot_flag.sql.', STACK), (24, 7)),
 (card('Share of views that were bots (30 days)', f"select round(100.0 * count(*) filter (where bot_likely) / nullif(count(*),0), 1) as bot_percent from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'", 'scalar'), (6, 4)),
 (card('Bot visitors (30 days)', "select count(*) as bot_visitor_days from analytics_visitor_days where bot_likely and day > current_date-30", 'scalar'), (6, 4)),
 (card('Bots by country (30 days)', "select coalesce(country,'?') as country, count(*) as bot_visitor_days from analytics_visitor_days where bot_likely and day > current_date-30 group by 1 order by 2 desc limit 12", 'row'), (12, 6)),
 (card('What bots crawl (page type, 30 days)', f"select coalesce(page_type,'?') as page_type, count(*) as bot_views from {E} where bot_likely and event_name='page_view' and occurred_at > now()-interval '30 days' group by 1 order by 2 desc", 'bar'), (12, 6)),
 (card('Paths bots hit most (30 days)', f"select path, count(*) as bot_views, count(distinct visitor_day_hash) as bot_visitors from {E} where bot_likely and event_name='page_view' and occurred_at > now()-interval '30 days' group by 1 order by 2 desc limit 20", 'table'), (12, 7)),
 (card('Visits sent by AI assistants', f"select occurred_at::date as day, coalesce(referrer_host, utm_source) as ai_assistant, count(*) as visits from {E} where {AIW} and event_name='page_view' group by 1,2 order by 1 desc", 'table', 'A person asked ChatGPT, Perplexity, Claude or another assistant, and it linked to us. Google AI Overviews cannot be told apart from normal Google and are not here.'), (12, 7)),
 (card('AI assistant visits per week', f"select date_trunc('week', occurred_at)::date as week, count(*) as visits from {E} where {AIW} and event_name='page_view' group by 1 order by 1", 'bar'), (12, 6)),
 (card('AI crawlers reading our pages', "select 'Not collected yet' as status, 'GPTBot, ClaudeBot, PerplexityBot and the rest are currently dropped at the edge. Storing them in their own table is step 4 of the analytics build plan.' as note", 'table', 'Placeholder until crawler_hits exists.'), (12, 6)),
]
dashboard('3 - Bots & AI', 'The machines: scrapers we flag, and the AI assistants that send people to us.', b, False)

# ---------- 4. Google ----------
g = [
 (card('Clicks from Google per day', "select day, sum(clicks) as clicks from search_console_daily group by 1 order by 1", 'line', 'From Search Console. Imported by hand with scripts/import-gsc.mjs; the chart ends where the last import ended.'), (12, 6)),
 (card('Impressions per day', "select day, sum(impressions) as impressions from search_console_daily group by 1 order by 1", 'line', 'How often a fynda.market page appeared in Google results.'), (12, 6)),
 (card('Average position per day', "select day, round(sum(position*impressions)/nullif(sum(impressions),0), 1) as avg_position from search_console_daily group by 1 order by 1", 'line', 'Lower is better. 1 = top of the page, 10 = bottom of page one.'), (12, 6)),
 (card('Clicks by page type', "select coalesce(page_type,'?') as page_type, sum(clicks) as clicks, sum(impressions) as impressions from search_console_daily group by 1 order by 2 desc", 'bar'), (12, 6)),
 (card('Top search queries', "select query, sum(clicks) as clicks, sum(impressions) as impressions, round(sum(position*impressions)/nullif(sum(impressions),0),1) as avg_position from search_console_daily where query is not null group by 1 order by 3 desc limit 30", 'table', 'What people typed into Google before seeing us.'), (12, 8)),
 (card('Top pages in Google', "select page, sum(clicks) as clicks, sum(impressions) as impressions, round(sum(position*impressions)/nullif(sum(impressions),0),1) as avg_position from search_console_daily where page is not null group by 1 order by 3 desc limit 30", 'table'), (12, 8)),
 (card('Seen a lot, clicked little', "select query, sum(impressions) as impressions, sum(clicks) as clicks, round(sum(position*impressions)/nullif(sum(impressions),0),1) as avg_position from search_console_daily where query is not null group by 1 having sum(impressions) >= 50 and sum(clicks) = 0 order by 2 desc limit 30", 'table', 'Queries where Google shows us but nobody clicks: the title or the page is wrong for what they wanted.'), (12, 8)),
 (card('Last import', "select * from search_console_last_two_imports", 'table'), (12, 4)),
]
dashboard('4 - Google', 'How Google sends people. Data comes from Search Console exports, not from the site.', g, False)

# ---------- 5. Organisers & newsletter ----------
o = [
 (card('Open reports (waiting for you)', "select sent, waiting_days, report_type, market, they_typed, note, locale from open_reports order by sent", 'table', 'Visitor reports not yet handled.'), (24, 6)),
 (card('Open organiser claims (waiting for you)', "select sent, waiting_days, organiser_name, market, town, they_typed, locale from open_organiser_claims order by sent", 'table'), (24, 6)),
 (card('Organiser mail funnel by week', "select week, kind, mails, answered, said_on, said_cancelled, said_changed from organiser_funnel order by week desc", 'table', 'The number that decides the organiser strategy after four weeks: answered divided by mails.'), (12, 6)),
 (card('Newsletter issues', "select issue_date, sent, delivered, opened, clicked, bounced, complained from newsletter_delivery order by issue_date desc", 'table', 'Opens undercount: mail apps that block images never register one.'), (12, 6)),
]
dashboard('5 - Organisers & newsletter', 'The queues and the two mail loops.', o, False)
print('done')
