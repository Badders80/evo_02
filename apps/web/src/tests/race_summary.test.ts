import assert from 'node:assert/strict';
import { computeRaceSummary } from '../lib/race-summary';

// 1. null raceLog → zeros, no crash
const nullResult = computeRaceSummary(null);
assert.deepEqual(nullResult, { wins: 0, places: 0, earnings: 0 }, 'null raceLog → zeros');

// 2. undefined raceLog → zeros, no crash
const undefResult = computeRaceSummary(undefined);
assert.deepEqual(undefResult, { wins: 0, places: 0, earnings: 0 }, 'undefined raceLog → zeros');

// 3. isWin = 1st; isPlace = 2nd/3rd; earnings sum
const mixed = computeRaceSummary([
  { date: '2026-01-01', venue: 'A', race: 'R1', result: '1st', prizemoney_nzd: 100 },
  { date: '2026-01-02', venue: 'A', race: 'R2', result: '2nd', prizemoney_nzd: 50 },
  { date: '2026-01-03', venue: 'A', race: 'R3', result: '3rd', prizemoney_nzd: 25 },
  { date: '2026-01-04', venue: 'A', race: 'R4', result: '4th', prizemoney_nzd: 10 },
]);
assert.equal(mixed.wins, 1, '1st counts as win');
assert.equal(mixed.places, 2, '2nd/3rd count as places');
assert.equal(mixed.earnings, 185, 'earnings sum of prizemoney_nzd');

// 4. prizemoney null/string handling — skip non-numbers
const dirty = computeRaceSummary([
  { date: '2026-01-01', venue: 'A', race: 'R1', result: '1st', prizemoney_nzd: 100 },
  { date: '2026-01-02', venue: 'A', race: 'R2', result: '2nd', prizemoney_nzd: null as unknown as number },
  { date: '2026-01-03', venue: 'A', race: 'R3', result: '3rd', prizemoney_nzd: 'not_a_number' as unknown as number },
  { date: '2026-01-04', venue: 'A', race: 'R4', result: '4th', prizemoney_nzd: 50 },
]);
assert.equal(dirty.wins, 1, 'win counted despite dirty prizemoney');
assert.equal(dirty.places, 2, '2nd and 3rd both count as places regardless of prizemoney');
assert.equal(dirty.earnings, 150, 'non-number prizemoney skipped');

// 5. earnings sum across all entries
const sum = computeRaceSummary([
  { date: '2026-01-01', venue: 'A', race: 'R1', result: '1st', prizemoney_nzd: 200 },
  { date: '2026-01-02', venue: 'A', race: 'R2', result: '2nd', prizemoney_nzd: 100 },
  { date: '2026-01-03', venue: 'A', race: 'R3', result: '3rd', prizemoney_nzd: 75 },
]);
assert.equal(sum.earnings, 375, 'earnings sum across entries');

console.log('✅ race-summary: null/undefined → zeros; 1st=win, 2nd/3rd=place; earnings sum skips non-numbers');
