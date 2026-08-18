-- Compatibility base for projects where the legacy garment migration was never recorded.
CREATE TABLE IF NOT EXISTS public.garments_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code VARCHAR(100) UNIQUE DEFAULT gen_random_uuid()::text,
    sku VARCHAR(50) UNIQUE,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(20) DEFAULT 'M',
    color VARCHAR(100),
    factory_code VARCHAR(100),
    group_type VARCHAR(10),
    style_details VARCHAR(20),
    material_pattern VARCHAR(20),
    size_code VARCHAR(20),
    image_url TEXT,
    accessories_notes TEXT,
    location_floor VARCHAR(100),
    location_shelf VARCHAR(100),
    location_tier VARCHAR(100),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    notes TEXT,
    rental_price NUMERIC(12,2) DEFAULT 0,
    purchase_date DATE,
    purchase_price NUMERIC(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Create garment_models table
CREATE TABLE IF NOT EXISTS public.garment_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    factory_code VARCHAR(100), -- Mã NSX/Mác áo
    base_sku VARCHAR(50) UNIQUE, -- VD: VC-S02C-KD-50
    group_type VARCHAR(10),
    style_details VARCHAR(20),
    material_pattern VARCHAR(20),
    size_code VARCHAR(10),
    image_url TEXT,
    default_location_floor VARCHAR(50),
    default_location_shelf VARCHAR(50),
    default_location_tier VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add model_id to garments_inventory and contract_garments
ALTER TABLE public.garments_inventory
ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES public.garment_models(id) ON DELETE SET NULL;

DO $$ BEGIN
  IF to_regclass('public.contract_garments') IS NOT NULL THEN
    ALTER TABLE public.contract_garments ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES public.garment_models(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Modify contract_garments to allow null garment_id (Instance)
DO $$ BEGIN
  IF to_regclass('public.contract_garments') IS NOT NULL THEN
    ALTER TABLE public.contract_garments ALTER COLUMN garment_id DROP NOT NULL;
  END IF;
END $$;

-- 4. Auto-migrate existing data from garments_inventory to garment_models
-- For every existing garment instance, create a model if one doesn't exist for that base SKU.
DO $$
DECLARE
    instance RECORD;
    new_model_id UUID;
    base_sku_val VARCHAR(50);
BEGIN
    FOR instance IN SELECT * FROM public.garments_inventory LOOP
        -- Generate base SKU from instance (assuming format GROUP-######-STYLE-MAT-SIZE)
        -- We extract GROUP, STYLE, MAT, SIZE.
        -- If sku doesn't match this pattern, fallback to just instance.sku
        base_sku_val := COALESCE(instance.group_type, 'XX') || '-' || COALESCE(instance.style_details, 'XXXX') || '-' || COALESCE(instance.material_pattern, 'XX') || '-' || COALESCE(instance.size_code, 'XX');

        -- Check if model exists
        SELECT id INTO new_model_id FROM public.garment_models WHERE base_sku = base_sku_val;

        IF new_model_id IS NULL THEN
            -- Create new model
            INSERT INTO public.garment_models (
                name, category, factory_code, base_sku, group_type, style_details,
                material_pattern, size_code, image_url,
                default_location_floor, default_location_shelf, default_location_tier
            ) VALUES (
                instance.name, instance.category, instance.factory_code, base_sku_val, instance.group_type, instance.style_details,
                instance.material_pattern, instance.size_code, instance.image_url,
                instance.location_floor, instance.location_shelf, instance.location_tier
            ) RETURNING id INTO new_model_id;
        END IF;

        -- Link instance to model
        UPDATE public.garments_inventory SET model_id = new_model_id WHERE id = instance.id;

        -- Link contract_garments to model
        IF to_regclass('public.contract_garments') IS NOT NULL THEN
          EXECUTE 'UPDATE public.contract_garments SET model_id = $1 WHERE garment_id = $2' USING new_model_id, instance.id;
        END IF;
    END LOOP;
END $$;

-- 5. Enable RLS on garment_models
ALTER TABLE public.garment_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.garment_models;
CREATE POLICY "Enable read access for all authenticated users" ON public.garment_models FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable insert access for all authenticated users" ON public.garment_models;
CREATE POLICY "Enable insert access for all authenticated users" ON public.garment_models FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update access for all authenticated users" ON public.garment_models;
CREATE POLICY "Enable update access for all authenticated users" ON public.garment_models FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete access for all authenticated users" ON public.garment_models;
CREATE POLICY "Enable delete access for all authenticated users" ON public.garment_models FOR DELETE USING (auth.role() = 'authenticated');
