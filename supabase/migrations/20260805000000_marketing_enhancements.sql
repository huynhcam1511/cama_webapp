-- Add enhancements to marketing_contents for AI Pipeline

ALTER TABLE public.marketing_contents
ADD COLUMN IF NOT EXISTS source_insight TEXT,
ADD COLUMN IF NOT EXISTS target_platform VARCHAR(50); -- e.g. TIKTOK_BRIDAL, FB_SUIT

-- Insert some dummy AI Ideas for Trúc to test
INSERT INTO public.marketing_contents (title, status, source_insight, target_platform, script)
VALUES 
('Eo bánh mì đòi mặc đuôi cá?', 'DRAFT', 'Xu hướng tìm kiếm váy xòe giấu bụng tăng mạnh trên Facebook', 'TIKTOK_BRIDAL', 
'**Góc Máy:**
- 0-3s: Cận cảnh chị Hiền đang chật vật kéo khóa váy đuôi cá cho khách.
- 3-10s: Anh Hùng cầm váy xòe bung ra trước ống kính.

**Thoại:**
- Anh Hùng: "Mấy bà cứ than với tôi eo bánh mì, mà tới tiệm toàn đòi ních vào đuôi cá!"

**Yêu cầu Đăng bài:**
- Khung giờ: 19h30 Tối thứ 6.
- Caption: Bạn thích mặc đuôi cá nhưng sợ lộ bụng? Xem ngay giải pháp từ chuyên gia CAMA!
- Hashtag: #camawedding #vaycuoidep #giáukhuyếtđiểm'),

('Chú rể gầy mặc suit đen: Thảm họa', 'DRAFT', 'Nhiều chú rể gầy phàn nàn mặc suit đen bị chìm', 'TIKTOK_SUIT',
'**Góc Máy:**
- 0-3s: Chú rể gầy mặc suit đen rộng lùng bùng.
- 3-10s: Cận cảnh đổi sang suit sáng màu, form slim fit.

**Thoại:**
- Anh Hùng: "Sai lầm lớn nhất của chú rể gầy là chọn suit đen rộng. Nó nuốt chửng bạn!"

**Yêu cầu Đăng bài:**
- Khung giờ: 11h30 Trưa thứ 7.
- Caption: Chú rể gầy chọn suit thế nào cho chuẩn?
- Hashtag: #camasuit #churegay #suitnam');
