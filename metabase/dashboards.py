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
v += [
 (card('Towns (30 days)', f"select coalesce(city,'?') as town, coalesce(region_code,'?') as canton, count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and occurred_at > now()-interval '30 days'{B} group by 1,2 order by 3 desc limit 25", 'table', 'Where the connection is, town by town. Collected since 2026-09-17.', bots=True), (12, 8)),
 (card('Browser language vs page language (30 days)', f"select coalesce(browser_lang,'?') as browser_speaks, coalesce(locale,'?') as page_language, count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and occurred_at > now()-interval '30 days' and browser_lang is not null{B} group by 1,2 order by 3 desc limit 16", 'table', 'A French-speaking browser on a German page means the language switch was not found, or Google sent them to the wrong one.', bots=True), (12, 8)),
 (card('Bounce rate (30 days)', "select round(100.0 * count(*) filter (where bounced) / nullif(count(*),0), 1) as bounce_percent from analytics_sessions where started_at > now()-interval '30 days' and not bot_likely", 'scalar', 'Share of sittings that saw one page only. A person who found the market and left is a bounce and a success; read it with time on page.'), (6, 4)),
 (card('Pages per sitting (30 days)', "select round(avg(page_views), 2) as pages_per_session from analytics_sessions where started_at > now()-interval '30 days' and not bot_likely", 'scalar'), (6, 4)),
 (card('Sittings per day', "select started_at::date as day, count(*) as sessions from analytics_sessions where not bot_likely group by 1 order by 1", 'line', 'A sitting = the same visitor with no 30-minute gap. No cookie needed.'), (12, 4)),
 (card('Landing pages (30 days)', "select landing_page_type as page_type, landing_path, count(*) as sessions, round(100.0 * count(*) filter (where bounced) / count(*), 0) as bounce_percent from analytics_sessions where started_at > now()-interval '30 days' and not bot_likely group by 1,2 order by 3 desc limit 20", 'table', 'The first page of each sitting: where Google drops people.'), (12, 8)),
 (card('Page to page (30 days)', f"select prev_path as from_page, path as to_page, count(*) as times from {E} where event_name='page_view' and prev_path is not null and occurred_at > now()-interval '30 days'{B} group by 1,2 order by 3 desc limit 25", 'table', 'The most common next click, page by page.', bots=True), (12, 8)),
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
 (card('Robots by name (30 days)', "select bot_name, bot_role, count(*) as hits, count(distinct path) as pages from crawler_hits where occurred_at > now()-interval '30 days' group by 1,2 order by 3 desc limit 30", 'table', 'Every robot the edge caught, since 2026-09-17. training = reads pages to train an AI. search = builds a search index. user = a person asked an AI assistant about that page and it fetched it right then.'), (12, 8)),
 (card('Robot hits per day, by role', "select occurred_at::date as day, bot_role, count(*) as hits from crawler_hits group by 1,2 order by 1", 'bar', None, STACK), (12, 8)),
 (card('AI: a person asked about these pages', "select occurred_at::date as day, bot_name, path from crawler_hits where bot_role='user' order by occurred_at desc limit 50", 'table', 'ChatGPT-User, Claude-User, Perplexity-User: the assistant fetched the page because someone asked about it. The closest thing to live demand we have.'), (12, 8)),
 (card('AI training crawlers: what they read (30 days)', "select bot_name, coalesce(page_type,'?') as page_type, count(*) as hits from crawler_hits where bot_role='training' and occurred_at > now()-interval '30 days' group by 1,2 order by 3 desc", 'table', 'GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider… our data going into models.'), (12, 8)),
 (card('Markets robots read most (30 days)', "select regexp_replace(path, '^/[a-z]{2}/[^/]+/', '') as market_page, count(*) as hits, count(distinct bot_name) as robots from crawler_hits where page_type='market' and occurred_at > now()-interval '30 days' group by 1 order by 2 desc limit 25", 'table'), (12, 8)),
 (card('Why the edge called it a robot (30 days)', "select reason, count(*) as hits from crawler_hits where occurred_at > now()-interval '30 days' group by 1 order by 2 desc", 'pie', 'ua = it said so in its name. no_language / no_sec_fetch = missing headers every real browser sends. datacentre = a cloud network.'), (12, 6)),
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

# ---------- 6. Engagement & health ----------
G = "analytics_engagement"
e = [
 (card('Time on page (median seconds, by page type, 30 days)', f"select coalesce(page_type,'?') as page_type, round((percentile_cont(0.5) within group (order by active_ms) / 1000.0)::numeric, 1) as median_seconds, round(avg(active_ms) / 1000.0, 1) as avg_seconds, count(*) as pages from {G} where occurred_at > now()-interval '30 days' and not bot_likely group by 1 order by 4 desc", 'table', 'Time the page was actually visible on screen. Median is the honest number; the average is pulled up by tabs left open.'), (12, 6)),
 (card('Scroll depth by page type (30 days)', f"select coalesce(page_type,'?') as page_type, round(avg(max_scroll_pct), 0) as avg_scroll_percent, round(100.0 * count(*) filter (where max_scroll_pct >= 90) / count(*), 0) as reached_bottom_percent from {G} where occurred_at > now()-interval '30 days' and not bot_likely group by 1 order by 2 desc", 'table'), (12, 6)),
 (card('Time on page per day', f"select occurred_at::date as day, round((percentile_cont(0.5) within group (order by active_ms) / 1000.0)::numeric, 1) as median_seconds from {G} where not bot_likely group by 1 order by 1", 'line'), (12, 6)),
 (card('Market page sections seen (30 days)', f"select section, count(*) as times_seen, round(100.0 * count(*) / nullif((select count(*) from {G} where page_type='market' and occurred_at > now()-interval '30 days' and not bot_likely),0), 0) as percent_of_visits from {G}, jsonb_array_elements_text(sections) as section where page_type='market' and occurred_at > now()-interval '30 days' and not bot_likely group by 1 order by 2 desc", 'row', 'Which blocks of a market page people actually reach: about, expect, when, hinkommen (getting there), dates, report.'), (12, 6)),
 (card('Markets people spend longest on (30 days)', f"select regexp_replace(path, '^/[a-z]{{2}}/[^/]+/', '') as market_page, count(*) as visits, round((percentile_cont(0.5) within group (order by active_ms) / 1000.0)::numeric, 0) as median_seconds, round(avg(max_scroll_pct), 0) as avg_scroll from {G} where page_type='market' and occurred_at > now()-interval '30 days' and not bot_likely group by 1 having count(*) >= 3 order by 3 desc limit 20", 'table'), (12, 8)),
 (card('Web Vitals (p75, 30 days)', f"select round(percentile_cont(0.75) within group (order by (props->>'lcp')::numeric)) as lcp_ms, round(percentile_cont(0.75) within group (order by (props->>'inp')::numeric)) as inp_ms, round((percentile_cont(0.75) within group (order by (props->>'cls')::numeric))::numeric, 3) as cls, round(percentile_cont(0.75) within group (order by (props->>'ttfb')::numeric)) as ttfb_ms, count(*) as samples from {E} where event_name='web_vitals' and occurred_at > now()-interval '30 days'", 'table', 'How fast the site felt to real visitors, on their devices. Google wants LCP under 2500 ms, INP under 200 ms, CLS under 0.1 for 75% of visits.'), (12, 4)),
 (card('Web Vitals by device (30 days)', f"select device_class, round(percentile_cont(0.75) within group (order by (props->>'lcp')::numeric)) as lcp_ms, round(percentile_cont(0.75) within group (order by (props->>'inp')::numeric)) as inp_ms, count(*) as samples from {E} where event_name='web_vitals' and occurred_at > now()-interval '30 days' group by 1", 'table'), (12, 4)),
 (card('Missing pages (404s, 30 days)', f"select path, coalesce(referrer_host,'(no referrer)') as came_from, count(*) as hits from {E} where event_name='not_found' and occurred_at > now()-interval '30 days' group by 1,2 order by 3 desc limit 30", 'table', 'Links that lead nowhere. A referrer of fleafind.ch or google.com is an old address that needs a redirect.'), (12, 8)),
 (card('Script errors (30 days)', f"select props->>'message' as error, props->>'source' as file, count(*) as times, max(occurred_at)::date as last_seen from {E} where event_name='js_error' and occurred_at > now()-interval '30 days' group by 1,2 order by 3 desc limit 20", 'table', 'Something broke in a visitor\'s browser.'), (12, 8)),
 (card('Rage and dead clicks (30 days)', f"select event_name, props->>'selector' as element, coalesce(page_type,'?') as page_type, count(*) as times from {E} where event_name in ('rage_click','dead_click') and occurred_at > now()-interval '30 days' group by 1,2,3 order by 4 desc limit 20", 'table', 'rage_click = three clicks in a second on the same spot. dead_click = tapped something that looks clickable and is not. Both are UI bugs to fix.'), (12, 6)),
 (card('Language switches (30 days)', f"select coalesce(locale,'?') as from_language, props->>'to' as to_language, count(*) as times from {E} where event_name='language_switch' and occurred_at > now()-interval '30 days' group by 1,2 order by 3 desc", 'table'), (6, 6)),
 (card('Newsletter funnel (30 days)', f"select count(*) filter (where event_name='newsletter_form_view') as seen, count(*) filter (where event_name='newsletter_form_start') as started_typing, count(*) filter (where event_name='newsletter_submit' and props->>'outcome'='ok') as signed_up from {E} where occurred_at > now()-interval '30 days'", 'table'), (6, 6)),
 (card('Connection quality (30 days)', f"select case when rtt_ms < 50 then 'fast (<50 ms)' when rtt_ms < 150 then 'ok (50-150 ms)' else 'slow (>150 ms)' end as connection, device_class, count(distinct visitor_day_hash) as people from {E} where event_name='page_view' and rtt_ms is not null and occurred_at > now()-interval '30 days'{B} group by 1,2 order by 3 desc", 'table', None, bots=True), (12, 6)),
 (card('Screen widths (30 days)', f"select case when viewport_w < 400 then 'phone (<400)' when viewport_w < 768 then 'large phone (400-767)' when viewport_w < 1100 then 'tablet / small laptop (768-1099)' else 'desktop (1100+)' end as width, count(distinct visitor_day_hash) as people from {E} where viewport_w is not null and occurred_at > now()-interval '30 days'{B} group by 1 order by 2 desc", 'pie', None, bots=True), (12, 6)),
 (card('Lead time: how far ahead people look (30 days)', f"select case when days_until_date <= 0 then 'today or past' when days_until_date <= 2 then '1-2 days' when days_until_date <= 7 then '3-7 days' when days_until_date <= 30 then '1-4 weeks' else 'more than a month' end as days_ahead, count(*) as views from {E} where event_name='page_view' and days_until_date is not null and occurred_at > now()-interval '30 days'{B} group by 1 order by min(days_until_date)", 'bar', 'On a market page: how many days until its next date at the moment someone looked. The demand curve.', bots=True), (24, 6)),
]
dashboard('6 - Engagement & health', 'How the site is used and whether it works: time on page, scroll, sections seen, speed, errors, broken links. Collected since 2026-09-17.', e, True)
print('done')
