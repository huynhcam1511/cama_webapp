import { createAdminClient } from "@/utils/supabase/server";
import { requirePermission } from "@/utils/permissions";
import { redirect } from "next/navigation";
import CreateOrderClient from "./create-order-client";

export default async function CreateOrderPage() {
  await requirePermission("OPERATION_ORDERS", "create");
  const supabase = createAdminClient();

  // Fetch data for the form (users, contracts)
  const [{ data: users }, { data: contracts }] = await Promise.all([
    supabase.from("users").select("id, full_name, email"),
    supabase.from("contracts").select("id, contract_code, customer:customers(bride_name, phone)").order("created_at", { ascending: false })
  ]);

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto bg-slate-50/50">
      <CreateOrderClient 
        users={users || []} 
        contracts={contracts || []}
      />
    </div>
  );
}
