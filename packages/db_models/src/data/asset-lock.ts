/**
 * Hard lock: live Evolution assets vs market-research leftovers.
 * SSOT prose: evo_00/doc/ASSET_LOCK.md
 *
 * Stephen Gray Racing is the only allowed Gray/Grey trading name.
 * Copper Belt Lodge is the yard address, never the entity.
 */

export const MANAGER_PUBLIC_NAME = 'Evolution Stables';
export const MANAGER_LEGAL_NAME = 'Evolution Stables Limited';

export const STEPHEN_GRAY_RACING = {
  slug: 'stephen-gray',
  name: 'Stephen Gray Racing',
  stableName: 'Stephen Gray Racing',
  location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
  base: 'Copper Belt Lodge',
  website: 'https://stephengrayracing.com/contact/',
  contactPerson: 'Stephen Gray',
} as const;

export const BAX_BLOODSTOCK = {
  slug: 'bax-bloodstock',
  name: 'B.A.X Bloodstock',
  legalName: 'B.A.X Bloodstock Achieving Xcellence Limited',
  contactPerson: 'Kylie Bax',
} as const;

/** Strings that must never appear as a Gray/Grey trading name. */
export const BANNED_STEPHEN_GRAY_ENTITY_NAMES = [
  'Stephen Gray Stables',
  'Stephen Grey Stables',
  'Stephen Grey Racing',
  'Stephen Gray Stables at Copper Belt',
  'Grey Stables',
] as const;

export const RESEARCH_ONLY_TRAINER_SLUGS = [
  'te-akau',
  'allan-sharrock',
  'donna-logan',
  'stephen-marsh',
] as const;

export type ListingStatus = 'listed' | 'coming_soon' | 'fully_subscribed' | 'completed';

export type LiveOwnerSlug = 'bax-bloodstock' | 'stephen-gray';

export interface LockedHorseAsset {
  slug: string;
  legalName: string;
  barnName: string;
  sire: string;
  dam: string;
  damSire: string;
  microchip: string;
  trainerSlug: 'barbara-kennedy' | 'lance-osullivan' | 'stephen-gray';
  ownerSlug: LiveOwnerSlug;
  listingStatus: ListingStatus;
  listedStakePct: number;
  checkoutOpen: boolean;
}

export const LOCKED_HORSES: readonly LockedHorseAsset[] = [
  {
    slug: 'nellie',
    legalName: 'Lady Ketchikan (NZ)',
    barnName: 'Nellie',
    sire: 'Almanzor (FR)',
    dam: 'Night Danza (AUS)',
    damSire: 'Danzero (AUS)',
    microchip: '985125000137408',
    trainerSlug: 'barbara-kennedy',
    ownerSlug: 'bax-bloodstock',
    listingStatus: 'listed',
    listedStakePct: 5,
    checkoutOpen: true,
  },
  {
    slug: 'tml-x-yearn',
    legalName: 'Turn Me Loose x Yearn 2023',
    barnName: 'Mulan',
    sire: 'Turn Me Loose (NZ)',
    dam: 'Yearn (NZ)',
    damSire: 'Savabeel (AUS)',
    microchip: '985125000128426',
    trainerSlug: 'stephen-gray',
    ownerSlug: 'stephen-gray',
    listingStatus: 'coming_soon',
    listedStakePct: 5,
    checkoutOpen: false,
  },
  {
    slug: 'prudentia',
    legalName: 'Prudentia (NZ)',
    barnName: 'Prudentia',
    sire: 'Proisir (AUS)',
    dam: 'Little Bit Irish (NZ)',
    damSire: "O'Reilly (NZ)",
    microchip: '985125000126462',
    trainerSlug: 'lance-osullivan',
    ownerSlug: 'bax-bloodstock',
    listingStatus: 'fully_subscribed',
    listedStakePct: 5,
    checkoutOpen: false,
  },
  {
    slug: 'hottathanafantasy',
    legalName: 'Hottathanafantasy (NZ)',
    barnName: 'Coco',
    sire: 'Contributer (IRE)',
    dam: 'Whiffle (USA)',
    damSire: 'Mr. Greeley (USA)',
    microchip: '985125000139165',
    trainerSlug: 'lance-osullivan',
    ownerSlug: 'bax-bloodstock',
    listingStatus: 'fully_subscribed',
    listedStakePct: 5,
    checkoutOpen: false,
  },
  {
    slug: 'i-stole-a-manolo',
    legalName: 'I Stole A Manolo (NZ)',
    barnName: 'Manolo',
    sire: 'Satono Aladdin (JPN)',
    dam: 'Canuhandleajandal (NZ)',
    damSire: 'Jimmy Choux (NZ)',
    microchip: '985125000139219',
    trainerSlug: 'lance-osullivan',
    ownerSlug: 'bax-bloodstock',
    listingStatus: 'coming_soon',
    listedStakePct: 5,
    checkoutOpen: false,
  },
  {
    slug: 'first-gear',
    legalName: 'First Gear (NZ)',
    barnName: 'First Gear',
    sire: 'Derryn (AUS)',
    dam: "A'Guin Ace (NZ)",
    damSire: "O'Reilly (NZ)",
    microchip: '985125000126713',
    trainerSlug: 'stephen-gray',
    ownerSlug: 'stephen-gray',
    listingStatus: 'completed',
    listedStakePct: 10,
    checkoutOpen: false,
  },
] as const;

export function getLockedHorse(slug: string): LockedHorseAsset | undefined {
  return LOCKED_HORSES.find((h) => h.slug === slug);
}

export function ownerDisplayName(ownerSlug: LiveOwnerSlug): string {
  return ownerSlug === 'stephen-gray' ? STEPHEN_GRAY_RACING.name : BAX_BLOODSTOCK.name;
}
