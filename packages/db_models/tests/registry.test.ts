/**
 * Knowledge Registry tests.
 */

import assert from 'node:assert';
import {
  getSire,
  getTrainer,
  getJockey,
  getBreeder,
  getAllSires,
  getJockeysForHorse,
  LOCKED_HORSES,
  STEPHEN_GRAY_RACING,
  RESEARCH_ONLY_TRAINER_SLUGS,
  BANNED_STEPHEN_GRAY_ENTITY_NAMES,
  getLockedHorse,
} from '../src/registry';
import { SIRES, TRAINERS, JOCKEYS, BREEDERS } from '../src/registry';

console.log('Running knowledge registry tests...');

// 1. Lookup helpers
{
  const sire = getSire('contributer');
  assert.ok(sire, 'getSire("contributer") should return the Contributer profile');
  assert.equal(sire.name, 'Contributer (IRE)');
  assert.equal(sire.studSlug, 'mapperley');
  assert.ok(sire.notableProgeny.includes("Lion's Roar"), 'Contributer progeny should include Lion\'s Roar');

  const sireByName = getSire('Satono Aladdin (JPN)');
  assert.ok(sireByName, 'getSire should accept canonical name');
  assert.equal(sireByName?.slug, 'satono-aladdin');

  const trainer = getTrainer('barbara-kennedy');
  assert.ok(trainer, 'getTrainer("barbara-kennedy") should return Barbara Kennedy');
  assert.equal(trainer.stableName, 'Barbara Kennedy Racing');

  const jockey = getJockey('masa-hashizume');
  assert.ok(jockey, 'getJockey("masa-hashizume") should return Masa Hashizume');
  assert.equal(jockey.nationality, 'Japanese');
  assert.equal(jockey.affinities[0]?.horseSlug, 'prudentia');

  const breeder = getBreeder('windsor-park');
  assert.ok(breeder, 'getBreeder("windsor-park") should return Windsor Park Stud');
  assert.equal(breeder.location, 'Cambridge');

  console.log('✅ Lookup helpers return correct canonical records');
}

// 2. Jockey affinity query
{
  const prudentiaJockeys = getJockeysForHorse('prudentia');
  assert.equal(prudentiaJockeys.length, 1, 'Exactly one documented jockey affinity for Prudentia');
  assert.equal(prudentiaJockeys[0].slug, 'masa-hashizume');

  const firstGearJockeys = getJockeysForHorse('first-gear');
  assert.equal(firstGearJockeys.length, 1);
  assert.equal(firstGearJockeys[0].slug, 'bruno-queiroz');

  console.log('✅ Jockey affinity queries work');
}

// 3. Name + lifeNumber uniqueness (here: slug uniqueness on registry reference data)
{
  const allSlugs = [...getAllSires().map((s) => s.slug), ...TRAINERS.map((t) => t.slug), ...JOCKEYS.map((j) => j.slug), ...BREEDERS.map((b) => b.slug)];
  const uniqueSlugs = new Set(allSlugs);
  assert.equal(uniqueSlugs.size, allSlugs.length, 'All registry slugs must be unique');

  console.log('✅ Registry slug uniqueness verified');
}


// 4. Brand-voice seed gate: every string literal in registry seeds must pass validateCopy
{
  const { validateCopy } = require('@evo/brand_dna/voice');

  function collectStrings(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(collectStrings);
    if (value && typeof value === 'object') return Object.values(value as object).flatMap(collectStrings);
    return [];
  }

  const seedStrings = [
    ...collectStrings(SIRES),
    ...collectStrings(TRAINERS),
    ...collectStrings(JOCKEYS),
    ...collectStrings(BREEDERS),
  ];

  for (const s of seedStrings) {
    const result = validateCopy(s);
    assert.equal(result.isValid, true, `Seed string failed brand voice: "${s}" — ${result.errors.join(', ')}`);
  }

  console.log(`✅ Brand-voice seed gate passed for ${seedStrings.length} registry strings`);
}

{
  assert.equal(LOCKED_HORSES.length, 6);
  assert.equal(getLockedHorse('first-gear')?.listingStatus, 'completed');
  assert.equal(getLockedHorse('first-gear')?.checkoutOpen, false);
  assert.equal(getLockedHorse('tml-x-yearn')?.trainerSlug, 'stephen-gray');
  assert.equal(getLockedHorse('tml-x-yearn')?.ownerSlug, 'stephen-gray');
  assert.equal(STEPHEN_GRAY_RACING.name, 'Stephen Gray Racing');
  assert.equal(STEPHEN_GRAY_RACING.stableName, 'Stephen Gray Racing');
  assert.ok(STEPHEN_GRAY_RACING.location.includes('160 Green Road'));
  assert.ok(STEPHEN_GRAY_RACING.location.includes('Palmerston North'));
  assert.equal(STEPHEN_GRAY_RACING.base, 'Copper Belt Lodge');

  const trainerSlugs = TRAINERS.map((t) => t.slug);
  for (const banned of RESEARCH_ONLY_TRAINER_SLUGS) {
    assert.equal(trainerSlugs.includes(banned), false, `${banned} must not be a live trainer`);
  }

  const gray = getTrainer('stephen-gray');
  assert.ok(gray);
  assert.equal(gray.name, 'Stephen Gray Racing');
  const blob = JSON.stringify(TRAINERS).toLowerCase();
  for (const banned of BANNED_STEPHEN_GRAY_ENTITY_NAMES) {
    assert.equal(blob.includes(banned.toLowerCase()), false, `banned entity "${banned}" leaked into trainers`);
  }
  assert.equal(/stephen gray stables/.test(blob), false);

  console.log('✅ Live asset lock: Stephen Gray Racing only, research trainers excluded, First Gear completed');
}

console.log('🎉 All knowledge registry tests passed.');
