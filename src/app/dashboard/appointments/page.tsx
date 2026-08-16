import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/rbac";
import AppointmentsClient from "./appointments-client";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  await requirePermission("CUSTOMERS", "view"); // Temporary permission check

  const supabase = createAdminClient();
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

  return (
    <div className="space-y-6">

      <AppointmentsClient initialData={bookings || []} users={users || []} />
    </div>
  );
}
