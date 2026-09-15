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
  event_id: string | null;
  event_date: string;
  return_date: string;
  delivery_status: string;
  completion_status: OrderStatus;
  checklist: OrderChecklistItem[];
  notes: string;
  service_type: string;
  pic_id: string | null;
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
    team_id?: string;
  };
  operation_schedules?: any[];
  qa_stages?: any[];
  qa_incidents?: any[];
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
  const normalized = (data || []).map((order: any) => {
    try {
      const meta = typeof order.contract?.notes === "string" ? JSON.parse(order.contract.notes) : (order.contract?.notes || {});
      const event = Array.isArray(meta.events) ? meta.events.find((item: any) => item.name === order.service_type) : null;
      if (event) {
        return { ...order, event_date: event.pickup_date || null, return_date: event.return_date || null };
      }
    } catch (_) {}
    return order;
  });
  return normalized as any;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await requirePermission("ORDERS", "update");
    const supabase = createAdminClient();
  
  const { data: order } = await supabase.from("orders").select(`
    id, pic_id, order_code, service_type, contract_id,
    contract:contracts(contract_type, notes, services:contract_services(*), garments:contract_garments(*))
  `).eq("id", orderId).single();

  const { error } = await supabase.from("orders").update({ completion_status: status }).eq("id", orderId);
  if (error) return { success: false, error: error.message };

  // Cross-module update: Inventory status based on order status
  if (order && order.contract && order.contract_id) {
    try {
      const contractData = Array.isArray(order.contract) ? order.contract[0] : order.contract;
      const contractStr = contractData as any;
      let items = Array.isArray(contractStr.services) ? contractStr.services : [];
      let garments = Array.isArray(contractStr.garments) ? contractStr.garments : [];
      if (contractStr.notes) {
        try {
          const meta = typeof contractStr.notes === 'string' && contractStr.notes.startsWith('{') 
            ? JSON.parse(contractStr.notes) : {};
          items = (meta.items && meta.items.length > 0) ? meta.items : items;
          garments = (meta.garments && meta.garments.length > 0) ? meta.garments : garments;
        } catch(e){}
      }
      const eventItems = (items || []).filter((item: any) => {
        const usageEvents = Array.isArray(item.usage_events) ? item.usage_events : [];
        return usageEvents.length === 0 || usageEvents.includes(order.service_type);
      });
      const linkedCodes = new Set<string>(eventItems.flatMap((item: any) => item.inventory_selection?.codes || []));
      const targetGarmentCodes = (garments || [])
        .filter((garment: any) => !garment.model_id || linkedCodes.has(garment.garment_code))
        .map((g: any) => g.garment_code);

      if (targetGarmentCodes.length > 0) {
        if (status === 'DELIVERED') {
          // Bán đứt -> SOLD, Thuê -> DELIVERED
          const targetStatus = contractStr.contract_type === 'SALES' ? 'SOLD' : 'DELIVERED';
          await supabase.from("garments_inventory").update({ status: targetStatus, updated_at: new Date().toISOString() }).in("qr_code", targetGarmentCodes);
        } else if (status === 'COMPLETED') {
          // Đã hoàn thành (Trả đồ) -> AVAILABLE
          if (contractStr.contract_type !== 'SALES') {
            await supabase.from("garments_inventory").update({ status: 'AVAILABLE', updated_at: new Date().toISOString() }).in("qr_code", targetGarmentCodes);
          }
        }
      }
    } catch (err) {
      console.error("Inventory update error:", err);
    }
  }

  // Automation 5: Vận hành ↔ Kế Toán Lương (Trừ lương tự động khi có ISSUE)
  if (status === "ISSUE") {
    try {
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
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật trạng thái đơn hàng";
    console.error("Error updating order status:", message);
    return { success: false, error: message };
  }
}

export async function updateOrderChecklist(id: string, checklist: OrderChecklistItem[]) {
  try {
    await requirePermission("ORDERS", "update");
    const supabase = createAdminClient();
    const { error } = await supabase.from("orders").update({ checklist }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể lưu checklist";
    console.error("Error updating order checklist:", message);
    return { success: false, error: message };
  }
}

export async function saveOrderNotesAndImages(id: string, text: string, images: string[]) {
  const supabase = createAdminClient();
  const newNotes = JSON.stringify({ text, images });
  const { error } = await supabase.from("orders").update({ notes: newNotes }).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
}

export type CreateOrderInput = {
  contract_id?: string | null;
  service_type: string;
  event_date?: string | null;
  pic_id?: string | null;
  notes?: string;
};

export async function createOrder(payload: CreateOrderInput) {
  await requirePermission("ORDERS", "create");
  const supabase = createAdminClient();
  const serviceType = payload.service_type?.trim();
  if (!serviceType) throw new Error("Vui lòng nhập tên dịch vụ hoặc sự kiện.");
  if (serviceType.length > 160) throw new Error("Tên dịch vụ không được dài quá 160 ký tự.");
  if (payload.event_date && !/^\d{4}-\d{2}-\d{2}$/.test(payload.event_date)) throw new Error("Ngày giao đồ không hợp lệ.");

  if (payload.contract_id) {
    const { data: contract, error: contractError } = await supabase.from("contracts").select("id").eq("id", payload.contract_id).is("deleted_at", null).maybeSingle();
    if (contractError) throw new Error(contractError.message);
    if (!contract) throw new Error("Hợp đồng đã chọn không còn tồn tại.");
  }
  const code = await generateSequentialCode(supabase, "orders", "order_code", "ORDE");

  const { data, error } = await supabase
    .from("orders")
    .insert([{
      order_code: code,
      contract_id: payload.contract_id ?? null,
      service_type: serviceType,
      event_date: payload.event_date || null,
      pic_id: payload.pic_id || null,
      notes: payload.notes?.trim().slice(0, 1000) || "",
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
  
  if (data?.contract) {
    let items = Array.isArray(data.contract.services) ? data.contract.services : [];
    let garments = Array.isArray(data.contract.garments) ? data.contract.garments : [];
    
    if (data.contract.notes) {
      try {
        const meta = typeof data.contract.notes === 'string' && data.contract.notes.startsWith('{') 
          ? JSON.parse(data.contract.notes) 
          : {};
        
        items = (meta.items && meta.items.length > 0) ? meta.items : items;
        garments = (meta.garments && meta.garments.length > 0) ? meta.garments : garments;

        // Đơn hàng chỉ nhận các mã áo đã được liên kết với đúng dòng sản phẩm
        // của sự kiện này. Những lần bấm chọn thử trước đây không còn xuất hiện.
        const eventItems = (items || []).filter((item: any) => {
          const usageEvents = Array.isArray(item.usage_events) ? item.usage_events : [];
          return usageEvents.length === 0 || usageEvents.includes(data.service_type);
        });
        const linkedCodes = new Set<string>(eventItems.flatMap((item: any) => item.inventory_selection?.codes || []));
        garments = (garments || [])
          .filter((garment: any) => !garment.model_id || linkedCodes.has(garment.garment_code))
          .map((garment: any) => {
            const linkedItem = eventItems.find((item: any) => item.inventory_selection?.codes?.includes(garment.garment_code));
            const selection = linkedItem?.inventory_selection;
            return {
              ...garment,
              product_image_url: selection?.imageUrl || garment.product_image_url || null,
              product_base_sku: selection?.baseSku || null,
              product_location: selection?.location || null,
            };
          });

        const codesToFetch = garments.map((g: any) => g.garment_code).filter(Boolean);
        if (codesToFetch.length > 0) {
          const { data: invData } = await supabase.from('garments_inventory').select('qr_code, image_url, model:garment_models(image_url)').in('qr_code', codesToFetch);
          if (invData && invData.length > 0) {
            const imgMap = new Map(invData.map(row => {
              const modelData = Array.isArray(row.model) ? row.model[0] : row.model;
              return [row.qr_code, row.image_url || modelData?.image_url];
            }));
            garments = garments.map((g: any) => ({
              ...g,
              product_image_url: imgMap.get(g.garment_code) || g.product_image_url
            }));
          }
        }
        
        if (meta.events) {
          data.contract.event_schedules = meta.events;
        }
      } catch (e) {}
    }
    
    data.contract.items = items;
    data.contract.garments = garments;
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

export async function updateOrderQAStage(orderId: string, stageData: any) {
  const supabase = createClient();
  const { data: order, error: orderError } = await supabase.from('orders').select('qa_stages').eq('id', orderId).single();
  if (orderError) return { error: orderError.message };
  
  let stages = order.qa_stages || [];
  const existingIndex = stages.findIndex((s: any) => s.step === stageData.step);
  if (existingIndex > -1) {
    stages[existingIndex] = { ...stages[existingIndex], ...stageData };
  } else {
    stages.push(stageData);
  }
  
  const { error } = await supabase.from('orders').update({ qa_stages: stages }).eq('id', orderId);
  if (error) return { error: error.message };
  
  revalidatePath('/dashboard/orders');
  return { error: null };
}

export async function reportOrderIncident(orderId: string, contractId: string, incidentData: any) {
  const supabase = createClient();
  
  const { data: order, error: orderError } = await supabase.from('orders').select('qa_incidents, order_code').eq('id', orderId).single();
  if (orderError) return { error: orderError.message };
  
  const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id;
  
  const { error } = await supabase.from('order_incidents').insert({
    order_id: orderId,
    contract_id: contractId,
    garment_instance_id: incidentData.garment_instance_id || null,
    description: incidentData.description,
    penalty_amount: incidentData.penalty_amount || 0,
    deduct_amount: incidentData.deductAmount || 0,
    extra_amount: incidentData.extraAmount || 0,
    status: 'OPEN',
    reported_by: incidentData.created_by_id || userId || null,
  });
  if (error) return { error: error.message };

  if (incidentData.garment_instance_id) {
    const { data: garment } = await supabase.from('garments_inventory').select('id, garment_code, status').eq('id', incidentData.garment_instance_id).single();
    if (garment) {
      await supabase.from('garments_inventory').update({ status: 'MAINTENANCE' }).eq('id', incidentData.garment_instance_id);
      await supabase.from('inventory_movement_history').insert({
        garment_id: incidentData.garment_instance_id,
        action_type: 'MAINTENANCE',
        actor_id: userId,
        notes: `Chuyển sang bảo trì từ sự cố đơn hàng ${order.order_code}: ${incidentData.description}`,
        from_location_id: null,
        to_location_id: null
      });
    }
  }
  
  if (contractId) {
    if (incidentData.deductAmount > 0) {
      await supabase.from('payments').insert({
        contract_id: contractId,
        amount: incidentData.deductAmount,
        type: "PENALTY", 
        method: "TRỪ_CỌC",
        status: "COMPLETED",
        payment_date: new Date().toISOString(),
      });
    }
    if (incidentData.extraAmount > 0) {
      await supabase.from('contracts').update({
        total_amount: incidentData.extraAmount,
      }).eq('id', contractId);
    }
  }
  
  revalidatePath(`/dashboard/orders/${orderId}`);
  if (contractId) revalidatePath(`/dashboard/contracts/${contractId}`);
  return { success: true };
}

export async function updateOrderPic(orderId: string, picId: string | null) {
  const supabase = createAdminClient();
  await supabase.from('orders').update({ pic_id: picId }).eq('id', orderId);
  revalidatePath('/dashboard/orders');
}
