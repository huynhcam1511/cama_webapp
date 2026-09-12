-- ==========================================
-- SCRIPT TẠO DANH MỤC DỰA TRÊN YÊU CẦU CỦA SẾP
-- Chạy script này trong Supabase SQL Editor
-- ==========================================

-- Xóa dữ liệu cũ (nếu bạn muốn làm sạch bảng trước khi nạp data mới)
-- Chỉ xóa những dòng thuộc DOCUMENT_TYPE để không ảnh hưởng dữ liệu khác
DELETE FROM master_data WHERE type = 'DOCUMENT_TYPE';

-- --------------------------------------------------------
-- CẤP 1: CÁC NHÓM CHÍNH SÁCH LỚN (Không có parent_code)
-- --------------------------------------------------------
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'CS_NHAN_SU', 'Chính sách Nhân sự', NULL, 1),
('DOCUMENT_TYPE', 'CS_LUONG_THUONG', 'Chính sách Lương & Thưởng', NULL, 2);

-- --------------------------------------------------------
-- CẤP 2: LĨNH VỰC BÊN TRONG CẤP 1
-- --------------------------------------------------------
-- 1. Trực thuộc [Chính sách Nhân sự]
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'CS_NS_NOI_QUY', 'Nội quy lao động', 'CS_NHAN_SU', 1),
('DOCUMENT_TYPE', 'CS_NS_JD', 'Mô tả công việc (JD)', 'CS_NHAN_SU', 2);

-- 2. Trực thuộc [Chính sách Lương & Thưởng]
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'CS_LT_LUONG', 'Cơ chế Lương', 'CS_LUONG_THUONG', 1),
('DOCUMENT_TYPE', 'CS_LT_HOA_HONG', 'Cơ chế Hoa hồng', 'CS_LUONG_THUONG', 2),
('DOCUMENT_TYPE', 'CS_LT_KPI', 'Chính sách KPI & Thưởng', 'CS_LUONG_THUONG', 3);


-- --------------------------------------------------------
-- CẤP 3: CHI TIẾT TỪNG MỤC CỤ THỂ
-- --------------------------------------------------------

-- Con của [Nội quy lao động]
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'NQ_CHUNG', 'Nội quy chung', 'CS_NS_NOI_QUY', 1),
('DOCUMENT_TYPE', 'NQ_NGHI_VIEC', 'Quy định thôi việc & Nghỉ ngang', 'CS_NS_NOI_QUY', 2);

-- Con của [Mô tả công việc (JD)]
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'JD_SALE', 'JD Bộ phận Kinh doanh (Sale)', 'CS_NS_JD', 1),
('DOCUMENT_TYPE', 'JD_MKT', 'JD Bộ phận Marketing', 'CS_NS_JD', 2),
('DOCUMENT_TYPE', 'JD_VAN_HANH', 'JD Bộ phận Vận hành (CSKH)', 'CS_NS_JD', 3);

-- Con của [Chính sách KPI & Thưởng]
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'KPI_THANG', 'Thưởng KPI Tháng', 'CS_LT_KPI', 1),
('DOCUMENT_TYPE', 'KPI_QUY', 'Thưởng Quý', 'CS_LT_KPI', 2),
('DOCUMENT_TYPE', 'KPI_NAM', 'Thưởng Năm', 'CS_LT_KPI', 3);
