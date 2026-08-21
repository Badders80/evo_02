[SEVERITY: HIGH] Checkout and webhook are gated only by `isCheckoutOpen`, not an explicit `slug === 'nellie'` guard. A future campaign accidentally marked open would become buyable.

[SEVERITY: HIGH] `consume_campaign_reservation` loops **all** active reservations for `(inventory_id, user_id)` and ignores the Stripe `reservation_id` metadata. A user with multiple reservations causes `reserved_shares` to be decremented by more than the current holding records, breaking the cap-table identity.

[SEVERITY: HIGH] `consume_campaign_reservation` uses `GREATEST(0, reserved_shares - units)`, silently clamping underflow instead of failing closed. This allows `allocated + reserved + available ≠ listed`.

[SEVERITY: HIGH] Webhook skips HMAC verification when `STRIPE_WEBHOOK_SECRET` is unset, processing `checkout.session.completed` events fail-open.

[SEVERITY: MED] Webhook catch-all returns `400` for unhandled 5xx errors; Stripe will not retry legitimate failures.

[SEVERITY: MED] Webhook processes `checkout.session.completed` without verifying `payment_status === 'paid'`.

[SEVERITY: MED] `resolvePaidAmountNzd` falls back to the expected price when `amount_total` is missing, instead of failing closed.

[SEVERITY: MED] `handle_new_user` sets `search_path = public` without `pg_temp`.

[SEVERITY: MED] `profiles.kyc_audit_digest` has no 64-hex CHECK constraint (if the column exists).

[SEVERITY: LOW] `create-session` does not release the reservation if Stripe session creation fails; shares stay reserved until expiry.

---

### SEARCH/REPLACE corrections

#### 1. `apps/web/src/lib/nellie-loop.ts` — add Nellie-only guard

```typescript
// apps/web/src/lib/nellie-loop.ts
export function assertCheckoutCampaign(slug: string) {
  const resolved = resolveCampaignInventory(slug);
  if (!isCheckoutOpen(resolved.campaign)) {
    throw new HttpError(409, 'CHECKOUT_CLOSED', 'This campaign is visible but not open for subscription');
  }
  return resolved;
}
```

```typescript
// apps/web/src/lib/nellie-loop.ts
export function assertNellieOnly(slug: string): void {
  if (slug !== 'nellie') {
    throw new HttpError(400, 'NOT_NELLIE', 'Only Nellie is buyable in Sprint 1');
  }
}

export function assertCheckoutCampaign(slug: string) {
  const resolved = resolveCampaignInventory(slug);
  if (!isCheckoutOpen(resolved.campaign)) {
    throw new HttpError(409, 'CHECKOUT_CLOSED', 'This campaign is visible but not open for subscription');
  }
  assertNellieOnly(slug);
  return resolved;
}
```

#### 2. `apps/web/src/app/api/webhooks/stripe/route.ts` — import and enforce Nellie-only

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
import {
  HttpError,
  buildHoldingInsert,
  isUniqueViolation,
  pricingForUnits,
  r2ConfigFromEnv,
  resolveCampaignInventory,
  resolveLegalHashes,
  resolvePaidAmountNzd,
} from '@/lib/nellie-loop';
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
import {
  HttpError,
  assertNellieOnly,
  buildHoldingInsert,
  isUniqueViolation,
  pricingForUnits,
  r2ConfigFromEnv,
  resolveCampaignInventory,
  resolveLegalHashes,
  resolvePaidAmountNzd,
} from '@/lib/nellie-loop';
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  if (!horseSlug || !userId || !Number.isInteger(units) || units < 1) {
    throw new HttpError(400, 'INVALID_METADATA', 'checkout.session.completed is missing horse_slug, user_id, or units');
  }

  const { campaign, inventoryId } = resolveCampaignInventory(horseSlug);
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  const reservationId = metadata.reservation_id;
  if (!horseSlug || !userId || !reservationId || !Number.isInteger(units) || units < 1) {
    throw new HttpError(400, 'INVALID_METADATA', 'checkout.session.completed is missing horse_slug, user_id, reservation_id, or units');
  }

  assertNellieOnly(horseSlug);
  const { campaign, inventoryId } = resolveCampaignInventory(horseSlug);
```

#### 3. `apps/web/src/app/api/webhooks/stripe/route.ts` — require HMAC and fix 5xx status

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
    if (webhookSecret) {
      if (!sig || !verifyStripeSignature(rawBody, sig, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody) as StripeEvent;
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Stripe webhook secret not configured' }, { status: 503 });
    }
    if (!sig || !verifyStripeSignature(rawBody, sig, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as StripeEvent;
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
```

#### 4. `apps/web/src/app/api/webhooks/stripe/route.ts` — verify payment_status and amount_total

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  const { campaign, inventoryId } = resolveCampaignInventory(horseSlug);
  const hashes = resolveLegalHashes(horseSlug);
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  const paymentStatus = session.payment_status as string | undefined;
  if (paymentStatus !== 'paid') {
    throw new HttpError(400, 'PAYMENT_NOT_PAID', `checkout.session.completed payment_status is ${paymentStatus}`);
  }

  const { campaign, inventoryId } = resolveCampaignInventory(horseSlug);
  const hashes = resolveLegalHashes(horseSlug);
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  const pricing = pricingForUnits(campaign.wholesaleMonthlyNzd, units);
  const amountPaid = resolvePaidAmountNzd(session.amount_total, pricing.joinFloatUnitNzd);
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  const pricing = pricingForUnits(campaign.wholesaleMonthlyNzd, units);
  if (typeof session.amount_total !== 'number' || !Number.isFinite(session.amount_total)) {
    throw new HttpError(400, 'MISSING_AMOUNT_TOTAL', 'checkout.session.completed missing or invalid amount_total');
  }
  const amountPaid = resolvePaidAmountNzd(session.amount_total, pricing.joinFloatUnitNzd);
```

#### 5. `apps/web/src/lib/nellie-loop.ts` — fail closed on missing amount_total

```typescript
// apps/web/src/lib/nellie-loop.ts
export function resolvePaidAmountNzd(
  amountTotalCents: unknown,
  joinFloatUnitNzd: number
): number {
  if (typeof amountTotalCents === 'number' && Number.isFinite(amountTotalCents)) {
    return amountTotalCents / 100;
  }
  return joinFloatUnitNzd;
}
```

```typescript
// apps/web/src/lib/nellie-loop.ts
export function resolvePaidAmountNzd(
  amountTotalCents: unknown,
  joinFloatUnitNzd: number
): number {
  if (typeof amountTotalCents === 'number' && Number.isFinite(amountTotalCents)) {
    return amountTotalCents / 100;
  }
  throw new HttpError(400, 'INVALID_AMOUNT_TOTAL', 'checkout.session.completed missing or invalid amount_total');
}
```

#### 6. `apps/web/src/app/api/webhooks/stripe/route.ts` — pass reservation_id to consume RPC

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  const { data: consumeData, error: consumeError } = await admin.rpc('consume_campaign_reservation', {
    p_inventory_id: inventoryId,
    p_user_id: userId,
  });
```

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
  const { data: consumeData, error: consumeError } = await admin.rpc('consume_campaign_reservation', {
    p_inventory_id: inventoryId,
    p_user_id: userId,
    p_reservation_id: reservationId,
  });
```

#### 7. `packages/db_models/src/schema/00002_cap_table_and_reservations.sql` — consume exact reservation, fail underflow

```sql
-- packages/db_models/src/schema/00002_cap_table_and_reservations.sql
-- 7b. ATOMIC POSTGRESQL RPC: consume_campaign_reservation (Service Role / Webhook)
-- Marks active reservations consumed and decrements reserved_shares (does not return units to available).
CREATE OR REPLACE FUNCTION public.consume_campaign_reservation(
    p_inventory_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_res RECORD;
    v_consumed INTEGER := 0;
    v_units NUMERIC(5,2) := 0;
BEGIN
    FOR v_res IN
        SELECT id, units
        FROM public.checkout_reservations
        WHERE inventory_id = p_inventory_id
          AND user_id = p_user_id
          AND status = 'active'
        FOR UPDATE
    LOOP
        PERFORM 1 FROM public.inventory WHERE id = p_inventory_id FOR UPDATE;

        UPDATE public.inventory
        SET reserved_shares = GREATEST(0, reserved_shares - v_res.units)
        WHERE id = p_inventory_id;

        UPDATE public.checkout_reservations
        SET status = 'consumed'
        WHERE id = v_res.id;

        INSERT INTO public.events (
            event_type,
            operator_id,
            payload
        )
        VALUES (
            'checkout.reservation_consumed',
            auth.uid(),
            jsonb_build_object(
                'reservation_id', v_res.id,
                'inventory_id', p_inventory_id,
                'user_id', p_user_id,
                'units', v_res.units
            )
        );

        v_consumed := v_consumed + 1;
        v_units := v_units + v_res.units;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'consumed_count', v_consumed,
        'units', v_units
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_campaign_reservation(UUID, UUID) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_campaign_reservation(UUID, UUID) TO service_role;
```

```sql
-- packages/db_models/src/schema/00002_cap_table_and_reservations.sql
-- 7b. ATOMIC POSTGRESQL RPC: consume_campaign_reservation (Service Role / Webhook)
-- Consumes exactly one active reservation by ID, decrements reserved_shares,
-- and fails closed on missing inventory or reserved-share underflow.
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
    v_reserved NUMERIC(5,2);
BEGIN
    SELECT id, units
    INTO v_res
    FROM public.checkout_reservations
    WHERE id = p_reservation_id
      AND inventory_id = p_inventory_id
      AND user_id = p_user_id
      AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_NOT_FOUND');
    END IF;

    SELECT reserved_shares
    INTO v_reserved
    FROM public.inventory
    WHERE id = p_inventory_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVENTORY_NOT_FOUND');
    END IF;

    IF v_reserved < v_res.units THEN
        RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_RESERVED_SHARES');
    END IF;

    UPDATE public.inventory
    SET reserved_shares = reserved_shares - v_res.units
    WHERE id = p_inventory_id;

    UPDATE public.checkout_reservations
    SET status = 'consumed'
    WHERE id = v_res.id;

    INSERT INTO public.events (
        event_type,
        operator_id,
        payload
    )
    VALUES (
        'checkout.reservation_consumed',
        auth.uid(),
        jsonb_build_object(
            'reservation_id', v_res.id,
            'inventory_id', p_inventory_id,
            'user_id', p_user_id,
            'units', v_res.units
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'consumed_count', 1,
        'units', v_res.units
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_campaign_reservation(UUID, UUID, UUID) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_campaign_reservation(UUID, UUID, UUID) TO service_role;
```

#### 8. `packages/db_models/src/types/database.types.ts` — update RPC signature

```typescript
// packages/db_models/src/types/database.types.ts
      consume_campaign_reservation: {
        Args: {
          p_inventory_id: string;
          p_user_id: string;
        };
        Returns: Json;
      };
```

```typescript
// packages/db_models/src/types/database.types.ts
      consume_campaign_reservation: {
        Args: {
          p_inventory_id: string;
          p_user_id: string;
          p_reservation_id: string;
        };
        Returns: Json;
      };
```

#### 9. `packages/db_models/src/schema/00004_handle_new_user.sql` — add pg_temp to search_path and kyc_audit_digest CHECK

```sql
-- packages/db_models/src/schema/00004_handle_new_user.sql
SET search_path = public
```

```sql
-- packages/db_models/src/schema/00004_handle_new_user.sql
SET search_path = public, pg_temp
```

```sql
-- packages/db_models/src/schema/00004_handle_new_user.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

```sql
-- packages/db_models/src/schema/00004_handle_new_user.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Guard kyc_audit_digest format if the column exists (zero-cloud-PII).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'kyc_audit_digest'
    ) THEN
        ALTER TABLE public.profiles
        DROP CONSTRAINT IF EXISTS chk_profiles_kyc_audit_digest;
        ALTER TABLE public.profiles
        ADD CONSTRAINT chk_profiles_kyc_audit_digest
        CHECK (kyc_audit_digest IS NULL OR kyc_audit_digest ~ '^[a-f0-9]{64}$');
    END IF;
END $$;
```

#### 10. `packages/db_models/tests/schema.test.ts` — assert reservation_id parameter

```typescript
// packages/db_models/tests/schema.test.ts
  const reservations = fs.readFileSync(path.join(schemaDir, '00002_cap_table_and_reservations.sql'), 'utf8');
  assert.ok(reservations.includes('reserve_campaign_shares'), '00002 must define reserve_campaign_shares');
  assert.ok(reservations.includes('consume_campaign_reservation'), '00002 must define consume_campaign_reservation');
```

```typescript
// packages/db_models/tests/schema.test.ts
  const reservations = fs.readFileSync(path.join(schemaDir, '00002_cap_table_and_reservations.sql'), 'utf8');
  assert.ok(reservations.includes('reserve_campaign_shares'), '00002 must define reserve_campaign_shares');
  assert.ok(reservations.includes('consume_campaign_reservation'), '00002 must define consume_campaign_reservation');
  assert.ok(reservations.includes('p_reservation_id'), 'consume_campaign_reservation must accept p_reservation_id');
```