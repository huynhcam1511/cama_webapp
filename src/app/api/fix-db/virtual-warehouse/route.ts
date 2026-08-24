import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();

  try {
    // 1. Create Virtual Warehouse location if not exists
    const { error: locError } = await supabase.from('inventory_locations').upsert({
      floor_name: 'Kho Ảo',
      shelf_name: null,
      tier_name: null,
      notes: 'Khu vực lưu trữ tạm thời chờ phân bổ lên kệ thực tế.'
    }, { onConflict: 'floor_name, shelf_name, tier_name' });

    if (locError && locError.code !== '23505') {
      return NextResponse.json({ success: false, message: "Lỗi tạo Kho Ảo", error: locError });
    }

    // 2. Count existing items not in Kho Ảo
    const { count, error: countError } = await supabase
      .from('garments_inventory')
      .select('id', { count: 'exact', head: true })
      .neq('location_floor', 'Kho Ảo');

    if (countError) {
       return NextResponse.json({ success: false, message: "Lỗi đếm sản phẩm", error: countError });
    }

    // 3. Move items to Kho Ảo
    const { error: updateError } = await supabase
      .from('garments_inventory')
      .update({
        location_floor: 'Kho Ảo',
        location_shelf: null,
        location_tier: null
      })
      .neq('location_floor', 'Kho Ảo'); // Only update items not already in Kho Ảo

    if (updateError) {
      return NextResponse.json({ success: false, message: "Lỗi di chuyển sản phẩm", error: updateError });
    }

    // 4. Delete old custom locations
    const { error: deleteLocError } = await supabase
      .from('inventory_locations')
      .delete()
      .neq('floor_name', 'Kho Ảo');

    if (deleteLocError) {
       console.error("Lỗi xoá vị trí cũ", deleteLocError);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đã di chuyển thành công ${count} sản phẩm vào Kho Ảo và làm sạch danh sách kệ cũ.`
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Server error", error: err.message });
  }
}
