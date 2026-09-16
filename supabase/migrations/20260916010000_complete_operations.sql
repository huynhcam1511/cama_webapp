BEGIN;
ALTER TABLE public.garment_models
 ALTER COLUMN style_details TYPE text,
 ALTER COLUMN material_pattern TYPE text,
 ALTER COLUMN suit_product_type TYPE text,
 ALTER COLUMN button_style TYPE text;
COMMENT ON COLUMN public.orders.operational_department IS 'VAY = Phòng Váy; SUOT = Phòng Suit; NULL = chưa phân phòng';
-- Keep legacy orders and their evidence available for manual assignment.
UPDATE public.orders SET operational_department = NULL WHERE operational_department = 'VAN_HANH';

CREATE TABLE IF NOT EXISTS public.staff_off_limits (
 department_id uuid NOT NULL REFERENCES public.departments(id),
 weekday integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
 max_off integer NOT NULL CHECK (max_off >= 0),
 PRIMARY KEY (department_id, weekday)
);
CREATE OR REPLACE FUNCTION public.check_staff_off_capacity() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE capacity integer; used integer;
BEGIN
 IF NEW.schedule_type <> 'WEEKLY_OFF' OR NEW.approval_status = 'REJECTED' THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text || NEW.date::text, 1));
 IF EXISTS (SELECT 1 FROM staff_schedules WHERE user_id = NEW.user_id AND date = NEW.date
   AND schedule_type = 'WEEKLY_OFF' AND approval_status <> 'REJECTED' AND id <> NEW.id) THEN
   RAISE EXCEPTION 'Đã đăng ký OFF cho ngày này';
 END IF;
 IF NEW.approval_status <> 'APPROVED' THEN RETURN NEW; END IF;
 SELECT max_off INTO capacity FROM staff_off_limits WHERE department_id = NEW.department_id
   AND weekday = extract(dow from NEW.date)::integer FOR UPDATE;
 IF capacity IS NULL THEN RAISE EXCEPTION 'Chưa cấu hình số nhân viên được OFF cho phòng/ngày này'; END IF;
 SELECT count(DISTINCT user_id) INTO used FROM staff_schedules WHERE department_id = NEW.department_id
   AND date = NEW.date AND schedule_type = 'WEEKLY_OFF' AND approval_status = 'APPROVED' AND id <> NEW.id;
 IF used >= capacity THEN RAISE EXCEPTION 'Đã đủ số nhân viên được OFF trong ngày'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS staff_off_capacity ON public.staff_schedules;
CREATE TRIGGER staff_off_capacity BEFORE INSERT OR UPDATE ON public.staff_schedules
 FOR EACH ROW EXECUTE FUNCTION public.check_staff_off_capacity();

CREATE TABLE IF NOT EXISTS public.payroll_profiles (
 user_id uuid PRIMARY KEY REFERENCES public.users(id),
 base_salary numeric NOT NULL CHECK(base_salary >= 0),
 allowance numeric NOT NULL DEFAULT 0 CHECK(allowance >= 0),
 ot_hourly_rate numeric CHECK(ot_hourly_rate >= 0),
 late_per_minute numeric NOT NULL DEFAULT 0 CHECK(late_per_minute >= 0),
 commission_percent numeric NOT NULL DEFAULT 0 CHECK(commission_percent BETWEEN 0 AND 100),
 updated_by uuid REFERENCES public.users(id), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.kpi_transactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users(id),
 amount numeric(15,2) NOT NULL,
 transaction_type text NOT NULL CHECK(transaction_type IN ('BONUS','PENALTY','COMMISSION')),
 source_reference text, description text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.overtime_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.users(id),
 contract_id uuid REFERENCES public.contracts(id), event_id text,
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
 reason text NOT NULL CHECK(length(trim(reason)) > 0),
 status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')),
 approved_by uuid REFERENCES public.users(id), approved_at timestamptz,
 hourly_rate numeric CHECK(hourly_rate >= 0),
 amount numeric CHECK(amount >= 0),
 created_at timestamptz DEFAULT now(),
 CHECK(ends_at > starts_at AND ends_at <= starts_at + interval '24 hours'),
 CHECK(status <> 'APPROVED' OR (hourly_rate IS NOT NULL AND amount IS NOT NULL AND approved_by IS NOT NULL)),
 CHECK(event_id IS NULL OR contract_id IS NOT NULL)
);
CREATE OR REPLACE FUNCTION public.check_overtime_overlap() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.status = 'REJECTED' THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 2));
 IF EXISTS (SELECT 1 FROM overtime_requests WHERE user_id = NEW.user_id AND id <> NEW.id AND status <> 'REJECTED'
  AND starts_at < NEW.ends_at AND ends_at > NEW.starts_at) THEN RAISE EXCEPTION 'Khoảng giờ OT bị trùng'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS overtime_overlap ON public.overtime_requests;
CREATE TRIGGER overtime_overlap BEFORE INSERT OR UPDATE ON public.overtime_requests FOR EACH ROW EXECUTE FUNCTION public.check_overtime_overlap();

CREATE TABLE IF NOT EXISTS public.contract_commission_allocations (
 contract_id uuid NOT NULL REFERENCES public.contracts(id), user_id uuid NOT NULL REFERENCES public.users(id),
 share_percent numeric NOT NULL CHECK(share_percent > 0 AND share_percent <= 100),
 PRIMARY KEY(contract_id,user_id)
);
CREATE OR REPLACE FUNCTION public.check_commission_share() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.contract_id::text, 3));
 IF NEW.share_percent + coalesce((SELECT sum(share_percent) FROM contract_commission_allocations
 WHERE contract_id = NEW.contract_id AND user_id <> NEW.user_id),0) > 100 THEN RAISE EXCEPTION 'Tổng phân bổ hoa hồng vượt 100%%'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS commission_share ON public.contract_commission_allocations;
CREATE TRIGGER commission_share BEFORE INSERT OR UPDATE ON public.contract_commission_allocations FOR EACH ROW EXECUTE FUNCTION public.check_commission_share();

CREATE TABLE IF NOT EXISTS public.video_reward_rules (
 id boolean PRIMARY KEY DEFAULT true CHECK(id),
 per_thousand_views numeric NOT NULL CHECK(per_thousand_views >= 0),
 per_engagement numeric NOT NULL CHECK(per_engagement >= 0), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.video_reward_awards (
 video_id uuid PRIMARY KEY REFERENCES public.marketing_contents(id),
 user_id uuid NOT NULL REFERENCES public.users(id), log_id text NOT NULL,
 amount numeric NOT NULL CHECK(amount >= 0),
 rule_snapshot jsonb NOT NULL, approved_by uuid NOT NULL REFERENCES public.users(id),
 approved_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_runs (
 period text PRIMARY KEY CHECK(period ~ '^\d{4}-(0[1-9]|1[0-2])$'),
 rows jsonb NOT NULL, finalized_by uuid NOT NULL REFERENCES public.users(id), finalized_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_off_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_commission_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_reward_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_transactions ENABLE ROW LEVEL SECURITY;
-- Access is through RBAC-checked server actions using the service role only.
REVOKE ALL ON public.staff_off_limits, public.payroll_profiles, public.overtime_requests,
 public.contract_commission_allocations, public.video_reward_rules, public.video_reward_awards, public.payroll_runs FROM anon, authenticated;
GRANT ALL ON public.staff_off_limits, public.payroll_profiles, public.overtime_requests,
 public.contract_commission_allocations, public.video_reward_rules, public.video_reward_awards, public.payroll_runs TO service_role;
COMMIT;
