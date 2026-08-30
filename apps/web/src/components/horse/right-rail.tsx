import { STATUS_META } from '@/components/marketplace-listing-grid';

type ListingStatus = 'listed' | 'fully_subscribed' | 'coming_soon' | 'completed';

function statusChip(status: ListingStatus) {
  const meta = STATUS_META[status as keyof typeof STATUS_META];

  if (status === 'listed') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-status-active/10 border-status-active/40 text-status-active text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-status-active" />
        <span>● BECOME AN OWNER</span>
      </div>
    );
  }

  if (status === 'fully_subscribed') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card text-muted-foreground text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        <span>Fully Subscribed</span>
      </div>
    );
  }

  if (status === 'coming_soon') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent text-[8px] font-medium uppercase tracking-widest`}>
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span>Coming Soon</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 border-border bg-card text-muted-foreground text-[8px] font-medium uppercase tracking-widest">
      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
      <span>Coming Soon</span>
    </div>
  );
}

export default function RightRail({ campaign }: { campaign: any }) {
  return (
    <aside className="lg:sticky lg:top-28 space-y-6">
      {statusChip(campaign.listingStatus)}
      <div className="rounded-2xl border border-border bg-card p-6">
        {/* chunk-9 fills */}
      </div>
    </aside>
  );
}