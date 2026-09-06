import * as React from 'react';
import { cn } from './cn';

/**
 * ModalShell — overlay + panel wrapper for centered modal dialogs (style guide P12).
 * Canonical: fixed inset-0 overlay (bg-black/85 backdrop-blur-md z-[999]), panel
 * max-w-lg × h-[900px] clamped to viewport, locked shadow stack, overlay-click +
 * Escape key both call onClose. Panel stops propagation. Close button absolute
 * top-4 right-4 with aria-label="Close". Body scroll lock is NOT applied —
 * slices add it if they need it (deliberate carve-out).
 * Evidence: apps/web/src/components/horse/purchase-flow-modal.tsx:51-83
 */
export interface ModalShellProps {
  children: React.ReactNode;
  onClose: () => void;
  /** Future-proof only; not rendered as aria-label in this chunk. */
  ariaLabel?: string;
  className?: string;
}

export function ModalShell({ children, onClose, className }: ModalShellProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-lg h-[900px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-border bg-surface p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-xl text-muted-foreground transition-colors hover:text-heading"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}