CREATE TABLE IF NOT EXISTS public.inventory_outbound_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.users(id),
    reason varchar(100) NOT NULL, -- "Giao khách", "Vận hành/Sự kiện", "Giặt/Bảo trì"
    contract_id uuid, -- Tùy chọn, liên kết hợp đồng
    notes text,
    completed_at timestamptz DEFAULT now(),
    total_quantity int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_outbound_lines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES public.inventory_outbound_sessions(id) ON DELETE CASCADE,
    garment_instance_id uuid NOT NULL REFERENCES public.garments_inventory(id),
    status_changed_to varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION process_inventory_outbound(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_session_id uuid;
    v_staff_id uuid;
    v_reason varchar;
    v_contract_id uuid;
    v_notes text;
    v_total int;
    
    line_item jsonb;
    v_instance_id uuid;
    v_target_status varchar;
BEGIN
    v_staff_id := (payload->>'staff_id')::uuid;
    v_reason := payload->>'reason';
    v_contract_id := NULLIF(payload->>'contract_id', '')::uuid;
    v_notes := payload->>'notes';
    
    -- Đếm số lượng sản phẩm
    v_total := jsonb_array_length(payload->'items');
    
    -- Tạo phiên xuất kho mới
    INSERT INTO public.inventory_outbound_sessions (staff_id, reason, contract_id, notes, total_quantity)
    VALUES (v_staff_id, v_reason, v_contract_id, v_notes, v_total)
    RETURNING id INTO new_session_id;

    -- Xử lý từng sản phẩm
    FOR line_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_instance_id := (line_item->>'instance_id')::uuid;
        v_target_status := line_item->>'status';
        
        -- Ghi chi tiết xuất kho
        INSERT INTO public.inventory_outbound_lines (session_id, garment_instance_id, status_changed_to)
        VALUES (new_session_id, v_instance_id, v_target_status);
        
        -- Cập nhật trạng thái sản phẩm
        -- Lưu ý: Không xóa cột vị trí (floor, shelf, tier) để lúc trả về nhân sự biết trả lại vào đâu
        UPDATE public.garments_inventory
        SET status = v_target_status,
            updated_at = now()
        WHERE id = v_instance_id;
    END LOOP;

    RETURN new_session_id;
END;
$$;
