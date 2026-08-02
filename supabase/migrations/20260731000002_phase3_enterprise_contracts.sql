-- ====================================================================
-- CAMA WEDDING STUDIO - PHASE 3: ENTERPRISE CONTRACT SYSTEM EXPANSION
-- ====================================================================

-- 1. Extend customers table
ALTER TABLE public.customers 
  ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS engagement_date DATE,
  ADD COLUMN IF NOT EXISTS wedding_location TEXT;

-- 2. Extend contracts table
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS paper_contract_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS contract_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'CAMA Haute Couture',
  ADD COLUMN IF NOT EXISTS assigned_staff_name VARCHAR(100) DEFAULT 'Lễ Tân Studio',
  ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100) DEFAULT 'Admin',
  ADD COLUMN IF NOT EXISTS updated_by_name VARCHAR(100) DEFAULT 'Admin',
  ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'AMOUNT', -- 'AMOUNT' or 'PERCENT'
  ADD COLUMN IF NOT EXISTS surcharge_amount DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS required_deposit DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_notes TEXT,
  ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS contract_status VARCHAR(50) DEFAULT 'EFFECTIVE', -- DRAFT, CONFIRMED, EFFECTIVE, SUSPENDED, CANCELLED, COMPLETED, ARCHIVED
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID', -- UNPAID, DEPOSITED, PARTIALLY_PAID, FULLY_PAID, OVERDUE, REFUNDED
  ADD COLUMN IF NOT EXISTS execution_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, FITTING_WAIT, SAMPLE_WAIT, MEASURE_WAIT, PREPARING, SHOOT_WAIT, EXECUTING, DELIVERING_WAIT, RENTING, RETURN_WAIT, PRODUCT_WAIT, COMPLETED
  ADD COLUMN IF NOT EXISTS debt_status VARCHAR(50) DEFAULT 'IN_TERM', -- IN_TERM, NEAR_DUE, OVERDUE, FULLY_COLLECTED
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS canceled_by_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(15,2) DEFAULT 0;

-- 3. Create contract_items table
CREATE TABLE IF NOT EXISTS public.contract_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) DEFAULT 'SERVICE', -- RENTAL, BUY, SERVICE, GIFT
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'gói',
    unit_price DECIMAL(15,2) DEFAULT 0,
    line_discount DECIMAL(15,2) DEFAULT 0,
    surcharge DECIMAL(15,2) DEFAULT 0,
    amount DECIMAL(15,2) DEFAULT 0,
    staff_assigned VARCHAR(200),
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create contract_payments table (Full payment transactions)
CREATE TABLE IF NOT EXISTS public.contract_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    receipt_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'TRANSFER', -- CASH, TRANSFER, CARD, OTHER
    account_fund VARCHAR(100) DEFAULT 'Tài khoản Ngân hàng CAMA',
    collector_name VARCHAR(100) DEFAULT 'Kế Toán Studio',
    content TEXT,
    receipt_attachment_url TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'COMPLETED', -- COMPLETED, CANCELLED, REFUNDED
    created_by VARCHAR(100) DEFAULT 'Kế Toán Studio',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by VARCHAR(100),
    cancel_reason TEXT
);

-- 5. Create contract_schedules table (Milestones & Timeline)
CREATE TABLE IF NOT EXISTS public.contract_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    milestone_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    assigned_to VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, OVERDUE, CANCELLED
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create contract_garments table (Wardrobe reservation)
CREATE TABLE IF NOT EXISTS public.contract_garments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    garment_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) DEFAULT 'Váy Cưới',
    size VARCHAR(20),
    deliver_date DATE,
    return_date DATE,
    reservation_status VARCHAR(50) DEFAULT 'RESERVED', -- RESERVED, DELIVERED, RETURNED
    fitting_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create contract_documents table (File attachments)
CREATE TABLE IF NOT EXISTS public.contract_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) DEFAULT 'PAPER_CONTRACT_IMAGE',
    uploaded_by VARCHAR(100) DEFAULT 'Nhân viên Studio',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create contract_activities table (Audit Trail & Activity Log)
CREATE TABLE IF NOT EXISTS public.contract_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    actor_name VARCHAR(100) NOT NULL DEFAULT 'Hệ Thống',
    action_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS Policies for All
DROP POLICY IF EXISTS "Enable read/write for all users" ON public.contract_items;
CREATE POLICY "Enable read/write for all users" ON public.contract_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.contract_payments;
CREATE POLICY "Enable read/write for all users" ON public.contract_payments FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.contract_schedules;
CREATE POLICY "Enable read/write for all users" ON public.contract_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.contract_garments;
CREATE POLICY "Enable read/write for all users" ON public.contract_garments FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.contract_documents;
CREATE POLICY "Enable read/write for all users" ON public.contract_documents FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.contract_activities;
CREATE POLICY "Enable read/write for all users" ON public.contract_activities FOR ALL USING (true);
