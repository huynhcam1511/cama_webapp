-- Convert legacy inventory identifiers to the canonical physical-item code:
--   FACTORY-SIZE-001, FACTORY-SIZE-002, ...
-- Legacy QR values are preserved so already-printed labels keep working.
-- QR is an internal lookup value and is intentionally not shown in cards.
CREATE OR REPLACE FUNCTION public.normalize_inventory_code_part(value TEXT, fallback TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(regexp_replace(upper(trim(value)), '[^A-Z0-9]+', '', 'g'), ''), fallback)
$$;

DO $$
BEGIN
  IF to_regclass('public.garments_inventory') IS NULL THEN
    RETURN;
  END IF;

  CREATE TEMP TABLE inventory_code_backfill ON COMMIT DROP AS
  SELECT
    gi.id,
    public.normalize_inventory_code_part(
      COALESCE(NULLIF(gi.factory_code::text, ''), NULLIF(gm.factory_code::text, ''),
        NULLIF(gm.base_sku::text, ''), NULLIF(split_part(COALESCE(gi.sku, ''), '-', 1), '')),
      'NOFACTORY'
    ) AS factory_code,
    public.normalize_inventory_code_part(
      COALESCE(NULLIF(gi.size_code::text, ''), NULLIF(gi.size::text, ''),
        NULLIF(substring(COALESCE(gi.sku, '') FROM '([^-]+)$'), '')),
      'ONESIZE'
    ) AS size_code,
    gi.sku,
    gi.qr_code,
    gi.created_at
  FROM public.garments_inventory gi
  LEFT JOIN public.garment_models gm ON gm.id = gi.model_id;

  -- Fill only missing QR values. Existing QR values may already be printed on
  -- labels, so never overwrite them during this backfill.
  UPDATE public.garments_inventory gi
  SET qr_code = gi.sku
  FROM inventory_code_backfill b
  WHERE b.id = gi.id
    AND b.sku ~ '^[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$'
    AND b.qr_code IS NULL;

  -- Move legacy values out of the way before assigning new unique values.
  UPDATE public.garments_inventory gi
  SET sku = 'MIGRATING-' || gi.id::text
  FROM inventory_code_backfill b
  WHERE b.id = gi.id
    AND (b.sku IS NULL OR b.sku !~ '^[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$');

  WITH preserved AS (
    SELECT factory_code, size_code,
      COALESCE(MAX(substring(sku FROM '-([0-9]{3})$')::integer), 0) AS max_ordinal
    FROM inventory_code_backfill
    WHERE sku ~ '^[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$'
      AND sku LIKE factory_code || '-' || size_code || '-%'
    GROUP BY factory_code, size_code
  ),
  legacy AS (
    SELECT b.id, b.factory_code, b.size_code,
      ROW_NUMBER() OVER (
        PARTITION BY b.factory_code, b.size_code
        ORDER BY b.created_at NULLS FIRST, b.id
      ) AS ordinal
    FROM inventory_code_backfill b
    WHERE b.sku IS NULL OR b.sku !~ '^[A-Z0-9]+-[A-Z0-9]+-[0-9]{3}$'
  ),
  allocations AS (
    SELECT l.id, l.factory_code, l.size_code,
      COALESCE(p.max_ordinal, 0) + l.ordinal AS ordinal
    FROM legacy l
    LEFT JOIN preserved p
      ON p.factory_code = l.factory_code AND p.size_code = l.size_code
  )
  UPDATE public.garments_inventory gi
  SET sku = a.factory_code || '-' || a.size_code || '-' || LPAD(a.ordinal::text, 3, '0')
  FROM allocations a
  WHERE a.id = gi.id;
END $$;
