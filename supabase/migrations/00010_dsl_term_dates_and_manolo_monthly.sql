-- 00010: DSL term dates + Manolo monthly conversion (007 T5a DSL assembly rehearsal).
-- Adds lease term dates to inventory (start = first of month, end = last of month;
-- months derived from the two). Converts I Stole A Manolo from upfront to the
-- native subscription_float model the T4 settlement engine was built for, and
-- corrects her commercials to the founder-locked wholesale $70 → retail $76
-- (cost $7,000, matching the 5% margin + 3% platform formula).

-- 1. Term dates on inventory
ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS term_start_date DATE,
    ADD COLUMN IF NOT EXISTS term_end_date DATE;

-- 2. Manolo → monthly DSL (subscription_float), term 1 Sep 2026 → 30 June 2028 (22 months)
UPDATE public.inventory
SET
    payment_style = 'subscription_float',
    cost_monthly_nzd = 7000.00,
    list_price_nzd = 7571.00,
    monthly_keep_unit_nzd = 76.00,
    join_float_unit_nzd = 380.00,
    term_start_date = '2026-09-01',
    term_end_date = '2028-06-30'
WHERE slug = 'i-stole-a-manolo';
