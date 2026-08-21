import {
  computeDslPricing,
  type DslPricing,
  compileLegalPack,
  type CompiledLegalPack,
  type HorseSoftLegalContent,
  type HorseMarketingContent,
} from '@evo/legal_engine';
import {
  getSire,
  getTrainer,
  getLockedHorse,
  ownerDisplayName,
  type ListingStatus,
} from '@evo/db_models';
import { validateHighlightTags } from '@evo/brand_dna/voice';
import { getHorseCdnUrls, getTrainerCdnUrls } from '@evo/storage/cdn';

export interface HorseCampaign {
  slug: string;
  legalName: string;
  barnName?: string;
  wholesaleMonthlyNzd: number;
  totalSyndicateStakePct: number;
  softLegal: HorseSoftLegalContent;
  marketing: HorseMarketingContent;
  listingStatus: ListingStatus;
  owner: {
    entity: string;
    contact: string;
  };
  trainer: {
    name: string;
    stable: string;
    location: string;
    slug: string;
  };
  pedigree: {
    sire: string;
    dam: string;
    damSire: string;
    lineageSummary: string;
    foalingDate: string;
    gender: string;
    colour: string;
    breeder: string;
    microchip: string;
    lifeNumber: string;
    studBookUrl: string;
  };
  capTableFixture: {
    retainedPct: number;
    allocatedPct: number;
    reservedPct: number;
    availablePct: number;
    totalInvestors: number;
  };
  closeStyle: 'fourteen_day' | 'three_x_remaining';
  listingPlatform?: 'evolution' | 'tokinvest' | string;
}

/**
 * 3-Tier Thoroughbred Naming Standard Formatter.
 * Formats official name with optional yard barn name.
 */
export function formatHorseDisplayName(
  horse: { legalName: string; barnName?: string },
  options: { includeBarnName?: boolean } = { includeBarnName: true }
): string {
  if (!horse.barnName || !options.includeBarnName || horse.barnName.toLowerCase() === horse.legalName.toLowerCase()) {
    return horse.legalName;
  }
  return `${horse.legalName} (${horse.barnName})`;
}

export const CAMPAIGNS_DATA: Record<string, HorseCampaign> = {
  nellie: {
    slug: 'nellie',
    legalName: 'Lady Ketchikan (NZ)',
    barnName: 'Nellie',
    wholesaleMonthlyNzd: 7000,
    totalSyndicateStakePct: 5.0,
    softLegal: {
      aboutHorse:
        'Lady Ketchikan (barn name Nellie) is a classic-framed 3YO filly by European Champion 3YO Almanzor out of the Danzero mare Night Danza. Foaled on 20 October 2023, she carries a deliberate balance of European classic staying scope and proven Australian sprint bloodlines. Her sire Almanzor captured three Group 1 titles across Europe before establishing himself in New Zealand with classic winners including Dynastic and Manzoice. Her dam brings the precocious speed of Golden Slipper winner Danzero. In active race preparation at Byerley Park, Nellie shows a deep heart girth, strong rein, and a fluid, ground-covering gallop that suits progressive middle-distance racing.',
      trainerBio:
        'Nellie is prepared by Barbara Kennedy from her boutique stable at the Byerley Park training complex in Karaka. Barbara operates an individualized training model focused on progressive conditioning, patience, and matching each thoroughbred’s developmental maturity to the right black-type pathway.',
      racingOutlookAndPedigree:
        'By European Champion 3YO Almanzor, sire of Group 1 Derby winners across New Zealand and Australia, out of Night Danza by Golden Slipper champion Danzero. Nellie’s physical build and pedigree profile point to an initial racing campaign over sprint-miler journeys before stretching out over classic 3YO autumn distances (1600m to 2000m). Her developmental target is a spring preparation leading into the autumn 3YO fillies\' series.',
    },
    marketing: {
      marketplaceHook:
        'Classic 3YO filly by European Champion sire Almanzor, in active race preparation at Byerley Park.',
      highlightTags: [
        'By Almanzor (FR)',
        'Classic Frame & Scope',
        'Byerley Park Trained',
        'Autumn 3YO Progression',
      ],
      highlights: [
        'Classic Sire Line: By European Champion 3YO Almanzor, sire of Group 1 Derby winners Dynastic & Manzoice.',
        'Australian Speed Injection: Dam Night Danza is by Golden Slipper champion Danzero, balancing staying power with sharp juvenile speed.',
        'Physical Frame: True classic staying build with deep girth and fluid stride, suited to 1600m–2000m progression.',
        'Boutique Conditioning: Conditioned by Barbara Kennedy at Byerley Park with an emphasis on tailored, individualized progression.',
        'Target Pathway: Progressive spring foundation targeting the premier Autumn 3YO fillies\' classic series.',
      ],
    },
    listingStatus: 'listed',
    owner: {
      entity: 'B.A.X Bloodstock',
      contact: 'Kylie Bax',
    },
    trainer: {
      name: 'Barbara Kennedy',
      stable: 'Barbara Kennedy Racing',
      location: 'Byerley Park, Karaka, NZ',
      slug: 'barbara-kennedy',
    },
    pedigree: {
      sire: 'Almanzor (FR)',
      dam: 'Night Danza (AUS)',
      damSire: 'Danzero (AUS)',
      lineageSummary:
        'By European Champion 3YO Almanzor (sire of Group 1 winners Dynastic and Manzoice). Dam Night Danza brings proven Australian speed through Golden Slipper winner Danzero.',
      foalingDate: '2023-10-20',
      gender: 'Filly',
      colour: 'Bay or Brown',
      breeder: 'Mrs H G & W G Bax',
      microchip: '985125000137408',
      lifeNumber: 'NZ00454763',
      studBookUrl: 'https://loveracing.nz/Breeding/454763/Lady-Ketchikan-NZ-2023.aspx',
    },
    capTableFixture: {
      retainedPct: 95.0,
      allocatedPct: 0.0,
      reservedPct: 0.0,
      availablePct: 5.0,
      totalInvestors: 0,
    },
    closeStyle: 'fourteen_day',
    listingPlatform: 'evolution',
  },
  'tml-x-yearn': {
    slug: 'tml-x-yearn',
    legalName: 'Turn Me Loose x Yearn 2023',
    barnName: 'Mulan',
    wholesaleMonthlyNzd: 6000,
    totalSyndicateStakePct: 5.0,
    softLegal: {
      aboutHorse:
        'Turn Me Loose x Yearn 2023 (barn name Mulan) is a bay 2YO filly by triple Group 1-winning miler Turn Me Loose out of Group 2 Auckland Thoroughbred Breeders\' Stakes winner Yearn, by Champion Sire Savabeel. Foaled on 17 August 2023, she represents a deliberate cross of proven Australian miler speed with the durable, black-type form of a New Zealand staying mare. Her immediate family combines precocity with resilience: Turn Me Loose won Group 1 races between 1400 metres and 1600 metres, while Yearn was a stakes-performed miler who banked $339,895 in prizemoney. In early education at Copper Belt Lodge, Mulan has shown the alertness and balanced action that fit the typical early-2YO campaign of her pedigree, without asking for more than she is ready to give.',
      trainerBio:
        'Mulan is prepared by Stephen Gray Racing from Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476. A Group 1-winning international trainer, Stephen returned to New Zealand after a long Singapore career and now trains from the family yard alongside his father, Kevin Gray.',
      racingOutlookAndPedigree:
        'By Turn Me Loose, a three-time Group 1 winner in New Zealand and Australia (2014 NZ 2000 Guineas, 2015 VRC Emirates Stakes, 2016 MRC Futurity Stakes), out of Yearn, a Group 2 Auckland Thoroughbred Breeders\' Stakes winner by Champion Sire Savabeel. Mulan\'s pedigree profile fits an early 2YO speed campaign through the late spring and summer, with the scope to stretch to mile-graded company as a 3YO filly. The target pathway is a 2YO introduction over sprint–miler distances, then progression into the autumn 3YO fillies\' events.',
    },
    marketing: {
      marketplaceHook:
        'Precocious 2YO filly by triple Gr.1 winner Turn Me Loose out of Gr.2 winner Yearn ($339k).',
      highlightTags: [
        'Out of Gr.2 Winner Yearn ($339k)',
        'Triple Gr.1 Sire Line',
        'Precocious 2YO Target',
        'Stephen Gray Racing',
      ],
      highlights: [
        'Black-Type Dam: Out of Gr.2 Auckland Breeders Stakes winner Yearn (by Champion Sire Savabeel), banking $339,895 in prizemoney.',
        'Proven Miler Sire: By triple Group 1 winner Turn Me Loose, dominant from 1400m to 1600m across Melbourne and New Zealand.',
        'Natural Precocity: Alert, compact, and balanced in early education, suited to early-season juvenile racing.',
        'Prepared by Stephen Gray Racing at Copper Belt Lodge, Palmerston North, alongside veteran horseman Kevin Gray.',
        'Target Pathway: Late-spring and summer juvenile sprint-mile introduction before stepping up into 3YO fillies\' black-type races.',
      ],
    },
    listingStatus: 'coming_soon',
    owner: {
      entity: 'Stephen Gray Racing',
      contact: 'Stephen Gray',
    },
    trainer: {
      name: 'Stephen Gray Racing',
      stable: 'Stephen Gray Racing',
      location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
      slug: 'stephen-gray',
    },
    pedigree: {
      sire: 'Turn Me Loose (NZ)',
      dam: 'Yearn (NZ)',
      damSire: 'Savabeel (AUS)',
      lineageSummary:
        'Sire Turn Me Loose won the VRC Emirates Stakes (Gr.1) and MRC Futurity (Gr.1). Dam Yearn (by Champion Sire Savabeel) won the Group 2 Auckland Breeders Stakes and placed in the Group 1 Thorndon Mile.',
      foalingDate: '2023-08-17',
      gender: 'Filly',
      colour: 'Bay',
      breeder: 'C W Kwok',
      microchip: '985125000128426',
      lifeNumber: 'NZ00460867',
      studBookUrl: 'https://loveracing.nz/Breeding/460867/Yearn-NZ-2013-2023.aspx',
    },
    capTableFixture: {
      retainedPct: 95.0,
      allocatedPct: 0.0,
      reservedPct: 0.0,
      availablePct: 5.0,
      totalInvestors: 0,
    },
    closeStyle: 'fourteen_day',
    listingPlatform: 'evolution',
  },
  prudentia: {
    slug: 'prudentia',
    legalName: 'Prudentia (NZ)',
    barnName: 'Prudentia',
    wholesaleMonthlyNzd: 7500,
    totalSyndicateStakePct: 5.0,
    softLegal: {
      aboutHorse:
        'Prudentia (NZ) is a New Zealand-bred four-year-old mare who has already recorded a maiden victory and has competed across a range of distances and track conditions. Her win came over 1400 metres at Tauranga, where she handled testing Heavy conditions to score decisively. Since breaking her maiden, she has stepped into Rating 65 Benchmark company, continuing her preparation against stronger opposition.',
      trainerBio:
        'Prudentia is trained by Wexford Stables. Wexford Stables is a name synonymous with excellence in New Zealand racing history, continuing its legacy under the leadership of Lance O\'Sullivan ONZM and Andrew Scott in Matamata.',
      racingOutlookAndPedigree:
        'Prudentia carries a pedigree built for performance in Australasian racing conditions, combining a proven commercial sire with a durable New Zealand maternal line. Her sire, Proisir, is one of New Zealand\'s leading sires, consistently producing elite performers. Returning to training in early January 2026, she offers a high-quality ownership experience with a clear timeframe and strong upside.',
    },
    marketing: {
      marketplaceHook:
        'Race-winning daughter of champion sire Proisir with proven Rating 65 Benchmark form.',
      highlightTags: [
        '1400m Tauranga Winner',
        'Heavy Track Proven',
        'Rating 65 Progressor',
        'Wexford Stables Prep',
      ],
    },
    listingStatus: 'fully_subscribed',
    owner: {
      entity: 'B.A.X Bloodstock',
      contact: 'Kylie Bax',
    },
    trainer: {
      name: 'Lance O\'Sullivan & Andrew Scott',
      stable: 'Wexford Stables',
      location: 'Matamata, NZ',
      slug: 'lance-osullivan',
    },
    pedigree: {
      sire: 'Proisir (AUS)',
      dam: 'Little Bit Irish (NZ)',
      damSire: 'O\'Reilly (NZ)',
      lineageSummary:
        'By Champion Sire Proisir (sire of Prowess, Legarto, Levante). Maternal line provides proven Australasian speed and durability.',
      foalingDate: '2021-11-13',
      gender: 'Mare',
      colour: 'Bay',
      breeder: 'Goldeye Trust',
      microchip: '985125000126462',
      lifeNumber: 'NZ00441209',
      studBookUrl: 'https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx',
    },
    capTableFixture: {
      retainedPct: 95.0,
      allocatedPct: 5.0,
      reservedPct: 0.0,
      availablePct: 0.0,
      totalInvestors: 5,
    },
    closeStyle: 'fourteen_day',
    listingPlatform: 'tokinvest',
  },
  hottathanafantasy: {
    slug: 'hottathanafantasy',
    legalName: 'Hottathanafantasy (NZ)',
    barnName: 'Coco',
    wholesaleMonthlyNzd: 7000,
    totalSyndicateStakePct: 5.0,
    softLegal: {
      aboutHorse:
        'Hottathanafantasy (NZ) is a New Zealand-bred two-year-old bay filly by the champion sire Contributer (IRE) out of the winning dam Whiffle (USA)—producer of stakes-placed progeny—foaled on 24 October 2023. Bred by Goldeye Trust, she boasts a strong pedigree from Family 13, with relatives including precocious winners like Bocce and Kona Breeze.',
      trainerBio:
        'Hottathanafantasy is trained by Wexford Stables. Wexford Stables maintains one of the best strike rates in the country, ensuring horses like this promising filly receive top preparation for upcoming trials and races.',
      racingOutlookAndPedigree:
        'Hottathanafantasy carries a pedigree built for performance in Australasian racing conditions, combining a proven commercial sire with a durable New Zealand maternal line. Her sire, Contributer, is one of New Zealand\'s leading sires. Returning to training in early January 2026, she offers a high-quality ownership experience.',
    },
    marketing: {
      marketplaceHook:
        'Promising 2YO filly by champion sire Contributer out of winning dam Whiffle.',
      highlightTags: [
        'By Champion Sire Contributer',
        'Family 13 Speed Line',
        'Wexford Stables Prep',
        'Resuming Jan 2026',
      ],
    },
    listingStatus: 'fully_subscribed',
    owner: {
      entity: 'B.A.X Bloodstock',
      contact: 'Kylie Bax',
    },
    trainer: {
      name: 'Lance O\'Sullivan & Andrew Scott',
      stable: 'Wexford Stables',
      location: 'Matamata, NZ',
      slug: 'lance-osullivan',
    },
    pedigree: {
      sire: 'Contributer (IRE)',
      dam: 'Whiffle (USA)',
      damSire: 'Mr. Greeley (USA)',
      lineageSummary:
        'By Champion Sire Contributer out of American winning mare Whiffle, tracing directly to elite Family 13 speed.',
      foalingDate: '2023-10-24',
      gender: 'Filly',
      colour: 'Bay',
      breeder: 'Goldeye Trust',
      microchip: '985125000139165',
      lifeNumber: 'NZ00449182',
      studBookUrl: 'https://loveracing.nz/Breeding/452052/Hottathanafantasy-NZ-2023.aspx',
    },
    capTableFixture: {
      retainedPct: 95.0,
      allocatedPct: 5.0,
      reservedPct: 0.0,
      availablePct: 0.0,
      totalInvestors: 7,
    },
    closeStyle: 'fourteen_day',
    listingPlatform: 'tokinvest',
  },
  'i-stole-a-manolo': {
    slug: 'i-stole-a-manolo',
    legalName: 'I Stole A Manolo (NZ)',
    barnName: 'Manolo',
    wholesaleMonthlyNzd: 6500,
    totalSyndicateStakePct: 5.0,
    softLegal: {
      aboutHorse:
        'I Stole A Manolo (NZ) is a dynamic 2YO bay filly by sensational Group 1 sire Satono Aladdin out of the Jimmy Choux mare Canuhandleajandal. In early education at Wexford Stables, she blends elite turn-of-foot with classic New Zealand stamina.',
      trainerBio:
        'Prepared by 12-time Champion Lance O\'Sullivan ONZM and Andrew Scott at Wexford Stables in Matamata.',
      racingOutlookAndPedigree:
        'By Satono Aladdin (sire of Gr.1 winners Pennyweka and Tokyo Tycoon). Dam by Champion 3YO Jimmy Choux.',
    },
    marketing: {
      marketplaceHook:
        'Deep speed pedigree by Group 1 sire Satono Aladdin, conditioned at Wexford Stables.',
      highlightTags: [
        'By Gr.1 Sire Satono Aladdin',
        'Dam by Jimmy Choux',
        'Wexford Stables',
        'Spring 3YO Progression',
      ],
    },
    listingStatus: 'coming_soon',
    owner: {
      entity: 'B.A.X Bloodstock',
      contact: 'Kylie Bax',
    },
    trainer: {
      name: 'Lance O\'Sullivan & Andrew Scott',
      stable: 'Wexford Stables',
      location: 'Matamata, NZ',
      slug: 'lance-osullivan',
    },
    pedigree: {
      sire: 'Satono Aladdin (JPN)',
      dam: 'Canuhandleajandal (NZ)',
      damSire: 'Jimmy Choux (NZ)',
      lineageSummary:
        'By Satono Aladdin (sire of Gr.1 winners Pennyweka and Tokyo Tycoon). Dam by Champion 3YO Jimmy Choux.',
      foalingDate: '2023-08-30',
      gender: 'Filly',
      colour: 'Bay',
      breeder: 'Goldeye Trust',
      microchip: '985125000139219',
      lifeNumber: 'NZ00451442',
      studBookUrl: 'https://loveracing.nz/Breeding/451442/I-Stole-A-Manolo-NZ-2023.aspx',
    },
    capTableFixture: {
      retainedPct: 95.0,
      allocatedPct: 0.0,
      reservedPct: 0.0,
      availablePct: 5.0,
      totalInvestors: 0,
    },
    closeStyle: 'fourteen_day',
    listingPlatform: 'evolution',
  },
  'first-gear': {
    slug: 'first-gear',
    legalName: 'First Gear (NZ)',
    barnName: 'First Gear',
    wholesaleMonthlyNzd: 7000,
    totalSyndicateStakePct: 10.0,
    listingStatus: 'completed',
    owner: {
      entity: 'Stephen Gray Racing',
      contact: 'Stephen Gray',
    },
    softLegal: {
      aboutHorse:
        'First Gear (NZ) is a bay gelding by Derryn out of A\'Guin Ace, prepared through his racing campaign by Stephen Gray Racing at Copper Belt Lodge in Palmerston North. He is a completed Evolution Stables syndicate campaign, retained on the storefront as a public track record of what the stable delivers.',
      trainerBio:
        'First Gear was prepared by Stephen Gray Racing from Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476. Stephen Gray Racing is a Group 1-winning international yard; Copper Belt Lodge is the training address, not the trading name.',
      racingOutlookAndPedigree:
        'By Derryn (AUS) out of A\'Guin Ace (NZ), by O\'Reilly. First Gear\'s campaign is complete. This listing is historical proof of syndicate delivery, not an open subscription.',
    },
    marketing: {
      marketplaceHook:
        'Completed campaign. Derryn gelding prepared by Stephen Gray Racing at Copper Belt Lodge, Palmerston North.',
      highlightTags: [
        'By Derryn (AUS)',
        'Stephen Gray Racing',
        'Copper Belt Lodge',
        'Completed Campaign',
      ],
      highlights: [
        'Completed Campaign: Public track record of an Evolution Stables digitally-syndicated lease.',
        'Stephen Gray Racing: Prepared at Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476.',
        'Pedigree: Derryn (AUS) out of A\'Guin Ace (NZ), by O\'Reilly.',
        'Listed Pool: 10 percent historical syndicate. Checkout is closed.',
        'Yard: Copper Belt Lodge is the address. The entity is Stephen Gray Racing.',
      ],
    },
    trainer: {
      name: 'Stephen Gray Racing',
      stable: 'Stephen Gray Racing',
      location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
      slug: 'stephen-gray',
    },
    pedigree: {
      sire: 'Derryn (AUS)',
      dam: "A'Guin Ace (NZ)",
      damSire: "O'Reilly (NZ)",
      lineageSummary: "By Derryn (AUS) out of A'Guin Ace (NZ), by O'Reilly.",
      foalingDate: '2021-10-02',
      gender: 'Gelding',
      colour: 'Bay',
      breeder: 'M & W Rose',
      microchip: '985125000126713',
      lifeNumber: 'NZ00428364',
      studBookUrl: 'https://loveracing.nz/Breeding/428364/First-Gear-NZ-2021.aspx',
    },
    capTableFixture: {
      retainedPct: 90.0,
      allocatedPct: 10.0,
      reservedPct: 0.0,
      availablePct: 0.0,
      totalInvestors: 0,
    },
    closeStyle: 'fourteen_day',
    listingPlatform: 'tokinvest',
  },
};

export function isCheckoutOpen(campaign: HorseCampaign): boolean {
  return campaign.listingStatus === 'listed';
}

function validateCampaign(campaign: HorseCampaign): void {
  const lock = getLockedHorse(campaign.slug);
  if (!lock) {
    throw new Error(`Campaign "${campaign.slug}" is not on the live asset lock`);
  }
  if (campaign.pedigree.sire !== lock.sire || campaign.pedigree.dam !== lock.dam) {
    throw new Error(`Campaign "${campaign.slug}" pedigree drifts from asset lock`);
  }
  if (campaign.trainer.slug !== lock.trainerSlug) {
    throw new Error(`Campaign "${campaign.slug}" trainer drifts from asset lock`);
  }
  if (campaign.owner.entity !== ownerDisplayName(lock.ownerSlug)) {
    throw new Error(`Campaign "${campaign.slug}" owner drifts from asset lock`);
  }
  if (campaign.listingStatus !== lock.listingStatus) {
    throw new Error(`Campaign "${campaign.slug}" listingStatus drifts from asset lock`);
  }

  const sire = getSire(campaign.pedigree.sire);
  if (!sire) {
    throw new Error(`Campaign "${campaign.slug}" references unknown sire: ${campaign.pedigree.sire}`);
  }
  const trainer = getTrainer(campaign.trainer.slug);
  if (!trainer) {
    throw new Error(`Campaign "${campaign.slug}" references unknown trainer slug: ${campaign.trainer.slug}`);
  }
  if (trainer.slug === 'stephen-gray' && trainer.stableName !== 'Stephen Gray Racing') {
    throw new Error('Stephen Gray Racing is the only allowed Gray/Grey trading name');
  }

  // 2. Highlight tags must pass brand-voice / banned-term gate.
  const tagCheck = validateHighlightTags(campaign.marketing.highlightTags);
  if (!tagCheck.valid) {
    throw new Error(
      `Campaign "${campaign.slug}" has invalid highlight tags: ${tagCheck.invalidTags.join(', ')}`
    );
  }
}

export function getAllCampaigns(): HorseCampaign[] {
  const campaigns = Object.values(CAMPAIGNS_DATA);
  for (const campaign of campaigns) {
    validateCampaign(campaign);
  }
  return campaigns;
}

export function getCampaignBySlug(slug: string): HorseCampaign | null {
  return CAMPAIGNS_DATA[slug] ?? null;
}

/**
 * Calculates live pricing for a campaign using @evo/legal_engine SSOT.
 */
export function getCampaignPricing(campaign: HorseCampaign, stakePct = 1.0): DslPricing {
  return computeDslPricing(campaign.wholesaleMonthlyNzd, stakePct);
}

/**
 * Resolves all media CDN links for a campaign.
 */
export function getCampaignMedia(slug: string, trainerSlug: string) {
  return {
    horse: getHorseCdnUrls(slug),
    trainer: getTrainerCdnUrls(trainerSlug),
  };
}

/**
 * Compiles the legal pack dynamically via @evo/legal_engine and computes verified SHA-256 digests.
 */
export function getCompiledLegalPackForCampaign(campaign: HorseCampaign): CompiledLegalPack {
  const pricing = computeDslPricing(campaign.wholesaleMonthlyNzd, 1.0);

  const { pack } = compileLegalPack(
    {
      syndicateName: `${campaign.legalName} Syndicate`,
      campaignSlug: campaign.slug,
      ownerName: campaign.owner.entity,
      horse: {
        legalName: campaign.legalName,
        barnName: campaign.barnName ?? campaign.legalName,
        foalingYear: parseInt(campaign.pedigree.foalingDate.split('-')[0], 10),
        gender: campaign.pedigree.gender as 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse',
        breeder: campaign.pedigree.breeder,
        microchip: campaign.pedigree.microchip,
        sire: campaign.pedigree.sire,
        dam: campaign.pedigree.dam,
      },
      trainer: {
        name: campaign.trainer.name,
        location: campaign.trainer.location,
        managerEntity: campaign.trainer.stable,
      },
      pricing,
      closeStyle: campaign.closeStyle,
      totalHorsePercentage: campaign.totalSyndicateStakePct,
      totalShares: Math.round(campaign.totalSyndicateStakePct),
      sharesAvailable: Math.round(campaign.capTableFixture.availablePct),
      pdsVersion: '1.0.0',
      saVersion: '1.0.0',
      effectiveDate: '2026-08-17',
      softLegal: campaign.softLegal,
    },
    { skipValidation: true }
  );

  return pack;
}
