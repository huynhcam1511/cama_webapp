import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { getOperationSchedules } from "./actions";
import OperationSchedulesView from "./operation-schedules-view";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OperationSchedulePage() {
  const user = await requireActiveUser();
  await requirePermission("OPERATION_SCHEDULE", "view");

  const permissionsMap = await getUserPermissions(user.id);
  const operationPerm = permissionsMap.get("OPERATION_SCHEDULE") || { can_create: false, can_update: false, can_delete: false };

  // Lấy toàn bộ lịch (Booking & Operation)
  const schedules = await getOperationSchedules();

  // Lấy data phụ trợ (Nhân sự) để gán việc
  const supabase = createClient();
  const { data: users } = await supabase.from("users").select("id, full_name, employee_code").eq("is_active", true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Lịch Khách Hàng & Đơn Hàng</h1>
          <p className="text-slate-500 mt-1">Điều phối lịch thử váy, fitting, và giao nhận trang phục.</p>
        </div>
      </div>
      
      <OperationSchedulesView 
        initialSchedules={schedules} 
        permissions={operationPerm}
        users={users || []}
      />
    </div>
  );
}
