-- ==========================================
-- SCRIPT TẠO DANH MỤC PHÒNG BAN VÀO MASTER DATA
-- Chạy script này trong Supabase SQL Editor
-- ==========================================

DELETE FROM master_data WHERE type = 'DEPARTMENT';

-- CẤP 1: CÁC PHÒNG BAN CHÍNH
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DEPARTMENT', 'DEP_BOD', 'Ban Giám Đốc', NULL, 1),
('DEPARTMENT', 'DEP_HR', 'Phòng Nhân Sự', NULL, 2),
('DEPARTMENT', 'DEP_FINANCE', 'Phòng Kế Toán - Tài Chính', NULL, 3),
('DEPARTMENT', 'DEP_SALES', 'Phòng Kinh Doanh', NULL, 4),
('DEPARTMENT', 'DEP_MARKETING', 'Phòng Marketing', NULL, 5),
('DEPARTMENT', 'DEP_OP', 'Phòng Vận Hành & CSKH', NULL, 6);

-- CẤP 2: CÁC TỔ / NHÓM TRỰC THUỘC (Ví dụ)
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DEPARTMENT', 'DEP_SALES_B2B', 'Nhóm Khách hàng Doanh nghiệp (B2B)', 'DEP_SALES', 1),
('DEPARTMENT', 'DEP_SALES_B2C', 'Nhóm Khách hàng Bán lẻ (B2C)', 'DEP_SALES', 2),
('DEPARTMENT', 'DEP_MKT_CONTENT', 'Nhóm Content', 'DEP_MARKETING', 1),
('DEPARTMENT', 'DEP_MKT_ADS', 'Nhóm Chạy Ads', 'DEP_MARKETING', 2);
