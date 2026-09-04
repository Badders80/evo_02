import * as React from 'react';
import { cn } from './cn';

/**
 * StatusPill — campaign status chip (style guide P4). Replaces both the right-rail
 * statusChip and CampaignStatusBadge. Exactly one token set per status.
 * Evidence (base): apps/web/src/components/horse/right-rail.tsx:42,51,60,68
 */
export type CampaignStatus = 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed';

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  listed: 'Become An Owner',
  fully_subscribed: 'Fully Subscribed',
  coming_soon: 'Coming Soon',
  completed: 'Campaign Concluded',
};

export const STATUS_STYLES: Record<CampaignStatus, { pill: string; dot: string }> = {
  listed: { pill: 'border-status-active/40 bg-status-active/10 text-status-active', dot: 'bg-status-active' },
  fully_subscribed: { pill: 'border-accent/40 bg-accent/10 text-accent', dot: 'bg-accent' },
  coming_soon: { pill: 'border-status-active/40 bg-status-active/10 text-status-active', dot: 'bg-status-active' },
  completed: { pill: 'border-border bg-card text-muted-foreground', dot: 'bg-muted-foreground' },
};

export function StatusPill({
  status,
  className,
}: {
  status: CampaignStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest',
        style.pill,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', style.dot)} />
      <span>{STATUS_LABELS[status]}</span>
    </div>
  );
}
