# CODING GUIDELINES & ARCHITECTURE RULES
# CAMA WEBAPP (Next.js + Supabase)

## 1. Mức độ ưu tiên cao nhất: Optimistic UI
- **Tất cả** các Server Actions thực hiện thao tác biến đổi dữ liệu (mutation) như: Create, Update (Duyệt, Check, Chuyển trạng thái...), Delete đều **BẮT BUỘC** phải được xử lý ở Client Component thông qua `useOptimistic` kết hợp với `startTransition`.
- **Tuyệt đối KHÔNG** sử dụng `window.location.reload()` để tải lại trang sau khi gọi Server Action. Next.js tự động sync ngầm nếu API có gọi `revalidatePath`.
- **Mục tiêu:** Giao diện phản hồi ngay lập tức (instant feedback) 0ms độ trễ để mang lại trải nghiệm y hệt WebSockets của Firebase, trong khi vẫn bảo lưu tính bảo mật tuyệt đối của SSR & Postgres.

## 2. Server Actions & RBAC
- Luôn kiểm tra quyền truy cập (Permissions) và Auth ở cấp độ Server Action trước khi chọc vào Supabase.
- Module mới muốn được phân quyền thành công thì phải có Migration Script để chèn vào bảng `modules`.

## 3. UI/UX
- Giao diện phải cực kỳ chi tiết, nhiều màu sắc và nịnh mắt. Dùng Badge, Icons, và Micro-animations để tăng tương tác.
