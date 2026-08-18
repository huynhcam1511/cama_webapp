CREATE TABLE IF NOT EXISTS public.master_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- e.g., 'GARMENT_FORM', 'MATERIAL', 'STORAGE_FLOOR'
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_code VARCHAR(50), -- for hierarchy (e.g., Form belongs to Group 'VC')
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure unique code within a specific type and parent
CREATE UNIQUE INDEX IF NOT EXISTS idx_master_data_type_code
ON public.master_data (type, code, COALESCE(parent_code, ''));

ALTER TABLE public.master_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read master data" ON public.master_data;
CREATE POLICY "Authenticated users read master data"
ON public.master_data FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users create master data" ON public.master_data;
CREATE POLICY "Authenticated users create master data"
ON public.master_data FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users update master data" ON public.master_data;
CREATE POLICY "Authenticated users update master data"
ON public.master_data FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Seed Initial Taxonomy
INSERT INTO public.master_data (type, code, name, parent_code, sort_order) VALUES
-- 1. Forms (Style Details)
('GARMENT_FORM', 'S02C', 'S02C (Đuôi cá)', 'VC', 1),
('GARMENT_FORM', 'CONG', 'CONG (Công chúa)', 'VC', 2),
('GARMENT_FORM', 'CUPI', 'CUPI (Cúp ngực)', 'VC', 3),
('GARMENT_FORM', 'CHUA', 'CHUA (Chữ A)', 'VC', 4),
('GARMENT_FORM', 'XO3M', 'XO3M (Xoè 3 mét)', 'VC', 5),

('GARMENT_FORM', 'SUIT', 'SUIT (Bộ Suit)', 'SU', 1),
('GARMENT_FORM', 'SLIM', 'SLIM (Dáng ôm)', 'SU', 2),
('GARMENT_FORM', 'TUXE', 'TUXE (Tuxedo / Tôm)', 'SU', 3),
('GARMENT_FORM', 'BIGS', 'BIGS (Big Size)', 'SU', 4),

('GARMENT_FORM', 'VEST', 'VEST (Áo Vest)', 'JA', 1),
('GARMENT_FORM', 'BLAZ', 'BLAZ (Blazer)', 'JA', 2),
('GARMENT_FORM', 'SOMI', 'SOMI (Áo Sơ mi)', 'JA', 3),

('GARMENT_FORM', 'QUAN', 'QUAN (Quần Âu)', 'QU', 1),
('GARMENT_FORM', 'AODA', 'AODA (Áo Dài)', 'AD', 1),

-- 2. Materials
('MATERIAL', 'LU', 'LU (Lụa)', 'VC', 1),
('MATERIAL', 'SA', 'SA (Satin)', 'VC', 2),
('MATERIAL', 'RE', 'RE (Ren)', 'VC', 3),
('MATERIAL', 'DD', 'DD (Đính đá)', 'VC', 4),

('MATERIAL', 'KA', 'KA (Kaki)', 'SU', 1),
('MATERIAL', 'XX', 'XX (Khác)', 'SU', 2),

-- 3. Storage Floors
('STORAGE_FLOOR', 'L1', 'Lầu 1', NULL, 1),
('STORAGE_FLOOR', 'L2', 'Lầu 2', NULL, 2),

-- 4. Storage Areas/Shelves (Dynamic based on Floor)
('STORAGE_SHELF', 'S1', 'Sào 1', 'L1', 1),
('STORAGE_SHELF', 'S2', 'Sào 2', 'L1', 2),
('STORAGE_SHELF', 'S3', 'Sào 3', 'L1', 3),
('STORAGE_SHELF', 'S4', 'Sào 4', 'L1', 4),
('STORAGE_SHELF', 'S5', 'Sào 5', 'L1', 5),
('STORAGE_SHELF', 'S6', 'Sào 6', 'L1', 6),

('STORAGE_SHELF', 'SAO2', 'Sào 2 ngăn', 'L2', 1),
('STORAGE_SHELF', 'TUKINH', 'Tủ kính', 'L2', 2),
('STORAGE_SHELF', 'KEGIAY', 'Kệ để giày', 'L2', 3)
ON CONFLICT DO NOTHING;
