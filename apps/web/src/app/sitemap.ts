import type { MetadataRoute } from 'next';
import { getAllCampaigns } from '../lib/horses-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://evolutionstables.nz';
  const campaigns = getAllCampaigns();

  const campaignRoutes: MetadataRoute.Sitemap = campaigns.map((campaign) => ({
    url: `${baseUrl}/horses/${campaign.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...campaignRoutes,
  ];
}
