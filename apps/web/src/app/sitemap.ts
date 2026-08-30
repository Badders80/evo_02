import type { MetadataRoute } from 'next';
import { getAllCampaigns } from '@/lib/horses-data';
import { SITE_URL } from '@/lib/seo';

/**
 * Sitemap (minimal SEO base, 2026-08-31): static routes + one entry per live
 * marketplace campaign. Build-on-later: new routes (blog, /horses) are additive.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const campaigns = await getAllCampaigns();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/marketplace`, changeFrequency: 'weekly', priority: 0.9 },
  ];

  const campaignRoutes: MetadataRoute.Sitemap = campaigns.map((campaign) => ({
    url: `${SITE_URL}/marketplace/${campaign.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...campaignRoutes];
}
