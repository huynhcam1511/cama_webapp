import { notFound } from "next/navigation";
import OrderDetailClient from "./order-detail-client";
import { getOrderById } from "../actions";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  const supabase = createAdminClient();
  const { data: users } = await supabase.from("users").select("id, full_name, phone, employee_code").eq("is_active", true);

  return <OrderDetailClient order={order} users={users || []} />;
}
