import assert from 'node:assert/strict';
import { getHorseMediaWithFallback } from '../lib/media-fallback';
import { HORSE_STILLS } from '@evo/storage/cdn';

// 1. Unknown slug → branded placeholder (no broken image)
const unknown = getHorseMediaWithFallback('no-such-horse');
assert.strictEqual(unknown.heroConformation, '/brand/placeholder-hero.svg');

// 2. Slug with no stills entry → placeholder
const missing = getHorseMediaWithFallback('test-campaign-without-stills');
assert.strictEqual(missing.heroConformation, '/brand/placeholder-hero.svg');

// 3. Known slug → real still, never the placeholder
const nellie = getHorseMediaWithFallback('nellie');
assert.ok(nellie.heroConformation.startsWith('/horses/nellie/'));
assert.notStrictEqual(nellie.heroConformation, '/brand/placeholder-hero.svg');
assert.strictEqual(nellie.heroConformation, HORSE_STILLS['nellie']?.[0]);

console.log('✅ media-fallback: unknown slug → placeholder-hero.svg; known slug → CDN still');
