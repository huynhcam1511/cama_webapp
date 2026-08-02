-- Thêm Phòng Ban (Departments)
INSERT INTO public.departments (department_code, department_name) VALUES 
('DEP-KT', 'Kế toán'),
('DEP-MKT', 'Marketing'),
('DEP-SALE', 'Sale'),
('DEP-HR', 'Nhân sự'),
('DEP-BOD', 'Ban giám đốc'),
('DEP-TV', 'Tham vấn')
ON CONFLICT (department_code) DO NOTHING;

-- Thêm Chức vụ (Positions)
INSERT INTO public.positions (position_code, position_name) VALUES 
('POS-NV', 'Nhân viên'),
('POS-TN', 'Trưởng nhóm'),
('POS-QL', 'Quản lý'),
('POS-GD', 'Giám đốc')
ON CONFLICT (position_code) DO NOTHING;

-- Thêm 2 Vai trò hệ thống mới (Roles)
INSERT INTO public.roles (role_code, role_name, is_system_role) VALUES 
('STAFF_DRESS', 'Nhân viên phòng váy', false),
('STAFF_SUIT', 'Nhân viên phòng suit', false)
ON CONFLICT (role_code) DO NOTHING;
