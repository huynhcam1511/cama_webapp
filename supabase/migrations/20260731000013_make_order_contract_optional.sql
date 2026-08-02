-- ==========================================
-- CAMA WEDDING STUDIO - PHASE 13: OPTIONAL CONTRACT FOR ORDERS
-- ==========================================

-- Bỏ ràng buộc NOT NULL của cột contract_id trong bảng orders
ALTER TABLE public.orders ALTER COLUMN contract_id DROP NOT NULL;
