export interface PedigreeEntry {
  name: string;
  country?: string;
  year?: string;
  partner?: {
    name: string;
    country?: string;
    year?: string;
  };
}

export interface PedigreeCrossLine {
  sire_dam_sire?: string;
  sire_dam_dam?: string;
  dam_sire_sire?: string;
  dam_sire_dam?: string;
}

export interface PedigreeNodeData {
  name: string;
  country?: string;
  year?: string;
  role?: "subject" | "sire" | "dam";
  gen?: number;
}

export interface PedigreeTreeNodes {
  horse: PedigreeNodeData;
  sire: PedigreeNodeData;
  dam: PedigreeNodeData;
  sireSire: PedigreeNodeData;
  sireDam: PedigreeNodeData;
  damSire: PedigreeNodeData;
  damDam: PedigreeNodeData;
  sireSireSire: PedigreeNodeData;
  sireSireDam: PedigreeNodeData;
  sireDamSire: PedigreeNodeData;
  sireDamDam: PedigreeNodeData;
  damSireSire: PedigreeNodeData;
  damSireDam: PedigreeNodeData;
  damDamSire: PedigreeNodeData;
  damDamDam: PedigreeNodeData;
}

/** Parses string names like "Derryn (AUS) 2013" into name, country, and year. */
export function parseNameMeta(rawName?: string | null, defaultCountry?: string, defaultYear?: string): PedigreeNodeData {
  if (!rawName || rawName === "—" || rawName.trim() === "") {
    return { name: "—" };
  }
  const match = rawName.match(/^(.*?)(?:\s*\(([A-Z]{2,3})\))?(?:\s*(\d{4}))?$/i);
  if (match) {
    const cleanName = match[1].trim();
    const country = match[2]?.toUpperCase() || defaultCountry;
    const year = match[3] || defaultYear;
    return { name: cleanName || rawName, country, year };
  }
  return { name: rawName, country: defaultCountry, year: defaultYear };
}

function entryToNodeData(entry?: PedigreeEntry | null, role: "sire" | "dam" = "sire", gen: number = 1): PedigreeNodeData {
  const parsed = parseNameMeta(entry?.name, entry?.country, entry?.year);
  return { ...parsed, role, gen };
}

function partnerToNodeData(entry?: PedigreeEntry | null, role: "sire" | "dam" = "dam", gen: number = 1): PedigreeNodeData {
  const parsed = parseNameMeta(entry?.partner?.name, entry?.partner?.country, entry?.partner?.year);
  return { ...parsed, role, gen };
}

function nameToNodeData(name: string, role: "subject" | "sire" | "dam" = "sire", gen: number = 1): PedigreeNodeData {
  const parsed = parseNameMeta(name);
  return { ...parsed, role, gen };
}

export function formatPedigreeName(entry?: PedigreeEntry | null): string {
  if (!entry || !entry.name) return "—";
  let full = entry.name;
  if (entry.country) full += ` (${entry.country})`;
  if (entry.year) full += ` ${entry.year}`;
  return full;
}

export function formatPartnerName(entry?: PedigreeEntry | null): string {
  if (!entry?.partner || !entry.partner.name) return "—";
  let full = entry.partner.name;
  if (entry.partner.country) full += ` (${entry.partner.country})`;
  if (entry.partner.year) full += ` ${entry.partner.year}`;
  return full;
}

export function buildPedigreeTree(
  sireName: string,
  damName: string,
  horseName: string,
  sireLine: PedigreeEntry[] = [],
  damLine: PedigreeEntry[] = [],
  crossLine?: PedigreeCrossLine | null,
): PedigreeTreeNodes {
  return {
    horse: nameToNodeData(horseName, "subject", 0),
    sire: nameToNodeData(sireName, "sire", 1),
    dam: nameToNodeData(damName, "dam", 1),
    sireSire: entryToNodeData(sireLine[1], "sire", 2),
    sireDam: partnerToNodeData(sireLine[0], "dam", 2),
    damSire: partnerToNodeData(damLine[0], "sire", 2),
    damDam: entryToNodeData(damLine[1], "dam", 2),
    sireSireSire: entryToNodeData(sireLine[2], "sire", 3),
    sireSireDam: partnerToNodeData(sireLine[1], "dam", 3),
    sireDamSire: nameToNodeData(crossLine?.sire_dam_sire || "—", "sire", 3),
    sireDamDam: nameToNodeData(crossLine?.sire_dam_dam || "—", "dam", 3),
    damSireSire: nameToNodeData(crossLine?.dam_sire_sire || "—", "sire", 3),
    damSireDam: nameToNodeData(crossLine?.dam_sire_dam || "—", "dam", 3),
    damDamSire: partnerToNodeData(damLine[1], "sire", 3),
    damDamDam: entryToNodeData(damLine[2], "dam", 3),
  };
}

/** Returns set of normalized names that appear more than once in the tree (linebreeding). */
export function getLinebreedingDuplicates(tree: PedigreeTreeNodes): Set<string> {
  const counts = new Map<string, number>();
  const nodes = Object.values(tree);
  for (const node of nodes) {
    if (!node.name || node.name === "—" || node.role === "subject") continue;
    const norm = node.name.toLowerCase().trim();
    counts.set(norm, (counts.get(norm) || 0) + 1);
  }
  const duplicates = new Set<string>();
  for (const [norm, count] of counts.entries()) {
    if (count > 1) {
      duplicates.add(norm);
    }
  }
  return duplicates;
}

