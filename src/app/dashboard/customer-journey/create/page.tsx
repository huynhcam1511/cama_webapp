import { redirect } from "next/navigation";

export default function CreateCustomerJourneyPage() {
  redirect("/dashboard/customer-journey?create=true");
}
