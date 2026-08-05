"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function checkIn(locationData?: { lat: number, lng: number, accuracy: number }, reason?: string) {
  const adminClient = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  // Check if already checked in today
  const { data: existingLog } = await adminClient
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (existingLog) {
    return { success: false, error: "Bạn đã check-in ngày hôm nay rồi!" };
  }

  // Determine status based on time (e.g., late if after 08:30)
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const isLate = (hours > 8) || (hours === 8 && minutes > 30);
  
  const status = isLate ? "LATE" : "ON_TIME";

  const { error } = await adminClient.from("attendance_logs").insert([{
    user_id: user.id,
    date: today,
    check_in_time: now.toISOString(),
    check_in_location: locationData ? JSON.stringify(locationData) : null,
    status: status,
    notes: reason || null
  }]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
  
  return { 
    success: true, 
    message: isLate ? "Bạn đã check-in trễ." : "Check-in thành công. Chúc bạn một ngày làm việc hiệu quả!" 
  };
}

export async function checkOut(locationData?: { lat: number, lng: number, accuracy: number }, reason?: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  // Get today's log
  const { data: existingLog } = await adminClient
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (!existingLog) {
    return { success: false, error: "Bạn chưa check-in hôm nay!" };
  }

  if (existingLog.check_out_time) {
    return { success: false, error: "Bạn đã check-out hôm nay rồi!" };
  }

  const now = new Date();
  const hours = now.getHours();
  const isEarlyLeave = hours < 17;

  let newStatus = existingLog.status;
  if (isEarlyLeave && existingLog.status === "ON_TIME") {
    newStatus = "EARLY_LEAVE";
  }

  const updateData: any = {
    check_out_time: now.toISOString(),
    check_out_location: locationData ? JSON.stringify(locationData) : null,
    status: newStatus,
    updated_at: now.toISOString()
  };

  if (reason) {
    updateData.notes = existingLog.notes ? `${existingLog.notes} | Ra: ${reason}` : `Ra: ${reason}`;
  }

  const { error } = await adminClient
    .from("attendance_logs")
    .update(updateData)
    .eq("id", existingLog.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");

  return { 
    success: true, 
    message: isEarlyLeave ? "Bạn đã check-out sớm. Vui lòng báo cáo lý do với quản lý!" : "Check-out thành công. Hẹn gặp lại ngày mai!" 
  };
}

export async function getMyAttendanceToday() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, data: null };

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const { data } = await adminClient
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  return { success: true, data };
}

export async function getAttendanceHistory(dateString: string) {
  const adminClient = createAdminClient();
  
  const { data: logs, error: logsError } = await adminClient
    .from("attendance_logs")
    .select("*")
    .eq("date", dateString)
    .order("check_in_time", { ascending: false });

  if (logsError) return { success: false, error: logsError.message };

  if (!logs || logs.length === 0) {
    return { success: true, data: [] };
  }

  const userIds = logs.map(log => log.user_id).filter(Boolean);
  
  const { data: usersData, error: usersError } = await adminClient
    .from("users")
    .select("id, full_name, employee_code, note")
    .in("id", userIds);

  if (usersError) return { success: false, error: usersError.message };

  const usersMap = new Map();
  if (usersData) {
    usersData.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  const enrichedLogs = logs.map(log => ({
    ...log,
    users: usersMap.get(log.user_id) || null
  }));

  return { success: true, data: enrichedLogs };
}
