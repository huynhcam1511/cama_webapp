"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";

export async function getCustomerServiceData() {
  await requirePermission("CUSTOMER_SERVICE", "view");
  const supabase = createAdminClient();

  // 1. Fetch contracts that need attention (e.g. recent contracts or contracts with upcoming schedules)
  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select(`
      id, contract_code, status, notes,
      customers (id, bride_name, groom_name, phone)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (contractsError) {
    console.error("Error fetching contracts for CS:", contractsError);
    return { error: contractsError.message };
  }

  // 2. Fetch upcoming operations schedules
  // In case operation_schedules does not exist, we wrap in try-catch or just suppress
  let schedules = [];
  try {
    const { data, error } = await supabase
      .from("operation_schedules")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(50);
      
    if (!error && data) schedules = data;
  } catch (e) {
    console.warn("operation_schedules table might not be ready", e);
  }

  return { contracts: contracts || [], schedules };
}
