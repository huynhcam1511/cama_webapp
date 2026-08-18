-- Unified current-stock declaration workflow.
-- One completion creates/updates the catalog model, physical stock instances,
-- and a timestamped audit session in a single database transaction.

ALTER TABLE public.inventory_locations ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.garment_models
  ADD COLUMN IF NOT EXISTS color_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS color_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS suit_product_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS button_style VARCHAR(20),
  ADD COLUMN IF NOT EXISTS pattern_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS size_system VARCHAR(20),
  ADD COLUMN IF NOT EXISTS fit_note TEXT,
  ADD COLUMN IF NOT EXISTS tag_image_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_images JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.inventory_intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_type VARCHAR(30) NOT NULL DEFAULT 'INITIAL_AUDIT',
  model_id UUID REFERENCES public.garment_models(id) ON DELETE SET NULL,
  location_floor VARCHAR(100) NOT NULL,
  location_shelf VARCHAR(100),
  location_tier VARCHAR(100),
  supplier VARCHAR(255),
  notes TEXT,
  total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_intake_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.inventory_intake_sessions(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.garment_models(id) ON DELETE CASCADE,
  size_system VARCHAR(20) NOT NULL DEFAULT 'VN',
  size_code VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  height_note VARCHAR(100),
  weight_note VARCHAR(100),
  fit_note TEXT,
  purchase_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.garments_inventory
  ADD COLUMN IF NOT EXISTS intake_session_id UUID REFERENCES public.inventory_intake_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS size_system VARCHAR(20) DEFAULT 'VN',
  ADD COLUMN IF NOT EXISTS color_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS color_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS suit_product_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS button_style VARCHAR(20),
  ADD COLUMN IF NOT EXISTS pattern_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tag_image_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS height_note VARCHAR(100),
  ADD COLUMN IF NOT EXISTS weight_note VARCHAR(100),
  ADD COLUMN IF NOT EXISTS fit_note TEXT;

CREATE INDEX IF NOT EXISTS idx_inventory_intake_sessions_completed_at
  ON public.inventory_intake_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_intake_sessions_model
  ON public.inventory_intake_sessions(model_id);
CREATE INDEX IF NOT EXISTS idx_garments_inventory_intake_session
  ON public.garments_inventory(intake_session_id);

ALTER TABLE public.inventory_intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_intake_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage inventory intake sessions" ON public.inventory_intake_sessions;
CREATE POLICY "Authenticated users manage inventory intake sessions"
  ON public.inventory_intake_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage inventory intake lines" ON public.inventory_intake_lines;
CREATE POLICY "Authenticated users manage inventory intake lines"
  ON public.inventory_intake_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'garment-images',
  'garment-images',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users upload garment images" ON storage.objects;
CREATE POLICY "Authenticated users upload garment images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'garment-images');

DROP POLICY IF EXISTS "Authenticated users update garment images" ON storage.objects;
CREATE POLICY "Authenticated users update garment images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'garment-images') WITH CHECK (bucket_id = 'garment-images');

DROP POLICY IF EXISTS "Public reads garment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users read garment images" ON storage.objects;
CREATE POLICY "Authenticated users read garment images"
  ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'garment-images');

-- Taxonomy for dependent dropdowns. Existing user-maintained rows are preserved.
INSERT INTO public.master_data (type, code, name, parent_code, sort_order) VALUES
('COLOR', 'WH', 'Trắng', 'VC', 1), ('COLOR', 'IV', 'Kem/Ivory', 'VC', 2),
('COLOR', 'BK', 'Đen', 'SU', 1), ('COLOR', 'NV', 'Xanh navy', 'SU', 2), ('COLOR', 'GY', 'Xám', 'SU', 3),
('COLOR', 'CH', 'Xám than', 'SU', 4), ('COLOR', 'LG', 'Xám sáng', 'SU', 5),
('COLOR', 'BE', 'Be', 'SU', 6), ('COLOR', 'BR', 'Nâu', 'SU', 7), ('COLOR', 'DB', 'Nâu đậm', 'SU', 8),
('COLOR', 'WH', 'Trắng', 'SU', 9), ('COLOR', 'IV', 'Kem/Ivory', 'SU', 10),
('COLOR', 'RB', 'Xanh royal', 'SU', 11), ('COLOR', 'SB', 'Xanh da trời', 'SU', 12),
('COLOR', 'BU', 'Đỏ burgundy', 'SU', 13), ('COLOR', 'OL', 'Xanh olive', 'SU', 14),
('COLOR', 'BK', 'Đen', 'JA', 1), ('COLOR', 'NV', 'Xanh navy', 'JA', 2),
('COLOR', 'BK', 'Đen', 'QU', 1), ('COLOR', 'NV', 'Xanh navy', 'QU', 2),
('COLOR', 'RD', 'Đỏ', 'AD', 1), ('COLOR', 'WH', 'Trắng', 'AD', 2),
('SIZE', 'S', 'S', 'VC:VN', 1), ('SIZE', 'M', 'M', 'VC:VN', 2), ('SIZE', 'L', 'L', 'VC:VN', 3), ('SIZE', 'XL', 'XL', 'VC:VN', 4),
('SIZE', '46', '46', 'SU:CN', 1), ('SIZE', '48', '48', 'SU:CN', 2), ('SIZE', '50', '50', 'SU:CN', 3), ('SIZE', '52', '52', 'SU:CN', 4), ('SIZE', '54', '54', 'SU:CN', 5),
('SIZE', 'S', 'S', 'SU:VN', 1), ('SIZE', 'M', 'M', 'SU:VN', 2), ('SIZE', 'L', 'L', 'SU:VN', 3), ('SIZE', 'XL', 'XL', 'SU:VN', 4),
('SIZE', '46', '46', 'JA:CN', 1), ('SIZE', '48', '48', 'JA:CN', 2), ('SIZE', '50', '50', 'JA:CN', 3), ('SIZE', '52', '52', 'JA:CN', 4),
('SIZE', 'S', 'S', 'JA:VN', 1), ('SIZE', 'M', 'M', 'JA:VN', 2), ('SIZE', 'L', 'L', 'JA:VN', 3), ('SIZE', 'XL', 'XL', 'JA:VN', 4),
('SIZE', '28', '28', 'QU:CN', 1), ('SIZE', '30', '30', 'QU:CN', 2), ('SIZE', '32', '32', 'QU:CN', 3), ('SIZE', '34', '34', 'QU:CN', 4),
('SIZE', 'S', 'S', 'AD:VN', 1), ('SIZE', 'M', 'M', 'AD:VN', 2), ('SIZE', 'L', 'L', 'AD:VN', 3), ('SIZE', 'XL', 'XL', 'AD:VN', 4)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.complete_inventory_declaration(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_model_id UUID;
  v_session_id UUID;
  v_line JSONB;
  v_qty INTEGER;
  v_total INTEGER := 0;
  v_base_sku TEXT;
BEGIN
  IF COALESCE(payload->>'name', '') = '' THEN RAISE EXCEPTION 'Tên sản phẩm là bắt buộc'; END IF;
  IF COALESCE(payload->>'location_floor', '') = '' THEN RAISE EXCEPTION 'Vị trí lầu/tầng là bắt buộc'; END IF;
  IF jsonb_array_length(COALESCE(payload->'size_lines', '[]'::jsonb)) = 0 THEN RAISE EXCEPTION 'Cần ít nhất một dòng size'; END IF;

  IF payload->>'group_type' = 'SU' THEN
    v_base_sku := upper(concat_ws('-', payload->>'factory_code', payload->>'button_style',
      COALESCE(payload->>'pattern_code', 'HT') || COALESCE(payload->>'color_code', 'XX')));
  ELSE
    v_base_sku := upper(concat_ws('-', payload->>'group_type', payload->>'style_details', payload->>'material_pattern', payload->>'color_code',
      substring(md5(COALESCE(payload->>'factory_code', '') || '|' || payload->>'name') from 1 for 6)));
  END IF;

  INSERT INTO public.garment_models (
    name, category, factory_code, base_sku, group_type, style_details,
    material_pattern, color_code, color_name, suit_product_type, button_style, pattern_code, image_url, tag_image_url,
    additional_images, default_location_floor, default_location_shelf,
    default_location_tier, fit_note, size_system
  ) VALUES (
    payload->>'name', payload->>'category', NULLIF(payload->>'factory_code', ''), v_base_sku,
    payload->>'group_type', payload->>'style_details', payload->>'material_pattern',
    payload->>'color_code', payload->>'color_name', payload->>'suit_product_type', payload->>'button_style', payload->>'pattern_code', payload->>'image_url', payload->>'tag_image_url',
    COALESCE(payload->'additional_images', '[]'::jsonb), payload->>'location_floor',
    payload->>'location_shelf', payload->>'location_tier', payload->>'fit_note', payload->>'size_system'
  )
  ON CONFLICT (base_sku) DO UPDATE SET
    name = EXCLUDED.name, factory_code = COALESCE(EXCLUDED.factory_code, garment_models.factory_code),
    suit_product_type = EXCLUDED.suit_product_type, button_style = EXCLUDED.button_style,
    pattern_code = EXCLUDED.pattern_code,
    color_name = EXCLUDED.color_name, image_url = COALESCE(EXCLUDED.image_url, garment_models.image_url),
    tag_image_url = COALESCE(EXCLUDED.tag_image_url, garment_models.tag_image_url),
    additional_images = EXCLUDED.additional_images, fit_note = EXCLUDED.fit_note,
    default_location_floor = EXCLUDED.default_location_floor,
    default_location_shelf = EXCLUDED.default_location_shelf,
    default_location_tier = EXCLUDED.default_location_tier, updated_at = NOW()
  RETURNING id INTO v_model_id;

  SELECT COALESCE(sum((line->>'quantity')::integer), 0) INTO v_total
  FROM jsonb_array_elements(payload->'size_lines') line;
  IF v_total <= 0 THEN RAISE EXCEPTION 'Tổng số lượng phải lớn hơn 0'; END IF;

  INSERT INTO public.inventory_intake_sessions (
    intake_type, model_id, location_floor, location_shelf, location_tier,
    supplier, notes, total_quantity, created_by
  ) VALUES (
    COALESCE(payload->>'intake_type', 'INITIAL_AUDIT'), v_model_id,
    payload->>'location_floor', payload->>'location_shelf', payload->>'location_tier',
    NULLIF(payload->>'supplier', ''), NULLIF(payload->>'notes', ''), v_total, auth.uid()
  ) RETURNING id INTO v_session_id;

  FOR v_line IN SELECT * FROM jsonb_array_elements(payload->'size_lines') LOOP
    v_qty := (v_line->>'quantity')::integer;
    IF v_qty <= 0 THEN CONTINUE; END IF;

    INSERT INTO public.inventory_intake_lines (
      session_id, model_id, size_system, size_code, quantity,
      height_note, weight_note, fit_note, purchase_price
    ) VALUES (
      v_session_id, v_model_id, COALESCE(v_line->>'size_system', payload->>'size_system', 'VN'),
      v_line->>'size_code', v_qty, v_line->>'height_note', v_line->>'weight_note',
      v_line->>'fit_note', COALESCE((v_line->>'purchase_price')::numeric, 0)
    );

    FOR i IN 1..v_qty LOOP
      INSERT INTO public.garments_inventory (
        model_id, intake_session_id, name, category, factory_code, group_type,
        style_details, material_pattern, size, size_code, size_system, color,
        color_code, suit_product_type, button_style, pattern_code, image_url, tag_image_url, additional_images, location_floor,
        location_shelf, location_tier, status, purchase_price, purchase_date,
        height_note, weight_note, fit_note
      ) VALUES (
        v_model_id, v_session_id, payload->>'name', payload->>'category', payload->>'factory_code',
        payload->>'group_type', payload->>'style_details', payload->>'material_pattern',
        v_line->>'size_code', v_line->>'size_code', COALESCE(v_line->>'size_system', payload->>'size_system', 'VN'),
        payload->>'color_name', payload->>'color_code', payload->>'suit_product_type', payload->>'button_style', payload->>'pattern_code', payload->>'image_url', payload->>'tag_image_url',
        COALESCE(payload->'additional_images', '[]'::jsonb), payload->>'location_floor',
        payload->>'location_shelf', payload->>'location_tier', 'AVAILABLE',
        COALESCE((v_line->>'purchase_price')::numeric, 0), CURRENT_DATE,
        v_line->>'height_note', v_line->>'weight_note', v_line->>'fit_note'
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('model_id', v_model_id, 'session_id', v_session_id, 'total_quantity', v_total);
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_inventory_declaration(JSONB) TO authenticated;
