import type { Metadata } from 'next';
import {
  formatHorseDisplayName,
  getAllCampaigns,
  getCampaignMedia,
  getMarketplaceHook,
} from '@/lib/horses-data';
import { MARKETPLACE_CARD_IMAGE } from '@evo/storage/cdn';
import {
  MarketplaceListingGrid,
  type MarketplaceCard,
} from '@/components/marketplace-listing-grid';
import { OwnershipFAQSection } from '@/components/sections/OwnershipFAQSection';

export const metadata: Metadata = {
  title: 'Marketplace | Evolution Stables',
  description:
    'Discover and explore native digital-syndication opportunities within the Evolution ecosystem.',
  alternates: { canonical: '/marketplace' },
};

export default async function MarketplacePage() {
  const campaigns = await getAllCampaigns();
  // Single source of truth for preview: server env read here means server HTML
  // and client hydration always agree (never read env in the Client Component).
  const preview = process.env.NEXT_PUBLIC_WORKFLOW_PREVIEW === 'true';
  const cards: MarketplaceCard[] = campaigns.map((campaign) => {
    const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
    return {
      slug: campaign.slug,
      name: formatHorseDisplayName(campaign, { includeBarnName: false }),
      hook: getMarketplaceHook(campaign),
      highlightTags: campaign.marketing.highlightTags,
      status: campaign.listingStatus,
      image: MARKETPLACE_CARD_IMAGE[campaign.slug] ?? media.horse.heroConformation,
    };
  });

  return (
    <div className="min-h-screen bg-canvas font-sans selection:bg-accent selection:text-black">
      <main className="min-h-screen pb-24">
        <div className="mx-auto max-w-6xl px-12 pt-32 md:px-16 lg:px-20">
          <p className="text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
            Evolution Stables
          </p>
          <h1 className="mt-4 text-[36px] font-light tracking-[-0.04em] text-heading md:text-[64px] leading-[1.05]">
            Ownership,
            <br />
            evolved.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] font-light leading-[1.7] text-muted-foreground">
            Browse active offerings, coming-soon offerings, and completed track record. For a deeper
            dive into our ownership model, read the{' '}
            <a
              href="#ownership-faq"
              className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-heading"
            >
              Ownership FAQ
            </a>{' '}
            below.
          </p>
        </div>
        <div className="mt-16">
          <MarketplaceListingGrid cards={cards} preview={preview} />
        </div>
        <OwnershipFAQSection />
      </main>
    </div>
  );
}
