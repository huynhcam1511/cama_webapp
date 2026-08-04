-- Thêm các module mới vào bảng modules
INSERT INTO public.modules (module_code, module_name, route, icon, sort_order) 
VALUES 
    ('CUSTOMER_SERVICE', 'Chăm sóc khách hàng', '/dashboard/customer-service', 'HeartHandshake', 35),
    ('CASHFLOW', 'Dòng tiền', '/dashboard/cashflow', 'DollarSign', 110),
    ('OVERDUE_INVOICES', 'Cảnh báo công nợ', '/dashboard/overdue-invoices', 'AlertTriangle', 120),
    ('PROFIT_TRACKER', 'Theo dõi lợi nhuận', '/dashboard/profit', 'TrendingUp', 130),
    ('SUBSCRIPTIONS', 'Quản lý thuê bao', '/dashboard/subscriptions', 'Repeat', 140),
    ('OPERATION_SCHEDULE', 'Lịch khách & Lịch giao hàng', '/dashboard/schedules/operation', 'CalendarCheck2', 150),
    ('ORDERS', 'Đơn hàng vận hành', '/dashboard/orders', 'ShoppingBag', 160),
    ('TASKS', 'Giao việc', '/dashboard/tasks', 'CheckSquare', 170),
    ('STAFF_SCHEDULE', 'Lịch làm việc', '/dashboard/schedules/staff', 'CalendarRange', 180),
    ('POLICIES', 'Chính sách & nội quy', '/dashboard/policies', 'BookOpen', 190),
    ('KPI_PERFORMANCE', 'KPI & Đánh giá', '/dashboard/kpi', 'Target', 200),
    ('PAYROLL', 'Bảng lương & Hoa hồng', '/dashboard/payroll', 'BadgeDollarSign', 210),
    ('TRAINING', 'Đào tạo nội bộ', '/dashboard/training', 'GraduationCap', 220),
    ('RECRUITMENT', 'Tuyển dụng', '/dashboard/recruitment', 'UserPlus', 230),
    ('CONTENT_MARKETING', 'Quản trị nội dung (Content)', '/dashboard/marketing/content', 'Megaphone', 240),
    ('PERMISSIONS', 'Phân quyền', '/dashboard/employees?tab=permissions', 'ShieldCheck', 250),
    ('QR_SCAN', 'Quét mã QR', '/dashboard/garments/scan', 'ScanLine', 260),
    ('ATTENDANCE', 'Chấm công GPS', '/dashboard/attendance', 'MapPin', 270)
ON CONFLICT (module_code) DO UPDATE 
SET 
    module_name = EXCLUDED.module_name,
    route = EXCLUDED.route,
    icon = EXCLUDED.icon;
