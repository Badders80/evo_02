'use client';

import * as React from 'react';

/**
 * CollapsiblePageIntro — one-time hero intro (founder 2026-09-12).
 * Shows "Ownership, evolved." on arrival; once scrolled fully past, it is
 * removed from flow and the breadcrumb becomes the top of the page. Scrolling
 * back up does NOT bring it back — it only resets when the component remounts
 * (i.e. a route change to a different horse).
 *
 * Sticky-rail contract (founder 2026-09-12: "once locked, it's global — not
 * per section"): the horse-page investment rail pins at top-28 and must NEVER
 * release. The previous version collapsed the intro MID-VIEWPORT (trigger at
 * 200px + 500ms animated height removal + one-shot scrollTo compensation).
 * With the intro ~400px tall, the compensation clamped scrollY back toward 0 —
 * throwing the viewport above the rail's pin line mid-scroll, so a globally
 * sticky rail visibly un-pinned and travelled as THE STORY became the top.
 *
 * Fix: the collapse fires only when the intro is ENTIRELY above the viewport
 * top (scrollY >= intro height). At that moment nothing visible is above the
 * viewport top, so the removal is invisible. NO manual scrollTo runs at all:
 * Chrome's scroll anchoring re-anchors scrollY by exactly the removed height
 * in the same frame (verified live — the old manual compensation double-
 * compensated on top of the browser's and threw the viewport to 0, which is
 * what un-pinned the sticky rail). Post-collapse the rail's pin threshold has
 * dropped by exactly the removed height, matching the re-anchored scrollY 1:1
 * — if the rail was pinned before the collapse it is STILL pinned after it.
 * The rail's own sticky (self-stretch wrapper, full-grid range) then holds
 * across every left-column section.
 */
export function CollapsiblePageIntro({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = React.useState(false);
  const hiddenRef = React.useRef(false);
  const removedRef = React.useRef(0);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (hiddenRef.current) return;
      const height = ref.current?.offsetHeight ?? 0;
      if (height > 0 && window.scrollY >= height) {
        hiddenRef.current = true;
        removedRef.current = height;
        window.removeEventListener('scroll', onScroll);
        setHidden(true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // NO manual scrollTo here. Chrome's scroll anchoring already keeps the
  // viewport anchored when content above it shrinks (verified live: after the
  // commit, scrollY had already been re-anchored to scrollY - removed by the
  // browser before this effect ran — the old manual scrollTo double-compensated
  // and threw the viewport to 0, un-pinning the sticky rail). We only mark the
  // removal; the browser does the anchor math in the same frame.
  React.useLayoutEffect(() => {
    if (hidden && process.env.NODE_ENV !== 'production') {
      // dev-only breadcrumb for the flow audits
      console.debug('[intro] collapsed; browser scroll anchoring handled the shift');
    }
  }, [hidden]);

  return (
    <div
      ref={ref}
      aria-hidden={hidden}
      className="grid"
      style={{
        gridTemplateRows: hidden ? '0fr' : '1fr',
        opacity: hidden ? 0 : 1,
        visibility: hidden ? 'hidden' : 'visible',
      }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}