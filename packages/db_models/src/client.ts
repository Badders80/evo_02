import {
  createClient,
  SupabaseClient,
  type PostgrestError,
  type AuthError,
  type User,
  type Session,
} from '@supabase/supabase-js';
import type { Database } from './types/database.types';

export type { PostgrestError, AuthError, User, Session, SupabaseClient };
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a public / client-side Supabase client for browser or anonymous requests.
 */
export function createSupabaseBrowserClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Creates an admin / service-role Supabase client for backend operations, webhooks, and migrations.
 * WARNING: Never expose the service role key to the browser!
 */
export function createSupabaseAdminClient(
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * DSL Mathematical Enforcers (Authority: evo_00/doc/DSL_MANUAL.md)
 */

/**
 * Calculates list price from underlying monthly cost.
 * Formula: CEIL(cost * 1.05 * 1.03) -> 5% margin + 3% processing fee.
 */
export function calculateListPrice(costMonthlyNzd: number): number {
  return Math.ceil(costMonthlyNzd * 1.05 * 1.03);
}

/**
 * Calculates 1% micro-share monthly keep rate ($M).
 * Formula: CEIL(list_price * 0.01)
 */
export function calculateMonthlyKeepUnit(listPriceNzd: number): number {
  return Math.ceil(listPriceNzd * 0.01);
}

/**
 * Calculates join float deposit ($5×M).
 * Formula: 5 * monthly_keep_unit
 */
export function calculateJoinFloatUnit(monthlyKeepUnitNzd: number): number {
  return 5 * monthlyKeepUnitNzd;
}

/**
 * Calculates gross stakes investor pool payout.
 * Formula: gross_stakes * 0.75 (Owner absorbs 25% fees)
 * Uses exact decimal conversion to prevent floating point representation drift.
 */
export function calculateInvestorPool(grossStakesNzd: number): number {
  return Math.round(grossStakesNzd * 75) / 100;
}
