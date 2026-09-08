"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser, requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus,
  resolutionNotes = ""
) {
  await requirePermission("ORDER_INCIDENTS", "update");
  const user = await requireActiveUser();
  const supabase = createAdminClient();

  if (!(["OPEN", "IN_PROGRESS", "RESOLVED"] as string[]).includes(status)) {
    return { error: "Trạng thái sự cố không hợp lệ." };
  }
  if (status === "RESOLVED" && !resolutionNotes.trim()) {
    return { error: "Vui lòng nhập kết quả xử lý trước khi hoàn tất sự cố." };
  }

  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "OPEN") {
    payload.assigned_to = null;
    payload.resolved_at = null;
  } else {
    payload.assigned_to = user.id;
  }
  if (status === "RESOLVED") {
    payload.resolution_notes = resolutionNotes.trim();
    payload.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("order_incidents")
    .update(payload)
    .eq("id", incidentId)
    .select("order_id, garment_instance_id")
    .single();

  if (error) return { error: error.message };

  if (status === "RESOLVED" && data?.order_id) {
    // Sửa xong chưa có nghĩa là đã nhập kho. Sản phẩm chỉ AVAILABLE sau
    // luồng xếp kệ có xác nhận vị trí; trước đó nằm ở kho ảo/chờ xếp kệ.
    if (data.garment_instance_id) {
      const { error: garmentError } = await supabase
        .from("garments_inventory")
        .update({ status: "PENDING_PUTAWAY", updated_at: new Date().toISOString() })
        .eq("id", data.garment_instance_id);
      if (garmentError) return { error: garmentError.message };
    }

    const { count, error: countError } = await supabase
      .from("order_incidents")
      .select("id", { count: "exact", head: true })
      .eq("order_id", data.order_id)
      .neq("status", "RESOLVED");
    if (countError) return { error: countError.message };

    if ((count || 0) === 0) {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ completion_status: "COMPLETED", updated_at: new Date().toISOString() })
        .eq("id", data.order_id);
      if (orderError) return { error: orderError.message };
    }
  }

  revalidatePath("/dashboard/order-incidents");
  if (data?.order_id) revalidatePath(`/dashboard/orders/${data.order_id}`);
  return { error: null };
}
