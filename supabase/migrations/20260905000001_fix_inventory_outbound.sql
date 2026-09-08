CREATE OR REPLACE FUNCTION process_inventory_outbound(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_session_id uuid;
    v_staff_id uuid;
    v_reason varchar;
    v_order_id uuid;
    v_contract_id uuid;
    v_notes text;
    v_expected_return_date date;
    v_total int;
    line_item jsonb;
    v_instance_id uuid;
    v_target_status varchar;
    v_current_status varchar;
BEGIN
    v_staff_id := auth.uid();
    IF v_staff_id IS NULL THEN
        RAISE EXCEPTION 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn';
    END IF;

    IF NOT has_module_permission(v_staff_id, 'INVENTORY_OUTBOUND', 'create') THEN
        RAISE EXCEPTION 'Không có quyền xuất kho';
    END IF;
    
    v_reason := payload->>'reason';
    v_order_id := NULLIF(payload->>'order_id', '')::uuid;
    
    IF v_order_id IS NOT NULL THEN
        SELECT contract_id INTO v_contract_id FROM public.orders WHERE id = v_order_id;
    END IF;
    
    IF NULLIF(payload->>'contract_id', '')::uuid IS NOT NULL AND v_contract_id IS DISTINCT FROM NULLIF(payload->>'contract_id', '')::uuid THEN
        -- Allow fallback if order has no contract
        IF v_contract_id IS NULL THEN
             v_contract_id := (payload->>'contract_id')::uuid;
        ELSE
             RAISE EXCEPTION 'Hợp đồng truyền lên không khớp với đơn hàng';
        END IF;
    END IF;
    
    v_notes := payload->>'notes';
    v_expected_return_date := NULLIF(payload->>'expected_return_date', '')::date;
    v_total := jsonb_array_length(payload->'items');

    INSERT INTO public.inventory_outbound_sessions
        (staff_id, reason, order_id, contract_id, notes, total_quantity, expected_return_date)
    VALUES
        (v_staff_id, v_reason, v_order_id, v_contract_id, v_notes, v_total, v_expected_return_date)
    RETURNING id INTO new_session_id;

    FOR line_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_instance_id := (line_item->>'instance_id')::uuid;
        v_target_status := line_item->>'status';
        
        SELECT status INTO v_current_status FROM public.garments_inventory WHERE id = v_instance_id FOR UPDATE;
        
        IF v_current_status IS NULL THEN
            RAISE EXCEPTION 'Không tìm thấy sản phẩm %', v_instance_id;
        END IF;
        
        IF v_current_status != 'AVAILABLE' THEN
            RAISE EXCEPTION 'Sản phẩm % đang ở trạng thái %, không thể xuất kho', v_instance_id, v_current_status;
        END IF;

        INSERT INTO public.inventory_outbound_lines
            (session_id, garment_instance_id, status_changed_to)
        VALUES
            (new_session_id, v_instance_id, v_target_status);

        UPDATE public.garments_inventory
        SET status = v_target_status, updated_at = now()
        WHERE id = v_instance_id;
    END LOOP;

    RETURN new_session_id;
END;
$$;
