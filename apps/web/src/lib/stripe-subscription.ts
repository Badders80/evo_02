// apps/web/src/lib/stripe-subscription.ts
export interface SubscriptionCheckoutInput {
  userEmail: string;
  legalName: string;
  units: number;
  monthlyKeepUnitNzd: number;
  joinFloatUnitNzd: number;
  origin: string;
  metadata: Record<string, string>;
}

export function buildSubscriptionCheckoutParams(input: SubscriptionCheckoutInput): URLSearchParams {
  const p = new URLSearchParams();
  p.append('mode', 'subscription');
  p.append('customer_email', input.userEmail);
  p.append('success_url', `${input.origin}/mystable?checkout=success&slug=${input.metadata.horse_slug}&units=${input.units}`);
  p.append('cancel_url', `${input.origin}/marketplace/${input.metadata.horse_slug}?units=${input.units}`);

  // Recurring monthly keep (M).
  p.append('line_items[0][price_data][currency]', 'nzd');
  p.append('line_items[0][price_data][recurring][interval]', 'month');
  p.append('line_items[0][price_data][product_data][name]', `${input.legalName} (${input.units}% Stake)`);
  p.append('line_items[0][price_data][product_data][description]', `Monthly keep for ${input.legalName}`);
  p.append('line_items[0][price_data][unit_amount]', String(Math.round(input.monthlyKeepUnitNzd * 100)));
  p.append('line_items[0][quantity]', '1');

  // One-time join float (5×M) on the first invoice, as a second line item.
  // subscription_data[add_invoice_items] is rejected (400 parameter_unknown) by
  // the account's API version (2026-03-25.dahlia); a one-time line_items entry
  // alongside the recurring one is accepted and lands on the first invoice.
  p.append('line_items[1][price_data][currency]', 'nzd');
  p.append('line_items[1][price_data][product_data][name]', `${input.legalName} — Join Float (5×M)`);
  p.append('line_items[1][price_data][unit_amount]', String(Math.round(input.joinFloatUnitNzd * 100)));
  p.append('line_items[1][quantity]', '1');

  for (const [k, v] of Object.entries(input.metadata)) {
    p.append(`metadata[${k}]`, v);
  }
  return p;
}
