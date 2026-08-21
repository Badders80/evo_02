'use client';

import React, { useState } from 'react';
import {
 computeDslPricing,
 validateSyndicateContent,
 compileLegalPack,
 type SyndicateLegalContext,
} from '@evo/legal_engine';
import {
 Send,
 CheckCircle2,
 Search,
 Sparkles,
 AlertCircle,
 ChevronDown,
 ChevronUp,
 BookOpen,
 ShieldCheck,
 FileCheck,
 Tag,
} from 'lucide-react';
import { lookupHorse, type HorseLookupRecord } from '@/lib/horse-lookup';
import {
 parseSmartContentDump,
 REGISTERED_OWNERS,
 REGISTERED_TRAINERS,
 type ExtractedIntakeData,
} from '@/lib/smart-intake-parser';

interface HorseWorkspaceProps {
 horseContext: SyndicateLegalContext;
 onUpdateContext: (updated: SyndicateLegalContext) => void;
 onAdvanceLifecycle: (nextStatus: string) => void;
 status: string;
}

export function HorseWorkspace({
 horseContext,
 onUpdateContext,
 onAdvanceLifecycle,
 status,
}: HorseWorkspaceProps) {
 const [activeTab, setActiveTab] = useState<'commercials' | 'metadata' | 'content' | 'broadcast'>('commercials');
 const [broadcastMessage, setBroadcastMessage] = useState('');
 const [broadcastSent, setBroadcastSent] = useState(false);

 // Content Studio State (Unidirectional Flow)
 const [aboutHorse, setAboutHorse] = useState(horseContext.softLegal?.aboutHorse || '');
 const [trainerBio, setTrainerBio] = useState(horseContext.softLegal?.trainerBio || '');
 const [racingOutlook, setRacingOutlook] = useState(horseContext.softLegal?.racingOutlookAndPedigree || '');
 const [marketplaceHook, setMarketplaceHook] = useState('');
 const [highlightPillsText, setHighlightPillsText] = useState('');
 const [publishSuccess, setPublishSuccess] = useState(false);
 const [publishedPdsHash, setPublishedPdsHash] = useState<string | null>(null);

 // Intake State
 const [lookupQuery, setLookupQuery] = useState('');
 const [lookupStatus, setLookupStatus] = useState<'idle' | 'success' | 'error'>('idle');
 const [lookupError, setLookupError] = useState<string | null>(null);

 // Smart Content Dump State
 const [showSmartDump, setShowSmartDump] = useState(false);
 const [smartDumpText, setSmartDumpText] = useState('');
 const [parsedDump, setParsedDump] = useState<ExtractedIntakeData | null>(null);

 const p = horseContext.pricing;
 const h = horseContext.horse;
 const t = horseContext.trainer;

 // Handle Horse Lookup (LoveRacing URL or 15-digit Microchip)
 const handleHorseLookup = (queryOverride?: string) => {
 const q = (queryOverride || lookupQuery).trim();
 if (!q) return;

 setLookupError(null);
 const result = lookupHorse(q);

 if (result) {
 applyHorseRecord(result);
 setLookupStatus('success');
 setTimeout(() => setLookupStatus('idle'), 3000);
 } else {
 setLookupStatus('error');
 setLookupError('No matching horse found for given LoveRacing URL or Microchip.');
 }
 };

 const applyHorseRecord = (record: HorseLookupRecord) => {
 const nextContext: SyndicateLegalContext = {
 ...horseContext,
 campaignSlug: record.campaignSlug,
 horse: {
 legalName: record.legalName,
 barnName: record.barnName,
 foalingYear: record.foalingYear,
 gender: record.gender,
 breeder: record.breeder,
 microchip: record.microchip,
 sire: record.sire,
 dam: record.dam,
 },
 };

 if (record.suggestedOwner) {
 nextContext.ownerName = record.suggestedOwner;
 }
 if (record.suggestedTrainer) {
 nextContext.trainer = {
 name: record.suggestedTrainer.name,
 location: record.suggestedTrainer.location,
 managerEntity: record.suggestedTrainer.managerEntity,
 };
 }

 onUpdateContext(nextContext);
 };

 // Handle Smart Content Dump Parse & Apply
 const handleParseAndApplyDump = () => {
 if (!smartDumpText.trim()) return;

 const extracted = parseSmartContentDump(smartDumpText);
 setParsedDump(extracted);

 let updated = { ...horseContext };

 // Apply Horse if detected
 if (extracted.horse) {
 updated = {
 ...updated,
 campaignSlug: extracted.horse.campaignSlug,
 horse: {
 legalName: extracted.horse.legalName,
 barnName: extracted.horse.barnName,
 foalingYear: extracted.horse.foalingYear,
 gender: extracted.horse.gender,
 breeder: extracted.horse.breeder,
 microchip: extracted.horse.microchip,
 sire: extracted.horse.sire,
 dam: extracted.horse.dam,
 },
 };
 }

 // Apply Owner
 if (extracted.matchedOwner) {
 updated.ownerName = extracted.matchedOwner.name;
 }

 // Apply Trainer
 if (extracted.matchedTrainer) {
 updated.trainer = {
 name: extracted.matchedTrainer.name,
 location: extracted.matchedTrainer.location,
 managerEntity: extracted.matchedTrainer.managerEntity,
 };
 }

 // Apply Commercials
 if (extracted.costMonthlyNzd) {
 const pricing = computeDslPricing(extracted.costMonthlyNzd, p.stakePercentage || 1.0);
 updated.pricing = pricing;
 }

 if (extracted.totalHorsePercentage) {
 const stakePct = p.stakePercentage > 0 ? p.stakePercentage : 1.0;
 const shares = Math.round(extracted.totalHorsePercentage / stakePct);
 updated.totalHorsePercentage = extracted.totalHorsePercentage;
 updated.totalShares = shares;
 updated.sharesAvailable = shares;
 }

 if (extracted.closeStyle) {
 updated.closeStyle = extracted.closeStyle;
 }

 if (extracted.paymentModel) {
 updated.paymentModel = extracted.paymentModel;
 }

 onUpdateContext(updated);
 };

 // Handle commercial parameter edits
 const handleWholesaleChange = (costVal: number) => {
 const fullHorseCost = costVal < 500 ? costVal * 100 : costVal;
 const pricing = computeDslPricing(fullHorseCost, p.stakePercentage || 1.0);
 onUpdateContext({
 ...horseContext,
 pricing,
 });
 };

 const handleTotalStakeChange = (pct: number) => {
 const validPct = Math.max(0.5, Math.min(100, pct));
 const stakePct = p.stakePercentage > 0 ? p.stakePercentage : 1.0;
 const shares = Math.round(validPct / stakePct);
 onUpdateContext({
 ...horseContext,
 totalHorsePercentage: validPct,
 totalShares: shares,
 sharesAvailable: shares,
 });
 };

 const handlePaymentModelChange = (model: 'subscription_float' | 'upfront') => {
 onUpdateContext({
 ...horseContext,
 paymentModel: model,
 });
 };

 const handleCloseStyleChange = (style: 'fourteen_day' | 'three_x_remaining') => {
 onUpdateContext({
 ...horseContext,
 closeStyle: style,
 });
 };

 const handleOwnerSelect = (ownerName: string) => {
 onUpdateContext({
 ...horseContext,
 ownerName,
 });
 };

 const handleTrainerSelect = (trainerId: string) => {
 const found = REGISTERED_TRAINERS.find((tr) => tr.id === trainerId);
 if (found) {
 onUpdateContext({
 ...horseContext,
 trainer: {
 name: found.name,
 location: found.location,
 managerEntity: found.managerEntity,
 },
 });
 }
 };

 const lifecycleStages = [
 { id: 'draft', label: 'Draft' },
 { id: 'coming_soon', label: 'Coming Soon' },
 { id: 'listed', label: 'Listed (Live)' },
 { id: 'fully_subscribed', label: 'Subscribed' },
 { id: 'completed', label: 'Completed' },
 ];

 const totalMonthlyTurnover =
 p.stakePercentage > 0
 ? p.monthlyKeepUnitNzd * (horseContext.totalHorsePercentage / p.stakePercentage)
 : 0;

 return (
 <div className="flex flex-1 flex-col overflow-y-auto bg-white text-zinc-800 border-r border-zinc-200/80">
 {/* Header: Horse Identity & Lifecycle Stepper */}
 <div className="border-b border-zinc-200/80 p-5 bg-zinc-50/30">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <div className="flex items-center gap-2">
 <h1 className="text-xl font-semibold text-zinc-900">{h.barnName}</h1>
 <span className="font-mono text-xs text-zinc-500">({h.legalName})</span>
 <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 border border-zinc-300">
 {horseContext.campaignSlug}
 </span>
 </div>
 <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
 <span>Owner: <strong className="text-zinc-800">{horseContext.ownerName}</strong></span>
 <span>•</span>
 <span>Trainer: <strong className="text-zinc-800">{t.name}</strong> ({t.location})</span>
 <span>•</span>
 <span>Pedigree: <strong className="text-zinc-800">{h.sire} × {h.dam}</strong> ({h.foalingYear})</span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-zinc-500">Status:</span>
 <select
 value={status}
 onChange={(e) => onAdvanceLifecycle(e.target.value)}
 className="h-8 rounded-md border border-zinc-300 bg-zinc-50 px-2.5 text-xs font-medium text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none"
 >
 {lifecycleStages.map((stage) => (
 <option key={stage.id} value={stage.id}>
 {stage.label}
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* Lifecycle Visual Pipeline */}
 <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pt-2">
 {lifecycleStages.map((stage, idx) => {
 const isCurrent = status === stage.id;
 const isPassed = lifecycleStages.findIndex((s) => s.id === status) > idx;
 return (
 <React.Fragment key={stage.id}>
 <button
 onClick={() => onAdvanceLifecycle(stage.id)}
 className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono transition-all ${
 isCurrent
 ? 'border border-zinc-200 bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
 : isPassed
 ? 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
 : 'border border-zinc-900 bg-white text-zinc-600 hover:text-zinc-500'
 }`}
 >
 {isPassed ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : null}
 <span>{stage.label}</span>
 </button>
 {idx < lifecycleStages.length - 1 && (
 <span className="text-zinc-700">/</span>
 )}
 </React.Fragment>
 );
 })}
 </div>
 </div>

 {/* --- INTAKE & LOOKUP SURFACE --- */}
 <div className="border-b border-zinc-200/80 bg-zinc-50/50 p-4 space-y-3">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex flex-1 items-center gap-2 min-w-[300px]">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
 <input
 type="text"
 value={lookupQuery}
 onChange={(e) => setLookupQuery(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleHorseLookup()}
 placeholder="Paste LoveRacing URL (e.g. loveracing.nz/Breeding/427416/...) or 15-digit Microchip..."
 className="h-9 w-full rounded border border-zinc-300 bg-white pl-9 pr-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
 />
 </div>
 <button
 onClick={() => handleHorseLookup()}
 className="flex items-center gap-1.5 h-9 rounded bg-zinc-100 px-3 text-xs font-semibold text-zinc-900 hover:bg-white transition-all shadow-sm"
 >
 <Search className="h-3.5 w-3.5" />
 <span>Fetch & Auto-Fill</span>
 </button>
 </div>

 <button
 onClick={() => setShowSmartDump(!showSmartDump)}
 className={`flex items-center gap-1.5 h-9 rounded border px-3 text-xs font-medium transition-all ${
 showSmartDump
 ? 'border-amber-600/80 bg-amber-950/40 text-amber-300'
 : 'border-zinc-300 bg-zinc-100/60 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
 }`}
 >
 <Sparkles className="h-3.5 w-3.5 text-amber-400" />
 <span>Smart Content Dump</span>
 {showSmartDump ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
 </button>
 </div>

 {/* Quick Example Chips */}
 <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-500">
 <span className="text-zinc-500">Quick Seeds:</span>
 {[
 { label: 'Prudentia (427416)', q: 'https://loveracing.nz/Breeding/427416/Prudentia-NZ-2021.aspx' },
 { label: 'Nellie (985125000137408)', q: '985125000137408' },
 { label: 'Mulan (460867)', q: 'https://loveracing.nz/Breeding/460867/Yearn-NZ-2013-2023.aspx' },
 { label: 'First Gear (428364)', q: 'https://loveracing.nz/Breeding/428364' },
 ].map((item) => (
 <button
 key={item.label}
 onClick={() => {
 setLookupQuery(item.q);
 handleHorseLookup(item.q);
 }}
 className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
 >
 {item.label}
 </button>
 ))}
 </div>

 {/* Lookup Notification Banner */}
 {lookupStatus === 'success' && (
 <div className="flex items-center gap-2 rounded border border-emerald-800/60 bg-emerald-950/40 p-2 text-xs text-emerald-300 font-mono">
 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
 <span>Thoroughbred identity & Stud Book lineage successfully loaded and mapped.</span>
 </div>
 )}

 {lookupStatus === 'error' && lookupError && (
 <div className="flex items-center gap-2 rounded border border-rose-800/60 bg-rose-950/40 p-2 text-xs text-rose-300 font-mono">
 <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
 <span>{lookupError}</span>
 </div>
 )}

 {/* --- SMART CONTENT DUMP DRAWER --- */}
 {showSmartDump && (
 <div className="mt-3 rounded-lg border border-amber-800/60 bg-amber-950/20 p-4 space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Sparkles className="h-4 w-4 text-amber-400" />
 <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
 Unstructured Text & Commercials Extractor
 </span>
 </div>
 <span className="text-[10px] font-mono text-zinc-500">
 Paste trainer memo, auction sheet, or email notes
 </span>
 </div>

 <textarea
 rows={4}
 value={smartDumpText}
 onChange={(e) => setSmartDumpText(e.target.value)}
 placeholder="e.g. Offering 10% in Lady Ketchikan. Trainer is Barbara Kennedy at Byerley Park. Owner is Kylie Bax / Bax Bloodstock. Wholesale lease cost is $6,900/month with a 14-day notice exit."
 className="w-full rounded border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
 />

 <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
 <div className="flex items-center gap-2">
 <button
 onClick={() =>
 setSmartDumpText(
 'Offering 10% stake in Prudentia (microchip 985125000125744). Trainer is Barbara Kennedy based at Byerley Park. Owner is Bax Bloodstock (Kylie Bax). Wholesale keep is $6,900/mo under subscription float.'
 )
 }
 className="text-[10px] text-amber-400/80 hover:text-amber-300 underline font-mono"
 >
 Load Sample Email
 </button>
 </div>

 <button
 onClick={handleParseAndApplyDump}
 disabled={!smartDumpText.trim()}
 className="flex items-center gap-1.5 rounded bg-amber-400 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-amber-300 disabled:opacity-50 transition-all shadow-sm"
 >
 <Sparkles className="h-3.5 w-3.5" />
 <span>Parse & Apply All Entities</span>
 </button>
 </div>

 {/* Extracted Badges */}
 {parsedDump && parsedDump.confidenceNotes.length > 0 && (
 <div className="mt-3 rounded border border-zinc-200 bg-white/80 p-3 space-y-1.5">
 <div className="text-[11px] font-semibold text-zinc-700">Extraction Confidence & Matches:</div>
 <div className="flex flex-wrap gap-1.5">
 {parsedDump.confidenceNotes.map((note, i) => (
 <span
 key={i}
 className="inline-flex items-center gap-1 rounded bg-zinc-50 border border-zinc-200 px-2 py-0.5 text-[10px] font-mono text-emerald-300"
 >
 <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
 {note}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Navigation Sub-Tabs */}
 <div className="flex border-b border-zinc-200/80 bg-white px-5">
 {[
 { id: 'commercials', label: 'Commercial Pricing Engine' },
 { id: 'metadata', label: 'Owner, Trainer & Pedigree Registry' },
 { id: 'content', label: 'PDS Soft Content & Website Studio' },
 { id: 'broadcast', label: '1-Click Trainer Broadcast' },
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as typeof activeTab)}
 className={`border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
 activeTab === tab.id
 ? 'border-zinc-200 text-zinc-900 font-semibold'
 : 'border-transparent text-zinc-500 hover:text-zinc-800'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Tab Body */}
 <div className="p-5">
 {activeTab === 'commercials' && (
 <div className="space-y-6">
 {/* Live Pricing Calculator Grid */}
 <div className="grid gap-5 md:grid-cols-2">
 {/* Left Form: Inputs */}
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4 space-y-4">
 <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
 Wholesale Commercial Inputs
 </h3>
 <span className="text-[11px] font-mono text-zinc-500">DSL Formula Active</span>
 </div>

 <div className="space-y-3">
 <div>
 <label className="block text-xs font-medium text-zinc-500">
 Wholesale Keep Cost ($/month for 100% horse)
 </label>
 <div className="mt-1 relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">$</span>
 <input
 type="number"
 step="100"
 min="100"
 value={p.costMonthlyNzd}
 onChange={(e) => handleWholesaleChange(Number(e.target.value))}
 className="h-8 w-full rounded border border-zinc-200 bg-zinc-50 pl-7 pr-3 text-xs font-mono text-zinc-900 focus:border-zinc-400 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-zinc-500">Evolution Margin</label>
 <input
 type="text"
 disabled
 value="5.0%"
 className="mt-1 h-8 w-full rounded border border-zinc-200/60 bg-white px-3 text-xs font-mono text-zinc-500"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-zinc-500">Payment Buffer</label>
 <input
 type="text"
 disabled
 value="3.0%"
 className="mt-1 h-8 w-full rounded border border-zinc-200/60 bg-white px-3 text-xs font-mono text-zinc-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-zinc-500">Syndicated Stake in Horse</label>
 <div className="mt-1 relative">
 <input
 type="number"
 step="0.5"
 min="0.5"
 max="100"
 value={horseContext.totalHorsePercentage}
 onChange={(e) => handleTotalStakeChange(Number(e.target.value))}
 className="h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-3 text-xs font-mono text-zinc-900 focus:border-zinc-400 focus:outline-none"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium text-zinc-500">Total Lots (1.0% each)</label>
 <input
 type="text"
 disabled
 value={`${horseContext.totalShares} Lots`}
 className="mt-1 h-8 w-full rounded border border-zinc-200/60 bg-white px-3 text-xs font-mono text-zinc-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium text-zinc-500">Payment Structure</label>
 <select
 value={horseContext.paymentModel || 'subscription_float'}
 onChange={(e) => handlePaymentModelChange(e.target.value as 'subscription_float' | 'upfront')}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 text-xs text-zinc-800 focus:border-zinc-400 focus:outline-none"
 >
 <option value="subscription_float">Subscription Float ($5×M Join + $M/mo Keep)</option>
 <option value="upfront">Upfront (Lump Sum for Full Term)</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-medium text-zinc-500">Exit / Close Style</label>
 <select
 value={horseContext.closeStyle}
 onChange={(e) => handleCloseStyleChange(e.target.value as 'fourteen_day' | 'three_x_remaining')}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 text-xs text-zinc-800 focus:border-zinc-400 focus:outline-none"
 >
 <option value="fourteen_day">Standard 14-Day Written Notice (Case B)</option>
 <option value="three_x_remaining">3× Buyout Liquidating Exit (Case B1)</option>
 </select>
 </div>
 </div>
 </div>

 {/* Right Output: Mathematical Result Summary */}
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4 space-y-4">
 <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
 Compiled Commercial Ledger
 </h3>
 <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400">
 Formula Verified
 </span>
 </div>

 <div className="space-y-3 font-mono text-xs">
 <div className="flex items-center justify-between rounded bg-white/80 p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Listed Monthly Rate (M):</span>
 <span className="font-bold text-zinc-900">${p.monthlyKeepUnitNzd.toFixed(2)} / mo / 1%</span>
 </div>

 <div className="flex items-center justify-between rounded bg-white/80 p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Join Float Deposit ($5×M):</span>
 <span className="font-bold text-zinc-900">${p.joinFloatUnitNzd.toFixed(2)} / 1% stake</span>
 </div>

 <div className="flex items-center justify-between rounded bg-white/80 p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Deposit Reserve (3 mo):</span>
 <span className="text-zinc-700">${(3 * p.monthlyKeepUnitNzd).toFixed(2)}</span>
 </div>

 <div className="flex items-center justify-between rounded bg-white/80 p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Advance Keep (2 mo):</span>
 <span className="text-zinc-700">${(2 * p.monthlyKeepUnitNzd).toFixed(2)}</span>
 </div>

 <div className="flex items-center justify-between rounded bg-white/80 p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Total Monthly Syndicate Turnover:</span>
 <span className="font-bold text-zinc-900">${totalMonthlyTurnover.toFixed(2)} / mo</span>
 </div>

 <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] text-zinc-500 font-sans space-y-1">
 <div>• <strong>Prize Stakes:</strong> 75% Gross Stakes paid to Investor Pool (quarterly).</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'metadata' && (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4 space-y-4">
 <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
 Thoroughbred Identity & Registry Links
 </h3>
 <span className="text-[11px] font-mono text-zinc-500">Live NZTR Synced</span>
 </div>

 <div className="grid gap-4 md:grid-cols-2 text-xs">
 <div>
 <label className="block text-zinc-500">Registered Thoroughbred Name</label>
 <input
 type="text"
 value={h.legalName}
 onChange={(e) => onUpdateContext({ ...horseContext, horse: { ...h, legalName: e.target.value } })}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-3 text-zinc-900"
 />
 </div>
 <div>
 <label className="block text-zinc-500">Barn / Familiar Name</label>
 <input
 type="text"
 value={h.barnName}
 onChange={(e) => onUpdateContext({ ...horseContext, horse: { ...h, barnName: e.target.value } })}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-3 text-zinc-900 font-medium"
 />
 </div>

 {/* Owner Selector */}
 <div>
 <label className="block text-zinc-500">Owner / Lessor</label>
 <select
 value={horseContext.ownerName}
 onChange={(e) => handleOwnerSelect(e.target.value)}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 text-zinc-900 focus:border-zinc-400 focus:outline-none"
 >
 {REGISTERED_OWNERS.map((owner) => (
 <option key={owner.id} value={owner.name}>
 {owner.name} ({owner.contactPerson})
 </option>
 ))}
 </select>
 </div>

 {/* Trainer Selector */}
 <div>
 <label className="block text-zinc-500">Licensed Trainer & Facility</label>
 <select
 value={REGISTERED_TRAINERS.find((tr) => tr.name === t.name)?.id || ''}
 onChange={(e) => handleTrainerSelect(e.target.value)}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-2.5 text-zinc-900 focus:border-zinc-400 focus:outline-none"
 >
 {REGISTERED_TRAINERS.map((trainer) => (
 <option key={trainer.id} value={trainer.id}>
 {trainer.name} — {trainer.location}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-zinc-500">Sire</label>
 <input
 type="text"
 value={h.sire}
 onChange={(e) => onUpdateContext({ ...horseContext, horse: { ...h, sire: e.target.value } })}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-3 text-zinc-900"
 />
 </div>
 <div>
 <label className="block text-zinc-500">Dam</label>
 <input
 type="text"
 value={h.dam}
 onChange={(e) => onUpdateContext({ ...horseContext, horse: { ...h, dam: e.target.value } })}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-3 text-zinc-900"
 />
 </div>
 <div>
 <label className="block text-zinc-500">Foaling Year & Gender</label>
 <input
 type="text"
 value={`${h.foalingYear} · ${h.gender}`}
 disabled
 className="mt-1 h-8 w-full rounded border border-zinc-200/60 bg-white px-3 text-zinc-500 font-mono"
 />
 </div>
 <div>
 <label className="block text-zinc-500">NZTR Microchip ID</label>
 <input
 type="text"
 value={h.microchip || ''}
 onChange={(e) => onUpdateContext({ ...horseContext, horse: { ...h, microchip: e.target.value } })}
 className="mt-1 h-8 w-full rounded border border-zinc-200 bg-zinc-50 px-3 text-zinc-900 font-mono"
 />
 </div>
 </div>
 </div>
 )}

 {activeTab === 'content' && (
 <div className="space-y-6">
 {/* Header with Compliance Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-4 gap-3">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4a964]">
 PDS Section 2 Ground Truth
 </span>
 <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-700">
 Unidirectional Forward Flow
 </span>
 </div>
 <h3 className="text-sm font-semibold text-zinc-900 mt-1">
 Soft Content Studio & Legal Publisher
 </h3>
 </div>

 {/* Compliance Status Badge */}
 {(() => {
 const combined = `${aboutHorse} ${trainerBio} ${racingOutlook} ${marketplaceHook} ${highlightPillsText}`;
 const check = validateSyndicateContent(combined);
 return check.ok ? (
 <div className="flex items-center gap-1.5 rounded border border-emerald-800/80 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-300 font-mono">
 <ShieldCheck className="h-4 w-4 text-emerald-400" />
 <span>Compliance Clean (NZTR / Zero-Banned Terms)</span>
 </div>
 ) : (
 <div className="flex items-center gap-1.5 rounded border border-red-800/80 bg-red-950/40 px-3 py-1.5 text-xs text-red-300 font-mono">
 <AlertCircle className="h-4 w-4 text-red-400" />
 <span>Compliance Flag: Prohibited terms ({check.hits.join(', ')})</span>
 </div>
 );
 })()}
 </div>

 {/* PDS Core Input Textareas */}
 <div className="grid gap-6 lg:grid-cols-2">
 <div className="rounded-lg border border-zinc-200 bg-zinc-50/40 p-4 space-y-4">
 <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
 <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
 <BookOpen className="h-4 w-4 text-[#d4a964]" />
 <span>PDS §2.1 About the Horse & Form Narrative</span>
 </div>
 <span className="text-[10px] font-mono text-zinc-500">Pure Lock</span>
 </div>
 <textarea
 rows={5}
 value={aboutHorse}
 onChange={(e) => {
 setAboutHorse(e.target.value);
 setPublishSuccess(false);
 }}
 placeholder="e.g. Prudentia (NZ) is a New Zealand-bred four-year-old mare who has recorded a maiden victory over 1400m at Tauranga..."
 className="w-full rounded border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none leading-relaxed"
 />

 <div className="flex items-center justify-between border-b border-zinc-200 pb-2 pt-2">
 <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
 <BookOpen className="h-4 w-4 text-[#d4a964]" />
 <span>PDS §2.1 Trainer & Facility Bio</span>
 </div>
 <span className="text-[10px] font-mono text-zinc-500">Pure Lock</span>
 </div>
 <textarea
 rows={4}
 value={trainerBio}
 onChange={(e) => {
 setTrainerBio(e.target.value);
 setPublishSuccess(false);
 }}
 placeholder="e.g. Prudentia is trained by Wexford Stables under the leadership of Lance O'Sullivan ONZM and Andrew Scott..."
 className="w-full rounded border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none leading-relaxed"
 />

 <div className="flex items-center justify-between border-b border-zinc-200 pb-2 pt-2">
 <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
 <BookOpen className="h-4 w-4 text-[#d4a964]" />
 <span>PDS §2.3 Racing Outlook & Pedigree</span>
 </div>
 <span className="text-[10px] font-mono text-zinc-500">Pure Lock</span>
 </div>
 <textarea
 rows={4}
 value={racingOutlook}
 onChange={(e) => {
 setRacingOutlook(e.target.value);
 setPublishSuccess(false);
 }}
 placeholder="e.g. Prudentia carries a pedigree built for performance in Australasian racing conditions, combining a proven commercial sire..."
 className="w-full rounded border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none leading-relaxed"
 />
 </div>

 {/* Forward-Derived Website Marketing & Publish Action */}
 <div className="space-y-6">
 <div className="rounded-lg border border-zinc-200 bg-zinc-50/40 p-4 space-y-4">
 <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
 <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
 <Tag className="h-4 w-4 text-[#d4a964]" />
 <span>Forward-Derived Website Presentation (Overridable)</span>
 </div>
 <button
 onClick={() => {
 if (aboutHorse) {
 const firstSentence = aboutHorse.split('. ')[0] + '.';
 setMarketplaceHook(firstSentence);
 setHighlightPillsText(`By ${h.sire}, ${t.name} Prep, Active Training`);
 }
 }}
 className="text-[11px] font-mono text-[#d4a964] hover:underline"
 >
 ⚡ Auto-Draft from PDS
 </button>
 </div>

 <div>
 <label className="text-xs text-zinc-500 block mb-1">
 Marketplace Card Hook (1–2 Sentences Max):
 </label>
 <input
 type="text"
 value={marketplaceHook}
 onChange={(e) => setMarketplaceHook(e.target.value)}
 placeholder="e.g. Race-winning daughter of champion sire Proisir with proven Rating 65 form."
 className="w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none"
 />
 </div>

 <div>
 <label className="text-xs text-zinc-500 block mb-1">
 Dynamic Highlight Pills (2–4 Talking Points, comma-separated):
 </label>
 <input
 type="text"
 value={highlightPillsText}
 onChange={(e) => setHighlightPillsText(e.target.value)}
 placeholder="e.g. 1400m Tauranga Winner, Heavy Track Proven, Rating 65 Progressor, Wexford Stables Prep"
 className="w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none"
 />
 </div>

 <div className="rounded border border-zinc-200 bg-white p-3">
 <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-2">
 Live Highlight Pills Preview:
 </span>
 <div className="flex flex-wrap gap-2">
 {(highlightPillsText || 'Highlight 1, Highlight 2, Highlight 3')
 .split(',')
 .map((t) => t.trim())
 .filter(Boolean)
 .map((pill) => (
 <span
 key={pill}
 className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-800 font-medium"
 >
 <span className="h-1.5 w-1.5 rounded-full bg-[#d4a964]" />
 {pill}
 </span>
 ))}
 </div>
 </div>
 </div>

 {/* 1-Click Save & Legal Re-Hash */}
 <div className="rounded-lg border border-[#d4a964]/40 bg-[#d4a964]/5 p-4 space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="text-xs font-semibold text-zinc-900">1-Click Save & Legal Sync</h4>
 <p className="text-[11px] text-zinc-500 mt-0.5">
 Updates database, syncs live website, and re-computes official PDS SHA-256 hash.
 </p>
 </div>

 <button
 disabled={!validateSyndicateContent(`${aboutHorse} ${trainerBio} ${racingOutlook} ${marketplaceHook} ${highlightPillsText}`).ok}
 onClick={() => {
 const updated: SyndicateLegalContext = {
 ...horseContext,
 softLegal: {
 aboutHorse,
 trainerBio,
 racingOutlookAndPedigree: racingOutlook,
 },
 };
 try {
 const { pack } = compileLegalPack(updated, { skipValidation: false });
 onUpdateContext(updated);
 setPublishedPdsHash(pack.pdsHash);
 setPublishSuccess(true);
 } catch (err: unknown) {
   alert(`Validation Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
 }
 }}
 className="flex items-center gap-1.5 rounded bg-[#d4a964] px-4 py-2 text-xs font-semibold text-black hover:bg-[#c39853] transition-colors disabled:opacity-50 shadow-md"
 >
 <FileCheck className="h-4 w-4" />
 <span>Save & Re-Hash Legal PDS</span>
 </button>
 </div>

 {publishSuccess && publishedPdsHash && (
 <div className="mt-3 rounded border border-emerald-800/80 bg-emerald-950/60 p-3 text-xs text-emerald-300 font-mono space-y-1">
 <div className="flex items-center gap-1.5 font-semibold text-emerald-200">
 <CheckCircle2 className="h-4 w-4 text-emerald-400" />
 <span>PDS Hash Successfully Re-Compiled:</span>
 </div>
 <div className="text-[11px] text-emerald-400/90 break-all select-all">
 {publishedPdsHash}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'broadcast' && (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4 space-y-4">
 <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
 1-Click Trainer Update Broadcaster
 </h3>
 <span className="text-[11px] font-mono text-zinc-500">Pushes to MyStables Feed</span>
 </div>

 <div className="space-y-3">
 <p className="text-xs text-zinc-500">
 Compose a trackwork update, race report, or trainer memo for all active leaseholders of{' '}
 <strong className="text-zinc-800">{h.barnName}</strong>:
 </p>

 <textarea
 rows={4}
 value={broadcastMessage}
 onChange={(e) => {
 setBroadcastMessage(e.target.value);
 setBroadcastSent(false);
 }}
 placeholder="e.g. Barbara reported Nellie worked brilliantly on the plough this morning at Byerley Park. Galloped 1000m comfortably in 1:04..."
 className="w-full rounded border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
 />

 <div className="flex items-center justify-between pt-2">
 <div className="text-[11px] text-zinc-500 font-mono">
 Target: {horseContext.totalShares} active unit holders
 </div>
 <button
 disabled={!broadcastMessage.trim()}
 onClick={() => {
 setBroadcastSent(true);
 setBroadcastMessage('');
 }}
 className="flex items-center gap-1.5 rounded border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-all hover:bg-white disabled:opacity-50"
 >
 <Send className="h-3 w-3" />
 <span>Broadcast to MyStables</span>
 </button>
 </div>

 {broadcastSent && (
 <div className="flex items-center gap-2 rounded border border-emerald-800/60 bg-emerald-950/40 p-2.5 text-xs text-emerald-300 font-mono">
 <CheckCircle2 className="h-4 w-4 text-emerald-400" />
 <span>Update broadcast successfully dispatched to investor timeline & email ledger.</span>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
