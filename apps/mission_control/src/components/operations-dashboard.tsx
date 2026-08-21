'use client';

import React from 'react';
import {
 Activity,
 HardDrive,
 DollarSign,
 ArrowRight,
} from 'lucide-react';
import type { NavSubItem } from './sidebar-nav';

interface OperationsDashboardProps {
 onNavigateSubItem: (subItem: NavSubItem) => void;
}

export function OperationsDashboard({ onNavigateSubItem }: OperationsDashboardProps) {
 const opActions = [
 {
 id: 'op-1',
 title: 'Sync Recent Loveracing Trackwork & Trials',
 detail: 'Lady Ketchikan recent Byerley Park 1000m trial results ready for ingest.',
 target: 'media_vault' as const,
 },
 {
 id: 'op-2',
 title: 'Q3 2026 Distribution Ledger Review',
 detail: 'Prepare gross stakes allocation calculations for October 1 payout cadence.',
 target: 'distributions' as const,
 },
 ];

 return (
 <div className="flex-1 overflow-y-auto bg-white p-6 text-zinc-800">
 {/* Header */}
 <div className="border-b border-zinc-200/80 pb-5">
 <h1 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
 <Activity className="h-5 w-5 text-zinc-500" />
 <span>Operations Dashboard</span>
 </h1>
 <p className="mt-1 text-xs text-zinc-500">
 Cloudflare R2 media vault, Stripe webhook event ledger, and quarterly prize distribution engine.
 </p>
 </div>

 {/* Metric Cards */}
 <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
 {[
 {
 title: 'Cloudflare R2 Vault',
 value: '427 Assets',
 sub: '$0 Egress · cdn.evolutionstables.nz',
 subItem: 'media_vault' as const,
 icon: HardDrive,
 },
 {
 title: 'Quarterly Distributions',
 value: '75 / 25 Split',
 sub: 'Next: Q3 2026 (Oct 1)',
 subItem: 'distributions' as const,
 icon: DollarSign,
 },
 {
   title: 'Stripe Webhooks',
   value: '100% Idempotent',
   sub: 'Unique event constraint verified',
   subItem: 'ops_overview' as const,
   icon: Activity,
 },
 ].map((metric) => (
 <button
 key={metric.title}
 onClick={() => onNavigateSubItem(metric.subItem)}
 className="group flex flex-col justify-between rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4 text-left transition-all hover:border-zinc-300 hover:bg-zinc-50"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-zinc-500">{metric.title}</span>
 <metric.icon className="h-4 w-4 text-zinc-500" />
 </div>
 <div className="mt-3 text-2xl font-bold font-mono text-zinc-900 group-hover:text-white">
 {metric.value}
 </div>
 <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
 <span>{metric.sub}</span>
 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
 </div>
 </button>
 ))}
 </div>

 {/* Operational Actions */}
 <div className="mt-8">
 <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
 Operations Queue
 </h2>

 <div className="space-y-2">
 {opActions.map((action) => (
 <div
 key={action.id}
 className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-zinc-50/30 p-3.5"
 >
 <div>
 <h3 className="text-xs font-medium text-zinc-800">{action.title}</h3>
 <p className="mt-0.5 text-[11px] text-zinc-500">{action.detail}</p>
 </div>
 <button
 onClick={() => onNavigateSubItem(action.target)}
 className="flex items-center gap-1 rounded border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-700"
 >
 <span>View</span>
 <ArrowRight className="h-3 w-3" />
 </button>
 </div>
 ))}
 </div>
 </div>

 {/* Cloud Infrastructure Map */}
 <div className="mt-8 rounded-lg border border-zinc-200/80 bg-zinc-50/20 p-4">
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 border-b border-zinc-200/80 pb-2">
 Infrastructure Status
 </h3>
 <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs font-mono">
 <div className="flex items-center justify-between rounded bg-white p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Database SSOT:</span>
 <span className="text-emerald-400 font-bold">Supabase Evolution-3.0</span>
 </div>
 <div className="flex items-center justify-between rounded bg-white p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">CDN Storage Vault:</span>
 <span className="text-zinc-800 font-bold">Cloudflare R2 ($0 Egress)</span>
 </div>
 <div className="flex items-center justify-between rounded bg-white p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Stripe Join Mode:</span>
 <span className="text-zinc-800 font-bold">$5×M Subscription Float</span>
 </div>
 <div className="flex items-center justify-between rounded bg-white p-2.5 border border-zinc-200/80">
 <span className="text-zinc-500">Purchases Kill-Switch:</span>
 <span className="text-amber-400 font-bold">PURCHASES_ENABLED=false</span>
 </div>
 </div>
 </div>
 </div>
 );
}
