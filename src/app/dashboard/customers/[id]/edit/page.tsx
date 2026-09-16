import { requirePermission } from "@/lib/rbac";
import CustomerFormClient from "../../customer-form-client";
import { getCustomerById } from "../../actions";
import { notFound, redirect } from "next/navigation";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  await requirePermission("CUSTOMERS", "update");
  
  if (!params.id || params.id === "null" || params.id === "undefined") {
    redirect("/dashboard/customers");
  }

  const customer = await getCustomerById(params.id);
  
  if (!customer) {
    notFound();
  }

  return (
    <div className="p-6">
      <CustomerFormClient customer={customer} />
    </div>
  );
}
