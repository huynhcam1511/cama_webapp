import { getCustomerServiceData } from "./actions";
import CustomerServiceClient from "./customer-service-client";
import { requirePermission } from "@/lib/rbac";
import { Suspense } from "react";
import * as icons from "lucide-react";

export const metadata = {
  title: "Chăm sóc khách hàng | CAMA Studio",
};

export default async function CustomerServicePage() {
  await requirePermission("CUSTOMER_SERVICE", "view");

  const { contracts, schedules, error } = await getCustomerServiceData();

  if (error) {
    return (
      <div className="p-8 flex justify-center text-red-500">
        Lỗi tải dữ liệu: {error}
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <icons.Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <CustomerServiceClient 
        initialContracts={contracts || []} 
        initialSchedules={schedules || []}
      />
    </Suspense>
  );
}
