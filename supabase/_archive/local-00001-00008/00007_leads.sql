-- 00007: Guest waitlist leads (CtaLeadModal on replicated landing page).
-- evo_02 port of evo_01 `leads` table — minimal shape for /api/subscribe.
-- RLS on, no anon policies (service_role bypasses; insert happens server-side only).

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