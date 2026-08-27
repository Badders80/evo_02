import type { Metadata } from 'next';

/**
 * MyStable route segment — LIGHT CONSOLE scope.
 *
 * Site shell stays dark+gold (root layout); this wrapper flips the same
 * semantic tokens to their light values via [data-theme="light"] (see
 * globals.css). ~300ms colour transition makes the dark→light shift feel
 * like crossing a threshold into the owner console (x.ai patterns apply
 * here at full fidelity — light theme, dense monospace data).
 */
export default function MystableLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="light" className="min-h-full bg-background">
      {children}
    </div>
  );
}