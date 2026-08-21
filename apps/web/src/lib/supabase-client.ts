/**
 * Browser-safe Supabase client for apps/web.
 * Uses @supabase/ssr cookie-based session handling.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@evo/db_models/types';

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient<Database>(url, key);
}
