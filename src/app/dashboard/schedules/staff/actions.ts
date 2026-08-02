"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type ScheduleType = "WORKING" | "ANNUAL_LEAVE" | "UNPAID_LEAVE" | "SICK_LEAVE" | "UNEXCUSED_ABSENCE" | "LATE" | "EARLY_LEAVE" | "OTHER";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ScheduleStatus = "SCHEDULED" | "ATTENDED" | "ABSENT" | "LATE" | "EARLY_LEAVE";

export interface StaffSchedule {
  id: string;
  user_id: string;
  department_id: string | null;
  date: string;
  schedule_type: ScheduleType;
  start_time: string | null;
  end_time: string | null;
  shift_name: string | null;
  status: ScheduleStatus;
  leave_reason: string | null;
  approved_by: string | null;
  approval_status: ApprovalStatus;
  is_urgent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    employee_code: string;
  };
}

export async function getStaffSchedules(month: number, year: number) {
  const user = await requireActiveUser();
  const permissionsMap = await getUserPermissions(user.id);
  const staffSchedulePerm = permissionsMap.get("STAFF_SCHEDULE") || { can_view: false, can_create: false, can_update: false, can_delete: false };
  
  if (!staffSchedulePerm.can_view) throw new Error("Unauthorized");

  // Load a wider range if needed for weekly view crossing months, but currently let's just do month bounds.
  // Ideally, the weekly view should just load all data for the requested week interval from the client.
  // For MVP, we'll keep the month bound and rely on the client to ask for it.
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]; 

  const supabase = createClient();
  const query = supabase
    .from("staff_schedules")
    .select(`
      *,
      user:users!user_id(id, full_name, employee_code)
    `)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  
  const formattedData = (data as StaffSchedule[]).map(s => {
    // Hide reason if it's not the user's schedule AND the requester cannot update (manage) schedules
    if (s.user_id !== user.id && !staffSchedulePerm.can_update) {
      return { ...s, leave_reason: null, notes: null };
    }
    return s;
  });

  return formattedData;
}

export async function createLeaveRequest(payload: {
  date: string;
  schedule_type: ScheduleType;
  leave_reason: string;
  is_urgent: boolean;
}) {
  const user = await requireActiveUser();
  await requirePermission("STAFF_SCHEDULE", "create");

  const supabase = createClient();
  
  // Lấy department của user
  const { data: dbUser } = await supabase.from("users").select("department_id").eq("id", user.id).single();

  const { error } = await supabase.from("staff_schedules").insert({
    user_id: user.id,
    department_id: dbUser?.department_id,
    date: payload.date,
    schedule_type: payload.schedule_type,
    leave_reason: payload.leave_reason,
    is_urgent: payload.is_urgent,
    approval_status: "PENDING",
    status: "SCHEDULED"
  });

  if (error) throw new Error(error.message);
  
  revalidatePath("/dashboard/schedules/staff");
  return { success: true };
}

export async function updateApprovalStatus(scheduleId: string, status: ApprovalStatus) {
  const user = await requireActiveUser();
  await requirePermission("STAFF_SCHEDULE", "update"); // Or approve if we had it, but update is enough

  const supabase = createClient();
  const { error } = await supabase.from("staff_schedules").update({
    approval_status: status,
    approved_by: user.id
  }).eq("id", scheduleId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/schedules/staff");
  return { success: true };
}

export async function createWeeklySchedules(payloads: Array<{
  date: string;
  schedule_type: ScheduleType;
  start_time?: string;
  end_time?: string;
  leave_reason: string;
}>) {
  const user = await requireActiveUser();
  await requirePermission("STAFF_SCHEDULE", "create");

  const supabase = createClient();
  
  const { data: dbUser } = await supabase.from("users").select("department_id").eq("id", user.id).single();

  const insertData = payloads.map(p => ({
    user_id: user.id,
    department_id: dbUser?.department_id,
    date: p.date,
    schedule_type: p.schedule_type,
    start_time: p.start_time || null,
    end_time: p.end_time || null,
    leave_reason: p.leave_reason,
    approval_status: "APPROVED",
    status: "SCHEDULED"
  }));

  const { error } = await supabase.from("staff_schedules").insert(insertData);

  if (error) throw new Error(error.message);
  
  revalidatePath("/dashboard/schedules/staff");
  return { success: true };
}
