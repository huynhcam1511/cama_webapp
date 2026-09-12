"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireActiveUser } from "@/lib/rbac";

export async function getMasterData() {
  await requireActiveUser();
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("master_data")
    .select("*")
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching master data:", error);
    return [];
  }
  return data || [];
}

export async function saveMasterData(isNew: boolean, payload: any) {
  await requireActiveUser();
  const supabase = createAdminClient();
  
  const record = {
    type: payload.type,
    code: payload.code,
    name: payload.name,
    parent_code: payload.parent_code || null,
    is_active: payload.is_active ?? true,
    sort_order: payload.sort_order || 0
  };

  if (isNew) {
    const { data, error } = await supabase.from("master_data").insert([record]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } else {
    const { error } = await supabase
      .from("master_data")
      .update(record)
      .eq("id", payload.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}

export async function deleteMasterData(id: string) {
  await requireActiveUser();
  const supabase = createAdminClient();
  
  const { error } = await supabase.from("master_data").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
