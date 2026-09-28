/**
 * The remembered town in the header follows the page's language — a pill on a
 * French page that opened `/en/switzerland/basel/` switched the visitor to
 * English (2026-09-28).
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { townPathIn } from './i18n.ts';

test('a Swiss town opens in the language being read', () => {
  assert.equal(townPathIn('/en/switzerland/basel/', 'fr'), '/fr/suisse/basel/');
  assert.equal(townPathIn('/de/schweiz/zurich/', 'it'), '/it/svizzera/zurich/');
  assert.equal(townPathIn('/fr/suisse/geneve/', 'en'), '/en/switzerland/geneve/');
});

test('a German town opens in German or English, and keeps its address elsewhere', () => {
  assert.equal(townPathIn('/en/germany/berlin/', 'de'), '/de/deutschland/berlin/');
  assert.equal(townPathIn('/de/deutschland/berlin/', 'fr'), '/de/deutschland/berlin/');
});

test('anything that is not a town address is left alone', () => {
  assert.equal(townPathIn('/en/nearby/', 'de'), '/en/nearby/');
  assert.equal(townPathIn('/en/switzerland/canton/zurich/', 'de'), '/en/switzerland/canton/zurich/');
  assert.equal(townPathIn('/xx/nowhere/town/', 'de'), '/xx/nowhere/town/');
});
