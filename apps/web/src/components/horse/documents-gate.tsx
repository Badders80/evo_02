'use client';

/* DocumentsGate — client wrapper for the documents tab guest-blur.
 *
 * The horse page is a server component; DocumentsTab needs the live auth
 * state to decide guest-blur vs investor download links. This wrapper reads
 * the Supabase session via useAuth() and forwards isInvestor.
 *
 * Guest → blurred PDS/SA cards + "Restricted: Investors Only" overlay
 * (prod pattern, founder-answered). Signed-in user → live download links.
 */

import * as React from 'react';
import { useAuth } from '@/lib/use-auth';
import { DocumentsTab } from './documents-tab';

export function DocumentsGate({ horseSlug, pdsUrl, saUrl }: {
  horseSlug: string;
  pdsUrl?: string;
  saUrl?: string;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-6 w-2/3 rounded bg-white/5" />
        <div className="h-16 rounded-xl border border-border bg-card/50" />
        <div className="h-16 rounded-xl border border-border bg-card/50" />
      </div>
    );
  }

  return (
    <DocumentsTab
      horseSlug={horseSlug}
      pdsUrl={pdsUrl}
      saUrl={saUrl}
      isInvestor={Boolean(user)}
    />
  );
}

export default DocumentsGate;