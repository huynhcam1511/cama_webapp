"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveUser, requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type EventType = "DRESS_TRY_ON" | "FITTING" | "DRESS_PREPARATION" | "CUSTOMER_APPOINTMENT" | "DELIVERY" | "RETURN" | "PICKUP" | "ALTERATION" | "INTERNAL_TASK" | "OTHER";
export type OperationStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type PriorityLevel = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface OperationSchedule {
  id: string;
  title: string;
  event_type: EventType;
  customer_id: string | null;
  contract_id: string | null;
  order_id: string | null;
  department_id: string | null;
  primary_assignee_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  garment_id: string | null;
  status: OperationStatus;
  priority: PriorityLevel;
  notes: string | null;
  created_by: string | null;
  schedule_category?: string;
  customer_name?: string;
  customer_phone?: string;
  service_content?: string;
  notes_before?: string;
  source?: string;
  created_at: string;
  updated_at: string;
  assignees?: any[];
  primary_assignee?: { full_name: string };
  customer?: { bride_name: string, phone: string };
  contract?: { contract_code: string };
}

// Lấy danh sách lịch vận hành
export async function getOperationSchedules() {
  await requireActiveUser();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("operation_schedules")
    .select(`
      *,
      primary_assignee:users!primary_assignee_id(full_name),
      customer:customers(bride_name, phone),
      contract:contracts(contract_code),
      order:orders(order_code, service_type),
      assignees:operation_schedule_assignees(user_id)
    `)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data as OperationSchedule[];
}

export async function createOperationSchedule(payload: any) {
  const user = await requireActiveUser();
  await requirePermission("OPERATION_SCHEDULE", "create");

  const supabase = createClient();
  
  // Logic Cảnh báo xung đột (Chỉ cảnh báo mềm, có thể bỏ qua nếu người dùng cố tình lưu - Dùng Flag confirm_override)
  if (!payload.confirm_override) {
    const { data: conflicts } = await supabase
      .from("operation_schedules")
      .select("id, title")
      .eq("date", payload.date)
      .eq("location", payload.location)
      .neq("status", "CANCELLED")
      .neq("location", "")
      .not("location", "is", null);

    if (conflicts && conflicts.length > 0) {
      // Check time overlap simplified
      // For a robust system, we would do a strict time overlap check.
      // We will throw an error with a specific flag so the client can ask for confirmation.
      throw new Error("COLLISION_DETECTED: Trùng phòng thử hoặc địa điểm. Bạn có chắc chắn muốn lưu?");
    }
  }

  // Bỏ thuộc tính confirm_override trước khi insert
  const insertData = { ...payload };
  delete insertData.confirm_override;
  delete insertData.secondary_assignees; // handled separately
  
  insertData.created_by = user.id;
  insertData.schedule_category = "OPERATION_TASK";

  const { data: schedule, error } = await supabase
    .from("operation_schedules")
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Thêm nhân sự phối hợp
  if (payload.secondary_assignees && payload.secondary_assignees.length > 0) {
    const assignees = payload.secondary_assignees.map((userId: string) => ({
      schedule_id: schedule.id,
      user_id: userId
    }));
    await supabase.from("operation_schedule_assignees").insert(assignees);
  }
  
  revalidatePath("/dashboard/schedules/operation");
  return { success: true, schedule };
}
