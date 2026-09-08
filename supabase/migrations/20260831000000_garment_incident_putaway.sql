-- Sự cố phải gắn với một mã suit cụ thể. Vị trí cũ được chụp lại để tra cứu
-- ngay cả khi sản phẩm đang ở khu sửa chữa hoặc chờ xếp lại kệ.
ALTER TABLE public.order_incidents
  ADD COLUMN IF NOT EXISTS garment_instance_id UUID REFERENCES public.garments_inventory(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS garment_code TEXT,
  ADD COLUMN IF NOT EXISTS previous_location_floor TEXT,
  ADD COLUMN IF NOT EXISTS previous_location_shelf TEXT,
  ADD COLUMN IF NOT EXISTS previous_location_tier TEXT;

CREATE INDEX IF NOT EXISTS idx_order_incidents_garment_instance
  ON public.order_incidents(garment_instance_id);

CREATE INDEX IF NOT EXISTS idx_order_incidents_garment_code
  ON public.order_incidents(garment_code);

COMMENT ON COLUMN public.order_incidents.garment_code IS
  'Mã suit/mã tài sản tại thời điểm phát sinh sự cố; không phụ thuộc việc còn liên kết inventory hay không.';

CREATE TABLE IF NOT EXISTS public.inventory_movement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garment_instance_id UUID NOT NULL REFERENCES public.garments_inventory(id) ON DELETE CASCADE,
  garment_code TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('OUTBOUND', 'INCIDENT', 'PUTAWAY')),
  from_floor TEXT,
  from_shelf TEXT,
  from_tier TEXT,
  to_floor TEXT,
  to_shelf TEXT,
  to_tier TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  incident_id UUID REFERENCES public.order_incidents(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movement_garment_code
  ON public.inventory_movement_history(garment_code, created_at DESC);

ALTER TABLE public.inventory_movement_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read inventory movement history" ON public.inventory_movement_history;
CREATE POLICY "Authenticated users can read inventory movement history"
  ON public.inventory_movement_history FOR SELECT TO authenticated USING (true);
