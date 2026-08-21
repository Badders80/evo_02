import Link from 'next/link';
import { Shield, Scale, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 text-muted-foreground">
      {/* Locked Brand Triad Strip */}
      <div className="border-b border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d4a964]">
                Grounded in tradition.
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
                Partnered with New Zealand’s premier stud books, breeders, and classic race trainers.
              </p>
            </div>
            <div className="flex flex-col items-center border-t border-border/60 pt-4 sm:border-t-0 sm:border-x sm:px-4 sm:pt-0">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d4a964]">
                Evolved through innovation.
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
                Frictionless digital syndication with institutional reporting and transparent billing.
              </p>
            </div>
            <div className="flex flex-col items-center border-t border-border/60 pt-4 sm:border-t-0 sm:pt-0">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d4a964]">
                Ownership transformed.
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">
                Authorised NZTR Syndicator operating strictly under the FMA Equine Exemption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand & Maison Stamp */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-[#d4a964]/40 bg-[#d4a964]/10">
                <Shield className="h-4 w-4 text-[#d4a964]" />
              </div>
              <span className="font-serif text-lg font-medium text-foreground tracking-tight">
                EVOLUTION <span className="text-[#d4a964]">STABLES</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground max-w-md">
              Evolution Stables provides regulated fractional digital syndication for premier thoroughbred racehorses.
              Directly leased, professionally managed, and grounded in the yard.
            </p>
            <p className="mt-4 text-[10px] font-mono tracking-[0.25em] uppercase text-[#d4a964]">
              DIGITAL-SYNDICATION, BY EVOLUTION STABLES
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Marketplace & Stables
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/horses/nellie" className="hover:text-[#d4a964] transition-colors">
                  Lady Ketchikan (Nellie)
                </Link>
              </li>
              <li>
                <Link href="/horses/tml-x-yearn" className="hover:text-[#d4a964] transition-colors">
                  Turn Me Loose x Yearn (Mulan)
                </Link>
              </li>
              <li>
                <Link href="/#mechanics" className="hover:text-[#d4a964] transition-colors">
                  5×M Float Model
                </Link>
              </li>
              <li>
                <Link href="/#governance" className="hover:text-[#d4a964] transition-colors">
                  75/25 Prize Distribution
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Regulatory Governance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Governance & Law
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Scale className="h-3.5 w-3.5 text-[#d4a964]" />
                <span>NZTR Code of Practice</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-[#d4a964]" />
                <span>FMA Equine Exemption</span>
              </li>
              <li className="pt-1 text-[11px] text-muted-foreground/80">
                Quarterly Payout Distributions · Direct Bank Settlement
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclosure & Copyright */}
        <div className="mt-10 border-t border-border/80 pt-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            <strong>Regulatory Notice:</strong> Evolution Stables operates as an Authorised Syndicator under the Rules of
            Racing governed by New Zealand Thoroughbred Racing (NZTR). Thoroughbred participation interests offered via
            Digitally Syndicated Leases (DSLs) represent fixed-term recreational leasehold participations and are issued
            under the Financial Markets Conduct (Equine Syndicating Schemes) Exemption Notice. Past bloodline performance
            is not an indicator of future racetrack returns.
          </p>
          <div className="mt-4 flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground/60 sm:flex-row">
            <p>© {new Date().getFullYear()} Evolution Stables Limited. All rights reserved.</p>
            <p className="font-mono text-[11px]">Private Banker Standard · Zero-Debt Engine</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
