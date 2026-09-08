-- Add the requested Tầng 02 location labels, codes 30 through 45.
INSERT INTO public.inventory_locations (floor_name, shelf_name, tier_name)
SELECT 'Tầng 02', lpad(code::text, 2, '0'), NULL
FROM generate_series(30, 45) AS code
ON CONFLICT (floor_name, shelf_name, tier_name) DO NOTHING;
