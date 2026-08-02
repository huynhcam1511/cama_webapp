# TÀI LIỆU KIẾN TRÚC HỆ THỐNG - CAMA WEDDING STUDIO

## 1. TỔNG QUAN HỆ THỐNG
Hệ thống **CAMA WEDDING STUDIO** là ứng dụng web PWA quản trị toàn diện studio cưới, thay thế ứng dụng AppSheet/Google Sheets hiện tại nhằm khắc phục các hạn chế về giao diện, chi phí per-user và hiệu năng.

- **Mục tiêu**: Quản lý Khách hàng, Hợp đồng, Công việc, Kế toán, Kho váy/suit/phụ kiện (quét QR code), Nhân sự & Chấm công GPS.
- **Đối tượng sử dụng**: Admin, Manager, Nhân viên studio (Ekip chụp, Makeup, Lễ tân, Kho).
- **Thiết bị hỗ trợ**: PC Windows, macOS, iPhone (iOS Safari PWA), Android (Chrome PWA), Tablet.

---

## 2. CÔNG NGHỆ & THƯ VIỆN CỐT LÕI
- **Frontend**: Next.js (App Router), React, TypeScript strict mode.
- **Styling**: Tailwind CSS, CSS Variables, shadcn/ui.
- **Form & Validation**: React Hook Form, Zod schema validation.
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Supabase Realtime).
- **Phân quyền & Bảo mật**: 3-Tier Security (UI check, Server Component / Action check, PostgreSQL Row Level Security - RLS).
- **Quét mã vạch/QR**: BarcodeDetector API (native) + Fallback library `zxing` / `html5-qrcode`.
- **Chấm công GPS**: Browser Geolocation API + Công thức Haversine tính khoảng cách từ tọa độ máy chủ.
- **Lịch biểu**: FullCalendar / Custom React Calendar matrix.
- **Triển khai**: Vercel (Web App PWA) + Supabase Cloud.

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN (`src/`)

```
CAMA WEBAPP/
├── docs/                             # Tài liệu kiến trúc và ngữ cảnh dự án
│   ├── architecture.md
│   ├── database.md
│   ├── permissions.md
│   └── migration-from-appsheet.md
├── public/                           # Tài nguyên PWA icons, manifest
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── supabase/                         # Migration SQL, Policies, Seeds
│   ├── migrations/
│   ├── seed/
│   └── policies/
├── src/
│   ├── app/                          # Next.js App Router Pages & APIs
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Home Menu phân nhóm
│   │   │   ├── employees/
│   │   │   ├── permissions/
│   │   │   ├── garments/             # Kho váy & Quét QR
│   │   │   ├── contracts/
│   │   │   ├── customers/
│   │   │   ├── attendance/           # Chấm công GPS
│   │   │   └── accounting/
│   │   └── api/
│   ├── components/                   # UI components, layout, Navigation
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── navigation/               # BottomNav (Mobile), Sidebar (Desktop)
│   │   └── scanner/                  # Camera QR Code Scanner component
│   ├── lib/                          # Firebase/Supabase clients, helpers
│   │   ├── supabase/
│   │   ├── permissions/              # Logic kiểm tra RBAC
│   │   ├── geolocation/              # Haversine distance calculator
│   │   └── utils.ts
│   ├── modules/                      # Business logic theo domain
│   ├── types/                        # TypeScript interfaces & DB types
│   └── hooks/                        # Custom React Hooks
├── .env.example
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 4. NGUYÊN TẮC BẢO MẬT & DỮ LIỆU
1. **3 Lớp Kiểm Tra Quyền**:
   - **UI**: Ẩn/Hiện thẻ module, nút thao tác dựa vào `user_permissions`.
   - **Server / API**: Middleware và Server Action kiểm tra quyền truy cập trước khi thực thi.
   - **Database (RLS)**: Row Level Security của PostgreSQL ngăn chặn truy cập trái phép ở tầng cơ sở dữ liệu.
2. **Chống Xóa Cứng (Soft Delete)**:
   - Tất cả các bảng nghiệp vụ chính sử dụng `deleted_at`, `deleted_by`, `is_active`.
   - Chỉ duy nhất tài khoản `ADMIN` có nút xóa cứng trong các trường hợp bảo trì hệ thống.
3. **Nhật Ký Hệ Thống (Audit Logging)**:
   - Mọi hành động INSERT, UPDATE, DELETE (soft delete), RESTORE đều được tự động ghi lại vào bảng `audit_logs` gồm: `actor_user_id`, `actor_email`, `module_code`, `table_name`, `record_id`, `action`, `old_data`, `new_data`, `ip_address`, `user_agent`.
4. **Quản Lý Tệp Ảnh (Supabase Storage)**:
   - Tệp và ảnh váy/hợp đồng/chấm công chụp selfie được tự động nén, tạo thumbnail và lưu trữ tại Supabase Storage Buckets riêng biệt. Không lưu nhị phân vào DB.

---

## 5. CẤU HÌNH PWA & TRẢI NGHIỆM MOBILE
- Hỗ trợ Service Worker đăng ký cache assets tĩnh.
- Manifest chuẩn định nghĩa màu chủ đạo (Obsidian/Champagne), icon ứng dụng CAMA.
- Màn hình offline hiển thị thông báo mất mạng thân thiện.
- Giao diện di động tích hợp **Bottom Navigation Bar** cho phép làm việc bằng một tay thuận tiện.
