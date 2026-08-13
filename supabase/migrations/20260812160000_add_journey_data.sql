-- Thêm cột journey_data vào bảng contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS journey_data JSONB DEFAULT '{}'::jsonb;

-- Comment cho cột
COMMENT ON COLUMN public.contracts.journey_data IS 'Dữ liệu hành trình khách hàng bao gồm các Stages và Subtasks checklist';
