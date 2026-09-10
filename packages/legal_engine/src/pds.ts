/**
 * Product Disclosure Statement (PDS) Generator for Evolution Stables DSL.
 * Authority: evo_00/doc/DSL_MANUAL.md §1–§6 and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 *
 * Litmus rule (founder 2026-09-09): renders ONLY what is in the data. A missing
 * field renders as a blank marker — never a hardcoded default. Proforma sections
 * are generator output (read-only); the non-proforma fields are the data.
 *
 * Full-document skeleton (founder-locked 2026-09-10): Key Information Summary,
 * About Evolution Stables, the six commercial core sections, then the extended
 * disclosure set (insurance, valuation, vet, material interests, risk
 * disclosure, responsible investment, records, complaints, transfer, investment
 * details, investor declaration, promoter declaration).
 */

import type { SyndicateLegalContext, HorseSoftLegalContent } from './types';
import { BLANK } from './term_sheet';
import { foalingLabel } from './age';
import {
  EVOLUTION_MARGIN_PCT,
  PLATFORM_FEE_PCT,
  PLATFORM_FEE_LABEL,
  FLOAT_DEPOSIT_MONTHS,
  FLOAT_PREPAID_MONTHS,
  FLOAT_TOTAL_MONTHS,
  QUALIFICATION_PAID_UP_MONTHS,
} from './commercial-rules';

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

/** Leased term label, data-driven (blank when unset). */
function termLabel(context: SyndicateLegalContext): string {
  if (context.termMonths == null) return BLANK;
  if (context.termStartDate && context.termEndDate) {
    return `${context.termMonths} months (${context.termStartDate} → ${context.termEndDate})`;
  }
  return `${context.termMonths} months`;
}

/** Key Information Summary — the modern opening block, legacy-free. */
function keyInformationSummary(context: SyndicateLegalContext): string {
  const p = context.pricing;
  const h = context.horse;
  const t = context.trainer;
  const soft = canonicalizeSoftLegal(context.softLegal);

  const costsBlock =
    context.paymentModel === 'upfront'
      ? `- **Lease fee:** $${(p.monthlyKeepUnitNzd * (context.termMonths ?? 0)).toFixed(2)} per 1% stake (fixed, covers all costs for the term).`
      : `- $${p.monthlyKeepUnitNzd.toFixed(2)} per month per 1% stake, recurring monthly for the duration of the investment.\n- A one-time upfront payment covers the deposit and initial payment.`;

  // Current Available Stake = available units × step (percent), falling back to the
  // total syndicate stake when availability is unset (fresh campaign, nothing sold).
  const availablePct =
    context.sharesAvailable != null && context.stakeStepPct != null
      ? (context.sharesAvailable * context.stakeStepPct).toFixed(1)
      : context.totalHorsePercentage != null
        ? context.totalHorsePercentage.toFixed(1)
        : BLANK;

  // Split label is "75% Investor Pool / 25% Owner Retention" — extract ONLY the
  // leading percentage for prose ("75% of gross stakes"), never the pool label.
  const splitPct = context.distributionSplit
    ? (context.distributionSplit.match(/^\s*(\d+(?:\.\d+)?%)/) ?? [])[1] ?? context.distributionSplit.split('/')[0].trim()
    : 'a pro-rata share';

  const structureBullets = [
    '- **Asset Type:** Leasehold interest in a thoroughbred racehorse',
    `- **Asset Name:** ${v(h.legalName)}${h.barnName && h.barnName !== h.legalName ? ` (${h.barnName})` : ''}`,
    `- **Current Available Stake:** ${availablePct}% syndicated share of total ownership`,
    `- **Minimum Investment:** ${context.minInvestmentPct != null ? `${context.minInvestmentPct.toFixed(1)}%` : BLANK}`,
    context.termMonths != null ? `- **Term:** ${termLabel(context)}` : `- **Term:** ${BLANK}`,
    `- **Managed by:** ${v(t.managerEntity)} (Authorised Syndicator)`,
    '- **Governing Authority:** New Zealand Thoroughbred Racing (NZTR)',
  ].join('\n');

  const expectation = soft.raceExpectation
    ? soft.raceExpectation
    : 'Race schedule expectations will be confirmed by the yard and communicated to Members.';

  return `## Key Information Summary

**What is this?**

This Product Disclosure Statement outlines a leasehold interest in ${v(h.legalName)}, a New Zealand thoroughbred. ${v(context.syndicateName)} makes fractional participation available to Members through its digital-syndication model. Full authority: the Commercial Model and Asset Specifics sections below and the Syndicate Agreement.

**Who is this for?**

Individuals seeking exposure to racehorse ownership in a structured, managed format — no prior ownership experience required.

**How does it work?**

You invest in a share of the syndicated leasehold interest in ${v(h.legalName)}. Your fixed-price payments cover the costs of the lease for the term, with no additional capital calls. Your returns are linked directly to the performance of the asset, where you receive ${splitPct} of gross stakes, generated from racing, proportional to your interest.

**About the Asset**

${structureBullets}

**Returns**

Investors receive ${splitPct} of gross stakes won during their eligible investment period. There are no guarantees, and you may not recover your original investment.

**Costs**

${costsBlock}

**Race Schedule Expectation**

${expectation}

**Risks**

The horse may underperform, suffer injury, or be retired early. Early termination may result in a pro-rata refund. Limited liquidity — resale may not be immediate or available. You could lose the full amount of your investment. (See Section 12.)

**How to Invest**

Applications are made directly through Evolution Stables. Identity verification is required under AML/CFT laws. (See Section 17 — Investment Details.)

**Manager**

Evolution Stables is an NZTR-authorised syndicator specialising in digital syndication of leasehold interests in New Zealand thoroughbreds. (See About Evolution Stables below.)`;
}

/** About Evolution Stables — exemplar §1 modernized (no tokens, no offshore platform). */
function aboutEvolutionStables(): string {
  return `## About Evolution Stables

Evolution Stables is a New Zealand-based, NZTR-authorised syndicator offering structured, digitally-syndicated ownership of leasehold interests in New Zealand thoroughbreds.

We partner with leading owners and trainers to lease premium bloodstock, then make those opportunities available in fractional, fixed-term interests. This lowers the cost of entry and simplifies ownership, giving more people the chance to experience the sport from the inside.

Our approach blends the tradition, passion, and community of racing with modern technology and transparent processes — helping to build the next generation of owners.`;
}

/** Extended disclosure sections — modern, legacy-free, data-driven where figures exist. */
function extendedSections(context: SyndicateLegalContext): string {
  const p = context.pricing;
  const h = context.horse;

  const insuranceSection = `## §8. Insurance

Evolution Stables has not secured mortality insurance for this leasehold stake. Because this is a fixed-term leasehold interest rather than an equity ownership stake, capital mortality insurance is not applicable. In the event of the horse's death or permanent retirement, the lease terminates automatically, and all unspent deposit funds are refunded pro-rata as outlined in Section 6.`;

  const materialInterests = `## §11. Material Interests

Evolution Stables Ltd receives a ${EVOLUTION_MARGIN_PCT.toFixed(1)}% margin incorporated into the listed rate to cover the structuring, management, and regulatory oversight of the syndicate. ${PLATFORM_FEE_LABEL} of ${PLATFORM_FEE_PCT.toFixed(1)}% cover payment processing and platform services. There are no other hidden fees or material conflicts of interest.`;

  const riskDisclosure = `## §12. Risk Disclosure

Participation in racehorse syndication is highly speculative and carries significant risks.

12.1. **Performance Risk:** The horse may not perform well, may not win prize money, and may not generate any revenue.
12.2. **Health Risk:** The horse may suffer injury, illness, or death, preventing it from racing.
12.3. **Liquidity Risk:** Your interest is a fixed-term leasehold. There is no guarantee of an active secondary market or that you will be able to sell your interest before the term ends.
12.4. **Capital Loss:** You may lose the entirety of your initial investment.`;

  const investmentDetails = `I hereby apply for the following interest in the ${v(context.syndicateName)}:

17.1. **Stake Percentage:** ${BLANK}
17.2. **Initial Payment:** $${p.joinFloatUnitNzd.toFixed(2)} per 1% stake
17.3. **Monthly Commitment:** $${p.monthlyKeepUnitNzd.toFixed(2)} per month per 1% stake`;

  const investorDeclaration = `By signing this Application Form, on ${BLANK} I acknowledge and agree that:

1. I have received, read, and understood the Product Disclosure Statement (PDS) and the Syndicate Agreement for the ${v(context.syndicateName)}.
2. I agree to be bound by the terms of the Syndicate Agreement, the PDS, and the Rules of Racing administered by NZTR.
3. I understand that my participation is strictly as a leaseholder and confers no ownership rights in the horse.
4. I understand the risks set out in the PDS, including that I may not recover my original investment.
5. I consent to my details being provided to NZTR and Evolution Stables for compliance with AML/CFT, registration, and regulatory purposes.

**Name:** ${BLANK}

**Signed:** ${BLANK}

**Date:** ${BLANK}`;

  return `${insuranceSection}

---

## §9. Valuation

No independent valuation of the horse's capital value has been undertaken for this offering. The pricing of the interests is based entirely on the wholesale operational cost of leasing the horse over the term, rather than the intrinsic capital value of the bloodstock.

---

## §10. Veterinary Report

${v(h.legalName)} is an actively training thoroughbred. A general veterinary inspection is conducted prior to the commencement of the lease to ensure the horse is fit for racing purposes. However, investors acknowledge that racehorses are prone to injury and illness, and past fitness does not guarantee future soundness.

---

${materialInterests}

---

${riskDisclosure}

---

## §13. Responsible Investment

Evolution Stables holds itself and its partners to the highest standards of care. Animal welfare remains central to all decisions made during the lease. All training, spelling, and veterinary decisions are made by licensed professionals. All post-racing arrangements are the responsibility of the horse's connections and are expected to comply with NZTR's welfare guidelines.

---

## §14. Records & Financial Reporting

Evolution Stables will maintain a register of all Members. Financial updates, including prize money distributions and race reports, will be provided regularly. A final financial summary will be issued at the conclusion of the lease term.

---

## §15. Complaints

Any complaints regarding the management of the Syndicate should be directed in the first instance to Evolution Stables. If the matter cannot be resolved, it may be escalated to New Zealand Thoroughbred Racing (NZTR) in accordance with the Rules of Racing.

---

## §16. Transfer of Interest

Interests may only be transferred subject to the written consent of the Syndicate Manager and NZTR compliance requirements. Evolution Stables does not guarantee a secondary market.

---

## §17. Investment Details

${investmentDetails}

---

## §18. Investor Declaration

${investorDeclaration}

---

## §19. Promoter Declaration

I, Alex Baddeley, as the promoter of this syndicate, declare that the information provided in this Product Disclosure Statement is, to the best of my knowledge, true and correct, and that I am not aware of any information that would make this statement misleading in any material respect.

**Signed:** Alex Baddeley

**Director, Evolution Stables Ltd**

**8 Huia Street, Auckland, New Zealand`;
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
    const termLabel2 = termMonths != null ? `${termMonths}-month` : BLANK;
    floatSection = `Participation is structured as an **upfront payment of ${upfrontTotal} per 1% stake**, covering the full ${termLabel2} syndicate lease term.

There are no recurring monthly subscription fees or capital calls.

Upon formal termination or maturity of the syndicate lease, any unused prepaid keep is refunded pro-rata to the investor’s verified payment method.`;
  } else if (paymentModel === 'subscription_float') {
    floatSection = `The digitally syndicated campaign operates on a five-month initial investment upon participation, with recurring monthly payments due on the 1st of every month thereafter.

The five-month initial investment follows a 3+2 structure outlined below:

- ${FLOAT_DEPOSIT_MONTHS} months security deposit reserve; and
- ${FLOAT_PREPAID_MONTHS} months keep (comprising the initial installment and 1 month in advance).

Upon formal termination or maturity of the syndicate lease, all unused prepaid keep and security deposit reserve funds are refunded pro-rata to the investor's verified payment method.`;
  } else {
    floatSection = `**Payment Model:** ${BLANK}

**Deposit & Billing:** ${BLANK}`;
  }

  // §5 investor return: owner-set, never a platform default.
  const distributionSplit = context.distributionSplit;
  const distributionSchedule = context.distributionSchedule;
  let splitSection: string;
  if (distributionSplit) {
    splitSection = `Investors receive a distribution calculated strictly from official New Zealand Thoroughbred Racing (NZTR) gross stakes won during their eligible participation period:

5.1. **Stakes Calculation:** Based on official NZTR stakes distributions published via loveracing.nz.
5.2. **Stakes Allocation:** ${distributionSplit} of total gross stakes won is allocated to the Investor Pool (distributed pro-rata relative to stake held).
5.3. **Distribution Schedule:** ${distributionSchedule ? distributionSchedule : BLANK}.
5.4. **Qualification Period:** Investors must have maintained fully paid-up status for two (${QUALIFICATION_PAID_UP_MONTHS}) full months prior to a race date to qualify for prize money distributions from that race.`;
  } else {
    splitSection = `Investors receive a distribution calculated strictly from official New Zealand Thoroughbred Racing (NZTR) gross stakes won during their eligible participation period:

5.1. **Stakes Calculation:** Based on official NZTR stakes distributions published via loveracing.nz.
5.2. **Stakes Allocation:** ${BLANK} of total gross stakes won is allocated to the Investor Pool (distributed pro-rata relative to stake held).
5.3. **Distribution Schedule:** ${BLANK}.
5.4. **Qualification Period:** Investors must have maintained fully paid-up status for two (${QUALIFICATION_PAID_UP_MONTHS}) full months prior to a race date to qualify for prize money distributions from that race.`;
  }

  // §6 exit & termination: close-style-driven, blank when unset.
  const closeStyleLabel =
    context.closeStyle === 'fourteen_day'
      ? 'Lessor 14-Day Break'
      : context.closeStyle === 'three_x_remaining'
        ? 'Early Sale / Buyout'
        : BLANK;
  const closeDetail =
    context.closeStyle === 'fourteen_day'
      ? `**Lessor 14-Day Break:** This syndicate operates under the Standard 14-Day Notice mechanism stipulated by the horse owner, matching the underlying Head Lease agreement. The lease may be terminated upon 14 calendar days' written notice when the underlying head lease concludes or the horse is retired. This process is triggered exclusively by the owner, not Evolution Stables.`
      : context.closeStyle === 'three_x_remaining'
        ? `**Early Sale / Buyout:** If the horse is sold or bought out prior to the conclusion of the lease term, investors will receive a payout equivalent to 3× the remaining lease value per 1% stake, distributed pro-rata. This process is triggered by the owner, not Evolution Stables.`
        : BLANK;

  const exitSection = `## §6. Exit & Termination

Rules for exit and termination are designed around three core pillars: creating accessible investment opportunities, maintaining commercial viability, and prioritizing the long-term care of the horse.

${closeStyleLabel ? `**${closeStyleLabel}:** ${closeDetail.replace(/^\*\*[^*]+\*\*:\s*/, '')}` : BLANK}

**Investor Notice & Wind-Down Period:** An investor may give notice of exit prior to their next monthly installment date. Upon receiving notice, recurring monthly billing ceases, and the investor's 3+2 deposit structure serves as the active wind-down period until their participation concludes.

**Default & Forfeiture:** An investor enters default if a scheduled monthly payment is missed. Evolution Stables will notify the investor during the default period. If the outstanding balance is not rectified prior to the next billing cycle, the investment is deemed in default. The investor forfeits all future rights to prize money distributions and their deposit, which is subsequently reallocated to the horse owner to secure the ongoing care and maintenance of the horse. Evolution Stables receives no material financial benefit from an investor default.`;

  const taxSection = `## §7. Taxes

Investors are responsible for their own tax liabilities arising from any distributions or returns generated by their participation in this Syndicate. Evolution Stables does not provide tax advice. Participants should consult their own independent tax advisors regarding the implications of holding an interest and receiving racehorse distributions.`;

  return `# Product Disclosure Statement
## ${v(context.syndicateName)}

**Campaign:** ${v(context.campaignSlug)}  
**Version:** ${v(context.pdsVersion)}  
**Effective Date:** ${v(context.effectiveDate)}

---

${keyInformationSummary(context)}

---

${aboutEvolutionStables()}

---

## §1. Title & Structure

This Product Disclosure Statement relates to the ${v(context.syndicateName)}, a digitally-syndicated thoroughbred ownership campaign managed by ${v(t.managerEntity)}, a registered Syndicate Manager under the New Zealand Thoroughbred Racing (NZTR) Rules of Racing and Syndication Code of Practice.

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

This syndicate operates on a fixed rate of **$${p.monthlyKeepUnitNzd.toFixed(2)} per month per 1% stake**.

---

## §4. Deposit & Billing

${floatSection}

---

## §5. Investor Return

${splitSection}

---

${exitSection}

---

${taxSection}

---

${extendedSections(context)}

---

*This PDS must be read together with the Syndicate Agreement.*
`;
}

export function getPdsSectionTitles(): string[] {
  return [
    'Key Information Summary',
    'About Evolution Stables',
    '§1. Title & Structure',
    '§2. Asset Specifics',
    '§3. Commercial Model',
    '§4. Deposit & Billing',
    '§5. Investor Return',
    '§6. Exit & Termination',
    '§7. Taxes',
    '§8. Insurance',
    '§9. Valuation',
    '§10. Veterinary Report',
    '§11. Material Interests',
    '§12. Risk Disclosure',
    '§13. Responsible Investment',
    '§14. Records & Financial Reporting',
    '§15. Complaints',
    '§16. Transfer of Interest',
    '§17. Investment Details',
    '§18. Investor Declaration',
    '§19. Promoter Declaration',
  ];
}
