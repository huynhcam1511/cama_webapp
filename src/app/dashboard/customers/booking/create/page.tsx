import BookingFormClient from "../../booking-form-client";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function CreateBookingPage() {
  const supabase = createAdminClient();
  const { data: users } = await supabase.from("users").select("id, full_name, email");

  return <BookingFormClient users={users || []} />;
}
