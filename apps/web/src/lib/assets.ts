// Asset constants for images and media
export const MARKETING = {
  band1: '/images/content/background/hooves-black-white.jpg',
  band2: '/images/content/background/horse-double-black.png',
  hero: '/images/content/illustrations/hero.svg',
  alt: {
    horseAndFoal: '/images/content/background/horse-and-foal.jpg',
    landscapeOverlay: '/images/content/background/landscape-digital-overlay.jpg',
    hoovesOnGrass: '/images/content/background/hooves-on-grass.png',
  },
};

// Landing prototype assets
export const hero = MARKETING.band2;
export const horseLegs = MARKETING.alt.hoovesOnGrass;

export const LOGOS = {
  // Main logos
  main: '/images/brand/lockups/gold/lockup-horizontal-gold.svg',
  black: '/images/brand/lockups/black/lockup-horizontal-black.svg',
  white: '/images/brand/lockups/white/lockup-horizontal-white.svg',

  // Monochrome variants
  mono: {
    black: '/images/brand/monograms/black/monogram-black.svg',
    white: '/images/brand/monograms/white/monogram-white.svg',
    gold: '/images/brand/monograms/gold/monogram-gold.svg',
  },

  // Simple/icon versions
  simple: {
    black: '/images/brand/legacy/legacy-logo-black.png',
    gold: '/images/brand/legacy/legacy-logo-gold.png',
    grey: '/images/brand/legacy/legacy-logo-grey.png',
  },

  // Name logos (new)
  name: {
    black: '/images/brand/wordmarks/black/wordmark-black.svg',
    white: '/images/brand/wordmarks/white/wordmark-white.svg',
    gold: '/images/brand/wordmarks/gold/wordmark-gold.svg',
    grey: '/images/brand/wordmarks/grey/wordmark-grey.svg',
  },
};

export const ILLUSTRATIONS = {
  illus1: '/images/content/illustrations/illus-1.svg',
  illus2: '/images/content/illustrations/illus-2.svg',
  illus3: '/images/content/illustrations/illus-3.svg',
};

export const PLACEHOLDERS = {
  image: MARKETING.alt.horseAndFoal,
  avatar: LOGOS.simple.grey,
  logo: LOGOS.main,
};

// Evolution Stables Brand Colors
export const BRAND_COLORS = {
  gold: '#d4a964',
  gray: '#747474',
  white: '#ffffff',
  black: '#000000',
};
