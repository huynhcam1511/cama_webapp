-- Add multi-channel tracking fields
ALTER TABLE public.marketing_contents
ADD COLUMN IF NOT EXISTS drive_asset_link VARCHAR(255),
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '{}'::jsonb;
