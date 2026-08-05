"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getUserPermissions, requireActiveUser, requirePermission } from "@/lib/rbac";
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

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
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
  const schedules = data as OperationSchedule[];

  // Fetch running contracts for Virtual Schedules
  const { data: contractsData } = await adminClient
    .from("contracts")
    .select("id, contract_code, notes, customers(bride_name, phone)")
    .neq("status", "COMPLETED")
    .neq("status", "CANCELLED")
    .neq("status", "ARCHIVED");

  if (contractsData) {
    for (const c of contractsData) {
      let meta: any = {};
      try {
        if (c.notes && c.notes.trim().startsWith("{")) {
          meta = JSON.parse(c.notes);
        }
      } catch (e) {}

      // In Supabase relational query without array wrapper
      const cust: any = c.customers;
      const customerName = cust?.bride_name || "Không xác định";
      const customerPhone = cust?.phone || "";

      // Virtual: Payment Due Date
      if (meta.payment_due_date) {
        schedules.push({
          id: `virtual-payment-${c.id}`,
          title: `Hạn thanh toán: ${c.contract_code}`,
          event_type: "OTHER",
          customer_id: null,
          contract_id: c.id,
          order_id: null,
          department_id: null,
          primary_assignee_id: null,
          date: meta.payment_due_date.split("T")[0],
          start_time: "08:00:00",
          end_time: "23:59:59",
          location: "Kế toán",
          garment_id: null,
          status: "SCHEDULED",
          priority: "HIGH",
          notes: "Hạn chót thanh toán phần còn lại của hợp đồng.",
          created_by: "system",
          schedule_category: "VIRTUAL_PAYMENT",
          customer_name: customerName,
          customer_phone: customerPhone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contract: { contract_code: c.contract_code }
        } as OperationSchedule);
      }

      // Virtual: Deliver/Return Garments
      const garments = meta.garments || [];
      garments.forEach((g: any, idx: number) => {
        if (g.deliver_date) {
          schedules.push({
            id: `virtual-deliver-${c.id}-${idx}`,
            title: `Giao đồ: ${g.product_name}`,
            event_type: "DELIVERY",
            customer_id: null,
            contract_id: c.id,
            order_id: null,
            department_id: null,
            primary_assignee_id: null,
            date: g.deliver_date.split("T")[0],
            start_time: "09:00:00",
            end_time: "10:00:00",
            location: "Showroom",
            garment_id: null,
            status: "SCHEDULED",
            priority: "NORMAL",
            notes: `Giao trang phục: ${g.product_name} (${g.garment_code})`,
            created_by: "system",
            schedule_category: "VIRTUAL_DELIVERY",
            customer_name: customerName,
            customer_phone: customerPhone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            contract: { contract_code: c.contract_code }
          } as OperationSchedule);
        }
        if (g.return_date) {
          schedules.push({
            id: `virtual-return-${c.id}-${idx}`,
            title: `Thu hồi đồ: ${g.product_name}`,
            event_type: "RETURN",
            customer_id: null,
            contract_id: c.id,
            order_id: null,
            department_id: null,
            primary_assignee_id: null,
            date: g.return_date.split("T")[0],
            start_time: "15:00:00",
            end_time: "17:00:00",
            location: "Showroom",
            garment_id: null,
            status: "SCHEDULED",
            priority: "NORMAL",
            notes: `Nhận lại trang phục: ${g.product_name} (${g.garment_code})`,
            created_by: "system",
            schedule_category: "VIRTUAL_RETURN",
            customer_name: customerName,
            customer_phone: customerPhone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            contract: { contract_code: c.contract_code }
          } as OperationSchedule);
        }
      });
      
      // Virtual: Return Document
      const checklist = meta.checklist || [];
      checklist.forEach((chk: any, idx: number) => {
        if (chk.due_date && chk.title?.toLowerCase().includes("trả giấy tờ")) {
          schedules.push({
            id: `virtual-doc-${c.id}-${idx}`,
            title: chk.title,
            event_type: "OTHER",
            customer_id: null,
            contract_id: c.id,
            order_id: null,
            department_id: null,
            primary_assignee_id: null,
            date: chk.due_date.split("T")[0],
            start_time: "10:00:00",
            end_time: "12:00:00",
            location: "Showroom",
            garment_id: null,
            status: chk.status === "COMPLETED" ? "COMPLETED" : "SCHEDULED",
            priority: "NORMAL",
            notes: `Trả giấy tờ thế chấp cho khách.`,
            created_by: "system",
            schedule_category: "VIRTUAL_DOC",
            customer_name: customerName,
            customer_phone: customerPhone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            contract: { contract_code: c.contract_code }
          } as OperationSchedule);
        }
      });
    }
  }

  // Re-sort
  schedules.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.start_time || "").localeCompare(b.start_time || "");
  });

  return schedules;
}

export async function completeInternalTask(scheduleId: string) {
  const user = await requireActiveUser();
  await requirePermission("OPERATION_SCHEDULE", "update");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("operation_schedules")
    .update({ status: "COMPLETED", updated_at: new Date().toISOString() })
    .eq("id", scheduleId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/schedules/operation");
  return { success: true };
}

export async function createOperationSchedule(payload: any) {
  const user = await requireActiveUser();
  await requirePermission("OPERATION_SCHEDULE", "create");

  const supabase = createAdminClient();
  
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

  // Automation 4: Vận hành ↔ Nhân Sự (Tự động đẩy vào lịch cá nhân / chấm công)
  if (schedule && schedule.primary_assignee_id) {
    try {
      // Giả lập hệ thống Nhân sự
      await supabase.from("attendance").insert([
        {
          user_id: schedule.primary_assignee_id,
          date: schedule.date,
          status: "WORKING",
          check_in_time: schedule.start_time,
          check_out_time: schedule.end_time,
          notes: `Lịch tự động: ${schedule.title} (${schedule.event_type})`
        }
      ]);
    } catch (err) {
      console.error("Automation 4 Error:", err);
    }
  }

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
