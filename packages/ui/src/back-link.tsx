import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from './cn';

/**
 * BackLink — left-chevron return link (style guide P3).
 * Canonical: inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors
 * Evidence: apps/web/src/app/marketplace/[slug]/page.tsx:148, apps/web/src/app/terms/page.tsx:16
 * Locked in format-pass F14/F17.
 */
export function BackLink({
  href = '#',
  className,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors',
        className
      )}
      {...rest}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {children}
    </a>
  );
}
