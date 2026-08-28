import { requireActiveUser, requirePermission } from "@/lib/rbac";
import { getOrders } from "./actions";
import OrdersClient from "./orders-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams?: { status?: string } }) {
  const user = await requireActiveUser();
  await requirePermission("ORDERS", "view");

  const orders = await getOrders();
  
  const supabase = createAdminClient();
  const { data: users } = await supabase.from("users").select("id, full_name, phone, employee_code, team_id").eq("is_active", true);
  const { data: contracts } = await supabase.from("contracts").select("id, contract_code, customer:customers(bride_name, phone)").is("deleted_at", null);
  const { data: vhDept } = await supabase.from("departments").select("id").eq("department_code", "DEP-VH").single();
  const { data: teams } = await supabase.from("teams").select("id, name").eq("active", true).eq("department_id", vhDept?.id).order("name");

  return <OrdersClient initialOrders={orders} users={users || []} contracts={contracts || []} teams={teams || []} initialStatus={searchParams?.status} />;
}
