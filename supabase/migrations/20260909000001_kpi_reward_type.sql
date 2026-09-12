ALTER TABLE public.kpi_assignments
  ADD COLUMN IF NOT EXISTS reward_type VARCHAR(30) NOT NULL DEFAULT 'FIXED_AMOUNT';

ALTER TABLE public.kpi_assignments
  DROP CONSTRAINT IF EXISTS kpi_assignments_reward_type_check;

ALTER TABLE public.kpi_assignments
  ADD CONSTRAINT kpi_assignments_reward_type_check
  CHECK (reward_type IN ('FIXED_AMOUNT', 'PERCENT', 'PER_UNIT'));

COMMENT ON COLUMN public.kpi_assignments.reward_type IS
  'FIXED_AMOUNT: tiền cố định; PERCENT: tỷ lệ phần trăm; PER_UNIT: tiền trên mỗi đơn vị thực đạt';

NOTIFY pgrst, 'reload schema';
