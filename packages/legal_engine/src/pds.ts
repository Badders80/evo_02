/**
 * Product Disclosure Statement (PDS) Generator for Evolution Stables DSL.
 * Authority: evo_00/doc/DSL_MANUAL.md §1–§6 and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 *
 * Litmus rule (founder 2026-09-09): renders ONLY what is in the data. A missing
 * field renders as a blank marker — never a hardcoded default. Proforma sections
 * are generator output (read-only); the non-proforma fields are the data.
 */

import type { SyndicateLegalContext, HorseSoftLegalContent } from './types';
import { BLANK } from './term_sheet';
import { foalingLabel } from './age';

/** Coerce a value to its display string, or the blank marker when absent. */
function v(x: string | number | null | undefined): string {
  if (x === null || x === undefined || x === '') return BLANK;
  return String(x);
}

/**
 * Normalizes soft text to prevent cryptographic hash drift from line endings or whitespace.
 */
export function canonicalizeSoftLegal(c?: Partial<HorseSoftLegalContent>): HorseSoftLegalContent {
  const clean = (s?: string) =>
    (s ?? '')
      .normalize('NFC')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .trim();

  return {
    aboutHorse: clean(c?.aboutHorse),
    trainerBio: clean(c?.trainerBio),
    racingOutlookAndPedigree: clean(c?.racingOutlookAndPedigree),
    raceExpectation: clean(c?.raceExpectation),
  };
}

export function generatePdsMarkdown(context: SyndicateLegalContext): string {
  const p = context.pricing;
  const h = context.horse;
  const t = context.trainer;
  const soft = canonicalizeSoftLegal(context.softLegal);

  const aboutSection = soft.aboutHorse
    ? `### §2.1 About Horse & Trainer\n\n${soft.aboutHorse}\n\n${soft.trainerBio ? `${soft.trainerBio}\n\n` : ''}`
    : '';
  const outlookSection = soft.racingOutlookAndPedigree
    ? `\n\n### §2.3 Racing Outlook & Pedigree\n\n${soft.racingOutlookAndPedigree}\n`
    : '';
  const raceExpectationSection = soft.raceExpectation
    ? `\n\n### §2.4 Racing Expectation\n\n${soft.raceExpectation}\n`
    : '';

  // §1 minimum investment / step: data-driven, blank when unset.
  const minInvestment = context.minInvestmentPct != null ? `${context.minInvestmentPct.toFixed(1)}%` : BLANK;
  const stakeStep = context.stakeStepPct != null ? `${context.stakeStepPct.toFixed(1)}%` : BLANK;

  // §4 float & billing: model-aware, blank when the model is unset.
  const paymentModel = context.paymentModel;
  const termMonths = context.termMonths;
  let floatSection: string;
  if (paymentModel === 'upfront') {
    const upfrontTotal = termMonths != null ? `$${(p.monthlyKeepUnitNzd * termMonths).toFixed(2)}` : BLANK;
    const termLabel = termMonths != null ? `${termMonths}-month` : BLANK;
    floatSection = `Participation is structured as an **upfront payment of ${upfrontTotal} per 1% stake**, covering the full ${termLabel} syndicate lease term.

There are no recurring monthly subscription fees or capital calls.

Upon formal termination or maturity of the syndicate lease, any unused prepaid keep is **refunded pro-rata** to the investor’s verified payment method within 14 business days.`;
  } else if (paymentModel === 'subscription_float') {
    floatSection = `At initial participation, an investor pays **$${p.joinFloatUnitNzd.toFixed(2)}**, representing:
- 3 months security deposit reserve; and
- 2 months prepaid keep.

From month 2 onwards, the investor pays **$${p.monthlyKeepUnitNzd.toFixed(2)} per month** to maintain a constant 5-month float buffer.

Upon formal termination or maturity of the syndicate lease, all unused prepaid keep and security deposit reserve funds are **refunded pro-rata** to the investor’s verified payment method within 14 business days.`;
  } else {
    floatSection = `**Payment Model:** ${BLANK}

**Float & Billing:** ${BLANK}`;
  }

  // §5 gross stakes split: owner-set, never a platform default.
  const distributionSplit = context.distributionSplit;
  const distributionSchedule = context.distributionSchedule;
  let splitSection: string;
  if (distributionSplit) {
    splitSection = `All prize money distributions are calculated strictly from **officially published NZTR / LoveRacing gross stakes earnings**.

**Gross Stakes Distribution:** ${distributionSplit}

**Distribution Schedule:** ${distributionSchedule ? distributionSchedule : BLANK}`;
  } else {
    splitSection = `All prize money distributions are calculated strictly from **officially published NZTR / LoveRacing gross stakes earnings**.

**Gross Stakes Distribution:** ${BLANK}

**Distribution Schedule:** ${BLANK}`;
  }

  // §6 exit / close style: blank when unset.
  const closeStyleLabel =
    context.closeStyle === 'fourteen_day'
      ? 'Standard 14-Day Notice (Case B)'
      : context.closeStyle === 'three_x_remaining'
        ? '3× Buyout Liquidating Exit (Case B1)'
        : BLANK;
  const closeDetail =
    context.closeStyle === 'fourteen_day'
      ? 'An investor may exit by giving 14 calendar days written notice when the underlying head lease concludes or the horse is retired. No penalty buyout applies.'
      : context.closeStyle === 'three_x_remaining'
        ? 'Where the head lease provides liquidation proceeds, the syndicate may be wound up by payment of 3× the remaining lease value to co-owners.'
        : BLANK;

  return `# Product Disclosure Statement
## ${v(context.syndicateName)}

**Campaign:** ${v(context.campaignSlug)}  
**Version:** ${v(context.pdsVersion)}  
**Effective Date:** ${v(context.effectiveDate)}

---

## §1. Title & Structure

This Product Disclosure Statement relates to the **${v(context.syndicateName)}**, a digitally-syndicated thoroughbred ownership campaign managed by **${v(t.managerEntity)}**, a registered Syndicate Manager under the New Zealand Thoroughbred Racing (NZTR) Rules of Racing and Syndication Code of Practice.

Participation is offered in the form of fractional leasehold stakes. Each stake is a percentage interest in the syndicated leasehold of the thoroughbred described in §2, from a minimum investment of ${minInvestment}, with increments of ${stakeStep} thereafter.

---

## §2. Asset Specifics

${aboutSection}### §2.2 Key Details

| Attribute | Detail |
| :--- | :--- |
| Legal Name | ${v(h.legalName)} |
| Barn Name | ${v(h.barnName)} |
| Foaled | ${foalingLabel(h.foalingDate) || v(h.foalingYear)} |
| Gender | ${v(h.gender)} |
| Breeder | ${v(h.breeder)} |
| Sire | ${v(h.sire)} |
| Dam | ${v(h.dam)} |
| Microchip | ${v(h.microchip)} |
| Trainer | ${v(t.name)}${t.location ? ` (${t.location})` : ''} |${outlookSection}${raceExpectationSection}
---

## §3. Commercial Model

| Component | Rate | Monthly Amount (per 1% stake) |
| :--- | :--- | ---: |
| Base lease & keep cost | 100% | $${(p.costMonthlyNzd * 0.01).toFixed(2)} |
| Evolution operating margin | 5.0% | Included above |
| Platform Fees | 3.0% | Included above |
| **Listed monthly keep rate (M)** | — | **$${p.monthlyKeepUnitNzd.toFixed(2)}** |

The listed monthly rate is calculated as:
> M = CEIL(cost × 1.05 × 1.03)

The manager margin and platform fees are embedded in the listed rate. No additional invoices are issued.

---

## §4. Float & Billing

${floatSection}

---

## §5. Gross Stakes Split

${splitSection}

---

## §6. Exit & Close Style

This syndicate operates under the **${closeStyleLabel}** mechanism.

${closeDetail}

Upon exit, any unused float is refunded pro-rata within 14 business days.

---

*This PDS must be read together with the Syndicate Agreement.*
`;
}

export function getPdsSectionTitles(): string[] {
  return [
    '§1. Title & Structure',
    '§2. Asset Specifics',
    '§3. Commercial Model',
    '§4. Float & Billing',
    '§5. Gross Stakes Split',
    '§6. Exit & Close Style',
  ];
}
