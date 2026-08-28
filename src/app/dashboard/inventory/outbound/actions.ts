"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";

export async function getOutboundHistory() {
  await requirePermission("GARMENT_CATALOG", "view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_outbound_sessions")
    .select(`
      *,
      staff:users(id, full_name),
      order:orders(id, order_code, return_date, service_type),
      contract:contracts(id, contract_code),
      lines:inventory_outbound_lines(
        *,
        instance:garments_inventory(
          id, name, sku, qr_code, size, image_url,
          model:garment_models(name, base_sku, image_url)
        )
      )
    `)
    .order("completed_at", { ascending: false })
    .limit(100);

  if (error) return { success: false, error: error.message, sessions: [] };

  const rawSessions = data || [];
  const pathsToSign = new Set<string>();

  rawSessions.forEach((session: any) => {
    (session.lines || []).forEach((line: any) => {
      const instance = line.instance;
      const model = Array.isArray(instance?.model) ? instance.model[0] : instance?.model;
      const imageUrl = instance?.image_url || model?.image_url || null;
      
      line._rawUrl = imageUrl;
      if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("data:")) {
        pathsToSign.add(imageUrl);
      }
    });
  });

  const uniquePaths = Array.from(pathsToSign);
  const urlMap = new Map<string, string>();
  if (uniquePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("garment-images").createSignedUrls(uniquePaths, 3600);
    if (signed) {
      signed.forEach((s: any) => {
        if (s.signedUrl) urlMap.set(s.path, s.signedUrl);
      });
    }
  }

  const sessions = rawSessions.map((session: any) => ({
    ...session,
    lines: (session.lines || []).map((line: any) => {
      const instance = line.instance;
      const model = Array.isArray(instance?.model) ? instance.model[0] : instance?.model;
      let finalUrl = line._rawUrl;
      
      if (finalUrl && !finalUrl.startsWith("http") && !finalUrl.startsWith("data:")) {
        finalUrl = urlMap.get(finalUrl) || null;
      }
      delete line._rawUrl;
      
      return { ...line, instance: { ...instance, model, image_url: finalUrl } };
    })
  }));

  return { success: true, sessions };
}

export async function getOutboundOrders() {
  await requirePermission("GARMENT_CATALOG", "view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_code, contract_id, return_date, event_date, service_type, completion_status, contract:contracts(contract_code, customer:customers(bride_name, groom_name))")
    .is("deleted_at", null)
    .in("completion_status", ['PREPARING', 'WAITING_FITTING', 'READY_TO_DELIVER'])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { success: false, error: error.message, orders: [] };
  return { success: true, orders: data || [] };
}

export async function searchGarmentInstance(qrCode: string) {
  await requirePermission("GARMENT_CATALOG", "view");
  const supabase = await createClient();
  
  // We search for exact ID or exact SKU, or qr_code
  // Often QR code resolves to the exact ID or sku
  const { data, error } = await supabase
    .from("garments_inventory")
    .select("*, model:garment_models(*)")
    .or(`id.eq.${isValidUUID(qrCode) ? qrCode : '00000000-0000-0000-0000-000000000000'},sku.eq.${qrCode},qr_code.eq.${qrCode}`)
    .limit(1)
    .single();

  if (error) return { success: false, error: "Không tìm thấy sản phẩm mã này hoặc mã chưa được gán." };
  
  if (data.status !== 'AVAILABLE') {
     return { success: false, error: `Sản phẩm này đang ở trạng thái ${data.status}, không thể xuất kho.` };
  }

  // Sign image URL for model
  if (data.model?.image_url) {
    const { data: signed } = await supabase.storage.from("garment-images").createSignedUrl(data.model.image_url, 3600);
    data.model.image_url = signed?.signedUrl || data.model.image_url;
  }

  return { success: true, instance: data };
}

export async function submitOutbound(payload: any) {
  await requirePermission("GARMENT_CATALOG", "create");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, error: "Phiên đăng nhập hết hạn" };

  const rpcPayload = {
    staff_id: auth.user.id,
    reason: payload.reason,
    order_id: payload.order_id || null,
    contract_id: payload.contract_id || null,
    notes: payload.notes || "",
    expected_return_date: payload.expected_return_date || null,
    items: payload.items.map((i: any) => ({
      instance_id: i.instance_id,
      status: payload.reason === "Giao khách" ? "RENTED" : "MAINTENANCE"
    }))
  };

  const { data, error } = await supabase.rpc("process_inventory_outbound", { payload: rpcPayload });
  
  if (error) return { success: false, error: error.message };
  return { success: true, session_id: data };
}

function isValidUUID(str: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
}
