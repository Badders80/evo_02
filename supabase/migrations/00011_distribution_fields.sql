-- 00011: Owner-set prize distribution fields on inventory (007 T5a litmus rule).
-- The term sheet's "Gross Stakes Distribution" and "Distribution Schedule" are
-- owner-set listing choices, never a platform default. These columns let the
-- term sheet render the real value or a blank marker when unset.
-- (Display only — the settlement/payout math is unchanged by this migration.)

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS distribution_split TEXT,
    ADD COLUMN IF NOT EXISTS distribution_schedule TEXT;
