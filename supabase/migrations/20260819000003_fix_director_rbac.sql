-- Fix RLS permissions logic for inventory & modules to support dynamic roles and missing roles
CREATE OR REPLACE FUNCTION public.has_module_permission(p_module_code TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_active BOOLEAN;
  v_role_code TEXT;
  v_user_permission BOOLEAN;
  v_role_permission BOOLEAN;
BEGIN
  -- 0. Check authentication
  IF v_user_id IS NULL THEN RETURN false; END IF;

  -- 1. Check if user is active and working
  SELECT true, upper(r.role_code)
  INTO v_user_active, v_role_code
  FROM public.users u
  LEFT JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = v_user_id
    AND u.is_active = true
    AND u.is_working = true
    AND COALESCE(u.employment_status, 'working') NOT IN ('resigned', 'terminated');

  -- If user not found, inactive, or not working, reject immediately
  IF v_user_active IS NULL THEN RETURN false; END IF;

  -- 2. Hardcoded bypass for Admins/Directors using ROLE_CODE (Safe from accents and manual edits)
  -- Supports common codes like SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER
  IF v_role_code IN ('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER', 'CEO') THEN
    RETURN true;
  END IF;

  -- 3. Check EXPLICIT User Permissions
  -- Check p_module_code or fallback to INVENTORY if the UI used the old module code
  SELECT CASE p_action
    WHEN 'view' THEN up.can_view WHEN 'create' THEN up.can_create
    WHEN 'update' THEN up.can_update WHEN 'delete' THEN up.can_delete ELSE false END
  INTO v_user_permission
  FROM public.user_permissions up
  JOIN public.modules m ON m.id = up.module_id
  WHERE up.user_id = v_user_id 
    AND m.module_code IN (p_module_code, CASE WHEN p_module_code = 'GARMENT_CATALOG' THEN 'INVENTORY' ELSE p_module_code END);

  IF FOUND THEN RETURN COALESCE(v_user_permission, false); END IF;

  -- 4. Check ROLE Permissions (only if the user has a role assigned)
  IF v_role_code IS NOT NULL THEN
    SELECT CASE p_action
      WHEN 'view' THEN rp.can_view WHEN 'create' THEN rp.can_create
      WHEN 'update' THEN rp.can_update WHEN 'delete' THEN rp.can_delete ELSE false END
    INTO v_role_permission
    FROM public.users u
    JOIN public.role_permissions rp ON rp.role_id = u.role_id
    JOIN public.modules m ON m.id = rp.module_id
    WHERE u.id = v_user_id 
      AND m.module_code IN (p_module_code, CASE WHEN p_module_code = 'GARMENT_CATALOG' THEN 'INVENTORY' ELSE p_module_code END);

    RETURN COALESCE(v_role_permission, false);
  END IF;

  -- 5. Default Deny
  RETURN false;
END;
$$;

-- Secure the function permissions
REVOKE ALL ON FUNCTION public.has_module_permission(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_module_permission(TEXT, TEXT) TO authenticated;
