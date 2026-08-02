-- PHASE 6: Add Booking Schedules for CRM

CREATE TABLE public.booking_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    customer_phone VARCHAR(50),
    customer_name VARCHAR(255) NOT NULL,
    source VARCHAR(255),
    pic_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    service_group VARCHAR(100),
    service_content VARCHAR(255),
    appointment_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Chưa cập nhật',
    result VARCHAR(100) DEFAULT 'Chưa cập nhật',
    next_follow_up VARCHAR(255),
    wedding_date DATE,
    notes_before TEXT,
    notes_after TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_booking_schedules_updated_at BEFORE UPDATE ON public.booking_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Enable RLS
ALTER TABLE public.booking_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable ALL for Authenticated Users on booking_schedules" ON public.booking_schedules FOR ALL USING (auth.role() = 'authenticated');
