/**
 * Normalise a sire/dam name for display: strip trailing year suffix, clean
 * ALL CAPS to Title Case, and preserve parenthetical country codes like (NZ).
 *
 * Examples:
 *   "TURN ME LOOSE (NZ) 2011" -> "Turn Me Loose (NZ)"
 *   "PROISIR (AUS) 2009"      -> "Proisir (AUS)"
 */
export function normalizePedigreeName(raw: string | null | undefined): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\s+\d{4}\s*$/, "").trim();
  if (!cleaned) return "";
  return cleaned
    .split(/\s+/)
    .map((word) =>
      /^\(/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

/**
 * Display variant that returns "—" when there is no value.
 */
export function displayPedigreeName(raw: string | null | undefined): string {
  const normalized = normalizePedigreeName(raw);
  return normalized || "—";
}
