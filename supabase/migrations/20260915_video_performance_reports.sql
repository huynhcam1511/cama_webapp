CREATE TABLE IF NOT EXISTS public.video_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    campaign_id UUID REFERENCES public.marketing_contents(id) ON DELETE SET NULL,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    thumbnail_url TEXT,
    category VARCHAR(100) DEFAULT 'ALL',
    target_audience TEXT,
    description TEXT,
    platform_links JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.video_performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_post_id UUID NOT NULL REFERENCES public.video_posts(id) ON DELETE CASCADE,
    version_name VARCHAR(100) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    views INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    cost_spent NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    is_milestone BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_posts_deleted ON public.video_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_video_perf_post_id ON public.video_performance_logs(video_post_id);
CREATE INDEX IF NOT EXISTS idx_video_perf_logged_at ON public.video_performance_logs(logged_at DESC);

ALTER TABLE public.video_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_performance_logs ENABLE ROW LEVEL SECURITY;

DO 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_posts' AND policyname = 'video_posts_all') THEN
        CREATE POLICY video_posts_all ON public.video_posts FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_performance_logs' AND policyname = 'video_performance_logs_all') THEN
        CREATE POLICY video_performance_logs_all ON public.video_performance_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;
END ;