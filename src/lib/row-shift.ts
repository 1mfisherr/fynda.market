/**
 * Only what is on or still to come (Delfim, 2026-10-10).
 *
 * The site is built at night, so on a Saturday evening every list still held
 * the markets that closed at four, faded under *Over for today*. Now a row
 * whose market has closed for the day moves on: to its next date, with that
 * date's hours, at full strength — or, with no later date inside the horizon,
 * it leaves the list until tonight's build files it under *No date yet*.
 * A list where a later date makes no sense — the home page's *This weekend* —
 * marks itself `data-over="hide"` and its closed rows simply leave.
 *
 * MarketRow's clock calls `moveOn`; the page that owns the list puts the row
 * back in order (town pages under its day, the canton list by date, Near me
 * in its bands), listening for `fynda:moved`.
 */

/** Move a closed row to its next date, or hide it. Returns what happened. */
export function moveOn(row: HTMLElement): 'moved' | 'hidden' {
  const after = row.dataset.afterDate;
  if (!after || row.closest('[data-over="hide"]')) {
    row.hidden = true;
    // Marked, so a page's own filter does not show it again.
    row.dataset.gone = '1';
    return 'hidden';
  }
  row.dataset.date = after;
  row.classList.remove('over');
  delete row.dataset.start;
  delete row.dataset.end;
  const day = row.querySelector<HTMLElement>('.day');
  if (day && row.dataset.afterDay) day.textContent = row.dataset.afterDay;
  const hours = row.querySelector<HTMLElement>('.hours');
  if (hours) hours.textContent = row.dataset.afterHours ?? '';
  const clock = row.querySelector<HTMLElement>('[data-clock]');
  if (clock) clock.hidden = true;
  return 'moved';
}

/**
 * A card from the lead size to the row size, or back: the frame is a class,
 * and the picture is swapped for the file of that size (src/lib/images.ts —
 * `-thumb.webp` for a row, `-720.webp` for a lead).
 */
export function setVariant(card: HTMLElement, variant: 'feature' | 'row') {
  if (card.classList.contains(variant)) return;
  card.classList.remove(variant === 'feature' ? 'row' : 'feature');
  card.classList.add(variant);
  card.querySelector('picture source')?.remove();
  const img = card.querySelector<HTMLImageElement>('img');
  const src = img?.getAttribute('src');
  if (!img || !src || !src.endsWith('.webp')) return;
  const base = src.replace(/-(thumb|720)\.webp$/, '.webp');
  img.src = variant === 'feature' ? base.replace(/\.webp$/, '-720.webp') : base.replace(/\.webp$/, '-thumb.webp');
  img.width = img.height = variant === 'feature' ? 720 : 148;
}

/** Visible cards directly inside an element, in order. */
export const cardsIn = (el: Element) =>
  Array.from(el.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.matches('article.card') && !c.hidden);

/**
 * A flat list with lead cards above it (canton pages): every visible card back
 * in date order, the first `leadCount` at lead size.
 */
export function reorderFlat(leads: HTMLElement, rest: HTMLElement, leadCount: number) {
  const all = [...cardsIn(leads), ...cardsIn(rest)];
  const sorted = [...all].sort((a, b) => (a.dataset.date ?? '').localeCompare(b.dataset.date ?? ''));
  if (sorted.every((card, i) => card === all[i])) return;
  sorted.forEach((card, i) => {
    setVariant(card, i < leadCount ? 'feature' : 'row');
    (i < leadCount ? leads : rest).appendChild(card);
  });
}
