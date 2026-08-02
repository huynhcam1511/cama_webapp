-- PHASE 5: Tách Module Lịch Làm Việc thành Lịch Nhân Sự và Lịch Vận Hành

-- 1. Xóa bỏ cấu trúc cũ
DROP TABLE IF EXISTS public.schedule_assignees CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;

-- 2. Cập nhật bảng Modules
-- Xóa module cũ
DELETE FROM public.role_permissions WHERE module_id IN (SELECT id FROM public.modules WHERE module_code = 'SCHEDULES');
DELETE FROM public.user_permissions WHERE module_id IN (SELECT id FROM public.modules WHERE module_code = 'SCHEDULES');
DELETE FROM public.modules WHERE module_code = 'SCHEDULES';

-- Thêm 2 module mới
INSERT INTO public.modules (module_code, module_name, route, icon, sort_order, is_active) VALUES 
('STAFF_SCHEDULE', 'Lịch nhân sự & phân ca', '/dashboard/schedules/staff', 'CalendarRange', 110, true),
('OPERATION_SCHEDULE', 'Lịch khách hàng & đơn hàng', '/dashboard/schedules/operation', 'CalendarCheck2', 115, true)
ON CONFLICT (module_code) DO UPDATE SET 
    module_name = EXCLUDED.module_name,
    route = EXCLUDED.route,
    icon = EXCLUDED.icon;

-- Cấp quyền mặc định cho SUPER_ADMIN
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, true, true
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.role_code = 'SUPER_ADMIN' AND m.module_code IN ('STAFF_SCHEDULE', 'OPERATION_SCHEDULE')
ON CONFLICT (role_id, module_id) 
DO UPDATE SET can_view = true, can_create = true, can_update = true, can_delete = true;

-- Cấp quyền mặc định cho ADMIN và MANAGER
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, true, true
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.role_code IN ('ADMIN', 'MANAGER') AND m.module_code IN ('STAFF_SCHEDULE', 'OPERATION_SCHEDULE')
ON CONFLICT (role_id, module_id) 
DO UPDATE SET can_view = true, can_create = true, can_update = true, can_delete = true;

-- Cấp quyền mặc định cho các role còn lại (Chỉ xem và tạo)
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, false, false
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.role_code NOT IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER') AND m.module_code IN ('STAFF_SCHEDULE', 'OPERATION_SCHEDULE')
ON CONFLICT (role_id, module_id) 
DO UPDATE SET can_view = true, can_create = true, can_update = false, can_delete = false;

-- 3. Tạo Bảng Lịch Nhân Sự (staff_schedules)
CREATE TABLE public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    schedule_type VARCHAR(50) NOT NULL, -- WORKING, ANNUAL_LEAVE, UNPAID_LEAVE, SICK_LEAVE, LATE, EARLY_LEAVE, OTHER
    start_time TIME,
    end_time TIME,
    shift_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, ATTENDED, ABSENT, LATE, EARLY_LEAVE
    leave_reason TEXT,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    is_urgent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tạo Bảng Lịch Vận Hành (operation_schedules)
CREATE TABLE public.operation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- DRESS_TRY_ON, FITTING, DRESS_PREPARATION, CUSTOMER_APPOINTMENT, DELIVERY, RETURN, PICKUP, ALTERATION, INTERNAL_TASK, OTHER
    customer_id UUID, -- Chấp nhận Null nếu không liên kết Khách
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    order_id UUID, -- Chưa có bảng Orders, để UUID trần
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    primary_assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    garment_id UUID, -- Chưa có bảng Garments, để UUID trần
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    notes TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tạo Bảng Nhân Viên Phối Hợp (operation_schedule_assignees)
CREATE TABLE public.operation_schedule_assignees (
    schedule_id UUID REFERENCES public.operation_schedules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (schedule_id, user_id)
);

-- 6. Cập nhật Trigger
DO $$ BEGIN
    CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON public.staff_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_operation_schedules_updated_at BEFORE UPDATE ON public.operation_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. Bật RLS
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_schedule_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for Authenticated Users on staff_schedules" ON public.staff_schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for Authenticated Users on operation_schedules" ON public.operation_schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for Authenticated Users on operation_schedule_assignees" ON public.operation_schedule_assignees FOR ALL USING (auth.role() = 'authenticated');
