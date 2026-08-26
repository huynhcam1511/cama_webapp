INSERT INTO public.modules (module_code, module_name, route, icon, sort_order, is_active)
VALUES ('INVENTORY_POSITION_QR', 'Vị trí', '/dashboard/inventory/locations/qr', 'MapPinned', 2, true)
ON CONFLICT (module_code) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  route = EXCLUDED.route,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  updated_at = now();

INSERT INTO public.user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT permission.user_id, target.id, permission.can_view, permission.can_create, permission.can_update, permission.can_delete
FROM public.user_permissions permission
JOIN public.modules source ON source.id = permission.module_id AND source.module_code = 'INVENTORY_LOCATIONS'
CROSS JOIN public.modules target
WHERE target.module_code = 'INVENTORY_POSITION_QR'
ON CONFLICT (user_id, module_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete)
SELECT permission.role_id, target.id, permission.can_view, permission.can_create, permission.can_update, permission.can_delete
FROM public.role_permissions permission
JOIN public.modules source ON source.id = permission.module_id AND source.module_code = 'INVENTORY_LOCATIONS'
CROSS JOIN public.modules target
WHERE target.module_code = 'INVENTORY_POSITION_QR'
ON CONFLICT (role_id, module_id) DO NOTHING;
