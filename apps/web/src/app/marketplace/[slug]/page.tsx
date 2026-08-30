import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCampaignBySlug } from '@/lib/horses-data';
import RightRail from '@/components/horse/right-rail';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    notFound();
  }
  return {
    title: `${campaign.legalName} | Marketplace | Evolution Stables`,
    description: campaign.marketing.marketplaceHook,
  };
}

export default async function MarketplaceCampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-12 pt-28 pb-8 md:px-16 lg:px-20 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-12 items-start">
        <div id="story" className="space-y-8">
          {/* chunk-2 */}
        </div>
        <div id="tabs" className="space-y-8">
          {/* chunk-4+ */}
        </div>
        <RightRail status={campaign.listingStatus} />
      </div>
    </div>
  );
}