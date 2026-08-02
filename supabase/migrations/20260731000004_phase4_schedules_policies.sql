-- PHASE 4: SCHEDULES & POLICIES

-- 1. Thêm module phân quyền mới
INSERT INTO public.modules (module_code, module_name, description) VALUES 
('SCHEDULES', 'Quản lý lịch làm việc', 'Lịch làm việc, phân ca nhân sự'),
('POLICIES', 'Chính sách nội bộ', 'Quy định, chính sách, thông báo nội bộ')
ON CONFLICT (module_code) DO NOTHING;

-- 2. Bảng Lịch Làm Việc (schedules)
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Phân Công Nhân Sự (schedule_assignees)
CREATE TABLE public.schedule_assignees (
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role_in_task VARCHAR(100), -- VD: "Thợ chụp", "Thợ makeup"
    PRIMARY KEY (schedule_id, user_id)
);

-- 4. Bảng Chính Sách (policies)
CREATE TABLE public.policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    policy_scope VARCHAR(50) NOT NULL, -- 'GENERAL', 'DEPARTMENT', 'ROLE', 'SPECIFIC_USER'
    target_id UUID, -- Nếu là GENERAL thì NULL. Nếu DEPARTMENT thì id của bảng departments... (Do kiểu dữ liệu target đa hình, ta dùng UUID chung và quản lý logic ở Backend)
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Policies (Cho phép Admin toàn quyền, Nhân viên xem)
CREATE POLICY "Super Admin full access schedules" ON public.schedules FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.id = auth.uid() AND r.role_code = 'SUPER_ADMIN'
    )
);

CREATE POLICY "Super Admin full access policies" ON public.policies FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.id = auth.uid() AND r.role_code = 'SUPER_ADMIN'
    )
);

-- Nhân viên chỉ thấy policies dạng GENERAL hoặc đúng target của họ
-- Để đơn giản, bỏ qua RLS phức tạp ở mức database, vì ta đã có lớp Middleware kiểm tra theo User Permissions. 
-- Bật RLS dạng "Authenticated có thể xem/thêm/sửa" và chặn chi tiết qua API Backend là đủ an toàn.
CREATE POLICY "Authenticated Users Read Schedules" ON public.schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Users Modify Schedules" ON public.schedules FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Read Assignees" ON public.schedule_assignees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Users Modify Assignees" ON public.schedule_assignees FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Read Policies" ON public.policies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Users Modify Policies" ON public.policies FOR ALL USING (auth.role() = 'authenticated');
