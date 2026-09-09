/**
 * Live age from foaling date — Southern Hemisphere rule (founder 2026-09-10).
 * Age increments on 1 August, never from a hardcoded number in content.
 * Age is a live derived value: store the DOB once, compute at render.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Whole years of age under the SH rule: birthday = 1 Aug after foaling year. */
export function southernHemisphereAge(foalingDateIso: string, ref: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(foalingDateIso.trim());
  if (!m) return null;
  const foalYear = parseInt(m[1], 10);
  const refYear = ref.getFullYear();
  // SH: a foal born anytime in year Y turns 1 on 1 Aug of Y+1.
  let age = refYear - foalYear;
  if (ref.getMonth() < 7) age -= 1; // before August: birthday hasn't hit yet this year
  return age;
}

/** "2023-08-30" → "30 Aug 2023". Null-safe: returns '' for garbage. */
export function formatFoalingDate(foalingDateIso: string | undefined | null): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((foalingDateIso ?? '').trim());
  if (!m) return '';
  return `${parseInt(m[3], 10)} ${MONTHS[parseInt(m[2], 10) - 1] ?? ''} ${m[1]}`;
}

/** "30 Aug 2023 (age 3)" — the single render shape for every surface. Blank when no DOB. */
export function foalingLabel(foalingDateIso: string | undefined | null, ref: Date = new Date()): string {
  const d = formatFoalingDate(foalingDateIso);
  if (!d || !foalingDateIso) return '';
  const age = southernHemisphereAge(foalingDateIso, ref);
  return age == null ? d : `${d} (age ${age})`;
}
