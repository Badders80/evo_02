-- 00009: owners + trainer_profiles tables (007 T6 data-layer debt).
-- Root-cause: resolveOwner() hardcoded owner entities in horses-data.ts;
-- owners now live in the DB and inventory rows reference them.
-- Also: Prudentia barn_name fix (empty in canonical seed; canonical value 'Prudentia').
-- Mulan list_price already 6489.00 in canonical seed (verified) - no-op.

-- 1. OWNERS (lessor entities - canonical: owner/lessor = Evolution Stables or named entities)
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    entity TEXT NOT NULL,
    contact TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.owners (slug, entity, contact) VALUES
    ('bax-bloodstock', 'B.A.X Bloodstock', 'Kylie Bax'),
    ('stephen-gray-racing', 'Stephen Gray Racing', 'Stephen Gray'),
    ('evolution-stables', 'Evolution Stables', 'Evolution Stables')
ON CONFLICT (slug) DO NOTHING;

-- 2. TRAINER PROFILES (canonical trainer registry: Kennedy/Byerley Park, Gray/Copper Belt Lodge, O'Sullivan & Scott/Wexford)
CREATE TABLE IF NOT EXISTS public.trainer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    stable_name TEXT NOT NULL,
    location TEXT NOT NULL,
    base TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.trainer_profiles (slug, name, stable_name, location, base) VALUES
    ('barbara-kennedy', 'Barbara Kennedy', 'Barbara Kennedy Racing', 'Karaka, NZ', 'Byerley Park'),
    ('lance-osullivan', 'Lance O''Sullivan & Andrew Scott', 'Wexford Stables', 'Matamata, NZ', 'Wexford Stables'),
    ('stephen-gray', 'Stephen Gray', 'Stephen Gray Racing', 'Palmerston North, NZ', 'Copper Belt Lodge')
ON CONFLICT (slug) DO NOTHING;

-- 3. Inventory.owner_id linkage
ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.owners(id);

UPDATE public.inventory i
SET owner_id = o.id
FROM public.owners o
WHERE (i.slug IN ('first-gear', 'tml-x-yearn') AND o.slug = 'stephen-gray-racing')
   OR (i.slug IN ('nellie', 'prudentia', 'hottathanafantasy', 'i-stole-a-manolo') AND o.slug = 'bax-bloodstock');

-- Default any unlinked rows to Evolution Stables (canonical lessor of last resort)
UPDATE public.inventory i
SET owner_id = o.id
FROM public.owners o
WHERE i.owner_id IS NULL AND o.slug = 'evolution-stables';

-- 4. Prudentia barn_name fix
UPDATE public.inventory
SET barn_name = 'Prudentia'
WHERE slug = 'prudentia' AND (barn_name IS NULL OR barn_name = '');

-- 5. raceExpectation seeding: leave soft_legal.raceExpectation to the canonical
-- marketing pipeline - it reads dual-shape (raceExpectation / race_expectation)
-- and empty string renders the fallback hook, so no forced DB write here.

-- RLS: read-only for anon/authenticated via default deny + explicit policies
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owners_public_read ON public.owners;
CREATE POLICY owners_public_read ON public.owners FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS trainer_profiles_public_read ON public.trainer_profiles;
CREATE POLICY trainer_profiles_public_read ON public.trainer_profiles FOR SELECT TO anon, authenticated USING (true);

-- Service role (used by horses-data server reads) bypasses RLS by design.
