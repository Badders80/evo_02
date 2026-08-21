'use client';

import React, { useState } from 'react';
import {
 Scale,
} from 'lucide-react';
import {
 computeOwnerCloseSettlement,
 computeDelinquencyBurn,
 computeDelinquentDefaultSettlement,
 computeInvestorExitSettlement,
 computeGstBreakdown,
 computePrizeDistribution,
} from '@evo/legal_engine';

export function SettlementDeskView() {
 const [activeCase, setActiveCase] = useState<'case_b' | 'case_d' | 'case_e' | 'gst' | 'prize'>('case_b');

 // Input states for interactive simulation
 const [monthlyKeep, setMonthlyKeep] = useState<number>(76);
 const [daysRemaining, setDaysRemaining] = useState<number>(15);
 const [daysInMonth, setDaysInMonth] = useState<number>(30);
 const [grossPrize, setGrossPrize] = useState<number>(10000);

 // Computed results via @evo/legal_engine
 const caseBResult = computeOwnerCloseSettlement(monthlyKeep, daysRemaining, daysInMonth);
 const caseD1Result = computeDelinquencyBurn(monthlyKeep);
 const caseD2Result = computeDelinquentDefaultSettlement(monthlyKeep);
 const caseEResult = computeInvestorExitSettlement();
 const gstResult = computeGstBreakdown(monthlyKeep);
 const prizeResult = computePrizeDistribution(grossPrize);

 return (
 <div className="flex-1 overflow-y-auto bg-white p-6 text-zinc-900">
 {/* Header */}
 <div className="flex flex-col gap-1 pb-6 border-b border-zinc-200/80">
 <div className="flex items-center gap-2">
 <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400">
 <Scale className="h-3.5 w-3.5" />
 </div>
 <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Settlement & Operations SOP Desk</h1>
 <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-400">
 Read-Only Canon Engine
 </span>
 </div>
 <p className="text-xs text-zinc-500">
 Statutory settlement calculations under SA Clause 8, Operations SOP Cases B/D/E, and NZ IRD GST compliance.
 </p>
 </div>

 {/* Case Selector Tabs */}
 <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
 {[
 { id: 'case_b' as const, label: 'Case B: Owner Close (Refund)' },
 { id: 'case_d' as const, label: 'Case D: 4→3 Delinquency Default' },
 { id: 'case_e' as const, label: 'Case E: Investor Walk-Away ($0)' },
 { id: 'gst' as const, label: 'NZ GST 3/23 Breakdown' },
 { id: 'prize' as const, label: '75/25 Prize Distribution' },
 ].map((tab) => {
 const active = activeCase === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveCase(tab.id)}
 className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
 active
 ? 'bg-zinc-100 text-zinc-900 font-semibold shadow'
 : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 border border-zinc-200'
 }`}
 >
 {tab.label}
 </button>
 );
 })}
 </div>

 {/* Calculator Body */}
 <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left Col: Interactive Parameters */}
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-5 space-y-4">
 <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
 Simulation Inputs
 </h3>

 {(activeCase === 'case_b' || activeCase === 'case_d' || activeCase === 'case_e' || activeCase === 'gst') && (
 <div>
 <label className="text-[11px] text-zinc-500 block mb-1">
 Monthly Keep Rate (NZD)
 </label>
 <div className="relative">
 <span className="absolute left-3 top-2 text-xs text-zinc-500">$</span>
 <input
 type="number"
 value={monthlyKeep}
 onChange={(e) => setMonthlyKeep(Number(e.target.value))}
 className="w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 py-1.5 text-xs text-zinc-900 font-mono focus:border-zinc-300 focus:outline-none"
 />
 </div>
 <span className="text-[10px] text-zinc-500 mt-1 block">
 Float ($5×M) = ${(monthlyKeep * 5).toFixed(2)} NZD
 </span>
 </div>
 )}

 {activeCase === 'case_b' && (
 <>
 <div>
 <label className="text-[11px] text-zinc-500 block mb-1">
 Days Remaining in Current Month
 </label>
 <input
 type="number"
 value={daysRemaining}
 onChange={(e) => setDaysRemaining(Number(e.target.value))}
 className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 font-mono focus:border-zinc-300 focus:outline-none"
 />
 </div>
 <div>
 <label className="text-[11px] text-zinc-500 block mb-1">
 Total Days in Month (Day-count basis)
 </label>
 <input
 type="number"
 value={daysInMonth}
 onChange={(e) => setDaysInMonth(Number(e.target.value))}
 className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 font-mono focus:border-zinc-300 focus:outline-none"
 />
 </div>
 </>
 )}

 {activeCase === 'prize' && (
 <div>
 <label className="text-[11px] text-zinc-500 block mb-1">
 Gross Race Prize Money (NZD)
 </label>
 <div className="relative">
 <span className="absolute left-3 top-2 text-xs text-zinc-500">$</span>
 <input
 type="number"
 value={grossPrize}
 onChange={(e) => setGrossPrize(Number(e.target.value))}
 className="w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 py-1.5 text-xs text-zinc-900 font-mono focus:border-zinc-300 focus:outline-none"
 />
 </div>
 </div>
 )}
 </div>

 {/* Right Col: Output & Canonical Breakdown */}
 <div className="lg:col-span-2 space-y-4">
 {/* CASE B */}
 {activeCase === 'case_b' && (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-5 space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
 <div>
 <span className="text-[10px] font-mono text-blue-400 uppercase">Operations SOP §Case B</span>
 <h2 className="text-sm font-bold text-zinc-900">Owner Closes Syndicate (14-Day Notice)</h2>
 </div>
 <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-400">
 Full Deposit + Pro-Rata Refund
 </span>
 </div>

 <div className="grid grid-cols-3 gap-3 text-xs">
 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">3-Month Float Deposit</span>
 <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
 ${caseBResult.depositRefundNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">Refunded 100% in full</span>
 </div>

 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Unused Advance Keep</span>
 <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
 ${caseBResult.unusedAdvanceKeepRefundNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">
 Pro-rata ({daysRemaining}/{daysInMonth} days)
 </span>
 </div>

 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Total Refund to Investor</span>
 <div className="mt-1 font-mono text-lg font-bold text-zinc-900">
 ${caseBResult.totalRefundNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">Settled within 14 days</span>
 </div>
 </div>

 <p className="text-[11px] text-zinc-500">
 <strong>Legal Rule:</strong> When the Owner / Lessor terminates or closes a syndicate early, the investor is protected. Their entire $3\times M$ float deposit plus unused advance keep is returned in full via Stripe refund.
 </p>
 </div>
 )}

 {/* CASE D */}
 {activeCase === 'case_d' && (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-5 space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
 <div>
 <span className="text-[10px] font-mono text-amber-400 uppercase">Operations SOP §Case D</span>
 <h2 className="text-sm font-bold text-zinc-900">Delinquency Default (The 4 → 3 Rule)</h2>
 </div>
 <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-400">
 Two-Phase Forfeiture
 </span>
 </div>

 <div className="grid grid-cols-2 gap-4 text-xs">
 {/* Phase 1 */}
 <div className="rounded bg-white p-3.5 border border-zinc-200">
 <span className="text-[10px] font-mono text-amber-400 uppercase">Phase 1: Missed Payment</span>
 <h4 className="font-semibold text-zinc-800 mt-1">Advance Keep Drawdown</h4>
 <div className="mt-2 font-mono text-lg font-bold text-amber-400">
 -${caseD1Result.burnedAdvanceKeepNzd.toFixed(2)} NZD
 </div>
 <p className="text-[10px] text-zinc-500 mt-1">
 Coverage drops from 4 to 3 months. Statutory 14-day cure notice served.
 </p>
 </div>

 {/* Phase 2 */}
 <div className="rounded bg-white p-3.5 border border-zinc-200">
 <span className="text-[10px] font-mono text-rose-400 uppercase">Phase 2: Uncured Default</span>
 <h4 className="font-semibold text-zinc-800 mt-1">Liquidated Damages Forfeiture</h4>
 <div className="mt-2 font-mono text-lg font-bold text-rose-400">
 -${caseD2Result.forfeitedDepositNzd.toFixed(2)} NZD
 </div>
 <p className="text-[10px] text-zinc-500 mt-1">
 3-month deposit forfeited to Evolution Stables. Stake repossessed & re-listed.
 </p>
 </div>
 </div>

 <p className="text-[11px] text-zinc-500">
 <strong>Legal Rule:</strong> Under SA Clause 8, failure to pay monthly keep burns the advance keep. If not cured within 14 days, the 3-month deposit is retained by Evolution Stables as liquidated damages to protect the syndicate.
 </p>
 </div>
 )}

 {/* CASE E */}
 {activeCase === 'case_e' && (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-5 space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
 <div>
 <span className="text-[10px] font-mono text-rose-400 uppercase">Operations SOP §Case E</span>
 <h2 className="text-sm font-bold text-zinc-900">Investor Voluntary Walk-Away (Notice Before the 1st)</h2>
 </div>
 <span className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono text-rose-400">
 Zero Refund ($0.00)
 </span>
 </div>

 <div className="grid grid-cols-2 gap-4 text-xs">
 <div className="rounded bg-white p-3.5 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Cash Refund to Investor</span>
 <div className="mt-1 font-mono text-2xl font-bold text-zinc-900">
 ${caseEResult.depositRefundNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-rose-400">Strictly no cash deposit refund</span>
 </div>

 <div className="rounded bg-white p-3.5 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Deposit Treatment</span>
 <div className="mt-1 font-mono text-sm font-bold text-amber-400">
 Burned Over {caseEResult.burnedOverMonths * 30} Days
 </div>
 <span className="text-[10px] text-zinc-500">Or forfeited on immediate exit</span>
 </div>
 </div>

 <p className="text-[11px] text-zinc-500">
 <strong>Legal Rule:</strong> Under Operations SOP Case E, an investor may exit by giving notice before the 1st of the month, but their 4-month float coverage is non-refundable in cash and burns out over 120 days (or is forfeited upon immediate release).
 </p>
 </div>
 )}

 {/* GST */}
 {activeCase === 'gst' && (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-5 space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
 <div>
 <span className="text-[10px] font-mono text-emerald-400 uppercase">NZ IRD GST Compliance</span>
 <h2 className="text-sm font-bold text-zinc-900">GST-Inclusive Keep Fee Remittance (3/23)</h2>
 </div>
 <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
 Strict Identity (Zero Drift)
 </span>
 </div>

 <div className="grid grid-cols-3 gap-3 text-xs">
 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Gross Keep (GST-Inclusive)</span>
 <div className="mt-1 font-mono text-lg font-bold text-zinc-900">
 ${gstResult.grossNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">Paid by investor</span>
 </div>

 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Net Keep (20/23)</span>
 <div className="mt-1 font-mono text-lg font-bold text-blue-400">
 ${gstResult.netKeepNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">Retained for horse keep</span>
 </div>

 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">GST Remittance (3/23)</span>
 <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
 ${gstResult.gstNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">IRD tax component</span>
 </div>
 </div>

 <p className="text-[11px] text-zinc-500">
 <strong>Tax Identity:</strong> In NZ, 15% GST on a GST-inclusive price is calculated as Gross &times; 15/115 = Gross &times; 3/23. Net + GST = ${(gstResult.netKeepNzd + gstResult.gstNzd).toFixed(2)} NZD (exact match).
 </p>
 </div>
 )}

 {/* PRIZE */}
 {activeCase === 'prize' && (
 <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-5 space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
 <div>
 <span className="text-[10px] font-mono text-purple-400 uppercase">PDS §5 & Operations SOP</span>
 <h2 className="text-sm font-bold text-zinc-900">75 / 25 Prize Money Distribution</h2>
 </div>
 <span className="rounded bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono text-purple-400">
 0% Evolution Stables
 </span>
 </div>

 <div className="grid grid-cols-3 gap-3 text-xs">
 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Syndicated Investor Pool (75%)</span>
 <div className="mt-1 font-mono text-lg font-bold text-purple-400">
 ${prizeResult.investorPoolNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">Distributed pro-rata</span>
 </div>

 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Owner Expense Buffer (25%)</span>
 <div className="mt-1 font-mono text-lg font-bold text-blue-400">
 ${prizeResult.ownerExpenseBufferNzd.toFixed(2)} NZD
 </div>
 <span className="text-[10px] text-zinc-500">Lessor racing expenses</span>
 </div>

 <div className="rounded bg-white p-3 border border-zinc-200">
 <span className="text-[10px] text-zinc-500">Evolution Stables</span>
 <div className="mt-1 font-mono text-lg font-bold text-zinc-900">
 $0.00 NZD (0%)
 </div>
 <span className="text-[10px] text-zinc-500">Evolution takes zero</span>
 </div>
 </div>

 <p className="text-[11px] text-zinc-500">
 <strong>Prize Distribution Rule:</strong> Evolution Stables does not retain or take any cut of prize winnings ($0.00). 75% goes directly to syndicated investors and 25% is allocated as the Owner / Lessor Expense Buffer to cover nomination and jockey fees.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
