"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setIsPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      setError("Không thể kết nối với Google: " + error.message);
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-[420px] w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <h1 className="text-3xl font-bold tracking-tight relative z-10">CAMA</h1>
          <p className="text-slate-300 text-sm mt-1 relative z-10">Haute Couture Management</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Đăng nhập hệ thống</h2>
            <p className="text-sm text-slate-500 mt-1">Sử dụng tài khoản Gmail công ty để tiếp tục</p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isPending}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>Đăng Nhập bằng Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
