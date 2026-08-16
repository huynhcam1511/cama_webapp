-- Giai đoạn 2: Tách biệt Hợp đồng (Dịch vụ & Bán hàng)

-- Thêm trường contract_type vào bảng contracts
-- Mặc định là SERVICE (Dịch vụ)
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS contract_type VARCHAR(20) DEFAULT 'SERVICE' NOT NULL;

-- Đảm bảo contract_type chỉ nhận các giá trị hợp lệ
ALTER TABLE contracts
ADD CONSTRAINT valid_contract_type CHECK (contract_type IN ('SERVICE', 'SALES'));

-- Cập nhật comment giải thích
COMMENT ON COLUMN contracts.contract_type IS 'Loại hợp đồng: SERVICE (Cho thuê/Chụp ảnh) hoặc SALES (Bán lẻ/Bán đứt/Đền bù)';

-- Vì có tính năng "Bán đứt" (SOLD), cần cập nhật bảng trạng thái garments_inventory (nếu có enum constraint)
-- Tuy nhiên garments_inventory status hiện là VARCHAR(20) nên không cần ALTER TYPE, 
-- chỉ cần code ứng dụng insert 'SOLD'.
