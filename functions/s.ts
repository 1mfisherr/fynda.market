/**
 * The sticker's QR code — GET /s.
 *
 * Stickers go up at flea markets with a printed QR code, and a printed code
 * cannot be changed. So it points here, not at a page: this address is
 * permanent, and where it sends people can move without reprinting anything.
 *
 * It sends a phone to the home page in the language the phone asks for —
 * the bare root would land a French speaker in German — and tags the visit
 * utm_source=sticker. The page view the edge records on arrival carries that
 * tag, so "do stickers bring anyone" is a count in analytics_events with no
 * new event, no cookie and nothing stored about the person who scanned.
 *
 * 302, not 301: a browser must ask again every time, or a changed destination
 * would never reach a phone that scanned once before.
 */

const LOCALES = ['de', 'fr', 'it', 'en'] as const;

/** The first supported language in Accept-Language, by weight; English when none. */
export function localeFor(acceptLanguage: string | null): string {
  const asked = (acceptLanguage ?? '')
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const weight = q ? Number(q.slice(2)) : 1;
      return { lang: tag.slice(0, 2).toLowerCase(), weight: Number.isFinite(weight) ? weight : 0, i };
    })
    .filter((a) => a.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.i - b.i);
  return asked.find((a) => (LOCALES as readonly string[]).includes(a.lang))?.lang ?? 'en';
}

export const onRequestGet: PagesFunction = async ({ request }) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: `/${localeFor(request.headers.get('accept-language'))}/?utm_source=sticker&utm_medium=qr`,
      'Cache-Control': 'no-store',
      Vary: 'Accept-Language',
    },
  });
