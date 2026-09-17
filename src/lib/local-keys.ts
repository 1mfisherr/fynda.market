/**
 * The names under which the browser keeps what a visitor chose.
 *
 * English, like every internal name (CLAUDE.md: nothing shared across
 * locales is German). They were `fynda:gemerkt` and `fynda:stadt` until
 * 2026-09-17; `adopt()` carries an old value over once, so nobody's saved
 * list vanished with the rename.
 */
export const SAVED_KEY = 'fynda:saved';
export const TOWN_KEY = 'fynda:town';

const OLD: Record<string, string> = { [SAVED_KEY]: 'fynda:gemerkt', [TOWN_KEY]: 'fynda:stadt' };

/** Moves the value from the key's old name, if that is where it still is. */
export function adopt(key: string): void {
  try {
    const old = OLD[key];
    if (!old || localStorage.getItem(key) !== null) return;
    const value = localStorage.getItem(old);
    if (value === null) return;
    localStorage.setItem(key, value);
    localStorage.removeItem(old);
  } catch { /* private mode: nothing to carry over */ }
}
