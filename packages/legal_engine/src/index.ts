/**
 * @evo/legal_engine — Evolution Stables DSL legal compiler.
 * Exports PDS/SA generators, validation, compilation, and types.
 */

export * from './types';
export * from './pricing';
export * from './term_sheet';
export * from './pds';
export * from './sa';
export * from './validator';
export * from './compiler';
export * from './settlement';

// Re-export hash helper for consumers who want to verify independently.
export { computeSha256, verifySha256 } from '@evo/storage/hash';
