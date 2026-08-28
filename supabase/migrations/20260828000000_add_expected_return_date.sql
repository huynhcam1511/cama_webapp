ALTER TABLE public.inventory_outbound_sessions
ADD COLUMN IF NOT EXISTS expected_return_date date;

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
BEGIN
    v_staff_id := (payload->>'staff_id')::uuid;
    v_reason := payload->>'reason';
    v_order_id := NULLIF(payload->>'order_id', '')::uuid;
    v_contract_id := NULLIF(payload->>'contract_id', '')::uuid;
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
