'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { SyndicateLegalContext } from '@evo/legal_engine';
import type { NavSubItem } from './sidebar-nav';

interface StableDashboardProps {
 horses: Record<string, { context: SyndicateLegalContext; status: string }>;
 onSelectHorse: (slug: string) => void;
 onNavigateSubItem: (subItem: NavSubItem) => void;
 onNewHorse: () => void;
}

const statusLabels: Record<string, string> = {
 draft: 'Draft',
 coming_soon: 'Coming Soon',
 listed: 'Listed',
 fully_subscribed: 'Subscribed',
 completed: 'Completed',
};

const statusStyles: Record<string, string> = {
 draft: 'bg-zinc-100 text-zinc-600',
 coming_soon: 'bg-blue-50 text-blue-600',
 listed: 'bg-emerald-50 text-emerald-600',
 fully_subscribed: 'bg-amber-50 text-amber-600',
 completed: 'bg-zinc-100 text-zinc-600',
};

export function StableDashboard({
 horses,
 onSelectHorse,
 onNewHorse,
}: StableDashboardProps) {
 const entries = Object.entries(horses);

 return (
 <div className="flex-1 overflow-y-auto bg-white p-6 lg:p-8 text-zinc-900 minimal-scrollbar">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200/80 pb-6 gap-4">
 <div>
 <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
 Our Stable
 </h1>
 <p className="mt-1 text-sm text-zinc-500">
 Thoroughbreds under Evolution Stables management.
 </p>
 </div>

 <button
 onClick={onNewHorse}
 className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 transition-colors shadow-sm shrink-0"
 >
 <Plus className="h-4 w-4" />
 <span>New Horse</span>
 </button>
 </div>

 <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {entries.map(([slug, { context, status }]) => (
 <button
 key={slug}
 onClick={() => onSelectHorse(slug)}
 className="text-left rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-5 transition-all hover:border-zinc-300 hover:shadow-sm"
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">
 {context.horse.legalName}
 </h3>
 <p className="text-xs text-zinc-500 mt-0.5">
 {context.horse.barnName !== context.horse.legalName && `Barn: ${context.horse.barnName}`}
 </p>
 </div>
 <span
 className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
 statusStyles[status] || statusStyles.draft
 }`}
 >
 {statusLabels[status] || status}
 </span>
 </div>

 <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
 <div className="flex justify-between">
 <span className="text-zinc-500">Trainer</span>
 <span className="font-medium text-zinc-900">{context.trainer.name}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-500">Owner</span>
 <span className="font-medium text-zinc-900">{context.ownerName}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-500">Keep / Month</span>
 <span className="font-medium text-zinc-900">
 ${context.pricing.monthlyKeepUnitNzd}.00
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-500">Stake</span>
 <span className="font-medium text-zinc-900">
 {context.totalHorsePercentage}% total · {context.pricing.stakePercentage}%/unit
 </span>
 </div>
 </div>
 </button>
 ))}
 </div>
 </div>
 );
}
