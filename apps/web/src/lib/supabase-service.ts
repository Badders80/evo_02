import { createClient } from '@supabase/supabase-js';
import type { Database } from '@evo/db_models/types';

/**
 * Service role client for privileged backend operations (bypasses RLS).
 * SAFE to import from Client Components — no next/headers dependency.
 * NEVER expose this or call from browser.
 */
export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
