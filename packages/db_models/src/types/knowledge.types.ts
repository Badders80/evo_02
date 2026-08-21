/**
 * Thoroughbred Knowledge Entity Graph — static reference types.
 * Canonical source of truth for sires, trainers, jockeys, breeders, and affinity relationships.
 * Authoritative over external scraped data.
 */

export interface SireProfile {
  slug: string;
  name: string;
  /** Country of origin, e.g. "IRE", "JPN", "FR", "AUS", "NZ". */
  country: string;
  /** Canonical stud farm slug (references BreederProfile). */
  studSlug: string;
  /** Sireline / stallion dynasty, e.g. "High Chaparral (Sadler's Wells)". */
  sireline: string;
  /** Free-form qualitative "type" signatures used in marketing/PDS copy, e.g. "lovely Contributer filly". */
  typeSignatures: string[];
  /** Typical distance range in metres, e.g. [1400, 2400]. */
  distanceProfile: [number, number];
  /** Stamina/speed characterization. */
  staminaScope: 'speed' | 'miler' | 'middle-distance' | 'stayer' | 'versatile';
  /** Notable Group/Listed-winning progeny. */
  notableProgeny: string[];
  /** Season service fee in NZD, if published and useful for context. */
  serviceFeeNzd?: number;
  /** Racing colours / type descriptors for PDS. */
  colourNote?: string;
}

export interface TrainerProfile {
  slug: string;
  /** Display name, e.g. "Lance O'Sullivan & Andrew Scott". */
  name: string;
  /** Stable brand name, e.g. "Wexford Stables". */
  stableName: string;
  /** Training base / location. */
  location: string;
  /** Training complex, if applicable. */
  base: string;
  /** Short philosophy / bio for PDS/marketing. */
  philosophy: string;
  /** Highlight tags safe for campaign marketing. */
  highlightTags?: string[];
}

export interface JockeyAffinity {
  /** Canonical horse slug (matches campaign slug where possible). */
  horseSlug: string;
  /** Display horse name. */
  horseName: string;
  /** Notes on the documented affinity, e.g. "rides her at Wexford". */
  notes: string;
}

export interface JockeyProfile {
  slug: string;
  name: string;
  nationality: string;
  /** Compact riding-style descriptor. */
  ridingStyle: string;
  /** Documented horse-jockey pairings. */
  affinities: JockeyAffinity[];
}

export interface BreederProfile {
  slug: string;
  name: string;
  /** Town/region. */
  location: string;
  /** Region for grouping, e.g. "Waikato". */
  region: string;
  /** Short reputation note. */
  reputation: string;
}
