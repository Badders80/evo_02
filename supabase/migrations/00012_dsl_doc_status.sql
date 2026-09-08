-- 00012: DSL document lock/status workflow (007 T5a review flow).
-- Three-state founder control per document: reject (scrap) / pending (on hold)
-- / approve (lock). Default is 'draft' (editable, in progress).
-- Cascade: term sheet approve -> PDS -> PDS lock -> SA -> SA lock.

CREATE TYPE dsl_doc_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS term_sheet_status dsl_doc_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS pds_status dsl_doc_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS sa_status dsl_doc_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS term_sheet_locked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pds_locked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS sa_locked_at TIMESTAMPTZ;
