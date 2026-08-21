'use client';

import React from 'react';
import {
 X,
 ShieldCheck,
 CheckCircle2,
 FileText,
 Copy,
 Layers,
 Lock,
} from 'lucide-react';
import { InvestorProfileRecord } from '../lib/investor-registry';

interface InvestorDetailDrawerProps {
 investor: InvestorProfileRecord;
 onClose: () => void;
}

export function InvestorDetailDrawer({ investor, onClose }: InvestorDetailDrawerProps) {
 const copyToClipboard = (text: string) => {
 navigator.clipboard.writeText(text);
 };

 return (
 <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
 <div className="flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-white p-6 text-zinc-900 shadow-2xl overflow-y-auto">
 {/* Header */}
 <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
 <div>
 <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Investor Profile</span>
 <h2 className="text-lg font-bold text-zinc-900">{investor.fullName}</h2>
 </div>
 <button
 onClick={onClose}
 className="rounded-md border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
 >
 <X className="h-4 w-4" />
 </button>
 </div>

 {/* Profile Meta */}
 <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
 <div className="rounded border border-zinc-200/80 bg-zinc-50/40 p-3">
 <span className="text-[10px] uppercase text-zinc-500">Email Address</span>
 <div className="mt-1 font-mono text-zinc-800">{investor.email}</div>
 </div>
 <div className="rounded border border-zinc-200/80 bg-zinc-50/40 p-3">
 <span className="text-[10px] uppercase text-zinc-500">Phone Number</span>
 <div className="mt-1 font-mono text-zinc-800">{investor.phone}</div>
 </div>
 <div className="rounded border border-zinc-200/80 bg-zinc-50/40 p-3">
 <span className="text-[10px] uppercase text-zinc-500">Stripe Customer ID</span>
 <div className="mt-1 font-mono text-zinc-800 flex items-center justify-between">
 <span>{investor.stripeCustomerId}</span>
 <button
 onClick={() => copyToClipboard(investor.stripeCustomerId)}
 className="text-zinc-500 hover:text-zinc-700"
 >
 <Copy className="h-3 w-3" />
 </button>
 </div>
 </div>
 <div className="rounded border border-zinc-200/80 bg-zinc-50/40 p-3">
 <span className="text-[10px] uppercase text-zinc-500">Account Created</span>
 <div className="mt-1 font-mono text-zinc-800">
 {new Date(investor.createdAt).toLocaleDateString('en-NZ', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 })}
 </div>
 </div>
 </div>

 {/* KYC Compliance Section */}
 <div className="mt-6 rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <ShieldCheck className="h-4 w-4 text-emerald-400" />
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
 Stripe Identity & KYC Verification
 </h3>
 </div>
 {investor.kycStatus === 'verified' && (
 <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
 <CheckCircle2 className="h-3 w-3" />
 Verified
 </span>
 )}
 </div>

 <div className="mt-3 space-y-2 text-xs">
 <div className="flex justify-between py-1 border-b border-zinc-200/50">
 <span className="text-zinc-500">Verification Session:</span>
 <span className="font-mono text-zinc-700">
 {investor.stripeVerificationSessionId || 'N/A'}
 </span>
 </div>
 <div className="flex justify-between py-1 border-b border-zinc-200/50">
 <span className="text-zinc-500">Verified Timestamp:</span>
 <span className="font-mono text-zinc-700">
 {investor.kycVerifiedAt
 ? new Date(investor.kycVerifiedAt).toLocaleString('en-NZ')
 : 'Pending'}
 </span>
 </div>
 {investor.nztrLicenseNumber && (
 <div className="flex justify-between py-1 border-b border-zinc-200/50">
 <span className="text-zinc-500">NZTR Licensed Owner Card:</span>
 <span className="font-mono text-emerald-400 font-semibold">{investor.nztrLicenseNumber}</span>
 </div>
 )}
 </div>

 {/* Privacy Notice */}
 <div className="mt-3 flex items-start gap-2 rounded bg-white/60 p-2.5 text-[11px] text-zinc-500 border border-zinc-200">
 <Lock className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
 <span>
 <strong>Privacy-by-Design:</strong> Zero raw passport or ID images are stored on our servers. Biometrics and documents are held securely inside Stripe Identity&apos;s vault.
 </span>
 </div>
 </div>

 {/* Active Holdings & Signed Contracts */}
 <div className="mt-6 flex-1">
 <div className="flex items-center gap-2 mb-3">
 <Layers className="h-4 w-4 text-purple-400" />
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
 Active Holdings & Signed Contracts ({investor.holdings.length})
 </h3>
 </div>

 {investor.holdings.length === 0 ? (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/30 p-6 text-center text-xs text-zinc-500">
 No active syndication holdings recorded for this investor.
 </div>
 ) : (
 <div className="space-y-4">
 {investor.holdings.map((hld) => (
 <div key={hld.id} className="rounded-lg border border-zinc-200/80 bg-zinc-50/30 p-4">
 <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-zinc-900">{hld.horseName}</span>
 <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[10px] font-mono text-purple-400">
 {hld.stakePercentage}% ({hld.shareUnits} {hld.shareUnits === 1 ? 'unit' : 'units'})
 </span>
 </div>
 <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 capitalize">
 {hld.subscriptionStatus}
 </span>
 </div>

 <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
 <div className="flex flex-col">
 <span className="text-[10px] text-zinc-500">Monthly Keep Rate</span>
 <span className="font-mono font-medium text-zinc-800">${hld.monthlyKeepNzd}.00 NZD/mo</span>
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] text-zinc-500">Float Reserve ($5×M)</span>
 <span className="font-mono font-medium text-zinc-800">${hld.floatBalanceNzd}.00 NZD</span>
 </div>
 </div>

 {/* Signed Legal Documents Binding */}
 <div className="mt-3 rounded bg-white/80 p-2.5 text-[11px] border border-zinc-200">
 <div className="flex items-center justify-between mb-1.5">
 <div className="flex items-center gap-1.5 font-medium text-zinc-700">
 <FileText className="h-3 w-3 text-zinc-500" />
 <span>Signed Legal Contract Release ({hld.signedVersionId})</span>
 </div>
 <span className="text-[10px] font-mono text-zinc-500">
 Joined {new Date(hld.joinedAt).toLocaleDateString('en-NZ')}
 </span>
 </div>

 <div className="space-y-1 font-mono text-[10px]">
 <div className="flex items-center justify-between text-zinc-500">
 <span className="text-zinc-500">PDS SHA-256:</span>
 <span className="truncate max-w-[240px] text-zinc-700">{hld.signedPdsHash}</span>
 <button
 onClick={() => copyToClipboard(hld.signedPdsHash)}
 className="text-zinc-500 hover:text-zinc-700 ml-1"
 >
 <Copy className="h-2.5 w-2.5" />
 </button>
 </div>
 <div className="flex items-center justify-between text-zinc-500">
 <span className="text-zinc-500">SA SHA-256:</span>
 <span className="truncate max-w-[240px] text-zinc-700">{hld.signedSaHash}</span>
 <button
 onClick={() => copyToClipboard(hld.signedSaHash)}
 className="text-zinc-500 hover:text-zinc-700 ml-1"
 >
 <Copy className="h-2.5 w-2.5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
