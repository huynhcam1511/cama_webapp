"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMarketingContents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_contents")
    .select("*, auth.users(email)")
    .order("planned_date", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

export async function createMarketingContent(payload: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("marketing_contents")
    .insert([{ ...payload, created_by: user.id }]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/marketing/content");
  return { success: true, message: "Tạo gói Content thành công!" };
}

export async function updateMarketingContent(id: string, payload: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_contents")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/marketing/content");
  return { success: true, message: "Cập nhật thành công!" };
}

export async function deleteMarketingContent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_contents")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/marketing");
  return { success: true, message: "Đã xóa nội dung!" };
}
