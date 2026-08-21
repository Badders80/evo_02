/**
 * Knowledge Entity Registry — canonical lookup helpers.
 */

import { SIRES } from './data/sires';
import { TRAINERS } from './data/trainers';
import { JOCKEYS } from './data/jockeys';
import { BREEDERS } from './data/breeders';
import type {
  SireProfile,
  TrainerProfile,
  JockeyProfile,
  BreederProfile,
} from './types/knowledge.types';

export { SIRES, TRAINERS, JOCKEYS, BREEDERS };
export {
  LOCKED_HORSES,
  STEPHEN_GRAY_RACING,
  BAX_BLOODSTOCK,
  MANAGER_PUBLIC_NAME,
  MANAGER_LEGAL_NAME,
  BANNED_STEPHEN_GRAY_ENTITY_NAMES,
  RESEARCH_ONLY_TRAINER_SLUGS,
  getLockedHorse,
  ownerDisplayName,
} from './data/asset-lock';
export type { LockedHorseAsset, ListingStatus, LiveOwnerSlug } from './data/asset-lock';
export type {
  SireProfile,
  TrainerProfile,
  JockeyProfile,
  BreederProfile,
} from './types/knowledge.types';

function normalizeKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function findBySlugOrName<T extends { slug: string; name: string }>(
  list: readonly T[],
  slugOrName: string
): T | undefined {
  const normalizedInput = normalizeKey(slugOrName);
  return (
    list.find((item) => item.slug === slugOrName.toLowerCase()) ??
    list.find((item) => normalizeKey(item.name) === normalizedInput) ??
    list.find((item) => item.slug === slugOrName.replace(/\s+/g, '-').toLowerCase())
  );
}

export function getSire(slugOrName: string): SireProfile | undefined {
  return findBySlugOrName(SIRES, slugOrName);
}

export function getTrainer(slugOrName: string): TrainerProfile | undefined {
  return findBySlugOrName(TRAINERS, slugOrName);
}

export function getJockey(slugOrName: string): JockeyProfile | undefined {
  return findBySlugOrName(JOCKEYS, slugOrName);
}

export function getBreeder(slugOrName: string): BreederProfile | undefined {
  return findBySlugOrName(BREEDERS, slugOrName);
}

export function getAllSires(): readonly SireProfile[] {
  return SIRES;
}

export function getAllTrainers(): readonly TrainerProfile[] {
  return TRAINERS;
}

export function getAllJockeys(): readonly JockeyProfile[] {
  return JOCKEYS;
}

export function getAllBreeders(): readonly BreederProfile[] {
  return BREEDERS;
}

/** Find jockeys with a documented affinity for a given horse slug. */
export function getJockeysForHorse(horseSlug: string): JockeyProfile[] {
  return JOCKEYS.filter((j) =>
    j.affinities.some((a) => a.horseSlug.toLowerCase() === horseSlug.toLowerCase())
  );
}
