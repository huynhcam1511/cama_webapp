-- Keep SKU generation strictly textual. The previous expression can resolve
-- the dash as a subtraction operator on some restored function definitions.
CREATE OR REPLACE FUNCTION public.generate_garment_sku()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq_num TEXT;
BEGIN
  seq_num := lpad(nextval('public.garments_sku_seq'::regclass)::text, 6, '0');

  NEW.group_type := upper(rpad(substring(coalesce(NEW.group_type::text, 'XX') from 1 for 2), 2, 'X'));
  NEW.style_details := upper(rpad(substring(coalesce(NEW.style_details::text, 'XXXX') from 1 for 4), 4, 'X'));
  NEW.material_pattern := upper(rpad(substring(coalesce(NEW.material_pattern::text, 'XX') from 1 for 2), 2, 'X'));
  NEW.size_code := upper(rpad(substring(coalesce(NEW.size_code::text, 'XX') from 1 for 2), 2, 'X'));

  NEW.sku := concat_ws(
    '-'::text,
    NEW.group_type::text,
    seq_num::text,
    NEW.style_details::text,
    NEW.material_pattern::text,
    NEW.size_code::text
  );
  NEW.qr_code := NEW.sku;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_garment_sku ON public.garments_inventory;
CREATE TRIGGER trigger_generate_garment_sku
BEFORE INSERT ON public.garments_inventory
FOR EACH ROW
EXECUTE FUNCTION public.generate_garment_sku();
