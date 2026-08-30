import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Robots (minimal SEO base, 2026-08-31): allow all, point to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
