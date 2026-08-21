/**
 * Investor Registry & Holdings Data Adapter for Mission Control.
 * Authority: evo_00/migration_bridge/02_DATA_MAPPING.md & evo_00/doc/DSL_MANUAL.md
 */

import type { KycStatus, HoldingStatus } from '@evo/db_models/types';

export interface InvestorHoldingRecord {
 id: string;
 userId: string;
 horseSlug: string;
 horseName: string;
 stakePercentage: number;
 shareUnits: number; // step units: listed_stake_pct / stake_step_pct
 monthlyKeepNzd: number;
 floatBalanceNzd: number;
 stripeSubscriptionId: string;
 subscriptionStatus: 'active' | 'past_due' | 'unpaid' | 'canceled';
 holdingStatus: HoldingStatus;
 signedVersionId: string;
 signedPdsHash: string;
 signedSaHash: string;
 joinedAt: string;
}

export interface InvestorProfileRecord {
 id: string;
 fullName: string;
 email: string;
 phone: string;
 kycStatus: KycStatus;
 kycVerifiedAt: string | null;
 stripeCustomerId: string;
 stripeVerificationSessionId: string | null;
 nztrLicenseNumber?: string;
 createdAt: string;
 holdings: InvestorHoldingRecord[];
}

// Canonical live co-owner dataset for Mission Control desk.
// shareUnits are step units, not percentage points.

export const CANONICAL_INVESTORS: InvestorProfileRecord[] = [
 {
 id: 'inv_oliver',
 fullName: 'Oliver Laws Mather',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-01T10:00:00Z',
 stripeCustomerId: 'cus_OliverMather',
 stripeVerificationSessionId: 'vs_OliverMather',
 createdAt: '2026-02-01T09:00:00Z',
 holdings: [
 {
 id: 'hld_oliver_01',
 userId: 'inv_oliver',
 horseSlug: 'prudentia',
 horseName: 'Prudentia',
 stakePercentage: 2.50,
 shareUnits: 10, // 2.5% / 0.25% step
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_oliver_prudentia',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '07474ad7a97ab09809798ec5da99dbc0a839c7966d519a0b3106965d4df14ab4',
 signedSaHash: '3682e29b0f4e8ab3002943fb7d711b4016d1dd06cba34f84478dc9f513964e3a',
 joinedAt: '2026-02-01T10:00:00Z',
 },
 {
 id: 'hld_oliver_02',
 userId: 'inv_oliver',
 horseSlug: 'hottathanafantasy',
 horseName: 'Hottathanafantasy',
 stakePercentage: 1.75,
 shareUnits: 7, // 1.75% / 0.25% step
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_oliver_hotta',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: 'fe97d86334bc74eefa8e809e6dfd5d0544534736d5b0482d0cb1d69c60585e8e',
 signedSaHash: '3682e29b0f4e8ab3002943fb7d711b4016d1dd06cba34f84478dc9f513964e3a',
 joinedAt: '2026-02-01T10:00:00Z',
 },
 ],
 },
 {
 id: 'inv_nick',
 fullName: 'Nicholas Leak',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-05T11:00:00Z',
 stripeCustomerId: 'cus_NickLeak',
 stripeVerificationSessionId: 'vs_NickLeak',
 createdAt: '2026-02-05T10:30:00Z',
 holdings: [
 {
 id: 'hld_nick_01',
 userId: 'inv_nick',
 horseSlug: 'prudentia',
 horseName: 'Prudentia',
 stakePercentage: 1.75,
 shareUnits: 7, // 1.75% / 0.25% step
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_nick_prudentia',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '430aa2e3ac784dc443b95e7f8980e922c4d259bf15dd6a749265d069b775a332',
 signedSaHash: '6c5d3caf1a49c6ab8e375d08d838cad8ad128d77a92fa35bc662710ee3d628b8',
 joinedAt: '2026-02-05T11:00:00Z',
 },
 {
 id: 'hld_nick_02',
 userId: 'inv_nick',
 horseSlug: 'hottathanafantasy',
 horseName: 'Hottathanafantasy',
 stakePercentage: 0.25,
 shareUnits: 1, // 0.25% / 0.25% step
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_nick_hotta',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '495a53c09cf0cacee6c1112bef7a4d958dabc633023cf43f6289366bf09def7d',
 signedSaHash: '6c5d3caf1a49c6ab8e375d08d838cad8ad128d77a92fa35bc662710ee3d628b8',
 joinedAt: '2026-02-05T11:00:00Z',
 },
 ],
 },
 {
 id: 'inv_gareth',
 fullName: 'Gareth Lewis',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-10T14:00:00Z',
 stripeCustomerId: 'cus_GarethLewis',
 stripeVerificationSessionId: 'vs_GarethLewis',
 createdAt: '2026-02-10T13:00:00Z',
 holdings: [
 {
 id: 'hld_gareth_01',
 userId: 'inv_gareth',
 horseSlug: 'prudentia',
 horseName: 'Prudentia',
 stakePercentage: 0.25,
 shareUnits: 1,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_gareth_prudentia',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: 'd1b0666d34f2084ec3cc95337b5cf77f4979d253cb0c9cac98e18098848a4d2a',
 signedSaHash: '822c11b4e004986bf84153358255b49ec01dc6d8c82ee0c9078549991f97dff7',
 joinedAt: '2026-02-10T14:00:00Z',
 },
 ],
 },
 {
 id: 'inv_mark',
 fullName: 'Mark Woodside',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-12T09:30:00Z',
 stripeCustomerId: 'cus_MarkWoodside',
 stripeVerificationSessionId: 'vs_MarkWoodside',
 createdAt: '2026-02-12T09:00:00Z',
 holdings: [
 {
 id: 'hld_mark_01',
 userId: 'inv_mark',
 horseSlug: 'prudentia',
 horseName: 'Prudentia',
 stakePercentage: 0.25,
 shareUnits: 1,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_mark_prudentia',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '7d4450afca2f2b03ee30fe121a2c704f7f97ad41151b01cdf79337e287b3388c',
 signedSaHash: '1fcce42168392df8d81b198dcaaa1fc812410c4e5b492c9fdce82651b1bcad3f',
 joinedAt: '2026-02-12T09:30:00Z',
 },
 ],
 },
 {
 id: 'inv_amit',
 fullName: 'Amit Sharma',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-15T16:20:00Z',
 stripeCustomerId: 'cus_AmitSharma',
 stripeVerificationSessionId: 'vs_AmitSharma',
 createdAt: '2026-02-15T15:45:00Z',
 holdings: [
 {
 id: 'hld_amit_01',
 userId: 'inv_amit',
 horseSlug: 'prudentia',
 horseName: 'Prudentia',
 stakePercentage: 0.25,
 shareUnits: 1,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_amit_prudentia',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '842eceb16f9800312a71b484c6bd26b6256d4e4962d922f1a5531226a3f7ff68',
 signedSaHash: '9bff638868ca4a3f72daa776098111cd6d229f5ebb05f24e784aa006fca85b82',
 joinedAt: '2026-02-15T16:20:00Z',
 },
 ],
 },
 {
 id: 'inv_belal',
 fullName: 'Belal Jassoma',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-18T11:15:00Z',
 stripeCustomerId: 'cus_BelalJassoma',
 stripeVerificationSessionId: 'vs_BelalJassoma',
 createdAt: '2026-02-18T10:30:00Z',
 holdings: [
 {
 id: 'hld_belal_01',
 userId: 'inv_belal',
 horseSlug: 'hottathanafantasy',
 horseName: 'Hottathanafantasy',
 stakePercentage: 1.25,
 shareUnits: 5,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_belal_hotta',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '95b363cd2a554e4c3ca308f07fd548fc070d839eae1d8c55b0b51179376f38e4',
 signedSaHash: '92d990db9b776a32cbd69187fbb60a8488d093edd2f9d7b65fa16c8d75a83b8a',
 joinedAt: '2026-02-18T11:15:00Z',
 },
 ],
 },
 {
 id: 'inv_stuart',
 fullName: 'Stuart Bradley',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-20T13:45:00Z',
 stripeCustomerId: 'cus_StuartBradley',
 stripeVerificationSessionId: 'vs_StuartBradley',
 createdAt: '2026-02-20T12:00:00Z',
 holdings: [
 {
 id: 'hld_stuart_01',
 userId: 'inv_stuart',
 horseSlug: 'hottathanafantasy',
 horseName: 'Hottathanafantasy',
 stakePercentage: 1.00,
 shareUnits: 4,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_stuart_hotta',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '97e6b0a04ee52edfc61e57d158adee38c456aa45a568baeb2f26d3c6e16ff2be',
 signedSaHash: 'cfb53fec8b00a61da80aef0b04219bb2cc87a8657a637baa7c7936acfabbe237',
 joinedAt: '2026-02-20T13:45:00Z',
 },
 ],
 },
 {
 id: 'inv_zainab',
 fullName: 'Zainab Malik',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-22T10:00:00Z',
 stripeCustomerId: 'cus_ZainabMalik',
 stripeVerificationSessionId: 'vs_ZainabMalik',
 createdAt: '2026-02-22T09:15:00Z',
 holdings: [
 {
 id: 'hld_zainab_01',
 userId: 'inv_zainab',
 horseSlug: 'hottathanafantasy',
 horseName: 'Hottathanafantasy',
 stakePercentage: 0.25,
 shareUnits: 1,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_zainab_hotta',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: 'ac30acc3b3e445e6a56b00e9d13322bb906dad7e14c46d6e976a89db4290a6cf',
 signedSaHash: '99034ae97adfdeb9c8e013f98a555fe7b5e6665a3ae236306754722960cddd02',
 joinedAt: '2026-02-22T10:00:00Z',
 },
 ],
 },
 {
 id: 'inv_garrick',
 fullName: 'Garrick Cowley',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-24T15:30:00Z',
 stripeCustomerId: 'cus_GarrickCowley',
 stripeVerificationSessionId: 'vs_GarrickCowley',
 createdAt: '2026-02-24T14:45:00Z',
 holdings: [
 {
 id: 'hld_garrick_01',
 userId: 'inv_garrick',
 horseSlug: 'hottathanafantasy',
 horseName: 'Hottathanafantasy',
 stakePercentage: 0.25,
 shareUnits: 1,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_garrick_hotta',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '7ca9f42b58728e23d34faff30625ee75bf667164aa4768fe793aee0c05b76270',
 signedSaHash: 'f082a0794462a809809a81b500cec0e0704407f4c4e8af83ce40362e563a49e8',
 joinedAt: '2026-02-24T15:30:00Z',
 },
 ],
 },
 {
 id: 'inv_caroline',
 fullName: 'Caroline Labouchere',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2026-02-26T12:00:00Z',
 stripeCustomerId: 'cus_CarolineLabouchere',
 stripeVerificationSessionId: 'vs_CarolineLabouchere',
 createdAt: '2026-02-26T11:20:00Z',
 holdings: [
 {
 id: 'hld_caroline_01',
 userId: 'inv_caroline',
 horseSlug: 'hottathanafantasy',
 horseName: 'Hottathanafantasy',
 stakePercentage: 0.25,
 shareUnits: 1,
 monthlyKeepNzd: 0,
 floatBalanceNzd: 0,
 stripeSubscriptionId: 'sub_prepaid_caroline_hotta',
 subscriptionStatus: 'active',
 holdingStatus: 'active',
 signedVersionId: 'v1.0.0',
 signedPdsHash: '780c2d89e0c2e2abdfb22d8d88b016fc5b48577e2f84e118f5f9910469f98b14',
 signedSaHash: 'f9afe0543d7cc1cb20d084cf11e1b30cadaf08181b398fbb8cdf07d3fe57fc9f',
 joinedAt: '2026-02-26T12:00:00Z',
 },
 ],
 },
];

// Completed-track-record co-owners for First Gear (KYC-verified external investors only).
// No percentages in the build; status='completed' blocks checkout anyway.
export const FIRST_GEAR_CO_OWNERS: Pick<
 InvestorProfileRecord,
 'id' | 'fullName' | 'email' | 'phone' | 'kycStatus' | 'kycVerifiedAt'
>[] = [
 {
 id: 'inv_fg_garrick',
 fullName: 'Garrick Cowley',
 email: 'investor@example.com',
 phone: '+00 000 000000',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
 {
 id: 'inv_fg_shaun',
 fullName: 'Shaun Lynneberg',
 email: 'investor@example.com',
 phone: '',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
 {
 id: 'inv_fg_micheal',
 fullName: 'Micheal Wright',
 email: 'investor@example.com',
 phone: '',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
 {
 id: 'inv_fg_scott',
 fullName: 'Scott McLiver',
 email: 'investor@example.com',
 phone: '',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
 {
 id: 'inv_fg_shameer',
 fullName: 'Shameer Jasani',
 email: 'investor@example.com',
 phone: '',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
 {
 id: 'inv_fg_james',
 fullName: 'James Stokes',
 email: 'investor@example.com',
 phone: '',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
 {
 id: 'inv_fg_dianne',
 fullName: 'Dianne Darcy',
 email: 'investor@example.com',
 phone: '',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
 {
 id: 'inv_fg_johnmac',
 fullName: 'John MacMillan',
 email: 'investor@example.com',
 phone: '',
 kycStatus: 'verified',
 kycVerifiedAt: '2025-09-19T17:56:00Z',
 },
];

/**
 * Get all investors (returns deep cloned copies to preserve immutability)
 */
export function getInvestors(): InvestorProfileRecord[] {
 return JSON.parse(JSON.stringify(CANONICAL_INVESTORS)) as InvestorProfileRecord[];
}

/**
 * Get single investor by ID
 */
export function getInvestorById(id: string): InvestorProfileRecord | undefined {
 const inv = CANONICAL_INVESTORS.find((i) => i.id === id);
 return inv ? (JSON.parse(JSON.stringify(inv)) as InvestorProfileRecord) : undefined;
}

/**
 * Aggregates active allocated step units for a specific horse campaign.
 */
export function getCampaignAllocatedShares(horseSlug: string): number {
 let totalShares = 0;
 for (const inv of CANONICAL_INVESTORS) {
 for (const hld of inv.holdings) {
 if (hld.horseSlug === horseSlug && hld.holdingStatus === 'active') {
 totalShares += hld.shareUnits;
 }
 }
 }
 return totalShares;
}

/**
 * Returns the 10 canonical verified co-owners.
 */
export function getCoOwnerCount(): number {
 return CANONICAL_INVESTORS.length;
}

/**
 * Returns the total number of active holdings across all co-owners.
 */
export function getTotalHoldingsCount(): number {
 return CANONICAL_INVESTORS.reduce((sum, inv) => sum + inv.holdings.length, 0);
}