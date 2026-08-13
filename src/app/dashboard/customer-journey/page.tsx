import { getCustomerJourneyData } from "./actions";
import CustomerJourneyClient from "./customer-journey-client";
import { requirePermission } from "@/lib/rbac";
import { Suspense } from "react";
import * as icons from "lucide-react";

export const metadata = {
  title: "Hành trình khách hàng | CAMA Studio",
};

export default async function CustomerJourneyPage() {
  await requirePermission("CUSTOMER_JOURNEY", "view");

  const { contracts, schedules, error } = await getCustomerJourneyData();

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
      <CustomerJourneyClient 
        initialContracts={contracts || []} 
        initialSchedules={schedules || []}
      />
    </Suspense>
  );
}
