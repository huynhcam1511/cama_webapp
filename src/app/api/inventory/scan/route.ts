import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { qrCode, action } = body;

    if (!qrCode || !action) {
      return NextResponse.json({ success: false, message: "Missing qrCode or action" }, { status: 400 });
    }

    // 1. Check if garment exists
    const { data: garment, error: garmentError } = await supabase
      .from("garments_inventory")
      .select("*")
      .eq("qr_code", qrCode)
      .single();

    if (garmentError || !garment) {
      return NextResponse.json({ success: false, message: "Không tìm thấy sản phẩm trong kho hệ thống." }, { status: 404 });
    }

    if (action === "OUTBOUND") {
      // Find a contract that reserved this garment and is waiting for delivery
      const { data: contractGarment, error: cgError } = await supabase
        .from("contract_garments")
        .select("*, contracts(customer_id)")
        .eq("garment_code", qrCode)
        .eq("reservation_status", "RESERVED")
        .order("deliver_date", { ascending: true })
        .limit(1)
        .single();

      if (cgError || !contractGarment) {
        return NextResponse.json({ success: false, message: `Sản phẩm (${garment.name}) chưa được xếp lịch (RESERVED) cho bất kỳ hợp đồng nào.` }, { status: 400 });
      }

      // Start transaction-like update
      await supabase
        .from("contract_garments")
        .update({ reservation_status: "DELIVERED" })
        .eq("id", contractGarment.id);

      await supabase
        .from("garments_inventory")
        .update({ status: "RENTED" })
        .eq("id", garment.id);

      return NextResponse.json({
        success: true,
        message: `Đã xuất kho thành công: ${garment.name}`,
        garment,
        contractId: contractGarment.contract_id
      });
    }

    if (action === "INBOUND") {
      // Find a contract that delivered this garment and is waiting for return
      const { data: contractGarment, error: cgError } = await supabase
        .from("contract_garments")
        .select("*, contracts(customer_id)")
        .eq("garment_code", qrCode)
        .eq("reservation_status", "DELIVERED")
        .order("return_date", { ascending: true })
        .limit(1)
        .single();

      if (cgError || !contractGarment) {
        return NextResponse.json({ success: false, message: `Sản phẩm (${garment.name}) không ở trạng thái Đã Xuất (DELIVERED) cho hợp đồng nào.` }, { status: 400 });
      }

      // Start transaction-like update
      await supabase
        .from("contract_garments")
        .update({ reservation_status: "RETURNED" })
        .eq("id", contractGarment.id);

      await supabase
        .from("garments_inventory")
        .update({ status: "AVAILABLE" })
        .eq("id", garment.id);

      return NextResponse.json({
        success: true,
        message: `Đã thu hồi thành công: ${garment.name}`,
        garment,
        contractId: contractGarment.contract_id
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Inventory Scan API Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}
