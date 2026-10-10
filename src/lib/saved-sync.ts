/**
 * Saved markets that follow an e-mail address (functions/k.ts, 2026-10-10).
 *
 * The list itself stays where it always was — SAVED_KEY in this browser. Once
 * the visitor leaves an address, /k gives this browser a token and the list is
 * copied to the server on every change, so the Friday mail knows it. Without a
 * token nothing leaves the browser.
 */
import { SAVED_KEY } from './local-keys';

export const SAVED_TOKEN_KEY = 'fynda:saved-token';
/** The sheet after a first save is offered once per browser, answered or not. */
export const SAVED_ASKED_KEY = 'fynda:saved-asked';

const get = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };
const put = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } };

export const savedSlugs = (): string[] => { try { return JSON.parse(get(SAVED_KEY) ?? '[]'); } catch { return []; } };
export const savedToken = (): string | null => get(SAVED_TOKEN_KEY);
export const rememberToken = (token: string) => put(SAVED_TOKEN_KEY, token);
export const wasAsked = (): boolean => get(SAVED_ASKED_KEY) !== null;
export const markAsked = () => put(SAVED_ASKED_KEY, '1');

/** After the list changed here: tell the server, if this browser is signed up. Fire and forget. */
export function syncSaved(slugs = savedSlugs()) {
  const token = savedToken();
  if (!token) return;
  void fetch('/k', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ token, slugs, path: location.pathname }),
    keepalive: true,
  }).catch(() => undefined);
}
