/**
 * A small HTML page from a Function.
 *
 * The site's pages are static files; these are the few that cannot be — the
 * page an organiser lands on after pressing a button in a mail, and the page
 * Delfim sees after tapping approve in Telegram. They carry the brand's
 * shape (white, near-black, one accent for status) inline, because a Function
 * cannot know the hashed name of the site's stylesheet and must not import it.
 */

export const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function page(
  locale: string,
  title: string,
  body: string,
  options: { status?: number; noindex?: boolean; wide?: boolean } = {}
): Response {
  const html = `<!doctype html>
<html lang="${escape(locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escape(title)} — fynda.market</title>
<link rel="preload" href="/fonts/schibsted-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
  @font-face { font-family: "Schibsted Grotesk"; font-style: normal; font-weight: 400 800; font-display: swap; src: url("/fonts/schibsted-grotesk-latin.woff2") format("woff2"); }
  /* Mirrors src/styles/tokens.css and src/components/Wordmark.astro by hand:
     a Function may not import from src/. Change those, change this. */
  :root { color-scheme: light; }
  body { margin: 0; background: #fff; color: #111110; font: 16px/1.55 "Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif; }
  main { max-width: 560px; margin: 0 auto; padding: 24px 20px 64px; }
  .mark { display: inline-block; line-height: 0; margin: 0 0 32px; }
  .mark img { display: block; height: 26px; width: auto; }
  h1 { font-size: 26px; line-height: 1.2; letter-spacing: -0.03em; font-weight: 800; margin: 0 0 12px; }
  p { margin: 0 0 16px; }
  .meta { color: #6b6b70; font-size: 14px; }
  .status { color: #FF4A2B; font-weight: 500; }
  .btn { display: block; box-sizing: border-box; width: 100%; padding: 14px 16px; margin: 12px 0 0; border: 1px solid #111110; border-radius: 6px; background: #111110; color: #fff; font: inherit; font-weight: 500; text-align: center; text-decoration: none; cursor: pointer; }
  .btn.secondary { background: #fff; color: #111110; }
  /* The organiser page (docs/PAGES.md §Organiser page). Controls are
     editorial, as on the site: a hairline under bold text with a small
     uppercase label; a segmented choice underlined in the accent; one filled
     button per moment. Type is fluid on the site's two anchors. */
  main.wide { max-width: 720px; }
  .eyebrow { font-size: 12px; font-weight: 500; color: #75706A; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px; }
  .wide h1 { font-size: clamp(34px, calc(30px + 1.1vw), 49px); letter-spacing: -0.045em; line-height: 1.02; }
  .lede { font-size: clamp(15px, calc(13.4px + 0.42vw), 19.5px); color: #6E6C68; margin: 0 0 20px; }
  .photo { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 6px; background: #F5F4F2; margin: 0 0 24px; }
  .why { font-size: clamp(16px, calc(14.3px + 0.45vw), 20.8px); line-height: 1.5; }
  .why p { margin: 0 0 12px; }
  .card { background: #F5F4F2; border-radius: 6px; padding: 22px 20px 20px; margin: 28px 0 0; }
  .card h2 { margin: 0 0 12px; }
  h2 { font-size: clamp(21px, calc(18.8px + 0.59vw), 27px); font-weight: 700; letter-spacing: -0.025em; line-height: 1.1; margin: 44px 0 6px; }
  .date { font-size: clamp(22px, calc(19.5px + 0.65vw), 29px); font-weight: 700; color: #FF4A2B; letter-spacing: -0.015em; }
  .quiet { color: #75706A; font-size: 13px; font-weight: 500; }
  .hint { color: #75706A; font-size: 13px; line-height: 1.45; margin: 6px 0 0; }
  .btn.accent { background: #FF4A2B; border-color: #FF4A2B; font-weight: 700; }
  .btn.quiet { background: #fff; color: #6E6C68; border-color: #E8E6E2; font-weight: 500; }
  .btn.inline { display: inline-block; width: auto; padding: 12px 22px; }
  .textlink { display: block; text-align: center; margin: 12px 0 0; font-weight: 500; color: #111110; }
  .list { list-style: none; margin: 18px 0 0; padding: 0; border-top: 1px solid #E8E6E2; }
  .list li { padding: 14px 0; border-bottom: 1px solid #E8E6E2; }
  .list .top, .list .under { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .list .day { font-size: 17px; font-weight: 700; color: #FF4A2B; }
  .list .day.off { color: #75706A; }
  .list .under { margin-top: 4px; }
  .list .acts { display: flex; gap: 16px; font-size: 14px; font-weight: 500; }
  .list .acts a.grey { color: #6E6C68; }
  .times { display: flex; gap: 6px; align-items: center; }
  .list .acts a { color: #111110; text-decoration: underline; text-underline-offset: 3px; }
  .times input { font: inherit; font-size: 15px; padding: 4px 2px; border: 0; border-bottom: 1px solid #E8E6E2; border-radius: 0; background: transparent; color: #111110; }
  .times input:focus { border-bottom-color: #111110; outline: none; }
  details summary { list-style: none; }
  details summary::-webkit-details-marker { display: none; }
  .actions { display: flex; gap: 10px; margin: 14px 0 0; }
  .actions .btn { margin: 0; }
  .field { margin: 26px 0 0; }
  .field label, .field .lab { display: block; font-size: 12px; font-weight: 500; color: #75706A; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 6px; }
  .field input[type=text], .field input[type=url], .field input[type=number], .field input[type=date], .field input[type=time] { box-sizing: border-box; width: 100%; padding: 8px 0; border: 0; border-bottom: 1px solid #111110; border-radius: 0; background: transparent; font: inherit; font-size: 20px; font-weight: 700; outline-offset: 4px; }
  .field input::placeholder, .field textarea::placeholder { color: #B5B2AD; font-weight: 500; }
  .field textarea { box-sizing: border-box; width: 100%; padding: 12px; border: 1px solid #111110; border-radius: 6px; font: inherit; font-size: 16px; line-height: 1.45; resize: vertical; min-height: 110px; }
  .seg { display: flex; border-top: 1px solid #E8E6E2; border-bottom: 1px solid #E8E6E2; }
  .seg label { flex: 1; position: relative; display: block; padding: 13px 4px; text-align: center; font-size: 15px; font-weight: 500; color: #6E6C68; cursor: pointer; text-transform: none; letter-spacing: 0; margin: 0; }
  .seg input { position: absolute; opacity: 0; width: 0; height: 0; }
  .seg input:checked + span { display: block; margin: -13px -4px; padding: 13px 4px; border-bottom: 2.5px solid #FF4A2B; color: #111110; font-weight: 700; }
  .seg input:focus-visible + span { outline: 2px solid #111110; outline-offset: -2px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chips label { position: relative; display: block; height: 38px; line-height: 36px; padding: 0 14px; border: 1px solid #E8E6E2; border-radius: 999px; font-size: 14px; font-weight: 500; color: #111110; cursor: pointer; text-transform: none; letter-spacing: 0; margin: 0; }
  .chips input { position: absolute; opacity: 0; width: 0; height: 0; }
  .chips input:checked + span { display: block; margin: 0 -14px; padding: 0 14px; border-radius: 999px; background: #111110; color: #fff; }
  .chips input:focus-visible + span { outline: 2px solid #111110; outline-offset: 2px; }
  .foot { margin: 44px 0 0; padding-top: 20px; border-top: 1px solid #E8E6E2; font-size: 14px; line-height: 1.5; color: #6E6C68; }
  .foot p { margin: 0 0 12px; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #e5e5e5; }
  .row:last-child { border-bottom: 1px solid #e5e5e5; }
  hr { border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0; }
</style>
</head>
<body>
<main${options.wide ? ' class="wide"' : ''}>
  <a class="mark" href="https://fynda.market/"><img src="/brand/fynda-wordmark.svg" alt="fynda.market" width="1995" height="350"></a>
  ${body}
</main>
</body>
</html>`;

  return new Response(html, {
    status: options.status ?? 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
