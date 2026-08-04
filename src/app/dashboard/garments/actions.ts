"use server";

import { createClient } from "@/lib/supabase/server";

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