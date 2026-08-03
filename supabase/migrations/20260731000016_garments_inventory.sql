-- Create garments_inventory table
CREATE TABLE IF NOT EXISTS public.garments_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- e.g., 'Váy cưới', 'Vest', 'Áo dài'
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20) DEFAULT 'M', -- 'S', 'M', 'L', 'XL', 'Free'
    color VARCHAR(50),
    accessories_notes TEXT, -- '2 (Lúp dài, Găng tay)'
    location_floor VARCHAR(50), -- 'Lầu 1'
    location_shelf VARCHAR(50), -- 'Kệ A'
    location_tier VARCHAR(50), -- 'Tầng 2'
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RENTED', 'MAINTENANCE'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 5 sample records
INSERT INTO public.garments_inventory (qr_code, category, name, size, color, accessories_notes, location_floor, location_shelf, location_tier, status)
VALUES 
('VC001-M-W-01', 'Váy cưới', 'Váy Cưới Công Chúa Ren Pháp', 'M', 'Trắng (W)', '2 (Lúp dài, Găng tay)', 'Lầu 1', 'Kệ A', 'Tầng 2', 'AVAILABLE'),
('VC001-S-W-01', 'Váy cưới', 'Váy Cưới Công Chúa Ren Pháp', 'S', 'Trắng (W)', '2 (Lúp dài, Găng tay)', 'Lầu 1', 'Kệ A', 'Tầng 2', 'RENTED'),
('VS012-L-B-01', 'Vest', 'Suit Nam Tuxedo Đen', 'L', 'Đen (B)', '1 (Nơ cổ)', 'Lầu 2', 'Kệ V1', 'Tầng 1', 'AVAILABLE'),
('AD005-F-R-01', 'Áo dài', 'Áo Dài Cặp Long Phụng (Nữ)', 'Free', 'Đỏ (R)', '1 (Mấn đội đầu)', 'Lầu 1', 'Kệ C', 'Tầng 3', 'AVAILABLE'),
('PK001-F-W-01', 'Phụ kiện', 'Lúp Cô Dâu Đính Đá Cao Cấp', 'Free', 'Trắng (W)', '0', 'Lầu 3', 'Tủ P', 'Ngăn 1', 'MAINTENANCE')
ON CONFLICT (qr_code) DO NOTHING;

-- RLS policies
ALTER TABLE public.garments_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access" ON public.garments_inventory
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert access" ON public.garments_inventory
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON public.garments_inventory
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON public.garments_inventory
    FOR DELETE TO authenticated USING (true);
