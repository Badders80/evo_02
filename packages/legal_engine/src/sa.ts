/**
 * Syndicate Agreement (SA) Generator for Evolution Stables DSL.
 * Authority: evo_00/doc/DSL_MANUAL.md and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 *
 * Litmus rule (founder 2026-09-09): renders ONLY what is in the data. A missing
 * field renders as a blank marker — never a hardcoded default. Proforma clauses
 * (75% majority vote, 5.0% margin) are legal/platform constants, not data.
 *
 * Full contract skeleton (founder-locked 2026-09-10): the complete clause
 * series (formation through notices) plus Schedule 1 and an execution block —
 * contract-plain, numbered, signature-bound to the PDS.
 */

import type { SyndicateLegalContext } from './types';
import { BLANK } from './term_sheet';
import { foalingLabel } from './age';
import {
  EVOLUTION_MARGIN_PCT,
  PLATFORM_FEE_PCT,
  PLATFORM_FEE_LABEL,
  FLOAT_DEPOSIT_MONTHS,
  FLOAT_PREPAID_MONTHS,
  REFUND_WINDOW_DAYS,
} from './commercial-rules';

/** Coerce a value to its display string, or the blank marker when absent. */
function v(x: string | number | null | undefined): string {
  if (x === null || x === undefined || x === '') return BLANK;
  return String(x);
}

/** Leased term label, data-driven (blank when unset). */
function termLabel(context: SyndicateLegalContext): string {
  if (context.termMonths == null) return BLANK;
  if (context.termStartDate && context.termEndDate) {
    return `${context.termMonths} months, commencing ${context.termStartDate} and ending ${context.termEndDate}`;
  }
  return `${context.termMonths} months`;
}

export function generateSaMarkdown(context: SyndicateLegalContext): string {
  const p = context.pricing;
  const h = context.horse;
  const t = context.trainer;
  const manager = v(t.managerEntity);

  return `# Syndicate Agreement
## ${v(context.syndicateName)}

**Campaign:** ${v(context.campaignSlug)}  
**Version:** ${v(context.saVersion)}  
**Effective Date:** ${v(context.effectiveDate)}

---

## Clause 1: Formation

A Syndicate is formed under the New Zealand Thoroughbred Racing Inc. ("NZTR") Bloodstock Syndication Code of Practice ("COP"), in accordance with its formation requirements, by the Promoter as set out in the attached Product Disclosure Statement ("the Syndicate").

---

## Clause 2: Object

The object of the Syndicate is to lease and race ${v(h.legalName)}${h.barnName && h.barnName !== h.legalName ? ` (${h.barnName})` : ''} as a recreational pursuit, with all syndicate members holding fractional leasehold shares for the fixed term described in the Product Disclosure Statement.

---

## Clause 3: Agreement and Parties

This Agreement is binding on the Promoter (${manager}), the Syndicate Manager (${manager}), and each Shareholder as defined in the Product Disclosure Statement. By signing the Application Form, each Shareholder agrees to be bound by this Agreement and the Product Disclosure Statement. This Agreement may only be altered by special resolution (75% of shareholding) and must not increase a Shareholder's liability beyond what is disclosed in the Product Disclosure Statement.

---

## Clause 4: Syndicate Shares

The Syndicate is divided into ${v(context.totalShares)} shares of ${v(context.stakeStepPct)}% each, representing the ${v(context.totalHorsePercentage)}% leasehold interest in ${v(h.legalName)} for the Lease Term. Shares are issued and recorded by Evolution Stables, enabling digital onboarding, compliance, and (subject to Manager approval) transfer. Each Shareholder's rights and obligations are proportional to their shareholding.

---

## Clause 5: Lease Duration

The lease term is fixed at ${termLabel(context)}. All lease terms are counted in full calendar months. The lease may be renewed or extended at the Manager's and Lessor's discretion, with terms disclosed to Shareholders prior to renewal.

---

## Clause 6: Equine Welfare Supremacy

The licensed Trainer and Racing Manager hold **sole, absolute, and unchallengeable discretion** regarding all training regimes, race nominations, trackwork, spelling, and veterinary care.

Neither **${manager}** nor any syndicate member may override veterinary or welfare decisions. The welfare of the thoroughbred is paramount at all times.

---

## Clause 7: Manager's Powers and Duties

The Manager (${manager}) is responsible for overall lease administration and NZTR compliance, including communication with shareholders and coordination with licensed professionals.

The Manager may:

- Make all day-to-day decisions relating to racing, training, spelling, and horse welfare.
- Appoint or change trainers in consultation with the horse's owner or Racing Manager.
- Deduct and retain management and platform fees as disclosed in the Product Disclosure Statement.
- Delegate operational duties to licensed parties (e.g., trainers, racing managers) as required.
- Provide regular reports and updates when the horse is in training or racing.

---

## Clause 8: Default & Forfeiture

An investor enters default if a scheduled monthly payment is missed. Evolution Stables will notify the investor during the default period. If the outstanding balance is not rectified prior to the next billing cycle, the investment is deemed in default.

Upon default, the investor forfeits all future rights to prize money distributions and their deposit, which is subsequently reallocated to the horse owner to secure the ongoing care and maintenance of the horse. Evolution Stables receives no material financial benefit from an investor default.

---

## Clause 9: Financial Contributions and Fees

Members pay a monthly keep for the duration of their participation, structured as follows:

- **Initial payment:** $${p.joinFloatUnitNzd.toFixed(2)} per 1% stake, representing ${FLOAT_DEPOSIT_MONTHS} months security deposit reserve and ${FLOAT_PREPAID_MONTHS} months prepaid keep.
- **Monthly keep:** $${p.monthlyKeepUnitNzd.toFixed(2)} per month per 1% stake, paid on the first of each month to maintain a constant 5-month float buffer.

The listed rate includes the ${EVOLUTION_MARGIN_PCT.toFixed(1)}% Evolution Stables margin and ${PLATFORM_FEE_PCT.toFixed(1)}% ${PLATFORM_FEE_LABEL}. No separate management invoices or off-platform accounting fees are charged.

---

## Clause 10: Revenue Streams and Distribution

Shareholders are entitled to a share of all revenue generated by ${v(h.legalName)} during the lease period, proportional to their leased stake. For ${v(h.legalName)}, the revenue split is ${context.distributionSplit ? context.distributionSplit : BLANK}.

Potential Revenue Streams include:

- Race winnings (prizemoney, bonuses)
- Sponsorship & endorsements
- Media & naming rights
- Appearance fees
- Merchandising & hospitality
- Data licensing
- Breeding or exit proceeds (if applicable, subject to the stated buyout clause)

All distributions are calculated strictly from officially published NZTR / LoveRacing gross stakes earnings and are made ${context.distributionSchedule ? context.distributionSchedule : BLANK}. Insurance proceeds are not payable to lease holders. Distributions are made by direct bank transfer or card refund to the Shareholder's verified payment method within ${REFUND_WINDOW_DAYS} business days of receipt from NZTR or other sources.

---

## Clause 11: Syndicate Management Fee

A **${EVOLUTION_MARGIN_PCT.toFixed(1)}% syndicate management margin** is embedded in the monthly keep rate of **$${p.monthlyKeepUnitNzd.toFixed(2)} per 1% stake**. No separate management invoices or off-platform accounting fees are charged.

---

## Clause 12: Manager Removal — NZTR Code of Practice Rule 22.1

The removal or replacement of the Syndicate Manager is governed strictly by **NZTR Code of Practice Rule 22.1**.

A manager may only be removed by:
1. A **75% majority vote** of syndicate members; or
2. Intervention by the NZTR Board for cause under the Rules of Racing.

All disputes must first be referred to NZTR for mediation in accordance with the Code of Practice.

---

## Clause 13: Governing Law & Jurisdiction

This Agreement is governed exclusively by the laws of **New Zealand** and the **NZTR Rules of Racing**. All disputes arising under this Agreement are subject to the jurisdiction of New Zealand courts and NZTR dispute resolution procedures.

There are no foreign arbitration clauses, no Middle Eastern / offshore jurisdiction clauses, and no offshore governing law provisions.

---

## Clause 14: Insurance and Early Termination

The horse will be insured for mortality and specified risks at the owner's discretion for the duration of the lease. Insurance proceeds, if any, are payable to the owner/lessor and not to the syndicate or lease holders. If the horse dies or is retired due to injury or illness during the lease term, this agreement and the lease will terminate immediately. Lease holders will receive a pro-rata refund of unused prepaid keep and security deposit reserve for the unused portion of the lease term, calculated from the date of termination to the scheduled end of the lease. No further compensation or insurance proceeds are payable to lease holders.

---

## Clause 15: Transfer of Shares

Shares may only be transferred with the written consent of the Manager and in accordance with NZTR rules. Transfers must be processed through Evolution Stables, subject to AML/CFT and eligibility checks. There is no guarantee of liquidity or a secondary market for shares.

---

## Clause 16: Dispute Resolution

Disputes must first be raised with the Manager in writing. If unresolved, disputes may be escalated to NZTR and, if necessary, to independent mediation as per NZTR guidelines.

---

## Clause 17: Winding Up and Post-Lease Arrangements

At the end of the Lease Term, the Syndicate will be automatically wound up. The lease does not roll over unless the Manager offers a renewal and participants opt in under new terms. If the horse is retired, injured, or otherwise unable to race during the lease period, the lease will be terminated early. In such cases, lease holders will receive a pro-rata refund of unused prepaid keep and security deposit reserve based on the remaining portion of the lease term. Evolution Stables holds itself and its partners to the highest standards of care, ensuring that animal welfare remains central to all decisions made during the lease. All post-racing arrangements are the responsibility of the horse's connections and are expected to comply with NZTR's welfare guidelines.

---

## Clause 18: Notices

Notices may be sent by email to the addresses provided by Shareholders. Notices to the Syndicate are sent to the address registered by the Manager with NZTR.

---

## Schedule 1: NZTR Statutory Member Declarations

Each subscriber confirms by executing this Agreement that they:

- are at least 18 years of age;
- are not subject to any racing disqualification or exclusion order;
- have provided verified proof of identity acceptable to the Syndicate Manager; and
- understand that participation is in a leasehold interest only and does not confer direct ownership of the thoroughbred.

**Thoroughbred:** ${v(h.legalName)}${h.barnName && h.barnName !== h.legalName ? ` (${h.barnName})` : ''}  
**Foaled:** ${foalingLabel(h.foalingDate) || v(h.foalingYear)}  
**Gender:** ${v(h.gender)}  
**Breeder:** ${v(h.breeder)}  
**Sire:** ${v(h.sire)}  
**Dam:** ${v(h.dam)}  
**Owner:** ${v(context.ownerName)}  
**Trainer:** ${v(t.name)}${t.location ? ` (${t.location})` : ''}

---

## Execution

By executing the Application Form (whether physically or electronically via Evolution Stables), each Shareholder is deemed to have accepted and agreed to be bound by this Agreement and the accompanying Product Disclosure Statement.

**Shareholder Name:** ${BLANK}

**Signed:** _________________________

**Date:** ${BLANK}

---

**Alex Baddeley**  
**Director, Evolution Stables Ltd**  
**8 Huia Street, Auckland, New Zealand**

---

*Executed under the NZTR Syndication Code of Practice.*
`;
}

export function getSaClauseTitles(): string[] {
  return [
    'Clause 1: Formation',
    'Clause 2: Object',
    'Clause 3: Agreement and Parties',
    'Clause 4: Syndicate Shares',
    'Clause 5: Lease Duration',
    'Clause 6: Equine Welfare Supremacy',
    'Clause 7: Manager\'s Powers and Duties',
    'Clause 8: Default & Forfeiture',
    'Clause 9: Financial Contributions and Fees',
    'Clause 10: Revenue Streams and Distribution',
    'Clause 11: Syndicate Management Fee',
    'Clause 12: Manager Removal — NZTR Code of Practice Rule 22.1',
    'Clause 13: Governing Law & Jurisdiction',
    'Clause 14: Insurance and Early Termination',
    'Clause 15: Transfer of Shares',
    'Clause 16: Dispute Resolution',
    'Clause 17: Winding Up and Post-Lease Arrangements',
    'Clause 18: Notices',
    'Schedule 1: NZTR Statutory Member Declarations',
    'Execution',
  ];
}
