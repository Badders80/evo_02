'use client';

import React from 'react';
import {
  Layers,
  Activity,
  BookOpen,
  Users,
} from 'lucide-react';

export type NavSection = 'stable' | 'investors' | 'ops' | 'docs';
export type NavSubItem =
 | 'stable_overview'
 | 'horse'
 | 'trainer'
 | 'owner'
 | 'dsl'
 | 'investor_directory'
 | 'kyc_desk'
 | 'cap_table'
 | 'settlements'
 | 'ops_overview'
 | 'media_vault'
 | 'distributions'
 | 'docs_overview'
 | 'doc_dsl'
 | 'doc_float'
 | 'doc_prize'
 | 'doc_welfare';

interface SidebarNavProps {
 currentSection: NavSection;
 currentSubItem: NavSubItem;
 onNavigate: (section: NavSection, subItem: NavSubItem) => void;
 horseCount: number;
 investorCount?: number;
}

export function SidebarNav({
 currentSection,
 currentSubItem,
 onNavigate,
 horseCount,
 investorCount = 4,
}: SidebarNavProps) {
 return (
 <aside className="flex h-full w-64 xl:w-72 flex-col border-r border-zinc-200/80 bg-white select-none text-zinc-900">
 <div className="flex h-14 items-center gap-3 border-b border-zinc-200/80 px-4">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100 text-zinc-900 font-mono text-xs font-bold">
 EV
 </div>
 <div className="flex flex-col">
 <span className="text-xs font-semibold tracking-tight text-zinc-900">
 Evolution Stables
 </span>
 <span className="text-[10px] font-mono text-zinc-500">Mission Control 3.0</span>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-3 space-y-6 minimal-scrollbar">
 <div className="flex flex-col gap-1">
 <button
 onClick={() => onNavigate('stable', 'stable_overview')}
 className={`flex w-full items-center justify-between px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
 currentSection === 'stable' && currentSubItem === 'stable_overview'
 ? 'text-black bg-zinc-100 font-bold'
 : 'text-zinc-500 hover:text-black'
 }`}
 >
 <div className="flex items-center gap-2">
 <Layers className="h-3.5 w-3.5 text-zinc-500" />
 <span>Our Stable</span>
 </div>
 <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600 border border-zinc-200">
 {horseCount}
 </span>
 </button>

 <div className="space-y-0.5 pl-2 ml-2 border-l border-zinc-200/80">
 {[
 { id: 'horse' as const, label: 'Horses', count: horseCount },
 { id: 'trainer' as const, label: 'Trainers', count: 3 },
 { id: 'owner' as const, label: 'Owners', count: 2 },
 { id: 'dsl' as const, label: 'DSL Studio', badge: 'New' },
 ].map((sub) => {
 const active = currentSection === 'stable' && currentSubItem === sub.id;
 return (
 <button
 key={sub.id}
 onClick={() => onNavigate('stable', sub.id)}
 className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
 active
 ? 'bg-zinc-100 font-medium text-black'
 : 'text-zinc-600 hover:text-black hover:bg-zinc-50'
 }`}
 >
 <span className="truncate">{sub.label}</span>
 {sub.count !== undefined && (
 <span className="text-[10px] font-mono text-zinc-500">
 {sub.count}
 </span>
 )}
 {sub.badge && (
 <span className="rounded-full border border-amber-500/30 px-1.5 py-0.2 text-[10px] font-medium text-amber-600">
 {sub.badge}
 </span>
 )}
 </button>
 );
 })}
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <button
 onClick={() => onNavigate('investors', 'investor_directory')}
 className={`flex w-full items-center justify-between px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
 currentSection === 'investors'
 ? 'text-black bg-zinc-100 font-bold'
 : 'text-zinc-500 hover:text-black'
 }`}
 >
 <div className="flex items-center gap-2">
 <Users className="h-3.5 w-3.5 text-zinc-500" />
 <span>Investors & Desk</span>
 </div>
 <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600 border border-zinc-200">
 {investorCount}
 </span>
 </button>

 <div className="space-y-0.5 pl-2 ml-2 border-l border-zinc-200/80">
 {[
 { id: 'investor_directory' as const, label: 'Investor Directory' },
 { id: 'kyc_desk' as const, label: 'KYC & AML Desk', badge: 'Active' },
 { id: 'cap_table' as const, label: 'Cap Table Registry' },
 { id: 'settlements' as const, label: 'Settlement Desk' },
 ].map((sub) => {
 const active = currentSection === 'investors' && currentSubItem === sub.id;
 return (
 <button
 key={sub.id}
 onClick={() => onNavigate('investors', sub.id)}
 className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
 active
 ? 'bg-zinc-100 font-medium text-black'
 : 'text-zinc-600 hover:text-black hover:bg-zinc-50'
 }`}
 >
 <span className="truncate">{sub.label}</span>
 {sub.badge && (
 <span className="rounded-full border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-medium text-emerald-600">
 {sub.badge}
 </span>
 )}
 </button>
 );
 })}
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <button
 onClick={() => onNavigate('ops', 'ops_overview')}
 className={`flex w-full items-center justify-between px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
 currentSection === 'ops'
 ? 'text-black bg-zinc-100 font-bold'
 : 'text-zinc-500 hover:text-black'
 }`}
 >
 <div className="flex items-center gap-2">
 <Activity className="h-3.5 w-3.5 text-zinc-500" />
 <span>Operations</span>
 </div>
 </button>

 <div className="space-y-0.5 pl-2 ml-2 border-l border-zinc-200/80">
 {[
 { id: 'ops_overview' as const, label: 'Ops Overview' },
 { id: 'media_vault' as const, label: 'Media Vault' },
 { id: 'distributions' as const, label: 'Distributions' },
 ].map((sub) => {
 const active = currentSection === 'ops' && currentSubItem === sub.id;
 return (
 <button
 key={sub.id}
 onClick={() => onNavigate('ops', sub.id)}
 className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
 active
 ? 'bg-zinc-100 font-medium text-black'
 : 'text-zinc-600 hover:text-black hover:bg-zinc-50'
 }`}
 >
 <span className="truncate">{sub.label}</span>
 </button>
 );
 })}
 </div>
 </div>

 <div className="flex flex-col gap-1">
 <button
 onClick={() => onNavigate('docs', 'docs_overview')}
 className={`flex w-full items-center justify-between px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
 currentSection === 'docs'
 ? 'text-black bg-zinc-100 font-bold'
 : 'text-zinc-500 hover:text-black'
 }`}
 >
 <div className="flex items-center gap-2">
 <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
 <span>Operator Docs</span>
 </div>
 </button>

 <div className="space-y-0.5 pl-2 ml-2 border-l border-zinc-200/80">
 {[
 { id: 'docs_overview' as const, label: 'Docs Overview' },
 { id: 'doc_dsl' as const, label: 'DSL Engine Spec' },
 { id: 'doc_float' as const, label: 'Join Float & Buffer' },
 { id: 'doc_prize' as const, label: 'Prize Money Model' },
 { id: 'doc_welfare' as const, label: 'Equine Welfare Trust' },
 ].map((sub) => {
 const active = currentSection === 'docs' && currentSubItem === sub.id;
 return (
 <button
 key={sub.id}
 onClick={() => onNavigate('docs', sub.id)}
 className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
 active
 ? 'bg-zinc-100 font-medium text-black'
 : 'text-zinc-600 hover:text-black hover:bg-zinc-50'
 }`}
 >
 <span className="truncate">{sub.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 </div>
 </aside>
 );
}
