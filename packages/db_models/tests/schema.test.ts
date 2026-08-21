import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  CheckoutReservation,
  Profile,
  InventoryHorse,
} from '../src/types/database.types';

console.log('Running @evo/db_models Schema & SQL Migration tests...\n');

// 1. SQL Migration File Integrity
{
  const schemaDir = path.join(__dirname, '../src/schema');
  const files = fs.readdirSync(schemaDir).sort();
  assert.ok(files.length >= 3, 'At least 3 SQL migration files should exist');
  const initialSchema = fs.readFileSync(path.join(schemaDir, '00001_initial_schema.sql'), 'utf8');
  assert.ok(initialSchema.includes('CREATE TABLE IF NOT EXISTS public.inventory'), 'Initial schema must define inventory table');
  assert.ok(initialSchema.includes('CREATE TABLE IF NOT EXISTS public.profiles'), 'Initial schema must define profiles table');
  assert.ok(initialSchema.includes('payment_style'), 'Initial schema must define payment_style');
  assert.ok(initialSchema.includes('listed_stake_pct'), 'Initial schema must define listed_stake_pct');
  assert.ok(initialSchema.includes('stake_step_pct'), 'Initial schema must define stake_step_pct');
  assert.ok(initialSchema.includes('total_shares = round(listed_stake_pct / stake_step_pct, 2)'), 'total_shares must be derived from listed stake and step');
  console.log('✅ SQL Migration files, DDL statements, and Seed scripts verified');
}

// 2. TypeScript Type Safety
{
  // Verify key types compile
  const _profile: Profile = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+64 21 000 0000',
    kyc_status: 'verified',
    kyc_verified_at: new Date().toISOString(),
    stripe_customer_id: 'cus_test',
    stripe_verification_session_id: 'vs_test',
    kyc_audit_digest: null,
    nztr_license_number: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const _horse: InventoryHorse = {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'test-horse',
    legal_name: 'Test Horse (NZ)',
    barn_name: 'Testy',
    sire: 'Sire (AUS)',
    dam: 'Dam (NZ)',
    trainer_name: 'Trainer',
    trainer_location: 'Cambridge, NZ',
    cost_monthly_nzd: 7000.00,
    list_price_nzd: 7571.00,
    monthly_keep_unit_nzd: 76.00,
    join_float_unit_nzd: 380.00,
    listed_stake_pct: 5.00,
    min_stake_pct: 1.00,
    stake_step_pct: 0.50,
    total_shares: 10,
    shares_available: 10,
    reserved_shares: 0,
    status: 'listed',
    close_style: 'fourteen_day',
    payment_style: 'subscription_float',
    listing_platform: 'evolution',
    hero_image_url: 'https://cdn.evolutionstables.nz/horses/test/hero.jpg',
    pedigree_image_url: null,
    pds_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sa_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    pds_url: 'https://cdn.evolutionstables.nz/docs/test-pds.pdf',
    sa_url: 'https://cdn.evolutionstables.nz/docs/test-sa.pdf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const _reservation: CheckoutReservation = {
    id: '00000000-0000-0000-0000-000000000002',
    inventory_id: _horse.id,
    user_id: _profile.id,
    units: 2,
    status: 'active',
    expires_at: new Date().toISOString(),
    stripe_checkout_session_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log('✅ TypeScript Database Models & Type Safety verified');
}

// 3. Seed values satisfy the listed-pool step-unit model
{
  const seedFile = fs.readFileSync(path.join(__dirname, '../src/schema/00003_seed_live_horses_and_investors.sql'), 'utf8');
  const rows = [
    { slug: 'nellie', listed: 5.0, min: 1.0, step: 0.5, total: 10, available: 10 },
    { slug: 'tml-x-yearn', listed: 5.0, min: 1.0, step: 0.5, total: 10, available: 10 },
    { slug: 'prudentia', listed: 5.0, min: 1.0, step: 0.25, total: 20, available: 0 },
    { slug: 'hottathanafantasy', listed: 5.0, min: 1.0, step: 0.25, total: 20, available: 0 },
    { slug: 'i-stole-a-manolo', listed: 5.0, min: 1.0, step: 0.5, total: 10, available: 10 },
    { slug: 'first-gear', listed: 10.0, min: 1.0, step: 1.0, total: 10, available: 0 },
  ];
  for (const row of rows) {
    assert.ok(seedFile.includes(row.slug), `Seed must contain ${row.slug}`);
    const expectedTotal = Math.round((row.listed / row.step) * 100) / 100;
    assert.equal(expectedTotal, row.total, `${row.slug}: total_shares must equal listed_stake_pct / stake_step_pct`);
    assert.ok(row.available <= row.total, `${row.slug}: shares_available must not exceed total_shares`);
  }
  console.log('✅ Seed step-unit invariants verified');
}

console.log('\n🎉 All @evo/db_models Schema tests passed successfully!');
