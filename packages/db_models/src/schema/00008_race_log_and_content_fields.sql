-- ==============================================================================
-- Evolution Stables (Evolution-3.0) Migration: 00008_race_log_and_content_fields.sql
-- Add race_log JSONB column to inventory table
-- Target: Supabase PostgreSQL
-- ==============================================================================

BEGIN;

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS race_log JSONB;

COMMIT;