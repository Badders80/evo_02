import type { TrainerProfile } from '../types/knowledge.types';
import { STEPHEN_GRAY_RACING } from './asset-lock';

export const TRAINERS: TrainerProfile[] = [
  {
    slug: 'barbara-kennedy',
    name: 'Barbara Kennedy',
    stableName: 'Barbara Kennedy Racing',
    location: 'Byerley Park, Karaka, NZ',
    base: 'Byerley Park',
    philosophy:
      'Boutique racing stable specialising in individualised conditioning, campaign strategy, and hands-on preparation at the renowned Byerley Park training complex in Karaka.',
    highlightTags: ['Boutique Conditioning', 'Byerley Park', 'Karaka'],
  },
  {
    slug: 'lance-osullivan',
    name: "Lance O'Sullivan & Andrew Scott",
    stableName: 'Wexford Stables',
    location: 'Matamata, NZ',
    base: 'Wexford Stables',
    philosophy:
      "A name synonymous with excellence in New Zealand racing history. Wexford Stables continues its legacy under the leadership of Lance O'Sullivan ONZM and Andrew Scott in Matamata.",
    highlightTags: ['Wexford Stables', 'Matamata', 'Premier Stable'],
  },
  {
    slug: STEPHEN_GRAY_RACING.slug,
    name: STEPHEN_GRAY_RACING.name,
    stableName: STEPHEN_GRAY_RACING.stableName,
    location: STEPHEN_GRAY_RACING.location,
    base: STEPHEN_GRAY_RACING.base,
    philosophy:
      'Group 1-winning international trainer with over 825 winners across Singapore and New Zealand. Trades as Stephen Gray Racing from Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476.',
    highlightTags: ['Stephen Gray Racing', 'Copper Belt Lodge'],
  },
] as const;

export type TrainerSlug = (typeof TRAINERS)[number]['slug'];
