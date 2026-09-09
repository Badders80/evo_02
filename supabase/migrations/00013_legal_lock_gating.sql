-- 00013: Legal-lock gating rule (founder, 2026-09-09).
-- RULE: a horse cannot be 'listed' (live for purchase) unless its full legals
-- are locked — term_sheet_status, pds_status and sa_status must all be
-- 'approved'. Display states (coming_soon / fully_subscribed / completed /
-- draft) are unaffected: horses can be loaded and browsed without legals.
--
-- Enforcement: DB CHECK constraint (root cause — holds even against manual
-- SQL edits, not just app-level writes).
--
-- Backfill: seed currently lists nellie + tml-x-yearn without workflow-approved
-- docs. Founder ruling: nellie should not be listed to start with. Flip every
-- horse to 'coming_soon' (the launch-flip target state from the G007 brief).
-- Horses go live one at a time through the doc workflow as legals lock.

-- 1. Backfill: nothing is listed until its legals lock.
UPDATE public.inventory
SET status = 'coming_soon'
WHERE status = 'listed';

-- 2. Seed-stability: the seed's ON CONFLICT DO UPDATE resets status on re-run,
-- which would resurrect 'listed' horses without legals. Constrain the seed so a
-- re-run never re-lists a horse whose legals are not locked. (Supabase seed runs
-- as postgres = table owner, so the CHECK does not block this UPDATE — the guard
-- must live in the seed logic itself.)
--
-- Implemented as a BEFORE UPDATE guard trigger: reject any transition into
-- 'listed' unless all three doc statuses are 'approved'. Covers seed re-runs,
-- manual SQL, dashboard edits and app writes — one enforcement point.

CREATE OR REPLACE FUNCTION public.enforce_listed_requires_legals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'listed' AND OLD.status <> 'listed' THEN
        IF NEW.term_sheet_status <> 'approved'
            OR NEW.pds_status <> 'approved'
            OR NEW.sa_status <> 'approved' THEN
            RAISE EXCEPTION
                'A horse cannot be listed unless term sheet, PDS and SA are all approved (legal-lock rule, founder 2026-09-09). Current: term_sheet=%, pds=%, sa=%',
                NEW.term_sheet_status, NEW.pds_status, NEW.sa_status
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_listed_requires_legals ON public.inventory;
CREATE TRIGGER trg_enforce_listed_requires_legals
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_listed_requires_legals();

-- 3. Hard gate for any INSERT path (new rows created directly as listed).
ALTER TABLE public.inventory
    ADD CONSTRAINT inventory_listed_requires_legals_locked
    CHECK (
        status <> 'listed'
        OR (
            term_sheet_status = 'approved'
            AND pds_status = 'approved'
            AND sa_status = 'approved'
        )
    );
