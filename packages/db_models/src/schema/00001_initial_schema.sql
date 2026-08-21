-- ==============================================================================
-- Evolution Stables (Evolution-3.0) PostgreSQL Schema & RLS Policies
-- Target: Supabase PostgreSQL
-- Authority: evo_00/doc/DSL_MANUAL.md & evo_00/migration_bridge/02_DATA_MAPPING.md
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE payment_style AS ENUM (
        'subscription_float',
        'upfront'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM (
        'draft',
        'coming_soon',
        'coming_soon_details',
        'listed',
        'fully_subscribed',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE close_style AS ENUM (
        'fourteen_day',
        'three_x_remaining'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM (
        'unverified',
        'pending',
        'verified',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE holding_status AS ENUM (
        'active',
        'paused',
        'exiting',
        'cancelled',
        'settled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE distribution_status AS ENUM (
        'pending',
        'carried_forward',
        'distributed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TRIGGER HELPER: updated_at
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ------------------------------------------------------------------------------
-- 3. TABLE: profiles (Investors & App Users)
-- 1:1 mapped to Supabase Auth UUID (auth.users)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    kyc_status kyc_status NOT NULL DEFAULT 'unverified',
    kyc_verified_at TIMESTAMPTZ,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. TABLE: inventory (Thoroughbred Campaigns & DSL Catalogue)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    legal_name TEXT NOT NULL,
    barn_name TEXT NOT NULL,
    sire TEXT NOT NULL,
    dam TEXT NOT NULL,
    trainer_name TEXT NOT NULL,
    trainer_location TEXT NOT NULL,
    cost_monthly_nzd NUMERIC(10,2) NOT NULL CHECK (cost_monthly_nzd > 0),
    list_price_nzd NUMERIC(10,2) NOT NULL CHECK (list_price_nzd > 0),
    monthly_keep_unit_nzd NUMERIC(10,2) NOT NULL CHECK (monthly_keep_unit_nzd > 0),
    join_float_unit_nzd NUMERIC(10,2) NOT NULL CHECK (join_float_unit_nzd > 0),
    listed_stake_pct NUMERIC(5,2) NOT NULL CHECK (listed_stake_pct > 0 AND listed_stake_pct <= 100),
    min_stake_pct NUMERIC(5,2) NOT NULL CHECK (min_stake_pct > 0 AND min_stake_pct <= listed_stake_pct),
    stake_step_pct NUMERIC(5,2) NOT NULL CHECK (stake_step_pct > 0 AND stake_step_pct <= listed_stake_pct),
    total_shares NUMERIC(5,2) NOT NULL CHECK (total_shares = round(listed_stake_pct / stake_step_pct, 2) AND total_shares > 0 AND total_shares <= 100),
    shares_available NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (shares_available >= 0 AND shares_available <= total_shares),
    reserved_shares NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (reserved_shares >= 0 AND reserved_shares <= total_shares),
    status campaign_status NOT NULL DEFAULT 'draft',
    close_style close_style NOT NULL DEFAULT 'fourteen_day',
    payment_style payment_style NOT NULL DEFAULT 'subscription_float',
    listing_platform TEXT NOT NULL DEFAULT 'evolution',
    hero_image_url TEXT NOT NULL,
    pedigree_image_url TEXT,
    pds_hash TEXT NOT NULL,
    sa_hash TEXT NOT NULL,
    pds_url TEXT NOT NULL,
    sa_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_slug ON public.inventory(slug);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);

DROP TRIGGER IF EXISTS tr_inventory_updated_at ON public.inventory;
CREATE TRIGGER tr_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. TABLE: holdings (Active DSL Subscriptions & Micro-Shares)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    horse_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE RESTRICT,
    stake_percentage NUMERIC(5,2) NOT NULL CHECK (stake_percentage > 0 AND stake_percentage <= 100),
    float_months_held NUMERIC(4,2) NOT NULL DEFAULT 5.0 CHECK (float_months_held >= 0),
    float_balance_nzd NUMERIC(10,2) NOT NULL CHECK (float_balance_nzd >= 0),
    monthly_keep_rate_nzd NUMERIC(10,2) NOT NULL CHECK (monthly_keep_rate_nzd >= 0),
    stripe_subscription_id TEXT UNIQUE,
    status holding_status NOT NULL DEFAULT 'active',
    signed_pds_hash TEXT NOT NULL,
    signed_sa_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON public.holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_horse_id ON public.holdings(horse_id);
CREATE INDEX IF NOT EXISTS idx_holdings_stripe_sub ON public.holdings(stripe_subscription_id);

-- Enforce maximum of ONE active holding subscription per user-horse pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_holding 
    ON public.holdings(user_id, horse_id) 
    WHERE status = 'active';

DROP TRIGGER IF EXISTS tr_holdings_updated_at ON public.holdings;
CREATE TRIGGER tr_holdings_updated_at
    BEFORE UPDATE ON public.holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. TABLE: race_results (Official Gross Stakes & Distribution Ledger)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.race_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    horse_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    race_date DATE NOT NULL,
    track TEXT NOT NULL,
    race_name TEXT NOT NULL,
    placing INTEGER NOT NULL CHECK (placing >= 1),
    gross_stakes_nzd NUMERIC(12,2) NOT NULL CHECK (gross_stakes_nzd >= 0),
    investor_pool_nzd NUMERIC(12,2) NOT NULL CHECK (investor_pool_nzd >= 0),
    quarter TEXT NOT NULL,
    distribution_status distribution_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_race_results_horse ON public.race_results(horse_id);
CREATE INDEX IF NOT EXISTS idx_race_results_quarter ON public.race_results(quarter);

-- ------------------------------------------------------------------------------
-- 7. TABLE: events (Idempotent Webhook Log & System Audit Trail)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed BOOLEAN NOT NULL DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_stripe_event_id ON public.events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);

DROP TRIGGER IF EXISTS tr_events_updated_at ON public.events;
CREATE TRIGGER tr_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role has full access to profiles" ON public.profiles;
CREATE POLICY "Service role has full access to profiles"
    ON public.profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ------------------------------------------------------------------------------
-- INVENTORY POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.inventory;
CREATE POLICY "Public can view active campaigns"
    ON public.inventory FOR SELECT
    USING (status IN ('coming_soon', 'coming_soon_details', 'listed', 'fully_subscribed', 'completed'));

DROP POLICY IF EXISTS "Service role has full access to inventory" ON public.inventory;
CREATE POLICY "Service role has full access to inventory"
    ON public.inventory FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ------------------------------------------------------------------------------
-- HOLDINGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own holdings" ON public.holdings;
CREATE POLICY "Users can view their own holdings"
    ON public.holdings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full access to holdings" ON public.holdings;
CREATE POLICY "Service role has full access to holdings"
    ON public.holdings FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ------------------------------------------------------------------------------
-- RACE RESULTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view all race results" ON public.race_results;
CREATE POLICY "Public can view all race results"
    ON public.race_results FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Service role has full access to race results" ON public.race_results;
CREATE POLICY "Service role has full access to race results"
    ON public.race_results FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ------------------------------------------------------------------------------
-- EVENTS POLICIES (Audit & Webhook)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role has full access to events" ON public.events;
CREATE POLICY "Service role has full access to events"
    ON public.events FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
