/**
 * Cloudflare R2 Public CDN Resolver ($0.00 / GB Egress)
 * Canonical Authority: evo_00/migration_bridge/03_ASSET_TRANSFERS.md
 */

export const DEFAULT_CDN_HOST = 'https://cdn.evolutionstables.nz';

/**
 * Locked launch campaign asset manifests per 03_ASSET_TRANSFERS.md
 */
export const LOCKED_CAMPAIGN_ASSETS: Record<
  string,
  {
    videoKey: string;
    audioKey: string;
  }
> = {
  'lady-ketchikan': {
    videoKey: 'horses/lady-ketchikan/updates/cambridge_gallop.mp4',
    audioKey: 'horses/lady-ketchikan/audio/kylie_update_aug.mp3',
  },
  nellie: {
    videoKey: 'horses/lady-ketchikan/updates/cambridge_gallop.mp4',
    audioKey: 'horses/lady-ketchikan/audio/kylie_update_aug.mp3',
  },
  'tml-x-yearn': {
    videoKey: 'horses/tml-x-yearn/updates/intro_reel.mp4',
    audioKey: 'horses/tml-x-yearn/audio/stephen_update_aug.mp3',
  },
};

/**
 * Resolves an object key to its public Cloudflare CDN URL.
 */
export function getCdnUrl(key: string, cdnHost = DEFAULT_CDN_HOST): string {
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  const cleanHost = cdnHost.endsWith('/') ? cdnHost.slice(0, -1) : cdnHost;
  return `${cleanHost}/${cleanKey}`;
}

export interface HorseCdnOverrides {
  videoFilename?: string;
  audioFilename?: string;
}

export const KNOWN_HORSE_HEROES: Record<string, string> = {
  nellie: '/horses/nellie/01_hero.png',
  'lady-ketchikan': '/horses/nellie/01_hero.png',
  'tml-x-yearn': '/horses/tml-x-yearn/01_hero.png',
  prudentia: '/horses/prudentia/01_hero.jpg',
  'first-gear': '/horses/first-gear/01_hero.png',
  'i-stole-a-manolo': '/horses/i-stole-a-manolo/01_hero.png',
  hottathanafantasy: '/horses/hottathanafantasy/01_hero.jpg',
};

export const KNOWN_HORSE_GALLERIES: Record<string, string[]> = {
  nellie: [
    '/horses/nellie/02_conformation_side.jpg',
    '/horses/nellie/03_conformation_front.png',
    '/horses/nellie/04_yearling_1.jpg',
    '/horses/nellie/05_yearling_2.jpg',
  ],
  'tml-x-yearn': [
    '/horses/tml-x-yearn/02_card_bg.png',
    '/horses/tml-x-yearn/03_vimeo_thumb.jpg',
  ],
  prudentia: [
    '/horses/prudentia/02_action.png',
    '/horses/prudentia/03_tauranga_finish.png',
    '/horses/prudentia/04_gallery_02.jpeg',
    '/horses/prudentia/05_gallery_03.jpg',
  ],
  'first-gear': [
    '/horses/first-gear/02_gallery_02.jpg',
    '/horses/first-gear/03_gallery_03.jpg',
    '/horses/first-gear/04_gallery_04.jpg',
  ],
  'i-stole-a-manolo': [
    '/horses/i-stole-a-manolo/02_gallery_02.jpg',
    '/horses/i-stole-a-manolo/03_gallery_03.png',
    '/horses/i-stole-a-manolo/04_gallery_04.png',
  ],
  hottathanafantasy: [
    '/horses/hottathanafantasy/02_gallery_02.jpg',
  ],
};

export const KNOWN_TRAINER_PORTRAITS: Record<string, string> = {
  'stephen-gray': '/trainers/stephen-gray.jpg',
  'wexford-stables': '/trainers/wexford.jpg',
  wexford: '/trainers/wexford.jpg',
  'barbara-kennedy': '/trainers/stephen-gray.jpg',
};

/**
 * Generates CDN or local public URLs for thoroughbred campaign media.
 */
export function getHorseCdnUrls(
  slug: string,
  overrides?: HorseCdnOverrides,
  cdnHost = DEFAULT_CDN_HOST
) {
  const canonical = LOCKED_CAMPAIGN_ASSETS[slug];

  const videoKey =
    overrides?.videoFilename
      ? `horses/${slug}/updates/${overrides.videoFilename}`
      : canonical?.videoKey ?? `horses/${slug}/updates/trackwork.mp4`;

  const audioKey =
    overrides?.audioFilename
      ? `horses/${slug}/audio/${overrides.audioFilename}`
      : canonical?.audioKey ?? `horses/${slug}/audio/trainer_update.mp3`;

  const heroConformation =
    KNOWN_HORSE_HEROES[slug] ?? getCdnUrl(`horses/${slug}/hero/conformation.webp`, cdnHost);

  const paradeGallery =
    KNOWN_HORSE_GALLERIES[slug] ?? [
      getCdnUrl(`horses/${slug}/gallery/parade_01.webp`, cdnHost),
      getCdnUrl(`horses/${slug}/gallery/parade_02.webp`, cdnHost),
    ];

  return {
    heroConformation,
    pedigreeBloodline: getCdnUrl(`horses/${slug}/hero/pedigree.webp`, cdnHost),
    paradeGallery,
    trackworkVideo: getCdnUrl(videoKey, cdnHost),
    trainerAudio: getCdnUrl(audioKey, cdnHost),
  };
}

/**
 * Generates URLs for trainer portraits and media.
 */
export function getTrainerCdnUrls(trainerSlug: string, cdnHost = DEFAULT_CDN_HOST) {
  return {
    portrait:
      KNOWN_TRAINER_PORTRAITS[trainerSlug] ??
      getCdnUrl(`trainers/${trainerSlug}/portrait.webp`, cdnHost),
  };
}

/**
 * Generates CDN URLs for brand identity, logos, and silks.
 */
export function getBrandCdnUrls(cdnHost = DEFAULT_CDN_HOST) {
  return {
    crestGold: '/brand/logos/lockups/lockup-horizontal-gold.svg',
    primarySilks: getCdnUrl('brand/silks/evolution_primary.webp', cdnHost),
  };
}
