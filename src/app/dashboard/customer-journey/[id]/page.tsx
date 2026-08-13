import { getCustomerJourneyById } from "../actions";
import CustomerJourneyDetailClient from "./customer-journey-detail-client";
import { requirePermission } from "@/lib/rbac";
import * as icons from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Chi tiết Hành trình | CAMA Studio",
};

export default async function CustomerJourneyDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("CUSTOMER_JOURNEY", "view");

  const { contract, error } = await getCustomerJourneyById(params.id);

  if (error || !contract) {
    return (
      <div className="p-8 flex justify-center text-red-500">
        Lỗi tải dữ liệu Hợp đồng: {error || "Không tìm thấy hợp đồng"}
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <icons.Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <CustomerJourneyDetailClient initialContract={contract} />
    </Suspense>
  );
}
