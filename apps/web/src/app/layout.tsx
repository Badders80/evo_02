import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/header';
import { Footer } from '../components/footer';

export const metadata: Metadata = {
  title: 'Evolution Stables | Digitally-Syndicated Fractional Thoroughbred Ownership',
  description:
    'Experience regulated fractional ownership of elite New Zealand thoroughbred racehorses. Fixed-term digital syndication leases with transparent billing, 75/25 gross stakes distribution, and direct trainer updates.',
  keywords: [
    'Thoroughbred Syndication',
    'Racehorse Ownership NZ',
    'Digital Syndication',
    'Evolution Stables',
    'NZTR Authorised Syndicator',
    'Fractional Racehorse',
  ],
  authors: [{ name: 'Evolution Stables Limited' }],
  metadataBase: new URL('https://evolutionstables.nz'),
  openGraph: {
    title: 'Evolution Stables | Ownership, evolved.',
    description:
      'Direct, regulated fractional ownership of elite thoroughbred racehorses in New Zealand. Grounded in tradition, evolved through innovation.',
    url: 'https://evolutionstables.nz',
    siteName: 'Evolution Stables',
    locale: 'en_NZ',
    type: 'website',
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
