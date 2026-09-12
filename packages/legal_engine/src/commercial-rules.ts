/**
 * Commercial rules registry — the single source of locked commercial law.
 * Founder-locked 2026-09-10 (DSL walk session).
 *
 * Every surface (PDS/SA generator, website, settlement, mission control)
 * imports from here. Never re-derive a locked number in a template or
 * component — if it's the same for every horse, it lives here.
 *
 * Per-horse variables (close style, split, schedule, stake, wholesale) are
 * NOT registry constants — they are form fields on the DSL capture form.
 * See war-room G006-ds101/LOCKED-legal-engine-architecture.md.
 */

/** Evolution Stables operating margin, embedded in the listed rate. */
export const EVOLUTION_MARGIN_PCT = 5.0;

/** Platform Fees (covers Stripe/gateway charges) — never 'Payment processing buffer' or 'Platform Cost'. */
export const PLATFORM_FEE_PCT = 3.0;

/** Float structure: 3 months security deposit reserve + 2 months prepaid keep = 5-month initial investment. */
export const FLOAT_DEPOSIT_MONTHS = 3;
export const FLOAT_PREPAID_MONTHS = 2;
export const FLOAT_TOTAL_MONTHS = FLOAT_DEPOSIT_MONTHS + FLOAT_PREPAID_MONTHS;

/** Paid-up qualification for prize money distributions (full months prior to a race date). */
export const QUALIFICATION_PAID_UP_MONTHS = 2;

/** Refund window for unused float on termination/maturity (business days). */
export const REFUND_WINDOW_DAYS = 14;

/** Investor Return (locked 75/25, settlement.ts): % of NZTR gross stakes returned to the Investor Pool.
 * This is the ONLY split exposed to investors. The manager's remainder is the implicit
 * 25% (100 - INVESTOR_RETURN_PCT) and is never investor-facing. */
export const INVESTOR_RETURN_PCT = 75;

/** Close styles — the DSL form dropdown values. Adding one = 4 touch points (see architecture lock). */
export const CLOSE_STYLES = ['fourteen_day', 'three_x_remaining'] as const;
export type CloseStyle = (typeof CLOSE_STYLES)[number];

/** Terminology locks (founder-locked). */
export const PLATFORM_FEE_LABEL = 'Platform Fees';
export const EVOLUTION_MARGIN_LABEL = 'Evolution Stables margin';

/** Retail listed rate = CEIL(cost × 1.05 × 1.03). The locked pricing formula. */
export function retailFromWholesale(cost: number): number {
  return Math.ceil(cost * (1 + EVOLUTION_MARGIN_PCT / 100) * (1 + PLATFORM_FEE_PCT / 100));
}
