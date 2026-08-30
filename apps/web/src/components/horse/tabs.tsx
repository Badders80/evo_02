'use client';

import * as React from 'react';

interface TabsProps {
  overview: React.ReactNode;
  pedigree: React.ReactNode;
  trainer: React.ReactNode;
  raceRecord: React.ReactNode;
  documents: React.ReactNode;
}

export function Tabs({ overview, pedigree, trainer, raceRecord, documents }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'pedigree' | 'trainer' | 'race-record' | 'documents'>('overview');

  const tabButtons = [
    { key: 'overview', label: 'OVERVIEW' },
    { key: 'pedigree', label: 'PEDIGREE' },
    { key: 'trainer', label: 'TRAINER' },
    { key: 'race-record', label: 'RACE RECORD' },
    { key: 'documents', label: 'DOCUMENTS' },
  ];

  return (
    <div className="border-b border-border">
      {/* Tab bar */}
      <div className="flex space-x-0" role="tablist" aria-label="Horse tabs">
        {tabButtons.map((button) => {
          const isActive = activeTab === button.key;
          const classes = isActive
            ? 'text-accent border-b-2 border-accent'
            : 'text-[11px] font-light uppercase tracking-[0.25em] text-muted-foreground';
          const ariaControls = `tab-panel-${button.key}`;

          return (
            <button
              key={button.key}
              role={isActive ? 'tabpanel' : 'tab'}
              aria-selected={isActive ? 'true' : 'false'}
              aria-controls={ariaControls}
              className={`flex-1 flex items-center justify-center py-2 rounded-none transition-colors ${classes}`}
              onClick={() => setActiveTab(button.key as 'overview' | 'pedigree' | 'trainer' | 'race-record' | 'documents')}
            >
              {button.label}
            </button>
          );
        })}
      </div>

      {/* Panels below */}
      <div className="pt-8">
        {[overview, pedigree, trainer, raceRecord, documents].map((panel, idx) => {
          const show = activeTab === tabButtons[idx].key;
          return show ? <>{panel}</> : null;
        })}
      </div>
    </div>
  );
}