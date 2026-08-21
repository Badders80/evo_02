/**
 * Horse Lookup Service for Mission Control.
 * Supports:
 * 1. 15-digit NZTR Microchip (e.g. 985125000137408)
 * 2. LoveRacing URL (e.g. https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx or /Breeding/454763)
 * 3. LoveRacing numeric HorseID
 * 4. Exact/Partial Horse Name search
 */

export interface HorseLookupRecord {
 legalName: string;
 barnName: string;
 campaignSlug: string;
 foalingYear: number;
 foalingDate?: string;
 gender: 'Colt' | 'Filly' | 'Gelding' | 'Mare' | 'Horse';
 colour?: string;
 breeder: string;
 microchip: string;
 lifeNumber?: string;
 sire: string;
 dam: string;
 damSire?: string;
 loveracingId?: number;
 breedingUrl?: string;
 performanceProfileUrl?: string;
 suggestedTrainer?: {
 name: string;
 location: string;
 managerEntity: string;
 };
 suggestedOwner?: string;
}

/**
 * Derives canonical LoveRacing URLs from an ID.
 */
export function getLoveRacingUrls(loveracingId: number, slug?: string) {
 return {
 breedingUrl: `https://loveracing.nz/Breeding/${loveracingId}${slug ? '/' + slug + '.aspx' : ''}`,
 performanceProfileUrl: `https://loveracing.nz/Common/SystemTemplates/Modal/EntryDetail.aspx?DisplayContext=Modal&HorseID=${loveracingId}`,
 profileUrl: `https://www.loveracing.nz/Horses/Trainers-and-Owners/horse-profile.aspx?HorseID=${loveracingId}`,
 };
}

// Canonical pre-seeded NZTR Stud Book dataset for instant resolution
export const CANONICAL_HORSES_CATALOGUE: HorseLookupRecord[] = [
 {
 legalName: 'Lady Ketchikan',
 barnName: 'Nellie',
 campaignSlug: 'nellie',
 foalingYear: 2023,
 foalingDate: '2023-10-20',
 gender: 'Filly',
 colour: 'Bay or Brown',
 breeder: 'Mrs H G & W G Bax',
 microchip: '985125000137408',
 lifeNumber: 'NZ00454763',
 sire: 'Almanzor (FR)',
 dam: 'Night Danza (AUS)',
 damSire: 'Danzero (AUS)',
 loveracingId: 454763,
 breedingUrl: 'https://loveracing.nz/Breeding/454763/Night-Danza-AUS-2006-2023.aspx',
 suggestedTrainer: {
 name: 'Barbara Kennedy',
 location: 'Byerley Park, Karaka, NZ',
 managerEntity: 'Barbara Kennedy Racing',
 },
 suggestedOwner: 'B.A.X Bloodstock',
 },
 {
 legalName: 'Prudentia',
 barnName: 'Prudentia',
 campaignSlug: 'prudentia',
 foalingYear: 2021,
 foalingDate: '2021-11-13',
 gender: 'Mare',
 colour: 'Bay',
 breeder: 'Evolution Stables',
 microchip: '985125000126462',
 lifeNumber: 'NZ00441209',
 sire: 'Proisir (AUS)',
 dam: 'Little Bit Irish (NZ)',
 damSire: "O'Reilly",
 loveracingId: 427416,
 breedingUrl: 'https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx',
 suggestedTrainer: {
 name: "Lance O'Sullivan & Andrew Scott",
 location: 'Matamata, NZ',
 managerEntity: 'Wexford Stables',
 },
 suggestedOwner: 'B.A.X Bloodstock',
 },
 {
 legalName: 'Turn Me Loose x Yearn 2023',
 barnName: 'Mulan',
 campaignSlug: 'tml-x-yearn',
 foalingYear: 2023,
 foalingDate: '2023-08-17',
 gender: 'Filly',
 colour: 'Bay',
 breeder: 'C W Kwok',
 microchip: '985125000128426',
 lifeNumber: 'NZ00460867',
 sire: 'Turn Me Loose (NZ)',
 dam: 'Yearn (NZ)',
 damSire: 'Savabeel (AUS)',
 loveracingId: 460867,
 breedingUrl: 'https://loveracing.nz/Breeding/460867/Yearn-NZ-2013-2023.aspx',
 suggestedTrainer: {
 name: 'Stephen Gray Racing',
 location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
 managerEntity: 'Stephen Gray Racing',
 },
 suggestedOwner: 'Stephen Gray Racing',
 },
 {
 legalName: 'Hottathanafantasy',
 barnName: 'Coco',
 campaignSlug: 'hottathanafantasy',
 foalingYear: 2023,
 foalingDate: '2023-10-24',
 gender: 'Filly',
 colour: 'Bay',
 breeder: 'Goldeye Trust',
 microchip: '985125000139165',
 lifeNumber: 'NZ00449182',
 sire: 'Contributer (IRE)',
 dam: 'Whiffle (USA)',
 damSire: 'Mr. Greeley (USA)',
 loveracingId: 452052,
 breedingUrl: 'https://loveracing.nz/Breeding/452052/Hottathanafantasy-NZ-2023.aspx',
 suggestedTrainer: {
 name: "Lance O'Sullivan & Andrew Scott",
 location: 'Matamata, NZ',
 managerEntity: 'Wexford Stables',
 },
 suggestedOwner: 'B.A.X Bloodstock',
 },
 {
 legalName: 'I Stole A Manolo',
 barnName: 'Manolo',
 campaignSlug: 'i-stole-a-manolo',
 foalingYear: 2023,
 foalingDate: '2023-08-30',
 gender: 'Filly',
 colour: 'Bay',
 breeder: 'Goldeye Trust',
 microchip: '985125000139219',
 lifeNumber: 'NZ00451442',
 sire: 'Satono Aladdin (JPN)',
 dam: 'Canuhandleajandal (NZ)',
 damSire: 'Jimmy Choux (NZ)',
 loveracingId: 451442,
 breedingUrl: 'https://loveracing.nz/Breeding/451442/I-Stole-A-Manolo-NZ-2023.aspx',
 suggestedTrainer: {
 name: "Lance O'Sullivan & Andrew Scott",
 location: 'Matamata, NZ',
 managerEntity: 'Wexford Stables',
 },
 suggestedOwner: 'B.A.X Bloodstock',
 },
 {
 legalName: 'First Gear',
 barnName: 'First Gear',
 campaignSlug: 'first-gear',
 foalingYear: 2021,
 foalingDate: '2021-10-02',
 gender: 'Gelding',
 colour: 'Bay',
 breeder: 'M & W Rose',
 microchip: '985125000126713',
 lifeNumber: 'NZ00428364',
 sire: 'Derryn (AUS)',
 dam: "A'Guin Ace (NZ)",
 damSire: "O'Reilly",
 loveracingId: 428364,
 breedingUrl: 'https://loveracing.nz/Breeding/428364/First-Gear-NZ-2021.aspx',
 suggestedTrainer: {
   name: 'Stephen Gray Racing',
   location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
   managerEntity: 'Stephen Gray Racing',
 },
 suggestedOwner: 'Stephen Gray Racing',
 },
];

/**
 * Extracts a numeric LoveRacing ID from a URL or raw string.
 */
export function extractLoveRacingId(input: string): number | null {
 const clean = input.trim();

 // If it's a URL, validate hostname strictly
 if (clean.startsWith('http://') || clean.startsWith('https://')) {
 try {
 const url = new URL(clean);
 const host = url.hostname.toLowerCase();
 const isAllowedHost = host === 'loveracing.nz' || host.endsWith('.loveracing.nz');
 if (!isAllowedHost) {
 return null;
 }
 // 1. Path pattern: /Breeding/454763/... or /Horses/454763/...
 const pathMatch = url.pathname.match(/\/(?:Breeding|Horses|RaceInfo)\/(\d+)/i);
 if (pathMatch && pathMatch[1]) {
 return parseInt(pathMatch[1], 10);
 }
 // 2. Query param: ?HorseID=454763 (e.g. EntryDetail modal or horse-profile)
 const queryMatch = url.search.match(/[?&]horseid=(\d+)/i);
 if (queryMatch && queryMatch[1]) {
 return parseInt(queryMatch[1], 10);
 }
 } catch {
 // Invalid URL format
 }
 }

 // URL pattern fallback without protocol
 const urlMatch = clean.match(/loveracing\.nz\/(?:Breeding|Horses|RaceInfo)\/(\d+)/i);
 if (urlMatch && urlMatch[1]) {
 return parseInt(urlMatch[1], 10);
 }

 const queryFallback = clean.match(/horseid=(\d+)/i);
 if (queryFallback && queryFallback[1]) {
 return parseInt(queryFallback[1], 10);
 }

 // Pure numeric string with 5-7 digits
 if (/^\d{5,7}$/.test(clean)) {
 return parseInt(clean, 10);
 }

 return null;
}

/**
 * Extracts a 15-digit microchip from an input string (must start with NZTR 985 prefix).
 */
export function extractMicrochip(input: string): string | null {
 const match = input.match(/\b(985\d{12})\b/);
 if (match) return match[1];
 const digitsOnly = input.replace(/\D/g, '');
 if (digitsOnly.length === 15 && digitsOnly.startsWith('985')) return digitsOnly;
 return null;
}

/**
 * Performs a comprehensive search against the catalogue and Stud Book resolver.
 */
export function lookupHorse(query: string): HorseLookupRecord | null {
 const trimmed = query.trim();
 if (!trimmed) return null;

 // 1. Try microchip
 const microchip = extractMicrochip(trimmed);
 if (microchip) {
 const found = CANONICAL_HORSES_CATALOGUE.find((h) => h.microchip === microchip);
 if (found) return found;
 }

 // 2. Try LoveRacing ID / URL
 const lrId = extractLoveRacingId(trimmed);
 if (lrId) {
 const found = CANONICAL_HORSES_CATALOGUE.find((h) => h.loveracingId === lrId);
 if (found) return found;
 }

 // 3. Try fuzzy name or slug match (enforce >= 3 chars to prevent single char collisions)
 if (trimmed.length >= 3) {
 const lowerQuery = trimmed.toLowerCase();
 const nameMatch = CANONICAL_HORSES_CATALOGUE.find(
 (h) =>
 lowerQuery.includes(h.legalName.toLowerCase()) ||
 lowerQuery.includes(h.barnName.toLowerCase()) ||
 lowerQuery.includes(h.campaignSlug.toLowerCase()) ||
 h.legalName.toLowerCase().includes(lowerQuery) ||
 h.barnName.toLowerCase().includes(lowerQuery) ||
 h.campaignSlug.toLowerCase().includes(lowerQuery)
 );
 if (nameMatch) return nameMatch;
 }

 return null;
}
