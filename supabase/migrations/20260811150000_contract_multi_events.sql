-- ====================================================================
-- CAMA WEDDING STUDIO - ADD MULTI-EVENTS CAPABILITY TO CONTRACTS
-- ====================================================================

-- 1. Extend contracts table with events (JSONB)
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;

-- 2. Extend contract_items table with usage_events (JSONB array of strings)
ALTER TABLE public.contract_items
  ADD COLUMN IF NOT EXISTS usage_events JSONB DEFAULT '[]'::jsonb;
