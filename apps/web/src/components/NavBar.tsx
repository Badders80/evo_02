'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LOGOS } from '@/lib/assets';
import { GlowPillButton } from '@/components/ui/GlowPillButton';
import { useAuth } from '@/lib/use-auth';

/**
 * Navigation links configuration
 */
const navLinks = [
  { label: 'About', href: '/#about' },
  { label: 'Mission', href: '/#mission' },
  { label: 'Model', href: '/#digital-syndication' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'MyStable', href: '/mystable' },
  { label: 'FAQ', href: '/#faq' },
];

/**
 * NavBar Component
 *
 * A polished, x.ai-inspired navigation bar with:
 * - Glassmorphic design with smooth backdrop blur
 * - Scroll-based state changes (transparent → solid)
 * - Refined hover states with subtle glows
 * - Responsive mobile menu
 */
export function NavBar() {
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const navRowRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on initial mount only (route-change listener not available in App Router)
  const menuToggledOnMount = useRef(false);
  useEffect(() => {
    if (menuToggledOnMount.current) return;
    menuToggledOnMount.current = true;
    setIsMenuOpen(false);
  }, []);

  /**
   * Detect overflow on the nav row — flip to hamburger only when the tabs
   * actually run out of horizontal room. Lets the tabs render down to ~950px
   * (where content is ~910px wide) instead of collapsing at a fixed breakpoint.
   */
  useEffect(() => {
    const row = navRowRef.current;
    if (!row) return;

    const measure = () => {
      // 1px buffer prevents sub-pixel rounding flicker
      const overflowing = row.scrollWidth - row.clientWidth > 1;
      // Safety floor — never keep tabs below 880px regardless of measured width,
      // guards against sub-100% zoom + unusual font rendering.
      const tooNarrow = window.innerWidth < 880;
      setIsCompact(overflowing || tooNarrow);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(row);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /**
   * Track scroll position to toggle nav bar appearance
   */
  useEffect(() => {
    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setScrolled(!entry.isIntersecting);
        },
        {
          root: null,
          rootMargin: '-64px 0px 0px 0px',
          threshold: 0,
        }
      );

      observer.observe(hero);
      return () => observer.disconnect();
    }

    // Fallback: scroll listener
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Delayed visibility for smooth entrance animation
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), 320);
    return () => window.clearTimeout(timeout);
  }, []);

  // Nav bar becomes solid when scrolled or menu is open
  const isSolid = scrolled || isMenuOpen;
  const logoSrc = LOGOS.simple.grey;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[9999] w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isSolid
          ? 'bg-canvas/80 text-heading'
          : 'bg-canvas/40 text-heading'
      } ${visible ? 'opacity-100 translate-y-0' : '-translate-y-4 opacity-0'}`}
      style={{
        backdropFilter: 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        ...(isMenuOpen
          ? {}
          : {
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            }),
      }}
    >
      <div
        ref={navRowRef}
        className="mx-auto flex h-20 w-full max-w-[1440px] items-center px-6 sm:px-10 lg:px-12"
      >
        {/* Logo */}
        <div className="flex flex-1 flex-shrink-0 items-center">
          <Link
            href="/"
            className="group flex shrink-0 items-center transition-all duration-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/50 rounded-sm"
          >
            <div className="relative h-7 w-auto">
              <Image
                src={logoSrc}
                alt="Evolution Stables"
                width={192}
                height={64}
                className="h-full w-auto transition-all duration-300 group-hover:opacity-80"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div
          className={`flex flex-1 flex-shrink-0 items-center justify-center ${isCompact ? 'hidden' : 'lg:flex'}`}
        >
          <div className="flex items-center gap-0">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="group relative flex items-center"
              >
                <Link
                  href={link.href}
                  className="relative inline-flex items-center whitespace-nowrap px-2.5 py-4 text-[12px] font-[300] tracking-[0.15em] uppercase transition-all duration-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/50 rounded-sm text-foreground hover:text-heading"
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
                <span className="absolute bottom-2 left-2.5 right-2.5 h-[0.5px] origin-left scale-x-0 bg-accent transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Actions: User Menu or CTA, Menu Toggle */}
        <div className={`flex flex-1 flex-shrink-0 items-center justify-end gap-4 ${isCompact ? '' : 'lg:flex'}`}>
          {loading ? (
            <div className={`h-10 w-32 bg-white/5 rounded-full animate-pulse ${isCompact ? 'hidden' : 'lg:block'}`} />
          ) : user ? (
            <div className={`items-center gap-4 ${isCompact ? 'hidden' : 'lg:flex'}`}>
              <span className="text-[12px] font-[300] tracking-[0.15em] uppercase text-muted-foreground">
                Hi, {user?.displayName?.split(' ')[0] || 'Alex'}
              </span>
              <GlowPillButton
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
              >
                Sign Out
              </GlowPillButton>
            </div>
          ) : (
            <Link
              href="/login"
              className={isCompact ? 'hidden' : 'lg:block'}
            >
              <GlowPillButton>
                Get Started
              </GlowPillButton>
            </Link>
          )}

          {/* Hamburger Menu - shown only when content overflows */}
          <button
            type="button"
            className={`h-11 w-11 items-center justify-center text-secondary/90 transition-all duration-300 hover:text-pure-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/50 rounded-lg hover:bg-surface-base ${isCompact ? 'flex' : 'hidden'}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? (
              <svg className="h-5 w-5 transition-transform duration-300 rotate-0 hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="bg-canvas/80 border-t border-border">
          <div className="space-y-1 px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block rounded-xl px-4 py-3.5 text-[14px] font-light tracking-wide uppercase text-heading transition-all duration-300 hover:bg-white/10 hover:text-heading active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="relative">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            ))}

            <div className="space-y-3 pt-6 border-t border-border mt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
                    Hi, {user?.displayName?.split(' ')[0] || 'Alex'}
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsMenuOpen(false);
                      window.location.reload();
                    }}
                    className="w-full rounded-full bg-surface-base px-4 py-3 text-center text-sm text-foreground font-medium hover:bg-raised hover:text-pure-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <GlowPillButton
                    wrapperClassName="w-full"
                    className="w-full justify-center py-3.5 text-[12px] tracking-[0.15em]"
                  >
                    Get Started
                  </GlowPillButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
