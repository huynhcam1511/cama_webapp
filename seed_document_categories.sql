-- ==========================================
-- SCRIPT MẪU TẠO DANH MỤC VĂN BẢN 3 CẤP
-- Chạy script này trong Supabase SQL Editor
-- ==========================================

-- Xóa dữ liệu mẫu cũ thuộc loại DOCUMENT_TYPE (nếu có) để tránh trùng lặp
DELETE FROM master_data WHERE type = 'DOCUMENT_TYPE';

-- --------------------------------------------------------
-- CẤP 1: TÍNH CHẤT VĂN BẢN (Không có parent_code)
-- --------------------------------------------------------
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'QUY_CHE', 'Quy chế', NULL, 1),
('DOCUMENT_TYPE', 'QUY_DINH', 'Quy định', NULL, 2),
('DOCUMENT_TYPE', 'QUY_TRINH', 'Quy trình', NULL, 3),
('DOCUMENT_TYPE', 'HUONG_DAN', 'Hướng dẫn', NULL, 4),
('DOCUMENT_TYPE', 'BIEU_MAU', 'Biểu mẫu', NULL, 5),
('DOCUMENT_TYPE', 'THONG_BAO', 'Thông báo / Quyết định', NULL, 6);

-- --------------------------------------------------------
-- CẤP 2: LĨNH VỰC / PHÒNG BAN (Có parent_code trỏ về CẤP 1)
-- --------------------------------------------------------
-- 1. Nhóm của 'QUY_DINH'
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'QD_NHAN_SU', 'Nhân sự', 'QUY_DINH', 1),
('DOCUMENT_TYPE', 'QD_TAI_CHINH', 'Tài chính - Kế toán', 'QUY_DINH', 2),
('DOCUMENT_TYPE', 'QD_VAN_HANH', 'Vận hành - Kinh doanh', 'QUY_DINH', 3);

-- 2. Nhóm của 'QUY_TRINH'
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'QT_NHAN_SU', 'Nhân sự', 'QUY_TRINH', 1),
('DOCUMENT_TYPE', 'QT_TAI_CHINH', 'Tài chính - Kế toán', 'QUY_TRINH', 2),
('DOCUMENT_TYPE', 'QT_VAN_HANH', 'Vận hành - Kinh doanh', 'QUY_TRINH', 3);

-- 3. Nhóm của 'BIEU_MAU'
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'BM_NHAN_SU', 'Biểu mẫu Nhân sự', 'BIEU_MAU', 1),
('DOCUMENT_TYPE', 'BM_TAI_CHINH', 'Biểu mẫu Tài chính', 'BIEU_MAU', 2),
('DOCUMENT_TYPE', 'BM_HANH_CHINH', 'Biểu mẫu Hành chính', 'BIEU_MAU', 3);


-- --------------------------------------------------------
-- CẤP 3: CHỦ ĐỀ CỤ THỂ (Có parent_code trỏ về CẤP 2)
-- --------------------------------------------------------

-- Con của 'QD_NHAN_SU' (Quy định -> Nhân sự)
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'QD_NS_LUONG', 'Lương & Phúc lợi', 'QD_NHAN_SU', 1),
('DOCUMENT_TYPE', 'QD_NS_KY_LUAT', 'Khen thưởng & Kỷ luật', 'QD_NHAN_SU', 2),
('DOCUMENT_TYPE', 'QD_NS_DONG_PHUC', 'Đồng phục & Tác phong', 'QD_NHAN_SU', 3);

-- Con của 'QT_NHAN_SU' (Quy trình -> Nhân sự)
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'QT_NS_TUYEN_DUNG', 'Tuyển dụng', 'QT_NHAN_SU', 1),
('DOCUMENT_TYPE', 'QT_NS_DAO_TAO', 'Đào tạo nhân viên mới', 'QT_NHAN_SU', 2),
('DOCUMENT_TYPE', 'QT_NS_NGHI_VIEC', 'Thủ tục nghỉ việc', 'QT_NHAN_SU', 3);

-- Con của 'QT_VAN_HANH' (Quy trình -> Vận hành)
INSERT INTO master_data (type, code, name, parent_code, sort_order) VALUES
('DOCUMENT_TYPE', 'QT_VH_DONG_GOI', 'Đóng gói hàng hóa', 'QT_VAN_HANH', 1),
('DOCUMENT_TYPE', 'QT_VH_XU_LY_KHIEU_NAI', 'Xử lý khiếu nại', 'QT_VAN_HANH', 2),
('DOCUMENT_TYPE', 'QT_VH_KIEM_KHO', 'Kiểm kê kho', 'QT_VAN_HANH', 3);
