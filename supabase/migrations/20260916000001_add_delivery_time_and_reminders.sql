-- Migration: Add delivery_time to orders and create reminder_logs for email notifications
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(10);

-- Table for tracking sent email reminders (prevents duplicate spamming)
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'SCHEDULE' or 'ORDER'
    entity_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL, -- '1_DAY' or '2_HOURS'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recipients TEXT[] NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reminder_logs_unique ON reminder_logs(entity_type, entity_id, reminder_type);

-- Notify postgrest to reload schema cache
NOTIFY pgrst, 'reload schema';
