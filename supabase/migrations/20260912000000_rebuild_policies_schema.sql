-- Rebuild policies schema to align with the Master-Detail & Document Versioning architecture

-- 1. Alter policies table
ALTER TABLE public.policies DROP COLUMN IF EXISTS content;
ALTER TABLE public.policies DROP COLUMN IF EXISTS policy_scope;
ALTER TABLE public.policies DROP COLUMN IF EXISTS target_id;
ALTER TABLE public.policies DROP COLUMN IF EXISTS is_active;
ALTER TABLE public.policies DROP COLUMN IF EXISTS attachment_url;

-- Rename title to name if it exists, otherwise add name
DO $$ 
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='policies' and column_name='title')
  THEN
      ALTER TABLE public.policies RENAME COLUMN title TO name;
  END IF;
END $$;

ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS document_type_id UUID REFERENCES public.master_data(id) ON DELETE SET NULL;
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS target_audience_id UUID REFERENCES public.master_data(id) ON DELETE SET NULL;
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Create policy_versions table
CREATE TABLE IF NOT EXISTS public.policy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
    version_name VARCHAR(255) NOT NULL,
    effective_date DATE NOT NULL,
    file_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read policy_versions" ON public.policy_versions;
CREATE POLICY "Authenticated users read policy_versions"
ON public.policy_versions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users modify policy_versions" ON public.policy_versions;
CREATE POLICY "Authenticated users modify policy_versions"
ON public.policy_versions FOR ALL TO authenticated USING (true);

-- 3. Seed some master data for dropdowns
-- Since master_data unique constraint is (type, code, COALESCE(parent_code, '')),
-- we pass '' as parent_code implicitly by omitting it or explicit NULL? The COALESCE uses ''.
INSERT INTO public.master_data (type, code, name, sort_order) VALUES
('DOCUMENT_TYPE', 'QUY_DINH', 'Quy định', 1),
('DOCUMENT_TYPE', 'QUY_TRINH', 'Quy trình', 2),
('DOCUMENT_TYPE', 'HUONG_DAN', 'Hướng dẫn', 3),
('DOCUMENT_TYPE', 'THONG_BAO', 'Thông báo', 4),
('DOCUMENT_TYPE', 'QUYET_DINH', 'Quyết định', 5),

('TARGET_AUDIENCE', 'ALL', 'Toàn bộ nhân viên', 1),
('TARGET_AUDIENCE', 'MANAGER', 'Quản lý', 2),
('TARGET_AUDIENCE', 'NEW_HIRE', 'Nhân viên thử việc', 3)
ON CONFLICT DO NOTHING;
