"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type OrderChecklistItem = {
  task: string;
  category: "Thử đồ" | "Chỉnh sửa" | "Vệ sinh" | "Đóng gói" | "Giao nhận" | "Thu hồi";
  done: boolean;
};

export type OrderStatus = 'PENDING' | 'PREPARING' | 'WAITING_FITTING' | 'READY_TO_DELIVER' | 'DELIVERED' | 'WAITING_RETURN' | 'COMPLETED' | 'ISSUE';

export interface Order {
  id: string;
  order_code: string;
  contract_id: string;
  event_date: string;
  return_date: string;
  delivery_status: string;
  completion_status: OrderStatus;
  checklist: OrderChecklistItem[];
  notes: string;
  service_type: string;
  pic_id: string;
  total_value: number;
    contract: {
      contract_code: string;
      customer: {
        bride_name: string;
        groom_name: string;
        phone: string;
      };
      garments?: any[];
    };
  pic: {
    full_name: string;
  };
  operation_schedules?: any[];
}

export async function getOrders(filterStatus: string = "ALL"): Promise<Order[]> {
  const supabase = createAdminClient();
  
  let query = supabase.from("orders").select(`
    *,
    contract:contracts (
      contract_code,
      customer:customers ( bride_name, groom_name, phone )
    ),
    pic:users ( full_name ),
    operation_schedules (*)
  `).is("deleted_at", null).order("created_at", { ascending: false });

  if (filterStatus !== "ALL") {
    query = query.eq("completion_status", filterStatus);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data as any;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requirePermission("ORDERS", "update");
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ completion_status: status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/orders");
}

export async function updateOrderChecklist(orderId: string, checklist: OrderChecklistItem[]) {
  await requirePermission("ORDERS", "update");
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ checklist: JSON.stringify(checklist) }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/orders");
}

export async function createOrder(payload: Partial<Order>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert([{
      order_code: payload.order_code,
      contract_id: payload.contract_id || null,
      service_type: payload.service_type,
      event_date: payload.event_date || null,
      pic_id: payload.pic_id || null,
      notes: payload.notes || "",
      completion_status: 'PENDING'
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/orders");
  return data;
}
