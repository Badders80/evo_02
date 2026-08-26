import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { JsonLd } from '../components/json-ld';
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  organizationWebSiteJsonLd,
} from '../lib/seo';

export const metadata: Metadata = {
  title: 'Evolution Stables | Digitally-Syndicated Fractional Thoroughbred Ownership',
  description: SITE_DESCRIPTION,
  keywords: [
    'Thoroughbred Syndication',
    'Racehorse Ownership NZ',
    'Digital Syndication',
    'Evolution Stables',
    'NZTR Authorised Syndicator',
    'Fractional Racehorse',
  ],
  authors: [{ name: SITE_NAME }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Evolution Stables | Ownership, evolved.',
    description:
      'Direct, regulated fractional ownership of elite thoroughbred racehorses in New Zealand. Grounded in tradition, evolved through innovation.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_NZ',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/logos/favicon/favicon-gold.svg" type="image/svg+xml" />
        <link rel="icon" href="/brand/logos/favicon/favicon-white.svg" type="image/svg+xml" />
        <link rel="icon" href="/brand/logos/favicon/favicon-black.svg" type="image/svg+xml" />
        <link rel="icon" href="/brand/logos/favicon/favicon-border-grey.svg" type="image/svg+xml" />
        <link rel="icon" href="/brand/logos/favicon/favicon-muted-grey.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/logos/favicon/favicon-gold.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <JsonLd data={organizationWebSiteJsonLd()} />
      </body>
    </html>
  );
}
