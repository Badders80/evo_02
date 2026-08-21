'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowRight, User } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';

export function Header() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { href: '/#marketplace', label: 'Marketplace' },
    { href: '/#mechanics', label: 'Syndicate Mechanics' },
    { href: '/#governance', label: 'Governance' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Crest & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#d4a964]/40 bg-[#d4a964]/10 transition-colors group-hover:border-[#d4a964]">
            <svg
              className="h-5 w-5 text-[#d4a964]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-medium tracking-tight text-foreground sm:text-lg">
              EVOLUTION <span className="text-[#d4a964]">STABLES</span>
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
              Authorised NZTR Syndicator
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:text-[#d4a964] ${
                  isActive ? 'text-[#d4a964]' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Gate / Regulated Status & MyStable Visual Control */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-400 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NZTR Regulated</span>
          </div>

          {userEmail ? (
            <Link
              href="/mystable"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#d4a964]/60 bg-[#d4a964]/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#d4a964] transition-all hover:border-[#d4a964] hover:bg-[#d4a964]/20"
            >
              <User className="h-3.5 w-3.5" />
              <span>MyStable</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-medium tracking-wide text-foreground transition-all hover:border-[#d4a964] hover:text-[#d4a964]"
            >
              <span>Sign In</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
