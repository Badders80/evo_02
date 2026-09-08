// apps/web/src/lib/float-reset.ts
export const FLOAT_FULL_MONTHS = 5;

/** On a successful monthly payment, the float returns to full (5 months). */
export function resetFloat(_floatMonthsHeld: number): number {
  return FLOAT_FULL_MONTHS;
}
