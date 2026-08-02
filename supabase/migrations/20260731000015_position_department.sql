-- Thêm cột department_id vào bảng positions
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- Cập nhật dữ liệu seed cơ bản (phải dựa vào subquery lấy id từ bảng departments)
-- Ví dụ:
-- UPDATE public.positions SET department_id = (SELECT id FROM public.departments WHERE code = 'OPS') WHERE code IN ('OPS_VAY', 'OPS_SUIT', 'OPS_STU');
-- Tuy nhiên, dữ liệu seed thực tế có thể khác, ta chỉ tạo cấu trúc cột thôi. Data có thể được gán trên giao diện hoặc bằng tool sau.
