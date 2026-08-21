/**
 * Syndicate Agreement (SA) Generator for Evolution Stables DSL.
 * Authority: evo_00/doc/DSL_MANUAL.md and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 */

import type { SyndicateLegalContext } from './types';

export function generateSaMarkdown(context: SyndicateLegalContext): string {
  const p = context.pricing;
  const h = context.horse;
  const t = context.trainer;

  return `# Syndicate Agreement
## ${context.syndicateName}

**Campaign:** ${context.campaignSlug}  
**Version:** ${context.saVersion}  
**Effective Date:** ${context.effectiveDate}

---

## Clause 1: Formation & Purpose

The **${context.syndicateName}** is formed to acquire and hold a syndicated leasehold interest in the thoroughbred described in Schedule 1. The Syndicate Manager is **${t.managerEntity}**, registered as an Authorised Syndicator under the New Zealand Thoroughbred Racing (NZTR) Rules of Racing and Syndication Code of Practice.

---

## Clause 6: Equine Welfare Supremacy

The licensed Trainer and Racing Manager hold **sole, absolute, and unchallengeable discretion** regarding all training regimes, race nominations, trackwork, spelling, and veterinary care.

Neither **${t.managerEntity}** nor any syndicate member may override veterinary or welfare decisions. The welfare of the thoroughbred is paramount at all times.

---

## Clause 8: Default & Float Reserve Drawdown

If a monthly keep payment remains unpaid for more than 14 days after its due date, the investor will receive a default notice. If the default continues for 30 days, the Syndicate Manager may draw on the investor’s float reserve to bring the account into good standing.

Drawdown is applied to prepaid keep and security deposit reserves only, in that order. No additional penalties are levied beyond the contractual obligations set out in this Agreement.

---

## Clause 11: Syndicate Management Fee

A **5.0% syndicate management margin** is embedded in the monthly keep rate of **$${p.monthlyKeepUnitNzd.toFixed(2)} per 1% unit**. No separate management invoices or off-platform accounting fees are charged.

The listed rate is calculated as:
> M = CEIL(cost × 1.05 × 1.03)

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

## Schedule 1: NZTR Statutory Member Declarations

Each subscriber confirms by executing this Agreement that they:
- are at least 18 years of age;
- are not subject to any racing disqualification or exclusion order;
- have provided verified proof of identity acceptable to the Syndicate Manager; and
- understand that participation is in a leasehold interest only and does not confer direct ownership of the thoroughbred.

**Thoroughbred:** ${h.legalName} (${h.barnName})  
**Foaling Year:** ${h.foalingYear}  
**Gender:** ${h.gender}  
**Breeder:** ${h.breeder}  
**Sire:** ${h.sire}  
**Dam:** ${h.dam}  
**Owner:** ${context.ownerName}  
**Trainer:** ${t.name} (${t.location})

---

*Executed under the NZTR Syndication Code of Practice.*
`;
}

export function getSaClauseTitles(): string[] {
  return [
    'Clause 1: Formation & Purpose',
    'Clause 6: Equine Welfare Supremacy',
    'Clause 8: Default & Float Reserve Drawdown',
    'Clause 11: Syndicate Management Fee',
    'Clause 12: Manager Removal — NZTR Code of Practice Rule 22.1',
    'Clause 13: Governing Law & Jurisdiction',
    'Schedule 1: NZTR Statutory Member Declarations',
  ];
}
