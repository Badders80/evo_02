// apps/web/src/lib/subscription-webhook.ts
import { getSupabaseServiceClient } from '@/lib/supabase-server';
import { HttpError } from '@/lib/nellie-loop';
import { resetFloat } from '@/lib/float-reset';

const SUBSCRIPTION_EVENTS = new Set([
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export function isSubscriptionEvent(eventType: string): boolean {
  return SUBSCRIPTION_EVENTS.has(eventType);
}

/** Stripe subscription status → holding_status enum (00001: holding_status). */
export function holdingStatusForSubscription(status: string): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled';
    case 'unpaid':
    case 'past_due':
    case 'paused':
      return 'paused';
    default:
      return 'active';
  }
}

export async function handleSubscriptionEvent(subscription: Record<string, unknown>): Promise<void> {
  const subscriptionId = String(subscription.id ?? '');
  if (!subscriptionId) {
    throw new HttpError(400, 'INVALID_SUBSCRIPTION_EVENT', 'Subscription event missing id');
  }
  const status = String(subscription.status ?? '');
  const holdingStatus = holdingStatusForSubscription(status);

  const admin = getSupabaseServiceClient();
  const patch: Record<string, unknown> = { status: holdingStatus };
  if (holdingStatus === 'active') {
    patch.float_months_held = resetFloat(0);
  }
  const { error } = await admin
    .from('holdings')
    .update(patch)
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    throw new HttpError(500, 'HOLDING_UPDATE_FAILED', error.message);
  }
}
