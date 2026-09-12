/**
 * DSL Term Sheet Generator (1-Pager) for Evolution Stables.
 * Authority: evo_00/doc/DSL_MANUAL.md and evo_00/doc/OPERATIONS_SOP.md
 *
 * Litmus rule (founder 2026-09-09): the term sheet renders ONLY what is in the
 * data. A missing field renders as a blank marker — never a hardcoded default.
 * The doc is the byproduct of the process, not the process itself.
 */

import type { SyndicateLegalContext } from './types';

/** Blank marker for a field with no data. Rendered as a grey cell in HTML/PDF. */
export const BLANK = '[not filled in yet]';

/** Coerce a value to its display string, or the blank marker when absent. */
function v(x: string | number | null | undefined): string {
  if (x === null || x === undefined || x === '') return BLANK;
  return String(x);
}

/** Format an ISO date (YYYY-MM-DD) as "1 September 2026" (deterministic, locale-free). */
function formatTermDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Inclusive month count between two ISO dates. Start is always the first of the
 * month, end the last — so Sep 2026 → Jun 2028 = 22 months (inclusive).
 * Any two of {start, end, months} determine the third; we store start + end and
 * derive months here.
 */
export function monthsBetween(startIso?: string, endIso?: string): number | null {
  if (!startIso || !endIso) return null;
  const s = new Date(`${startIso}T00:00:00Z`);
  const e = new Date(`${endIso}T00:00:00Z`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) + 1;
}

export function generateTermSheetMarkdown(context: SyndicateLegalContext): string {
  const p = context.pricing;
  const h = context.horse;
  const t = context.trainer;
  const wholesalePerPct = p.costMonthlyNzd * 0.01;
  const paymentModel = context.paymentModel; // no hardcoded fallback — blank when unset
  const derivedMonths = monthsBetween(context.termStartDate, context.termEndDate);
  const termMonths = derivedMonths ?? context.termMonths; // no hardcoded fallback
  const startLabel = formatTermDate(context.termStartDate);
  const endLabel = formatTermDate(context.termEndDate);

  // Lease term line: only render what the data supports. No default month count.
  let termLine: string;
  if (startLabel && endLabel && termMonths != null) {
    termLine = `* **Lease Term:** ${termMonths} months (${startLabel} → ${endLabel})`;
  } else if (startLabel && endLabel) {
    termLine = `* **Lease Term:** ${startLabel} → ${endLabel}`;
  } else if (termMonths != null) {
    termLine = `* **Lease Term:** ${termMonths} months`;
  } else {
    termLine = `* **Lease Term:** ${BLANK}`;
  }

  const paymentSection =
    paymentModel === 'upfront'
      ? `* **Payment Model:** Upfront ($M × ${termMonths != null ? termMonths : BLANK} Months)
* **Upfront Payment:** ${termMonths != null ? `$${(p.monthlyKeepUnitNzd * termMonths).toFixed(2)}` : BLANK} per 1% stake (${termMonths != null ? `${termMonths}-month term @ $${p.monthlyKeepUnitNzd.toFixed(2)}/mo` : BLANK})
* **Recurring Keep:** $0.00 / month
* **Settlement:** Pro-rata refund of unused preparation keep upon early termination.`
      : paymentModel === 'subscription_float'
        ? `* **Payment Model:** Subscription Float ($5×M)
* **Initial Join Payment:** 3 mo reserve deposit + 2 mo advance keep
* **Settlement:** Deposit refunded in full; unused advance keep refunded pro-rata upon lease termination within 14 business days.`
        : `* **Payment Model:** ${BLANK}
* **Initial Join Payment:** ${BLANK}
* **Settlement:** ${BLANK}`;

  // Exit / close style: a dropdown lock, but render blank if somehow absent.
  const closeStyleLabel =
    context.closeStyle === 'fourteen_day'
      ? 'Standard 14-Day Notice (Case B)'
      : context.closeStyle === 'three_x_remaining'
        ? '3× Buyout (Case B1)'
        : BLANK;

  return `# DSL Term Sheet - ${v(context.syndicateName)}

**Version:** ${v(context.pdsVersion)} | **Effective Date:** ${v(context.effectiveDate)}  
**Manager:** ${v(t.managerEntity)} (NZTR Authorised Syndicator)

---

### 1. Thoroughbred & Parties
* **Horse:** ${v(h.legalName)}${h.barnName && h.barnName !== h.legalName ? ` (*${h.barnName}*)` : ''}
* **Microchip / ID:** ${v(h.microchip)}
* **Owner:** ${v(context.ownerName)}
* **Trainer:** ${v(t.name)}${t.location ? ` (${t.location})` : ''}

---

### 2. Syndicate Stake & Commercials
* **Syndicated Stake in Horse:** ${context.totalHorsePercentage != null ? `${context.totalHorsePercentage.toFixed(1)}%` : BLANK} available (of the horse's total ownership)
* **Minimum Investment:** ${context.minInvestmentPct != null ? `${context.minInvestmentPct.toFixed(1)}%` : BLANK} — increments of ${context.stakeStepPct != null ? `${context.stakeStepPct.toFixed(1)}%` : BLANK} thereafter
* **Wholesale Monthly Rate (M):** $${wholesalePerPct.toFixed(2)} / month per 1% stake
* **Evolution Margin:** ${p.evolutionMarginPercent.toFixed(1)}%  |  **Platform Fees:** ${p.platformFeePercent.toFixed(1)}%
* **Retail Monthly Rate (M):** $${p.monthlyKeepUnitNzd.toFixed(2)} / month per 1% stake
${termLine}

---

### 3. Payment Structure & Float
${paymentSection}

---

### 4. Prize Money & Exit Terms
* **Gross Stakes Distribution:** ${v(context.distributionSplit)}
* **Distribution Schedule:** ${v(context.distributionSchedule)}
* **Exit / Close Style:** ${closeStyleLabel}

---

### 5. Execution & Approvals

| Party | Signature | Date |
| :--- | :--- | :--- |
| **${v(t.managerEntity)}** (Syndicate Manager) | _________________________ | _____________ |
| **${v(context.ownerName)}** (Owner) | _________________________ | _____________ |

---
*Summary of terms under the NZTR Code of Practice Rule 22.1. Subject to execution of formal PDS and Syndicate Agreement.*
`;
}
