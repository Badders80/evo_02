'use client';

import React, { useState, useMemo } from 'react';
import {
 compileLegalPack,
 type SyndicateLegalContext,
 type CompiledLegalPack,
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

interface LegalStudioProps {
 horseContext: SyndicateLegalContext;
 onFreezePack?: (pack: CompiledLegalPack) => void;
}

export function LegalStudio({ horseContext, onFreezePack }: LegalStudioProps) {
 const [activeDoc, setActiveDoc] = useState<'term_sheet' | 'pds' | 'sa'>('term_sheet');
 const [copiedHash, setCopiedHash] = useState<string | null>(null);
 const [isFrozen, setIsFrozen] = useState(false);

 // Compile dynamically from context
 const { pack, error } = useMemo(() => {
 try {
 const result = compileLegalPack(horseContext);
 return { pack: result.pack, error: null };
 } catch (err: unknown) {
 return { pack: null, error: err instanceof Error ? err.message : 'Compilation error' };
 }
 }, [horseContext]);

 const handleCopy = (text: string, id: string) => {
 navigator.clipboard.writeText(text);
 setCopiedHash(id);
 setTimeout(() => setCopiedHash(null), 2000);
 };

 const handleDownload = () => {
 if (!pack) return;
 const content =
 activeDoc === 'term_sheet'
 ? pack.termSheetMarkdown
 : activeDoc === 'pds'
 ? pack.pdsMarkdown
 : pack.saMarkdown;
 const filename =
 activeDoc === 'term_sheet'
 ? `${horseContext.campaignSlug}-term-sheet.md`
 : activeDoc === 'pds'
 ? `${horseContext.campaignSlug}-pds.md`
 : `${horseContext.campaignSlug}-syndicate-agreement.md`;

 const blob = new Blob([content], { type: 'text/markdown' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 a.click();
 URL.revokeObjectURL(url);
 };

 const handleFreeze = () => {
 if (pack && onFreezePack) {
 onFreezePack(pack);
 }
 setIsFrozen(true);
 };

 const getDocContent = () => {
 if (!pack) return error || 'Compiling...';
 switch (activeDoc) {
 case 'term_sheet':
 return pack.termSheetMarkdown;
 case 'pds':
 return pack.pdsMarkdown;
 case 'sa':
 return pack.saMarkdown;
 }
 };

 const activeHash = useMemo(() => {
 if (!pack) return '';
 switch (activeDoc) {
 case 'term_sheet':
 return pack.termSheetHash;
 case 'pds':
 return pack.pdsHash;
 case 'sa':
 return pack.saHash;
 }
 }, [pack, activeDoc]);

 return (
 <div className="flex h-full w-[440px] flex-col border-l border-zinc-200/80 bg-white text-zinc-700">
 {/* Studio Header */}
 <div className="border-b border-zinc-200/80 p-3.5 bg-zinc-50/40">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700">
 <FileText className="h-3.5 w-3.5 text-zinc-500" />
 <span>DSL Legal Studio</span>
 </div>
 <span className="rounded bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
 @evo/legal_engine
 </span>
 </div>

 {/* Document Switcher Tabs */}
 <div className="mt-3 flex rounded border border-zinc-200 bg-zinc-50/80 p-0.5 text-xs">
 {[
 { id: 'term_sheet', label: 'Term Sheet (1-P)' },
 { id: 'pds', label: 'PDS (§1–§6)' },
 { id: 'sa', label: 'Syndicate Agr.' },
 ].map((doc) => (
 <button
 key={doc.id}
 onClick={() => setActiveDoc(doc.id as typeof activeDoc)}
 className={`flex-1 rounded py-1 font-medium transition-all ${
 activeDoc === doc.id
 ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
 : 'text-zinc-500 hover:text-zinc-800'
 }`}
 >
 {doc.label}
 </button>
 ))}
 </div>
 </div>

 {/* SHA-256 Hashes Bar */}
 <div className="border-b border-zinc-200/80 bg-zinc-50/20 px-3.5 py-2 text-[11px] font-mono">
 <div className="flex items-center justify-between text-zinc-500">
 <div className="flex items-center gap-1">
 <Hash className="h-3 w-3 text-zinc-500" />
 <span>SHA-256 Digest:</span>
 </div>
 <button
 onClick={() => handleCopy(activeHash, 'active')}
 className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800"
 >
 {copiedHash === 'active' ? (
 <Check className="h-3 w-3 text-emerald-400" />
 ) : (
 <Copy className="h-3 w-3" />
 )}
 <span className="text-[10px] truncate max-w-[170px] font-mono">
 {activeHash ? `${activeHash.slice(0, 12)}...${activeHash.slice(-8)}` : 'Generating...'}
 </span>
 </button>
 </div>
 </div>

 {/* Live Markdown Preview Canvas */}
 <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-700 bg-white">
 {error ? (
 <div className="rounded border border-red-900/60 bg-red-950/30 p-3 text-red-300 text-xs">
 <div className="flex items-center gap-1.5 font-bold">
 <AlertTriangle className="h-4 w-4" />
 <span>Compilation Validation Error</span>
 </div>
 <p className="mt-1 font-sans">{error}</p>
 </div>
 ) : (
 <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700 leading-normal">
 {getDocContent()}
 </pre>
 )}
 </div>

 {/* Action Footer */}
 <div className="border-t border-zinc-200/80 bg-white p-3 flex items-center justify-between gap-2">
 <button
 onClick={handleDownload}
 className="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-white"
 >
 <Download className="h-3.5 w-3.5" />
 <span>Export .md</span>
 </button>

 <button
 onClick={handleFreeze}
 disabled={isFrozen || !pack}
 className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
 isFrozen
 ? 'border border-emerald-800/60 bg-emerald-950 text-emerald-300'
 : 'border border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-white'
 }`}
 >
 {isFrozen ? (
 <>
 <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
 <span>Pack Frozen & Hashed</span>
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
 );
}
