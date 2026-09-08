import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import IncidentsClient from "./incidents-client";

export const dynamic = "force-dynamic";

export default async function OrderIncidentsPage() {
  await requirePermission("ORDER_INCIDENTS", "view");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("order_incidents")
    .select(`
      *,
      order:orders (
        id, order_code, completion_status, service_type,
        contract:contracts (contract_code, customer:customers (bride_name, groom_name, phone))
      ),
      reporter:users!order_incidents_reported_by_fkey (full_name),
      assignee:users!order_incidents_assigned_to_fkey (full_name)
    `)
    .order("created_at", { ascending: false });

  return <IncidentsClient initialIncidents={data || []} loadError={error?.message || ""} />;
}

