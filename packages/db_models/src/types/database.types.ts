/**
 * Evolution Stables (Evolution-3.0) Supabase TypeScript Definitions
 * Canonical Authority: evo_00/migration_bridge/02_DATA_MAPPING.md & evo_00/doc/DSL_MANUAL.md
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStyle =
  | 'subscription_float'
  | 'upfront';

export type CampaignStatus =
  | 'draft'
  | 'coming_soon'
  | 'coming_soon_details'
  | 'listed'
  | 'fully_subscribed'
  | 'completed';

export type CloseStyle =
  | 'fourteen_day'
  | 'three_x_remaining';

export type KycStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected';

export type HoldingStatus =
  | 'active'
  | 'paused'
  | 'exiting'
  | 'cancelled'
  | 'settled';

export type DistributionStatus =
  | 'pending'
  | 'carried_forward'
  | 'distributed';

export type ReservationStatus =
  | 'active'
  | 'consumed'
  | 'released'
  | 'expired';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          kyc_status: KycStatus;
          kyc_verified_at: string | null;
          stripe_customer_id: string | null;
          stripe_verification_session_id: string | null;
          kyc_audit_digest: string | null;
          nztr_license_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          kyc_status?: KycStatus;
          kyc_verified_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_verification_session_id?: string | null;
          kyc_audit_digest?: string | null;
          nztr_license_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          kyc_status?: KycStatus;
          kyc_verified_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_verification_session_id?: string | null;
          kyc_audit_digest?: string | null;
          nztr_license_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          slug: string;
          legal_name: string;
          barn_name: string;
          sire: string;
          dam: string;
          trainer_name: string;
          trainer_location: string;
          cost_monthly_nzd: number;
          list_price_nzd: number;
          monthly_keep_unit_nzd: number;
          join_float_unit_nzd: number;
          listed_stake_pct: number;
          min_stake_pct: number;
          stake_step_pct: number;
          total_shares: number;
          shares_available: number;
          reserved_shares: number;
          status: CampaignStatus;
          close_style: CloseStyle;
          payment_style: PaymentStyle;
          listing_platform: 'evolution' | 'tokinvest' | string;
          hero_image_url: string;
          pedigree_image_url: string | null;
          pds_hash: string;
          sa_hash: string;
          pds_url: string;
          sa_url: string;
          soft_legal?: Json | null;
          marketing?: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          legal_name: string;
          barn_name: string;
          sire: string;
          dam: string;
          trainer_name: string;
          trainer_location: string;
          cost_monthly_nzd: number;
          list_price_nzd: number;
          monthly_keep_unit_nzd: number;
          join_float_unit_nzd: number;
          listed_stake_pct: number;
          min_stake_pct: number;
          stake_step_pct: number;
          total_shares?: number;
          shares_available?: number;
          reserved_shares?: number;
          status?: CampaignStatus;
          close_style?: CloseStyle;
          payment_style?: PaymentStyle;
          listing_platform?: 'evolution' | 'tokinvest' | string;
          hero_image_url: string;
          pedigree_image_url?: string | null;
          pds_hash: string;
          sa_hash: string;
          pds_url: string;
          sa_url: string;
          soft_legal?: Json | null;
          marketing?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          legal_name?: string;
          barn_name?: string;
          sire?: string;
          dam?: string;
          trainer_name?: string;
          trainer_location?: string;
          cost_monthly_nzd?: number;
          list_price_nzd?: number;
          monthly_keep_unit_nzd?: number;
          join_float_unit_nzd?: number;
          listed_stake_pct?: number;
          min_stake_pct?: number;
          stake_step_pct?: number;
          total_shares?: number;
          shares_available?: number;
          reserved_shares?: number;
          status?: CampaignStatus;
          close_style?: CloseStyle;
          payment_style?: PaymentStyle;
          listing_platform?: 'evolution' | 'tokinvest' | string;
          hero_image_url?: string;
          pedigree_image_url?: string | null;
          pds_hash?: string;
          sa_hash?: string;
          pds_url?: string;
          sa_url?: string;
          soft_legal?: Json | null;
          marketing?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      checkout_reservations: {
        Row: {
          id: string;
          inventory_id: string;
          user_id: string;
          units: number;
          status: ReservationStatus;
          expires_at: string;
          stripe_checkout_session_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          inventory_id: string;
          user_id: string;
          units: number;
          status?: ReservationStatus;
          expires_at: string;
          stripe_checkout_session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inventory_id?: string;
          user_id?: string;
          units?: number;
          status?: ReservationStatus;
          expires_at?: string;
          stripe_checkout_session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      holdings: {
        Row: {
          id: string;
          user_id: string;
          horse_id: string;
          stake_percentage: number;
          float_months_held: number;
          float_balance_nzd: number;
          monthly_keep_rate_nzd: number;
          stripe_subscription_id: string | null;
          status: HoldingStatus;
          signed_pds_hash: string;
          signed_sa_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          horse_id: string;
          stake_percentage: number;
          float_months_held?: number;
          float_balance_nzd: number;
          monthly_keep_rate_nzd: number;
          stripe_subscription_id?: string | null;
          status?: HoldingStatus;
          signed_pds_hash: string;
          signed_sa_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          horse_id?: string;
          stake_percentage?: number;
          float_months_held?: number;
          float_balance_nzd?: number;
          monthly_keep_rate_nzd?: number;
          stripe_subscription_id?: string | null;
          status?: HoldingStatus;
          signed_pds_hash?: string;
          signed_sa_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      race_results: {
        Row: {
          id: string;
          horse_id: string;
          race_date: string;
          track: string;
          race_name: string;
          placing: number;
          gross_stakes_nzd: number;
          investor_pool_nzd: number;
          quarter: string;
          distribution_status: DistributionStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          horse_id: string;
          race_date: string;
          track: string;
          race_name: string;
          placing: number;
          gross_stakes_nzd: number;
          investor_pool_nzd: number;
          quarter: string;
          distribution_status?: DistributionStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          horse_id?: string;
          race_date?: string;
          track?: string;
          race_name?: string;
          placing?: number;
          gross_stakes_nzd?: number;
          investor_pool_nzd?: number;
          quarter?: string;
          distribution_status?: DistributionStatus;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          stripe_event_id: string | null;
          operator_id: string | null;
          event_type: string;
          payload: Json;
          processed: boolean;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stripe_event_id?: string | null;
          operator_id?: string | null;
          event_type: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stripe_event_id?: string | null;
          operator_id?: string | null;
          event_type?: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      reserve_campaign_shares: {
        Args: {
          p_inventory_id: string;
          p_user_id: string;
          p_units: number;
          p_ttl_minutes?: number;
          p_stripe_session_id?: string | null;
        };
        Returns: Json;
      };
      release_expired_reservations: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      campaign_status: CampaignStatus;
      close_style: CloseStyle;
      kyc_status: KycStatus;
      holding_status: HoldingStatus;
      distribution_status: DistributionStatus;
      reservation_status: ReservationStatus;
      payment_style: PaymentStyle;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type InventoryHorse = Tables<'inventory'>;
export type CheckoutReservation = Tables<'checkout_reservations'>;
export type Holding = Tables<'holdings'>;
export type RaceResult = Tables<'race_results'>;
export type SystemEvent = Tables<'events'>;
