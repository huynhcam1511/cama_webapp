-- ==========================================
-- CAMA WEDDING STUDIO - PHASE 11: ORDERS & CSKH
-- ==========================================

-- 1. TẠO BẢNG ĐƠN HÀNG VẬN HÀNH (ORDERS)
-- Bắt buộc phải gắn với 1 Hợp đồng (contract_id)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    event_date DATE, -- Ngày sử dụng chính (Ngày cưới / Ngày chụp)
    return_date DATE, -- Ngày trả đồ
    delivery_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING (Chờ giao), DELIVERED (Đã giao), RETURNED (Đã thu hồi)
    completion_status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS (Đang xử lý), COMPLETED (Hoàn thành), CANCELLED (Hủy)
    checklist JSONB DEFAULT '[]'::jsonb, -- Danh sách công việc cần chuẩn bị (Ví dụ: [{"task": "Lấy váy A", "done": false}])
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for all users" ON public.orders FOR ALL USING (true);

-- 2. CẤP QUYỀN RBAC CHO MODULE CHĂM SÓC KHÁCH HÀNG (CUSTOMER_SERVICE)
INSERT INTO public.modules (module_code, module_name, route, icon, sort_order, is_active) 
VALUES ('CUSTOMER_SERVICE', 'Chăm sóc khách hàng', '/dashboard/customer-service', 'HeartHandshake', 25, true)
ON CONFLICT (module_code) DO UPDATE SET 
    module_name = EXCLUDED.module_name,
    route = EXCLUDED.route,
    icon = EXCLUDED.icon;

-- Cấp quyền mặc định cho CUSTOMER_SERVICE
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, true, true
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.role_code IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER') 
  AND m.module_code = 'CUSTOMER_SERVICE'
ON CONFLICT (role_id, module_id) 
DO UPDATE SET can_view = true, can_create = true, can_update = true, can_delete = true;

-- 3. MOCK DATA (Tạo một Order nháp cho HD-001 nếu đã có)
INSERT INTO public.orders (order_code, contract_id, event_date, return_date, delivery_status, checklist)
SELECT 'ORD-001', id, '2026-10-15', '2026-10-17', 'PENDING', '[{"task": "Gửi váy soiree trắng", "done": false}, {"task": "Gửi vest nam size L", "done": true}]'::jsonb
FROM public.contracts WHERE contract_code = 'HD-001'
ON CONFLICT DO NOTHING;
