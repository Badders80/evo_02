import * as React from 'react';
import { cn } from './cn';

/**
 * Eyebrow — gold section label (style guide P1).
 * Canonical: text-gold text-[11px] font-medium uppercase tracking-[0.2em]
 * Evidence: apps/web/src/components/horse/right-rail.tsx:174
 */
export function Eyebrow({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-gold text-[11px] font-medium uppercase tracking-[0.2em]', className)} {...rest}>
      {children}
    </p>
  );
}
