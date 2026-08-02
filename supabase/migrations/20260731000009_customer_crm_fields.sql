-- PHASE 9: Nâng cấp trường thông tin Quản lý Leads (Customers)

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS lead_status VARCHAR(50) DEFAULT 'Mới',
ADD COLUMN IF NOT EXISTS budget VARCHAR(100),
ADD COLUMN IF NOT EXISTS social_link VARCHAR(255);

-- Cập nhật trạng thái mặc định cho các khách hàng cũ (nếu có)
UPDATE public.customers SET lead_status = 'Mới' WHERE lead_status IS NULL;
