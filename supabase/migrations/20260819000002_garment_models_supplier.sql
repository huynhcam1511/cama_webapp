-- Add supplier to garment_models and garments_inventory
ALTER TABLE public.garment_models ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
ALTER TABLE public.garments_inventory ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);

-- Update the complete_inventory_declaration RPC to include supplier
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
    v_base_sku := upper(concat_ws('-', payload->>'group_type', payload->>'suit_product_type',
      payload->>'color_code', payload->>'factory_code'));
  ELSE
    v_base_sku := upper(concat_ws('-', payload->>'group_type', payload->>'color_code', payload->>'factory_code'));
  END IF;

  INSERT INTO public.garment_models (
    name, category, factory_code, base_sku, group_type, style_details,
    material_pattern, color_code, color_name, suit_product_type, button_style, pattern_code, image_url, tag_image_url,
    additional_images, default_location_floor, default_location_shelf,
    default_location_tier, fit_note, size_system, supplier
  ) VALUES (
    payload->>'name', payload->>'category', NULLIF(payload->>'factory_code', ''), v_base_sku,
    payload->>'group_type', payload->>'style_details', payload->>'material_pattern',
    payload->>'color_code', payload->>'color_name', payload->>'suit_product_type', payload->>'button_style', payload->>'pattern_code', payload->>'image_url', payload->>'tag_image_url',
    COALESCE(payload->'additional_images', '[]'::jsonb), payload->>'location_floor',
    payload->>'location_shelf', payload->>'location_tier', payload->>'fit_note', payload->>'size_system', NULLIF(payload->>'supplier', '')
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
    default_location_tier = EXCLUDED.default_location_tier,
    supplier = COALESCE(EXCLUDED.supplier, garment_models.supplier), updated_at = NOW()
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
        height_note, weight_note, fit_note, supplier
      ) VALUES (
        v_model_id, v_session_id, payload->>'name', payload->>'category', payload->>'factory_code',
        payload->>'group_type', payload->>'style_details', payload->>'material_pattern',
        v_line->>'size_code', v_line->>'size_code', COALESCE(v_line->>'size_system', payload->>'size_system', 'VN'),
        payload->>'color_name', payload->>'color_code', payload->>'suit_product_type', payload->>'button_style', payload->>'pattern_code', payload->>'image_url', payload->>'tag_image_url',
        COALESCE(payload->'additional_images', '[]'::jsonb), payload->>'location_floor',
        payload->>'location_shelf', payload->>'location_tier', 'AVAILABLE',
        COALESCE((v_line->>'purchase_price')::numeric, 0), CURRENT_DATE,
        v_line->>'height_note', v_line->>'weight_note', v_line->>'fit_note', NULLIF(payload->>'supplier', '')
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('model_id', v_model_id, 'session_id', v_session_id, 'total_quantity', v_total);
END;
$$;
