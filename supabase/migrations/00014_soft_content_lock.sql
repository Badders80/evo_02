-- 00014: Soft-content lock (founder, 2026-09-09).
-- RULE: the PDS's editorial sections (§2.1 About Horse & Trainer, §2.3 Racing
-- Outlook & Pedigree, trainerBio) are SOFT content — founder-authored, distinct
-- from HARD content (microchip/pedigree facts scraped from loveracing.nz).
-- Soft content must be approved before the PDS can be approved: the PDS renders
-- soft content verbatim, so a PDS cannot lock while its editorial is still draft.
--
-- Reuses the dsl_doc_status enum (draft/pending/approved/rejected) from 00012.

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS soft_content_status dsl_doc_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS soft_content_locked_at TIMESTAMPTZ;

-- Gate: reject a transition into pds_status='approved' unless soft content is
-- approved. (Term sheet and SA are unaffected — the term sheet is hard-content
-- only, and the SA's Schedule 1 is hard content; only the PDS carries the
-- editorial sections.)
CREATE OR REPLACE FUNCTION public.enforce_pds_requires_soft_content()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.pds_status = 'approved' AND OLD.pds_status <> 'approved' THEN
        IF NEW.soft_content_status <> 'approved' THEN
            RAISE EXCEPTION
                'The PDS cannot be approved until soft content is approved (soft-content lock, founder 2026-09-09). Current: soft_content=%',
                NEW.soft_content_status
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_pds_requires_soft_content ON public.inventory;
CREATE TRIGGER trg_enforce_pds_requires_soft_content
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_pds_requires_soft_content();
