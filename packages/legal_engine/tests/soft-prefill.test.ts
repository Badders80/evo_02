import assert from 'node:assert/strict';
import { prefillSoftSections, sectionOf } from '../src/soft-prefill';

const manolo = prefillSoftSections({
  horseSlug: 'i-stole-a-manolo',
  stableSlug: 'wexford-stables',
  sirePedigreeSlug: 'satono-aladdin',
  trainerPersonSlugs: ['lance-osullivan', 'andrew-scott'],
  barnName: 'I Stole A Manolo',
  racingStatus: 'in early education at Wexford Stables',
});
assert.ok(manolo.aboutHorse.includes('Satono Aladdin'), 'manolo aboutHorse');
assert.ok(manolo.trainerBio.includes('Wexford'), 'manolo trainerBio');
assert.ok(
  manolo.racingOutlookAndPedigree.includes('Deep Impact') ||
    manolo.racingOutlookAndPedigree.includes('miler'),
  'manolo outlook'
);
assert.ok(manolo.raceExpectation.includes('I Stole A Manolo'), 'manolo expectation');
assert.equal(manolo.provenance.length, 4, 'manolo provenance x4');

const hotta = prefillSoftSections({
  horseSlug: 'hottathanafantasy',
  stableSlug: 'wexford-stables',
  sirePedigreeSlug: 'contributer',
  trainerPersonSlugs: ['lance-osullivan', 'andrew-scott'],
  barnName: 'Coco',
  racingStatus: 'building toward her first educational trial',
});
assert.ok(hotta.aboutHorse.length > 50, 'hotta aboutHorse');
assert.ok(hotta.trainerBio.includes('Wexford'), 'hotta trainerBio');
assert.ok(hotta.racingOutlookAndPedigree.includes('Contributer'), 'hotta outlook');
assert.ok(hotta.raceExpectation.includes('Coco'), 'hotta expectation');

const mulan = prefillSoftSections({
  horseSlug: 'turn-me-loose-x-yearn',
  sirePedigreeSlug: 'turn-me-loose', // no pedigree profile — falls back to horse ## Pedigree
  barnName: 'Mulan',
});
assert.ok(mulan.racingOutlookAndPedigree.includes('Turn Me Loose'), 'mulan pedigree fallback');

const ghost = prefillSoftSections({ horseSlug: 'no-such-horse' });
assert.equal(ghost.aboutHorse, '', 'ghost aboutHorse blank');
assert.equal(ghost.trainerBio, '', 'ghost trainerBio blank');
assert.equal(ghost.racingOutlookAndPedigree, '', 'ghost outlook blank');
assert.ok(ghost.raceExpectation.includes('no-such-horse'), 'ghost expectation templated');

assert.equal(sectionOf('# T\n\n## Profile\n\nHello\n\n## Other\n\nX', (h) => h === 'profile'), 'Hello');
assert.equal(sectionOf('# T\n\nBody only', (h) => h === 'profile'), '');

console.log('soft-prefill: all assertions passed');
