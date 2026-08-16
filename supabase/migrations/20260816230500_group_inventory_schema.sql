-- Migration: Group-based Inventory Schema
-- Replaces/Upgrades the old garments_inventory approach with a group-based (Factory Code + Size) system

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_code VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    type VARCHAR(50), -- E.g., 'Vest', 'Váy', 'Phụ kiện'
    quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    location JSONB, -- Stores detailed location like {"floor": "Tầng 2", "zone": "Zone A", "shelf": "Kệ 3"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by code and size
CREATE INDEX IF NOT EXISTS idx_inventory_items_code_size ON public.inventory_items(factory_code, size);

-- Trigger to update 'updated_at'
CREATE OR REPLACE FUNCTION update_inventory_items_mod_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE PROCEDURE update_inventory_items_mod_time();

-- RLS Policies
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for authenticated users"
ON public.inventory_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert for authenticated users"
ON public.inventory_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
ON public.inventory_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow delete for authenticated users"
ON public.inventory_items FOR DELETE
TO authenticated
USING (true);
