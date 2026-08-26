"use server";

import { createClient } from "@/lib/supabase/server";

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
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching inbound history:", error);
    return { success: false, items: [] };
  }

  return { success: true, items: data || [] };
}
