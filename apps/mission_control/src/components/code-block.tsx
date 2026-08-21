'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CodeSnippet {
 id: string;
 label: string;
 language?: string;
 code: string;
 icon?: React.ReactNode;
}

interface CodeBlockProps {
 snippets: CodeSnippet[];
 className?: string;
}

export function CodeBlock({ snippets, className = '' }: CodeBlockProps) {
 const [activeTab, setActiveTab] = useState(snippets[0]?.id || '');
 const [copied, setCopied] = useState(false);

 const currentSnippet = snippets.find((s) => s.id === activeTab) || snippets[0];

 const handleCopy = async () => {
 if (!currentSnippet) return;
 await navigator.clipboard.writeText(currentSnippet.code);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 if (!snippets.length) return null;

 return (
 <div
 className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0d12] text-white/90 shadow-2xl ${className}`}
 >
 {/* Header Tabs & Copy */}
 <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5 bg-white/[0.02]">
 <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
 {snippets.map((snippet) => (
 <button
 key={snippet.id}
 onClick={() => setActiveTab(snippet.id)}
 className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
 activeTab === snippet.id
 ? 'bg-white/10 text-white shadow-sm'
 : 'text-white/40 hover:text-white/80'
 }`}
 >
 {snippet.icon}
 <span>{snippet.label}</span>
 </button>
 ))}
 </div>

 <button
 onClick={handleCopy}
 aria-label="Copy code"
 className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
 >
 {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
 </button>
 </div>

 {/* Code Body */}
 <div className="p-4 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto minimal-scrollbar">
 <pre className="text-white/85">
 <code>{currentSnippet.code}</code>
 </pre>
 </div>
 </div>
 );
}
