'use client';

import React from 'react';
import { Search, Terminal, BookOpen } from 'lucide-react';

interface TopNavProps {
 mode: 'ops' | 'docs';
 onModeChange: (mode: 'ops' | 'docs') => void;
 onOpenSearch: () => void;
}

export function TopNav({ mode, onModeChange, onOpenSearch }: TopNavProps) {
 return (
 <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-md transition-colors">
 {/* Left: Breadcrumbs & Brand Badge */}
 <div className="flex items-center gap-3">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100 text-zinc-900 font-mono text-xs font-bold shadow-sm">
 EV
 </div>
 <div className="flex items-center gap-1.5 text-xs text-zinc-500">
 <span className="font-semibold text-zinc-900">Evolution Stables</span>
 <span className="text-zinc-500">/</span>
 <span className="font-mono text-zinc-700">mission_control</span>
 <span className="hidden sm:inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600 border border-zinc-200">
 evo_02
 </span>
 </div>
 </div>

 {/* Center: Search Button */}
 <div className="flex max-w-md flex-1 items-center px-4">
 <button
 type="button"
 onClick={onOpenSearch}
 className="flex h-8 w-full items-center justify-between rounded-full border border-zinc-200 bg-zinc-50/70 pl-3 pr-2 text-xs text-zinc-500 hover:border-zinc-300 transition-colors"
 >
 <div className="flex items-center gap-2">
 <Search className="h-3.5 w-3.5 text-zinc-500" />
 <span>Search horses, contracts, legal rules...</span>
 </div>
 <kbd className="rounded bg-zinc-200/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
 Ctrl+K
 </kbd>
 </button>
 </div>

 {/* Right: Switcher & Status */}
 <div className="flex items-center gap-2 sm:gap-3">
 <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100/60 p-0.5">
 <button
 onClick={() => onModeChange('ops')}
 className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
 mode === 'ops'
 ? 'bg-black text-white shadow-sm'
 : 'text-zinc-500 hover:text-zinc-900'
 }`}
 >
 <Terminal className="h-3 w-3" />
 <span>Ops Console</span>
 </button>
 <button
 onClick={() => onModeChange('docs')}
 className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
 mode === 'docs'
 ? 'bg-black text-white shadow-sm'
 : 'text-zinc-500 hover:text-zinc-900'
 }`}
 >
 <BookOpen className="h-3 w-3" />
 <span>Operator Docs</span>
 </button>
 </div>

 <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-zinc-500">
 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="font-mono">Evolution-3.0</span>
 </div>
 </div>
 </header>
 );
}
