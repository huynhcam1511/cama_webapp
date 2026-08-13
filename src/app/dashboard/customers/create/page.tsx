import { requirePermission } from "@/lib/rbac";
import CustomerFormClient from "../customer-form-client";

export default async function CreateCustomerPage() {
  await requirePermission("CUSTOMERS", "create");

  return (
    <div className="p-6">
      <CustomerFormClient customer={null} />
    </div>
  );
}
