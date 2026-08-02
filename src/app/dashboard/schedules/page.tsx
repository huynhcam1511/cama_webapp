import { redirect } from "next/navigation";

export default function SchedulesRedirectPage() {
  // Tự động chuyển hướng về trang Lịch nhân sự khi người dùng truy cập /dashboard/schedules
  redirect("/dashboard/schedules/staff");
}
