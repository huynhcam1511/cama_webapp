-- Thêm cột attachment_url vào bảng policies
ALTER TABLE public.policies
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Bật tính năng Storage nếu chưa bật
INSERT INTO storage.buckets (id, name, public) 
VALUES ('policy_files', 'policy_files', true)
ON CONFLICT (id) DO NOTHING;

-- Phân quyền RLS cho Storage Bucket 'policy_files'
-- Cho phép Authenticated Users đọc file
CREATE POLICY "Authenticated users can view policy files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'policy_files' 
    AND auth.role() = 'authenticated'
);

-- Cho phép Authenticated Users tải lên file
CREATE POLICY "Authenticated users can upload policy files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'policy_files' 
    AND auth.role() = 'authenticated'
);

-- Cho phép Authenticated Users sửa file của chính họ (tùy chọn)
CREATE POLICY "Users can update their own policy files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'policy_files' 
    AND auth.uid() = owner
);

-- Cho phép Authenticated Users xóa file của chính họ
CREATE POLICY "Users can delete their own policy files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'policy_files' 
    AND auth.uid() = owner
);
