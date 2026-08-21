'use client';

import React from 'react';
import { UserCheck, MapPin } from 'lucide-react';

export function TrainerView() {
 const trainers = [
 {
 name: 'Barbara Kennedy',
 entity: 'Barbara Kennedy Racing',
 licensed: true,
 location: 'Byerley Park, Karaka, NZ',
 horses: ['Lady Ketchikan (Nellie)'],
 bio: 'Licensed NZTR trainer based at the premier Byerley Park training facility in Karaka. Expert in early 3YO education and filly development.',
 },
 {
 name: "Lance O'Sullivan & Andrew Scott",
 entity: 'Wexford Stables',
 licensed: true,
 location: 'Matamata, NZ',
 horses: ['Prudentia', 'Hottathanafantasy (Coco)', 'I Stole A Manolo (Manolo)'],
 bio: 'Dual-licensed training partnership operating from Wexford Stables in Matamata, with extensive Group race experience across New Zealand and Australia.',
 },
 {
 name: 'Stephen Gray Racing',
 entity: 'Stephen Gray Racing',
 licensed: true,
 location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
 horses: ['Turn Me Loose x Yearn 2023 (Mulan)', 'First Gear'],
 bio: 'Stephen Gray Racing trains from Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476. Copper Belt Lodge is the yard address, not the trading name.',
 },
 ];

 return (
 <div className="flex-1 overflow-y-auto bg-white p-6 text-zinc-900 minimal-scrollbar">
 <div className="border-b border-zinc-200/80 pb-5">
 <h1 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
 <UserCheck className="h-5 w-5 text-zinc-500" />
 <span>Licensed Trainers</span>
 </h1>
 <p className="mt-1 text-xs text-zinc-500">
 NZTR-licensed trainers holding sole racing and welfare primacy.
 </p>
 </div>

 <div className="mt-6 grid gap-4 lg:grid-cols-3">
 {trainers.map((trainer) => (
 <div
 key={trainer.name}
 className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-5"
 >
 <div>
 <div className="flex items-center justify-between">
 <span className="text-sm font-semibold text-zinc-900">{trainer.name}</span>
 <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-mono text-zinc-600">
 NZTR Licensed
 </span>
 </div>

 <div className="mt-2 text-xs text-zinc-600">
 <strong>{trainer.entity}</strong>
 </div>

 <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
 <MapPin className="h-3.5 w-3.5 text-zinc-500" />
 <span>{trainer.location}</span>
 </div>

 <p className="mt-3 text-xs text-zinc-500 leading-relaxed">{trainer.bio}</p>

 <div className="mt-4 pt-3 border-t border-zinc-200/60">
 <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
 Assigned Horses:
 </span>
 <div className="mt-1.5 flex flex-wrap gap-1">
 {trainer.horses.map((h) => (
 <span
 key={h}
 className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono text-zinc-700 border border-zinc-200"
 >
 {h}
 </span>
 ))}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
