import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login', '/mystable', '/auth/'],
    },
    sitemap: 'https://evolutionstables.nz/sitemap.xml',
  };
}
