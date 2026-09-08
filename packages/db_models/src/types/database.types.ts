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

export interface RaceLogEntry {
  date: string;
  venue: string;
  race: string;
  trackCondition?: string;
  result?: string;
  margin?: string;
  distance_m?: number;
  race_class?: string;
  jockey?: string;
  prizemoney_nzd?: number;
  starting_price?: string;
}

export interface PedigreeLine {
  name: string;
  country?: string;
  year?: string;
  partner?: {
    name: string;
    country?: string;
    year?: string;
  };
}

export interface PedigreeData {
  // Keys match the actual jsonb payload (snake_case, verified against local DB)
  sire?: string;
  dam?: string;
  dam_sire?: string;
  lineage_summary?: string;
  foaling_date?: string;
  foaling_year?: number;
  gender?: string;
  colour?: string;
  breeder?: string;
  microchip?: string;
  life_number?: string;
  stud_book_url?: string;

  // 4-gen migration fields (nullable runtime fallback)
  sire_line?: PedigreeLine[];
  dam_line?: PedigreeLine[];
  cross_line?: unknown;
  // DB payload key is loverracing_id (double-r; matches live jsonb — verified 2026-08-30)
  loverracing_id?: number;
  loveracing_id?: number;
  performance_profile_url?: string;
  family_number?: string;
  verified?: boolean;
  verified_at?: string;
}

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

export type DslDocStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected';

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
        Relationships: [];
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
          listing_platform: string;
          hero_image_url: string;
          pedigree_image_url: string | null;
          pds_hash: string;
          sa_hash: string;
          pds_url: string;
          sa_url: string;
          term_start_date: string | null;
          term_end_date: string | null;
          distribution_split: string | null;
          distribution_schedule: string | null;
          term_sheet_status: DslDocStatus;
          pds_status: DslDocStatus;
          sa_status: DslDocStatus;
          term_sheet_locked_at: string | null;
          pds_locked_at: string | null;
          sa_locked_at: string | null;
          pedigree_data: PedigreeData | null;
          soft_legal?: Json | null;
          marketing?: Json | null;
          created_at: string;
          updated_at: string;
          race_log?: RaceLogEntry[];
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
          listing_platform?: string;
          hero_image_url: string;
          pedigree_image_url?: string | null;
          pds_hash: string;
          sa_hash: string;
          pds_url: string;
          sa_url: string;
          term_start_date?: string | null;
          term_end_date?: string | null;
          distribution_split?: string | null;
          distribution_schedule?: string | null;
          term_sheet_status?: DslDocStatus;
          pds_status?: DslDocStatus;
          sa_status?: DslDocStatus;
          term_sheet_locked_at?: string | null;
          pds_locked_at?: string | null;
          sa_locked_at?: string | null;
          pedigree_data?: PedigreeData | null;
          soft_legal?: Json | null;
          marketing?: Json | null;
          created_at?: string;
          updated_at?: string;
          race_log?: RaceLogEntry[];
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
          listing_platform?: string;
          hero_image_url?: string;
          pedigree_image_url?: string | null;
          pds_hash?: string;
          sa_hash?: string;
          pds_url?: string;
          sa_url?: string;
          term_start_date?: string | null;
          term_end_date?: string | null;
          distribution_split?: string | null;
          distribution_schedule?: string | null;
          term_sheet_status?: DslDocStatus;
          pds_status?: DslDocStatus;
          sa_status?: DslDocStatus;
          term_sheet_locked_at?: string | null;
          pds_locked_at?: string | null;
          sa_locked_at?: string | null;
          pedigree_data?: PedigreeData | null;
          soft_legal?: Json | null;
          marketing?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
      leads: {
        Row: {
          id: string;
          user_email: string;
          user_name: string | null;
          horse_slug: string | null;
          action_type: string;
          utm_source: string | null;
          utm_campaign: string | null;
          referrer_url: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          user_name?: string | null;
          horse_slug?: string | null;
          action_type?: string;
          utm_source?: string | null;
          utm_campaign?: string | null;
          referrer_url?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          user_email?: string;
          horse_slug?: string | null;
          action_type?: string;
          utm_source?: string | null;
          utm_campaign?: string | null;
          referrer_url?: string | null;
          status?: string;
        };
        Relationships: [];
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
      consume_campaign_reservation: {
        Args: {
          p_inventory_id: string;
          p_user_id: string;
          p_reservation_id: string;
        };
        Returns: Json;
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
