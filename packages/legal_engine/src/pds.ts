/**
 * Product Disclosure Statement (PDS) Generator for Evolution Stables DSL.
 * Authority: evo_00/doc/DSL_MANUAL.md §1–§6 and evo_00/migration_bridge/04_LEGAL_DIFF_AUDIT.md
 */

import type { SyndicateLegalContext, HorseSoftLegalContent } from './types';

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

  return `# Product Disclosure Statement
## ${context.syndicateName}

**Campaign:** ${context.campaignSlug}  
**Version:** ${context.pdsVersion}  
**Effective Date:** ${context.effectiveDate}

---

## §1. Title & Structure

This Product Disclosure Statement relates to the **${context.syndicateName}**, a digitally-syndicated thoroughbred ownership campaign managed by **${t.managerEntity}**, a registered Syndicate Manager under the New Zealand Thoroughbred Racing (NZTR) Rules of Racing and Syndication Code of Practice.

Participation is offered in the form of fractional leasehold stakes. Each stake represents a 1% interest in the syndicated leasehold of the thoroughbred described in §2.

---

## §2. Asset Specifics

${aboutSection}### §2.2 Key Details

| Attribute | Detail |
| :--- | :--- |
| Legal Name | ${h.legalName} |
| Barn Name | ${h.barnName} |
| Foaling Year | ${h.foalingYear} |
| Gender | ${h.gender} |
| Breeder | ${h.breeder} |
| Sire | ${h.sire} |
| Dam | ${h.dam} |
| Microchip | ${h.microchip || 'Recorded with NZTR'} |
| Trainer | ${t.name} (${t.location}) |${outlookSection}
---

## §3. Commercial Model

| Component | Rate | Monthly Amount (per 1% unit) |
| :--- | :--- | ---: |
| Base lease & keep cost | 100% | $${(p.costMonthlyNzd * 0.01).toFixed(2)} |
| Evolution operating margin | 5.0% | Included above |
| Payment processing buffer | 3.0% | Included above |
| **Listed monthly keep rate (M)** | — | **$${p.monthlyKeepUnitNzd.toFixed(2)}** |

The listed monthly rate is calculated as:
> M = CEIL(cost × 1.05 × 1.03)

The manager margin and processing buffer are embedded in the listed rate. No additional invoices are issued.

---

## §4. Float & Billing

${(context.paymentModel || 'subscription_float') === 'upfront'
    ? `Participation is structured as an **upfront payment of $${(p.monthlyKeepUnitNzd * (context.termMonths || 12)).toFixed(2)} per 1% stake**, covering the full ${context.termMonths || 12}-month syndicate lease term.

There are no recurring monthly subscription fees or capital calls.

Upon formal termination or maturity of the syndicate lease, any unused prepaid keep is **refunded pro-rata** to the investor’s verified payment method within 14 business days.`
    : `At initial participation, an investor pays **$${p.joinFloatUnitNzd.toFixed(2)}**, representing:
- 3 months security deposit reserve; and
- 2 months prepaid keep.

From month 2 onwards, the investor pays **$${p.monthlyKeepUnitNzd.toFixed(2)} per month** to maintain a constant 5-month float buffer.

Upon formal termination or maturity of the syndicate lease, all unused prepaid keep and security deposit reserve funds are **refunded pro-rata** to the investor’s verified payment method within 14 business days.`}

---

## §5. Gross Stakes Split

All prize money distributions are calculated strictly from **officially published NZTR / LoveRacing gross stakes earnings**.

| Pool | Share | Purpose |
| :--- | ---: | :--- |
| Investor Syndicate Pool | 75% | Distributed pro-rata to unit holders |
| Owner Expense Buffer | 25% | Retained by owner to absorb trainer/jockey fees, nominations, acceptances, and race-day incidentals |

**Fixed-Cost Shield:** Investors receive their clean 75% share of official gross stakes without being asked for additional capital contributions. New Zealand Thoroughbred Racing deducts trainer and jockey percentages at source; the 25% owner retention absorbs these deductions plus nomination and race-day incidentals.

**Quarterly Distribution Cadence:** Distributions are issued quarterly.

**Carry-Forward Cut-Off Rule:** Stakes won in the final calendar month of a quarter whose cash settlement has not yet cleared into the manager’s bank account are carried forward to the following quarter’s distribution statement.

**2-Month Paid-Up Qualification Rule:** An investor must have been an active, paid-up syndicate member for at least two full consecutive calendar months prior to the race date to qualify for prize money returns from that race.

---

## §6. Exit & Close Style

This syndicate operates under the **${context.closeStyle === 'fourteen_day' ? 'Standard 14-Day Notice (Case B)' : '3× Buyout Liquidating Exit (Case B1)'}** mechanism.

${context.closeStyle === 'fourteen_day'
    ? 'An investor may exit by giving 14 calendar days written notice when the underlying head lease concludes or the horse is retired. No penalty buyout applies.'
    : 'Where the head lease provides liquidation proceeds, the syndicate may be wound up by payment of 3× the remaining lease value to syndicate holders.'}

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
