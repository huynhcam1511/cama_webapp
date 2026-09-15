"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, requireActiveUser } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

async function findAuthUserByEmail(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string
) {
  const perPage = 100;

  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error("Không thể kiểm tra tài khoản xác thực: " + error.message);
    }

    const user = data.users.find(
      candidate => candidate.email?.trim().toLowerCase() === email
    );

    if (user) return user;
    if (data.users.length < perPage) return null;
  }
}

export async function saveEmployee(isNew: boolean, data: any, permissions: any[]) {
  await requireActiveUser();
  const supabase = createAdminClient();
  const adminClient = createAdminClient();

  if (isNew) {
    await requirePermission("EMPLOYEES", "create");

    const email = data.email.trim().toLowerCase();

    // An employee may have signed in with Google before HR creates their profile.
    // In that case, reuse the existing Auth user instead of trying to register the
    // same email a second time.
    let authUser;
    try {
      authUser = await findAuthUserByEmail(adminClient, email);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Không thể kiểm tra tài khoản xác thực." };
    }

    const { data: existingEmployee, error: existingEmployeeError } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existingEmployeeError) {
      return { error: "Không thể kiểm tra danh sách nhân sự: " + existingEmployeeError.message };
    }

    if (existingEmployee) {
      return { error: "Email này đã có trong danh sách nhân sự." };
    }

    let createdNewAuthUser = false;

    if (!authUser) {
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8) + "A1!", // Temporary password
        email_confirm: true,
        user_metadata: { full_name: data.full_name }
      });

      if (authError) {
        return { error: "Không thể tạo tài khoản xác thực: " + authError.message };
      }

      authUser = authData.user;
      createdNewAuthUser = true;
    }

    const userId = authUser.id;

    // Guard against an inconsistent row whose id is already linked to this Auth user.
    const { data: existingLinkedEmployee, error: linkedEmployeeError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (linkedEmployeeError) {
      if (createdNewAuthUser) await adminClient.auth.admin.deleteUser(userId);
      return { error: "Không thể kiểm tra hồ sơ nhân sự: " + linkedEmployeeError.message };
    }

    if (existingLinkedEmployee) {
      return { error: "Tài khoản đăng nhập này đã được liên kết với một nhân viên." };
    }

    // 2. Insert into users table
    const { error: dbError } = await supabase.from("users").insert({
      id: userId,
      employee_code: data.employee_code,
      full_name: data.full_name,
      gender: data.gender,
      phone: data.phone,
      email,
      department_id: data.department_id || null,
      team_id: data.team_id || null,
      position_id: data.position_id || null,
      role_id: data.role_id || null,
      is_active: data.is_active,
      is_working: data.is_working,
      employment_status: data.employment_status,
      start_date: data.start_date || null,
      note: JSON.stringify({ note: data.note, avatar_url: data.avatar_url, cccd_front_url: data.cccd_front_url, contract_info: data.contract_info }),
      default_start_time: data.default_start_time || null,
      default_end_time: data.default_end_time || null,
      default_work_days: data.default_work_days || [],
      monthly_leave_quota: data.monthly_leave_quota || 0,
    });

    if (dbError) {
      // Only roll back an Auth user created by this request. Never delete an
      // existing Google/email account that is merely being linked to HR data.
      if (createdNewAuthUser) await adminClient.auth.admin.deleteUser(userId);
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

    // A newly-created account needs a password setup email. Existing Google
    // users can keep signing in with Google and should not receive this email.
    if (createdNewAuthUser) {
      await adminClient.auth.resetPasswordForEmail(email);
    }

    revalidatePath("/dashboard/employees");
    return { success: true, id: userId, linkedExistingAuth: !createdNewAuthUser };

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
      note: JSON.stringify({ note: data.note, avatar_url: data.avatar_url, cccd_front_url: data.cccd_front_url, contract_info: data.contract_info }),
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
