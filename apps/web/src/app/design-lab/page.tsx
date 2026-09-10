'use client';

/**
 * /design-lab — FX catalogue for Pass 2 content sweep (founder tooling).
 *
 * THROWAWAY ROUTE: not linked anywhere, CUT before cutover (recorded in
 * build-loop/pass2-content-sweep.md). Every demo below uses the REAL
 * primitives/classes from the shipped build so what you see here is
 * exactly what ships on the surfaces you're about to KEEP/CUT.
 */

import React from 'react';
import { GlowPillButton } from '@/components/ui/GlowPillButton';

/* ---------- small helpers (local to lab only) ---------- */

function FX({
  id,
  name,
  where,
  note,
  children,
}: {
  id: string;
  name: string;
  where: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border border-border rounded-xl overflow-hidden bg-canvas/40">
      <header className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 border-b border-border bg-white/[0.015]">
        <h3 className="font-financial text-[13px] uppercase tracking-[0.2em] text-accent">{name}</h3>
        <code className="font-financial text-[11px] text-muted-foreground">{where}</code>
      </header>
      <div className="p-6">{children}</div>
      <footer className="px-5 pb-4 -mt-2">
        <p className="text-[13px] font-light text-muted-foreground">{note}</p>
      </footer>
    </section>
  );
}

/* nav-link replica (exact classes from NavBar.tsx:170-174) */
function NavTab({ label }: { label: string }) {
  return (
    <div className="group relative flex items-center">
      <span className="relative inline-flex items-center whitespace-nowrap px-2.5 py-4 text-[12px] font-[300] tracking-[0.15em] uppercase transition-all duration-300 rounded-sm text-foreground hover:text-heading cursor-pointer">
        <span className="relative z-10">{label}</span>
      </span>
      <span className="absolute bottom-2 left-2.5 right-2.5 h-[0.5px] origin-left scale-x-0 bg-accent transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100" />
    </div>
  );
}

/* text-sweep overlay (exact classes from HowItWorksSection.tsx:149 + DigitalSyndicationSection.tsx:145) */
function SweepText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-400 group-hover:ease-in-out transition-none" />
    </span>
  );
}

const howItWorksCards = [
  {
    title: 'Owners',
    subtitle: 'Own the horse, not just a dream.',
    description:
      'Transparent percentages, clean fractions, real cap-table entries. You always know exactly what you hold.',
  },
  {
    title: 'Investors & Fans',
    subtitle: 'Experience the thrill — without the hassle.',
    description:
      'Ownership, on your terms. Simplified terms and conditions give you the full thrill of ownership in a transparent, regulated marketplace — where risk and return are clear before you buy.',
  },
  {
    title: 'The Industry',
    subtitle: 'Strengthening racing from within.',
    description:
      'At Evolution Stables, we understand that ownership is the lifeblood of racing — and strengthening it benefits every part of the sport.',
  },
];

/* ---------- page ---------- */

export default function DesignLabPage() {
  return (
    <main className="dot-grid-surface min-h-screen bg-canvas text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
        {/* header */}
        <header className="space-y-3">
          <p className="font-financial text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Pass 2 · founder tooling · delete before cutover
          </p>
          <h1 className="text-4xl font-light tracking-tight text-heading">FX Lab — every effect in the build</h1>
          <p className="text-[15px] leading-[1.7] font-light text-muted-foreground">
            Hover or watch each item; the name + file path above it is what you quote back to me as KEEP / CUT / TONE-DOWN.
            Everything renders with the shipped primitives and tokens — nothing here is a re-implementation.
          </p>
          <p className="font-financial text-[12px] text-accent">
            Found while cataloguing: <code>animate-border-shimmer</code> (CtaLeadModal.tsx:214,233) has NO matching
            @keyframes in globals.css — that shimmer silently never plays. Flagged as FX-09.
          </p>
        </header>

        {/* ============ HOVER: BUTTONS ============ */}
        <FX
          id="fx-01"
          name="FX-01 · GlowPillButton (Get Started)"
          where="components/ui/GlowPillButton.tsx — NavBar, /login, mobile menu"
          note="Hover: whole pill grows scale-105, inner text grows scale-110, a soft white glow breathes in behind it, and a gold accent line expands from centre. Shimmer sweep runs continuously. This is the effect you feel on 'Get Started' in the nav."
        >
          <div className="flex flex-wrap items-center gap-6">
            <GlowPillButton>Get Started</GlowPillButton>
            <GlowPillButton shimmer={false}>Shimmer off</GlowPillButton>
            <GlowPillButton disabled>Disabled</GlowPillButton>
          </div>
        </FX>

        {/* ============ HOVER: NAV TABS ============ */}
        <FX
          id="fx-02"
          name="FX-02 · Nav tab hover (About / Mission / Model…)"
          where="components/NavBar.tsx:170-174"
          note="Hover a tab: text brightens (foreground → heading) and a thin gold underline sweeps in from the left (400ms). No size change on the tab itself — the growth you feel on hover is the GlowPillButton, not the tabs."
        >
          <div className="flex flex-wrap items-center gap-0 -mx-2.5 border border-border rounded-xl py-2 px-2">
            {['About', 'Mission', 'Model', 'Marketplace', 'MyStable', 'FAQ'].map((l) => (
              <NavTab key={l} label={l} />
            ))}
          </div>
        </FX>

        {/* ============ HOVER: NAV SHELL ============ */}
        <FX
          id="fx-03"
          name="FX-03 · Glass nav shell (transparent → solid)"
          where="components/NavBar.tsx:119-133 — scroll-triggered"
          note="The nav sits on a frosted glass bar (blur 32px + 160% saturation) with a gradient mask fading its bottom edge. Over the hero it is canvas/40; once you scroll past the hero an IntersectionObserver flips it to canvas/80. It also slides in 320ms after page load."
        >
          <div className="grid gap-3">
            <div className="rounded-xl border border-border px-6 py-5 text-[13px] uppercase tracking-[0.15em] text-heading bg-canvas/40" style={{ backdropFilter: 'blur(32px) saturate(160%)' }}>
              state A · bg-canvas/40 — over hero
            </div>
            <div className="rounded-xl border border-border px-6 py-5 text-[13px] uppercase tracking-[0.15em] text-heading bg-canvas/80" style={{ backdropFilter: 'blur(32px) saturate(160%)' }}>
              state B · bg-canvas/80 — scrolled
            </div>
          </div>
        </FX>

        {/* ============ HOVER: HOW-IT-WORKS CARDS ============ */}
        <FX
          id="fx-04"
          name="FX-04 · Card grow + text sweep + colour shift"
          where="components/sections/HowItWorksSection.tsx:135-175"
          note="TRIAL v2 (founder, 30 Aug): header hover = heading white → frost; body hover = muted grey → warm grey #b9b3a9 (not frost). Card still grows 1.02, border to steel, sweep still runs."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {howItWorksCards.map((card) => (
              <div
                key={card.title}
                className="group relative border border-border rounded-xl flex flex-col cursor-pointer transition-all duration-400 hover:border-steel-border hover:scale-[1.02] h-[340px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div className="p-6 border-b border-border h-[112px] flex flex-col justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">{card.title}</p>
                      <p className="text-[16px] font-light text-heading group-hover:text-frost transition-colors duration-500 leading-snug relative overflow-hidden">
                        <SweepText>{card.subtitle}</SweepText>
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:text-frost group-hover:border-steel-border transition-colors duration-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-6 relative overflow-hidden lg:flex-1 bg-canvas/40">
                  {/* TRIAL (FX-04): body hover = warm grey #b9b3a9 (candidate --color-warm-grey), not frost */}
                  <p className="text-[14px] leading-[1.8] font-light text-muted-foreground group-hover:text-[#b9b3a9] transition-colors duration-500">
                    {card.description}
                  </p>
                  <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                </div>
              </div>
            ))}
          </div>
        </FX>

        {/* ============ HOVER: BENEFIT ROWS ============ */}
        <FX
          id="fx-05"
          name="FX-05 · Benefit row grow + icon invert"
          where="components/sections/DigitalSyndicationSection.tsx:121-150"
          note="Hover a row: the whole row grows 1.05 (the largest grow in the build), the icon inverts to bright gold on hover, the heading gets the same one-way light sweep, and the description shifts to frost."
        >
          <div className="space-y-6 max-w-xl">
            {[
              { t: 'Fractional entry, real ownership', d: 'Clean lot fractions with cap-table entries — not points, not promises.' },
              { t: 'Transparent economics', d: 'Fees, prize split and monthly costs visible before you commit.' },
            ].map((b) => (
              <div key={b.t} className="group py-2 transition-transform duration-400 hover:scale-[1.05] cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center transition-all duration-400 group-hover:[filter:brightness(0)_saturate(100%)_invert(100%)]" style={{ filter: 'brightness(0) saturate(100%) invert(80%)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-[300] tracking-[0.05em] uppercase text-heading mb-3 relative overflow-hidden">
                      <SweepText>{b.t}</SweepText>
                    </h4>
                    <p className="text-[15px] leading-[1.6] font-light text-muted-foreground group-hover:text-frost transition-colors duration-400">{b.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FX>

        {/* ============ HOVER: MARKETPLACE TEASER ============ */}
        <FX
          id="fx-06"
          name="FX-06 · Gold line reveal (marketplace teaser)"
          where="components/sections/MarketplaceSection.tsx:116-177 — also on /marketplace"
          note="Hover a teaser row: a thin gold vertical line draws down the left edge (scale-y, 400ms) while icon and body text brighten. Same family as the nav underline, rotated 90°."
        >
          <div className="group relative pl-6 py-4 cursor-pointer max-w-xl border border-border rounded-xl bg-white/[0.015]">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-accent origin-center scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100" />
            <p className="text-[16px] font-light text-heading">Browse the marketplace</p>
            <p className="text-[15px] leading-[1.7] font-light text-muted-foreground transition-colors duration-500 group-hover:text-frost">
              Available, coming-soon and completed campaigns — straight from the live inventory.
            </p>
          </div>
        </FX>

        {/* ============ HOVER: FAQ ============ */}
        <FX
          id="fx-07"
          name="FX-07 · FAQ question colour shift"
          where="components/sections/FAQSection.tsx:148-157"
          note="Hover a question: the row label brightens to white and the marker glyph turns gold. No size change — this is the quietest hover in the build."
        >
          <div className="group flex items-center gap-4 cursor-pointer max-w-xl py-3">
            <span className="font-financial text-accent text-[18px] transition-colors duration-300 group-hover:text-accent">+</span>
            <span className="text-[15px] font-light text-muted-foreground transition-colors duration-300 group-hover:text-white">
              How do distributions reach my account?
            </span>
          </div>
        </FX>

        {/* ============ HOVER: CTA MODAL ============ */}
        <FX
          id="fx-09"
          name="FX-09 · CTA modal button grow (shimmer is DEAD)"
          where="components/CtaLeadModal.tsx:214-233"
          note="Hover the submit: grows 1.03 with border brightening — alive. But the animated border-shimmer layer behind it references a keyframe that was never defined, so the shimmer part of this button silently never plays anywhere on the site. Founder call: define the keyframe or delete the dead class."
        >
          <div className="relative">
            <button className="relative w-full cursor-pointer overflow-hidden rounded-full border border-border bg-surface-base px-6 py-2.5 text-[11px] font-light uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/40 max-w-xs">
              Request Access
            </button>
            <div className="h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-xl animate-border-shimmer absolute inset-y-0 left-0 pointer-events-none opacity-0" />
          </div>
        </FX>

        {/* ============ AMBIENT ============ */}
        <FX
          id="fx-10"
          name="FX-10 · Ambient animations (always playing)"
          where="app/globals.css:256-291 — hero, TypeWriter, logo carousel"
          note="No hover needed: the shimmer sweep (2s loop) rides the GlowPillButtons; the cursor blink (1s) rides the hero TypeWriter tagline; the logo marquee scrolls the partner/press strip; hero logo and tagline fade-rise in staggered at 0.85s/1.05s after load; sections fade in 0.8s."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">cursor-blink (TypeWriter)</p>
              <p className="text-[18px] font-light text-heading">
                Ownership, reinvented<span className="animate-cursor-blink text-accent">|</span>
              </p>
            </div>
            <div className="rounded-xl border border-border p-5 overflow-hidden">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">fade-in</p>
              <p className="animate-fade-in text-[15px] font-light text-muted-foreground">Sections fade up 0.8s ease-out when they enter.</p>
            </div>
            <div className="rounded-xl border border-border p-5 sm:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">hero entrance (staggered)</p>
              <div className="space-y-2">
                <p className="animate-hero-logo text-2xl font-light text-heading">Evolution Stables</p>
                <p className="animate-hero-tagline text-[15px] font-light text-muted-foreground">Digital racehorse ownership.</p>
              </div>
            </div>
          </div>
        </FX>

        {/* ============ TEXTURES ============ */}
        <FX
          id="fx-11"
          name="FX-11 · Textures (dot-grid · film grain · glass-streak · masked-border)"
          where="app/globals.css:192-253"
          note="The page canvas carries a 3%-opacity film grain everywhere (SVG noise, body::after) — that subtle 'print' feel. Panels sit on a dot-grid (3% white, 24px pitch). glass-streak: hover the left card for a skewed light streak crossing it. masked-border paints a corner-lit gradient border. Text selection is gold."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="glass-streak dot-grid-surface rounded-xl border border-border p-6 cursor-pointer">
              <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground">glass-streak — hover me</p>
            </div>
            <div className="masked-border rounded-xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground">masked-border</p>
            </div>
            <div className="sm:col-span-2 rounded-xl border border-border p-6">
              <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground mb-2">selection — try dragging over this line</p>
              <p className="text-[15px] font-light">The gold selection colour is part of the brand surface.</p>
            </div>
          </div>
        </FX>

        {/* ============ LIGHT SCOPE ============ */}
        <FX
          id="fx-12"
          name="FX-12 · Dark → light scope transition (MyStable)"
          where="apps/web/src/app/mystable/layout.tsx — data-theme=light"
          note="MyStable flips the whole console into the light x.ai-style scope: same tokens, light values, with a 300ms colour transition so the shell 'arrives' rather than snapping. The box below is that light scope, embedded."
        >
          <div data-theme="light" className="rounded-xl border border-border p-6 bg-canvas text-foreground transition-all duration-300">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">MyStable light console scope</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-wider text-foreground">KYC verified</span>
              <span className="font-financial text-[14px]">2.0% · $760.00 float · $76.00/mo</span>
            </div>
          </div>
        </FX>

        {/* ============ FINANCIAL TYPOGRAPHY ============ */}
        <FX
          id="fx-13"
          name="FX-13 · Financial typography (monospace tabular)"
          where="app/globals.css:293-297 — pricing card, cap table, mystable"
          note="Every money/share figure renders in monospace with tabular numerals so columns of dollars and percentages stay perfectly aligned. Quiet, but it's why the numbers 'sit still'."
        >
          <div className="rounded-xl border border-border p-6 space-y-2">
            {[
              ['Lot 1.0%', 'NZ$ 760.00 upfront'],
              ['Lot 2.0%', 'NZ$ 1,520.00 upfront'],
              ['Monthly', 'NZ$ 76.00'],
            ].map(([a, b]) => (
              <div key={a} className="flex justify-between max-w-md">
                <span className="font-financial text-[14px] text-muted-foreground">{a}</span>
                <span className="font-financial text-[14px] text-heading">{b}</span>
              </div>
            ))}
          </div>
        </FX>

        {/* ============ CHEAT-SHEET ============ */}
        <section className="border border-accent/30 rounded-xl overflow-hidden">
          <header className="px-5 py-3 border-b border-border bg-white/[0.015]">
            <h2 className="font-financial text-[13px] uppercase tracking-[0.2em] text-accent">Quote-back cheat sheet</h2>
          </header>
          <div className="p-5">
            <table className="w-full text-[13px] font-light">
              <tbody className="divide-y divide-border">
                {[
                  ['FX-01', 'Get Started pill: grow + glow + gold line + shimmer', 'NavBar, /login'],
                  ['FX-02', 'Nav tab: brighten + gold underline sweep', 'NavBar'],
                  ['FX-03', 'Glass nav: blur + transparent→solid on scroll', 'NavBar'],
                  ['FX-04', 'Card grow 1.02 + text sweep + frost shift', 'How It Works'],
                  ['FX-05', 'Row grow 1.05 + icon invert + sweep', 'Digital Syndication'],
                  ['FX-06', 'Gold line reveal down left edge', 'Marketplace teaser + /marketplace'],
                  ['FX-07', 'FAQ label brighten + gold marker', 'FAQ'],
                  ['FX-09', 'CTA grow 1.03 · shimmer layer DEAD', 'Lead modal'],
                  ['FX-10', 'Ambient: shimmer loop, cursor blink, marquee, staggered hero, fade-in', 'Hero, press strip'],
                  ['FX-11', 'Textures: film grain, dot-grid, glass-streak, masked border, gold selection', 'Global canvas'],
                  ['FX-12', 'Dark→light scope transition 300ms', 'MyStable'],
                  ['FX-13', 'Monospace tabular financials', 'Pricing, cap table, mystable'],
                ].map(([id, what, where]) => (
                  <tr key={id}>
                    <td className="py-2 pr-3 font-financial text-accent whitespace-nowrap">{id}</td>
                    <td className="py-2 pr-3">{what}</td>
                    <td className="py-2 text-muted-foreground whitespace-nowrap">{where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}