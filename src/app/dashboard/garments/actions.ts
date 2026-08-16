"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getInventoryOverview() {
  const supabase = await createClient();

  // Fetch all garments
  const { data: garments, error: garError } = await supabase
    .from("garments_inventory")
    .select("*")
    .order("name", { ascending: true });

  if (garError) {
    console.error("Error fetching garments:", garError);
    return { success: false, error: garError.message };
  }

  // Fetch all active contract_garments
  const { data: contractGarments, error: cgError } = await supabase
    .from("contract_garments")
    .select("*, contracts(contract_code, customers(bride_name, phone))")
    .in("reservation_status", ["RESERVED", "DELIVERED"])
    .order("deliver_date", { ascending: true });

  if (cgError) {
    console.error("Error fetching contract garments:", cgError);
    return { success: false, error: cgError.message };
  }

  return { 
    success: true, 
    garments: garments || [], 
    contractGarments: contractGarments || [] 
  };
}

export async function createGarment(data: any) {
  const supabase = await createClient();
  const { error } = await supabase.from('garments_inventory').insert([data]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateGarmentStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('garments_inventory').update({ status }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function liquidateInventoryItem(itemId: string, quantityToLiquidate: number, reason: string) {
  const supabase = await createClient();
  
  // 1. Fetch current inventory
  const { data: inv, error: fetchErr } = await supabase
    .from("inventory_items")
    .select("quantity, available_quantity, liquidated_quantity")
    .eq("id", itemId)
    .single();
    
  if (fetchErr || !inv) return { success: false, error: "Không tìm thấy sản phẩm trong kho." };
  
  if (inv.available_quantity < quantityToLiquidate) {
    return { success: false, error: "Số lượng khả dụng không đủ để thanh lý." };
  }
  
  // 2. Update
  const { error: updErr } = await supabase
    .from("inventory_items")
    .update({
      quantity: Math.max(0, inv.quantity - quantityToLiquidate),
      available_quantity: Math.max(0, inv.available_quantity - quantityToLiquidate),
      liquidated_quantity: (inv.liquidated_quantity || 0) + quantityToLiquidate,
      updated_at: new Date().toISOString()
    })
    .eq("id", itemId);
    
  if (updErr) return { success: false, error: updErr.message };
  return { success: true };
}