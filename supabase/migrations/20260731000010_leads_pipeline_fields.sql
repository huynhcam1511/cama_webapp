-- PHASE 10: Nâng cấp trường thông tin Leads Pipeline

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS lead_date DATE,
ADD COLUMN IF NOT EXISTS initial_request VARCHAR(255),
ADD COLUMN IF NOT EXISTS consulting_package VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_contact DATE,
ADD COLUMN IF NOT EXISTS next_followup DATE,
ADD COLUMN IF NOT EXISTS priority_task TEXT,
ADD COLUMN IF NOT EXISTS general_notes TEXT;
