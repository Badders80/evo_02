/**
 * DSL Term Sheet Generator (1-Pager) for Evolution Stables.
 * Authority: evo_00/doc/DSL_MANUAL.md and evo_00/doc/OPERATIONS_SOP.md
 */

import type { SyndicateLegalContext } from './types';
import { SHARE_MATH } from './types';

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
function monthsBetween(startIso?: string, endIso?: string): number | null {
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
  const paymentModel = context.paymentModel || 'subscription_float';
  const derivedMonths = monthsBetween(context.termStartDate, context.termEndDate);
  const termMonths = derivedMonths ?? context.termMonths ?? 12;
  const startLabel = formatTermDate(context.termStartDate);
  const endLabel = formatTermDate(context.termEndDate);
  const termLine =
    startLabel && endLabel
      ? `* **Lease Term:** ${termMonths} months (${startLabel} → ${endLabel})`
      : `* **Lease Term:** ${termMonths} months`;

  const paymentSection =
    paymentModel === 'upfront'
      ? `* **Payment Model:** Upfront ($M × ${termMonths} Months)
* **Upfront Payment:** $${(p.monthlyKeepUnitNzd * termMonths).toFixed(2)} per 1% stake (${termMonths}-month term @ $${p.monthlyKeepUnitNzd.toFixed(2)}/mo)
* **Recurring Keep:** $0.00 / month
* **Settlement:** Pro-rata refund of unused preparation keep upon early termination.`
      : `* **Payment Model:** Subscription Float ($5×M)
* **Initial Join Payment:** 3 mo reserve deposit + 2 mo advance keep
* **Settlement:** Deposit refunded in full; unused advance keep refunded pro-rata upon lease termination within 14 business days.`;

  return `# DSL Term Sheet
## ${context.syndicateName}

**Campaign:** ${context.campaignSlug} | **Version:** ${context.pdsVersion} | **Effective Date:** ${context.effectiveDate}  
**Manager:** ${t.managerEntity} (NZTR Authorised Syndicator)  
**Governing Regulation:** New Zealand Thoroughbred Racing · NZTR Code of Practice Rule 22.1

---

### 1. Thoroughbred & Parties
* **Horse:** ${h.legalName} (*${h.barnName}*)
* **Microchip / ID:** ${h.microchip || 'Recorded with NZTR'}
* **Owner:** ${context.ownerName}
* **Trainer:** ${t.name} (${t.location})

---

### 2. Syndicate Stake & Commercials
* **Syndicated Stake in Horse:** ${context.totalHorsePercentage.toFixed(1)}% available (of the horse's total ownership)
* **Minimum Investment:** ${(context.minInvestmentPct ?? SHARE_MATH.DEFAULT_MIN_INVESTMENT_PCT).toFixed(1)}% — increments of ${(context.stakeStepPct ?? SHARE_MATH.DEFAULT_STAKE_STEP_PCT).toFixed(1)}% thereafter
* **Wholesale Monthly Rate (M):** $${wholesalePerPct.toFixed(2)} / month per 1% stake
* **Evolution Margin:** ${p.evolutionMarginPercent.toFixed(1)}%  |  **Platform Cost:** ${p.processingBufferPercent.toFixed(1)}%
* **Retail Monthly Rate (M):** $${p.monthlyKeepUnitNzd.toFixed(2)} / month per 1% stake
${termLine}

---

### 3. Payment Structure & Float
${paymentSection}

---

### 4. Prize Money & Exit Terms
* **Gross Stakes Distribution:** 75% Investor Pool / 25% Owner Retention
* **Distribution Schedule:** Quarterly (2-month paid-up qualification prior to race date)
* **Exit / Close Style:** ${context.closeStyle === 'fourteen_day' ? 'Standard 14-Day Notice (Case B)' : '3× Buyout (Case B1)'}

---

### 5. Execution & Approvals

| Party | Signature | Date |
| :--- | :--- | :--- |
| **${t.managerEntity}** (Syndicate Manager) | _________________________ | _____________ |
| **${context.ownerName}** (Owner) | _________________________ | _____________ |

---
*Summary of terms under the NZTR Code of Practice Rule 22.1. Subject to execution of formal PDS and Syndicate Agreement.*
`;
}
