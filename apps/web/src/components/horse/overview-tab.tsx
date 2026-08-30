'use client';

import * as React from 'react';

interface OverviewTabProps {
  highlights: string[];
  racingOutlook: string;
}

export function OverviewTab({ highlights, racingOutlook }: OverviewTabProps) {
  const hasContent = highlights.length > 0 || racingOutlook.trim() !== '';

  if (!hasContent) {
    return (
      <div className="border border-border rounded-xl p-8 text-muted-foreground">
        Content coming soon for this horse.
      </div>
    );
  }

  return (
    <div>
      {/* Highlights section */}
      {highlights.length > 0 && (
        <div className="space-y-4">
          {highlights.map((hl, idx) => {
            const colonIdx = hl.indexOf(':');
            if (colonIdx !== -1) {
              const lead = hl.substring(0, colonIdx);
              const rest = hl.substring(colonIdx + 1);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </div>
                  <div>
                    <strong className="text-[14px] font-medium text-heading mr-1.5">
                      {lead}
                    </strong>
                    <span className="text-[14px] font-light text-muted-foreground leading-[1.7]">
                      {rest}
                    </span>
                  </div>
                </div>
              );
            }
            // No ': ' — render whole string as body
            return (
              <div key={idx} className="text-[14px] font-light text-muted-foreground leading-[1.7]">
                {hl}
              </div>
            );
          })}
        </div>
      )}

      {/* Racing Outlook section */}
      {racingOutlook.trim() !== '' && (
        <div className="mt-8">
          <p className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
            Racing Outlook & Pedigree
          </p>
          <p className="text-[15px] leading-[1.8] font-light text-foreground">
            {racingOutlook}
          </p>
        </div>
      )}
    </div>
  );
}