-- ==========================================
-- CAMA WEDDING STUDIO - RBAC SYSTEM MIGRATION
-- ==========================================

-- 0. Clean up old tables from previous schema to avoid conflicts
DROP TABLE IF EXISTS public.user_permission_overrides CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- 1. Create or replace roles table
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_code VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure default roles exist
INSERT INTO public.roles (role_code, role_name, is_system_role) 
VALUES 
    ('SUPER_ADMIN', 'Super Admin', true),
    ('ADMIN', 'Admin', true),
    ('MANAGER', 'Quản lý', true),
    ('SALES', 'Sale', false),
    ('MARKETING', 'Marketing', false),
    ('ACCOUNTING', 'Kế toán', false),
    ('WAREHOUSE', 'Nhân viên kho', false),
    ('STAFF', 'Nhân viên', false)
ON CONFLICT (role_code) DO NOTHING;


-- 2. Create departments and positions if not exist
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_code VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_code VARCHAR(50) UNIQUE NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. Create users table (combining employees and auth profiles)
CREATE TABLE public.users (
    id UUID PRIMARY KEY, -- Should map to auth.users.id
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    position_id UUID REFERENCES public.positions(id),
    role_id UUID REFERENCES public.roles(id),
    
    is_active BOOLEAN DEFAULT true,
    is_working BOOLEAN DEFAULT true,
    employment_status VARCHAR(50) DEFAULT 'working', -- working, on_leave, probation, resigned, terminated
    
    start_date DATE,
    end_date DATE,
    note TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 4. Create modules table
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_code VARCHAR(100) UNIQUE NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    parent_module_id UUID REFERENCES public.modules(id),
    route VARCHAR(255),
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert core modules
INSERT INTO public.modules (module_code, module_name, route, icon, sort_order) 
VALUES 
    ('DASHBOARD', 'Tổng quan', '/dashboard', 'LayoutDashboard', 10),
    ('EMPLOYEES', 'Quản lý nhân viên', '/dashboard/employees', 'Users', 20),
    ('CUSTOMERS', 'Khách hàng CRM', '/dashboard/customers', 'UserCheck', 30),
    ('STUDIO_CONTRACTS', 'Hợp đồng Studio', '/dashboard/contracts', 'FileText', 40),
    ('DRESS_CONTRACTS', 'Hợp đồng Váy cưới', '/dashboard/dress-contracts', 'Shirt', 50),
    ('INVENTORY', 'Kho Váy & Trang Phục', '/dashboard/garments', 'Archive', 60),
    ('SYSTEM_SETTINGS', 'Cấu hình hệ thống', '/dashboard/settings', 'Settings', 100)
ON CONFLICT (module_code) DO NOTHING;


-- 5. Create role_permissions table
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, module_id)
);


-- 6. Create user_permissions table
CREATE TABLE public.user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);


-- 7. Audit Logs Extension
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID,
    action VARCHAR(50),
    module_code VARCHAR(100),
    target_type VARCHAR(100),
    target_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_user_permissions_updated_at BEFORE UPDATE ON public.user_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 9. Row Level Security Setup
-- To make this work seamlessly with Supabase Auth
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable read access for authenticated users" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Enable read access for authenticated users" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Enable read access for authenticated users" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Enable read access for authenticated users" ON public.user_permissions FOR SELECT USING (true);

-- Allow inserting users for MVP / Setup (Should be restricted to admin or trigger in prod)
CREATE POLICY "Enable insert access for all" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable insert access for all" ON public.user_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable insert access for all" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable update access for all" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Enable update access for all" ON public.user_permissions FOR UPDATE USING (true);
