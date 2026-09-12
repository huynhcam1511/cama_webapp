-- KPI foundation: definitions, periods, assignments and calculated results.
-- kpi_rules/kpi_transactions remain payout configuration and money ledger;
-- they are deliberately not used as the source of KPI truth.

CREATE TABLE IF NOT EXISTS public.kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metric_type VARCHAR(30) NOT NULL CHECK (metric_type IN ('COUNT', 'AMOUNT', 'RATE', 'DURATION', 'SCORE')),
    unit VARCHAR(30) NOT NULL CHECK (unit IN ('VND', 'COUNT', 'PERCENT', 'MINUTE', 'POINT')),
    direction VARCHAR(20) NOT NULL DEFAULT 'HIGHER_IS_BETTER' CHECK (direction IN ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER')),
    calculation_method TEXT NOT NULL,
    source_module VARCHAR(100) NOT NULL,
    source_date_field VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'MONTH' CHECK (period_type IN ('WEEK', 'MONTH', 'QUARTER', 'YEAR')),
    allowed_scopes TEXT[] NOT NULL DEFAULT ARRAY['COMPANY', 'DEPARTMENT', 'EMPLOYEE'],
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'REPLACED')),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kpi_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('WEEK', 'MONTH', 'QUARTER', 'YEAR')),
    label VARCHAR(100) NOT NULL,
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('DRAFT', 'OPEN', 'LOCKED')),
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT kpi_period_valid_range CHECK (ends_on >= starts_on),
    UNIQUE(period_type, starts_on, ends_on)
);

CREATE TABLE IF NOT EXISTS public.kpi_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL REFERENCES public.kpi_definitions(id),
    period_id UUID NOT NULL REFERENCES public.kpi_periods(id),
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('COMPANY', 'DEPARTMENT', 'EMPLOYEE')),
    department_id UUID REFERENCES public.departments(id),
    user_id UUID REFERENCES public.users(id),
    target_value NUMERIC(18,4) NOT NULL CHECK (target_value >= 0),
    weight NUMERIC(7,4) NOT NULL DEFAULT 1 CHECK (weight >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'LOCKED', 'REPLACED')),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    effective_from DATE,
    effective_to DATE,
    approval_note TEXT,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT kpi_assignment_scope_target CHECK (
      (scope_type = 'COMPANY' AND department_id IS NULL AND user_id IS NULL) OR
      (scope_type = 'DEPARTMENT' AND department_id IS NOT NULL AND user_id IS NULL) OR
      (scope_type = 'EMPLOYEE' AND user_id IS NOT NULL)
    ),
    CONSTRAINT kpi_assignment_effective_range CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS kpi_assignment_company_unique
  ON public.kpi_assignments(definition_id, period_id) WHERE scope_type = 'COMPANY' AND status <> 'REPLACED';
CREATE UNIQUE INDEX IF NOT EXISTS kpi_assignment_department_unique
  ON public.kpi_assignments(definition_id, period_id, department_id) WHERE scope_type = 'DEPARTMENT' AND status <> 'REPLACED';
CREATE UNIQUE INDEX IF NOT EXISTS kpi_assignment_employee_unique
  ON public.kpi_assignments(definition_id, period_id, user_id) WHERE scope_type = 'EMPLOYEE' AND status <> 'REPLACED';

CREATE TABLE IF NOT EXISTS public.kpi_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.kpi_assignments(id),
    target_value NUMERIC(18,4) NOT NULL,
    actual_value NUMERIC(18,4),
    progress_percent NUMERIC(12,4),
    score NUMERIC(12,4),
    calculation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (calculation_status IN ('PENDING', 'CALCULATING', 'READY', 'NO_DATA', 'ERROR', 'LOCKED')),
    source_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_count INTEGER NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ,
    calculation_key VARCHAR(255),
    error_message TEXT,
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(assignment_id),
    UNIQUE(calculation_key)
);

CREATE TABLE IF NOT EXISTS public.kpi_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES public.users(id),
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('DEFINITION', 'PERIOD', 'ASSIGNMENT', 'RESULT')),
    entity_id UUID NOT NULL,
    action VARCHAR(40) NOT NULL,
    reason TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kpi_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL REFERENCES public.kpi_results(id),
    requested_value NUMERIC(18,4) NOT NULL,
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) >= 3),
    source_reference TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_by UUID NOT NULL REFERENCES public.users(id),
    reviewed_by UUID REFERENCES public.users(id),
    review_note TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kpi_period_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES public.kpi_periods(id),
    snapshot JSONB NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(period_id)
);

ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_period_snapshots ENABLE ROW LEVEL SECURITY;

-- Runtime reads are scoped by authenticated identity. Mutations go through
-- permission-guarded server actions; the service role bypasses RLS there.
CREATE POLICY "Permission read KPI definitions" ON public.kpi_definitions FOR SELECT TO authenticated
  USING (public.has_module_permission('KPI_PERFORMANCE', 'view'));
CREATE POLICY "Permission read KPI periods" ON public.kpi_periods FOR SELECT TO authenticated
  USING (public.has_module_permission('KPI_PERFORMANCE', 'view'));
CREATE POLICY "Read scoped KPI assignments" ON public.kpi_assignments FOR SELECT TO authenticated USING (
  public.has_module_permission('KPI_PERFORMANCE', 'view') AND (
    scope_type = 'COMPANY'
    OR user_id = auth.uid()
    OR department_id = (SELECT u.department_id FROM public.users u WHERE u.id = auth.uid())
  )
);
CREATE POLICY "Read scoped KPI results" ON public.kpi_results FOR SELECT TO authenticated USING (
  public.has_module_permission('KPI_PERFORMANCE', 'view') AND EXISTS (
    SELECT 1 FROM public.kpi_assignments a
    WHERE a.id = assignment_id
      AND (a.scope_type = 'COMPANY' OR a.user_id = auth.uid()
        OR a.department_id = (SELECT u.department_id FROM public.users u WHERE u.id = auth.uid()))
  )
);
CREATE POLICY "Read scoped KPI adjustments" ON public.kpi_adjustments FOR SELECT TO authenticated USING (
  public.has_module_permission('KPI_PERFORMANCE', 'view') AND EXISTS (
    SELECT 1 FROM public.kpi_results r JOIN public.kpi_assignments a ON a.id = r.assignment_id
    WHERE r.id = result_id AND (a.user_id = auth.uid() OR a.scope_type = 'COMPANY'
      OR a.department_id = (SELECT u.department_id FROM public.users u WHERE u.id = auth.uid()))
  )
);
CREATE POLICY "Read KPI snapshots" ON public.kpi_period_snapshots FOR SELECT TO authenticated
  USING (public.has_module_permission('KPI_PERFORMANCE', 'view'));

CREATE OR REPLACE FUNCTION public.lock_kpi_period(p_period_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_period public.kpi_periods%ROWTYPE;
  v_total INTEGER;
  v_active INTEGER;
BEGIN
  IF v_actor IS NULL OR NOT public.has_module_permission('KPI_PERFORMANCE', 'update') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  SELECT * INTO v_period FROM public.kpi_periods WHERE id = p_period_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'KPI_PERIOD_NOT_FOUND'; END IF;
  IF v_period.status = 'LOCKED' THEN RETURN jsonb_build_object('success', true, 'already_locked', true); END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'ACTIVE')
    INTO v_total, v_active
  FROM public.kpi_assignments
  WHERE period_id = p_period_id AND status <> 'REPLACED';
  IF v_total = 0 THEN RAISE EXCEPTION 'KPI_PERIOD_EMPTY'; END IF;
  IF v_total <> v_active THEN RAISE EXCEPTION 'KPI_ASSIGNMENTS_NOT_APPROVED'; END IF;

  UPDATE public.kpi_assignments SET status = 'LOCKED', updated_by = v_actor, updated_at = NOW()
    WHERE period_id = p_period_id AND status = 'ACTIVE';
  UPDATE public.kpi_results SET calculation_status = 'LOCKED', locked_at = NOW(), updated_at = NOW()
    WHERE assignment_id IN (SELECT id FROM public.kpi_assignments WHERE period_id = p_period_id);
  INSERT INTO public.kpi_period_snapshots(period_id, snapshot, created_by)
    SELECT p_period_id,
      COALESCE(jsonb_agg(jsonb_build_object(
        'assignment_id', a.id, 'definition_id', a.definition_id, 'scope_type', a.scope_type,
        'department_id', a.department_id, 'user_id', a.user_id, 'target', r.target_value,
        'actual', r.actual_value, 'progress', r.progress_percent, 'score', r.score
      ) ORDER BY a.id), '[]'::jsonb), v_actor
    FROM public.kpi_assignments a LEFT JOIN public.kpi_results r ON r.assignment_id = a.id
    WHERE a.period_id = p_period_id
    ON CONFLICT (period_id) DO NOTHING;
  UPDATE public.kpi_periods SET status = 'LOCKED', locked_by = v_actor, locked_at = NOW()
    WHERE id = p_period_id;
  INSERT INTO public.kpi_audit_logs(actor_user_id, entity_type, entity_id, action, new_data)
    VALUES (v_actor, 'PERIOD', p_period_id, 'LOCKED', jsonb_build_object('status', 'LOCKED', 'assignment_count', v_total));
  RETURN jsonb_build_object('success', true, 'assignment_count', v_total);
END;
$$;

REVOKE ALL ON FUNCTION public.lock_kpi_period(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lock_kpi_period(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.recompute_kpi_period(p_period_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_period public.kpi_periods%ROWTYPE;
  v_row RECORD;
  v_actual NUMERIC(18,4);
  v_count INTEGER;
  v_denominator INTEGER;
  v_progress NUMERIC(12,4);
  v_score NUMERIC(12,4);
  v_status VARCHAR(20);
  v_error TEXT;
  v_processed INTEGER := 0;
BEGIN
  IF v_actor IS NULL OR NOT public.has_module_permission('KPI_PERFORMANCE', 'update') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;
  SELECT * INTO v_period FROM public.kpi_periods WHERE id = p_period_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'KPI_PERIOD_NOT_FOUND'; END IF;
  IF v_period.status = 'LOCKED' THEN RAISE EXCEPTION 'KPI_PERIOD_LOCKED'; END IF;

  FOR v_row IN
    SELECT a.*, d.code, d.direction, d.version AS definition_version
    FROM public.kpi_assignments a
    JOIN public.kpi_definitions d ON d.id = a.definition_id
    WHERE a.period_id = p_period_id AND a.status = 'ACTIVE'
    ORDER BY a.id
  LOOP
    v_actual := NULL; v_count := 0; v_denominator := 0; v_error := NULL; v_status := 'READY';

    -- Phase K3 supports company totals from canonical source tables. Scoped
    -- metrics stay explicit NO_DATA until ownership mappings are confirmed.
    IF v_row.scope_type <> 'COMPANY' THEN
      v_status := 'NO_DATA';
      v_error := 'Chưa có mapping nguồn đáng tin cậy cho KPI phòng/nhân viên.';
    ELSIF v_row.code = 'CONTRACT_REVENUE' THEN
      SELECT COALESCE(SUM(total_amount), 0), COUNT(*) INTO v_actual, v_count
      FROM public.contracts
      WHERE contract_date BETWEEN v_period.starts_on AND v_period.ends_on
        AND deleted_at IS NULL AND UPPER(COALESCE(status, '')) NOT IN ('CANCELLED', 'REFUNDED');
    ELSIF v_row.code = 'CASH_COLLECTED' THEN
      SELECT COALESCE(SUM(CASE WHEN UPPER(COALESCE(status, 'COMPLETED')) = 'REFUNDED' THEN -amount ELSE amount END), 0),
             COUNT(*) FILTER (WHERE UPPER(COALESCE(status, 'COMPLETED')) <> 'CANCELLED')
        INTO v_actual, v_count
      FROM public.contract_payments
      WHERE payment_date >= v_period.starts_on::timestamptz
        AND payment_date < (v_period.ends_on + 1)::timestamptz
        AND UPPER(COALESCE(status, 'COMPLETED')) <> 'CANCELLED';
    ELSIF v_row.code = 'NEW_CONTRACTS' THEN
      SELECT COUNT(*)::numeric, COUNT(*) INTO v_actual, v_count
      FROM public.contracts
      WHERE contract_date BETWEEN v_period.starts_on AND v_period.ends_on
        AND deleted_at IS NULL AND UPPER(COALESCE(status, '')) NOT IN ('CANCELLED', 'REFUNDED');
    ELSIF v_row.code = 'APPOINTMENTS' THEN
      SELECT COUNT(*)::numeric, COUNT(*) INTO v_actual, v_count
      FROM public.operation_schedules
      WHERE date BETWEEN v_period.starts_on AND v_period.ends_on
        AND schedule_category = 'SALE_BOOKING' AND UPPER(COALESCE(status, '')) <> 'CANCELLED';
    ELSIF v_row.code = 'CONVERSION_RATE' THEN
      SELECT COUNT(*) INTO v_denominator FROM public.operation_schedules
      WHERE date BETWEEN v_period.starts_on AND v_period.ends_on
        AND schedule_category = 'SALE_BOOKING' AND UPPER(COALESCE(status, '')) <> 'CANCELLED';
      SELECT COUNT(*) INTO v_count FROM public.contracts
      WHERE contract_date BETWEEN v_period.starts_on AND v_period.ends_on
        AND deleted_at IS NULL AND UPPER(COALESCE(status, '')) NOT IN ('CANCELLED', 'REFUNDED');
      IF v_denominator = 0 THEN v_status := 'NO_DATA'; v_error := 'Không có lịch hẹn đủ điều kiện trong kỳ.';
      ELSE v_actual := ROUND(v_count::numeric * 100 / v_denominator, 4); END IF;
    ELSIF v_row.code = 'ORDERS_ON_TIME' THEN
      SELECT COUNT(*) INTO v_denominator FROM public.orders
      WHERE return_date BETWEEN v_period.starts_on AND v_period.ends_on
        AND deleted_at IS NULL AND UPPER(COALESCE(completion_status, '')) <> 'CANCELLED';
      SELECT COUNT(*) INTO v_count FROM public.orders
      WHERE return_date BETWEEN v_period.starts_on AND v_period.ends_on
        AND deleted_at IS NULL AND UPPER(COALESCE(completion_status, '')) = 'COMPLETED'
        AND updated_at::date <= return_date;
      IF v_denominator = 0 THEN v_status := 'NO_DATA'; v_error := 'Không có đơn đến hạn trong kỳ.';
      ELSE v_actual := ROUND(v_count::numeric * 100 / v_denominator, 4); END IF;
    ELSE
      v_status := 'NO_DATA'; v_error := 'KPI chưa có adapter tính toán.';
    END IF;

    IF v_status = 'READY' AND v_actual IS NOT NULL THEN
      IF v_row.target_value = 0 THEN
        v_progress := CASE WHEN v_actual = 0 THEN 100 ELSE NULL END;
      ELSIF v_row.direction = 'LOWER_IS_BETTER' THEN
        v_progress := ROUND(v_row.target_value * 100 / NULLIF(v_actual, 0), 4);
      ELSE
        v_progress := ROUND(v_actual * 100 / v_row.target_value, 4);
      END IF;
      v_score := LEAST(COALESCE(v_progress, 0), 200) * v_row.weight / 100;
    ELSE
      v_progress := NULL; v_score := NULL;
    END IF;

    INSERT INTO public.kpi_results
      (assignment_id, target_value, actual_value, progress_percent, score, calculation_status,
       source_snapshot, source_count, calculated_at, calculation_key, error_message, updated_at)
    VALUES
      (v_row.id, v_row.target_value, v_actual, v_progress, v_score, v_status,
       jsonb_build_object('metric', v_row.code, 'period_start', v_period.starts_on, 'period_end', v_period.ends_on,
         'numerator', v_count, 'denominator', NULLIF(v_denominator, 0)),
       v_count, NOW(), v_row.id::text || ':v' || v_row.definition_version::text || ':' || v_period.starts_on::text, v_error, NOW())
    ON CONFLICT (assignment_id) DO UPDATE SET
      target_value = EXCLUDED.target_value, actual_value = EXCLUDED.actual_value,
      progress_percent = EXCLUDED.progress_percent, score = EXCLUDED.score,
      calculation_status = EXCLUDED.calculation_status, source_snapshot = EXCLUDED.source_snapshot,
      source_count = EXCLUDED.source_count, calculated_at = EXCLUDED.calculated_at,
      calculation_key = EXCLUDED.calculation_key, error_message = EXCLUDED.error_message, updated_at = NOW();
    v_processed := v_processed + 1;
  END LOOP;

  INSERT INTO public.kpi_audit_logs(actor_user_id, entity_type, entity_id, action, new_data)
    VALUES (v_actor, 'PERIOD', p_period_id, 'RECOMPUTED', jsonb_build_object('processed', v_processed));
  RETURN jsonb_build_object('success', true, 'processed', v_processed);
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_kpi_period(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_kpi_period(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_kpi_adjustment(p_adjustment_id UUID, p_approve BOOLEAN, p_note TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor UUID := auth.uid(); v_adjustment public.kpi_adjustments%ROWTYPE;
BEGIN
  IF v_actor IS NULL OR NOT public.has_module_permission('KPI_PERFORMANCE', 'update') THEN RAISE EXCEPTION 'PERMISSION_DENIED'; END IF;
  SELECT * INTO v_adjustment FROM public.kpi_adjustments WHERE id = p_adjustment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ADJUSTMENT_NOT_FOUND'; END IF;
  IF v_adjustment.status <> 'PENDING' THEN RAISE EXCEPTION 'ADJUSTMENT_ALREADY_REVIEWED'; END IF;
  UPDATE public.kpi_adjustments SET status = CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
    reviewed_by = v_actor, reviewed_at = NOW(), review_note = NULLIF(trim(p_note), '') WHERE id = p_adjustment_id;
  IF p_approve THEN
    UPDATE public.kpi_results SET actual_value = v_adjustment.requested_value,
      progress_percent = CASE WHEN target_value = 0 THEN CASE WHEN v_adjustment.requested_value = 0 THEN 100 ELSE NULL END
        ELSE ROUND(v_adjustment.requested_value * 100 / target_value, 4) END,
      source_snapshot = source_snapshot || jsonb_build_object('approved_adjustment_id', p_adjustment_id), updated_at = NOW()
    WHERE id = v_adjustment.result_id AND calculation_status <> 'LOCKED';
  END IF;
  INSERT INTO public.kpi_audit_logs(actor_user_id, entity_type, entity_id, action, reason)
    VALUES(v_actor, 'RESULT', v_adjustment.result_id, CASE WHEN p_approve THEN 'ADJUSTMENT_APPROVED' ELSE 'ADJUSTMENT_REJECTED' END, p_note);
  RETURN jsonb_build_object('success', true);
END; $$;
REVOKE ALL ON FUNCTION public.review_kpi_adjustment(UUID, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_kpi_adjustment(UUID, BOOLEAN, TEXT) TO authenticated;

INSERT INTO public.kpi_definitions
  (code, name, description, metric_type, unit, calculation_method, source_module, source_date_field, status)
VALUES
  ('CONTRACT_REVENUE', 'Doanh thu hợp đồng', 'Tổng giá trị hợp đồng hợp lệ được ký trong kỳ.', 'AMOUNT', 'VND', 'Tổng giá trị hợp đồng không hủy theo ngày lập hợp đồng.', 'STUDIO_CONTRACTS', 'contract_date', 'ACTIVE'),
  ('CASH_COLLECTED', 'Doanh thu thực thu', 'Tổng giao dịch thu đã ghi nhận và không bị hoàn trong kỳ.', 'AMOUNT', 'VND', 'Tổng giao dịch thu hợp lệ trừ hoàn tiền theo ngày giao dịch.', 'CASHFLOW', 'transaction_date', 'ACTIVE'),
  ('NEW_CONTRACTS', 'Hợp đồng mới', 'Số hợp đồng hợp lệ được ký trong kỳ.', 'COUNT', 'COUNT', 'Đếm hợp đồng không hủy theo ngày lập hợp đồng.', 'STUDIO_CONTRACTS', 'contract_date', 'ACTIVE'),
  ('CONVERSION_RATE', 'Tỷ lệ chốt', 'Tỷ lệ khách ký hợp đồng trên số lịch hẹn đủ điều kiện.', 'RATE', 'PERCENT', 'Số khách ký hợp đồng chia số lịch hẹn đủ điều kiện trong kỳ.', 'APPOINTMENTS', 'date', 'ACTIVE'),
  ('APPOINTMENTS', 'Số lịch hẹn', 'Số lịch tư vấn không hủy trong kỳ.', 'COUNT', 'COUNT', 'Đếm lịch SALE_BOOKING không hủy theo ngày hẹn.', 'APPOINTMENTS', 'date', 'ACTIVE'),
  ('ORDERS_ON_TIME', 'Đơn hoàn thành đúng hạn', 'Tỷ lệ đơn hoàn thành không trễ hạn cam kết.', 'RATE', 'PERCENT', 'Số đơn hoàn thành đúng hạn chia tổng đơn đến hạn trong kỳ.', 'ORDERS', 'completed_at', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;
