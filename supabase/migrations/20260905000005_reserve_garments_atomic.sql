-- Migration to add atomic reservation RPC

CREATE OR REPLACE FUNCTION public.reserve_garments_atomic(
    p_contract_id UUID,
    p_selections JSONB -- Array of { modelId, sizeCode, quantity, startDate, endDate, fulfillmentType }
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_contract_notes JSONB;
    v_existing_garments JSONB;
    v_new_garments JSONB = '[]'::jsonb;
    v_final_garments JSONB;
    v_selection JSONB;
    v_model_id UUID;
    v_size_code TEXT;
    v_qty INT;
    v_start_date DATE;
    v_end_date DATE;
    v_type TEXT;
    
    v_already_reserved JSONB;
    v_already_count INT;
    v_needed_qty INT;
    
    v_inst RECORD;
    v_model RECORD;
    
    v_used_instances TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- 1. Lock the contract
    SELECT notes INTO v_contract_notes FROM public.contracts WHERE id = p_contract_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hợp đồng không tồn tại';
    END IF;
    
    v_existing_garments := COALESCE(v_contract_notes->'garments', '[]'::jsonb);
    
    -- 2. Loop through selections
    FOR v_selection IN SELECT * FROM jsonb_array_elements(p_selections)
    LOOP
        v_model_id := (v_selection->>'modelId')::UUID;
        v_size_code := v_selection->>'sizeCode';
        v_qty := (v_selection->>'quantity')::INT;
        v_start_date := (v_selection->>'startDate')::DATE;
        v_end_date := (v_selection->>'endDate')::DATE;
        v_type := v_selection->>'fulfillmentType';
        
        IF v_type = 'RENTAL' AND (v_start_date IS NULL OR v_end_date IS NULL) THEN
            RAISE EXCEPTION 'Vui lòng chọn ngày lấy và trả cho hàng thuê';
        END IF;
        
        -- Filter existing matching reservations to reuse them
        SELECT COALESCE(jsonb_agg(g), '[]'::jsonb) INTO v_already_reserved
        FROM jsonb_array_elements(v_existing_garments) AS g
        WHERE (g->>'model_id')::UUID = v_model_id
          AND g->>'size' = v_size_code
          AND g->>'reservation_status' NOT IN ('RETURNED', 'CANCELLED', 'LIQUIDATED')
          AND (v_type = 'SALE' OR ((g->>'deliver_date')::DATE = v_start_date AND (g->>'return_date')::DATE = v_end_date));
          
        v_already_count := jsonb_array_length(v_already_reserved);
        
        IF v_already_count >= v_qty THEN
            -- We have enough already, take the needed subset
            v_new_garments := v_new_garments || (SELECT jsonb_agg(e) FROM (SELECT * FROM jsonb_array_elements(v_already_reserved) LIMIT v_qty) e);
            CONTINUE;
        END IF;
        
        -- Keep all already reserved that match
        IF v_already_count > 0 THEN
            v_new_garments := v_new_garments || v_already_reserved;
        END IF;
        
        v_needed_qty := v_qty - v_already_count;
        
        -- Get model info
        SELECT * INTO v_model FROM public.garment_models WHERE id = v_model_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Không tìm thấy sản phẩm trong kho (Model %) ', v_model_id;
        END IF;
        
        -- Find available instances
        FOR v_inst IN 
            SELECT g.id, g.qr_code, g.status
            FROM public.garments_inventory g
            WHERE g.model_id = v_model_id 
              AND g.size_code = v_size_code 
              AND g.status = 'AVAILABLE'
              AND NOT (g.id::text = ANY(v_used_instances))
              AND NOT EXISTS (
                  SELECT 1 FROM public.contracts c, jsonb_array_elements(COALESCE(c.notes->'garments', '[]'::jsonb)) AS res
                  WHERE res->>'garment_instance_id' = g.id::text
                    AND res->>'reservation_status' NOT IN ('RETURNED', 'CANCELLED', 'LIQUIDATED')
                    AND c.status != 'CANCELLED'
                    AND c.deleted_at IS NULL
                    AND (
                       v_type = 'SALE' OR res->>'fulfillment_type' = 'SALE'
                       OR ( (res->>'deliver_date')::date <= v_end_date AND (res->>'return_date')::date >= v_start_date )
                    )
              )
            ORDER BY g.created_at ASC
            LIMIT v_needed_qty
            FOR UPDATE SKIP LOCKED
        LOOP
            v_used_instances := array_append(v_used_instances, v_inst.id::text);
            
            -- If SALE, update inventory status immediately
            IF v_type = 'SALE' THEN
                UPDATE public.garments_inventory SET status = 'RESERVED_SALE', updated_at = NOW() WHERE id = v_inst.id;
            END IF;
            
            -- Append to new garments array
            v_new_garments := v_new_garments || jsonb_build_object(
                'id', 'gar-' || gen_random_uuid()::text,
                'garment_instance_id', v_inst.id,
                'model_id', v_model_id,
                'garment_code', COALESCE(v_inst.qr_code, substring(v_inst.id::text from 1 for 8)),
                'product_name', v_model.name,
                'product_image_url', v_model.image_url,
                'product_type', COALESCE(v_model.category, v_model.group_type),
                'size', v_size_code,
                'deliver_date', v_start_date,
                'return_date', v_end_date,
                'reservation_status', 'RESERVED',
                'fulfillment_type', v_type,
                'fitting_notes', ''
            );
            v_needed_qty := v_needed_qty - 1;
        END LOOP;
        
        IF v_needed_qty > 0 THEN
            RAISE EXCEPTION 'Không còn đủ sản phẩm khả dụng cho model % size %', v_model.name, v_size_code;
        END IF;
    END LOOP;
    
    -- Merge logic: retain old garments that are NOT replaced
    SELECT COALESCE(jsonb_agg(g), '[]'::jsonb) INTO v_final_garments
    FROM jsonb_array_elements(v_existing_garments) AS g
    WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_new_garments) AS n
        WHERE n->>'id' = g->>'id'
    );
    
    v_final_garments := v_final_garments || v_new_garments;
    
    UPDATE public.contracts 
    SET notes = jsonb_set(COALESCE(notes, '{}'::jsonb), '{garments}', v_final_garments)
    WHERE id = p_contract_id;
    
    RETURN v_final_garments;
END;
$$;
