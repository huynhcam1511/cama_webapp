"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
  });

  if (error) {
    return { error: "Không thể gửi email khôi phục. Vui lòng thử lại sau." };
  }

  return { success: "Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư." };
}
