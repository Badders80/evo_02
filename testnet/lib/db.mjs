// testnet/lib/db.mjs — local Supabase access for the walk.
// All reads return parsed JSON (psql prints json_build_object as text, so no fragile
// column splitting and no values lost to pipe characters).
import { execFileSync } from 'node:child_process';

const CONTAINER = process.env.TESTNET_DB_CONTAINER || 'supabase_db_evo_02';

/** Raw text result of a statement. */
export function sql(statement) {
  return execFileSync(
    'docker',
    ['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-tAc', statement],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }
  ).trim();
}

/** Runs a `select json_build_object(...)` and parses it. Returns null for SQL NULL. */
export function json(statement) {
  const out = sql(statement);
  return out && out !== 'null' ? JSON.parse(out) : null;
}

export function inventory(slug) {
  return json(
    `select json_build_object(
       'slug', slug, 'status', status,
       'sharesAvailable', shares_available, 'reservedShares', reserved_shares,
       'listedStakePct', listed_stake_pct,
       'docs', term_sheet_status || '/' || pds_status || '/' || sa_status
     )::text from inventory where slug = '${slug}'`
  );
}

export function holding(userId, inventoryId) {
  return json(
    `select json_build_object(
       'id', id, 'stakePercentage', stake_percentage, 'floatMonthsHeld', float_months_held,
       'floatBalanceNzd', float_balance_nzd, 'monthlyKeepNzd', monthly_keep_rate_nzd,
       'signedPdsHash', signed_pds_hash, 'signedSaHash', signed_sa_hash,
       'subscriptionId', stripe_subscription_id, 'status', status,
       'createdAt', created_at
     )::text from holdings where user_id = '${userId}' and horse_id = '${inventoryId}'
     order by created_at desc limit 1`
  );
}

export function holdingCount(userId, inventoryId) {
  return Number(sql(`select count(*) from holdings where user_id = '${userId}' and horse_id = '${inventoryId}'`));
}

export function reservationBySession(sessionId) {
  return json(
    `select json_build_object('id', id, 'units', units, 'status', status, 'expiresAt', expires_at)::text
     from checkout_reservations where stripe_checkout_session_id = '${sessionId}'`
  );
}

export function reservationById(id) {
  return json(
    `select json_build_object('id', id, 'units', units, 'status', status, 'expiresAt', expires_at)::text
     from checkout_reservations where id = '${id}'`
  );
}

/** The webhook's idempotency record for a session's checkout.session.completed event. */
export function completedEvent(sessionId) {
  return json(
    `select json_build_object('eventId', stripe_event_id, 'eventType', event_type,
       'processed', processed, 'errorMessage', coalesce(error_message, ''))::text
     from events where event_type = 'checkout.session.completed' and payload::text like '%${sessionId}%'
     order by created_at desc limit 1`
  );
}

export function profileByEmail(email) {
  return json(
    `select json_build_object('id', id, 'email', email, 'fullName', coalesce(full_name, ''),
       'kycStatus', coalesce(kyc_status::text, ''))::text from profiles where email = '${email}'`
  );
}

// ---- fixture writes the runner is allowed to make (all reversible) ----

export function setStatus(slug, status) {
  sql(`update inventory set status = '${status}' where slug = '${slug}'`);
}

/** Frees units held by reservations past their TTL. Nothing in the app calls this today. */
export function releaseExpiredReservations() {
  return Number(sql('select release_expired_reservations()'));
}

/**
 * Re-arms the walk's fixture so the rig is repeatable: the walk deliberately buys out the
 * ENTIRE remaining stake, so without this a second run has nothing left to buy. Local test
 * DB only; touches this one horse's row and its own expired reservations.
 */
export function rearmFixtures(slug, inventoryId, shares, reserved) {
  const released = releaseExpiredReservations();
  sql(`update inventory set shares_available = ${shares}, reserved_shares = ${reserved} where id = '${inventoryId}' and slug = '${slug}'`);
  return { released, shares, reserved };
}

/** Clears the runner's own artifacts so a rerun starts clean (never touches other users). */
export function clearSessionArtifacts(sessionId) {
  sql(`delete from events where payload::text like '%${sessionId}%' and event_type <> 'checkout.session.completed'`);
}
