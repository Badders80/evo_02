import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
 title: 'Mission Control — Evolution Stables',
 description: 'Internal operations portal for thoroughbred syndication management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en" className="light" suppressHydrationWarning>
 <body className="min-h-screen bg-white text-zinc-900 antialiased" suppressHydrationWarning>
 {children}
 </body>
 </html>
 );
}
