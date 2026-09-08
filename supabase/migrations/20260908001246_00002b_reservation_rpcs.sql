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
    IF auth.jwt()->>'role' = 'authenticated' AND auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN_USER_ID', 'message', 'Authenticated users can only reserve shares for their own profile');
    END IF;
    IF p_units IS NULL OR p_units <= 0 OR p_units != round(p_units, 2) OR (p_units * 100) % 1 != 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_UNITS', 'message', 'Units must be a positive integer number of step units');
    END IF;
    v_ttl := COALESCE(p_ttl_minutes, 15);
    IF v_ttl < 1 OR v_ttl > 60 THEN
        v_ttl := 15;
    END IF;
    IF p_stripe_session_id IS NOT NULL THEN
        SELECT id, expires_at, units INTO v_existing
        FROM public.checkout_reservations
        WHERE stripe_checkout_session_id = p_stripe_session_id
          AND status = 'active'
          AND expires_at > now();
        IF FOUND THEN
            RETURN jsonb_build_object('success', true, 'reservation_id', v_existing.id, 'inventory_id', p_inventory_id, 'units', v_existing.units, 'expires_at', v_existing.expires_at, 'idempotent', true);
        END IF;
    END IF;
    SELECT * INTO v_inv FROM public.inventory WHERE id = p_inventory_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'CAMPAIGN_NOT_FOUND', 'message', 'Campaign inventory record not found');
    END IF;
    IF v_inv.status NOT IN ('listed', 'coming_soon_details') THEN
        RETURN jsonb_build_object('success', false, 'error', 'CAMPAIGN_NOT_OPEN', 'message', 'Campaign is not currently open for checkout');
    END IF;
    IF v_inv.shares_available < p_units THEN
        RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_SHARES_AVAILABLE', 'shares_available', v_inv.shares_available, 'requested_units', p_units);
    END IF;
    v_expires_at := now() + (v_ttl || ' minutes')::INTERVAL;
    UPDATE public.inventory
    SET shares_available = shares_available - p_units,
        reserved_shares = reserved_shares + p_units
    WHERE id = p_inventory_id;
    INSERT INTO public.checkout_reservations (inventory_id, user_id, units, status, expires_at, stripe_checkout_session_id)
    VALUES (p_inventory_id, p_user_id, p_units, 'active', v_expires_at, p_stripe_session_id)
    RETURNING id INTO v_res_id;
    INSERT INTO public.events (event_type, operator_id, payload)
    VALUES ('checkout.shares_reserved', auth.uid(), jsonb_build_object('reservation_id', v_res_id, 'inventory_id', p_inventory_id, 'user_id', p_user_id, 'units', p_units, 'expires_at', v_expires_at, 'stripe_checkout_session_id', p_stripe_session_id));
    RETURN jsonb_build_object('success', true, 'reservation_id', v_res_id, 'inventory_id', p_inventory_id, 'units', p_units, 'expires_at', v_expires_at, 'idempotent', false);
END;
$$;

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
        PERFORM 1 FROM public.inventory WHERE id = v_res.inventory_id FOR UPDATE;
        UPDATE public.inventory
        SET shares_available = shares_available + v_res.units,
            reserved_shares = GREATEST(0, reserved_shares - v_res.units)
        WHERE id = v_res.inventory_id;
        UPDATE public.checkout_reservations SET status = 'expired' WHERE id = v_res.id;
        INSERT INTO public.events (event_type, operator_id, payload)
        VALUES ('checkout.reservation_expired', NULL, jsonb_build_object('reservation_id', v_res.id, 'inventory_id', v_res.inventory_id, 'user_id', v_res.user_id, 'units', v_res.units));
        v_released_count := v_released_count + 1;
    END LOOP;
    RETURN v_released_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reserve_campaign_shares(UUID, UUID, NUMERIC, INTEGER, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reserve_campaign_shares(UUID, UUID, NUMERIC, INTEGER, TEXT) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.release_expired_reservations() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_reservations() TO service_role;

DROP FUNCTION IF EXISTS public.consume_campaign_reservation(UUID, UUID);
CREATE OR REPLACE FUNCTION public.consume_campaign_reservation(
    p_inventory_id UUID,
    p_user_id UUID,
    p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_res RECORD;
    v_updated INTEGER;
BEGIN
    IF p_reservation_id IS NULL OR p_inventory_id IS NULL OR p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_ARGS', 'message', 'inventory_id, user_id, and reservation_id are required', 'consumed_count', 0);
    END IF;
    PERFORM 1 FROM public.inventory WHERE id = p_inventory_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'CAMPAIGN_NOT_FOUND', 'consumed_count', 0);
    END IF;
    SELECT id, units, status, inventory_id, user_id INTO v_res FROM public.checkout_reservations WHERE id = p_reservation_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_NOT_FOUND', 'consumed_count', 0, 'units', 0);
    END IF;
    IF v_res.inventory_id <> p_inventory_id OR v_res.user_id <> p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_MISMATCH', 'consumed_count', 0);
    END IF;
    IF v_res.status = 'consumed' THEN
        RETURN jsonb_build_object('success', true, 'consumed_count', 0, 'units', 0, 'already_consumed', true, 'reservation_id', v_res.id);
    END IF;
    IF v_res.status <> 'active' THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_NOT_ACTIVE', 'status', v_res.status, 'consumed_count', 0);
    END IF;
    UPDATE public.inventory
    SET reserved_shares = reserved_shares - v_res.units
    WHERE id = p_inventory_id AND reserved_shares >= v_res.units;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated <> 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVED_UNDERFLOW', 'message', 'consume would double-count or underflow reserved_shares', 'consumed_count', 0);
    END IF;
    UPDATE public.checkout_reservations SET status = 'consumed' WHERE id = v_res.id;
    INSERT INTO public.events (event_type, operator_id, payload)
    VALUES ('checkout.reservation_consumed', auth.uid(), jsonb_build_object('reservation_id', v_res.id, 'inventory_id', p_inventory_id, 'user_id', p_user_id, 'units', v_res.units));
    RETURN jsonb_build_object('success', true, 'consumed_count', 1, 'units', v_res.units, 'already_consumed', false, 'reservation_id', v_res.id);
END;
$$;

DROP FUNCTION IF EXISTS public.consume_campaign_reservation(UUID);
CREATE OR REPLACE FUNCTION public.consume_campaign_reservation(
    p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_res RECORD;
    v_updated INTEGER;
BEGIN
    IF p_reservation_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_ARGS', 'message', 'reservation_id is required', 'consumed_count', 0);
    END IF;
    SELECT id, units, status, inventory_id, user_id INTO v_res FROM public.checkout_reservations WHERE id = p_reservation_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_NOT_FOUND', 'consumed_count', 0, 'units', 0);
    END IF;
    IF v_res.status = 'consumed' THEN
        RETURN jsonb_build_object('success', true, 'consumed_count', 0, 'units', 0, 'already_consumed', true, 'reservation_id', v_res.id);
    END IF;
    IF v_res.status <> 'active' THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_NOT_ACTIVE', 'status', v_res.status, 'consumed_count', 0);
    END IF;
    UPDATE public.inventory
    SET reserved_shares = reserved_shares - v_res.units
    WHERE id = v_res.inventory_id AND reserved_shares >= v_res.units;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated <> 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVED_UNDERFLOW', 'message', 'consume would double-count or underflow reserved_shares', 'consumed_count', 0);
    END IF;
    UPDATE public.checkout_reservations SET status = 'consumed' WHERE id = v_res.id;
    INSERT INTO public.events (event_type, operator_id, payload)
    VALUES ('checkout.reservation_consumed', auth.uid(), jsonb_build_object('reservation_id', v_res.id, 'inventory_id', v_res.inventory_id, 'user_id', v_res.user_id, 'units', v_res.units));
    RETURN jsonb_build_object('success', true, 'consumed_count', 1, 'units', v_res.units, 'already_consumed', false, 'reservation_id', v_res.id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_campaign_reservation(UUID, UUID, UUID) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_campaign_reservation(UUID, UUID, UUID) TO service_role;

ALTER TABLE public.checkout_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own checkout reservations" ON public.checkout_reservations;
CREATE POLICY "Users can view their own checkout reservations" ON public.checkout_reservations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role has full access to checkout_reservations" ON public.checkout_reservations;
CREATE POLICY "Service role has full access to checkout_reservations" ON public.checkout_reservations FOR ALL USING (auth.jwt()->>'role' = 'service_role');;
