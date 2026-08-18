-- Enforce the existing CAMA role/user permission matrix inside PostgreSQL RLS.
CREATE OR REPLACE FUNCTION public.has_module_permission(p_module_code TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_permission BOOLEAN;
  v_role_permission BOOLEAN;
  v_role_name TEXT;
BEGIN
  IF v_user_id IS NULL THEN RETURN false; END IF;

  SELECT lower(r.role_name)
  INTO v_role_name
  FROM public.users u
  LEFT JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = v_user_id
    AND u.is_active = true
    AND u.is_working = true
    AND COALESCE(u.employment_status, 'working') NOT IN ('resigned', 'terminated');

  IF v_role_name IS NULL THEN RETURN false; END IF;
  IF v_role_name IN ('super admin', 'administrator', 'super_admin', 'admin', 'quản trị viên', 'giám đốc', 'quản lý') THEN
    RETURN true;
  END IF;

  SELECT CASE p_action
    WHEN 'view' THEN up.can_view WHEN 'create' THEN up.can_create
    WHEN 'update' THEN up.can_update WHEN 'delete' THEN up.can_delete ELSE false END
  INTO v_user_permission
  FROM public.user_permissions up
  JOIN public.modules m ON m.id = up.module_id
  WHERE up.user_id = v_user_id AND m.module_code = p_module_code;

  IF FOUND THEN RETURN COALESCE(v_user_permission, false); END IF;

  SELECT CASE p_action
    WHEN 'view' THEN rp.can_view WHEN 'create' THEN rp.can_create
    WHEN 'update' THEN rp.can_update WHEN 'delete' THEN rp.can_delete ELSE false END
  INTO v_role_permission
  FROM public.users u
  JOIN public.role_permissions rp ON rp.role_id = u.role_id
  JOIN public.modules m ON m.id = rp.module_id
  WHERE u.id = v_user_id AND m.module_code = p_module_code;

  RETURN COALESCE(v_role_permission, false);
END;
$$;

REVOKE ALL ON FUNCTION public.has_module_permission(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_module_permission(TEXT, TEXT) TO authenticated;

ALTER TABLE public.garment_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garments_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_intake_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.garment_models;
DROP POLICY IF EXISTS "Enable insert access for all authenticated users" ON public.garment_models;
DROP POLICY IF EXISTS "Enable update access for all authenticated users" ON public.garment_models;
DROP POLICY IF EXISTS "Enable delete access for all authenticated users" ON public.garment_models;
DROP POLICY IF EXISTS "CAMA inventory models view" ON public.garment_models;
DROP POLICY IF EXISTS "CAMA inventory models create" ON public.garment_models;
DROP POLICY IF EXISTS "CAMA inventory models update" ON public.garment_models;
DROP POLICY IF EXISTS "CAMA inventory models delete" ON public.garment_models;
CREATE POLICY "CAMA inventory models view" ON public.garment_models FOR SELECT TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'view'));
CREATE POLICY "CAMA inventory models create" ON public.garment_models FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'create'));
CREATE POLICY "CAMA inventory models update" ON public.garment_models FOR UPDATE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'update')) WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'update'));
CREATE POLICY "CAMA inventory models delete" ON public.garment_models FOR DELETE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'delete'));

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.garments_inventory;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.garments_inventory;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.garments_inventory;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON public.garments_inventory;
DROP POLICY IF EXISTS "CAMA inventory instances view" ON public.garments_inventory;
DROP POLICY IF EXISTS "CAMA inventory instances create" ON public.garments_inventory;
DROP POLICY IF EXISTS "CAMA inventory instances update" ON public.garments_inventory;
DROP POLICY IF EXISTS "CAMA inventory instances delete" ON public.garments_inventory;
CREATE POLICY "CAMA inventory instances view" ON public.garments_inventory FOR SELECT TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'view'));
CREATE POLICY "CAMA inventory instances create" ON public.garments_inventory FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'create'));
CREATE POLICY "CAMA inventory instances update" ON public.garments_inventory FOR UPDATE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'update')) WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'update'));
CREATE POLICY "CAMA inventory instances delete" ON public.garments_inventory FOR DELETE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'delete'));

DROP POLICY IF EXISTS "Authenticated users manage inventory intake sessions" ON public.inventory_intake_sessions;
DROP POLICY IF EXISTS "Authenticated users manage inventory intake lines" ON public.inventory_intake_lines;
DROP POLICY IF EXISTS "CAMA inventory sessions view" ON public.inventory_intake_sessions;
DROP POLICY IF EXISTS "CAMA inventory sessions create" ON public.inventory_intake_sessions;
DROP POLICY IF EXISTS "CAMA inventory sessions update" ON public.inventory_intake_sessions;
DROP POLICY IF EXISTS "CAMA inventory sessions delete" ON public.inventory_intake_sessions;
CREATE POLICY "CAMA inventory sessions view" ON public.inventory_intake_sessions FOR SELECT TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'view'));
CREATE POLICY "CAMA inventory sessions create" ON public.inventory_intake_sessions FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'create'));
CREATE POLICY "CAMA inventory sessions update" ON public.inventory_intake_sessions FOR UPDATE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'update')) WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'update'));
CREATE POLICY "CAMA inventory sessions delete" ON public.inventory_intake_sessions FOR DELETE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'delete'));
DROP POLICY IF EXISTS "CAMA inventory lines view" ON public.inventory_intake_lines;
DROP POLICY IF EXISTS "CAMA inventory lines create" ON public.inventory_intake_lines;
DROP POLICY IF EXISTS "CAMA inventory lines update" ON public.inventory_intake_lines;
DROP POLICY IF EXISTS "CAMA inventory lines delete" ON public.inventory_intake_lines;
CREATE POLICY "CAMA inventory lines view" ON public.inventory_intake_lines FOR SELECT TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'view'));
CREATE POLICY "CAMA inventory lines create" ON public.inventory_intake_lines FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'create'));
CREATE POLICY "CAMA inventory lines update" ON public.inventory_intake_lines FOR UPDATE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'update')) WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'update'));
CREATE POLICY "CAMA inventory lines delete" ON public.inventory_intake_lines FOR DELETE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'delete'));

DROP POLICY IF EXISTS "Allow read access to all authenticated users for inventory_locations" ON public.inventory_locations;
DROP POLICY IF EXISTS "Allow write access to all authenticated users for inventory_locations" ON public.inventory_locations;
DROP POLICY IF EXISTS "CAMA inventory locations view" ON public.inventory_locations;
DROP POLICY IF EXISTS "CAMA inventory locations create" ON public.inventory_locations;
DROP POLICY IF EXISTS "CAMA inventory locations update" ON public.inventory_locations;
DROP POLICY IF EXISTS "CAMA inventory locations delete" ON public.inventory_locations;
CREATE POLICY "CAMA inventory locations view" ON public.inventory_locations FOR SELECT TO authenticated USING (public.has_module_permission('INVENTORY_LOCATIONS', 'view'));
CREATE POLICY "CAMA inventory locations create" ON public.inventory_locations FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('INVENTORY_LOCATIONS', 'create'));
CREATE POLICY "CAMA inventory locations update" ON public.inventory_locations FOR UPDATE TO authenticated USING (public.has_module_permission('INVENTORY_LOCATIONS', 'update')) WITH CHECK (public.has_module_permission('INVENTORY_LOCATIONS', 'update'));
CREATE POLICY "CAMA inventory locations delete" ON public.inventory_locations FOR DELETE TO authenticated USING (public.has_module_permission('INVENTORY_LOCATIONS', 'delete'));

DROP POLICY IF EXISTS "Allow read access to all authenticated users for app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow write access to all authenticated users for app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "CAMA inventory settings view" ON public.app_settings;
DROP POLICY IF EXISTS "CAMA inventory settings create" ON public.app_settings;
DROP POLICY IF EXISTS "CAMA inventory settings update" ON public.app_settings;
DROP POLICY IF EXISTS "CAMA inventory settings delete" ON public.app_settings;
CREATE POLICY "CAMA inventory settings view" ON public.app_settings FOR SELECT TO authenticated USING (public.has_module_permission('INVENTORY_LOCATIONS', 'view'));
CREATE POLICY "CAMA inventory settings create" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('INVENTORY_LOCATIONS', 'create'));
CREATE POLICY "CAMA inventory settings update" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_module_permission('INVENTORY_LOCATIONS', 'update')) WITH CHECK (public.has_module_permission('INVENTORY_LOCATIONS', 'update'));
CREATE POLICY "CAMA inventory settings delete" ON public.app_settings FOR DELETE TO authenticated USING (public.has_module_permission('INVENTORY_LOCATIONS', 'delete'));

DROP POLICY IF EXISTS "Authenticated users read master data" ON public.master_data;
DROP POLICY IF EXISTS "Authenticated users create master data" ON public.master_data;
DROP POLICY IF EXISTS "Authenticated users update master data" ON public.master_data;
DROP POLICY IF EXISTS "CAMA master data view" ON public.master_data;
DROP POLICY IF EXISTS "CAMA master data create" ON public.master_data;
DROP POLICY IF EXISTS "CAMA master data update" ON public.master_data;
CREATE POLICY "CAMA master data view" ON public.master_data FOR SELECT TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'view'));
CREATE POLICY "CAMA master data create" ON public.master_data FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'create'));
CREATE POLICY "CAMA master data update" ON public.master_data FOR UPDATE TO authenticated USING (public.has_module_permission('GARMENT_CATALOG', 'update')) WITH CHECK (public.has_module_permission('GARMENT_CATALOG', 'update'));

DROP POLICY IF EXISTS "Authenticated users upload garment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update garment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users read garment images" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete garment images" ON storage.objects;
DROP POLICY IF EXISTS "CAMA garment images view" ON storage.objects;
DROP POLICY IF EXISTS "CAMA garment images create" ON storage.objects;
DROP POLICY IF EXISTS "CAMA garment images update" ON storage.objects;
DROP POLICY IF EXISTS "CAMA garment images delete" ON storage.objects;
CREATE POLICY "CAMA garment images view" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'garment-images' AND public.has_module_permission('GARMENT_CATALOG', 'view'));
CREATE POLICY "CAMA garment images create" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'garment-images' AND public.has_module_permission('GARMENT_CATALOG', 'create'));
CREATE POLICY "CAMA garment images update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'garment-images' AND public.has_module_permission('GARMENT_CATALOG', 'update')) WITH CHECK (bucket_id = 'garment-images' AND public.has_module_permission('GARMENT_CATALOG', 'update'));
CREATE POLICY "CAMA garment images delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'garment-images' AND public.has_module_permission('GARMENT_CATALOG', 'delete'));

DO $$
BEGIN
  IF to_regprocedure('public.complete_inventory_declaration_impl(jsonb)') IS NULL
     AND to_regprocedure('public.complete_inventory_declaration(jsonb)') IS NOT NULL THEN
    ALTER FUNCTION public.complete_inventory_declaration(JSONB) RENAME TO complete_inventory_declaration_impl;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_inventory_declaration(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_module_permission('GARMENT_CATALOG', 'create') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;
  RETURN public.complete_inventory_declaration_impl(payload);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_inventory_declaration_impl(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_inventory_declaration_impl(JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_inventory_declaration(JSONB) TO authenticated;
