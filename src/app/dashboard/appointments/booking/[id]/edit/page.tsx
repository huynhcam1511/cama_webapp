import BookingFormClient from "../../../booking-form-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBookingById } from "../../../customers/actions";
import { notFound } from "next/navigation";

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: users } = await supabase.from("users").select("id, full_name, email");
  const booking = await getBookingById(params.id);

  if (!booking) {
    notFound();
  }

  return <BookingFormClient users={users || []} initialData={booking} />;
}
