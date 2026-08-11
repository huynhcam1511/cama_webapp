-- ==========================================
-- CAMA WEDDING STUDIO - CSKH & ORDERS UPDATE
-- ==========================================

-- 1. TẠO BẢNG CHĂM SÓC KHÁCH HÀNG (CUSTOMER_CARE_LOGS)
CREATE TABLE IF NOT EXISTS public.customer_care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    lifecycle_stage VARCHAR(255),
    notes TEXT,
    care_datetime TIMESTAMP WITH TIME ZONE,
    care_group VARCHAR(100), -- Giấy tờ, Tài chính, Sản phẩm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- RLS for customer_care_logs
ALTER TABLE public.customer_care_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for all users" ON public.customer_care_logs FOR ALL USING (true);

-- 2. CẬP NHẬT BẢNG ORDERS
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_datetime TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS proof_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS quality_check_before BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quality_check_after BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS responsibility_marks JSONB DEFAULT '[]'::jsonb;

-- Cập nhật Role Permissions cho customer_care_logs nếu cần
-- (Mặc định admin/manager được toàn quyền do policy ở trên là FOR ALL, tuy nhiên tốt nhất nên cấp quyền chuẩn qua RBAC)
