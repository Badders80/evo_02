-- ==============================================================================
-- Evolution Stables Migration: 00008_race_log_and_content_fields.sql
-- Add race_log JSONB column to inventory table
-- ==============================================================================

BEGIN;

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS race_log JSONB;

COMMIT;