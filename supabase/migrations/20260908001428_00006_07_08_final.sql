-- 00006: service_role write grants for campaign publish pipeline
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO service_role;

-- 00007: Guest waitlist leads (CtaLeadModal on replicated landing page)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    user_name TEXT,
    horse_slug TEXT,
    action_type TEXT NOT NULL DEFAULT 'waitlist_guest',
    utm_source TEXT,
    utm_campaign TEXT,
    referrer_url TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(user_email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.leads TO service_role;
GRANT SELECT ON public.leads TO service_role;

-- 00008: race_log JSONB column
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS race_log JSONB;;
