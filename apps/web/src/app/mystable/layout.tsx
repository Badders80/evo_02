/**
 * MyStable route segment — inherits the site-wide dark theme (root layout
 * sets className="dark" on <html>). Per T9 follow-up 2026-09-08: lock to
 * dark for now; the [data-theme="light"] override is parked (light-console
 * experiment) and can be re-enabled by re-introducing the wrapper div.
 */
export default function MystableLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-background">{children}</div>;
}