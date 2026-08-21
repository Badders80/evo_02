/** Canonical inventory UUIDs (mirror of packages/db_models/src/schema/00003_seed_live_horses_and_investors.sql). */
export const NELLIE_INVENTORY_ID = '11111111-0000-0000-0000-000000000001';

export const INVENTORY_UUID_BY_SLUG: Record<string, string> = {
  nellie: NELLIE_INVENTORY_ID,
  'tml-x-yearn': '11111111-0000-0000-0000-000000000002',
  prudentia: '11111111-0000-0000-0000-000000000003',
  hottathanafantasy: '11111111-0000-0000-0000-000000000004',
  'i-stole-a-manolo': '11111111-0000-0000-0000-000000000005',
  'first-gear': '11111111-0000-0000-0000-000000000006',
};

export function getInventoryId(slug: string): string | undefined {
  return INVENTORY_UUID_BY_SLUG[slug];
}
