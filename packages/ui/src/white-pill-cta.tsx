import * as React from 'react';
import { cn } from './cn';

/**
 * WhitePillCTA — primary white pill button (style guide P6a).
 * Canonical: flex w-full items-center justify-center gap-2 rounded-full bg-pure-white
 * px-8 py-3 text-base font-bold tracking-wide text-black transition-colors hover:bg-white/90
 * Evidence: apps/web/src/components/horse/right-rail.tsx:240 ("Become an Owner →")
 */
export function WhitePillCTA({
  className,
  type = 'button',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-full bg-pure-white px-8 py-3 text-base font-bold tracking-wide text-black transition-colors hover:bg-white/90',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
