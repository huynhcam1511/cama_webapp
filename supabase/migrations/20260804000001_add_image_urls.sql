ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.garments_inventory ADD COLUMN IF NOT EXISTS image_url TEXT;
