import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import CustomersPageClient from "./customers-page-client";
import { getCustomers } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingSchedulePage() {
  await requirePermission("CUSTOMERS", "view");

  const customers = await getCustomers();

  return (
    <CustomersPageClient 
      customers={customers || []} 
    />
  );
}
