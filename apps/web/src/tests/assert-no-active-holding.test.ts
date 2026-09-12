// apps/web/src/tests/assert-no-active-holding.test.ts
import { strict as assert } from 'node:assert';
import { assertNoActiveHolding, HttpError } from '../lib/nellie-loop';

// Mock the Supabase service client - we only need the part used by assertNoActiveHolding
const createMockSupabaseClient = (holdingsData: { id: string } | null, error: any = null) => {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: holdingsData, error })
            })
          })
        })
      })
    })
  } as any; // We don't need the full client, just the part we use.
};

async function test_throws_when_active_holding_exists() {
  const adminClient = createMockSupabaseClient({ id: 'holding-123' });
  try {
    await assertNoActiveHolding(adminClient, 'user-1', 'horse-1');
    throw new Error('Expected HttpError to be thrown');
  } catch (err) {
    assert(err instanceof HttpError);
    assert.strictEqual(err.status, 409);
    assert.strictEqual(err.code, 'ALREADY_HELD');
    assert.strictEqual(err.message, 'You already have an active stake in this horse');
  }
}

async function test_passes_when_no_holding() {
  const adminClient = createMockSupabaseClient(null);
  await assertNoActiveHolding(adminClient, 'user-1', 'horse-1');
  // Should not throw
}

async function test_passes_when_holding_is_not_active() {
  // Simulate a holding with status != 'active' (e.g., 'closed')
  // The query only returns rows where status = 'active', so if there's a holding but with a different status, it returns null.
  const adminClient = createMockSupabaseClient(null);
  await assertNoActiveHolding(adminClient, 'user-1', 'horse-1');
  // Should not throw
}

async function runTests() {
  await test_throws_when_active_holding_exists();
  await test_passes_when_no_holding();
  await test_passes_when_holding_is_not_active();
  console.log('✅ assert-no-active-holding tests passed');
}

runTests().catch((err) => {
  console.error('❌ assert-no-active-holding test failed:', err);
  process.exit(1);
});