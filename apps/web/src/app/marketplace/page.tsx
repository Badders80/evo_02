import type { Metadata } from 'next';
import {
  formatHorseDisplayName,
  getAllCampaigns,
  getCampaignMedia,
} from '@/lib/horses-data';
import { MARKETPLACE_CARD_IMAGE } from '@evo/storage/cdn';
import {
  MarketplaceListingGrid,
  type MarketplaceCard,
} from '@/components/marketplace-listing-grid';

export const metadata: Metadata = {
  title: 'Marketplace | Evolution Stables',
  description:
    'Discover and explore native digital-syndication opportunities within the Evolution ecosystem.',
  alternates: { canonical: '/marketplace' },
};

export default async function MarketplacePage() {
  const campaigns = await getAllCampaigns();
  const cards: MarketplaceCard[] = campaigns.map((campaign) => {
    const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
    return {
      slug: campaign.slug,
      name: formatHorseDisplayName(campaign, { includeBarnName: false }),
      hook: campaign.marketing.marketplaceHook || campaign.softLegal.aboutHorse,
      status: campaign.listingStatus,
      image: MARKETPLACE_CARD_IMAGE[campaign.slug] ?? media.horse.heroConformation,
    };
  });

  return (
    <div className="min-h-screen bg-canvas font-sans selection:bg-accent selection:text-black">
      <main className="dot-grid-surface min-h-screen pb-24">
        <div className="mx-auto max-w-6xl px-12 pt-32 md:px-16 lg:px-20">
          <p className="text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
            Evolution Stables
          </p>
          <h1 className="mt-4 text-[36px] font-light tracking-tight text-heading md:text-[56px] leading-[1.05]">
            Ownership, evolved.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] font-light leading-[1.7] text-muted-foreground">
            Browse active offerings, coming-soon books, and completed track record.
          </p>
        </div>
        <div className="mt-16">
          <MarketplaceListingGrid cards={cards} />
        </div>
      </main>
    </div>
  );
}
