import assert from 'node:assert/strict';
import { computeDslPricing } from '@evo/legal_engine';
import { lookupHorse, extractLoveRacingId, extractMicrochip } from './horse-lookup';
import { parseSmartContentDump } from './smart-intake-parser';

console.log('Running Horse Lookup, Smart Intake Parser & Invariant tests...\n');

// 1. URL & Microchip Extraction Tests (All LoveRacing Derivatives)
{
 // A. Breeding / Pedigree Matrix URL
 const id1 = extractLoveRacingId('https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx');
 assert.equal(id1, 427416, 'Should extract 427416 from LoveRacing Breeding URL');

 const id2 = extractLoveRacingId('https://loveracing.nz/Breeding/454763');
 assert.equal(id2, 454763, 'Should extract 454763 from LoveRacing Breeding short URL');

 // B. Performance & Race History Modal URL
 const idModal = extractLoveRacingId('https://loveracing.nz/Common/SystemTemplates/Modal/EntryDetail.aspx?DisplayContext=Modal&HorseID=454763');
 assert.equal(idModal, 454763, 'Should extract 454763 from LoveRacing Performance Modal URL');

 // C. Horse Profile / Trainer & Owner Overview URL
 const idProfile = extractLoveRacingId('https://www.loveracing.nz/Horses/Trainers-and-Owners/horse-profile.aspx?HorseID=454763');
 assert.equal(idProfile, 454763, 'Should extract 454763 from LoveRacing Horse Profile URL');

 // Security tests: Malicious spoofed URLs
 const evilQueryUrl = extractLoveRacingId('https://evil.com/?q=loveracing.nz/Breeding/454763');
 assert.equal(evilQueryUrl, null, 'Should reject spoofed domains containing loveracing.nz in query');

 const evilSubdomainUrl = extractLoveRacingId('https://loveracing.nz.evil.com/Breeding/454763');
 assert.equal(evilSubdomainUrl, null, 'Should reject spoofed subdomains like loveracing.nz.evil.com');

 const fakeDomainUrl = extractLoveRacingId('https://notloveracing.nz/Breeding/454763');
 assert.equal(fakeDomainUrl, null, 'Should reject fake domains like notloveracing.nz');

 // Microchip tests: NZTR 985 prefix required
 const chip = extractMicrochip('Microchip: 985125000137408 on file');
 assert.equal(chip, '985125000137408', 'Should extract 15-digit NZTR microchip starting with 985');

 const nonNztrChip = extractMicrochip('Invalid non-NZTR chip 123456789012345');
 assert.equal(nonNztrChip, null, 'Should reject non-985 15-digit numbers');

 console.log('✅ URL & Microchip extraction verified (Breeding, Performance Modal, Profile, and Security validation)');
}

// 2. Horse Lookup Tests
{
 const horseByUrl = lookupHorse('https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx');
 assert.ok(horseByUrl, 'Should find Prudentia by URL');
 assert.equal(horseByUrl.legalName, 'Prudentia');
 assert.equal(horseByUrl.barnName, 'Prudentia');
 assert.equal(horseByUrl.sire, 'Proisir (AUS)');
 assert.equal(horseByUrl.dam, 'Little Bit Irish (NZ)');

 const horseByChip = lookupHorse('985125000137408');
 assert.ok(horseByChip, 'Should find Lady Ketchikan by Microchip');
 assert.equal(horseByChip.legalName, 'Lady Ketchikan');
 assert.equal(horseByChip.barnName, 'Nellie');

 // Security test: Single character should NOT match
 const shortMatch = lookupHorse('a');
 assert.equal(shortMatch, null, 'Single character query must return null to prevent entity misattribution');

 console.log('✅ Horse Stud Book Lookup by URL & Microchip verified');
}

// 3. Mathematical Pricing Invariant Tests
{
 const pricing = computeDslPricing(6900, 1.0);
 assert.equal(pricing.costMonthlyNzd, 6900);
 assert.equal(pricing.listPriceNzd, 7463, '6900 * 1.05 * 1.03 = 7462.35 -> ceil 7463');
 assert.equal(pricing.monthlyKeepUnitNzd, 75, 'ceil(7463 * 0.01) = 75');
 assert.equal(pricing.joinFloatUnitNzd, 375, '5 * 75 = 375');

 // Guard test: Zero or negative stake must throw
 assert.throws(
 () => computeDslPricing(6900, 0),
 /stakePercentage must be between 0 and 100/,
 'Should throw error if stakePercentage is <= 0'
 );

 console.log('✅ Canonical DSL pricing invariants verified (SSOT computeDslPricing)');
}

// 4. Smart Content Dump Parsing Tests
{
 const rawEmail = `
 Hi Evolution team,
 We are putting together the campaign for Lady Ketchikan (Nellie).
 Trainer will be Barbara Kennedy operating out of Byerley Park in Karaka.
 Owner is Kylie Bax / Bax Bloodstock.
 Wholesale lease and keep cost is $6,900/mo.
 Offering a 10% syndicated lease with standard 14-day notice exit.
 `;

 const extracted = parseSmartContentDump(rawEmail);

 assert.ok(extracted.horse, 'Should identify horse from text');
 assert.equal(extracted.horse.barnName, 'Nellie');

 assert.ok(extracted.matchedOwner, 'Should match Owner / Lessor');
 assert.equal(extracted.matchedOwner.name, 'B.A.X Bloodstock');

 assert.ok(extracted.matchedTrainer, 'Should match Licensed Trainer');
 assert.equal(extracted.matchedTrainer.name, 'Barbara Kennedy');
 assert.equal(extracted.matchedTrainer.location, 'Byerley Park, Karaka, NZ');

 assert.equal(extracted.costMonthlyNzd, 6900, 'Should extract $6900 wholesale cost');
 assert.equal(extracted.monthlyKeepUnitNzd, 75, 'Should compute $M = $75/mo (cost*1.05*1.03*0.01 rounded up)');
 assert.equal(extracted.joinFloatUnitNzd, 375, 'Should compute $5xM = $375 join float');
 assert.equal(extracted.totalHorsePercentage, 10, 'Should extract 10% stake');
 assert.equal(extracted.closeStyle, 'fourteen_day', 'Should detect 14-day notice exit');

 console.log('✅ Smart Content Dump natural text extraction & entity matching verified');
}

console.log('\n🎉 All Intake, Lookup & Invariant tests passed successfully!');
