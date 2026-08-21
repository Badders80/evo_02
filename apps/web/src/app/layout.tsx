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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#d4a964]/30 selection:text-[#d4a964] flex flex-col justify-between">
        <JsonLd data={organizationWebSiteJsonLd()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
