-- Marketing Module V4 Schema Update: Refactor Niche and enhance Workflow

-- Add new columns to split 'niche' into 'platform', 'category', and 'format'
ALTER TABLE public.marketing_contents
ADD COLUMN IF NOT EXISTS platform VARCHAR(50),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS format VARCHAR(50);

-- Migrate existing data from niche (if any)
-- Example data: "TikTok Bridal" -> platform="TikTok", category="Bridal", format="Video"
UPDATE public.marketing_contents
SET platform = SPLIT_PART(niche, ' ', 1),
    category = SPLIT_PART(niche, ' ', 2),
    format = 'Video'
WHERE niche IS NOT NULL AND platform IS NULL;

-- Remove niche column as it's no longer used
-- ALTER TABLE public.marketing_contents DROP COLUMN IF EXISTS niche; 
-- (Commented out drop to avoid losing data in case of rollback, keeping it as legacy)

-- Update status options mapping for the new tabs workflow:
-- IDEA (Ý tưởng) -> NEW
-- IN_PROGRESS (Đang vận hành) -> DRAFTING, READY_TO_SHOOT
-- PUBLISHED (Đã đăng) -> PUBLISHED

-- We'll just rely on the existing status values but ensure any old data is mapped nicely
UPDATE public.marketing_contents
SET status = 'NEW' WHERE status IS NULL OR status = '';
