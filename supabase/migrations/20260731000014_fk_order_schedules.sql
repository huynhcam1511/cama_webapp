-- ==========================================
-- CAMA WEDDING STUDIO - PHASE 14: FOREIGN KEY ORDER SCHEDULES
-- ==========================================

-- Thêm khóa ngoại cho bảng operation_schedules liên kết với orders
ALTER TABLE public.operation_schedules 
ADD CONSTRAINT fk_operation_schedules_order 
FOREIGN KEY (order_id) 
REFERENCES public.orders(id) 
ON DELETE CASCADE;
