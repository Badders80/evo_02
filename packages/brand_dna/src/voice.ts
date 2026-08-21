/**
 * Evolution Stables — Brand Voice & Copy Standard (@evo/brand_dna)
 * Source of Truth: /evo_00/doc/VOICE_AND_TONE_MANUAL.md
 */

export const BRAND_VOICE = {
  standard: 'The Private Banker Standard',
  register: 'Grit & Elegance',
  persona: 'Professional but not stuffy, analytical but not cold, confident but not arrogant, visionary but grounded.',
  taglines: {
    primary: 'Ownership, evolved.',
    secondary: 'Own the Experience.',
    paired: 'Ownership, evolved. Own the Experience.',
    alternate: 'Ownership, reimagined.',
    hero: {
      title: 'The Future of Ownership Has Arrived',
      highlightWord: 'Ownership',
      sublabel: 'DIGITAL-SYNDICATION, BY EVOLUTION STABLES',
    },
    maisonMark: {
      primary: 'DIGITAL-SYNDICATION, BY EVOLUTION STABLES',
      format: '[DISCIPLINE], BY EVOLUTION STABLES',
      tracking: '0.25em',
      fontSize: '11px',
      usage: ['standalone_signoff_stamp', 'hero_category_sublabel', 'video_end_card', 'document_seal'],
    },
    triad: [
      'Grounded in tradition.',
      'Evolved through innovation.',
      'Ownership transformed.',
    ],
  },
  closers: [
    'From paddocks to participation — this is ownership, evolved.',
    'The sport’s legacy is centuries old. Its next chapter is written carefully.',
    'Because real ownership means everyone gets a way in.',
  ],
  rules: {
    activeVoice: true,
    britishEnglish: true,
    allowExclamationMarks: false,
    leadWithThoroughbred: true,
    maxParagraphWordCount: 90,
    minParagraphWordCount: 50,
  },
  regulatoryStance:
    'We act in line with regulated governing bodies and agencies to deliver compliant and regulated ownership stakes. Currently in New Zealand, we are licensed as an Authorised Syndicator under the NZTR, operating within the FMA Equine Exemption.',
  founderSignoff: 'Alex Baddeley · Evolution Stables',
} as const;

export const APPROVED_CTAS = {
  intelligence: 'View Analysis',
  telemetry: 'Explore Telemetry',
  onboarding: 'Enter Stable',
  action: 'Become an Owner',
  acquire: 'Acquire Units',
} as const;

export const VOCABULARY_WHITELIST = [
  'Thoroughbreds',
  'Racehorses',
  'Digital-Syndication',
  'Digitally-syndicated fractional ownership',
  'Units',
  'Stakes',
  'Co-owners',
  'The Stable',
  'The Syndicate',
  'The Campaign',
  'Payment',
  'Settlement',
  'Distribution',
  'Prize money',
  'Regulated',
  'Authorised Syndicator',
  'Accessible',
  'MyStable',
  'Sire',
  'Dam',
  'Broodmare Sire',
  'Pedigree',
  'Conformation',
  'Karaka Millions',
  'Scope',
  'Prep',
  'Rating',
] as const;

export const BANNED_TERMS = [
  // Crypto & Web3 Hype
  'crypto',
  'cryptocurrency',
  'blockchain',
  'web3',
  'rwa',
  'nft',
  'token',
  'tokens',
  'tokenised',
  'tokenized',
  'tokenisation',
  'tokenization',
  'tokinvest',
  'dapp',
  'mint',
  'wallet deposit',
  'on-ramp',
  // Slicing jargon
  'bits of horse',
  'pieces of horse',
  'parts of horse',
  // Gambling & False Promise
  'guaranteed return',
  'guaranteed profit',
  'guaranteed returns',
  'easy money',
  'sure thing',
  'locks',
  '10x',
  'roi multiplier',
  'yield promise',
  'betting',
  // Overused Buzzwords
  'disruptive',
  'game-changing',
  'democratizing',
  'democratises',
  'democratise',
  'revolutionary',
  // Anti-transparent / unhelpful descriptors
  'opaque',
] as const;

/**
 * Unified legal-banned superset, exported for @evo/legal_engine.
 * Includes marketing-banned terms plus legal/regulatory terms that must never appear
 * in PDS, SA, term sheet, or other regulated documents.
 */
export const BANNED_LEGAL_TERMS = [
  ...BANNED_TERMS,
  'dao',
  'dubai',
  'vara',
  'lead lessor',
  'fractional security',
  'security token',
  'micro-ownership',
  'micro ownership',
  'micro-shares',
  'micro shares',
] as const;

export interface CopyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/** Approved racing/bloodstock marketing tags for campaign highlight pills. */
export const RACING_TAG_TAXONOMY = [
  'By {Sire}',
  'Out of {Dam}',
  'Group 1 Sire Line',
  'Group 1 Winner',
  'Classic Frame & Scope',
  'Precocious 2YO Target',
  'Autumn 3YO Progression',
  'Spring 3YO Progression',
  'Miler Speed',
  'Stamina & Staying',
  'Heavy Track Proven',
  'Rating 65 Progressor',
  '{Trainer Stable} Trained',
  '{Training Base} Trained',
  'Byerley Park Trained',
  'Wexford Stables',
  'Stephen Gray Racing',
  'Copper Belt Lodge',
  'Karaka Millions Eligible',
  'New Owners Bonus',
] as const;

export interface TagValidationResult {
  valid: boolean;
  invalidTags: string[];
}

/**
 * Validates highlight tags against the approved racing tag taxonomy and banned terms.
 * Tags may include dynamic placeholders (e.g. "By Satono Aladdin (JPN)").
 */
export function validateHighlightTags(tags: string[]): TagValidationResult {
  const invalidTags: string[] = [];
  const bannedSet = new Set(BANNED_TERMS.map((t) => t.toLowerCase()));

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    // First gate: direct banned-term hit.
    for (const term of bannedSet) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(lowerTag)) {
        invalidTags.push(tag);
        break;
      }
    }
    // Second gate: tag must be substantive and not exclaim.
    if (tag.includes('!')) {
      if (!invalidTags.includes(tag)) invalidTags.push(tag);
    }
  }

  return {
    valid: invalidTags.length === 0,
    invalidTags: Array.from(new Set(invalidTags)),
  };
}

/**
 * Validates text against Evolution Stables copy and tone invariants.
 * Enforces the Private Banker Standard and strictly flags banned words and exclamation marks.
 */
export function validateCopy(
  text: string,
  options: { allowQuotesExclamation?: boolean; isStrict?: boolean } = { isStrict: true }
): CopyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lowerText = text.toLowerCase();

  // 1. Check for banned terms
  for (const term of BANNED_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(lowerText)) {
      errors.push(`Banned term detected: "${term}". Use approved vocabulary from @evo/brand_dna.`);
    }
  }

  // 2. Check for exclamation marks (unless within verbatim quotes if permitted)
  if (!options.allowQuotesExclamation && text.includes('!')) {
    errors.push('Exclamation marks are prohibited in Evolution Stables copy per the Private Banker Standard.');
  }

  // 3. Stylistic checks (warnings)
  if (lowerText.includes('fractional ownership') && !lowerText.includes('digital-syndicat') && !lowerText.includes('digitally-syndicat')) {
    warnings.push('Prefer "Digital-Syndication" or "Digitally-syndicated fractional ownership" over "fractional ownership" in isolation.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
