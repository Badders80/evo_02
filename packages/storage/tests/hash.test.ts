import assert from 'node:assert/strict';
import { computeSha256, verifySha256 } from '../src/hash';

console.log('Running @evo/storage isomorphic SHA-256 NIST test vectors...\n');

// NIST Test Vector 1: Empty string
const emptyHash = computeSha256('');
assert.equal(
  emptyHash,
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'Empty string hash must match NIST standard'
);
assert.equal(verifySha256('', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'), true);

// NIST Test Vector 2: "abc"
const abcHash = computeSha256('abc');
assert.equal(
  abcHash,
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  '"abc" hash must match NIST standard'
);
assert.equal(verifySha256('abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'), true);

// Known Test Vector 3: "hello world"
const helloHash = computeSha256('hello world');
assert.equal(
  helloHash,
  'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
  '"hello world" hash must match standard test vector'
);

console.log('✅ All isomorphic SHA-256 test vectors PASSED!\n');
