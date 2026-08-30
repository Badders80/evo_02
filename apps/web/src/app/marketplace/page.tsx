import type { Metadata } from 'next';
import {
  formatHorseDisplayName,
  getAllCampaigns,
  getCampaignMedia,
} from '../../lib/horses-data';
import { MARKETPLACE_CARD_IMAGE } from '@evo/storage/cdn';
import {
  MarketplaceListingGrid,
  type MarketplaceCard,
} from '../../components/marketplace-listing-grid';

export const metadata: Metadata = {
  title: 'Marketplace | Evolution Stables',
  description:
    'Browse regulated digital-syndication offerings. Explore listed thoroughbreds, coming-soon campaigns, and completed track record.',
  alternates: { canonical: '/marketplace' },
};

export default async function MarketplacePage() {
  const campaigns = await getAllCampaigns();
  const cards: MarketplaceCard[] = campaigns.map((campaign) => {
    const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
    return {
      slug: campaign.slug,
      name: formatHorseDisplayName(campaign),
      hook: campaign.marketing.marketplaceHook || campaign.softLegal.aboutHorse,
      status: campaign.listingStatus,
      image: MARKETPLACE_CARD_IMAGE[campaign.slug] ?? media.horse.heroConformation,
      trainer: campaign.trainer.stable,
      location: campaign.trainer.location,
    };
  });

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="mx-auto max-w-6xl px-12 pt-16 pb-10 md:px-16 lg:px-20">
        <p className="text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
          Regulated marketplace
        </p>
        <h1 className="mt-4 text-[36px] font-light tracking-tight text-heading md:text-[48px]">
          Current offerings
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] font-light leading-[1.7] text-muted-foreground">
          Listed campaigns, coming-soon books, and completed track record. Select a
          thoroughbred to view commercials, pedigree, and the legal pack.
        </p>
      </header>
      <MarketplaceListingGrid cards={cards} />
    </div>
  );
}
