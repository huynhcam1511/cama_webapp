"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function getRolesAndModules() {
  await requirePermission("PERMISSIONS", "view");
  const supabase = createClient();
  
  const [rolesRes, modulesRes] = await Promise.all([
    supabase.from("roles").select("*").order("is_system_role", { ascending: false }).order("role_name"),
    supabase.from("modules").select("*").order("sort_order")
  ]);

  if (rolesRes.error) console.error("Error fetching roles:", rolesRes.error);
  if (modulesRes.error) console.error("Error fetching modules:", modulesRes.error);

  return {
    roles: rolesRes.data || [],
    modules: modulesRes.data || []
  };
}

export async function getRolePermissions(roleId: string) {
  await requirePermission("PERMISSIONS", "view");
  const supabase = createClient();

  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .eq("role_id", roleId);

  if (error) {
    console.error("Error fetching role permissions:", error);
    return [];
  }

  return data;
}

export interface PermissionPayload {
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export async function saveRolePermissions(roleId: string, permissions: PermissionPayload[]) {
  await requirePermission("PERMISSIONS", "update");
  const supabase = createClient();

  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  const toInsert = permissions.map(p => ({
    role_id: roleId,
    module_id: p.module_id,
    can_view: p.can_view,
    can_create: p.can_create,
    can_update: p.can_update,
    can_delete: p.can_delete
  }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(toInsert);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/dashboard/permissions");
  return { success: true };
}
