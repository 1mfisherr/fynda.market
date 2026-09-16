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
  options: { status?: number; noindex?: boolean } = {}
): Response {
  const html = `<!doctype html>
<html lang="${escape(locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escape(title)} — fynda.market</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #fff; color: #16161a; font: 16px/1.55 -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  main { max-width: 560px; margin: 0 auto; padding: 32px 20px 64px; }
  .brand { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 32px; }
  .brand a { color: inherit; text-decoration: none; }
  h1 { font-size: 26px; line-height: 1.2; letter-spacing: -0.02em; margin: 0 0 12px; }
  p { margin: 0 0 16px; }
  .meta { color: #6b6b70; font-size: 14px; }
  .status { color: #FF4A2B; font-weight: 500; }
  .btn { display: block; box-sizing: border-box; width: 100%; padding: 14px 16px; margin: 12px 0 0; border: 1px solid #16161a; border-radius: 6px; background: #16161a; color: #fff; font: inherit; font-weight: 500; text-align: center; text-decoration: none; cursor: pointer; }
  .btn.secondary { background: #fff; color: #16161a; }
  .field { margin: 20px 0 0; }
  .field label { display: block; font-size: 14px; font-weight: 500; margin: 0 0 6px; }
  .field input, .field select { box-sizing: border-box; width: 100%; padding: 10px 12px; border: 1px solid #b8b8bd; border-radius: 6px; font: inherit; }
  .seg { display: flex; gap: 8px; }
  .seg label { flex: 1; display: block; border: 1px solid #b8b8bd; border-radius: 6px; padding: 10px 6px; text-align: center; font-size: 14px; cursor: pointer; }
  .seg input { position: absolute; opacity: 0; width: 0; height: 0; }
  .seg input:checked + span { display: block; margin: -10px -6px; padding: 10px 6px; border-radius: 5px; background: #16161a; color: #fff; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #e5e5e5; }
  .row:last-child { border-bottom: 1px solid #e5e5e5; }
  hr { border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0; }
</style>
</head>
<body>
<main>
  <p class="brand"><a href="https://fynda.market/">fynda.market</a></p>
  ${body}
</main>
</body>
</html>`;

  return new Response(html, {
    status: options.status ?? 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
