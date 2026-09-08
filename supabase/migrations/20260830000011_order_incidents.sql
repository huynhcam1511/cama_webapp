CREATE TABLE IF NOT EXISTS public.order_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  incident_type TEXT NOT NULL DEFAULT 'DAMAGE',
  description TEXT NOT NULL,
  penalty_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  deduct_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  extra_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  bill_image TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Một số môi trường chưa chạy migration QA cũ; đảm bảo cột nguồn tồn tại
-- trước khi chuyển dữ liệu sự cố JSON sang bảng mới.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS qa_incidents JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_order_incidents_order_id ON public.order_incidents(order_id);
CREATE INDEX IF NOT EXISTS idx_order_incidents_status ON public.order_incidents(status);

-- Đưa các sự cố JSON cũ sang bảng mới để màn hình theo dõi không mất lịch sử.
INSERT INTO public.order_incidents (
  id, order_id, contract_id, incident_type, description, penalty_amount,
  deduct_amount, extra_amount, bill_image, status, created_at
)
SELECT
  CASE WHEN incident->>'id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    THEN (incident->>'id')::uuid ELSE gen_random_uuid() END,
  orders.id,
  orders.contract_id,
  COALESCE(NULLIF(incident->>'type', ''), 'DAMAGE'),
  COALESCE(NULLIF(incident->>'description', ''), 'Sự cố chưa có mô tả'),
  COALESCE(NULLIF(incident->>'penalty_amount', '')::numeric, 0),
  COALESCE(NULLIF(incident->>'deductAmount', '')::numeric, 0),
  COALESCE(NULLIF(incident->>'extraAmount', '')::numeric, 0),
  NULLIF(incident->>'bill_image', ''),
  'OPEN',
  COALESCE(NULLIF(incident->>'reported_at', '')::timestamptz, orders.updated_at, orders.created_at, NOW())
FROM public.orders
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(orders.qa_incidents, '[]'::jsonb)) incident
WHERE NOT EXISTS (
  SELECT 1 FROM public.order_incidents existing
  WHERE existing.order_id = orders.id
    AND existing.description = incident->>'description'
    AND existing.penalty_amount = COALESCE(NULLIF(incident->>'penalty_amount', '')::numeric, 0)
);

ALTER TABLE public.order_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read order incidents" ON public.order_incidents;
CREATE POLICY "Authenticated users can read order incidents"
  ON public.order_incidents FOR SELECT TO authenticated USING (true);

INSERT INTO public.modules (module_code, module_name, route, icon, sort_order, is_active)
VALUES ('ORDER_INCIDENTS', 'Theo dõi sự cố đơn hàng', '/dashboard/order-incidents', 'Siren', 117, true)
ON CONFLICT (module_code) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  route = EXCLUDED.route,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, true, true
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.role_code IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  AND m.module_code = 'ORDER_INCIDENTS'
ON CONFLICT (role_id, module_id) DO UPDATE SET
  can_view = true,
  can_create = true,
  can_update = true,
  can_delete = true;

-- Nhân viên đã được cấp Xem/Thêm Đơn hàng sẽ tự thấy và ghi nhận sự cố.
-- Không tự cấp quyền Sửa sự cố; quyền đó dành cho người được phân công follow.
INSERT INTO public.user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT permission.user_id, target.id, true, true, false, false
FROM public.user_permissions permission
JOIN public.modules source ON source.id = permission.module_id AND source.module_code = 'ORDERS'
CROSS JOIN public.modules target
WHERE target.module_code = 'ORDER_INCIDENTS'
  AND (permission.can_view OR permission.can_create)
ON CONFLICT (user_id, module_id) DO UPDATE SET
  can_view = public.user_permissions.can_view OR EXCLUDED.can_view,
  can_create = public.user_permissions.can_create OR EXCLUDED.can_create,
  updated_at = NOW();
