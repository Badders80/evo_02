-- ==============================================================================
-- Evolution Stables Migration: 00003_seed_live_horses_and_investors.sql
-- Seed Canonical Live Horse Campaigns (Nellie, Mulan, Prudentia, Coco, Manolo, First Gear) 
-- and Live Verified Co-Owners into Supabase Auth & PostgreSQL
-- Authority: evo_00/migration_bridge/02_DATA_MAPPING.md & evo_00/doc/DSL_MANUAL.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED LIVE HORSE CAMPAIGNS (public.inventory)
-- ------------------------------------------------------------------------------

INSERT INTO public.inventory (
    id,
    slug,
    legal_name,
    barn_name,
    sire,
    dam,
    trainer_name,
    trainer_location,
    cost_monthly_nzd,
    list_price_nzd,
    monthly_keep_unit_nzd,
    join_float_unit_nzd,
    listed_stake_pct,
    min_stake_pct,
    stake_step_pct,
    total_shares,
    shares_available,
    reserved_shares,
    status,
    close_style,
    payment_style,
    listing_platform,
    hero_image_url,
    pds_hash,
    sa_hash,
    pds_url,
    sa_url
) VALUES
(
    '11111111-0000-0000-0000-000000000001',
    'nellie',
    'Lady Ketchikan (NZ)',
    'Nellie',
    'Almanzor (FR)',
    'Night Danza (AUS)',
    'Barbara Kennedy',
    'Byerley Park, Karaka, NZ',
    7000.00,
    7571.00,
    76.00,
    380.00,
    5.00,
    1.00,
    0.50,
    10,
    10,
    0,
    'listed',
    'fourteen_day',
    'subscription_float',
    'evolution',
    'https://cdn.evolutionstables.nz/horses/nellie/hero.jpg',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    'https://cdn.evolutionstables.nz/docs/nellie-pds.pdf',
    'https://cdn.evolutionstables.nz/docs/nellie-sa.pdf'
),
(
    '11111111-0000-0000-0000-000000000002',
    'tml-x-yearn',
    'Turn Me Loose x Yearn 2023',
    'Mulan',
    'Turn Me Loose (NZ)',
    'Yearn (NZ)',
    'Stephen Gray Racing',
    'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
    6000.00,
    6489.00,
    65.00,
    325.00,
    5.00,
    1.00,
    0.50,
    10,
    10,
    0,
    'listed',
    'fourteen_day',
    'subscription_float',
    'evolution',
    'https://cdn.evolutionstables.nz/horses/tml-x-yearn/hero.jpg',
    'c704e0cb74e647a1539b617c421fdf31fa1600bc0d4a8c5a660411306f94bd0d',
    '4235dc4e5644a08603b1c6c4e02c83b8f43e86c4ec68a5bed1b7ef1998a58cfc',
    'https://cdn.evolutionstables.nz/docs/mulan-pds.pdf',
    'https://cdn.evolutionstables.nz/docs/mulan-sa.pdf'
),
(
    '11111111-0000-0000-0000-000000000003',
    'prudentia',
    'Prudentia (NZ)',
    'Prudentia',
    'Proisir (AUS)',
    'Little Bit Irish (NZ)',
    'Lance O''Sullivan & Andrew Scott',
    'Wexford Stables, Matamata, NZ',
    7500.00,
    8112.00,
    82.00,
    410.00,
    5.00,
    1.00,
    0.25,
    20,
    0,
    0,
    'fully_subscribed',
    'fourteen_day',
    'upfront',
    'tokinvest',
    'https://cdn.evolutionstables.nz/horses/prudentia/hero.jpg',
    'f4ec1f5450ca27115f9fa88cbf44e274c09eb25c85d0bd3590b93b9cdcbf21ab',
    '7237ef86408c8d126a800f158c717434abcc9277b655d1c74dd216bf451eafc7',
    'https://cdn.evolutionstables.nz/docs/prudentia-pds.pdf',
    'https://cdn.evolutionstables.nz/docs/prudentia-sa.pdf'
),
(
    '11111111-0000-0000-0000-000000000004',
    'hottathanafantasy',
    'Hottathanafantasy (NZ)',
    'Coco',
    'Contributer (IRE)',
    'Whiffle (USA)',
    'Lance O''Sullivan & Andrew Scott',
    'Wexford Stables, Matamata, NZ',
    7000.00,
    7571.00,
    76.00,
    380.00,
    5.00,
    1.00,
    0.25,
    20,
    0,
    0,
    'fully_subscribed',
    'fourteen_day',
    'upfront',
    'tokinvest',
    'https://cdn.evolutionstables.nz/horses/hottathanafantasy/hero.jpg',
    '95b363cd2a554e4c3ca308f07fd548fc070d839eae1d8c55b0b51179376f38e4',
    '92d990db9b776a32cbd69187fbb60a8488d093edd2f9d7b65fa16c8d75a83b8a',
    'https://cdn.evolutionstables.nz/docs/hotta-pds.pdf',
    'https://cdn.evolutionstables.nz/docs/hotta-sa.pdf'
),
(
    '11111111-0000-0000-0000-000000000005',
    'i-stole-a-manolo',
    'I Stole A Manolo (NZ)',
    'Manolo',
    'Satono Aladdin (JPN)',
    'Canuhandleajandal (NZ)',
    'Lance O''Sullivan & Andrew Scott',
    'Wexford Stables, Matamata, NZ',
    6500.00,
    7030.00,
    70.00,
    350.00,
    5.00,
    1.00,
    0.50,
    10,
    10,
    0,
    'coming_soon',
    'fourteen_day',
    'upfront',
    'evolution',
    'https://cdn.evolutionstables.nz/horses/i-stole-a-manolo/hero.jpg',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    'https://cdn.evolutionstables.nz/docs/manolo-pds.pdf',
    'https://cdn.evolutionstables.nz/docs/manolo-sa.pdf'
),
(
    '11111111-0000-0000-0000-000000000006',
    'first-gear',
    'First Gear (NZ)',
    'First Gear',
    'Derryn (AUS)',
    'A''Guin Ace (NZ)',
    'Stephen Gray Racing',
    'Copper Belt Lodge, 160 Green Road, RD6, Palmerston North 4476',
    7000.00,
    7571.00,
    76.00,
    380.00,
    10.00,
    1.00,
    1.00,
    10,
    0,
    0,
    'completed',
    'fourteen_day',
    'upfront',
    'tokinvest',
    'https://cdn.evolutionstables.nz/horses/first-gear/hero.jpg',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    'https://cdn.evolutionstables.nz/docs/first-gear-pds.pdf',
    'https://cdn.evolutionstables.nz/docs/first-gear-sa.pdf'
)
ON CONFLICT (slug) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    barn_name = EXCLUDED.barn_name,
    cost_monthly_nzd = EXCLUDED.cost_monthly_nzd,
    list_price_nzd = EXCLUDED.list_price_nzd,
    monthly_keep_unit_nzd = EXCLUDED.monthly_keep_unit_nzd,
    join_float_unit_nzd = EXCLUDED.join_float_unit_nzd,
    listed_stake_pct = EXCLUDED.listed_stake_pct,
    min_stake_pct = EXCLUDED.min_stake_pct,
    stake_step_pct = EXCLUDED.stake_step_pct,
    total_shares = EXCLUDED.total_shares,
    shares_available = EXCLUDED.shares_available,
    reserved_shares = EXCLUDED.reserved_shares,
    status = EXCLUDED.status,
    payment_style = EXCLUDED.payment_style,
    listing_platform = EXCLUDED.listing_platform,
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = now();

-- ------------------------------------------------------------------------------
-- 2. SEED AUTH USERS & PROFILES (public.profiles)
-- ------------------------------------------------------------------------------

-- Helper DO block to safely pre-populate auth.users and profiles
DO $$
DECLARE
    u_rec RECORD;
BEGIN
    FOR u_rec IN SELECT * FROM (VALUES
        ('22222222-0000-0000-0000-000000000003'::uuid, 'oli.lawsmather@googlemail.com', 'Oliver Laws Mather', '+44 7700 900123', 'cus_OliverMather', 'vs_OliverMather', '07474ad7a97ab09809798ec5da99dbc0a839c7966d519a0b3106965d4df14ab4', NULL::text),
        ('22222222-0000-0000-0000-000000000004'::uuid, 'nick.t.leak@gmail.com', 'Nicholas Leak', '+971 50 123 4567', 'cus_NickLeak', 'vs_NickLeak', '430aa2e3ac784dc443b95e7f8980e922c4d259bf15dd6a749265d069b775a332', NULL::text),
        ('22222222-0000-0000-0000-000000000005'::uuid, 'garethphiliplewis@gmail.com', 'Gareth Lewis', '+971 52 987 6543', 'cus_GarethLewis', 'vs_GarethLewis', 'd1b0666d34f2084ec3cc95337b5cf77f4979d253cb0c9cac98e18098848a4d2a', NULL::text),
        ('22222222-0000-0000-0000-000000000006'::uuid, 'm.woodside@hotmail.co.uk', 'Mark Woodside', '+44 7890 123456', 'cus_MarkWoodside', 'vs_MarkWoodside', '7d4450afca2f2b03ee30fe121a2c704f7f97ad41151b01cdf79337e287b3388c', NULL::text),
        ('22222222-0000-0000-0000-000000000007'::uuid, 'a_sharma83@hotmail.com', 'Amit Sharma', '+971 55 456 7890', 'cus_AmitSharma', 'vs_AmitSharma', '842eceb16f9800312a71b484c6bd26b6256d4e4962d922f1a5531226a3f7ff68', NULL::text),
        ('22222222-0000-0000-0000-000000000008'::uuid, 'Bjassoma@gmail.com', 'Belal Jassoma', '+971 50 789 0123', 'cus_BelalJassoma', 'vs_BelalJassoma', '95b363cd2a554e4c3ca308f07fd548fc070d839eae1d8c55b0b51179376f38e4', NULL::text),
        ('22222222-0000-0000-0000-000000000009'::uuid, 'stuartrbradley@outlook.com', 'Stuart Bradley', '+971 54 321 0987', 'cus_StuartBradley', 'vs_StuartBradley', '97e6b0a04ee52edfc61e57d158adee38c456aa45a568baeb2f26d3c6e16ff2be', NULL::text),
        ('22222222-0000-0000-0000-000000000010'::uuid, 'zaainab.kamran@gmail.com', 'Zainab Malik', '+971 56 654 3210', 'cus_ZainabMalik', 'vs_ZainabMalik', 'ac30acc3b3e445e6a56b00e9d13322bb906dad7e14c46d6e976a89db4290a6cf', NULL::text),
        ('22222222-0000-0000-0000-000000000011'::uuid, 'garrick.cowley@gmail.com', 'Garrick Cowley', '+852 9123 4567', 'cus_GarrickCowley', 'vs_GarrickCowley', '7ca9f42b58728e23d34faff30625ee75bf667164aa4768fe793aee0c05b76270', NULL::text),
        ('22222222-0000-0000-0000-000000000012'::uuid, 'laboosh1@mac.com', 'Caroline Labouchere', '+971 58 876 5432', 'cus_CarolineLabouchere', 'vs_CarolineLabouchere', '780c2d89e0c2e2abdfb22d8d88b016fc5b48577e2f84e118f5f9910469f98b14', NULL::text)
    ) AS t(id, email, full_name, phone, stripe_customer_id, stripe_verification_session_id, kyc_audit_digest, nztr_license_number)
    LOOP
        -- 1. Ensure auth.users row exists (if running in Supabase environment)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
            INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
            VALUES (
                u_rec.id,
                u_rec.email,
                jsonb_build_object('full_name', u_rec.full_name, 'phone', u_rec.phone),
                now(),
                now()
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                raw_user_meta_data = EXCLUDED.raw_user_meta_data;
        END IF;

        -- 2. Insert / Update public.profiles
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            phone,
            kyc_status,
            kyc_verified_at,
            stripe_customer_id,
            stripe_verification_session_id,
            kyc_audit_digest,
            nztr_license_number
        ) VALUES (
            u_rec.id,
            u_rec.email,
            u_rec.full_name,
            u_rec.phone,
            'verified',
            now(),
            u_rec.stripe_customer_id,
            u_rec.stripe_verification_session_id,
            u_rec.kyc_audit_digest,
            u_rec.nztr_license_number
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            kyc_status = EXCLUDED.kyc_status,
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            stripe_verification_session_id = EXCLUDED.stripe_verification_session_id,
            kyc_audit_digest = EXCLUDED.kyc_audit_digest,
            updated_at = now();
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 3. SEED LIVE HOLDINGS (public.holdings)
-- ------------------------------------------------------------------------------

INSERT INTO public.holdings (
    id,
    user_id,
    horse_id,
    stake_percentage,
    float_months_held,
    float_balance_nzd,
    monthly_keep_rate_nzd,
    stripe_subscription_id,
    status,
    signed_pds_hash,
    signed_sa_hash
) VALUES
-- Prudentia Holdings (5.00% Fully Subscribed / Paid Upfront)
(
    '33333333-0000-0000-0000-000000000004',
    '22222222-0000-0000-0000-000000000003', -- Oliver Mather (2.50%)
    '11111111-0000-0000-0000-000000000003', -- Prudentia
    2.50,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_oliver_prudentia',
    'active',
    '07474ad7a97ab09809798ec5da99dbc0a839c7966d519a0b3106965d4df14ab4',
    '3682e29b0f4e8ab3002943fb7d711b4016d1dd06cba34f84478dc9f513964e3a'
),
(
    '33333333-0000-0000-0000-000000000005',
    '22222222-0000-0000-0000-000000000004', -- Nick Leak (1.75%)
    '11111111-0000-0000-0000-000000000003', -- Prudentia
    1.75,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_nick_prudentia',
    'active',
    '430aa2e3ac784dc443b95e7f8980e922c4d259bf15dd6a749265d069b775a332',
    '6c5d3caf1a49c6ab8e375d08d838cad8ad128d77a92fa35bc662710ee3d628b8'
),
(
    '33333333-0000-0000-0000-000000000006',
    '22222222-0000-0000-0000-000000000005', -- Gareth Lewis (0.25%)
    '11111111-0000-0000-0000-000000000003', -- Prudentia
    0.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_gareth_prudentia',
    'active',
    'd1b0666d34f2084ec3cc95337b5cf77f4979d253cb0c9cac98e18098848a4d2a',
    '822c11b4e004986bf84153358255b49ec01dc6d8c82ee0c9078549991f97dff7'
),
(
    '33333333-0000-0000-0000-000000000007',
    '22222222-0000-0000-0000-000000000006', -- Mark Woodside (0.25%)
    '11111111-0000-0000-0000-000000000003', -- Prudentia
    0.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_mark_prudentia',
    'active',
    '7d4450afca2f2b03ee30fe121a2c704f7f97ad41151b01cdf79337e287b3388c',
    '1fcce42168392df8d81b198dcaaa1fc812410c4e5b492c9fdce82651b1bcad3f'
),
(
    '33333333-0000-0000-0000-000000000008',
    '22222222-0000-0000-0000-000000000007', -- Amit Sharma (0.25%)
    '11111111-0000-0000-0000-000000000003', -- Prudentia
    0.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_amit_prudentia',
    'active',
    '842eceb16f9800312a71b484c6bd26b6256d4e4962d922f1a5531226a3f7ff68',
    '9bff638868ca4a3f72daa776098111cd6d229f5ebb05f24e784aa006fca85b82'
),
-- Hottathanafantasy Holdings (5.00% Fully Subscribed / Paid Upfront)
(
    '33333333-0000-0000-0000-000000000009',
    '22222222-0000-0000-0000-000000000003', -- Oliver Mather (1.75%)
    '11111111-0000-0000-0000-000000000004', -- Coco
    1.75,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_oliver_hotta',
    'active',
    'fe97d86334bc74eefa8e809e6dfd5d0544534736d5b0482d0cb1d69c60585e8e',
    '3682e29b0f4e8ab3002943fb7d711b4016d1dd06cba34f84478dc9f513964e3a'
),
(
    '33333333-0000-0000-0000-000000000010',
    '22222222-0000-0000-0000-000000000004', -- Nick Leak (0.25%)
    '11111111-0000-0000-0000-000000000004', -- Coco
    0.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_nick_hotta',
    'active',
    '495a53c09cf0cacee6c1112bef7a4d958dabc633023cf43f6289366bf09def7d',
    '6c5d3caf1a49c6ab8e375d08d838cad8ad128d77a92fa35bc662710ee3d628b8'
),
(
    '33333333-0000-0000-0000-000000000011',
    '22222222-0000-0000-0000-000000000008', -- Belal Jassoma (1.25%)
    '11111111-0000-0000-0000-000000000004', -- Coco
    1.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_belal_hotta',
    'active',
    '95b363cd2a554e4c3ca308f07fd548fc070d839eae1d8c55b0b51179376f38e4',
    '92d990db9b776a32cbd69187fbb60a8488d093edd2f9d7b65fa16c8d75a83b8a'
),
(
    '33333333-0000-0000-0000-000000000012',
    '22222222-0000-0000-0000-000000000009', -- Stuart Bradley (1.00%)
    '11111111-0000-0000-0000-000000000004', -- Coco
    1.00,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_stuart_hotta',
    'active',
    '97e6b0a04ee52edfc61e57d158adee38c456aa45a568baeb2f26d3c6e16ff2be',
    'cfb53fec8b00a61da80aef0b04219bb2cc87a8657a637baa7c7936acfabbe237'
),
(
    '33333333-0000-0000-0000-000000000013',
    '22222222-0000-0000-0000-000000000010', -- Zainab Malik (0.25%)
    '11111111-0000-0000-0000-000000000004', -- Coco
    0.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_zainab_hotta',
    'active',
    'ac30acc3b3e445e6a56b00e9d13322bb906dad7e14c46d6e976a89db4290a6cf',
    '99034ae97adfdeb9c8e013f98a555fe7b5e6665a3ae236306754722960cddd02'
),
(
    '33333333-0000-0000-0000-000000000014',
    '22222222-0000-0000-0000-000000000011', -- Garrick Cowley (0.25%)
    '11111111-0000-0000-0000-000000000004', -- Coco
    0.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_garrick_hotta',
    'active',
    '7ca9f42b58728e23d34faff30625ee75bf667164aa4768fe793aee0c05b76270',
    'f082a0794462a809809a81b500cec0e0704407f4c4e8af83ce40362e563a49e8'
),
(
    '33333333-0000-0000-0000-000000000015',
    '22222222-0000-0000-0000-000000000012', -- Caroline Labouchere (0.25%)
    '11111111-0000-0000-0000-000000000004', -- Coco
    0.25,
    5.0,
    0.00,
    0.00,
    'sub_prepaid_caroline_hotta',
    'active',
    '780c2d89e0c2e2abdfb22d8d88b016fc5b48577e2f84e118f5f9910469f98b14',
    'f9afe0543d7cc1cb20d084cf11e1b30cadaf08181b398fbb8cdf07d3fe57fc9f'
)
ON CONFLICT (id) DO UPDATE SET
    stake_percentage = EXCLUDED.stake_percentage,
    float_balance_nzd = EXCLUDED.float_balance_nzd,
    monthly_keep_rate_nzd = EXCLUDED.monthly_keep_rate_nzd,
    status = EXCLUDED.status,
    updated_at = now();
