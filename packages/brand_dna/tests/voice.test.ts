/**
 * Brand Voice & Tag Taxonomy tests.
 */

import assert from 'node:assert';
import { validateCopy, validateHighlightTags, RACING_TAG_TAXONOMY } from '../src/voice';

console.log('Running brand_dna voice tests...');

// 1. Banned term enforcement
{
  const opaque = validateCopy('The fee structure is intentionally opaque.');
  assert.equal(opaque.isValid, false, 'Should reject "opaque"');
  assert.ok(opaque.errors.some((e) => e.includes('opaque')), 'Error message should cite opaque');

  const crypto = validateCopy('Invest in this crypto token for guaranteed returns.');
  assert.equal(crypto.isValid, false, 'Should reject crypto/token/guaranteed return');

  const clean = validateCopy('Elite thoroughbred ownership, evolved for the modern stable.');
  assert.equal(clean.isValid, true, 'Clean copy should pass');

  console.log('✅ Banned term enforcement works (including "opaque")');
}

// 2. Exclamation marks
{
  const bang = validateCopy('Own the experience!');
  assert.equal(bang.isValid, false, 'Should reject exclamation marks');
  console.log('✅ Exclamation mark enforcement works');
}

// 3. Tag taxonomy validation
{
  const validTags = ['By Almanzor (FR)', 'Classic Frame & Scope', 'Byerley Park Trained'];
  const taxonomy = validateHighlightTags(validTags);
  assert.equal(taxonomy.valid, true, 'Tags from taxonomy-adjacent whitelist should pass');
  assert.equal(taxonomy.invalidTags.length, 0);

  const invalidTags = ['10x returns', 'guaranteed winner', 'crypto-backed'];
  const bad = validateHighlightTags(invalidTags);
  assert.equal(bad.valid, false, 'Invalid tags should fail');
  assert.ok(bad.invalidTags.length > 0);

  assert.ok(RACING_TAG_TAXONOMY.length > 0, 'RACING_TAG_TAXONOMY must be defined');

  console.log('✅ Tag taxonomy validation works');
}

console.log('🎉 All brand_dna voice tests passed.');
