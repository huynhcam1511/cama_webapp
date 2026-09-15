-- Split operational orders by contract event and specialist department.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS event_id TEXT,
  ADD COLUMN IF NOT EXISTS operational_department VARCHAR(30);

COMMENT ON COLUMN public.orders.operational_department IS
  'Responsible room: VAY (Phòng Váy), SUOT (Phòng Suốt), or VAN_HANH.';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS unique_contract_event_order;

CREATE UNIQUE INDEX IF NOT EXISTS unique_contract_event_department_order
  ON public.orders (contract_id, event_id, operational_department)
  WHERE contract_id IS NOT NULL AND event_id IS NOT NULL AND operational_department IS NOT NULL;

-- Photos remain grouped in orders.notes.images under evidence_delivery and
-- evidence_return, preserving compatibility with the existing QC photo data.
