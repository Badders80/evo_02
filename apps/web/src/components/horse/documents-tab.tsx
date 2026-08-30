'use client';

import * as React from 'react';

interface DocumentsTabProps {
  horseSlug: string;
  pdsUrl?: string;
  saUrl?: string;
  isInvestor: boolean;
}

export function DocumentsTab({
  horseSlug,
  pdsUrl,
  saUrl,
  isInvestor,
}: DocumentsTabProps) {
  // horseSlug is part of the public API contract but used only for investor verification
  const _horseSlug = horseSlug; // intentionally left unused for non-investor path
  const hasPds = !!pdsUrl;
  const hasSa = !!saUrl;

  // Guest gating: when isInvestor=false, show restricted overlay
  if (!isInvestor) {
    return (
      <div className="relative">
        <div
          className="
            blur-[6px]
            pointer-events-none
            select-none
        " />
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            rounded-xl
            p-6
            bg-black/40
          "
        >
          <div className="text-sm font-medium text-heading">
            Restricted: Investors Only
          </div>
          <div className="text-xs text-muted-foreground">
            Documents for this campaign are restricted to verified investors.
          </div>
        </div>

        {/* Cards region below the overlay */}
        <div className="mt-8">
          {/* PDS Card */}
          <div
            className="
              flex
              justify-between
              items-center
              border
              border-border
              bg-surface-base
              rounded-xl
              p-4
              blur-[6px]
              pointer-events-none
              select-none
            "
          >
            <div className="text-xs font-medium text-heading">
              PDS
            </div>
            <div className="text-[10px] text-muted-foreground">
              {hasPds ? 'Download' : 'Unavailable'}
            </div>
          </div>

          {/* Syndicate Agreement Card */}
          <div
            className="
              flex
              justify-between
              items-center
              border
              border-border
              bg-surface-base
              rounded-xl
              p-4
              blur-[6px]
              pointer-events-none
              select-none
            "
          >
            <div className="text-xs font-medium text-heading">
              Syndicate Agreement
            </div>
            <div className="text-[10px] text-muted-foreground">
              {hasSa ? 'Download' : 'Unavailable'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Investor path: normal rendering
  return (
    <div className="space-y-6">
      {/* Heading block */}
      <div>
        <h3 className="text-heading">Legal Disclosures & Documents</h3>
        <p className="text-xs text-muted-foreground">
          Ownership is bound by regulated legal documentation. We strongly recommend
          downloading and reviewing the offer documents prior to committing stakes.
        </p>
      </div>

      {/* PDS Card */}
      <div
        className="
          flex
          justify-between
          items-center
          border
          border-border
          bg-surface-base
          rounded-xl
          p-4
        "
      >
        <div className="text-xs font-medium text-heading">
          PDS
        </div>
        <div
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-widest
            text-accent
            hover:underline
          "
        >
          {hasPds ? (
            <a
              href={pdsUrl!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          ) : (
            <span className="text-muted-foreground">Unavailable</span>
          )}
        </div>
      </div>

      {/* Syndicate Agreement Card */}
      <div
        className="
          flex
          justify-between
          items-center
          border
          border-border
          bg-surface-base
          rounded-xl
          p-4
        "
      >
        <div className="text-xs font-medium text-heading">
          Syndicate Agreement
        </div>
        <div
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-widest
            text-accent
            hover:underline
          "
        >
          {hasSa ? (
            <a
              href={saUrl!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          ) : (
            <span className="text-muted-foreground">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}