-- Fix V2-04 & V2-05: Atomic payment recording with retry support

CREATE OR REPLACE FUNCTION public.record_payment_transaction(
    p_contract_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_account_fund TEXT,
    p_collector_name TEXT,
    p_content TEXT,
    p_receipt_url TEXT,
    p_notes TEXT,
    p_request_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_contract RECORD;
    v_receipt_code TEXT;
    v_new_total_paid NUMERIC;
    v_installment_type TEXT;
    v_meta JSONB;
    v_payment_status TEXT;
    v_debt_status TEXT;
    v_existing_receipt TEXT;
BEGIN
    -- 1. Idempotency Check & Lock
    -- Lock contract first to serialize requests
    SELECT * INTO v_contract FROM public.contracts WHERE id = p_contract_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hợp đồng không tồn tại';
    END IF;

    -- Check if payment already exists
    SELECT notes::jsonb->>'receipt_code' INTO v_existing_receipt
    FROM public.payment_installments 
    WHERE notes::jsonb->>'request_id' = p_request_id AND contract_id = p_contract_id
    LIMIT 1;

    IF v_existing_receipt IS NOT NULL THEN
        -- Return the exact same structure as success
        RETURN jsonb_build_object(
            'success', true,
            'receipt_code', v_existing_receipt,
            'new_total_paid', v_contract.paid_amount,
            'notes', v_contract.notes
        );
    END IF;

    v_receipt_code := 'PT-2026-' || FLOOR(RANDOM() * 90000 + 10000)::TEXT;
    v_new_total_paid := COALESCE(v_contract.paid_amount, 0) + p_amount;
    
    IF v_new_total_paid >= COALESCE(v_contract.total_amount, 0) THEN
        v_installment_type := 'FINAL';
    ELSE
        v_installment_type := 'PARTIAL';
    END IF;

    -- 3. Insert Ledger
    INSERT INTO public.payment_installments (
        contract_id, installment_type, amount, payment_date, payment_method, status, receipt_url, notes
    ) VALUES (
        p_contract_id, v_installment_type, p_amount, NOW(), p_payment_method, 'PAID', p_receipt_url,
        jsonb_build_object(
            'receipt_code', v_receipt_code,
            'collector_name', p_collector_name,
            'account_fund', p_account_fund,
            'request_id', p_request_id
        )::text
    );

    -- Insert Cashflow
    INSERT INTO public.cashflow (
        transaction_type, amount, category, reference_id, reference_type, payment_method, account_fund, description, transaction_date, created_by
    ) VALUES (
        'INCOME', p_amount, 'Thu Tiền Hợp Đồng', p_contract_id, 'CONTRACT', p_payment_method, COALESCE(p_account_fund, 'Tiền Mặt'), COALESCE(p_content, 'Thu tiền hợp đồng'), NOW(), COALESCE(p_collector_name, 'System')
    );

    -- 4. Calculate statuses
    IF COALESCE(v_contract.total_amount, 0) = 0 THEN
        v_payment_status := 'VALUE_UNDETERMINED';
        v_debt_status := 'NO_DEBT';
    ELSIF v_new_total_paid >= v_contract.total_amount THEN
        v_payment_status := 'FULLY_PAID';
        v_debt_status := 'FULLY_COLLECTED';
    ELSIF v_new_total_paid > 0 THEN
        -- Get required_deposit from JSON if available, default to 0
        IF v_new_total_paid >= COALESCE((v_contract.notes::jsonb->>'required_deposit')::NUMERIC, 0) THEN
            v_payment_status := 'DEPOSITED';
        ELSE
            v_payment_status := 'PARTIALLY_PAID';
        END IF;
        v_debt_status := 'IN_TERM';
    ELSE
        v_payment_status := 'UNPAID';
        v_debt_status := 'IN_TERM';
    END IF;

    -- 5. Update Contract JSON
    v_meta := COALESCE(NULLIF(v_contract.notes, ''), '{}')::jsonb;
    
    -- Append payment
    v_meta := jsonb_set(
        v_meta,
        '{payments}',
        COALESCE(v_meta->'payments', '[]'::jsonb) || jsonb_build_object(
            'id', 'pay-' || extract(epoch from now())::bigint::text,
            'contract_id', p_contract_id,
            'receipt_code', v_receipt_code,
            'amount', p_amount,
            'payment_date', NOW(),
            'payment_method', p_payment_method,
            'account_fund', COALESCE(p_account_fund, 'Tài khoản Ngân hàng CAMA'),
            'collector_name', COALESCE(p_collector_name, 'Kế Toán Studio'),
            'content', COALESCE(p_content, 'Thu tiền đặt hợp đồng'),
            'receipt_attachment_url', COALESCE(p_receipt_url, ''),
            'notes', COALESCE(p_notes, ''),
            'status', 'COMPLETED',
            'created_by', COALESCE(p_collector_name, 'System'),
            'created_at', NOW()
        )
    );

    -- Append activity
    v_meta := jsonb_set(
        v_meta,
        '{activities}',
        jsonb_build_array(jsonb_build_object(
            'id', 'act-' || extract(epoch from now())::bigint::text,
            'actor_name', COALESCE(p_collector_name, 'Kế Toán Studio'),
            'action_type', 'RECORD_PAYMENT',
            'content', 'Ghi nhận phiếu thu ' || v_receipt_code || ': ' || p_amount || ' ₫ (' || COALESCE(p_content, 'Thu tiền hợp đồng') || ')',
            'created_at', NOW()
        )) || COALESCE(v_meta->'activities', '[]'::jsonb)
    );

    -- Update statuses in JSON
    v_meta := jsonb_set(v_meta, '{payment_status}', to_jsonb(v_payment_status));
    v_meta := jsonb_set(v_meta, '{debt_status}', to_jsonb(v_debt_status));
    v_meta := jsonb_set(v_meta, '{paid_amount}', to_jsonb(v_new_total_paid));

    UPDATE public.contracts 
    SET paid_amount = v_new_total_paid,
        notes = v_meta::text,
        updated_at = NOW()
    WHERE id = p_contract_id;

    RETURN jsonb_build_object(
        'success', true,
        'receipt_code', v_receipt_code,
        'new_total_paid', v_new_total_paid,
        'notes', v_meta
    );
END;
$$;
