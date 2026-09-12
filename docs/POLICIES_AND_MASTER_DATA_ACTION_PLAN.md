# KẾ HOẠCH TRIỂN KHAI (ACTION PLAN): MODULE CHÍNH SÁCH & CHUẨN HÓA DANH MỤC

**Ngày lập:** 2026-09-12
**Trạng thái:** Chờ triển khai (Pending)
**Mục tiêu:** 
1. Xây dựng module Chính sách (Policies) để lưu trữ và tra cứu nội quy, quy định.
2. Chuẩn hóa thiết kế Master-Detail cho toàn hệ thống: Danh sách (Table) -> Chi tiết (Form nửa trên là thông tin chung, nửa dưới là bảng/danh sách phụ hoặc lịch sử).
3. Thiết lập tiêu chuẩn lưu trữ dạng "Lịch sử phiên bản" thay vì Rich Text Editor.
4. Xây dựng hệ thống quản lý Danh mục (Master Data) để cấp nguồn cho các Dropdown.

---

## PHẦN 1: CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & MIGRATIONS)

### 1.1. Bảng Master Data (Danh mục dùng chung)
Cần có một cơ chế quản lý danh mục linh hoạt. Tùy chọn ưu tiên: Tách bảng độc lập để dễ scale hoặc gộp bảng `system_categories`.
- `document_types` (Loại văn bản: Quy định, Hướng dẫn...)
- `departments` (Phòng ban: Kế toán, Nhân sự...)
- `target_audiences` (Đối tượng áp dụng)

### 1.2. Bảng Policies (Chính sách - Thông tin chung)
- `id` (UUID, PK)
- `code` (Mã chính sách, auto-generated)
- `name` (Tên chính sách)
- `description` (Mô tả ngắn)
- `document_type_id` (FK)
- `department_id` (FK)
- `target_audience_id` (FK)
- `created_at`, `updated_at`, `deleted_at`

### 1.3. Bảng Policy Versions (Lịch sử các phiên bản)
- `id` (UUID, PK)
- `policy_id` (FK -> Policies)
- `version_name` (Tên phiên bản)
- `effective_date` (Ngày có hiệu lực - dùng để tính toán phiên bản hiện hành)
- `file_url` (Link file đính kèm Word/PDF)
- `notes` (Ghi chú chi tiết)
- `created_at`, `updated_at`

---

## PHẦN 2: CHUẨN HÓA LÕI API & BACKEND (ACTIONS)

### 2.1. API/Actions cho Master Data
- CRUD cơ bản cho các danh mục (phục vụ màn hình Admin setup).
- Helper function để fetch nhanh list dropdown cho các form.

### 2.2. API/Actions cho Policies
- `getPolicies(filters)`: Fetch danh sách (Kèm join để lấy tên phiên bản hiện hành dựa trên max `effective_date` <= now).
- `getPolicyById(id)`: Lấy thông tin chi tiết policy và toàn bộ `PolicyVersions` sắp xếp giảm dần theo ngày.
- `createPolicy(data)`: Tạo mới.
- `updatePolicy(id, data)`: Cập nhật thông tin chung.
- CRUD cho `PolicyVersions`.

---

## PHẦN 3: GIAO DIỆN NGƯỜI DÙNG (FRONTEND & UI/UX)

### 3.1. Giao diện Master (Danh sách)
- **Đường dẫn:** `/dashboard/policies`
- **Layout:** Dạng Table, hỗ trợ filter theo (Phòng ban, Loại văn bản). Cột "Phiên bản hiện hành" được tính logic lấy từ bảng con.

### 3.2. Giao diện Detail / Form chỉnh sửa
- **Đường dẫn:** `/dashboard/policies/[id]`
- **Nửa trên (Thông tin chung):** Input Name, Description. Dropdown Loại, Phòng ban, Đối tượng.
- **Nửa dưới (Danh sách phiên bản):** Table hiển thị các dòng Version.
  - Hỗ trợ Upload File / Dán link Word.
  - Chọn `effective_date` qua DatePicker.
  - Nút thêm dòng, xóa dòng, sửa dòng (có thể mở modal nhỏ hoặc inline edit).

### 3.3. Module Cấu hình Danh mục (Master Data)
- Cần một màn hình (VD: `/dashboard/settings/categories`) để admin có thể thêm/bớt các Hạng mục trong dropdown.

---

## KIỂM CHIẾU & RỦI RO (RISKS & CHECKLIST)
- [ ] **Data Integrity:** Đảm bảo khi xóa 1 Policy thì các Versions bị xóa mềm (Soft Delete) hoặc có constraint khóa ngoại chặt chẽ.
- [ ] **Cross-module:** Không ảnh hưởng đến module khác, tuy nhiên `departments` có thể sẽ được tái sử dụng ở module Nhân sự.
- [ ] **File Storage:** Cần setup Supabase Storage bucket `policy_documents` (hoặc Firebase) có chính sách RLS an toàn (ai được xem, ai được upload).
