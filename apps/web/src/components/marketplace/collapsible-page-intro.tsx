'use client';

import * as React from 'react';

/**
 * CollapsiblePageIntro — one-time hero intro (founder 2026-09-12).
 * Shows "Ownership, evolved." on arrival; once the user scrolls past it,
 * it collapses and the breadcrumb becomes the top of the page. Scrolling
 * back up does NOT bring it back — it only resets when the component
 * remounts (i.e. a route change to a different horse).
 *
 * Scroll-jump fix (founder feedback 2026-09-12: "rail holds, then moves
 * ~2 inches"): collapsing the intro removes ~400px of height ABOVE the
 * content, so mid-scroll everything below jumps up. Fix: when the collapse
 * fires, compensate the window scroll by the removed height so the viewport
 * stays visually anchored on the same content. The page height change
 * becomes invisible; the intro just "yields".
 */
export function CollapsiblePageIntro({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = React.useState(false);
  const hiddenRef = React.useRef(false);

  React.useEffect(() => {
    const HIDE_AFTER_PX = 200;
    const onScroll = () => {
      if (!hiddenRef.current && window.scrollY > HIDE_AFTER_PX) {
        hiddenRef.current = true;
        // Measure what we're about to remove, collapse, then restore the
        // anchor so the content the user is looking at does not shift.
        const removed = ref.current?.offsetHeight ?? 0;
        setHidden(true);
        window.removeEventListener('scroll', onScroll);
        requestAnimationFrame(() => {
          window.scrollTo({ top: Math.max(0, window.scrollY - removed), behavior: 'auto' });
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      aria-hidden={hidden}
      className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
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