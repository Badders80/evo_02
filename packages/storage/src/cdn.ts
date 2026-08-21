/**
 * Local still resolver for thoroughbred and trainer media.
 *
 * Folder convention (dumps of several images):
 *   public/horses/{slug}/01.{ext}  = cover
 *   public/horses/{slug}/02.{ext}+ = gallery, sequential
 * Extension matches file bytes (png / jpg / webp). Do not invent CDN URLs
 * for stills, video, or audio that are not on disk.
 */

export const DEFAULT_CDN_HOST = 'https://cdn.evolutionstables.nz';

/** 01 = cover. Remaining entries are gallery, in order. */
export const HORSE_STILLS: Record<string, readonly string[]> = {
  nellie: [
    '/horses/nellie/01.png',
    '/horses/nellie/02.webp',
    '/horses/nellie/03.webp',
    '/horses/nellie/04.webp',
    '/horses/nellie/05.webp',
    '/horses/nellie/06.webp',
  ],
  'lady-ketchikan': [
    '/horses/nellie/01.png',
    '/horses/nellie/02.webp',
    '/horses/nellie/03.webp',
    '/horses/nellie/04.webp',
    '/horses/nellie/05.webp',
    '/horses/nellie/06.webp',
  ],
  'tml-x-yearn': [
    '/horses/tml-x-yearn/01.png',
    '/horses/tml-x-yearn/02.webp',
    '/horses/tml-x-yearn/03.jpg',
  ],
  prudentia: [
    '/horses/prudentia/01.jpg',
    '/horses/prudentia/02.png',
    '/horses/prudentia/03.jpg',
    '/horses/prudentia/04.jpg',
  ],
  'first-gear': [
    '/horses/first-gear/01.png',
    '/horses/first-gear/02.jpg',
    '/horses/first-gear/03.jpg',
    '/horses/first-gear/04.jpg',
  ],
  'i-stole-a-manolo': [
    '/horses/i-stole-a-manolo/01.png',
    '/horses/i-stole-a-manolo/02.jpg',
    '/horses/i-stole-a-manolo/03.png',
    '/horses/i-stole-a-manolo/04.png',
  ],
  hottathanafantasy: [
    '/horses/hottathanafantasy/01.jpg',
    '/horses/hottathanafantasy/02.jpg',
  ],
};

/**
 * Portraits that exist on disk. Missing trainers (e.g. Barbara Kennedy) return
 * no portrait — never substitute another yard's photo.
 */
export const TRAINER_PORTRAITS: Record<string, string> = {
  'barbara-kennedy': '/trainers/barbara-kennedy.png',
  'stephen-gray': '/trainers/stephen-gray.png',
  'lance-osullivan': '/trainers/wexford.jpg',
  wexford: '/trainers/wexford.jpg',
  'wexford-stables': '/trainers/wexford.jpg',
};

export function getCdnUrl(key: string, cdnHost = DEFAULT_CDN_HOST): string {
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  const cleanHost = cdnHost.endsWith('/') ? cdnHost.slice(0, -1) : cdnHost;
  return `${cleanHost}/${cleanKey}`;
}

export interface HorseCdnOverrides {
  videoFilename?: string;
  audioFilename?: string;
}

function stillsFor(slug: string): readonly string[] {
  return HORSE_STILLS[slug] ?? [];
}

export function getHorseCdnUrls(
  slug: string,
  overrides?: HorseCdnOverrides,
  _cdnHost = DEFAULT_CDN_HOST
) {
  const stills = stillsFor(slug);
  const cover = stills[0];
  const gallery = stills.slice(1);

  const trackworkVideo = overrides?.videoFilename
    ? `/horses/${slug}/updates/${overrides.videoFilename}`
    : undefined;
  const trainerAudio = overrides?.audioFilename
    ? `/horses/${slug}/audio/${overrides.audioFilename}`
    : undefined;

  return {
    heroConformation: cover ?? '',
    paradeGallery: [...gallery],
    ...(trackworkVideo ? { trackworkVideo } : {}),
    ...(trainerAudio ? { trainerAudio } : {}),
  };
}

export function getTrainerCdnUrls(trainerSlug: string, _cdnHost = DEFAULT_CDN_HOST) {
  const portrait = TRAINER_PORTRAITS[trainerSlug];
  return {
    ...(portrait ? { portrait } : {}),
  };
}

export function getBrandCdnUrls(_cdnHost = DEFAULT_CDN_HOST) {
  return {
    crestGold: '/brand/logos/lockups/lockup-horizontal-gold.svg',
  };
}
