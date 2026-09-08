ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS listed_stake_pct NUMERIC(5,2) NOT NULL DEFAULT 5 CHECK (listed_stake_pct > 0 AND listed_stake_pct <= 100);

DO $$ BEGIN
    ALTER TABLE public.inventory
    DROP CONSTRAINT IF EXISTS chk_inventory_shares_boundary;
    ALTER TABLE public.inventory
    ADD CONSTRAINT chk_inventory_shares_boundary
    CHECK (shares_available + reserved_shares <= total_shares);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS stripe_verification_session_id TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS kyc_audit_digest TEXT,
    ADD COLUMN IF NOT EXISTS nztr_license_number TEXT;

DO $$ BEGIN
    ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS chk_kyc_audit_digest_sha256;
    ALTER TABLE public.profiles
    ADD CONSTRAINT chk_kyc_audit_digest_sha256
    CHECK (kyc_audit_digest IS NULL OR kyc_audit_digest ~ '^[a-f0-9]{64}$');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_session 
    ON public.profiles(stripe_verification_session_id) 
    WHERE stripe_verification_session_id IS NOT NULL;

ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_operator_id 
    ON public.events(operator_id) 
    WHERE operator_id IS NOT NULL;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('active','consumed','released','expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

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
    EXECUTE FUNCTION update_updated_at_column();;
