-- Tạo sequence để cấp mã nội bộ (6 số)
CREATE SEQUENCE IF NOT EXISTS public.garments_sku_seq START 1;

-- Thêm các cột phân loại và thông tin tài sản vào bảng garments_inventory
ALTER TABLE public.garments_inventory
  ADD COLUMN IF NOT EXISTS sku VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS factory_code VARCHAR(100), -- Mã mác áo
  ADD COLUMN IF NOT EXISTS group_type VARCHAR(10), -- Nhóm (SU, JA, VC...)
  ADD COLUMN IF NOT EXISTS style_details VARCHAR(20), -- Form & Chi tiết (S02C, DCTV...)
  ADD COLUMN IF NOT EXISTS material_pattern VARCHAR(20), -- Chất liệu & Họa tiết (KD, RD...)
  ADD COLUMN IF NOT EXISTS size_code VARCHAR(10), -- Size (50, 0S...)
  ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'Standard', -- Phân khúc
  ADD COLUMN IF NOT EXISTS brand VARCHAR(100), -- Thương hiệu
  ADD COLUMN IF NOT EXISTS rental_price DECIMAL(12,2) DEFAULT 0, -- Giá thuê
  ADD COLUMN IF NOT EXISTS purchase_date DATE, -- Ngày nhập
  ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(12,2) DEFAULT 0; -- Giá nhập

-- Trigger tự động sinh mã SKU Fixed-Length (16 ký tự + 4 gạch ngang)
CREATE OR REPLACE FUNCTION generate_garment_sku()
RETURNS TRIGGER AS $$
DECLARE
  seq_num TEXT;
BEGIN
  -- Lấy số tự tăng và lót đủ 6 số 0
  SELECT LPAD(nextval('garments_sku_seq')::TEXT, 6, '0') INTO seq_num;
  
  -- Chuẩn hóa độ dài các phân đoạn (Padding X nếu thiếu, cắt bớt nếu thừa)
  NEW.group_type := UPPER(RPAD(SUBSTRING(COALESCE(NEW.group_type, 'XX') FROM 1 FOR 2), 2, 'X'));
  NEW.style_details := UPPER(RPAD(SUBSTRING(COALESCE(NEW.style_details, 'XXXX') FROM 1 FOR 4), 4, 'X'));
  NEW.material_pattern := UPPER(RPAD(SUBSTRING(COALESCE(NEW.material_pattern, 'XX') FROM 1 FOR 2), 2, 'X'));
  NEW.size_code := UPPER(RPAD(SUBSTRING(COALESCE(NEW.size_code, 'XX') FROM 1 FOR 2), 2, 'X'));
  
  -- Ghép chuỗi tạo SKU hoàn chỉnh (VD: JA-000001-S02C-KD-50)
  NEW.sku := NEW.group_type || '-' || seq_num || '-' || NEW.style_details || '-' || NEW.material_pattern || '-' || NEW.size_code;
  
  -- Sử dụng SKU làm qr_code để in tem (qr_code đang là UNIQUE và NOT NULL)
  NEW.qr_code := NEW.sku;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_garment_sku ON garments_inventory;
CREATE TRIGGER trigger_generate_garment_sku
BEFORE INSERT ON garments_inventory
FOR EACH ROW
EXECUTE FUNCTION generate_garment_sku();
