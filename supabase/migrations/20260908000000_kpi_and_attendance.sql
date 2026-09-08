-- 1. KPI Rules Configuration
CREATE TABLE IF NOT EXISTS kpi_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('BONUS', 'PENALTY', 'COMMISSION')),
    rule_value NUMERIC(10,2) NOT NULL,
    value_type VARCHAR(50) NOT NULL CHECK (value_type IN ('FIXED', 'PERCENTAGE')),
    target_roles TEXT[] DEFAULT '{}',
    target_departments TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. KPI Transactions (Actual money earned/lost)
CREATE TABLE IF NOT EXISTS kpi_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    rule_id UUID REFERENCES kpi_rules(id),
    amount NUMERIC(15,2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('BONUS', 'PENALTY', 'COMMISSION')),
    source_reference VARCHAR(255), -- e.g., 'contract_id', 'order_id', 'appointment_id'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Marketing Submissions
CREATE TABLE IF NOT EXISTS marketing_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- TIKTOK, FACEBOOK
    content_type VARCHAR(50) NOT NULL, -- VIDEO_CLIP, VIEW_MILESTONE
    link_url TEXT NOT NULL,
    current_views INTEGER DEFAULT 0,
    milestone_target INTEGER DEFAULT 10000,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reward_amount NUMERIC(15,2),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE kpi_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_submissions ENABLE ROW LEVEL SECURITY;

-- Basic admin policies for now
CREATE POLICY "Admin full access kpi_rules" ON kpi_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'DIRECTOR'))
);
CREATE POLICY "Read access kpi_rules" ON kpi_rules FOR SELECT USING (true);

-- Time logs: user can insert own, read own. Admin can read all.
CREATE POLICY "Users can insert own time_logs" ON time_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own time_logs" ON time_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access time_logs" ON time_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'DIRECTOR', 'MANAGER'))
);

-- KPI Transactions: user can read own. Admin can all.
CREATE POLICY "Users can read own kpi_transactions" ON kpi_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access kpi_transactions" ON kpi_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'DIRECTOR', 'MANAGER'))
);

-- Marketing Submissions: user can insert/read own. Admin can all.
CREATE POLICY "Users can insert own marketing" ON marketing_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own marketing" ON marketing_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access marketing" ON marketing_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'DIRECTOR', 'MANAGER'))
);
