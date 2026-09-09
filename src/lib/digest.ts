/**
 * What one subscriber's weekly e-mail contains.
 *
 * Built from the same query layer and the same weekend arithmetic as the
 * pages — `weekendBounds` decides what "this weekend" means here exactly as it
 * does for the chips on the home page. That is the point of this file existing
 * in src/lib rather than inside the send script: an e-mail assembled by its own
 * copy of the rules disagrees with the site within a month, and the e-mail is
 * the half nobody can correct afterwards.
 *
 * One issue for everybody, with the reader's own town lifted to the top. Not a
 * send per town: there are 55 of them and for a long time most will hold no
 * subscribers at all, which produces segments too small to learn anything from
 * and 55 jobs to keep working. The personal part is the ordering, and ordering
 * is free.
 */

import { weekendBounds } from './date-window.ts';
import { datedRows, weekendLead, type Dated } from './lists.ts';
import { marketPath, cityPath, homePath, type Locale } from './i18n.ts';
import { LINES, BADGED_KINDS } from './vocabulary.ts';
import { thumbUrl } from './images.ts';
import type { Market } from './types';

/**
 * The line colours, as hex.
 *
 * `vocabulary.ts` names a CSS custom property per market kind, which is right
 * for a page and useless in an e-mail: mail clients have no stylesheet to read
 * a variable out of. These are the same five values as `src/styles/tokens.css`
 * and have to be changed with it.
 */
const LINE_HEX: Record<string, string> = {
  '--line-floh': '#FF4A2B',
  '--line-halle': '#3D5AFE',
  '--line-nacht': '#7C3AED',
  '--line-kinder': '#F5A524',
  '--line-troedel': '#E4007F',
};

/**
 * One line of the e-mail.
 *
 * Deliberately flat strings: this crosses into the mail builder, which knows
 * nothing about markets and must not start to. A cancelled date is a row like
 * any other — it is the most useful thing we can tell anyone, and it is the
 * reason the copy promises "so you don't make the trip for nothing".
 */
export interface DigestRow {
  name: string;
  town: string;
  /** YYYY-MM-DD. */
  date: string;
  startTime?: string;
  endTime?: string;
  /** Site-relative, in the subscriber's own language. */
  path: string;
  cancelled: boolean;
  cancellationNote?: string;
  /**
   * What kind of market, but only where that is worth saying.
   *
   * `BADGED_KINDS` is the site's rule and it applies here unchanged: an
   * ordinary flea market is the rule and carries no badge, an indoor or night
   * or children's market is the exception and does. Say the exception, never
   * the rule — docs/BRAND.md. Absent on most rows, which is the point: it
   * keeps colour rare enough to mean something.
   */
  badge?: { label: string; colour: string };
  /**
   * The 148px square, site-relative. The mail renders it at 80.
   *
   * Every market has a photograph and that is the deliberate break from the
   * category (docs/BRAND.md) — an e-mail that leaves them out is the one place
   * the product stops making its own argument. The thumbnail, not the hero: a
   * dozen 1440px files is two megabytes of image for squares the size of a
   * stamp, which is the same reason the city pages use it.
   */
  image?: string;
  /** The wide photograph. Only the featured market is shown at this size. */
  hero?: string;
}

export interface Digest {
  /** The Saturday and the Sunday this issue is about. */
  from: string;
  to: string;
  /** The town they asked for, as we hold it. Absent for a countrywide signup. */
  town?: string;
  /**
   * The one market shown large, with its wide photograph.
   *
   * Taken from their own town where there is one, so the picture at the top of
   * the mail is somewhere they could actually go. A list of identical rows
   * reads as a database; one of them at full size gives the thing a face.
   */
  lead?: DigestRow;
  /** Whether the lead came out of their own town, which decides where it sits. */
  leadInTown: boolean;
  /** The rest of their town, after the lead was taken out of it. */
  own: DigestRow[];
  /** A sample of the rest of the country, at most one market per town per day. */
  elsewhere: DigestRow[];
  /** Markets on this weekend anywhere, before anything was cut. */
  total: number;
  /**
   * Where "see all" goes, and what it can honestly claim.
   *
   * Their own town's page when we had to cut their town's list — that is the
   * page holding what they are missing. The home page otherwise.
   */
  more: { href: string; count: number; town?: string };
}

/**
 * Town names as typed by a person, reduced to something comparable.
 *
 * The field is free text, so the same place arrives as "Zürich", "Zurich",
 * "zurich " and "ZÜRICH". Folding happens here, where it is one function and
 * testable, rather than being asked of the visitor by a picker — a picker can
 * only offer towns we already have markets in, and someone in a town we do not
 * cover yet is exactly the person worth having on the list.
 */
export const normaliseTown = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    // The combining marks NFD just split off, so "Zürich" and "Zurich" meet.
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');

function toRow(row: Dated, locale: Locale): DigestRow {
  const line = LINES[row.kind];
  const cancelled = row.next.status === 'cancelled';

  return {
    name: row.name,
    town: row.city,
    date: row.next.date,
    startTime: row.next.startTime,
    endTime: row.next.endTime,
    path: marketPath(locale, row.slug),
    cancelled,
    cancellationNote: row.next.cancellationNote,
    /* A cancelled market loses its line colour — the system says "not
       happening" without needing a badge to say it (docs/BRAND.md). */
    badge: !cancelled && line && BADGED_KINDS.has(row.kind)
      ? { label: line.short[locale], colour: LINE_HEX[line.token] ?? '#6E6C68' }
      : undefined,
    image: row.imageUrl ? thumbUrl(row.imageUrl) : undefined,
    hero: row.imageUrl,
  };
}

const byDateThenTime = (a: DigestRow, b: DigestRow) =>
  a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '');

/**
 * The issue for one subscriber.
 *
 * `town` is whatever they typed, or nothing at all — an empty town means the
 * whole country, which is what the form's hint promises, and it simply leaves
 * `own` empty so the elsewhere block becomes the whole e-mail.
 *
 * A town we hold no markets for behaves the same way, and that is on purpose:
 * an issue that says "nothing in Winterthur this weekend, but here is what is
 * on elsewhere" is worth opening. One that says nothing at all is not.
 */
export function buildDigest(
  markets: Market[],
  options: { town?: string | null; locale: Locale; now?: Date; limit?: number }
): Digest {
  const { town, locale, now = new Date(), limit = 8 } = options;
  const { start, end } = weekendBounds(now);

  /* The same window the home page's weekend block uses, minus anything that
     has already happened — an issue sent on a Saturday morning must not lead
     with Saturday's markets as though they were still ahead. */
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const floor = today > start ? today : start;

  const weekend = datedRows(markets).filter(
    (row) => row.next.date >= floor && row.next.date <= end
  );

  const wanted = town ? normaliseTown(town) : '';
  const isTheirs = (row: Dated) =>
    wanted !== '' &&
    (normaliseTown(row.city) === wanted || normaliseTown(row.citySlug) === wanted);

  /*
   * `limit` is the whole mail, not one section of it.
   *
   * Their own town has first claim on it and the rest of the country gets what
   * is left — so someone in a busy town sees eight of their own, someone in a
   * quiet one sees their two and six from elsewhere, and nobody gets a mail
   * that scrolls for a minute. Whatever is cut is what the "see all" link is
   * for; the mail is a prompt, the site is the list.
   */
  const theirs = weekend.filter(isTheirs);
  const ownRows = theirs.slice(0, limit);
  const budgetLeft = limit - ownRows.length;

  /*
   * The rest of the country, one market per town, biggest towns first — the
   * home page's selection, from the home page's own function, so the two
   * cannot start disagreeing about what a good sample looks like.
   *
   * Run once per day rather than once per weekend, which the home page has no
   * reason to do and this does. Given the whole weekend at once it ranks by
   * town size alone, and the biggest towns nearly all hold a Saturday market —
   * so a budget of eight came back as eight Saturdays and a reader free on the
   * Sunday saw nothing at all for it. Found by sending one to a terminal.
   */
  const rest = weekend.filter((row) => !isTheirs(row));
  const days = [...new Set(rest.map((row) => row.next.date))].sort();

  const sample: Dated[] = [];
  let budget = budgetLeft;
  for (const [index, date] of days.entries()) {
    if (budget <= 0) break;
    const share = Math.ceil(budget / (days.length - index));
    const picked = weekendLead(rest.filter((row) => row.next.date === date), share, now);
    const rows = [...picked.lead, ...picked.rest].slice(0, share);
    sample.push(...rows);
    budget -= rows.length;
  }

  const own = ownRows.map((row) => toRow(row, locale)).sort(byDateThenTime);
  const elsewhere = sample.map((row) => toRow(row, locale)).sort(byDateThenTime);

  /* Theirs if they have one, because a photograph of somewhere they cannot
     get to is a worse opening than one of somewhere they can. */
  const leadInTown = own.length > 0;
  const lead = own.shift() ?? elsewhere.shift();

  /*
   * "See all" points at whatever we cut. When their own town has more than
   * fitted, that is their town's page; otherwise the weekend as a whole.
   */
  const cut = theirs.length > ownRows.length;
  const first = theirs[0];
  const more = cut && first
    ? {
        href: cityPath(locale, first.countrySlug, first.citySlug),
        count: theirs.length,
        town: first.city,
      }
    : { href: homePath(locale), count: new Set(weekend.map((row) => row.slug)).size };

  return {
    from: start,
    to: end,
    town: town?.trim() || undefined,
    lead,
    leadInTown,
    own,
    elsewhere,
    total: new Set(weekend.map((row) => row.slug)).size,
    more,
  };
}

/** Nothing in their town and nothing anywhere else: do not send an empty issue. */
export const isEmpty = (digest: Digest): boolean =>
  !digest.lead && digest.own.length === 0 && digest.elsewhere.length === 0;
