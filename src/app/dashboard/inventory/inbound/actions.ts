"use server";

import { createClient } from "@/lib/supabase/server";

export async function getGarmentModelsForInbound() {
  const supabase = await createClient();

  // Fetch models for selection
  const { data: models, error } = await supabase
    .from("garment_models")
    .select("id, name, base_sku, image_url, category")
    .order("name", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, models: models || [] };
}

export async function submitInboundTransaction(payload: {
  model_id: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  supplier?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  // 1. Fetch the selected model to get the base info (for fallback/logging if needed)
  const { data: model, error: modelErr } = await supabase
    .from("garment_models")
    .select("*")
    .eq("id", payload.model_id)
    .single();

  if (modelErr || !model) {
    return { success: false, error: "Model not found." };
  }

  // 2. Prepare the instances to insert. 
  // We don't generate the SKU here, because the DB trigger `trigger_generate_garment_sku`
  // will automatically assign the `sku` using `garments_sku_seq` for every inserted row.
  const instancesToInsert = Array.from({ length: payload.quantity }).map(() => ({
    model_id: model.id,
    product_name: model.name,
    category: model.category,
    factory_code: model.factory_code,
    group_type: model.group_type,
    style_details: model.style_details,
    material_pattern: model.material_pattern,
    size_code: model.size_code,
    image_url: model.image_url,
    location_floor: model.default_location_floor,
    location_shelf: model.default_location_shelf,
    location_tier: model.default_location_tier,
    status: "AVAILABLE",
    purchase_price: payload.purchase_price,
    purchase_date: payload.purchase_date
  }));

  // 3. Bulk insert instances. The trigger will fire for each row and set `sku` and `qr_code`.
  const { data: insertedInstances, error: insertErr } = await supabase
    .from("garments_inventory")
    .insert(instancesToInsert)
    .select("id, sku, qr_code");

  if (insertErr) {
    return { success: false, error: insertErr.message };
  }

  // Optional: We could also log to an `inventory_transactions` table here for auditing,
  // but for now creating the instances serves as the inbound action.

  return { 
    success: true, 
    instances: insertedInstances 
  };
}
