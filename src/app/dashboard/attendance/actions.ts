"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkIn(locationData?: { lat: number, lng: number, accuracy: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const today = new Date().toISOString().split("T")[0];

  // Check if already checked in today
  const { data: existingLog } = await supabase
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

  const { error } = await supabase.from("attendance_logs").insert([{
    user_id: user.id,
    date: today,
    check_in_time: now.toISOString(),
    check_in_location: locationData ? JSON.stringify(locationData) : null,
    status: status
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

export async function checkOut(locationData?: { lat: number, lng: number, accuracy: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const today = new Date().toISOString().split("T")[0];

  // Get today's log
  const { data: existingLog } = await supabase
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

  const { error } = await supabase
    .from("attendance_logs")
    .update({
      check_out_time: now.toISOString(),
      check_out_location: locationData ? JSON.stringify(locationData) : null,
      status: newStatus,
      updated_at: now.toISOString()
    })
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, data: null };

  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  return { success: true, data };
}

export async function getAttendanceHistory(dateString: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("attendance_logs")
    .select("*, users:user_id(full_name, employee_code, avatar_url)")
    .eq("date", dateString)
    .order("check_in_time", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
