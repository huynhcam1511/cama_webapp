"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const scheduleInput = z.object({
  date: z.string().date(),
  schedule_type: z.enum(['WORKING', 'WEEKLY_OFF', 'ANNUAL_LEAVE', 'UNPAID_LEAVE', 'SICK_LEAVE', 'UNEXCUSED_ABSENCE', 'OTHER']),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  leave_reason: z.string().trim().min(1).max(3000),
}).refine(p => p.schedule_type !== 'WORKING' || (!!p.start_time && !!p.end_time && p.end_time > p.start_time), 'Ca làm phải có giờ kết thúc sau giờ bắt đầu');

export type ScheduleType = "WORKING" | "WEEKLY_OFF" | "ANNUAL_LEAVE" | "UNPAID_LEAVE" | "SICK_LEAVE" | "UNEXCUSED_ABSENCE" | "LATE" | "EARLY_LEAVE" | "OTHER";
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
  const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

  const adminClient = createAdminClient();
  const query = adminClient
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

  const supabase = createAdminClient();
  
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
  z.string().uuid().parse(scheduleId);
  z.enum(['APPROVED', 'REJECTED']).parse(status);
  const user = await requireActiveUser();
  await requirePermission("STAFF_SCHEDULE", "update"); // Or approve if we had it, but update is enough

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("staff_schedules").update({
    approval_status: status,
    approved_by: user.id
  }).eq("id", scheduleId).eq("approval_status", "PENDING").select('id').single();

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
  const validated = z.array(scheduleInput).min(1).max(7).parse(payloads);
  if (new Set(validated.map(p => p.date)).size !== validated.length) throw new Error('Mỗi ngày chỉ đăng ký một ca');
  const user = await requireActiveUser();
  await requirePermission("STAFF_SCHEDULE", "create");

  const adminClient = createAdminClient();
  
  const { data: dbUser } = await adminClient.from("users").select("department_id").eq("id", user.id).single();

  const insertData = validated.map(p => ({
    user_id: user.id,
    department_id: dbUser?.department_id,
    date: p.date,
    schedule_type: p.schedule_type,
    start_time: p.start_time || null,
    end_time: p.end_time || null,
    leave_reason: p.leave_reason,
    approval_status: "PENDING",
    status: "SCHEDULED"
  }));

  const { error } = await adminClient.from("staff_schedules").insert(insertData);

  if (error) throw new Error(error.message);
  
  revalidatePath("/dashboard/schedules/staff");
  return { success: true };
}
