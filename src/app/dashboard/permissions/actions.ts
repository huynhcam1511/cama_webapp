"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import { syncModuleRegistry } from "@/lib/sync-modules";
import { revalidatePath } from "next/cache";

export async function getRolesAndModules() {
  await requirePermission("PERMISSIONS", "view");
  await syncModuleRegistry();
  const supabase = createAdminClient();
  
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
  const supabase = createAdminClient();

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
  const supabase = createAdminClient();

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

export async function getEmployeesAndUserPermissions(moduleId: string) {
  await requirePermission("PERMISSIONS", "view");
  const supabase = createAdminClient();

  const [usersRes, userPermsRes, rolePermsRes] = await Promise.all([
    supabase.from("users").select("id, full_name, is_working, role_id, roles(role_name)").eq("is_active", true).eq("is_working", true).order("full_name"),
    supabase.from("user_permissions").select("*").eq("module_id", moduleId),
    supabase.from("role_permissions").select("*").eq("module_id", moduleId)
  ]);

  return {
    employees: (usersRes.data || []).map(u => ({
      id: u.id,
      full_name: u.full_name,
      role_id: u.role_id,
      role_name: Array.isArray(u.roles) ? u.roles[0]?.role_name : (u.roles as any)?.role_name || "Chưa có"
    })),
    userPermissions: userPermsRes.data || [],
    rolePermissions: rolePermsRes.data || []
  };
}

export interface UserPermissionPayload {
  user_id: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export async function saveUserPermissionsByModule(moduleId: string, permissions: UserPermissionPayload[]) {
  await requirePermission("PERMISSIONS", "update");
  const supabase = createAdminClient();

  // We should only delete user_permissions for this module that are for the active users, 
  // or it's simpler to just upsert.
  // Using delete then insert:
  
  // First, extract all user_ids being saved
  const userIds = permissions.map(p => p.user_id);
  
  if (userIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("module_id", moduleId)
      .in("user_id", userIds);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
  }

  // Filter out the ones that are perfectly blank (no permissions at all) to save DB space
  const toInsert = permissions.filter(p => p.can_view || p.can_create || p.can_update || p.can_delete).map(p => ({
    user_id: p.user_id,
    module_id: moduleId,
    can_view: p.can_view,
    can_create: p.can_create,
    can_update: p.can_update,
    can_delete: p.can_delete
  }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("user_permissions")
      .insert(toInsert);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/dashboard/permissions");
  return { success: true };
}

export async function getAllEmployees() {
  await requirePermission("PERMISSIONS", "view");
  const supabase = createAdminClient();
  const { data } = await supabase.from("users").select("id, full_name, role_id, roles(role_name)").eq("is_active", true).eq("is_working", true).order("full_name");
  
  return (data || []).map(u => ({
    id: u.id,
    full_name: u.full_name,
    role_id: u.role_id,
    role_name: Array.isArray(u.roles) ? u.roles[0]?.role_name : (u.roles as any)?.role_name || "Chưa có"
  }));
}

export async function getUserPermissionsByEmployee(userId: string) {
  await requirePermission("PERMISSIONS", "view");
  const supabase = createAdminClient();

  const { data: userData } = await supabase.from("users").select("role_id").eq("id", userId).single();
  const roleId = userData?.role_id;

  const [userPermsRes, rolePermsRes] = await Promise.all([
    supabase.from("user_permissions").select("*").eq("user_id", userId),
    roleId ? supabase.from("role_permissions").select("*").eq("role_id", roleId) : { data: [] }
  ]);

  return {
    userPermissions: userPermsRes.data || [],
    rolePermissions: rolePermsRes.data || []
  };
}

export interface UserPermissionByEmployeePayload {
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export async function saveUserPermissionsByEmployee(userId: string, permissions: UserPermissionByEmployeePayload[]) {
  await requirePermission("PERMISSIONS", "update");
  const supabase = createAdminClient();

  const { error: deleteError } = await supabase
    .from("user_permissions")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  const toInsert = permissions.filter(p => p.can_view || p.can_create || p.can_update || p.can_delete).map(p => ({
    user_id: userId,
    module_id: p.module_id,
    can_view: p.can_view,
    can_create: p.can_create,
    can_update: p.can_update,
    can_delete: p.can_delete
  }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("user_permissions")
      .insert(toInsert);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/dashboard/permissions");
  return { success: true };
}
