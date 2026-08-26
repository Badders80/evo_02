import { HORSE_STILLS } from '@evo/storage/cdn';

const PLACEHOLDER_HERO = '/brand/placeholder-hero.svg';

export function getHorseMediaWithFallback(slug: string): { heroConformation: string } {
  const stills = HORSE_STILLS[slug];
  const cover = stills?.[0];

  return {
    heroConformation: cover ?? PLACEHOLDER_HERO,
  };
}