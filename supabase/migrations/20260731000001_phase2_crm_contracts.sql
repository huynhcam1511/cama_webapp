-- ==========================================
-- CAMA WEDDING STUDIO - PHASE 2: CRM & CONTRACTS
-- ==========================================

-- 10. customers
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    bride_name VARCHAR(100) NOT NULL,
    groom_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    wedding_date DATE,
    source VARCHAR(50), -- Facebook, TikTok, Referral, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- 11. contracts
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, IN_PROGRESS, COMPLETED, CANCELLED
    notes TEXT,
    link_pdf TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- 12. contract_services
CREATE TABLE public.contract_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    service_name VARCHAR(200) NOT NULL,
    price DECIMAL(15,2) DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. payment_installments
CREATE TABLE public.payment_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    installment_type VARCHAR(50) NOT NULL, -- DEPOSIT, PARTIAL, FINAL
    amount DECIMAL(15,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50), -- TRANSFER, CASH, CARD
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_installments ENABLE ROW LEVEL SECURITY;

-- Basic RLS
CREATE POLICY "Enable read/write for all users" ON public.customers FOR ALL USING (true);
CREATE POLICY "Enable read/write for all users" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Enable read/write for all users" ON public.contract_services FOR ALL USING (true);
CREATE POLICY "Enable read/write for all users" ON public.payment_installments FOR ALL USING (true);

-- Mock Data for UI Preview
INSERT INTO public.customers (customer_code, bride_name, groom_name, phone, source, wedding_date) VALUES 
('CUST-001', 'Nguyễn Thị Hoa', 'Trần Văn Bình', '0901234567', 'Facebook', '2026-10-15'),
('CUST-002', 'Lê Thu Hà', 'Phạm Minh Tài', '0919876543', 'TikTok', '2026-11-20');

INSERT INTO public.contracts (contract_code, customer_id, total_amount, paid_amount, status) 
SELECT 'HD-001', id, 25000000, 5000000, 'IN_PROGRESS' FROM public.customers WHERE customer_code = 'CUST-001';

INSERT INTO public.contracts (contract_code, customer_id, total_amount, paid_amount, status) 
SELECT 'HD-002', id, 45000000, 45000000, 'COMPLETED' FROM public.customers WHERE customer_code = 'CUST-002';

INSERT INTO public.payment_installments (contract_id, installment_type, amount, status)
SELECT id, 'DEPOSIT', 5000000, 'PAID' FROM public.contracts WHERE contract_code = 'HD-001';

INSERT INTO public.payment_installments (contract_id, installment_type, amount, status)
SELECT id, 'FINAL', 20000000, 'PENDING' FROM public.contracts WHERE contract_code = 'HD-001';
