import { requireActiveUser, requirePermission } from "@/lib/rbac";
import { getOrders } from "./actions";
import OrdersClient from "./orders-client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireActiveUser();
  await requirePermission("ORDERS", "view");

  const orders = await getOrders();
  
  const supabase = createClient();
  const { data: users } = await supabase.from("users").select("id, full_name").eq("is_active", true);
  const { data: contracts } = await supabase.from("contracts").select("id, contract_code, customer:customers(bride_name, phone)").is("deleted_at", null);

  return <OrdersClient initialOrders={orders} users={users || []} contracts={contracts || []} />;
}
