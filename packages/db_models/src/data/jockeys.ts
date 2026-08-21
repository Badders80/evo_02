import type { JockeyProfile } from '../types/knowledge.types';

export const JOCKEYS: JockeyProfile[] = [
  {
    slug: 'masa-hashizume',
    name: 'Masa Hashizume',
    nationality: 'Japanese',
    ridingStyle: 'Lightweight, patient tactician with a strong finish.',
    affinities: [
      {
        horseSlug: 'prudentia',
        horseName: 'Prudentia',
        notes: 'Documented affinity; rides her at Wexford Stables.',
      },
    ],
  },
  {
    slug: 'bruno-queiroz',
    name: 'Bruno Queiroz',
    nationality: 'Brazilian',
    ridingStyle: 'Natural lightweight, agile front-runner with tactical speed.',
    affinities: [
      {
        horseSlug: 'first-gear',
        horseName: 'First Gear',
        notes: 'Documented affinity; regular partner on First Gear.',
      },
    ],
  },
  {
    slug: 'craig-grylls',
    name: 'Craig Grylls',
    nationality: 'New Zealand',
    ridingStyle: 'Champion jockey; aggressive, timing-based finisher.',
    affinities: [],
  },
] as const;

export type JockeySlug = (typeof JOCKEYS)[number]['slug'];
