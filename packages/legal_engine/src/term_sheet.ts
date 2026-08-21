/**
 * DSL Term Sheet Generator (1-Pager) for Evolution Stables.
 * Authority: evo_00/doc/DSL_MANUAL.md and evo_00/doc/OPERATIONS_SOP.md
 */

import type { SyndicateLegalContext } from './types';

export function generateTermSheetMarkdown(context: SyndicateLegalContext): string {
  const p = context.pricing;
  const h = context.horse;
  const t = context.trainer;
  const totalMonthlyTurnover = p.monthlyKeepUnitNzd * (context.totalHorsePercentage / p.stakePercentage);
  const paymentModel = context.paymentModel || 'subscription_float';
  const termMonths = context.termMonths || 12;

  const paymentSection =
    paymentModel === 'upfront'
      ? `* **Payment Model:** Upfront ($M × ${termMonths} Months)
* **Upfront Payment:** $${(p.monthlyKeepUnitNzd * termMonths).toFixed(2)} per 1% stake (${termMonths}-month term @ $${p.monthlyKeepUnitNzd.toFixed(2)}/mo)
* **Recurring Keep:** $0.00 / month
* **Settlement:** Pro-rata refund of unused preparation keep upon early termination.`
      : `* **Payment Model:** Subscription Float ($5×M)
* **Initial Join Payment:** $${p.joinFloatUnitNzd.toFixed(2)} per 1% stake (3 mo reserve deposit + 2 mo advance keep)
* **Recurring Keep:** $${p.monthlyKeepUnitNzd.toFixed(2)} / month per 1% stake
* **Settlement:** Unused deposit and advance keep refunded pro-rata upon lease termination within 14 business days.`;

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
* **Syndicated Stake in Horse:** ${context.totalHorsePercentage.toFixed(1)}% total horse lease
* **Available Stakes:** ${context.totalShares} Lots (${p.stakePercentage.toFixed(1)}% minimum stake / 0.5% step)
* **Wholesale Base Cost:** $${p.costMonthlyNzd.toFixed(2)} / month per 1% stake
* **Evolution Margin:** ${p.evolutionMarginPercent.toFixed(1)}%  |  **Payment Buffer:** ${p.processingBufferPercent.toFixed(1)}%
* **Retail Monthly Rate (M):** $${p.monthlyKeepUnitNzd.toFixed(2)} / month per 1% stake
* **Total Monthly Syndicate Turnover:** $${totalMonthlyTurnover.toFixed(2)} NZD / month

---

### 3. Payment Structure & Float
${paymentSection}

---

### 4. Prize Money & Exit Terms
* **Gross Stakes Distribution:** 75% Investor Pool / 25% Owner Retention (absorbs NZTR deductions, jockeys, nominations; zero capital calls)
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
