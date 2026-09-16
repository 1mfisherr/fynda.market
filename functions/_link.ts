/**
 * The organiser's token, derived — and nothing else, so that the daily mail
 * script can import this file with Node directly. (Node does not resolve the
 * extensionless imports the Pages bundler allows, so a module the scripts
 * share must import nothing.)
 *
 * token = base64url(HMAC-SHA256(secret, "link|" + linkId)). The table stores
 * SHA-256(token) for lookup. A copy of the database yields no working links
 * without the secret; the script on GitHub holds the same secret and builds
 * the buttons without a token ever being stored.
 */

async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const hexToBase64url = (hex: string) => {
  const bytes = Uint8Array.from(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** The token a link id stands for. Same function in the Function and in the mail script. */
export async function tokenFor(secret: string, linkId: string): Promise<string> {
  return hexToBase64url(await hmacHex(secret.trim(), `link|${linkId}`));
}

export const editUrl = (origin: string, token: string) => `${origin}/a/${token}/edit`;
export const answerUrl = (origin: string, token: string, occurrenceId: string, verb: 'on' | 'cancelled' | 'changed') =>
  `${origin}/a/${token}/${occurrenceId}/${verb}`;
