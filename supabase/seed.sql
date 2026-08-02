-- ==========================================
-- CAMA WEDDING STUDIO - SEED DATA
-- ==========================================

-- 1. Seed Roles
INSERT INTO public.roles (code, name, description) VALUES
('ADMIN', 'Quản trị viên', 'Toàn quyền hệ thống'),
('MANAGER', 'Quản lý', 'Quản lý cửa hàng, duyệt yêu cầu'),
('STAFF', 'Nhân viên', 'Nhân viên phổ thông (Lễ tân, Sale, Kho, Makeup, Ekip)')
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Modules (Home Menu Structure)
INSERT INTO public.modules (code, display_name, group_code, group_name, route, sort_order) VALUES
-- HỢP ĐỒNG - CÔNG VIỆC
('MODULE_CONTRACTS', 'Hợp Đồng Studio', 'GROUP_WORK', 'Hợp Đồng - Công Việc', '/contracts', 1),
('MODULE_UNPAID_CONTRACTS', 'Hợp Đồng Chưa Thanh Toán', 'GROUP_WORK', 'Hợp Đồng - Công Việc', '/contracts/unpaid', 2),
('MODULE_PREPARE_GARMENTS', 'Lịch Soạn Váy', 'GROUP_WORK', 'Hợp Đồng - Công Việc', '/garments/prepare', 3),
('MODULE_CONTRACT_STATUS', 'Trạng Thái Hợp Đồng', 'GROUP_WORK', 'Hợp Đồng - Công Việc', '/contracts/status', 4),
('MODULE_TASKS', 'Giao Việc', 'GROUP_WORK', 'Hợp Đồng - Công Việc', '/tasks', 5),

-- KẾ TOÁN
('MODULE_DAILY_EXPENSES', 'Thu Chi Hàng Ngày', 'GROUP_ACCOUNTING', 'Kế Toán', '/accounting/daily', 1),
('MODULE_RECEIPTS', 'Phiếu Thu', 'GROUP_ACCOUNTING', 'Kế Toán', '/accounting/receipts', 2),
('MODULE_PAYMENT_VOUCHERS', 'Phiếu Chi', 'GROUP_ACCOUNTING', 'Kế Toán', '/accounting/payments', 3),
('MODULE_SALARY', 'Bảng Lương', 'GROUP_ACCOUNTING', 'Kế Toán', '/accounting/salary', 4),
('MODULE_ATTENDANCE_LOG', 'Chấm Công', 'GROUP_ACCOUNTING', 'Kế Toán', '/attendance', 5),

-- TƯ VẤN - CHĂM SÓC KHÁCH HÀNG
('MODULE_CUSTOMERS', 'Khách Hàng', 'GROUP_CRM', 'Tư Vấn - CSKH', '/customers', 1),
('MODULE_APPOINTMENTS', 'Lịch Hẹn Khách Hàng', 'GROUP_CRM', 'Tư Vấn - CSKH', '/appointments', 2),
('MODULE_LEADS', 'Khách Hàng Tiềm Năng', 'GROUP_CRM', 'Tư Vấn - CSKH', '/leads', 3),

-- TRANG PHỤC (KHO)
('MODULE_GARMENTS_WARDROBE', 'Kho Váy - Vest', 'GROUP_INVENTORY', 'Trang Phục', '/garments', 1),
('MODULE_GARMENT_CHECKOUT', 'Xuất/Trả Trang Phục', 'GROUP_INVENTORY', 'Trang Phục', '/garments/checkout', 2),
('MODULE_GARMENT_LAUNDRY', 'Giặt Sửa Trang Phục', 'GROUP_INVENTORY', 'Trang Phục', '/garments/maintenance', 3),

-- THÔNG TIN STUDIO & NHÂN SỰ
('MODULE_EMPLOYEES', 'Thông Tin Nhân Viên', 'GROUP_HR', 'Nhân Sự', '/employees', 1),
('MODULE_PERMISSIONS', 'Phân Quyền', 'GROUP_HR', 'Nhân Sự', '/permissions', 2),
('MODULE_AUDIT_LOGS', 'Nhật Ký Hệ Thống', 'GROUP_HR', 'Nhân Sự', '/audit-logs', 3)
ON CONFLICT (code) DO NOTHING;

-- 3. Seed Default Permissions
-- Give Admin full access to everything
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, true, true
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.code = 'ADMIN'
ON CONFLICT (role_id, module_id) DO UPDATE 
SET can_view = true, can_create = true, can_update = true, can_delete = true;

-- Give Manager view/update access to most things
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, true, false
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.code = 'MANAGER' AND m.code NOT IN ('MODULE_PERMISSIONS', 'MODULE_AUDIT_LOGS')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Give Staff limited access
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, false, false, false
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.code = 'STAFF' AND m.group_code IN ('GROUP_WORK', 'GROUP_INVENTORY')
ON CONFLICT (role_id, module_id) DO NOTHING;
