-- ==============================================================================
-- FIX CRITICAL SECURITY ADVISOR ISSUE: rls_disabled_in_public
-- Enables Row Level Security (RLS) across all tables in public schema
-- ==============================================================================

-- 1. Tự động kích hoạt Row Level Security (RLS) cho TẤT CẢ các bảng trong schema public
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- 2. Đảm bảo các bảng vừa tạo có RLS và Policy chuẩn
ALTER TABLE IF EXISTS public.sequence_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_outbound_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_outbound_lines ENABLE ROW LEVEL SECURITY;

-- 3. Policy cho sequence_counters (chỉ cho phép authenticated hoặc security definer function truy cập)
DROP POLICY IF EXISTS "Authenticated users access sequence_counters" ON public.sequence_counters;
CREATE POLICY "Authenticated users access sequence_counters"
ON public.sequence_counters FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Policy cho inventory_outbound_sessions & inventory_outbound_lines
DROP POLICY IF EXISTS "Authenticated users access inventory_outbound_sessions" ON public.inventory_outbound_sessions;
CREATE POLICY "Authenticated users access inventory_outbound_sessions"
ON public.inventory_outbound_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users access inventory_outbound_lines" ON public.inventory_outbound_lines;
CREATE POLICY "Authenticated users access inventory_outbound_lines"
ON public.inventory_outbound_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Kích hoạt reload schema cache của PostgREST
NOTIFY pgrst, 'reload schema';
