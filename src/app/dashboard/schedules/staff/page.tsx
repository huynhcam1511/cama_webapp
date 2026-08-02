import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { getStaffSchedules } from "./actions";
import StaffSchedulesView from "./staff-schedules-view";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StaffSchedulePage() {
  const user = await requireActiveUser();
  await requirePermission("STAFF_SCHEDULE", "view");

  const permissionsMap = await getUserPermissions(user.id);
  const staffSchedulePerm = permissionsMap.get("STAFF_SCHEDULE") || { can_create: false, can_update: false, can_delete: false };

  // For initial load, load the current month and year
  const today = new Date();
  const schedules = await getStaffSchedules(today.getMonth() + 1, today.getFullYear());

  const supabase = createClient();
  const { data: departments } = await supabase.from("departments").select("id, department_name");
  const { data: roles } = await supabase.from("roles").select("id, role_name");
  const { data: users } = await supabase.from("users").select("id, full_name, employee_code, department_id, role_id, is_active, default_start_time, default_end_time, default_work_days, monthly_leave_quota, avatar_url, note").eq("is_active", true);

  const activeUserFull = users?.find(u => u.id === user.id) || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Lịch Nhân Sự & Phân Ca</h1>
          <p className="text-slate-500 mt-1">Quản lý ngày làm việc, nghỉ phép và điểm danh của nhân viên.</p>
        </div>
      </div>
      
      <StaffSchedulesView 
        initialSchedules={schedules} 
        permissions={staffSchedulePerm} 
        departments={departments || []}
        roles={roles || []}
        users={users || []}
        activeUser={activeUserFull}
      />
    </div>
  );
}
