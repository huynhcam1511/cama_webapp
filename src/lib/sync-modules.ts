import "server-only";

import { MODULE_REGISTRY } from "@/config/moduleRegistry";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncModuleRegistry() {
  const supabase = createAdminClient();
  const modules = MODULE_REGISTRY.map((module) => ({
    module_code: module.moduleCode,
    module_name: module.label,
    route: module.route,
    icon: module.icon,
    sort_order: module.sortOrder,
    is_active: module.isActive,
  }));

  const { error } = await supabase
    .from("modules")
    .upsert(modules, { onConflict: "module_code" });

  if (error) throw new Error(`Không thể đồng bộ danh sách module: ${error.message}`);
}
