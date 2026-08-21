'use client';

import React, { useState } from 'react';
import type { SyndicateLegalContext } from '@evo/legal_engine';
import { TopNav } from '../components/top-nav';
import { SidebarNav, type NavSection, type NavSubItem } from '../components/sidebar-nav';
import { StableDashboard } from '../components/stable-dashboard';
import { HorseWorkspace } from '../components/horse-workspace';
import { TrainerView } from '../components/trainer-view';
import { OwnerView } from '../components/owner-view';
import { DslView } from '../components/dsl-view';
import { OperationsDashboard } from '../components/operations-dashboard';
import { OperatorDocs } from '../components/operator-docs';
import { InvestorLedger } from '../components/investor-ledger';
import { CapTableView } from '../components/cap-table-view';
import { SettlementDeskView } from '../components/settlement-desk-view';
import { SearchModal } from '../components/search-modal';

const INITIAL_HORSES: Record<string, { context: SyndicateLegalContext; status: string }> = {
 nellie: {
 status: 'listed',
 context: {
 syndicateName: 'Lady Ketchikan Racing Syndicate',
 campaignSlug: 'nellie',
 ownerName: 'B.A.X Bloodstock',
 horse: {
 legalName: 'Lady Ketchikan',
 barnName: 'Nellie',
 foalingYear: 2023,
 gender: 'Filly',
 breeder: 'Mrs H G & W G Bax',
 microchip: '985125000137408',
 sire: 'Almanzor (FR)',
 dam: 'Night Danza (AUS)',
 },
 trainer: {
 name: 'Barbara Kennedy',
 location: 'Byerley Park, Karaka, NZ',
 managerEntity: 'Barbara Kennedy Racing',
 },
 pricing: {
 costMonthlyNzd: 7000,
 listPriceNzd: 7571,
 monthlyKeepUnitNzd: 76,
 joinFloatUnitNzd: 380,
 stakePercentage: 1.0,
 evolutionMarginPercent: 5.0,
 processingBufferPercent: 3.0,
 gstInclusive: true,
 },
 closeStyle: 'fourteen_day',
 totalHorsePercentage: 5.0,
 totalShares: 5,
 sharesAvailable: 5,
 pdsVersion: '1.0.0',
 saVersion: '1.0.0',
 effectiveDate: '2026-08-17',
 softLegal: {
 aboutHorse:
 'Lady Ketchikan (barn name Nellie) is a high-pedigree 3YO filly by European Champion 3YO Almanzor out of the Danzero mare Night Danza.',
 trainerBio:
 'Barbara Kennedy operates a boutique racing stable at the renowned Byerley Park training complex in Karaka.',
 racingOutlookAndPedigree:
 'By European Champion 3YO Almanzor out of Night Danza. Proven Australian speed through Golden Slipper winner Danzero.',
 },
 marketing: {
 marketplaceHook:
 'High-pedigree 3YO filly by European Champion sire Almanzor, conditioned at Byerley Park.',
 highlightTags: [
 'By Almanzor (FR)',
 'Classic Frame & Scope',
 'Byerley Park Trained',
 'Autumn 3YO Progression',
 ],
 },
 },
 },
 prudentia: {
 status: 'completed',
 context: {
 syndicateName: 'Prudentia Racing Syndicate',
 campaignSlug: 'prudentia',
 ownerName: 'B.A.X Bloodstock',
 horse: {
 legalName: 'Prudentia',
 barnName: 'Prudentia',
 foalingYear: 2021,
 gender: 'Mare',
 breeder: 'Goldeye Trust',
 microchip: '985125000126462',
 sire: 'Proisir (AUS)',
 dam: 'Little Bit Irish (NZ)',
 },
 trainer: {
 name: "Lance O'Sullivan & Andrew Scott",
 location: 'Matamata, NZ',
 managerEntity: 'Wexford Stables',
 },
 pricing: {
 costMonthlyNzd: 7000,
 listPriceNzd: 7571,
 monthlyKeepUnitNzd: 76,
 joinFloatUnitNzd: 380,
 stakePercentage: 1.0,
 evolutionMarginPercent: 5.0,
 processingBufferPercent: 3.0,
 gstInclusive: true,
 },
 closeStyle: 'fourteen_day',
 totalHorsePercentage: 5.0,
 totalShares: 5,
 sharesAvailable: 0,
 pdsVersion: '1.0.0',
 saVersion: '1.0.0',
 effectiveDate: '2026-08-17',
 },
 },
 hottathanafantasy: {
 status: 'completed',
 context: {
 syndicateName: 'Hottathanafantasy Racing Syndicate',
 campaignSlug: 'hottathanafantasy',
 ownerName: 'B.A.X Bloodstock',
 horse: {
 legalName: 'Hottathanafantasy',
 barnName: 'Coco',
 foalingYear: 2023,
 gender: 'Filly',
 breeder: 'Goldeye Trust',
 microchip: '985125000139165',
 sire: 'Contributer (IRE)',
 dam: 'Whiffle (USA)',
 },
 trainer: {
 name: "Lance O'Sullivan & Andrew Scott",
 location: 'Matamata, NZ',
 managerEntity: 'Wexford Stables',
 },
 pricing: {
 costMonthlyNzd: 7000,
 listPriceNzd: 7571,
 monthlyKeepUnitNzd: 76,
 joinFloatUnitNzd: 380,
 stakePercentage: 1.0,
 evolutionMarginPercent: 5.0,
 processingBufferPercent: 3.0,
 gstInclusive: true,
 },
 closeStyle: 'fourteen_day',
 totalHorsePercentage: 5.0,
 totalShares: 5,
 sharesAvailable: 0,
 pdsVersion: '1.0.0',
 saVersion: '1.0.0',
 effectiveDate: '2026-08-17',
 },
 },
 'i-stole-a-manolo': {
 status: 'coming_soon',
 context: {
 syndicateName: 'I Stole A Manolo Racing Syndicate',
 campaignSlug: 'i-stole-a-manolo',
 ownerName: 'B.A.X Bloodstock',
 horse: {
 legalName: 'I Stole A Manolo',
 barnName: 'Manolo',
 foalingYear: 2023,
 gender: 'Filly',
 breeder: 'Goldeye Trust',
 microchip: '985125000139219',
 sire: 'Satono Aladdin (JPN)',
 dam: 'Canuhandleajandal (NZ)',
 },
 trainer: {
 name: "Lance O'Sullivan & Andrew Scott",
 location: 'Matamata, NZ',
 managerEntity: 'Wexford Stables',
 },
 pricing: {
 costMonthlyNzd: 7000,
 listPriceNzd: 7571,
 monthlyKeepUnitNzd: 76,
 joinFloatUnitNzd: 380,
 stakePercentage: 1.0,
 evolutionMarginPercent: 5.0,
 processingBufferPercent: 3.0,
 gstInclusive: true,
 },
 closeStyle: 'fourteen_day',
 totalHorsePercentage: 5.0,
 totalShares: 5,
 sharesAvailable: 5,
 pdsVersion: '1.0.0',
 saVersion: '1.0.0',
 effectiveDate: '2026-08-17',
 },
 },
 'tml-x-yearn': {
 status: 'coming_soon',
 context: {
 syndicateName: 'Turn Me Loose x Yearn 2023 Racing Syndicate',
 campaignSlug: 'tml-x-yearn',
 ownerName: 'Stephen Gray Racing',
 horse: {
 legalName: 'Turn Me Loose x Yearn 2023',
 barnName: 'Mulan',
 foalingYear: 2023,
 gender: 'Filly',
 breeder: 'C W Kwok',
 microchip: '985125000128426',
 sire: 'Turn Me Loose (NZ)',
 dam: 'Yearn (NZ)',
 },
 trainer: {
 name: 'Stephen Gray Racing',
 location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
 managerEntity: 'Stephen Gray Racing',
 },
 pricing: {
 costMonthlyNzd: 6000,
 listPriceNzd: 6489,
 monthlyKeepUnitNzd: 65,
 joinFloatUnitNzd: 325,
 stakePercentage: 1.0,
 evolutionMarginPercent: 5.0,
 processingBufferPercent: 3.0,
 gstInclusive: true,
 },
 closeStyle: 'fourteen_day',
 totalHorsePercentage: 5.0,
 totalShares: 5,
 sharesAvailable: 5,
 pdsVersion: '1.0.0',
 saVersion: '1.0.0',
 effectiveDate: '2026-08-17',
 softLegal: {
 aboutHorse:
 'Turn Me Loose x Yearn 2023 (barn name Mulan) is an exceptionally bred 2YO filly representing a pure synthesis of elite New Zealand racing speed and stamina.',
 trainerBio:
 'Stephen Gray Racing trains from Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476.',
 racingOutlookAndPedigree:
 'Sire Turn Me Loose won three Group 1 titles across Melbourne and Sydney. Dam Yearn won the Group 2 Auckland Breeders Stakes.',
 },
 marketing: {
 marketplaceHook:
 'Precocious 2YO filly by triple Gr.1 winner Turn Me Loose out of Gr.2 winner Yearn.',
 highlightTags: [
 'Out of Gr.2 Winner Yearn ($339k)',
 'Triple Gr.1 Sire Line',
 'Precocious 2YO Target',
 'Stephen Gray Racing',
 ],
 },
 },
 },
 'first-gear': {
 status: 'completed',
 context: {
 syndicateName: 'First Gear Racing Syndicate',
 campaignSlug: 'first-gear',
 ownerName: 'Stephen Gray Racing',
 horse: {
 legalName: 'First Gear',
 barnName: 'First Gear',
 foalingYear: 2021,
 gender: 'Gelding',
 breeder: 'M & W Rose',
 microchip: '985125000126713',
 sire: 'Derryn (AUS)',
 dam: "A'Guin Ace (NZ)",
 },
 trainer: {
   name: 'Stephen Gray Racing',
   location: 'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
   managerEntity: 'Stephen Gray Racing',
 },
 pricing: {
 costMonthlyNzd: 7500,
 listPriceNzd: 8112,
 monthlyKeepUnitNzd: 82,
 joinFloatUnitNzd: 410,
 stakePercentage: 1.0,
 evolutionMarginPercent: 5.0,
 processingBufferPercent: 3.0,
 gstInclusive: true,
 },
 closeStyle: 'fourteen_day',
 totalHorsePercentage: 10.0,
 totalShares: 10,
 sharesAvailable: 0,
 pdsVersion: '1.0.0',
 saVersion: '1.0.0',
 effectiveDate: '2026-08-17',
 },
 },
};

export default function MissionControlPage() {
 const [horses, setHorses] = useState(INITIAL_HORSES);
 const [selectedSlug, setSelectedSlug] = useState('nellie');
 const [currentSection, setCurrentSection] = useState<NavSection>('stable');
 const [currentSubItem, setCurrentSubItem] = useState<NavSubItem>('stable_overview');
 const [searchOpen, setSearchOpen] = useState(false);

 const currentHorse = horses[selectedSlug] || horses['nellie'];

 const handleNavigate = (section: NavSection, subItem: NavSubItem) => {
 setCurrentSection(section);
 setCurrentSubItem(subItem);
 };

 const handleSelectSearchResult = (section: NavSection, subItem: NavSubItem, horseSlug?: string) => {
 if (horseSlug) {
 setSelectedSlug(horseSlug);
 }
 handleNavigate(section, subItem);
 };

 const handleUpdateContext = (updated: SyndicateLegalContext) => {
 setHorses((prev) => ({
 ...prev,
 [selectedSlug]: {
 ...prev[selectedSlug],
 context: updated,
 },
 }));
 };

 const handleAdvanceLifecycle = (nextStatus: string) => {
 setHorses((prev) => ({
 ...prev,
 [selectedSlug]: {
 ...prev[selectedSlug],
 status: nextStatus,
 },
 }));
 };

 const handleNewHorse = () => {
 const newSlug = `horse-${Date.now()}`;
 const newContext: SyndicateLegalContext = {
 syndicateName: 'New Horse Racing Syndicate',
 campaignSlug: newSlug,
 ownerName: 'Owner Entity',
 horse: {
 legalName: 'Unnamed Thoroughbred',
 barnName: 'New Horse',
 foalingYear: 2023,
 gender: 'Filly',
 breeder: 'Breeder Name',
 sire: 'Sire Name',
 dam: 'Dam Name',
 },
 trainer: {
 name: 'Trainer Name',
 location: 'Matamata, NZ',
 managerEntity: 'Trainer Entity',
 },
 pricing: {
 costMonthlyNzd: 7000,
 listPriceNzd: 7571,
 monthlyKeepUnitNzd: 76,
 joinFloatUnitNzd: 380,
 stakePercentage: 1.0,
 evolutionMarginPercent: 5.0,
 processingBufferPercent: 3.0,
 gstInclusive: true,
 },
 closeStyle: 'fourteen_day',
 totalHorsePercentage: 5.0,
 totalShares: 5,
 sharesAvailable: 5,
 pdsVersion: '1.0.0',
 saVersion: '1.0.0',
 effectiveDate: new Date().toISOString().split('T')[0],
 };

 setHorses((prev) => ({
 ...prev,
 [newSlug]: {
 status: 'draft',
 context: newContext,
 },
 }));
 setSelectedSlug(newSlug);
 handleNavigate('stable', 'horse');
 };

 return (
 <div className="flex h-screen flex-col bg-white text-zinc-900 overflow-hidden font-sans">
 <TopNav
 mode={currentSection === 'docs' ? 'docs' : 'ops'}
 onModeChange={(mode) => {
 if (mode === 'docs') {
 handleNavigate('docs', 'docs_overview');
 } else {
 handleNavigate('stable', 'stable_overview');
 }
 }}
 onOpenSearch={() => setSearchOpen(true)}
 />

 <div className="flex flex-1 overflow-hidden">
 <SidebarNav
 currentSection={currentSection}
 currentSubItem={currentSubItem}
 onNavigate={handleNavigate}
 horseCount={Object.keys(horses).length}
 investorCount={4}
 />

 <main className="flex flex-1 flex-col overflow-hidden bg-white">
 <div className="flex h-11 items-center justify-between border-b border-zinc-200/80 bg-zinc-50/50 px-6 text-xs text-zinc-500">
 <div className="flex items-center gap-2">
 <span className="font-medium text-zinc-700 capitalize">
 {currentSection === 'stable'
 ? 'Our Stable'
 : currentSection === 'investors'
 ? 'Investors & Desk'
 : currentSection === 'ops'
 ? 'Operations'
 : 'Documentation'}
 </span>
 <span className="text-zinc-500">/</span>
 <span className="font-mono text-zinc-900 capitalize">
 {currentSubItem.replace('_', ' ')}
 </span>
 </div>

 <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
 <span>DB: ssot_local.db</span>
 </div>
 </div>

 <div className="flex flex-1 overflow-hidden">
 {currentSection === 'stable' && currentSubItem === 'stable_overview' && (
 <StableDashboard
   horses={horses}
   onSelectHorse={(slug) => {
     setSelectedSlug(slug);
     handleNavigate('stable', 'horse');
   }}
   onNavigateSubItem={(subItem) => handleNavigate('stable', subItem)}
   onNewHorse={handleNewHorse}
 />
 )}

 {currentSection === 'stable' && currentSubItem === 'horse' && (
 <HorseWorkspace
 horseContext={currentHorse.context}
 onUpdateContext={handleUpdateContext}
 onAdvanceLifecycle={handleAdvanceLifecycle}
 status={currentHorse.status}
 />
 )}

 {currentSection === 'stable' && currentSubItem === 'trainer' && <TrainerView />}
 {currentSection === 'stable' && currentSubItem === 'owner' && <OwnerView />}
 {currentSection === 'stable' && currentSubItem === 'dsl' && <DslView horses={horses} selectedSlug={selectedSlug} onSelectSlug={setSelectedSlug} onUpdateContext={handleUpdateContext} />}

 {currentSection === 'investors' && currentSubItem === 'investor_directory' && <InvestorLedger />}
 {currentSection === 'investors' && currentSubItem === 'kyc_desk' && (
 <div className="flex-1 p-6 text-sm text-zinc-500">KYC & AML Desk module coming soon.</div>
 )}
 {currentSection === 'investors' && currentSubItem === 'cap_table' && <CapTableView />}
 {currentSection === 'investors' && currentSubItem === 'settlements' && <SettlementDeskView />}

 {currentSection === 'ops' && currentSubItem === 'ops_overview' && (
   <OperationsDashboard onNavigateSubItem={(subItem) => handleNavigate('ops', subItem)} />
 )}
 {currentSection === 'ops' && currentSubItem === 'media_vault' && (
 <div className="flex-1 p-6 text-sm text-zinc-500">Media Vault module coming soon.</div>
 )}
 {currentSection === 'ops' && currentSubItem === 'distributions' && (
 <div className="flex-1 p-6 text-sm text-zinc-500">Distributions module coming soon.</div>
 )}

 {currentSection === 'docs' && currentSubItem === 'docs_overview' && <OperatorDocs />}
 {currentSection === 'docs' && currentSubItem.startsWith('doc_') && <OperatorDocs />}
 </div>
 </main>
 </div>

 <SearchModal
 isOpen={searchOpen}
 onClose={() => setSearchOpen(false)}
 onSelectResult={handleSelectSearchResult}
 />
 </div>
 );
}
