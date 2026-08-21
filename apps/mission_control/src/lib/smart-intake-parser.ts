/**
 * Smart Intake Parser for Mission Control.
 * Extracts:
 * - Owner / Lessor (matches against Registered Owners)
 * - Licensed Trainer & Training Facility (matches against Registered Trainers)
 * - Wholesale Cost, Stake %, Float Structure, and Close Style
 * from unstructured text dumps (e.g., trainer emails, auction catalog notes, NZTR registrations).
 */

import { computeDslPricing } from '@evo/legal_engine';
import { lookupHorse, type HorseLookupRecord } from './horse-lookup';

export interface RegisteredOwnerEntity {
 id: string;
 name: string;
 contactPerson: string;
 aliases: string[];
}

export interface RegisteredTrainerEntity {
 id: string;
 name: string;
 location: string;
 managerEntity: string;
 aliases: string[];
}

export const REGISTERED_OWNERS: RegisteredOwnerEntity[] = [
 {
 id: 'bax-bloodstock',
 name: 'B.A.X Bloodstock',
 contactPerson: 'Kylie Bax',
 aliases: ['bax', 'kylie bax', 'bax bloodstock', 'b.a.x', 'bloodstock achieving xcellence'],
 },
 {
 id: 'stephen-gray-racing',
 name: 'Stephen Gray Racing',
 contactPerson: 'Stephen Gray',
 aliases: ['stephen gray racing', 'stephen gray', 'copper belt lodge', 'copper belt'],
 },
];

export const REGISTERED_TRAINERS: RegisteredTrainerEntity[] = [
 {
 id: 'barbara-kennedy',
 name: 'Barbara Kennedy',
 location: 'Byerley Park, Karaka, NZ',
 managerEntity: 'Barbara Kennedy Racing',
 aliases: ['kennedy', 'barbara kennedy', 'barb kennedy', 'byerley park', 'byerley'],
 },
 {
 id: 'lance-osullivan-andrew-scott',
 name: "Lance O'Sullivan & Andrew Scott",
 location: 'Matamata, NZ',
 managerEntity: 'Wexford Stables',
 aliases: ['lance', 'o\'sullivan', 'andrew scott', 'wexford', 'wexford stables'],
 },
 {
   id: 'stephen-gray',
   name: 'Stephen Gray Racing',
   location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
   managerEntity: 'Stephen Gray Racing',
   aliases: ['stephen gray racing', 'stephen gray', 'copper belt lodge', 'copper belt', 'palmerston north'],
 },
];

export interface ExtractedIntakeData {
 rawText: string;
 horse?: HorseLookupRecord | null;
 matchedOwner?: RegisteredOwnerEntity | null;
 matchedTrainer?: RegisteredTrainerEntity | null;
 costMonthlyNzd?: number;
 monthlyKeepUnitNzd?: number;
 joinFloatUnitNzd?: number;
 totalHorsePercentage?: number;
 closeStyle?: 'fourteen_day' | 'three_x_remaining';
 paymentModel?: 'subscription_float' | 'upfront';
 confidenceNotes: string[];
}

/**
 * Parses freeform natural language text and extracts structured DSL context parameters.
 */
export function parseSmartContentDump(text: string): ExtractedIntakeData {
 const result: ExtractedIntakeData = {
 rawText: text,
 confidenceNotes: [],
 };

 if (!text || !text.trim()) return result;
 const lower = text.toLowerCase();

 // 1. Try to find horse reference (via microchip, loveracing url, or name)
 const horseMatch = lookupHorse(text);
 if (horseMatch) {
 result.horse = horseMatch;
 result.confidenceNotes.push(`Identified horse: ${horseMatch.legalName} (${horseMatch.barnName})`);
 }

 // 2. Match Owner
 for (const owner of REGISTERED_OWNERS) {
 const found = owner.aliases.some((alias) => {
 const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
 return regex.test(text);
 });
 if (found) {
 result.matchedOwner = owner;
 result.confidenceNotes.push(`Matched Owner / Lessor: ${owner.name} (${owner.contactPerson})`);
 break;
 }
 }

 // If no owner matched from text, check if horse had a suggested owner
 if (!result.matchedOwner && horseMatch?.suggestedOwner) {
 const owner = REGISTERED_OWNERS.find((o) => o.name.toLowerCase() === horseMatch.suggestedOwner?.toLowerCase());
 if (owner) {
 result.matchedOwner = owner;
 result.confidenceNotes.push(`Assigned default Owner for ${horseMatch.legalName}: ${owner.name}`);
 }
 }

 // 3. Match Trainer
 for (const trainer of REGISTERED_TRAINERS) {
 const found = trainer.aliases.some((alias) => {
 const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
 return regex.test(text);
 });
 if (found) {
 result.matchedTrainer = trainer;
 result.confidenceNotes.push(`Matched Licensed Trainer: ${trainer.name} (${trainer.location})`);
 break;
 }
 }

 // If no trainer matched from text, check if horse had a suggested trainer
 if (!result.matchedTrainer && horseMatch?.suggestedTrainer) {
 const trainer = REGISTERED_TRAINERS.find((t) => t.name.toLowerCase() === horseMatch.suggestedTrainer?.name.toLowerCase());
 if (trainer) {
 result.matchedTrainer = trainer;
 result.confidenceNotes.push(`Assigned default Trainer for ${horseMatch.legalName}: ${trainer.name}`);
 }
 }

 // 4. Extract Wholesale / Monthly Cost
 // Matches "$6,900/mo", "wholesale cost is $6900", "wholesale keep is $6,900"
 const prefixCostRegex = /(?:wholesale\s+(?:lease\s+and\s+)?(?:keep\s+)?cost\s+(?:is\s+)?|wholesale\s+keep\s+is\s+)\$?(\d{1,3}(?:,\d{3})*|\d+)/i;
 const suffixCostRegex = /\$(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?\s*(?:\/|\s*(?:per|\/)?\s*(?:mo|month|pm|keep|wholesale))/i;

 const costMatch = text.match(prefixCostRegex) || text.match(suffixCostRegex);
 if (costMatch && costMatch[1]) {
 const parsedVal = parseFloat(costMatch[1].replace(/,/g, ''));
 if (parsedVal >= 1000) {
 // Full horse wholesale monthly cost
 const pricing = computeDslPricing(parsedVal, 1.0);
 result.costMonthlyNzd = pricing.costMonthlyNzd;
 result.monthlyKeepUnitNzd = pricing.monthlyKeepUnitNzd;
 result.joinFloatUnitNzd = pricing.joinFloatUnitNzd;
 result.confidenceNotes.push(`Extracted wholesale cost: $${parsedVal.toLocaleString()}/mo ($M = $${pricing.monthlyKeepUnitNzd}, Float = $${pricing.joinFloatUnitNzd})`);
 } else if (parsedVal > 0) {
 // Unit keep cost M specified directly
 result.monthlyKeepUnitNzd = parsedVal;
 result.joinFloatUnitNzd = 5 * parsedVal;
 result.costMonthlyNzd = Math.round((parsedVal / (1.05 * 1.03)) * 100);
 result.confidenceNotes.push(`Extracted unit keep rate M: $${parsedVal}/mo (Join Float = $${5 * parsedVal})`);
 }
 }

 // 5. Extract Stake Percentage (require explicit stake/share/syndicate/offering keyword)
 const stakeRegex = /(?:offering(?:\s+(?:a|an))?|stake\s+of|syndicating|share\s+of)\s+(\d+(?:\.\d+)?)\s*(?:%|percent)\b|\b(\d+(?:\.\d+)?)\s*(?:%|percent)\s+(?:stake|syndicat\w*|lease|offering|share)\b/i;
 const stakeMatch = text.match(stakeRegex);
 if (stakeMatch) {
 const pctStr = stakeMatch[1] || stakeMatch[2];
 if (pctStr) {
 const pct = parseFloat(pctStr);
 if (pct > 0 && pct <= 100) {
 result.totalHorsePercentage = pct;
 result.confidenceNotes.push(`Extracted syndicated stake: ${pct}%`);
 }
 }
 }

 // 6. Close Style detection
 if (lower.includes('3x') || lower.includes('3×') || lower.includes('buyout')) {
 result.closeStyle = 'three_x_remaining';
 result.confidenceNotes.push('Detected Close Style: 3× Buyout (Case B1)');
 } else if (lower.includes('14-day') || lower.includes('14 day') || lower.includes('notice')) {
 result.closeStyle = 'fourteen_day';
 result.confidenceNotes.push('Detected Close Style: 14-Day Notice (Case B)');
 }

 // 7. Payment Model detection
 if (lower.includes('one-time') || lower.includes('one time') || lower.includes('upfront')) {
 result.paymentModel = 'upfront';
 result.confidenceNotes.push('Detected Payment Model: One-Time Upfront');
 } else if (lower.includes('float') || lower.includes('subscription') || lower.includes('5xm')) {
 result.paymentModel = 'subscription_float';
 result.confidenceNotes.push('Detected Payment Model: $5×M Subscription Float');
 }

 return result;
}
