CREATE TABLE IF NOT EXISTS inventory_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    floor_name TEXT NOT NULL,
    shelf_name TEXT,
    tier_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (floor_name, shelf_name, tier_name)
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users for inventory_locations" ON inventory_locations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for app_settings" ON app_settings
    FOR SELECT TO authenticated USING (true);

-- Allow insert/update access to all authenticated users
CREATE POLICY "Allow write access to all authenticated users for inventory_locations" ON inventory_locations
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow write access to all authenticated users for app_settings" ON app_settings
    FOR ALL TO authenticated USING (true);
