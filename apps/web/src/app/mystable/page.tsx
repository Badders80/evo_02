import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { MyStableDashboard, type MyStableHolding } from '@/components/mystable-dashboard';
import { getAllCampaigns, type HorseCampaign } from '@/lib/horses-data';
import { INVENTORY_UUID_BY_SLUG } from '@/lib/inventory-ids';

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

  const allCampaigns = await getAllCampaigns();
  const campaignsByHorseId: Record<string, HorseCampaign> = {};
  const slugToId: Record<string, string> = {};
  for (const [slug, id] of Object.entries(INVENTORY_UUID_BY_SLUG)) {
    slugToId[slug] = id;
  }
  for (const campaign of allCampaigns) {
    const id = slugToId[campaign.slug];
    if (id) {
      campaignsByHorseId[id] = campaign;
    }
  }

  return (
    <MyStableDashboard
      userEmail={user.email ?? profileRow?.email ?? ''}
      kycStatus={profileRow?.kyc_status ?? 'unverified'}
      holdings={holdingRows}
      lookupError={holdingsError?.message ?? null}
      campaigns={campaignsByHorseId}
    />
  );
}
