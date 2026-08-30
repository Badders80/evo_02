'use client';

import * as React from 'react';

interface TabsProps {
  overview: React.ReactNode;
  pedigree: React.ReactNode;
  trainer: React.ReactNode;
  raceRecord: React.ReactNode;
  documents: React.ReactNode;
}

type TabKey = 'overview' | 'pedigree' | 'trainer' | 'race-record' | 'documents';

const TAB_BUTTONS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'OVERVIEW' },
  { key: 'pedigree', label: 'PEDIGREE' },
  { key: 'trainer', label: 'TRAINER' },
  { key: 'race-record', label: 'RACE RECORD' },
  { key: 'documents', label: 'DOCUMENTS' },
];

/** Base classes shared by active + inactive tabs (audit fix: consistent sizing). */
const TAB_BASE = 'flex-1 flex items-center justify-center py-2 rounded-none transition-colors text-[11px] font-light uppercase tracking-[0.25em]';

export function Tabs({ overview, pedigree, trainer, raceRecord, documents }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>('overview');

  const panels: Record<TabKey, React.ReactNode> = {
    overview,
    pedigree,
    trainer,
    'race-record': raceRecord,
    documents,
  };

  return (
    <div className="border-b border-border">
      {/* Tab bar — every button is role="tab" (audit fix: active tab was
          incorrectly role="tabpanel"); aria-controls now matches a real
          panel id. */}
      <div className="flex space-x-0" role="tablist" aria-label="Horse tabs">
        {TAB_BUTTONS.map((button) => {
          const isActive = activeTab === button.key;
          const classes = isActive
            ? `${TAB_BASE} text-accent border-b-2 border-accent`
            : `${TAB_BASE} text-muted-foreground hover:text-foreground`;

          return (
            <button
              key={button.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${button.key}`}
              className={classes}
              onClick={() => setActiveTab(button.key)}
            >
              {button.label}
            </button>
          );
        })}
      </div>

      {/* Panels — the active panel is role="tabpanel" wired to its tab. */}
      <div className="pt-8">
        {TAB_BUTTONS.map((button) =>
          activeTab === button.key ? (
            <div key={button.key} role="tabpanel" id={`tab-panel-${button.key}`} aria-labelledby={`tab-${button.key}`}>
              {panels[button.key]}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}