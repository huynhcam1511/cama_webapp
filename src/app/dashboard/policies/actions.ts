"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, requireActiveUser } from "@/lib/rbac";

export async function getPolicies() {
  const user = await requireActiveUser();
  const supabase = createAdminClient();
  
  // Lấy role và department của user
  const { data: dbUser } = await supabase
    .from("users")
    .select("role_id, department_id, roles(role_code)")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = (dbUser?.roles as any)?.role_code === "SUPER_ADMIN";

  let query = supabase.from("policies").select("*").order("created_at", { ascending: false });

  // Nếu không phải Super Admin, lọc policy theo scope
  if (!isSuperAdmin) {
    query = query.or(
      `policy_scope.eq.GENERAL,and(policy_scope.eq.DEPARTMENT,target_id.eq.${dbUser?.department_id}),and(policy_scope.eq.ROLE,target_id.eq.${dbUser?.role_id}),and(policy_scope.eq.SPECIFIC_USER,target_id.eq.${user.id})`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching policies:", error);
    return [];
  }
  return data || [];
}

export async function savePolicy(isNew: boolean, policyData: any) {
  const user = await requireActiveUser();
  if (isNew) {
    await requirePermission("POLICIES", "create");
  } else {
    await requirePermission("POLICIES", "update");
  }

  const supabase = createAdminClient();
  
  const payload = {
    title: policyData.title,
    content: policyData.content,
    policy_scope: policyData.policy_scope,
    target_id: policyData.target_id || null,
    is_active: policyData.is_active,
    attachment_url: policyData.attachment_url || null,
  };

  if (isNew) {
    const { error } = await supabase.from("policies").insert([
      { ...payload, created_by: user.id }
    ]);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("policies")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", policyData.id);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deletePolicy(id: string) {
  await requirePermission("POLICIES", "delete");
  const supabase = createAdminClient();
  
  const { error } = await supabase.from("policies").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  
  return { success: true };
}

export async function getPolicyById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("policies").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching policy:", error);
    return null;
  }
  return data;
}
