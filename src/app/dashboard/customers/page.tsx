import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import CustomersPageClient from "./customers-page-client";
import { getCustomers } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingSchedulePage() {
  await requirePermission("CUSTOMERS", "view");

  const supabase = createClient();
  const { data: bookings } = await supabase
    .from("operation_schedules")
    .select("*, users:primary_assignee_id(full_name)")
    .eq("schedule_category", "SALE_BOOKING")
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("is_active", true);

  const customers = await getCustomers();

  return (
    <CustomersPageClient 
      bookings={bookings || []} 
      users={users || []} 
      customers={customers || []} 
    />
  );
}
