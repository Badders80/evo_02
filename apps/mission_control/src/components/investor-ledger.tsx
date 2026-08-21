'use client';

import React, { useState, useMemo } from 'react';
import {
 Users,
 ShieldCheck,
 Search,
 Filter,
 DollarSign,
 Layers,
 ChevronRight,
 AlertCircle,
 Clock,
 CheckCircle2,
 XCircle,
 Sparkles,
} from 'lucide-react';
import {
 getInvestors,
 InvestorProfileRecord,
} from '../lib/investor-registry';
import { InvestorDetailDrawer } from './investor-detail-drawer';

export function InvestorLedger() {
 const [searchQuery, setSearchQuery] = useState('');
 const [kycFilter, setKycFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
 const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfileRecord | null>(null);

 const liveInvestors = getInvestors();
 const totalLiveInvestors = liveInvestors.length;
 const verifiedLiveCount = liveInvestors.filter((i) => i.kycStatus === 'verified').length;
 const verifiedLivePercent = totalLiveInvestors > 0 ? Math.round((verifiedLiveCount / totalLiveInvestors) * 100) : 0;
 const totalFloatCents = liveInvestors.reduce((sum, inv) => {
 return sum + inv.holdings.reduce((hSum, h) => hSum + Math.round(h.floatBalanceNzd * 100), 0);
 }, 0);
 const totalLiveShareUnits = liveInvestors.reduce((sum, inv) => {
 return sum + inv.holdings.reduce((hSum, h) => hSum + h.shareUnits, 0);
 }, 0);

 const filteredLiveInvestors = useMemo(() => {
 return liveInvestors.filter((inv) => {
 const matchesSearch =
 inv.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 inv.stripeCustomerId.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesKyc = kycFilter === 'all' || inv.kycStatus === kycFilter;
 return matchesSearch && matchesKyc;
 });
 }, [liveInvestors, searchQuery, kycFilter]);

 return (
 <div className="flex-1 overflow-y-auto bg-white p-6 text-zinc-900">
 <div className="flex flex-col gap-1 pb-6 border-b border-zinc-200/80">
 <div className="flex items-center gap-2">
 <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-400">
 <Users className="h-3.5 w-3.5" />
 </div>
 <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Investor Directory & KYC Desk</h1>
 <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
 NZTR COP 22.1 Compliant
 </span>
 </div>
 <p className="text-xs text-zinc-500">
 Searchable investor registry, Stripe Identity compliance status, and active holding ledger.
 </p>
 </div>

 <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4">
 <div className="flex items-center justify-between text-xs text-zinc-500">
 <span>Total Live Investors</span>
 <Users className="h-3.5 w-3.5 text-zinc-500" />
 </div>
 <div className="mt-2 flex items-baseline gap-2">
 <span className="font-mono text-2xl font-bold text-zinc-900">{totalLiveInvestors}</span>
 <span className="text-[11px] text-zinc-500">accounts</span>
 </div>
 </div>

 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4">
 <div className="flex items-center justify-between text-xs text-zinc-500">
 <span>KYC Verified Rate</span>
 <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
 </div>
 <div className="mt-2 flex items-baseline gap-2">
 <span className="font-mono text-2xl font-bold text-emerald-400">{verifiedLivePercent}%</span>
 <span className="text-[11px] text-zinc-500">({verifiedLiveCount}/{totalLiveInvestors})</span>
 </div>
 </div>

 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4">
 <div className="flex items-center justify-between text-xs text-zinc-500">
 <span>Total Float Held</span>
 <DollarSign className="h-3.5 w-3.5 text-blue-400" />
 </div>
 <div className="mt-2 flex items-baseline gap-2">
 <span className="font-mono text-2xl font-bold text-zinc-900">
 ${(totalFloatCents / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
 </span>
 <span className="text-[11px] text-zinc-500">NZD ($5×M)</span>
 </div>
 </div>

 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4">
 <div className="flex items-center justify-between text-xs text-zinc-500">
 <span>Active Share Units</span>
 <Layers className="h-3.5 w-3.5 text-purple-400" />
 </div>
 <div className="mt-2 flex items-baseline gap-2">
 <span className="font-mono text-2xl font-bold text-zinc-900">{totalLiveShareUnits}</span>
 <span className="text-[11px] text-zinc-500">leased units</span>
 </div>
 </div>
 </div>

 <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
 <input
 type="text"
 placeholder="Search by name, email, or Stripe Customer ID..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full rounded-md border border-zinc-200 bg-zinc-50/60 pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:outline-none"
 />
 </div>

 <div className="flex items-center gap-2">
 <Filter className="h-3.5 w-3.5 text-zinc-500" />
 <span className="text-xs text-zinc-500">KYC Status:</span>
 {(['all', 'verified', 'pending', 'rejected'] as const).map((status) => (
 <button
 key={status}
 onClick={() => setKycFilter(status)}
 className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
 kycFilter === status
 ? 'bg-zinc-100 text-zinc-900 font-semibold'
 : 'bg-zinc-50 text-zinc-500 hover:text-zinc-800 border border-zinc-200'
 }`}
 >
 {status}
 </button>
 ))}
 </div>
 </div>

 <div className="mt-4 rounded-lg border border-zinc-200/80 bg-zinc-50/30 overflow-hidden">
 <table className="w-full text-left text-xs">
 <thead className="border-b border-zinc-200/80 bg-zinc-50/60 text-zinc-500 font-medium">
 <tr>
 <th className="px-4 py-3">Investor Name & Email</th>
 <th className="px-4 py-3">KYC Status</th>
 <th className="px-4 py-3">Active Holdings</th>
 <th className="px-4 py-3">Float Balance</th>
 <th className="px-4 py-3">Stripe Customer</th>
 <th className="px-4 py-3 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-800/50 text-zinc-700">
 {filteredLiveInvestors.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
 No investors found matching your search criteria.
 </td>
 </tr>
 ) : (
 filteredLiveInvestors.map((inv) => {
 const totalUnits = inv.holdings.reduce((sum, h) => sum + h.shareUnits, 0);
 const floatNzd = inv.holdings.reduce((sum, h) => sum + h.floatBalanceNzd, 0);

 return (
 <tr
 key={inv.id}
 className="hover:bg-zinc-100/30 cursor-pointer transition-colors"
 onClick={() => setSelectedInvestor(inv)}
 >
 <td className="px-4 py-3">
 <div className="flex flex-col">
 <span className="font-semibold text-zinc-900">{inv.fullName}</span>
 <span className="font-mono text-[11px] text-zinc-500">{inv.email}</span>
 </div>
 </td>
 <td className="px-4 py-3">
 {inv.kycStatus === 'verified' && (
 <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
 <CheckCircle2 className="h-3 w-3" />
 Verified
 </span>
 )}
 {inv.kycStatus === 'pending' && (
 <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
 <Clock className="h-3 w-3" />
 Pending Review
 </span>
 )}
 {inv.kycStatus === 'rejected' && (
 <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
 <XCircle className="h-3 w-3" />
 Rejected
 </span>
 )}
 {inv.kycStatus === 'unverified' && (
 <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
 <AlertCircle className="h-3 w-3" />
 Unverified
 </span>
 )}
 </td>
 <td className="px-4 py-3">
 {inv.holdings.length > 0 ? (
 <div className="flex flex-col gap-0.5">
 <span className="font-mono text-zinc-800">
 {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} ({inv.holdings.length} {inv.holdings.length === 1 ? 'horse' : 'horses'})
 </span>
 <span className="text-[10px] text-zinc-500 truncate max-w-[180px]">
 {inv.holdings.map((h) => h.horseName).join(', ')}
 </span>
 </div>
 ) : (
 <span className="text-zinc-600 italic">No holdings</span>
 )}
 </td>
 <td className="px-4 py-3">
 <span className="font-mono font-medium text-zinc-800">
 ${floatNzd.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
 </span>
 </td>
 <td className="px-4 py-3">
 <span className="font-mono text-[11px] text-zinc-500">{inv.stripeCustomerId}</span>
 </td>
 <td className="px-4 py-3 text-right">
 <button
 onClick={(e) => {
 e.stopPropagation();
 setSelectedInvestor(inv);
 }}
 className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-zinc-100/80 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-700 hover:text-zinc-900 transition-colors"
 >
 <span>Details</span>
 <ChevronRight className="h-3 w-3 text-zinc-500" />
 </button>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {selectedInvestor && (
 <InvestorDetailDrawer
 investor={selectedInvestor}
 onClose={() => setSelectedInvestor(null)}
 />
 )}
 </div>
 );
}
