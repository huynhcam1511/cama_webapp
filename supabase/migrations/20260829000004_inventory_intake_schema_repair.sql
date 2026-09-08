-- Idempotent repair for production databases that only received part of the
-- inventory intake migration chain.
CREATE SEQUENCE IF NOT EXISTS public.garments_sku_seq START WITH 1;
GRANT USAGE, SELECT ON SEQUENCE public.garments_sku_seq TO authenticated;

ALTER TABLE public.garment_models
  ADD COLUMN IF NOT EXISTS supplier VARCHAR(255),
  ADD COLUMN IF NOT EXISTS tag_image_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_location_floor TEXT,
  ADD COLUMN IF NOT EXISTS default_location_shelf TEXT,
  ADD COLUMN IF NOT EXISTS default_location_tier TEXT,
  ADD COLUMN IF NOT EXISTS fit_note TEXT,
  ADD COLUMN IF NOT EXISTS size_system TEXT;

ALTER TABLE public.garments_inventory
  ADD COLUMN IF NOT EXISTS sku VARCHAR(50),
  ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES public.garment_models(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS intake_session_id UUID,
  ADD COLUMN IF NOT EXISTS factory_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS group_type VARCHAR(10),
  ADD COLUMN IF NOT EXISTS style_details VARCHAR(100),
  ADD COLUMN IF NOT EXISTS material_pattern VARCHAR(100),
  ADD COLUMN IF NOT EXISTS size_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS size_system VARCHAR(20),
  ADD COLUMN IF NOT EXISTS color_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS suit_product_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS button_style VARCHAR(50),
  ADD COLUMN IF NOT EXISTS pattern_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS tag_image_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS height_note TEXT,
  ADD COLUMN IF NOT EXISTS weight_note TEXT,
  ADD COLUMN IF NOT EXISTS fit_note TEXT,
  ADD COLUMN IF NOT EXISTS supplier VARCHAR(255),
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchase_date DATE;

CREATE TABLE IF NOT EXISTS public.inventory_intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_type TEXT NOT NULL DEFAULT 'INITIAL_AUDIT',
  model_id UUID REFERENCES public.garment_models(id) ON DELETE SET NULL,
  location_floor TEXT NOT NULL,
  location_shelf TEXT,
  location_tier TEXT,
  supplier TEXT,
  notes TEXT,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_intake_sessions
  ADD COLUMN IF NOT EXISTS intake_type TEXT DEFAULT 'INITIAL_AUDIT',
  ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES public.garment_models(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_floor TEXT,
  ADD COLUMN IF NOT EXISTS location_shelf TEXT,
  ADD COLUMN IF NOT EXISTS location_tier TEXT,
  ADD COLUMN IF NOT EXISTS supplier TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS total_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.inventory_intake_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.inventory_intake_sessions(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.garment_models(id) ON DELETE CASCADE,
  size_system TEXT,
  size_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  height_note TEXT,
  weight_note TEXT,
  fit_note TEXT,
  purchase_price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_intake_lines
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.inventory_intake_sessions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES public.garment_models(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS size_system TEXT,
  ADD COLUMN IF NOT EXISTS size_code TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS height_note TEXT,
  ADD COLUMN IF NOT EXISTS weight_note TEXT,
  ADD COLUMN IF NOT EXISTS fit_note TEXT,
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'garments_inventory_intake_session_id_fkey'
  ) THEN
    ALTER TABLE public.garments_inventory
      ADD CONSTRAINT garments_inventory_intake_session_id_fkey
      FOREIGN KEY (intake_session_id)
      REFERENCES public.inventory_intake_sessions(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

GRANT SELECT, INSERT, UPDATE ON public.garment_models TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.garments_inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.inventory_intake_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.inventory_intake_lines TO authenticated;
