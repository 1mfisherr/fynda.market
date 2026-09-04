/**
 * Cleaning up a pasted Postgres connection string, and failing legibly when it
 * cannot be cleaned.
 *
 * This exists because of a real deploy. A connection string pasted into
 * Cloudflare's environment-variable box carried one leading space. `pg` could
 * not parse it as a URL, silently fell back to its key=value format, and read
 * the host as the word `base` — a fragment of "supabase". The build died with:
 *
 *     Error: getaddrinfo ENOTFOUND base
 *
 * Nothing in that message points at the variable, the space, or the fact that
 * the password was never even tried. Every wrapper a person is likely to paste
 * does the same thing: a leading or trailing space, straight or smart quotes,
 * the `psql "…"` command Supabase shows next to the URI, or the `NAME=` prefix
 * copied along with the value from a .env file.
 *
 * So: strip the wrappers we can recognise, and if what is left is still not a
 * Postgres URL, say so in a sentence that names the variable and shows what was
 * actually seen — with the password masked, because this text lands in build
 * logs that other people can read.
 */

/** Straight and smart quotes, in matched pairs. */
const QUOTES: [string, string][] = [
  ['"', '"'],
  ["'", "'"],
  ['“', '”'],
  ['‘', '’'],
];

export function normaliseConnectionString(raw: string): string {
  let value = raw.trim();

  // `psql "postgresql://…"` — the command Supabase shows beside the URI.
  value = value.replace(/^psql\s+/i, '').trim();

  // `SUPABASE_DB_URL=postgresql://…` — the whole line copied out of .env.local.
  value = value.replace(/^[A-Z_][A-Z0-9_]*\s*=\s*/i, '').trim();

  for (const [open, close] of QUOTES) {
    if (value.startsWith(open) && value.endsWith(close) && value.length > 1) {
      value = value.slice(1, -1).trim();
      break;
    }
  }

  return value;
}

/**
 * What a rejected value *is*, in words, never the value itself.
 *
 * The first version of this error printed the first 60 characters of what it
 * was given. Someone pasted a Supabase secret API key into the variable, and
 * the message copied that key verbatim into a build log — turning a
 * configuration mistake into a leaked credential. A diagnostic must not be able
 * to do that, so nothing here returns any part of the input.
 *
 * The named shapes are the three things people actually paste by mistake: both
 * kinds of Supabase API key, and the older JWT-format one.
 */
export function describe(value: string): string {
  if (value.startsWith('sb_secret_')) {
    return 'a Supabase secret API key (starts "sb_secret_")';
  }
  if (value.startsWith('sb_publishable_')) {
    return 'a Supabase publishable API key (starts "sb_publishable_")';
  }
  if (value.startsWith('eyJ')) {
    return 'a JWT — probably a Supabase anon or service-role key';
  }
  if (/^https?:\/\//i.test(value)) {
    return 'a web address (starts "http") — probably the Supabase project URL';
  }
  return `${value.length} characters, not starting with "postgresql://"`;
}

/**
 * The cleaned string, or a thrown error that explains itself.
 *
 * @param raw   what the environment variable held
 * @param name  the variable's name, so the message can name it
 */
export function requireConnectionString(raw: string | undefined, name: string): string {
  if (!raw || !raw.trim()) {
    throw new Error(
      `${name} is not set. Locally: copy .env.example to .env.local and fill it in. ` +
        `On Cloudflare: Settings -> Variables and Secrets.`
    );
  }

  const value = normaliseConnectionString(raw);

  if (!/^postgres(ql)?:\/\//i.test(value)) {
    throw new Error(
      `${name} must be a Postgres connection string: it starts with "postgresql://" and ends ` +
        `with "/postgres". Got ${describe(value)}. ` +
        `The right value is in the Supabase dashboard under Connect -> URI — NOT under ` +
        `Project Settings -> API, which is where the keys live.`
    );
  }

  return value;
}
