import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import EmployeeDetailView from "./employee-detail-view";
import { requirePermission } from "@/lib/rbac";
import { syncModuleRegistry } from "@/lib/sync-modules";
import { redirect } from "next/navigation";

export default async function EmployeeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "new";
  
  if (isNew) {
    await requirePermission("EMPLOYEES", "create");
  } else {
    await requirePermission("EMPLOYEES", "view");
  }

  const supabase = createAdminClient();
  await syncModuleRegistry();

  let user = null;
  let userPermissions = [];

  if (!isNew) {
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !userData) {
      redirect("/dashboard/employees");
    }
    user = userData;

    const { data: perms } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", params.id);
    userPermissions = perms || [];
  }

  // Lấy dữ liệu tham chiếu
  const { data: departments } = await supabase.from("departments").select("*").eq("is_active", true);
  const { data: teams } = await supabase.from("teams").select("*").eq("active", true).order("name");
  const { data: positions } = await supabase.from("positions").select("*").eq("is_active", true);
  const { data: roles } = await supabase.from("roles").select("*").order("role_name");
  const { data: modules } = await supabase.from("modules").select("*").eq("is_active", true).order("sort_order");

  return (
    <EmployeeDetailView
      isNew={isNew}
      initialData={user}
      initialPermissions={userPermissions}
      departments={departments || []}
      teams={teams || []}
      positions={positions || []}
      roles={roles || []}
      modules={modules || []}
    />
  );
}
