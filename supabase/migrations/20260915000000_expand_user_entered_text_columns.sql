-- User-entered CRM and contract descriptions must not be constrained to legacy
-- 20-character columns. TEXT also repairs environments whose schema drifted
-- from the canonical migrations.
ALTER TABLE IF EXISTS public.customers
  ALTER COLUMN bride_name TYPE TEXT,
  ALTER COLUMN groom_name TYPE TEXT,
  ALTER COLUMN source TYPE TEXT,
  ALTER COLUMN notes TYPE TEXT;

ALTER TABLE IF EXISTS public.contracts
  ALTER COLUMN notes TYPE TEXT;

ALTER TABLE IF EXISTS public.contract_items
  ALTER COLUMN category TYPE TEXT,
  ALTER COLUMN item_name TYPE TEXT,
  ALTER COLUMN notes TYPE TEXT;

ALTER TABLE IF EXISTS public.contract_services
  ALTER COLUMN service_name TYPE TEXT,
  ALTER COLUMN notes TYPE TEXT;
