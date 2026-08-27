"use client";

import React, { useState } from "react";

/**
 * Accordion panel with CSS grid-rows height animation.
 * Drop-in replacement for the framer-motion AnimatePresence block
 * used in evo_01's FAQSection (avoids the framer dependency).
 */
export function CollapsePanel({
  open,
  id,
  children,
}: {
  open: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (open && ref.current) setMaxH(ref.current.scrollHeight);
  }, [open]);

  return (
    <div
      id={id}
      ref={ref}
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        maxHeight: open ? (maxH ?? undefined) : 0,
      }}
      aria-hidden={!open}
    >
      <div className="min-h-0">{children}</div>
    </div>
  );
}

/** Convenience hook matching the isOpen/toggle pattern used by FAQ sections. */
export function useCollapse(initial = false) {
  const [open, setOpen] = useState(initial);
  const toggle = React.useCallback(() => setOpen((v: boolean) => !v), []);
  return { open, toggle };
}