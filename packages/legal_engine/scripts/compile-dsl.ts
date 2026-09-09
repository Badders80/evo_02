/**
 * Headless DSL assembly — compile the term sheet for one horse from canonical
 * seed data (no MC, no DB round-trip). This is the "bring a DSL together"
 * rehearsal: horse + owner + trainer + commercials → term sheet for eyeball.
 *
 * Run: pnpm --filter @evo/legal_engine exec tsx scripts/compile-dsl.ts
 */
import { compileLegalPack } from '../src';

const manolo = {
  syndicateName: 'I Stole A Manolo Syndicate',
  campaignSlug: 'i-stole-a-manolo',
  ownerName: 'B.A.X Bloodstock',
  horse: {
    legalName: 'I Stole A Manolo (NZ)',
    barnName: 'Manolo',
    foalingYear: 2023,
    gender: 'Filly' as const,
    breeder: 'Goldeye Trust',
    microchip: '985125000139219',
    sire: 'Satono Aladdin (JPN)',
    dam: 'Canuhandleajandal (NZ)',
  },
  trainer: {
    name: "Lance O'Sullivan & Andrew Scott",
    location: 'Wexford Stables, Matamata, NZ',
    managerEntity: 'Evolution Stables',
  },
  pricing: {
    costMonthlyNzd: 7000,
    listPriceNzd: 7571,
    monthlyKeepUnitNzd: 76,
    joinFloatUnitNzd: 380,
    stakePercentage: 1.0,
    evolutionMarginPercent: 5.0,
    platformFeePercent: 3.0,
    gstInclusive: true,
  },
  closeStyle: 'fourteen_day' as const,
  totalHorsePercentage: 5.0,
  totalShares: 10,
  sharesAvailable: 10,
  paymentModel: 'subscription_float' as const,
  termStartDate: '2026-09-01',
  termEndDate: '2028-06-30',
  minInvestmentPct: 1.0,
  stakeStepPct: 0.5,
  pdsVersion: '1.0.0',
  saVersion: '1.0.0',
  effectiveDate: '2026-09-01',
};

const { pack } = compileLegalPack(manolo, { skipValidation: true });

console.log('════════════════════════════════════════════════════════════');
console.log('TERM SHEET — I Stole A Manolo (monthly DSL)');
console.log('════════════════════════════════════════════════════════════');
console.log(pack.termSheetMarkdown);
console.log('════════════════════════════════════════════════════════════');
console.log(`termSheetHash: ${pack.termSheetHash}`);
console.log(`pdsHash:       ${pack.pdsHash}`);
console.log(`saHash:        ${pack.saHash}`);
