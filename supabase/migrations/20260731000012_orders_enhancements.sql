-- ==========================================
-- CAMA WEDDING STUDIO - PHASE 12: ORDERS ENHANCEMENTS
-- ==========================================

-- 1. Cập nhật bảng Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS pic_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_value NUMERIC(15,2) DEFAULT 0;

-- Cập nhật comment giải thích completion_status mới
COMMENT ON COLUMN public.orders.completion_status IS 'PENDING, PREPARING, WAITING_FITTING, READY_TO_DELIVER, DELIVERED, WAITING_RETURN, COMPLETED, ISSUE';

-- 2. Mock Data Update
UPDATE public.orders 
SET 
    service_type = 'Thuê Váy Cưới',
    pic_id = (SELECT id FROM public.users LIMIT 1),
    total_value = 15000000,
    completion_status = 'PENDING'
WHERE order_code = 'ORD-001';
