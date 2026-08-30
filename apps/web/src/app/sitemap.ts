import type { MetadataRoute } from 'next';
import { getAllCampaigns } from '../lib/horses-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://evolutionstables.nz';
  const lastModified = new Date();
  const campaigns = await getAllCampaigns();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/marketplace`, lastModified, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/learn/returns`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const marketplaceSlugs = ['nellie', 'tml-x-yearn', 'prudentia', 'hottathanafantasy', 'i-stole-a-manolo', 'first-gear'];
  const marketplaceRoutes: MetadataRoute.Sitemap = marketplaceSlugs.map((slug) => ({
    url: `${baseUrl}/marketplace/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const horseRoutes: MetadataRoute.Sitemap = campaigns.flatMap((campaign) => [
    {
      url: `${baseUrl}/horses/${campaign.slug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/horses/${campaign.slug}/about`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]);

  return [...staticRoutes, ...marketplaceRoutes, ...horseRoutes];
}
