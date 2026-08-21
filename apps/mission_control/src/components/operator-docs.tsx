'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const DOC_SECTIONS = [
 {
 id: 'dsl_model',
 title: '01. The DSL Syndicate Model & Pricing',
 content: `
# 01. The Digitally Syndicated Lease (DSL)

A **Digitally Syndicated Lease (DSL)** is a fixed-term, fractional sub-lease interest in an underlying thoroughbred racehorse. It is a pure leasehold interest governed by New Zealand contract law and the **NZTR Bloodstock Syndication Code of Practice (Rule 22.1)**.

### Mathematical Pricing Engine
* **Formula:** \`list = cost × 1.05 × 1.03\` (round UP to whole NZD)
* **Monthly Unit Rate (M):** \`M = list × stake%\` (round UP to whole NZD)
* **5.0% Evolution Margin:** Embedded into the listed rate.
* **3.0% Payment Processing Buffer:** Absorbs Stripe transaction charges.
* **Zero Cash Calls:** Investors will never receive surprise veterinary or agistment invoices.
`,
 },
 {
 id: 'float_ledger',
 title: '02. The 5 / 4 / 3 Subscription Float Ledger',
 content: `
# 02. The Subscription Float & Billing Lifecycle

To protect horse owners from unpaid training fees, Evolution Stables operates an institutional **Subscription Float Ledger**.

### Float Breakdown ($5×M Join)
* **3 Months Security Deposit Reserve:** Held in reserve to cover the wind-down term or cure defaults.
* **2 Months Prepaid Keep:** 1 month current advance + 1 month prepaid forward.

### Monthly Billing Cycle
1. On the 1st of each month, the active month is consumed (float drops **5 ➔ 4**).
2. Stripe automatically charges **$M**, returning the balance to **5 months**.

### Default & Forfeiture Sequence (4 ➔ 3 Rule)
* If monthly keep fails to clear, the ledger burns downward from **4 towards 3 months**.
* At the **3-month deposit boundary**, the syndicate agreement terminates immediately, the deposit is forfeited to settle obligations, and the stake is repossessed.
* Unused funds are **refunded pro-rata** upon natural lease expiry or owner termination.
`,
 },
 {
 id: 'prize_money',
 title: '03. Prize Money Distribution & Carry-Forward',
 content: `
# 03. Prize Money & Distributions (75 / 25 Split)

### The Transparency Model
All prize money distributions are calculated strictly from **officially published NZTR gross stakes earnings** on *Loveracing.nz*.

* **75.0% Investor Syndicate Pool:** Distributed pro-rata based on leasehold shares directly into verified bank accounts.
* **25.0% Retained by Owner:** Absorbs all NZTR source deductions (~15–18% jockeys/trainers), nomination fees, acceptances, and race-day incidentals.

### The 2-Month Qualification Rule
An investor must have been an active, paid-up syndicate member for **at least two (2) full consecutive calendar months** prior to the race date to qualify for prize money returns.

### Distribution Schedule
* Distributions are paid **quarterly**.
* Stakes won in the final calendar month of a quarter whose cash settlement has not yet cleared are carried forward to the following quarter.
`,
 },
 {
 id: 'welfare_law',
 title: '04. Equine Welfare Supremacy & NZTR Law',
 content: `
# 04. Equine Welfare & Regulatory Governance

### Absolute Welfare Supremacy (SA Clause 6)
* The licensed **Trainer and Racing Manager hold sole, final, and absolute discretion** regarding all training regimes, race nominations, trackwork, spelling, and veterinary care.
* Neither Evolution Stables nor any syndicate investor has the authority to override veterinary or welfare decisions.

### Dispute Escalation Path (NZTR COP 22.1)
1. **Step 1:** Internal dialogue with Syndicate Manager (14 business days).
2. **Step 2:** Formal escalation to NZTR Syndication Department (\`nzracing-syndication\`) for regulatory mediation under the Rules of Racing.
3. **Manager Removal:** Syndicate members may remove Evolution Stables via a **75% Special Resolution vote** under COP Rule 22.1.
`,
 },
];

export function OperatorDocs() {
 const [selectedDocId, setSelectedDocId] = useState(DOC_SECTIONS[0].id);
 const activeSection = DOC_SECTIONS.find((s) => s.id === selectedDocId) || DOC_SECTIONS[0];

 return (
 <div className="flex flex-1 overflow-hidden bg-white text-zinc-800">
 {/* Docs Sidebar */}
 <div className="w-64 border-r border-zinc-200/80 bg-white p-3 space-y-1">
 <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
 Operator Reference Bible
 </div>
 {DOC_SECTIONS.map((section) => (
 <button
 key={section.id}
 onClick={() => setSelectedDocId(section.id)}
 className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-xs transition-colors ${
 selectedDocId === section.id
 ? 'border border-zinc-300 bg-zinc-50 font-medium text-zinc-900'
 : 'text-zinc-500 hover:bg-zinc-50/50 hover:text-zinc-800'
 }`}
 >
 <span className="truncate">{section.title}</span>
 <ChevronRight className="h-3 w-3 text-zinc-600" />
 </button>
 ))}
 </div>

 {/* Docs Main Content */}
 <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
 <div className="prose prose-invert prose-zinc prose-sm">
 <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700 leading-relaxed bg-transparent p-0 border-none">
 {activeSection.content}
 </pre>
 </div>
 </div>
 </div>
 );
}
