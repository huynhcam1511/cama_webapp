-- Roleless employees can still receive explicit user-level permissions.
-- Check account activity first, then explicit permissions, and only then
-- fall back to the employee's role permissions.
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
  v_is_active BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN RETURN false; END IF;

  SELECT
    u.is_active = true
      AND u.is_working = true
      AND COALESCE(u.employment_status, 'working') NOT IN ('resigned', 'terminated'),
    lower(r.role_name)
  INTO v_is_active, v_role_name
  FROM public.users u
  LEFT JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = v_user_id;

  IF NOT FOUND OR NOT COALESCE(v_is_active, false) THEN RETURN false; END IF;

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
