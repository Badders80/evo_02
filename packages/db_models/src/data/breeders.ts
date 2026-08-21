import type { BreederProfile } from '../types/knowledge.types';

export const BREEDERS: BreederProfile[] = [
  {
    slug: 'windsor-park',
    name: 'Windsor Park Stud',
    location: 'Cambridge',
    region: 'Waikato',
    reputation:
      'Historic Waikato stud farm and commercial nursery renowned for stallion excellence and sales-ring success.',
  },
  {
    slug: 'rich-hill',
    name: 'Rich Hill Stud',
    location: 'Matamata',
    region: 'Waikato',
    reputation:
      'Leading Matamata nursery and stallion farm, home to top-tier sires including Proisir and Satono Aladdin.',
  },
  {
    slug: 'cambridge',
    name: 'Cambridge Stud',
    location: 'Cambridge',
    region: 'Waikato',
    reputation:
      'World-class Waikato stud with an internationally recognised broodmare band and stallion roster.',
  },
  {
    slug: 'mapperley',
    name: 'Mapperley Stud',
    location: 'Matamata',
    region: 'Waikato',
    reputation:
      'Matamata-based stud specialising in value and boutique stallion operations, home of Contributer.',
  },
  {
    slug: 'waikato',
    name: 'Waikato Stud',
    location: 'Matamata',
    region: 'Waikato',
    reputation:
      'Pioneering Waikato nursery and home of Champion Sire Savabeel; celebrated for classic staying bloodlines.',
  },
] as const;

export type BreederSlug = (typeof BREEDERS)[number]['slug'];
