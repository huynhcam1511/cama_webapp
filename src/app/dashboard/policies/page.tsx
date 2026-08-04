import { getPolicies } from "./actions";
import PoliciesView from "./policies-view";
import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const user = await requireActiveUser();
  await requirePermission("POLICIES", "view");

  const permissionsMap = await getUserPermissions(user.id);
  const policiesPerm = permissionsMap.get("POLICIES") || { can_create: false, can_update: false, can_delete: false };

  const policies = await getPolicies();

  const supabase = createAdminClient();
  const [{ data: departments }, { data: roles }, { data: users }] = await Promise.all([
    supabase.from("departments").select("id, department_name"),
    supabase.from("roles").select("id, role_name"),
    supabase.from("users").select("id, full_name, employee_code, email").eq("is_active", true)
  ]);

  return (
    <PoliciesView 
      initialPolicies={policies} 
      permissions={policiesPerm} 
      departments={departments || []}
      roles={roles || []}
      users={users || []}
    />
  );
}
