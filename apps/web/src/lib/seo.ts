import type { Metadata } from 'next';
import { getCampaignMedia, type HorseCampaign } from './horses-data';

export const SITE_URL = 'https://evolutionstables.nz';
export const SITE_NAME = 'Evolution Stables';
export const SITE_DESCRIPTION =
  'Experience regulated fractional ownership of New Zealand thoroughbred racehorses. Fixed-term digital syndication leases with transparent billing, 75/25 gross stakes distribution, and direct trainer updates.';

export const DEFAULT_OG_IMAGE = {
  url: '/og/default.png',
  width: 1200,
  height: 630,
  alt: 'Evolution Stables',
} as const;

export function organizationWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        areaServed: { '@type': 'Country', name: 'New Zealand' },
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'en-NZ',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

export function faqPageJsonLd(faqs: readonly { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

export function horseWebPageJsonLd(campaign: HorseCampaign) {
  const url = `${SITE_URL}/horses/${campaign.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${campaign.legalName}${campaign.barnName ? ` (${campaign.barnName})` : ''}`,
    description: campaign.marketing.marketplaceHook,
    url,
    isPartOf: { '@id': `${SITE_URL}/#website`, '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization`, '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    about: {
      '@type': 'Thing',
      name: campaign.legalName,
      ...(campaign.barnName ? { alternateName: campaign.barnName } : {}),
      description: campaign.marketing.marketplaceHook,
    },
  };
}

export function campaignShareMetadata(
  campaign: HorseCampaign,
  path: string,
  title: string
): Pick<Metadata, 'openGraph' | 'twitter' | 'alternates'> {
  const media = getCampaignMedia(campaign.slug, campaign.trainer.slug);
  const hero = media.horse.heroConformation || DEFAULT_OG_IMAGE.url;
  const url = `${SITE_URL}${path}`;
  const images = [
    {
      url: hero,
      width: 1200,
      height: 630,
      alt: campaign.legalName,
    },
  ];

  return {
    alternates: { canonical: url },
    openGraph: {
      title,
      description: campaign.marketing.marketplaceHook,
      url,
      type: 'article',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: campaign.marketing.marketplaceHook,
      images: [hero],
    },
  };
}
