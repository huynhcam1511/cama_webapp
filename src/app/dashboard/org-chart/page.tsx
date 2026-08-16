import { createAdminClient } from "@/lib/supabase/admin";
import OrgChartView from "./org-chart-view";
import { requirePermission } from "@/lib/rbac";

export default async function OrgChartPage() {
  await requirePermission("EMPLOYEES", "view");

  const supabase = createAdminClient();

  const { data: users, error } = await supabase
    .from("users")
    .select(`
      *,
      departments(department_name),
      teams(name),
      positions(position_name),
      roles(role_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users for org chart:", error);
  }

  return (
    <div className="space-y-6">
      <OrgChartView users={users || []} />
    </div>
  );
}
