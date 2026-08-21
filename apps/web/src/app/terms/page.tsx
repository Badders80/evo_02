import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Evolution Stables',
  description: 'Terms and conditions governing access to the Evolution Stables digital syndication platform.',
};

export default function TermsPage() {
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
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Legal Governance</span>
      </div>

      <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
        Terms of <span className="font-serif italic text-[#d4a964]">Service</span>
      </h1>
      <p className="mt-2 text-xs font-mono text-muted-foreground">
        Version 2026.1 · Governed by New Zealand Thoroughbred Racing (NZTR) & Equine Exemption
      </p>

      <div className="mt-12 space-y-10 text-sm text-muted-foreground leading-relaxed">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and utilizing the Evolution Stables platform, you agree to be bound by these Terms of Service,
            all applicable laws and regulations in New Zealand, and the rules and regulations established by New Zealand
            Thoroughbred Racing (NZTR).
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">2. Digital Syndication & Leasehold Structure</h2>
          <p>
            Evolution Stables provides fractional Digitally Syndicated Leases (DSLs). Participation does not represent
            equity shares in an operating company, cryptocurrency, or speculative financial derivative. Each DSL
            represents a fixed-term, fractional right to the racing career, prize money distributions, and member
            experience of an identified New Zealand thoroughbred under NZTR COP 22.1.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">3. Commercial Float & 75/25 Distributions</h2>
          <p>
            Syndicate billing operates under the 5×M float model (3 months security reserve + 2 months advance keep).
            Monthly maintenance charges (M) commence on Month 2. Prize money is distributed on a 75% net investor / 25%
            lessor split based strictly on official gross stakes published by Loveracing NZ. Unused float funds are
            refunded pro-rata upon lease maturity or formal termination.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">4. Thoroughbred Welfare & Trainer Primacy</h2>
          <p>
            Under Clause 6 of the Syndicate Agreement, the licensed trainer holds absolute primacy and final decision-making
            authority regarding horse conditioning, spelling, veterinary treatment, race placement, and retirement.
            Syndicate members have zero authority to mandate racing decisions that conflict with equine welfare standards.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium text-foreground mb-3">5. Regulatory Compliance & AML/KYC</h2>
          <p>
            All participants must complete statutory customer verification via Stripe Identity in accordance with the
            Financial Markets Conduct (Equine Syndicating Schemes) Exemption Notice and New Zealand AML/CFT legislation.
          </p>
        </section>
      </div>
    </div>
  );
}
