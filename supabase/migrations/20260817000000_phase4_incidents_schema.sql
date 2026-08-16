-- Migration: Phase 4 - Incidents & Liquidations Schema
-- Add liquidated_quantity to inventory_items
-- No strict enum check on installment_type is defined in previous migrations, it's just VARCHAR(50).
-- So we can safely insert 'COMPENSATION' as installment_type.

ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS liquidated_quantity INTEGER NOT NULL DEFAULT 0;

-- Optionally, add compensation_reason to payment_installments if it doesn't have a generic notes column
-- (Wait, payment_installments already has notes TEXT, so we can use it).
