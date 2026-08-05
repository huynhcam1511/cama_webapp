import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { getOperationSchedules } from "./actions";
import OperationSchedulesView from "./operation-schedules-view";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function OperationSchedulePage() {
  const user = await requireActiveUser();
  await requirePermission("OPERATION_SCHEDULE", "view");

  const permissionsMap = await getUserPermissions(user.id);
  const operationPerm = permissionsMap.get("OPERATION_SCHEDULE") || { can_create: false, can_update: false, can_delete: false };

  // Lấy toàn bộ lịch (Booking & Operation)
  const schedules = await getOperationSchedules();

  // Lấy data phụ trợ (Nhân sự) để gán việc
  const supabase = createAdminClient();
  const { data: users } = await supabase.from("users").select("id, full_name, employee_code").eq("is_active", true);

  return (
    <div className="space-y-6">
      
      <OperationSchedulesView 
        initialSchedules={schedules} 
        permissions={operationPerm}
        users={users || []}
      />
    </div>
  );
}
