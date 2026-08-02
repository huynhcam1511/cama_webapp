import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";

export type PermissionAction = "view" | "create" | "update" | "delete";

export async function requireActiveUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("is_active, is_working, employment_status")
    .eq("id", user.id)
    .single();

  if (!dbUser) {
    redirect("/login");
  }

  if (!dbUser.is_active || !dbUser.is_working || ["resigned", "terminated"].includes(dbUser.employment_status)) {
    redirect("/login?error=account_disabled");
  }

  return user;
}

export async function getUserPermissions(userId: string) {
  const supabase = createClient();
  
  // Get User Role Permissions
  const { data: userRow } = await supabase
    .from("users")
    .select("role_id")
    .eq("id", userId)
    .single();

  let rolePermissions: any[] = [];
  if (userRow?.role_id) {
    const { data: rp } = await supabase
      .from("role_permissions")
      .select("*, modules(module_code)")
      .eq("role_id", userRow.role_id);
    rolePermissions = rp || [];
  }

  // Get User Specific Permissions
  const { data: up } = await supabase
    .from("user_permissions")
    .select("*, modules(module_code)")
    .eq("user_id", userId);
  
  const userPermissions = up || [];

  // Merge permissions (User specific overrides Role)
  const mergedMap = new Map<string, any>();
  
  rolePermissions.forEach(rp => {
    if (rp.modules?.module_code) {
      mergedMap.set(rp.modules.module_code, {
        can_view: rp.can_view,
        can_create: rp.can_create,
        can_update: rp.can_update,
        can_delete: rp.can_delete
      });
    }
  });

  userPermissions.forEach(up => {
    if (up.modules?.module_code) {
      mergedMap.set(up.modules.module_code, {
        can_view: up.can_view,
        can_create: up.can_create,
        can_update: up.can_update,
        can_delete: up.can_delete
      });
    }
  });

  return mergedMap;
}

export async function requirePermission(moduleCode: string, action: PermissionAction) {
  const user = await requireActiveUser();
  const permissionsMap = await getUserPermissions(user.id);
  
  const perm = permissionsMap.get(moduleCode);
  
  if (!perm) {
    redirect("/dashboard?error=permission_denied");
  }

  let hasPermission = false;
  switch (action) {
    case "view": hasPermission = perm.can_view; break;
    case "create": hasPermission = perm.can_create; break;
    case "update": hasPermission = perm.can_update; break;
    case "delete": hasPermission = perm.can_delete; break;
  }

  if (!hasPermission) {
    // If it's a view action, redirect. Otherwise throw so server actions can catch it if needed.
    // Or just redirect anyway.
    if (action === "view") {
      redirect("/dashboard?error=permission_denied");
    } else {
      throw new Error("PERMISSION_DENIED");
    }
  }

  return true;
}
