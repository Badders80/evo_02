'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ListingStatus } from '@evo/db_models';

export type MarketplaceCard = {
  slug: string;
  name: string;
  hook: string;
  highlightTags: string[];
  status: ListingStatus;
  image: string;
};

const FILTERS = [
  { key: 'all', label: 'All Horses' },
  { key: 'available', label: 'Available' },
  { key: 'coming_soon', label: 'Coming Soon' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export const STATUS_META: Record<
  ListingStatus,
  { label: string; badge: string; dot: string }
> = {
  listed: {
    label: 'Available',
    badge: 'border-status-active/40 bg-status-active/10 text-status-active',
    dot: 'bg-status-active',
  },
  coming_soon: {
    label: 'Coming Soon',
    badge: 'border-accent/40 bg-accent/10 text-accent',
    dot: 'bg-accent',
  },
  fully_subscribed: {
    label: 'Fully Subscribed',
    badge: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  completed: {
    label: 'Completed',
    badge: 'border-border bg-card text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
};

function statusOrder(status: ListingStatus): number {
  if (status === 'coming_soon') return 0;
  if (status === 'listed') return 1;
  if (status === 'fully_subscribed') return 2;
  return 3;
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const meta = STATUS_META[status];
  return (
    <div
      className={`absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-md ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <span className="text-[8px] font-medium uppercase tracking-widest">{meta.label}</span>
    </div>
  );
}

export function MarketplaceListingGrid({ cards }: { cards: MarketplaceCard[] }) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const router = useRouter();

  const filtered = useMemo(() => {
    const next = cards.filter((card) => {
      if (filter === 'available') return card.status === 'listed';
      if (filter === 'coming_soon') return card.status === 'coming_soon';
      return true;
    });
    return [...next].sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
  }, [cards, filter]);

  const featured =
    filter !== 'coming_soon' ? filtered.find((card) => card.status === 'listed') : undefined;

  return (
    <div className="space-y-12">
      <div className="mx-auto flex max-w-6xl justify-start gap-8 border-b border-border px-12 pb-4 md:px-16 lg:px-20">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`relative cursor-pointer py-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
              filter === tab.key ? 'text-heading' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {filter === tab.key && (
              <span className="absolute right-0 bottom-0 left-0 h-px bg-foreground" />
            )}
          </button>
        ))}
      </div>

      <section className="mx-auto max-w-6xl space-y-6 px-12 pb-32 md:px-16 lg:px-20">
        {filtered.length === 0 && (
          <div className="py-20 text-center text-sm font-light text-muted-foreground">
            No horses in this category.
          </div>
        )}
        {filtered.map((card) => {
          const isFeatured = featured?.slug === card.slug;
          return (
            <article
              key={card.slug}
              className={`group flex cursor-pointer flex-col items-stretch gap-6 rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.45)] md:flex-row md:gap-8 md:p-6 ${
                isFeatured ? 'md:gap-12 md:p-8' : ''
              }`}
              onClick={() => router.push(`/marketplace/${card.slug}`)}
              role="link"
              aria-label={card.name}
            >
              <Link
                href={`/marketplace/${card.slug}`}
                className="relative block w-full flex-shrink-0 overflow-hidden rounded-2xl md:order-last md:w-[40%]"
              >
                <div className="relative aspect-[16/9] w-full bg-canvas dot-grid-surface">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="h-full w-full object-contain opacity-90 transition-transform duration-1000 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/40 via-transparent to-transparent" />
                  <StatusBadge status={card.status} />
                </div>
              </Link>

              <div className="flex w-full flex-col justify-end py-2 md:order-first md:w-[60%] md:pr-6">
                <h2
                  className="font-light tracking-tight text-heading leading-none text-[24px] md:text-[28px]"
                >
                  {card.name}
                </h2>
                <p
                  className={`mt-4 font-light leading-[1.8] text-muted-foreground ${
                    isFeatured ? 'text-[14px]' : 'text-[13px]'
                  }`}
                >
                  {card.hook}
                </p>
                {card.highlightTags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.highlightTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-surface-base px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-6">
                  <Link
                    href={`/marketplace/${card.slug}`}
                    className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors group-hover:text-accent"
                  >
                    <span>Explore Offering</span>
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
