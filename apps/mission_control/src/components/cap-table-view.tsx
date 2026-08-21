'use client';

import React, { useState } from 'react';
import {
 PieChart,
 AlertTriangle,
 CheckCircle2,
} from 'lucide-react';
import { computeHorseCapTable } from '@evo/legal_engine';
import { getCampaignAllocatedShares } from '../lib/investor-registry';

interface HorseCapState {
 slug: string;
 name: string;
 totalCampaignShares: number;
 reservedShares: number;
}

const HORSES_IN_STABLE: HorseCapState[] = [
 {
 slug: 'nellie',
 name: 'Lady Ketchikan (Nellie)',
 totalCampaignShares: 5,
 reservedShares: 0,
 },
 {
 slug: 'tml-x-yearn',
 name: 'Turn Me Loose x Yearn 2023 (Mulan)',
 totalCampaignShares: 5,
 reservedShares: 0,
 },
 {
 slug: 'prudentia',
 name: 'Prudentia 2021',
 totalCampaignShares: 5,
 reservedShares: 0,
 },
 {
 slug: 'hottathanafantasy',
 name: 'Hottathanafantasy (Coco)',
 totalCampaignShares: 5,
 reservedShares: 0,
 },
 {
 slug: 'i-stole-a-manolo',
 name: 'I Stole A Manolo',
 totalCampaignShares: 5,
 reservedShares: 0,
 },
];

export function CapTableView() {
 const [activeTab, setActiveTab] = useState<string>('nellie');

 return (
 <div className="flex-1 overflow-y-auto bg-white p-6 text-zinc-900">
 {/* Header */}
 <div className="flex flex-col gap-1 pb-6 border-b border-zinc-200/80">
 <div className="flex items-center gap-2">
 <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/10 text-purple-400">
 <PieChart className="h-3.5 w-3.5" />
 </div>
 <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Cap Table & Inventory Balancer</h1>
 <span className="rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono text-purple-400">
 Integer-Unit Invariant Engine
 </span>
 </div>
 <p className="text-xs text-zinc-500">
 Strict 3-way listed-pool identity reconciliation: Allocated + Reserved + Available = Total Listed Units.
 </p>
 </div>

 {/* Horse Switcher Tabs */}
 <div className="mt-6 flex items-center gap-2 border-b border-zinc-200 pb-2">
 {HORSES_IN_STABLE.map((horse) => {
 const active = activeTab === horse.slug;
 return (
 <button
 key={horse.slug}
 onClick={() => setActiveTab(horse.slug)}
 className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
 active
 ? 'bg-zinc-100 text-zinc-900 font-semibold shadow'
 : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 border border-zinc-200'
 }`}
 >
 <span>{horse.name}</span>
 </button>
 );
 })}
 </div>

 {/* Active Horse Cap Table Details */}
 {HORSES_IN_STABLE.filter((h) => h.slug === activeTab).map((horse) => {
 const allocated = getCampaignAllocatedShares(horse.slug);
 const cap = computeHorseCapTable(horse.totalCampaignShares, allocated, horse.reservedShares);

 return (
 <div key={horse.slug} className="mt-6 space-y-6">
 {/* Invariant Status Banner */}
 {cap.isBalanced ? (
 <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
 <div className="flex items-center gap-2.5">
 <CheckCircle2 className="h-5 w-5 text-emerald-400" />
 <div>
 <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
 ✅ Listed Pool Balanced ({cap.totalCampaignShares}/{cap.totalCampaignShares} Units)
 </h3>
 <p className="text-[11px] text-emerald-300/80">
 Allocated ({cap.allocatedShares}) + Reserved ({cap.reservedShares}) + Available ({cap.availableShares}) = {cap.totalCampaignShares}% listed stake.
 </p>
 </div>
 </div>
 <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded border border-emerald-500/40">
 RECONCILED
 </span>
 </div>
 ) : (
 <div className="flex items-center justify-between rounded-lg border border-rose-500/40 bg-rose-500/10 p-4">
 <div className="flex items-center gap-2.5">
 <AlertTriangle className="h-5 w-5 text-rose-400" />
 <div>
 <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wide">
 🚨 Critical Invariant Violation
 </h3>
 <p className="text-[11px] text-rose-300/80">
 {cap.violationReason || 'Inventory breakdown does not sum to listed campaign units.'}
 </p>
 </div>
 </div>
 <span className="font-mono text-xs font-semibold text-rose-400 bg-rose-950/60 px-3 py-1 rounded border border-rose-500/40">
 CHECKOUT BLOCKED
 </span>
 </div>
 )}

 {/* Visual 3-Way Multi-Segment Progress Bar */}
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-5">
 <div className="flex items-center justify-between text-xs mb-2">
 <span className="font-semibold text-zinc-800">Listed Pool Distribution</span>
 <span className="font-mono text-zinc-500">Total Listed Units: {horse.totalCampaignShares}</span>
 </div>

 {/* Stacked Progress Bar */}
 <div className="h-6 w-full rounded-md bg-white flex overflow-hidden border border-zinc-200">
 <div
 style={{ width: `${(cap.allocatedShares / cap.totalCampaignShares) * 100}%` }}
 className="bg-purple-500 flex items-center justify-center text-[10px] font-mono font-bold text-purple-950"
 title={`Allocated to Investors: ${cap.allocatedShares}%`}
 >
 {cap.allocatedShares > 0 && `${cap.allocatedShares}%`}
 </div>
 <div
 style={{ width: `${(cap.reservedShares / cap.totalCampaignShares) * 100}%` }}
 className="bg-amber-400 flex items-center justify-center text-[10px] font-mono font-bold text-amber-950"
 title={`Reserved in Cart (15-min TTL): ${cap.reservedShares}%`}
 >
 {cap.reservedShares > 0 && `${cap.reservedShares}%`}
 </div>
 <div
 style={{ width: `${(cap.availableShares / cap.totalCampaignShares) * 100}%` }}
 className="bg-emerald-500 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-950"
 title={`Available on Marketplace: ${cap.availableShares}%`}
 >
 {cap.availableShares > 0 && `${cap.availableShares}%`}
 </div>
 </div>

 {/* Legend & Breakdown Cards */}
 <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
 <div className="rounded border border-purple-500/20 bg-purple-500/5 p-3">
 <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
 <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
 <span>Allocated Holdings</span>
 </div>
 <div className="mt-2 font-mono text-xl font-bold text-zinc-900">{cap.allocatedShares}</div>
 <span className="text-[10px] text-zinc-500">Active Syndicated Units</span>
 </div>

 <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3">
 <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
 <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
 <span>Reserved in Cart</span>
 </div>
 <div className="mt-2 font-mono text-xl font-bold text-zinc-900">{cap.reservedShares}</div>
 <span className="text-[10px] text-zinc-500">15-Min TTL Checkout Locks</span>
 </div>

 <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-3">
 <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
 <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
 <span>Available Open</span>
 </div>
 <div className="mt-2 font-mono text-xl font-bold text-zinc-900">{cap.availableShares}</div>
 <span className="text-[10px] text-zinc-500">Open on Marketplace</span>
 </div>
 </div>
 </div>

 {/* Campaign Specifications Table */}
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/30 p-4 text-xs">
 <h4 className="font-semibold text-zinc-800 mb-2">Campaign Specifications</h4>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-zinc-500">
 <div className="rounded bg-white p-2.5 border border-zinc-200">
 <span className="text-[10px] uppercase text-zinc-500">Total Listed Pool</span>
 <div className="font-mono text-zinc-800 font-medium">{horse.totalCampaignShares}% ({horse.totalCampaignShares} units)</div>
 </div>
 <div className="rounded bg-white p-2.5 border border-zinc-200">
 <span className="text-[10px] uppercase text-zinc-500">Allocated Units</span>
 <div className="font-mono text-zinc-800 font-medium">{cap.allocatedShares}</div>
 </div>
 <div className="rounded bg-white p-2.5 border border-zinc-200">
 <span className="text-[10px] uppercase text-zinc-500">Prize Money Split</span>
 <div className="font-mono text-zinc-800 font-medium">75% Investors / 25% Owner Buffer</div>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
}
