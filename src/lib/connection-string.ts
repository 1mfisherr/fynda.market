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

/** The string with its password replaced, safe to print in a build log. */
export function redact(value: string): string {
  return value.replace(/(:\/\/[^:/@]*:)[^@]*(@)/, '$1********$2');
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
      `${name} is not a Postgres connection string. It must start with "postgresql://" and ` +
        `end with "/postgres", with nothing before or after it — no quotes, no "psql", no ` +
        `"${name}=" prefix, no stray spaces. Got: ${JSON.stringify(redact(value).slice(0, 60))}...`
    );
  }

  return value;
}
