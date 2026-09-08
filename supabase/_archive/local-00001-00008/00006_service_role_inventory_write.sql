-- 00006_service_role_inventory_write.sql
-- service_role needs INSERT/DELETE on inventory for the campaign publish
-- pipeline (createCampaignFromIntake) and its e2e-wire cleanup walks.
-- Prior migration 00001 granted only SELECT, UPDATE (webhook-era scope).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO service_role;
