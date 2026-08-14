BEGIN;

CREATE TABLE IF NOT EXISTS public.contract_versions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contract_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('BASELINE', 'INSERT', 'UPDATE', 'DELETE', 'RESTORE')),
  actor_user_id UUID,
  actor_name TEXT NOT NULL DEFAULT 'Hệ thống',
  source_module TEXT NOT NULL DEFAULT 'DATABASE',
  change_summary TEXT,
  old_data JSONB,
  new_data JSONB,
  restored_from_version_id BIGINT,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contract_versions_contract_created_idx
  ON public.contract_versions (contract_id, created_at DESC, id DESC);

ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read contract versions" ON public.contract_versions;

DROP POLICY IF EXISTS "Service role can manage contract versions" ON public.contract_versions;
CREATE POLICY "Service role can manage contract versions"
  ON public.contract_versions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.prevent_contract_version_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'contract_versions is append-only';
END;
$$;

DROP TRIGGER IF EXISTS contract_versions_immutable ON public.contract_versions;
CREATE TRIGGER contract_versions_immutable
BEFORE UPDATE OR DELETE ON public.contract_versions
FOR EACH ROW EXECUTE FUNCTION public.prevent_contract_version_mutation();

CREATE OR REPLACE FUNCTION public.capture_contract_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract_id UUID;
  v_action TEXT;
  v_actor_name TEXT;
  v_source_module TEXT;
  v_summary TEXT;
  v_restored_from BIGINT;
  v_request_id TEXT;
BEGIN
  v_contract_id := COALESCE(NEW.id, OLD.id);
  v_action := CASE TG_OP WHEN 'INSERT' THEN 'INSERT' WHEN 'DELETE' THEN 'DELETE' ELSE 'UPDATE' END;
  v_actor_name := COALESCE(NULLIF(current_setting('cama.actor_name', true), ''), 'Hệ thống');
  v_source_module := COALESCE(NULLIF(current_setting('cama.source_module', true), ''), 'DATABASE');
  v_summary := NULLIF(current_setting('cama.change_summary', true), '');
  v_request_id := NULLIF(current_setting('cama.request_id', true), '');
  v_restored_from := NULLIF(current_setting('cama.restored_from_version_id', true), '')::BIGINT;

  IF v_restored_from IS NOT NULL THEN
    v_action := 'RESTORE';
  END IF;

  INSERT INTO public.contract_versions (
    contract_id, action_type, actor_user_id, actor_name, source_module,
    change_summary, old_data, new_data, restored_from_version_id, request_id
  ) VALUES (
    v_contract_id,
    v_action,
    auth.uid(),
    v_actor_name,
    v_source_module,
    v_summary,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    v_restored_from,
    v_request_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS capture_contract_version_trigger ON public.contracts;
CREATE TRIGGER capture_contract_version_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.capture_contract_version();

INSERT INTO public.contract_versions (
  contract_id, action_type, actor_name, source_module, change_summary, new_data
)
SELECT
  c.id,
  'BASELINE',
  'Hệ thống',
  'VERSIONING_MIGRATION',
  'Bản gốc khi kích hoạt lịch sử phiên bản',
  to_jsonb(c)
FROM public.contracts c
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_versions v WHERE v.contract_id = c.id
);

CREATE OR REPLACE FUNCTION public.restore_contract_version(
  p_contract_id UUID,
  p_version_id BIGINT,
  p_actor_name TEXT DEFAULT 'Không xác định',
  p_source_module TEXT DEFAULT 'CONTRACTS_UI'
)
RETURNS public.contracts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot JSONB;
  v_result public.contracts;
BEGIN
  SELECT COALESCE(new_data, old_data)
  INTO v_snapshot
  FROM public.contract_versions
  WHERE id = p_version_id AND contract_id = p_contract_id;

  IF v_snapshot IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy phiên bản thuộc hợp đồng này';
  END IF;

  PERFORM set_config('cama.actor_name', COALESCE(p_actor_name, 'Không xác định'), true);
  PERFORM set_config('cama.source_module', COALESCE(p_source_module, 'CONTRACTS_UI'), true);
  PERFORM set_config('cama.change_summary', 'Phục hồi về phiên bản #' || p_version_id, true);
  PERFORM set_config('cama.restored_from_version_id', p_version_id::TEXT, true);

  UPDATE public.contracts
  SET
    contract_code = v_snapshot->>'contract_code',
    customer_id = (v_snapshot->>'customer_id')::UUID,
    total_amount = COALESCE((v_snapshot->>'total_amount')::NUMERIC, 0),
    paid_amount = COALESCE((v_snapshot->>'paid_amount')::NUMERIC, 0),
    status = v_snapshot->>'status',
    notes = v_snapshot->>'notes',
    link_pdf = v_snapshot->>'link_pdf',
    deleted_at = NULLIF(v_snapshot->>'deleted_at', '')::TIMESTAMPTZ,
    deleted_by = NULLIF(v_snapshot->>'deleted_by', '')::UUID,
    journey_data = COALESCE(v_snapshot->'journey_data', '{}'::JSONB),
    updated_at = NOW()
  WHERE id = p_contract_id
  RETURNING * INTO v_result;

  IF v_result.id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy hợp đồng cần phục hồi';
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.restore_contract_version(UUID, BIGINT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_contract_version(UUID, BIGINT, TEXT, TEXT) TO service_role;

COMMIT;
