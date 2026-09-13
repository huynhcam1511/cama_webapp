"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, requireActiveUser } from "@/lib/rbac";

/**
 * 1. GET POLICIES (MASTER VIEW)
 */
export async function getPolicies(filters?: { document_type_id?: string; department_id?: string }) {
  await requireActiveUser();
  await requirePermission("POLICIES", "view");

  const supabase = createAdminClient();
  
  let query = supabase
    .from("policies")
    .select(`
      id,
      code,
      name,
      description,
      document_type_id,
      department_id,
      target_audience_id,
      created_at,
      policy_versions (
        id,
        version_name,
        effective_date,
        created_at,
        file_url
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.document_type_id) {
    query = query.eq("document_type_id", filters.document_type_id);
  }
  if (filters?.department_id) {
    query = query.eq("department_id", filters.department_id);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching policies:", error);
    return [];
  }

  // Lọc ra phiên bản hiện hành (effective_date gần nhất và <= today)
  // Fix timezone bug: Server is in UTC, we need Vietnam Time (UTC+7) to determine 'today'
  const tzOffset = 7 * 60 * 60 * 1000;
  const vnTime = new Date(Date.now() + tzOffset);
  const today = vnTime.toISOString().split('T')[0];
  
  const mappedData = data.map((policy: any) => {
    // Sort versions by effective_date DESC, then by id DESC (newest first)
    const versions = policy.policy_versions || [];
    versions.sort((a: any, b: any) => {
      const timeDiff = new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime();
      if (timeDiff !== 0) return timeDiff;
      // Fallback to sorting by created_at descending if dates are exactly the same
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    
    // Find active version
    const activeVersion = versions.find((v: any) => v.effective_date <= today) || versions[0] || null;

    return {
      ...policy,
      active_version: activeVersion,
      versions_count: versions.length
    };
  });

  return mappedData;
}

/**
 * 2. GET POLICY DETAIL
 */
export async function getPolicyById(id: string) {
  await requireActiveUser();
  await requirePermission("POLICIES", "view");

  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("policies")
    .select(`
      *,
      policy_versions (
        *
      )
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching policy detail:", error);
    return null;
  }

  // Sort versions descending by effective_date, then by created_at DESC
  if (data.policy_versions) {
    data.policy_versions.sort((a: any, b: any) => {
      const timeDiff = new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }

  return data;
}

/**
 * 3. SAVE POLICY (Thêm mới hoặc Cập nhật thông tin chung)
 */
export async function savePolicy(isNew: boolean, policyData: any) {
  const user = await requireActiveUser();
  if (isNew) {
    await requirePermission("POLICIES", "create");
  } else {
    await requirePermission("POLICIES", "update");
  }

  const supabase = createAdminClient();
  
  const payload = {
    name: policyData.name,
    description: policyData.description || null,
    document_type_id: policyData.document_type_id || null,
    department_id: policyData.department_id || null,
    target_audience_id: policyData.target_audience_id || null,
    // (Bỏ qua code ở client gửi lên, thay bằng tự động sinh hoặc logic khác nếu cần)
  };

  if (isNew) {
    // Todo: Tạo mã tự động chuẩn hoá (ví dụ: POLI-000001)
    const code = "POLI-" + Date.now().toString().slice(-6); // Tạm thời dùng Date.now, cần đổi sang sequence
    
    const { data: insertedData, error } = await supabase.from("policies").insert([
      { ...payload, code }
    ]).select().single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: insertedData };
  } else {
    const { error } = await supabase
      .from("policies")
      .update(payload)
      .eq("id", policyData.id)
      .is("deleted_at", null);
      
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}

/**
 * 4. DELETE POLICY (Soft Delete)
 */
export async function deletePolicy(id: string) {
  await requirePermission("POLICIES", "delete");
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("policies")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
    
  if (error) return { success: false, error: error.message };
  
  return { success: true };
}

/**
 * 5. SAVE POLICY VERSION (Thêm hoặc sửa dòng version)
 */
export async function savePolicyVersion(isNew: boolean, versionData: any) {
  await requireActiveUser();
  await requirePermission("POLICIES", isNew ? "create" : "update");

  const supabase = createAdminClient();
  
  const payload = {
    policy_id: versionData.policy_id,
    version_name: versionData.version_name,
    effective_date: versionData.effective_date,
    file_url: versionData.file_url || null,
    notes: versionData.notes || null,
  };

  if (isNew) {
    const { data, error } = await supabase.from("policy_versions").insert([payload]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } else {
    const { data, error } = await supabase
      .from("policy_versions")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", versionData.id)
      .select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
}

/**
 * 6. DELETE POLICY VERSION
 */
export async function deletePolicyVersion(id: string) {
  await requirePermission("POLICIES", "delete");
  const supabase = createAdminClient();
  
  const { error } = await supabase.from("policy_versions").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  
  return { success: true };
}

/**
 * 7. GET MASTER DATA OPTIONS (Danh mục dùng chung)
 */
export async function getPolicyMasterData() {
  await requireActiveUser();
  const supabase = createAdminClient();
  // Lấy toàn bộ từ bảng master_data thay vì nhiều bảng rời rạc
  const { data: masterData, error: mdError } = await supabase
    .from("master_data")
    .select("id, type, code, name, parent_code")
    .in("type", ["DOCUMENT_TYPE", "TARGET_AUDIENCE", "DEPARTMENT"])
    .order("sort_order", { ascending: true });

  if (mdError) {
    console.error("Error fetching master data:", mdError);
    return { documentTypes: [], targetAudiences: [], departments: [] };
  }

  return {
    documentTypes: masterData?.filter(item => item.type === "DOCUMENT_TYPE") || [],
    targetAudiences: masterData?.filter(item => item.type === "TARGET_AUDIENCE") || [],
    departments: masterData?.filter(item => item.type === "DEPARTMENT") || []
  };
}
