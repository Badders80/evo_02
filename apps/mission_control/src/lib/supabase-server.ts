import { createClient } from '@supabase/supabase-js';
import type { Database } from '@evo/db_models/types';

export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient<Database, 'public'>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
