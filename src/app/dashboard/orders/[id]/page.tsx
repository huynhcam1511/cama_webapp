import { notFound } from "next/navigation";
import OrderDetailClient from "./order-detail-client";
import { getOrderById } from "../actions";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}
