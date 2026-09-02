/**
 * Keep a day band's count honest while a filter is running.
 *
 * The band is rendered with the number of markets that day holds. Every list on
 * the site then hides rows — a date chip, the calendar, the four-per-day cap,
 * the saved page — and the band went on claiming the number it was built with.
 * On the saved page that read "25 Märkte" above two rows, which on a site whose
 * whole promise is numbers you can trust is the worst place to be sloppy.
 *
 * It lives here rather than in each page's filter script because there are five
 * of those and they would drift. The plural forms come from the markup, written
 * per locale by DateBand, so this never has to know a word of any language.
 */

export function syncDayCounts(root: ParentNode = document): void {
  for (const day of Array.from(root.querySelectorAll<HTMLElement>('[data-day]'))) {
    const label = day.querySelector<HTMLElement>('[data-count]');
    if (!label) continue;
    /*
      What matched, not what is on screen. The home page shows four rows per day
      and folds the rest behind a button — those still match the filter, so the
      band must not say "4" when the button offers a fifth. A page that collapses
      rows says how many matched on the day itself; everywhere else, rendered and
      matched are the same thing.

      `closest`, not `row.hidden`: the radius view hides a wrapper around each
      row rather than the row itself, and both mean the same thing on screen.
    */
    const matched = day.dataset.matched;
    const shown = matched === undefined
      ? Array.from(day.querySelectorAll<HTMLElement>('[data-date]'))
          .filter((row) => !row.closest('[hidden]')).length
      : Number(matched);
    const template = shown === 1 ? label.dataset.one : label.dataset.other;
    // "1 Markt" / "2 Märkte" — swap the number, keep whatever noun follows it.
    label.textContent = (template ?? '').replace(/^\d+/, String(shown)).toUpperCase();
  }
}
