INSERT INTO public.modules (module_code, module_name, route, icon, sort_order, is_active)
VALUES ('USER_GUIDE', 'Hướng dẫn sử dụng', '/dashboard/user-guide', 'BookOpen', 118, true)
ON CONFLICT (module_code) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  route = EXCLUDED.route,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT r.id, m.id, true, true, true, true
FROM public.roles r
CROSS JOIN public.modules m
WHERE r.role_code IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  AND m.module_code = 'USER_GUIDE'
ON CONFLICT (role_id, module_id) DO UPDATE SET
  can_view = true,
  can_create = true,
  can_update = true,
  can_delete = true;
