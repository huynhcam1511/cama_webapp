import { createClient } from "@/lib/supabase/server";
import EmployeeListView from "./employee-list-view";
import { requirePermission } from "@/lib/rbac";

export default async function EmployeesPage() {
  await requirePermission("EMPLOYEES", "view");

  const supabase = createClient();

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
    console.error("Error fetching users:", error);
  }

  return <EmployeeListView initialUsers={users || []} />;
}
