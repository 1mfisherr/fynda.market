/**
 * The analytics collector keeps its own copy of the path words, because a
 * Function cannot import src/lib/i18n.ts. Copies drift: Germany went live
 * without its words there, and five days of its country and Bundesland page
 * views were filed as 'other'. This fails the day a country is added to
 * i18n.ts and not to functions/_collect.ts.
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { COUNTRY, type Locale } from './i18n.ts';
import { pageTypeOf } from '../../functions/_collect.ts';

const slug = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

for (const [code, info] of Object.entries(COUNTRY)) {
  for (const locale of info.locales as Locale[]) {
    const country = slug(info.name[locale]!);
    const region = info.region[locale] ?? info.region.en!;

    test(`${code} ${locale}: country, region and town pages are counted as what they are`, () => {
      assert.equal(pageTypeOf(`/${locale}/${country}/`), 'country');
      assert.equal(pageTypeOf(`/${locale}/${country}/${region}/some-region/`), 'region');
      assert.equal(pageTypeOf(`/${locale}/${country}/some-town/`), 'city');
    });
  }
}
