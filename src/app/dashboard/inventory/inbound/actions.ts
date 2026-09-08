"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser, requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function getInboundHistory() {
  const supabase = createClient();
  
  // Fetch recently added products in garments_inventory as the "Inbound History"
  const { data, error } = await (await supabase)
    .from("garments_inventory")
    .select(`
      id,
      name,
      qr_code,
      sku,
      group_type,
      size,
      status,
      location_floor,
      location_shelf,
      location_tier,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching inbound history:", error);
    return { success: false, items: [] };
  }

  const { data: movements } = await (await supabase)
    .from("inventory_movement_history")
    .select("id, garment_code, movement_type, to_floor, to_shelf, to_tier, created_at, garment:garments_inventory(name,sku,qr_code,group_type,size,status)")
    .eq("movement_type", "PUTAWAY")
    .order("created_at", { ascending: false })
    .limit(100);

  const putawayRows = (movements || []).map((movement: any) => ({
    id: movement.id,
    ...(Array.isArray(movement.garment) ? movement.garment[0] : movement.garment),
    qr_code: movement.garment_code,
    location_floor: movement.to_floor,
    location_shelf: movement.to_shelf,
    location_tier: movement.to_tier,
    movement_type: "PUTAWAY",
    created_at: movement.created_at,
  }));
  const initialRows = (data || []).map((item: any) => ({ ...item, movement_type: "INITIAL" }));
  const items = [...putawayRows, ...initialRows]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 100);
  return { success: true, items };
}

export async function findSuitForPutaway(code: string) {
  await requirePermission("GARMENT_CATALOG", "view");
  const suitCode = code.trim();
  if (!suitCode) return { success: false, error: "Vui lòng nhập mã suit." };
  const supabase = createAdminClient();
  let { data } = await supabase.from("garments_inventory")
    .select("id, qr_code, sku, name, status, location_floor, location_shelf, location_tier, model:garment_models(name)")
    .eq("qr_code", suitCode).maybeSingle();
  if (!data) {
    const bySku = await supabase.from("garments_inventory")
      .select("id, qr_code, sku, name, status, location_floor, location_shelf, location_tier, model:garment_models(name)")
      .eq("sku", suitCode).maybeSingle();
    data = bySku.data;
  }
  if (!data) return { success: false, error: `Không tìm thấy mã suit ${suitCode}.` };
  if (data.status !== "PENDING_PUTAWAY") {
    return { success: false, error: `Mã suit đang ở trạng thái ${data.status}, không thuộc kho ảo chờ xếp kệ.` };
  }
  return { success: true, item: data };
}

export async function putAwaySuit(code: string, location: { floor: string; shelf: string; tier?: string }) {
  await requirePermission("GARMENT_CATALOG", "update");
  const user = await requireActiveUser();
  const suitCode = code.trim();
  if (!suitCode || !location.floor || !location.shelf) return { success: false, error: "Thiếu mã suit hoặc vị trí kệ." };
  const supabase = createAdminClient();

  let { data: item } = await supabase.from("garments_inventory")
    .select("id, qr_code, sku, status, location_floor, location_shelf, location_tier")
    .eq("qr_code", suitCode).maybeSingle();
  if (!item) {
    const bySku = await supabase.from("garments_inventory")
      .select("id, qr_code, sku, status, location_floor, location_shelf, location_tier")
      .eq("sku", suitCode).maybeSingle();
    item = bySku.data;
  }
  if (!item) return { success: false, error: `Không tìm thấy mã suit ${suitCode}.` };
  if (item.status !== "PENDING_PUTAWAY") return { success: false, error: "Sản phẩm chưa ở trạng thái chờ xếp kệ." };

  let locationQuery = supabase.from("inventory_locations").select("id", { count: "exact", head: true }).eq("floor_name", location.floor).eq("shelf_name", location.shelf);
  if (location.tier) locationQuery = locationQuery.eq("tier_name", location.tier);
  else locationQuery = locationQuery.or('tier_name.is.null,tier_name.eq.""');
  const { count } = await locationQuery;
  if (!count) return { success: false, error: "Vị trí kệ không tồn tại. Vui lòng quét đúng QR kệ." };

  const { error } = await supabase.from("garments_inventory").update({
    status: "AVAILABLE",
    location_floor: location.floor,
    location_shelf: location.shelf,
    location_tier: location.tier || null,
    updated_at: new Date().toISOString(),
  }).eq("id", item.id).eq("status", "PENDING_PUTAWAY");
  if (error) return { success: false, error: error.message };

  await supabase.from("inventory_movement_history").insert({
    garment_instance_id: item.id,
    garment_code: item.qr_code || item.sku || suitCode,
    movement_type: "PUTAWAY",
    from_floor: item.location_floor || null,
    from_shelf: item.location_shelf || null,
    from_tier: item.location_tier || null,
    to_floor: location.floor,
    to_shelf: location.shelf,
    to_tier: location.tier || null,
    performed_by: user.id,
    notes: "Xếp lại kệ sau xử lý sự cố",
  });

  revalidatePath("/dashboard/inventory/inbound");
  revalidatePath("/dashboard/inventory/locations");
  return { success: true };
}
