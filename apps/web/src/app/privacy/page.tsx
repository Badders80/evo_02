import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Evolution Stables',
  description: 'How Evolution Stables collects, safeguards, and handles investor and member data.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#d4a964] hover:underline mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Home</span>
      </Link>

      <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a964]/40 bg-[#d4a964]/10 px-3.5 py-1 text-xs font-mono tracking-[0.2em] uppercase text-[#d4a964] mb-4">
        <Lock className="h-3.5 w-3.5" />
        <span>Privacy & Data Protection</span>
      </div>

      <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
        Privacy <span className="font-serif italic text-[#d4a964]">Policy</span>
      </h1>
      <p className="mt-2 text-xs font-mono text-muted-foreground">
        Updated August 2026 · Compliant with the New Zealand Privacy Act 2020
      </p>

      <div className="mt-12 space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">1. Information We Collect</h2>
          <p>
            We collect personal identity information (Full Legal Name, Date of Birth, Address, Government ID) strictly
            for regulatory compliance with New Zealand Thoroughbred Racing (NZTR) syndicate registration rules and
            AML/CFT statutory obligations.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">2. Identity Verification & Stripe Engine</h2>
          <p>
            Identity document processing and verification are conducted securely through Stripe Identity. Biometric and
            raw passport/driver license images are transmitted directly via encrypted channels and are not stored in
            unencrypted form on our platform servers.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">3. Database Security & Storage</h2>
          <p>
            Investor records, cap table allocations, and syndicate agreements are encrypted at rest using PostgreSQL
            Row-Level Security (RLS) policies within our Supabase institutional vault. Media assets and trackwork
            broadcasts are delivered via Cloudflare edge infrastructure.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">4. Third-Party Sharing</h2>
          <p>
            We do not sell, rent, or monetize your personal data. Personal information is disclosed solely to authorized
            regulatory bodies (NZTR, FMA, DIA) where required by New Zealand law for official ownership registration.
          </p>
        </section>
      </div>
    </div>
  );
}
