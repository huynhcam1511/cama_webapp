ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS qa_stages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS qa_incidents JSONB DEFAULT '[]'::jsonb;
