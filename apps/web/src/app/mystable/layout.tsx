import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Stable | Evolution Stables',
  robots: { index: false, follow: false },
};

export default function MyStableLayout({ children }: { children: React.ReactNode }) {
  return children;
}
