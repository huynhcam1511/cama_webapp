# CAMA Wedding Studio - Web App PWA

Dự án Hệ thống quản trị nội bộ cho CAMA Haute Couture.

## 🛠 Yêu Cầu Cài Đặt
Hệ thống máy tính của bạn cần cài đặt **Node.js** (phiên bản 18.x hoặc 20.x). 
*Bạn có thể tải Node.js tại: [nodejs.org](https://nodejs.org/)*

## 🚀 Hướng Dẫn Chạy Dự Án
1. Mở Terminal (PowerShell hoặc Command Prompt) tại thư mục `CAMA WEBAPP`.
2. Cài đặt các thư viện (chỉ làm lần đầu):
   ```bash
   npm install
   ```
3. Khởi động môi trường phát triển (Development Server):
   ```bash
   npm run dev
   ```
4. Truy cập `http://localhost:3000` trên trình duyệt để xem giao diện.

## 🗄️ Cấu Hình Database (Supabase)
Dự án yêu cầu kết nối với Supabase.
Vui lòng tạo file `.env.local` tại thư mục gốc với nội dung:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Các file SQL để tạo database (Giai đoạn 1) đã được đặt sẵn trong thư mục `supabase/migrations/`.
