-- TẠO BUCKET LƯU TRỮ FILE CHÍNH SÁCH VÀ MỞ QUYỀN TRUY CẬP (PUBLIC)

-- 1. Tạo bucket mới tên là 'policy_documents' nếu chưa có
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy_documents', 'policy_documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Cho phép tất cả mọi người đọc (download) file từ bucket này
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'policy_documents');

-- 3. Cho phép người dùng upload file vào bucket này (Ở hệ thống thật nên cấu hình Role, ở đây mở nhanh để test)
CREATE POLICY "Allow Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'policy_documents');

-- 4. Cho phép sửa / xóa file
CREATE POLICY "Allow Updates" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'policy_documents');

CREATE POLICY "Allow Deletes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'policy_documents');
