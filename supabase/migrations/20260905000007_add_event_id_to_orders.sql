-- Add event_id to orders to sync from contracts schedules

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS event_id TEXT;

-- Create a unique constraint to allow upserting during sync
-- Note: A contract can have multiple schedules (events), each maps to an order.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_contract_event_order'
    ) THEN
        ALTER TABLE public.orders
        ADD CONSTRAINT unique_contract_event_order UNIQUE (contract_id, event_id);
    END IF;
END $$;
