'use client';

import React, { useState, useMemo } from 'react';
import {
 compileLegalPack,
 type SyndicateLegalContext,
} from '@evo/legal_engine';
import {
 FileText,
 Lock,
 Download,
 Copy,
 Check,
 Hash,
 ShieldCheck,
 AlertTriangle,
} from 'lucide-react';

interface DslViewProps {
 horses: Record<string, { context: SyndicateLegalContext; status: string }>;
 selectedSlug: string;
 onSelectSlug: (slug: string) => void;
 onUpdateContext: (updated: SyndicateLegalContext) => void;
}

export function DslView({
 horses,
 selectedSlug,
 onSelectSlug,
 onUpdateContext: _onUpdateContext,
}: DslViewProps) {
 const currentHorse = horses[selectedSlug] || Object.values(horses)[0];
 const context = currentHorse.context;

 const [activeDocTab, setActiveDocTab] = useState<'term_sheet' | 'pds' | 'sa'>('term_sheet');
 const [copiedHash, setCopiedHash] = useState<string | null>(null);
 const [isFrozen, setIsFrozen] = useState(false);

 // Compile dynamically
 const { pack, error } = useMemo(() => {
 try {
 const result = compileLegalPack(context);
 return { pack: result.pack, error: null };
 } catch (err: unknown) {
 return { pack: null, error: err instanceof Error ? err.message : 'Compilation error' };
 }
 }, [context]);

 const handleCopy = (text: string, id: string) => {
 navigator.clipboard.writeText(text);
 setCopiedHash(id);
 setTimeout(() => setCopiedHash(null), 2000);
 };

 const handleDownload = () => {
 if (!pack) return;
 const content =
 activeDocTab === 'term_sheet'
 ? pack.termSheetMarkdown
 : activeDocTab === 'pds'
 ? pack.pdsMarkdown
 : pack.saMarkdown;
 const filename =
 activeDocTab === 'term_sheet'
 ? `${context.campaignSlug}-term-sheet.md`
 : activeDocTab === 'pds'
 ? `${context.campaignSlug}-pds.md`
 : `${context.campaignSlug}-syndicate-agreement.md`;

 const blob = new Blob([content], { type: 'text/markdown' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 a.click();
 URL.revokeObjectURL(url);
 };

 const activeHash = useMemo(() => {
 if (!pack) return '';
 switch (activeDocTab) {
 case 'term_sheet':
 return pack.termSheetHash;
 case 'pds':
 return pack.pdsHash;
 case 'sa':
 return pack.saHash;
 }
 }, [pack, activeDocTab]);

 const getDocContent = () => {
 if (!pack) return error || 'Compiling...';
 switch (activeDocTab) {
 case 'term_sheet':
 return pack.termSheetMarkdown;
 case 'pds':
 return pack.pdsMarkdown;
 case 'sa':
 return pack.saMarkdown;
 }
 };

 return (
 <div className="flex flex-1 flex-col overflow-hidden bg-white text-zinc-800">
 {/* Header & Horse Selector */}
 <div className="flex flex-wrap items-center justify-between border-b border-zinc-200/80 bg-zinc-50/40 p-4">
 <div className="flex items-center gap-3">
 <FileText className="h-5 w-5 text-zinc-500" />
 <div>
 <h1 className="text-base font-semibold text-zinc-900">DSL Legal & Commercial Studio</h1>
 <p className="text-[11px] text-zinc-500">
 Compile, inspect, and freeze Term Sheet, PDS, and Syndicate Agreements.
 </p>
 </div>
 </div>

 {/* Horse Picker */}
 <div className="flex items-center gap-2">
 <span className="text-xs text-zinc-500">Campaign:</span>
 <select
 value={selectedSlug}
 onChange={(e) => onSelectSlug(e.target.value)}
 className="h-8 rounded border border-zinc-300 bg-zinc-50 px-3 text-xs font-medium text-zinc-900 focus:border-zinc-400 focus:outline-none"
 >
 {Object.values(horses).map((h) => (
 <option key={h.context.campaignSlug} value={h.context.campaignSlug}>
 {h.context.horse.barnName} ({h.context.totalHorsePercentage.toFixed(1)}% stake)
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* Main Workspace (Wide Split or Tabbed) */}
 <div className="flex flex-1 overflow-hidden">
 {/* Left Column: Commercial Anchors & Summary */}
 <div className="w-80 border-r border-zinc-200/80 bg-white p-4 overflow-y-auto space-y-4 font-mono text-xs">
 <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200/80 pb-2">
 Commercial Parameters
 </div>

 <div className="rounded bg-zinc-50/60 p-3 border border-zinc-200/80 space-y-2">
 <div className="flex justify-between">
 <span className="text-zinc-500">Horse:</span>
 <span className="text-zinc-800">{context.horse.barnName}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-500">Owner:</span>
 <span className="text-zinc-800">{context.ownerName}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-500">Trainer:</span>
 <span className="text-zinc-800">{context.trainer.name}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-500">Syndicated %:</span>
 <span className="text-zinc-800">{context.totalHorsePercentage.toFixed(1)}%</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-500">Wholesale Cost:</span>
 <span className="text-zinc-800">${(context.pricing.costMonthlyNzd / 100).toFixed(2)}/mo</span>
 </div>
 <div className="flex justify-between border-t border-zinc-200/60 pt-1.5 font-bold">
 <span className="text-zinc-500">Listed Rate (M):</span>
 <span className="text-zinc-900">${context.pricing.monthlyKeepUnitNzd.toFixed(2)}/mo</span>
 </div>
 <div className="flex justify-between font-bold">
 <span className="text-zinc-500">Join Float ($5×M):</span>
 <span className="text-zinc-900">${context.pricing.joinFloatUnitNzd.toFixed(2)}</span>
 </div>
 </div>

 <div className="rounded bg-zinc-50/60 p-3 border border-zinc-200/80 space-y-2">
 <div className="text-[11px] font-sans font-semibold text-zinc-700">All 3 SHA-256 Digests:</div>
 <div className="space-y-1.5 text-[10px]">
 <div>
 <span className="text-zinc-500">Term Sheet:</span>
 <span className="block text-zinc-700 truncate">{pack?.termSheetHash || '...'}</span>
 </div>
 <div>
 <span className="text-zinc-500">PDS (§1–6):</span>
 <span className="block text-zinc-700 truncate">{pack?.pdsHash || '...'}</span>
 </div>
 <div>
 <span className="text-zinc-500">Syndicate Agr:</span>
 <span className="block text-zinc-700 truncate">{pack?.saHash || '...'}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Right Canvas: Full Document Viewer */}
 <div className="flex flex-1 flex-col overflow-hidden bg-white">
 {/* Document Tabs */}
 <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-50/20 px-4 py-2">
 <div className="flex rounded border border-zinc-200 bg-zinc-50/80 p-0.5 text-xs">
 {[
 { id: 'term_sheet', label: 'Term Sheet (1-Pager)' },
 { id: 'pds', label: 'Product Disclosure Statement (PDS)' },
 { id: 'sa', label: 'Syndicate Agreement (SA)' },
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveDocTab(tab.id as typeof activeDocTab)}
 className={`rounded px-3 py-1 font-medium transition-all ${
 activeDocTab === tab.id
 ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
 : 'text-zinc-500 hover:text-zinc-800'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Action Buttons */}
 <div className="flex items-center gap-2">
 <button
 onClick={handleDownload}
 className="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-white"
 >
 <Download className="h-3 w-3" />
 <span>Export .md</span>
 </button>

 <button
 onClick={() => setIsFrozen(true)}
 disabled={isFrozen}
 className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold transition-all ${
 isFrozen
 ? 'border border-emerald-800/60 bg-emerald-950 text-emerald-300'
 : 'border border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-white'
 }`}
 >
 {isFrozen ? (
 <>
 <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
 <span>Frozen & Cryptographically Signed</span>
 </>
 ) : (
 <>
 <Lock className="h-3.5 w-3.5" />
 <span>Freeze & Sign Pack</span>
 </>
 )}
 </button>
 </div>
 </div>

 {/* Active Hash Bar */}
 <div className="flex items-center justify-between border-b border-zinc-200/80 bg-white px-4 py-1.5 text-[11px] font-mono text-zinc-500">
 <span className="flex items-center gap-1">
 <Hash className="h-3 w-3 text-zinc-500" />
 <span>Active Document Digest:</span>
 </span>
 <button
 onClick={() => handleCopy(activeHash, 'active-doc')}
 className="flex items-center gap-1 hover:text-zinc-800"
 >
 {copiedHash === 'active-doc' ? (
 <Check className="h-3 w-3 text-emerald-400" />
 ) : (
 <Copy className="h-3 w-3" />
 )}
 <span className="font-mono text-zinc-700">{activeHash}</span>
 </button>
 </div>

 {/* Document Content */}
 <div className="flex-1 overflow-y-auto p-6 bg-white">
 {error ? (
 <div className="rounded border border-red-900/60 bg-red-950/30 p-4 text-red-300 text-xs">
 <div className="flex items-center gap-1.5 font-bold">
 <AlertTriangle className="h-4 w-4" />
 <span>Compilation Error</span>
 </div>
 <p className="mt-1 font-sans">{error}</p>
 </div>
 ) : (
 <div className="max-w-3xl rounded-lg border border-zinc-200/80 bg-zinc-50/20 p-8 shadow-sm">
 <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-800 leading-relaxed bg-transparent p-0 border-none">
 {getDocContent()}
 </pre>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
