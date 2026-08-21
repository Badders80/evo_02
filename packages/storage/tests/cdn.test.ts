import assert from 'node:assert/strict';
import { getHorseCdnUrls, getTrainerCdnUrls, HORSE_STILLS } from '../src/cdn';

console.log('Running @evo/storage stills convention tests...');

{
  const nellie = getHorseCdnUrls('nellie');
  assert.equal(nellie.heroConformation, '/horses/nellie/01.png', '01 is cover');
  assert.equal(nellie.paradeGallery[0], '/horses/nellie/02.webp');
  assert.equal(nellie.paradeGallery.length, 5, 'Nellie gallery is 02-06');
  assert.equal(nellie.trackworkVideo, undefined, 'no invented trackwork URL');
  assert.equal(nellie.trainerAudio, undefined, 'no invented audio URL');
  assert.ok(nellie.heroConformation.endsWith('/01.png'));
}

{
  for (const [slug, stills] of Object.entries(HORSE_STILLS)) {
    if (slug === 'lady-ketchikan') continue;
    assert.ok(stills[0]?.includes('/01.'), `${slug} cover must be 01`);
    stills.forEach((path, i) => {
      const n = String(i + 1).padStart(2, '0');
      assert.ok(path.includes(`/${n}.`), `${slug} still ${i} must be ${n}.*`);
    });
  }
}

{
  const gray = getTrainerCdnUrls('stephen-gray');
  assert.equal(gray.portrait, '/trainers/stephen-gray.png');
  const barbara = getTrainerCdnUrls('barbara-kennedy');
  assert.equal(barbara.portrait, '/trainers/barbara-kennedy.png');
  assert.notEqual(barbara.portrait, '/trainers/stephen-gray.png');
  const wexford = getTrainerCdnUrls('lance-osullivan');
  assert.equal(wexford.portrait, '/trainers/wexford.jpg');
}

console.log('✅ Stills convention: 01 cover, true extensions, no fake CDN, no yard mix-up');
