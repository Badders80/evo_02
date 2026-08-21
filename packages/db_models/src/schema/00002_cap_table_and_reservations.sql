-- ==============================================================================
-- Evolution Stables Migration: 00002_cap_table_and_reservations.sql
-- Concurrency Locking, 15-Minute Checkout TTL, and Privacy-by-Design KYC Audits
-- Authority: evo_00/migration_bridge/02_DATA_MAPPING.md & evo_00/doc/DSL_MANUAL.md
-- ==============================================================================

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS listed_stake_pct NUMERIC(5,2) NOT NULL DEFAULT 5 CHECK (listed_stake_pct > 0 AND listed_stake_pct <= 100),
    ADD COLUMN IF NOT EXISTS min_stake_pct NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (min_stake_pct > 0 AND min_stake_pct <= listed_stake_pct),
    ADD COLUMN IF NOT EXISTS stake_step_pct NUMERIC(5,2) NOT NULL DEFAULT 0.5 CHECK (stake_step_pct > 0 AND stake_step_pct <= listed_stake_pct);

-- Enforce Invariant: available + reserved <= total_shares
DO $$ BEGIN
    ALTER TABLE public.inventory
    DROP CONSTRAINT IF EXISTS chk_inventory_shares_boundary;
    ALTER TABLE public.inventory
    ADD CONSTRAINT chk_inventory_shares_boundary
    CHECK (shares_available + reserved_shares <= total_shares);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. EXTEND profiles TABLE WITH STRIPE IDENTITY KYC COLUMNS
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS stripe_verification_session_id TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS kyc_audit_digest TEXT,
    ADD COLUMN IF NOT EXISTS nztr_license_number TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_session 
    ON public.profiles(stripe_verification_session_id) 
    WHERE stripe_verification_session_id IS NOT NULL;

-- 3. EXTEND events TABLE WITH OPERATOR AUDIT SUPPORT
ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_operator_id 
    ON public.events(operator_id) 
    WHERE operator_id IS NOT NULL;

-- 4. CREATE ENUM FOR RESERVATION STATUS
DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM (
        'active',
        'consumed',
        'released',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. CREATE TABLE: checkout_reservations
CREATE TABLE IF NOT EXISTS public.checkout_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    units NUMERIC(5,2) NOT NULL CHECK (units > 0 AND units = round(units, 0)),
    status reservation_status NOT NULL DEFAULT 'active',
    expires_at TIMESTAMPTZ NOT NULL,
    stripe_checkout_session_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_inventory ON public.checkout_reservations(inventory_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON public.checkout_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON public.checkout_reservations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_stripe_session ON public.checkout_reservations(stripe_checkout_session_id);

DROP TRIGGER IF EXISTS tr_reservations_updated_at ON public.checkout_reservations;
CREATE TRIGGER tr_reservations_updated_at
    BEFORE UPDATE ON public.checkout_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. ATOMIC POSTGRESQL RPC: reserve_campaign_shares
CREATE OR REPLACE FUNCTION public.reserve_campaign_shares(
    p_inventory_id UUID,
    p_user_id UUID,
    p_units NUMERIC(5,2),
    p_ttl_minutes INTEGER DEFAULT 15,
    p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_inv RECORD;
    v_res_id UUID;
    v_ttl INTEGER;
    v_expires_at TIMESTAMPTZ;
    v_existing RECORD;
BEGIN
    -- Security: Validate caller identity (authenticated users may only reserve for their own auth.uid())
    IF auth.jwt()->>'role' = 'authenticated' AND auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'FORBIDDEN_USER_ID',
            'message', 'Authenticated users can only reserve shares for their own profile'
        );
    END IF;

    -- Validate units are positive integer-equivalent step units for this campaign
    IF p_units IS NULL OR p_units <= 0 OR p_units != round(p_units, 2) OR (p_units * 100) % 1 != 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INVALID_UNITS',
            'message', 'Units must be a positive integer number of step units'
        );
    END IF;

    -- Validate TTL parameter (bounded between 1 and 60 minutes)
    v_ttl := COALESCE(p_ttl_minutes, 15);
    IF v_ttl < 1 OR v_ttl > 60 THEN
        v_ttl := 15;
    END IF;

    -- Idempotency Check: return existing active reservation if already reserved for same checkout session
    IF p_stripe_session_id IS NOT NULL THEN
        SELECT id, expires_at, units INTO v_existing
        FROM public.checkout_reservations
        WHERE stripe_checkout_session_id = p_stripe_session_id
          AND status = 'active'
          AND expires_at > now();

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'reservation_id', v_existing.id,
                'inventory_id', p_inventory_id,
                'units', v_existing.units,
                'expires_at', v_existing.expires_at,
                'idempotent', true
            );
        END IF;
    END IF;

    -- Row-level lock to serialize concurrent reservation requests
    SELECT * INTO v_inv
    FROM public.inventory
    WHERE id = p_inventory_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'CAMPAIGN_NOT_FOUND',
            'message', 'Campaign inventory record not found'
        );
    END IF;

    IF v_inv.status NOT IN ('listed', 'coming_soon_details') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'CAMPAIGN_NOT_OPEN',
            'message', 'Campaign is not currently open for checkout'
        );
    END IF;

    IF v_inv.shares_available < p_units THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INSUFFICIENT_SHARES_AVAILABLE',
            'shares_available', v_inv.shares_available,
            'requested_units', p_units
        );
    END IF;

    v_expires_at := now() + (v_ttl || ' minutes')::INTERVAL;

    -- Atomically transfer shares from available to reserved
    UPDATE public.inventory
    SET shares_available = shares_available - p_units,
        reserved_shares = reserved_shares + p_units
    WHERE id = p_inventory_id;

    -- Create reservation record
    INSERT INTO public.checkout_reservations (
        inventory_id,
        user_id,
        units,
        status,
        expires_at,
        stripe_checkout_session_id
    )
    VALUES (
        p_inventory_id,
        p_user_id,
        p_units,
        'active',
        v_expires_at,
        p_stripe_session_id
    )
    RETURNING id INTO v_res_id;

    -- Append to events audit trail with operator/caller id
    INSERT INTO public.events (
        event_type,
        operator_id,
        payload
    )
    VALUES (
        'checkout.shares_reserved',
        auth.uid(),
        jsonb_build_object(
            'reservation_id', v_res_id,
            'inventory_id', p_inventory_id,
            'user_id', p_user_id,
            'units', p_units,
            'expires_at', v_expires_at,
            'stripe_checkout_session_id', p_stripe_session_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_res_id,
        'inventory_id', p_inventory_id,
        'units', p_units,
        'expires_at', v_expires_at,
        'idempotent', false
    );
END;
$$;

-- 7. ATOMIC POSTGRESQL RPC: release_expired_reservations (Cron / Service Role Only)
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_res RECORD;
    v_released_count INTEGER := 0;
BEGIN
    FOR v_res IN
        SELECT id, inventory_id, units, user_id
        FROM public.checkout_reservations
        WHERE status = 'active' AND expires_at < now()
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Explicitly lock and restore inventory
        PERFORM 1 FROM public.inventory WHERE id = v_res.inventory_id FOR UPDATE;

        UPDATE public.inventory
        SET shares_available = shares_available + v_res.units,
            reserved_shares = GREATEST(0, reserved_shares - v_res.units)
        WHERE id = v_res.inventory_id;

        -- Mark expired
        UPDATE public.checkout_reservations
        SET status = 'expired'
        WHERE id = v_res.id;

        -- Log event
        INSERT INTO public.events (
            event_type,
            operator_id,
            payload
        )
        VALUES (
            'checkout.reservation_expired',
            NULL,
            jsonb_build_object(
                'reservation_id', v_res.id,
                'inventory_id', v_res.inventory_id,
                'user_id', v_res.user_id,
                'units', v_res.units
            )
        );

        v_released_count := v_released_count + 1;
    END LOOP;

    RETURN v_released_count;
END;
$$;

-- 8. GRANT / REVOKE EXECUTE PERMISSIONS
REVOKE EXECUTE ON FUNCTION public.reserve_campaign_shares(UUID, UUID, NUMERIC, INTEGER, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reserve_campaign_shares(UUID, UUID, NUMERIC, INTEGER, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.release_expired_reservations() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_reservations() TO service_role;

-- 9. ROW LEVEL SECURITY (RLS) FOR checkout_reservations
ALTER TABLE public.checkout_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own checkout reservations" ON public.checkout_reservations;
CREATE POLICY "Users can view their own checkout reservations"
    ON public.checkout_reservations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full access to checkout_reservations" ON public.checkout_reservations;
CREATE POLICY "Service role has full access to checkout_reservations"
    ON public.checkout_reservations FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
