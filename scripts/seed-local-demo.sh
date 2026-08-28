#!/usr/bin/env bash
# Seed local demo data for evo_02 click-through. Run after every
# `supabase stop && supabase start` (each restart wipes the local volume).
#
# Creates/updates: alex@evolutionstables.nz (password: nellie-demo-2026),
# their profile, and one active Nellie holding (2% @ $76/mo, $760 float —
# figures from the real pricing engine: $7000 wholesale, 5%+3% fees).
#
# Usage: scripts/seed-local-demo.sh

set -euo pipefail
cd "$(dirname "$0")/.."

export PGPASSWORD=postgres
DB="psql -h localhost -p 54322 -U postgres -d postgres -tAc"
SR=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' apps/web/.env.local | cut -d= -f2-)

ALEX_ID=$($DB "select id from profiles where email='alex@evolutionstables.nz' limit 1" | tr -d '[:space:]')
if [ -z "$ALEX_ID" ]; then
  ALEX_ID=$(curl -s -X POST "http://localhost:54321/auth/v1/admin/users" \
    -H "apikey: $SR" -H "Authorization: Bearer $SR" -H "Content-Type: application/json" \
    -d '{"email":"alex@evolutionstables.nz","password":"nellie-demo-2026","email_confirm":true}' \
    | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
  echo "created auth user: $ALEX_ID"
else
  echo "auth user exists: $ALEX_ID"
fi

$DB "INSERT INTO profiles (id, email, kyc_status) VALUES ('$ALEX_ID','alex@evolutionstables.nz','unverified') ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email" >/dev/null
$DB "INSERT INTO holdings (user_id, horse_id, stake_percentage, float_months_held, float_balance_nzd, monthly_keep_rate_nzd, status, signed_pds_hash, signed_sa_hash)
SELECT '$ALEX_ID','11111111-0000-0000-0000-000000000001',2.00,5,760.00,76.00,'active',repeat('a',64),repeat('b',64)
WHERE NOT EXISTS (SELECT 1 FROM holdings WHERE user_id='$ALEX_ID' AND horse_id='11111111-0000-0000-0000-000000000001')" >/dev/null

echo "profiles=$($DB 'select count(*) from profiles')  holdings=$($DB 'select count(*) from holdings')"
echo "done — sign in at http://localhost:3010/login"