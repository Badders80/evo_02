/**
 * Evolution Stables — Brand Identity (@evo/brand_dna)
 * Source of Truth: /evo_00/doc/IDENTITY.md (LOCKED 2026-08-25, ADR-007)
 * Supersedes: taglines.triad in voice.ts (old "Evolution Triad" cadence).
 */

export const BRAND_IDENTITY = {
  categoryLine:
    'Evolution Stables — New Zealand regulated digital-syndication of Thoroughbreds.',
  corePromise:
    "Racing isn't a VIP spectacle you watch. It's a human relationship you belong to.",
  triad: [
    {
      pillar: 'Grounded in Heritage.',
      essence:
        "The ritual is older than us and outlives us — the trainer's stopwatch, the silks, the parade ring. We inherit it; we never reinvent it.",
    },
    {
      pillar: 'Evolved Through Tradition.',
      essence:
        'Technology serves the sport, never replaces it. Fractional syndication is how the model endures — the ritual holds; the circle widens.',
    },
    {
      pillar: 'Own the Experience.',
      essence:
        'Not access. Not VIP. You hold the share, you get the game plan, you stand in the photo. The feeling doesn\u2019t rent \u2014 it compounds.',
    },
  ],
  cadence:
    'Grounded in Heritage. Evolved Through Tradition. Evolution Stables. Own the Experience.',
  weAre: [
    'NZTR Authorised Syndicator operating under FMA equine exemptions',
    'Real Thoroughbreds, real trainers, real race days',
    'Transparent reporting',
    'Marketplace + MyStable owner portal',
  ],
  weAreNot: [
    'A gambling or betting platform',
    'A crypto/blockchain/NFT project',
    'An entertainment-only racing club without real ownership',
    'A traditional syndicate that hides the admin',
  ],
  rules: {
    /** First rule of ownership price: price never appears in the story. Late-funnel overlays only. */
    priceNeverInStory: true,
    /** Silent Gavel applies everywhere — no justification, no negation openers, authoritative "we". */
    silentGavelEverywhere: true,
    /** AI-generated narrative characters are fictional; never imply real-stable/trainer/jockey endorsement. */
    noBorrowedAuthority: true,
    /** Surfaces derive from doc/IDENTITY.md; they never redefine identity locally. */
    surfacesDeriveNeverDefine: true,
  },
} as const;
