/**
 * Stable-level website + social links (trainer tab Phase 1.5, founder-locked
 * 2026-08-30). Icons render ONLY when a link exists.
 *
 * Source of truth: evo_01/02_website/src/data/trainers.json (verified
 * 2026-08-30). Known data-hygiene issue (logged, page-model-notes):
 * Byerley Park's x_url in the source json points at Logan Racing's handle —
 * it is deliberately NOT carried here (render-rule: no known-wrong links).
 * MC data-hygiene task will fill/correct socials per stable.
 */

export interface StableLinks {
  website: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
}

export const STABLE_LINKS: Record<string, StableLinks> = {
  'barbara-kennedy': {
    website: 'https://www.byerleypark.co.nz',
  },
  'lance-osullivan': {
    website: 'https://wexfordstables.co.nz',
  },
  'stephen-gray': {
    website: 'https://stephengrayracing.com',
  },
};

export function getStableLinks(trainerSlug: string): StableLinks | undefined {
  return STABLE_LINKS[trainerSlug];
}