import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { MyStableDashboard, type MyStableHolding } from '@/components/mystable-dashboard';

export default async function MyStablePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect('/login?next=/mystable');
  }

  const [{ data: profile }, { data: holdings, error: holdingsError }] = await Promise.all([
    supabase.from('profiles').select('kyc_status, email').eq('id', user.id).maybeSingle(),
    supabase
      .from('holdings')
      .select(
        'id, horse_id, stake_percentage, float_balance_nzd, monthly_keep_rate_nzd, status, signed_pds_hash, signed_sa_hash'
      )
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ]);

  const profileRow = profile as { kyc_status?: string; email?: string } | null;
  const holdingRows = (holdings ?? []) as MyStableHolding[];

  return (
    <MyStableDashboard
      userEmail={user.email ?? profileRow?.email ?? ''}
      kycStatus={profileRow?.kyc_status ?? 'unverified'}
      holdings={holdingRows}
      lookupError={holdingsError?.message ?? null}
    />
  );
}
