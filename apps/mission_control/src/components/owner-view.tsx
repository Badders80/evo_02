'use client';

import React from 'react';
import { Users } from 'lucide-react';

export function OwnerView() {
 const owners = [
 {
 name: 'B.A.X Bloodstock',
 contactPerson: 'Kylie Bax',
 horses: [
 'Lady Ketchikan (Nellie)',
 'Prudentia',
 'Hottathanafantasy (Coco)',
 'I Stole A Manolo (Manolo)',
 ],
 details:
 'B.A.X Bloodstock is the lessor for Nellie, Prudentia, Hottathanafantasy, and I Stole A Manolo. Evolution Stables is the syndicate manager, not the owner.',
 },
 {
 name: 'Stephen Gray Racing',
 contactPerson: 'Stephen Gray',
 horses: ['Turn Me Loose x Yearn 2023 (Mulan)', 'First Gear'],
 details:
 'Stephen Gray Racing, Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476. Never styled as Stables. First Gear is a completed visible campaign.',
 },
 ];

 return (
 <div className="flex-1 overflow-y-auto bg-white p-6 text-zinc-900 minimal-scrollbar">
 <div className="border-b border-zinc-200/80 pb-5">
 <h1 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
 <Users className="h-5 w-5 text-zinc-500" />
 <span>Registered Owners</span>
 </h1>
 <p className="mt-1 text-xs text-zinc-500">
 Horse owners and lessors offering Digitally Syndicated Leases (DSLs) to retail participants.
 </p>
 </div>

 <div className="mt-6 grid gap-4 lg:grid-cols-3">
 {owners.map((owner) => (
 <div
 key={owner.name}
 className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-5"
 >
 <div>
 <div className="flex items-center justify-between">
 <span className="text-sm font-semibold text-zinc-900">{owner.name}</span>
 <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-mono text-zinc-600">
 Owner
 </span>
 </div>

 <div className="mt-1 text-xs text-zinc-500">
 Contact: <strong className="text-zinc-900">{owner.contactPerson}</strong>
 </div>

 <p className="mt-3 text-xs text-zinc-500 leading-relaxed">{owner.details}</p>

 <div className="mt-4 pt-3 border-t border-zinc-200/60">
 <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
 Associated Horses:
 </span>
 <div className="mt-1.5 flex flex-wrap gap-1">
 {owner.horses.map((h) => (
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
