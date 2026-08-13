"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { generateSequentialCode } from "@/utils/code-generator";

export type OrderChecklistItem = {
  task: string;
  category: "Thử đồ" | "Chỉnh sửa" | "Vệ sinh" | "Đóng gói" | "Giao nhận" | "Thu hồi";
  done: boolean;
};

export type OrderStatus = 'PENDING' | 'PREPARING' | 'WAITING_FITTING' | 'READY_TO_DELIVER' | 'DELIVERED' | 'WAITING_RETURN' | 'COMPLETED' | 'ISSUE' | 'CANCELLED';

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
      notes,
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
  console.log("getOrders returned length:", data?.length);
  return data as any;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requirePermission("ORDERS", "update");
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ completion_status: status }).eq("id", orderId);
  if (error) throw new Error(error.message);

  // Automation 5: Vận hành ↔ Kế Toán Lương (Trừ lương tự động khi có ISSUE)
  if (status === "ISSUE") {
    try {
      const { data: order } = await supabase.from("orders").select("pic_id, order_code").eq("id", orderId).single();
      if (order && order.pic_id) {
        await supabase.from("payroll_deductions").insert([
          {
            user_id: order.pic_id,
            amount: 200000, // Ví dụ phạt 200k
            reason: `Lỗi xử lý đơn hàng ${order.order_code}`,
            date: new Date().toISOString(),
            status: "PENDING"
          }
        ]);
      }
    } catch (err) {
      console.error("Automation 5 Error:", err);
    }
  }

  revalidatePath("/dashboard/orders");
}

export async function updateOrderChecklist(id: string, checklist: OrderChecklistItem[]) {
  await requirePermission("ORDERS", "update");
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ checklist }).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
}

export async function saveOrderNotesAndImages(id: string, text: string, images: string[]) {
  const supabase = createAdminClient();
  const newNotes = JSON.stringify({ text, images });
  const { error } = await supabase.from("orders").update({ notes: newNotes }).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
}

export async function createOrder(payload: Partial<Order>) {
  const supabase = createAdminClient();
  let code = payload.order_code?.trim();
  if (!code || code.startsWith("ORD-")) {
    code = await generateSequentialCode(supabase, "orders", "order_code", "ORDE");
  }

  const { data, error } = await supabase
    .from("orders")
    .insert([{
      order_code: code,
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

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase.from("orders").select(`
    *,
    contract:contracts (
      id,
      contract_code,
      notes,
      customer:customers ( bride_name, groom_name, phone, email, address, wedding_date ),
      services:contract_services(*)
    ),
    pic:users ( full_name ),
    operation_schedules (*)
  `).eq("id", orderId).is("deleted_at", null).single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }
  
  if (data?.contract?.notes) {
    try {
      const meta = typeof data.contract.notes === 'string' && data.contract.notes.startsWith('{') 
        ? JSON.parse(data.contract.notes) 
        : {};
      data.contract.items = meta.items || [];
      data.contract.garments = meta.garments || [];
    } catch (e) {}
  }
  
  return data as any;
}

export async function deleteOrder(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ completion_status: 'CANCELLED', updated_at: new Date().toISOString() }).eq("id", orderId);
  if (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}
