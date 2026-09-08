-- Drop trigger from T05
DROP TRIGGER IF EXISTS trigger_sync_contract_event_orders ON public.contracts;
DROP FUNCTION IF EXISTS public.sync_contract_event_orders();

-- Add event_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS event_id text;
