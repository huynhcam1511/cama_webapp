import { redirect } from "next/navigation";

export default function CreateAppointmentPage() {
  redirect("/dashboard/appointments?create=true");
}
