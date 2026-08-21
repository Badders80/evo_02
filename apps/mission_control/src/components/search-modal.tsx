'use client';

import React, { useEffect, useState } from 'react';
import { Search, ArrowUpRight, FileText, Layers, ShieldCheck, Terminal } from 'lucide-react';
import type { NavSection, NavSubItem } from './sidebar-nav';

interface SearchModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSelectResult: (section: NavSection, subItem: NavSubItem, horseSlug?: string) => void;
}

interface SearchItem {
 id: string;
 title: string;
 category: string;
 icon: 'horse' | 'doc' | 'ops' | 'legal';
 section: NavSection;
 subItem: NavSubItem;
 horseSlug?: string;
 badge?: string;
}

const SEARCH_ITEMS: SearchItem[] = [
 {
 id: 'h-nellie',
 title: 'Lady Ketchikan (Nellie) — 3YO Filly',
 category: 'Our Stable · Horses',
 icon: 'horse',
 section: 'stable',
 subItem: 'horse',
 horseSlug: 'nellie',
 badge: 'Listed',
 },
 {
 id: 'h-tml',
 title: 'Turn Me Loose x Yearn 2023 (Mulan) — 2YO Filly',
 category: 'Our Stable · Horses',
 icon: 'horse',
 section: 'stable',
 subItem: 'horse',
 horseSlug: 'tml-x-yearn',
 badge: 'Coming Soon',
 },
 {
 id: 'h-fg',
 title: 'First Gear — 4YO Gelding',
 category: 'Our Stable · Horses',
 icon: 'horse',
 section: 'stable',
 subItem: 'horse',
 horseSlug: 'first-gear',
 badge: 'Completed',
 },
 {
 id: 'v-dsl',
 title: 'DSL Engine & Legal Studio',
 category: 'Legal Engine',
 icon: 'legal',
 section: 'stable',
 subItem: 'dsl',
 badge: 'Deterministic',
 },
 {
 id: 'v-captable',
 title: 'Cap Table & Unit Registry',
 category: 'Investors & Desk',
 icon: 'ops',
 section: 'investors',
 subItem: 'cap_table',
 },
 {
 id: 'v-settlement',
 title: 'Settlement Desk & KYC Verification',
 category: 'Investors & Desk',
 icon: 'ops',
 section: 'investors',
 subItem: 'settlements',
 badge: 'Active Desk',
 },
 {
 id: 'v-ops',
 title: 'Operations Dashboard & Sync Relay',
 category: 'Operations',
 icon: 'ops',
 section: 'ops',
 subItem: 'ops_overview',
 },
 {
 id: 'v-trainers',
 title: 'Licensed Trainers Directory (Barbara K., Stephen Gray)',
 category: 'Our Stable',
 icon: 'horse',
 section: 'stable',
 subItem: 'trainer',
 },
 {
 id: 'd-float',
 title: 'Operator Doc: Join Float Reserve & Keep Buffer Rules',
 category: 'Operator Docs',
 icon: 'doc',
 section: 'docs',
 subItem: 'doc_float',
 },
 {
 id: 'd-prize',
 title: 'Operator Doc: Prize Money Distribution Waterfall',
 category: 'Operator Docs',
 icon: 'doc',
 section: 'docs',
 subItem: 'doc_prize',
 },
 {
 id: 'd-welfare',
 title: 'Operator Doc: NZ Equine Welfare Standards & Retirement Trust',
 category: 'Operator Docs',
 icon: 'doc',
 section: 'docs',
 subItem: 'doc_welfare',
 },
];

export function SearchModal({ isOpen, onClose, onSelectResult }: SearchModalProps) {
 const [query, setQuery] = useState('');

 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
 e.preventDefault();
 if (isOpen) {
 onClose();
 }
 }
 if (e.key === 'Escape' && isOpen) {
 onClose();
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isOpen, onClose]);

 if (!isOpen) return null;

 const filtered = query.trim()
 ? SEARCH_ITEMS.filter(
 (item) =>
 item.title.toLowerCase().includes(query.toLowerCase()) ||
 item.category.toLowerCase().includes(query.toLowerCase())
 )
 : SEARCH_ITEMS;

 const renderIcon = (type: SearchItem['icon']) => {
 switch (type) {
 case 'horse':
 return <Layers className="h-4 w-4 text-amber-500" />;
 case 'legal':
 return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
 case 'doc':
 return <FileText className="h-4 w-4 text-blue-400" />;
 case 'ops':
 default:
 return <Terminal className="h-4 w-4 text-zinc-500" />;
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
 <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-[#0c0d12] shadow-2xl overflow-hidden z-10 text-zinc-800">
 <div className="flex items-center border-b border-zinc-200/80 px-4 py-3.5 bg-white/60">
 <Search className="h-4 w-4 text-zinc-500 mr-3 shrink-0" />
 <input
 type="text"
 placeholder="Search horses, syndicates, legal rules, desk... (ESC to close)"
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 autoFocus
 className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none font-sans"
 />
 <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-50 rounded border border-zinc-200">
 ESC
 </kbd>
 </div>

 <div className="max-h-96 overflow-y-auto p-2 minimal-scrollbar divide-y divide-zinc-900/60">
 {filtered.length === 0 ? (
 <div className="p-8 text-center text-sm text-zinc-500">
 No matching records found for &ldquo;{query}&rdquo;
 </div>
 ) : (
 filtered.map((item) => (
 <button
 key={item.id}
 onClick={() => {
 onSelectResult(item.section, item.subItem, item.horseSlug);
 onClose();
 }}
 className="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm hover:bg-zinc-50/80 transition-colors"
 >
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 shrink-0">
 {renderIcon(item.icon)}
 </div>
 <div className="min-w-0">
 <div className="font-medium text-zinc-800 group-hover:text-white truncate">
 {item.title}
 </div>
 <div className="text-xs text-zinc-500">{item.category}</div>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 ml-3">
 {item.badge && (
 <span className="rounded-full border border-zinc-300/60 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-500">
 {item.badge}
 </span>
 )}
 <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
 </div>
 </button>
 ))
 )}
 </div>

 <div className="flex items-center justify-between border-t border-zinc-200/80 px-4 py-2 bg-white/80 text-[11px] text-zinc-500 font-mono">
 <span>Mission Control Global Palette</span>
 <span>Press ↵ to navigate</span>
 </div>
 </div>
 </div>
 );
}
