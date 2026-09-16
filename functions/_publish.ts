/**
 * Publishing within the hour.
 *
 * The site is static and rebuilds at 03:00. When an organiser confirms or
 * cancels a date, waiting for tomorrow is the wrong answer — a cancellation
 * answered Saturday 06:30 is useless if the page says "on" until Sunday. So a
 * button press asks GitHub to run publish.yml now, the same path as the nightly
 * build: tests, build against the database, ten guardrails, upload.
 *
 * Debounced only against a double-click: a request within a minute of a
 * dispatched one is folded. Anything wider risks folding into a build that
 * has already read the database and finished — on 2026-09-16 a cancellation
 * six minutes after an edit did exactly that and would have waited for 03:00.
 * publish.yml's own concurrency group queues real overlaps, and a queued run
 * reads fresh data. Every request is a row in publish_requests, dispatched or
 * folded, so "why didn't the site update" has an answer.
 *
 * GITHUB_DISPATCH_TOKEN is a fine-grained token with Actions: write on this one
 * repository and nothing else. Without it, the row is written and the build
 * waits for 03:00 — the answer itself is never lost.
 */

import { insertOne, selectRows, type RestEnv } from './_rest';

export interface PublishEnv extends RestEnv {
  GITHUB_DISPATCH_TOKEN?: string;
}

const REPO = '1mfisherr/fynda.market';
const WORKFLOW = 'publish.yml';
const WINDOW_MS = 60 * 1000;

export async function requestPublish(env: PublishEnv, reason: string): Promise<'dispatched' | 'folded' | 'no_token' | 'failed'> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const recent = await selectRows(env, 'publish_requests',
    `dispatched=eq.true&requested_at=gte.${encodeURIComponent(since)}`, 'id');

  if (recent.length > 0) {
    await insertOne(env, 'publish_requests', { reason, dispatched: false });
    return 'folded';
  }

  const token = env.GITHUB_DISPATCH_TOKEN?.trim();
  if (!token) {
    await insertOne(env, 'publish_requests', { reason: `${reason} (no GITHUB_DISPATCH_TOKEN)`, dispatched: false });
    console.log('publish not dispatched: GITHUB_DISPATCH_TOKEN unset');
    return 'no_token';
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'fynda-publish',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    });
    // 204 is GitHub's yes.
    const ok = res.status === 204;
    if (!ok) console.log('github dispatch rejected', res.status, await res.text());
    await insertOne(env, 'publish_requests', { reason, dispatched: ok });
    return ok ? 'dispatched' : 'failed';
  } catch (error) {
    console.log('github unreachable', String(error));
    await insertOne(env, 'publish_requests', { reason, dispatched: false });
    return 'failed';
  }
}
