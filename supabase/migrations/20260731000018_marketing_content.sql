-- Marketing Content Management

CREATE TABLE IF NOT EXISTS public.marketing_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PENDING_REVIEW, APPROVED, PUBLISHED
    planned_date DATE,
    actual_publish_date DATE,
    format VARCHAR(100), -- VIDEO, PHOTO_ALBUM, REELS, SHORT, POST, ...
    asset_link TEXT, -- Link Google Drive / Dropbox
    script TEXT, -- Kịch bản thoại
    revision_notes TEXT, -- Feedback cần sửa
    platform_contents JSONB DEFAULT '{}', -- { "tiktok": "", "page_vay": "", "page_suit": "", "page_studio": "", "page_academy": "", "personal_fb": "" }
    published_links JSONB DEFAULT '{}', -- { "tiktok": "", "facebook": "", "instagram": "" }
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.marketing_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing team can read" ON public.marketing_contents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Marketing team can insert" ON public.marketing_contents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Marketing team can update" ON public.marketing_contents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Marketing team can delete" ON public.marketing_contents FOR DELETE USING (auth.role() = 'authenticated');
