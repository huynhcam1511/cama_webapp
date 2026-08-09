-- 1. Thêm qc_checklist vào garments_inventory để mỗi sản phẩm có một checklist riêng
ALTER TABLE public.garments_inventory ADD COLUMN qc_checklist JSONB DEFAULT '[]'::jsonb;

-- 2. Bảng lưu vết (Log) ai đã kiểm tra QC khi bàn giao
CREATE TABLE IF NOT EXISTS public.operation_qc_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL, -- Liên kết với operation_schedules (hoặc text tuỳ schema cũ)
    inventory_item_id UUID REFERENCES public.garments_inventory(id),
    checked_by UUID REFERENCES auth.users(id),
    checklist_snapshot JSONB NOT NULL, -- Lưu lại nguyên trạng checklist đã tick lúc đó
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.operation_qc_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access for operation_qc_logs" ON public.operation_qc_logs FOR ALL TO authenticated USING (true);

-- 3. Bảng cho Hệ thống Đào tạo & Bài test (SOPs)
CREATE TABLE IF NOT EXISTS public.sops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    passing_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access for sops" ON public.sops FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.sop_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id UUID REFERENCES public.sops(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- ['A. ...', 'B. ...', 'C. ...']
    correct_answer_index INTEGER NOT NULL
);
ALTER TABLE public.sop_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access for sop_tests" ON public.sop_tests FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.sop_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id UUID REFERENCES public.sops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.sop_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access for sop_results" ON public.sop_results FOR ALL TO authenticated USING (true);

-- 4. Bổ sung trường dữ liệu đo lường Social vào bảng Marketing Content
ALTER TABLE public.marketing_contents ADD COLUMN IF NOT EXISTS post_url TEXT;
ALTER TABLE public.marketing_contents ADD COLUMN IF NOT EXISTS meta_views INTEGER DEFAULT 0;
ALTER TABLE public.marketing_contents ADD COLUMN IF NOT EXISTS meta_comments INTEGER DEFAULT 0;
ALTER TABLE public.marketing_contents ADD COLUMN IF NOT EXISTS meta_shares INTEGER DEFAULT 0;
ALTER TABLE public.marketing_contents ADD COLUMN IF NOT EXISTS meta_reach INTEGER DEFAULT 0;
ALTER TABLE public.marketing_contents ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;
