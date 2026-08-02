"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, requireActiveUser } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function saveEmployee(isNew: boolean, data: any, permissions: any[]) {
  const adminUser = await requireActiveUser();
  const supabase = createClient();
  const adminClient = createAdminClient();

  if (isNew) {
    await requirePermission("EMPLOYEES", "create");
    
    // 1. Create Auth User in Supabase using Admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: Math.random().toString(36).slice(-8) + "A1!", // Temporary password
      email_confirm: true,
      user_metadata: { full_name: data.full_name }
    });

    if (authError) {
      return { error: "Không thể tạo tài khoản xác thực: " + authError.message };
    }

    const userId = authData.user.id;

    // 2. Insert into users table
    const { error: dbError } = await supabase.from("users").insert({
      id: userId,
      employee_code: data.employee_code,
      full_name: data.full_name,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      department_id: data.department_id || null,
      team_id: data.team_id || null,
      position_id: data.position_id || null,
      role_id: data.role_id || null,
      is_active: data.is_active,
      is_working: data.is_working,
      employment_status: data.employment_status,
      start_date: data.start_date || null,
      note: JSON.stringify({ note: data.note, avatar_url: data.avatar_url, contract_info: data.contract_info }),
      default_start_time: data.default_start_time || null,
      default_end_time: data.default_end_time || null,
      default_work_days: data.default_work_days || [],
      monthly_leave_quota: data.monthly_leave_quota || 0,
    });

    if (dbError) {
      // Rollback auth user
      await adminClient.auth.admin.deleteUser(userId);
      return { error: "Không thể lưu thông tin nhân viên: " + dbError.message };
    }

    // 3. Insert specific permissions
    if (permissions && permissions.length > 0) {
      const permsToInsert = permissions.map(p => ({
        user_id: userId,
        module_id: p.module_id,
        can_view: p.can_view,
        can_create: p.can_create,
        can_update: p.can_update,
        can_delete: p.can_delete
      }));
      await supabase.from("user_permissions").insert(permsToInsert);
    }

    // Optional: Send password reset email so user can set their password
    await adminClient.auth.resetPasswordForEmail(data.email);

    revalidatePath("/dashboard/employees");
    return { success: true, id: userId };

  } else {
    await requirePermission("EMPLOYEES", "update");

    const userId = data.id;

    // We don't change email here for simplicity and security, unless really needed.
    const { error: dbError } = await supabase.from("users").update({
      employee_code: data.employee_code,
      full_name: data.full_name,
      gender: data.gender,
      phone: data.phone,
      department_id: data.department_id || null,
      team_id: data.team_id || null,
      position_id: data.position_id || null,
      role_id: data.role_id || null,
      is_active: data.is_active,
      is_working: data.is_working,
      employment_status: data.employment_status,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      note: JSON.stringify({ note: data.note, avatar_url: data.avatar_url, contract_info: data.contract_info }),
      default_start_time: data.default_start_time || null,
      default_end_time: data.default_end_time || null,
      default_work_days: data.default_work_days || [],
      monthly_leave_quota: data.monthly_leave_quota || 0,
    }).eq("id", userId);

    if (dbError) {
      return { error: "Không thể cập nhật thông tin: " + dbError.message };
    }

    // Update permissions (delete all old, insert new)
    await supabase.from("user_permissions").delete().eq("user_id", userId);
    
    if (permissions && permissions.length > 0) {
      const permsToInsert = permissions.map(p => ({
        user_id: userId,
        module_id: p.module_id,
        can_view: p.can_view,
        can_create: p.can_create,
        can_update: p.can_update,
        can_delete: p.can_delete
      }));
      await supabase.from("user_permissions").insert(permsToInsert);
    }

    revalidatePath("/dashboard/employees");
    return { success: true };
  }
}
