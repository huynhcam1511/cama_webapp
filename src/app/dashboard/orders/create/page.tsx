import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import CreateOrderClient from "./create-order-client";

export default async function CreateOrderPage() {
  await requirePermission("ORDERS", "create");
  const supabase = createAdminClient();

  // Fetch data for the form (users, contracts)
  const [{ data: users }, { data: contracts }] = await Promise.all([
    supabase.from("users").select("id, full_name, email"),
    supabase.from("contracts").select("id, contract_code, customer:customers(bride_name, phone)").order("created_at", { ascending: false })
  ]);

  return (
    <div className="min-h-full w-full overflow-y-auto bg-slate-50">
      <CreateOrderClient 
        users={users || []} 
        contracts={(contracts || []).map((contract) => ({
          ...contract,
          customer: Array.isArray(contract.customer) ? contract.customer[0] || null : contract.customer,
        }))}
      />
    </div>
  );
}
