-- Add new columns to garment_models based on audio feedback
ALTER TABLE public.garment_models
ADD COLUMN IF NOT EXISTS color_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS fit_note TEXT,
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;
