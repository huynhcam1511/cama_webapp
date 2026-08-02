# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & RLS) - CAMA WEDDING STUDIO

Cơ sở dữ liệu PostgreSQL trên Supabase bao gồm **30 bảng chính** phục vụ toàn bộ nghiệp vụ studio.

---

## 1. DANH SÁCH 30 BẢNG CƠ SỞ DỮ LIỆU

### A. Nhóm Tài Khoản & Phân Quyền
1. `profiles`: Hồ sơ người dùng kết nối Supabase Auth (`auth_user_id`, `employee_id`, `email`, `role_id`, `active`).
2. `employees`: Thông tin nhân viên (`employee_code`, `full_name`, `phone`, `department_id`, `position_id`, `start_date`, `active`).
3. `departments`: Phòng ban (Lễ tân, Ekip Chụp, Makeup, Kho trang phục, Kế toán).
4. `positions`: Chức vụ.
5. `roles`: Vai trò hệ thống (`ADMIN`, `MANAGER`, `STAFF`).
6. `modules`: Danh sách các module chức năng (code, display_name, group_code, route, sort_order).
7. `role_permissions`: Quyền mặc định theo vai trò (`can_view`, `can_create`, `can_update`, `can_delete`).
8. `user_permission_overrides`: Quyền ghi đè riêng cho từng nhân viên.

### B. Nhóm Khách Hàng & Tư Vấn
9. `customers`: Thông tin khách hàng (`customer_code`, `full_name`, `phone`, `wedding_date`, `assigned_employee_id`, `status`).
10. `leads`: Khách hàng tiềm năng (`source`, `interested_services`, `budget`, `status`, `next_follow_up_at`).
11. `appointments`: Lịch hẹn tư vấn / thử váy với khách hàng.

### C. Nhóm Hợp Đồng & Dịch Vụ
12. `service_categories`: Danh mục dịch vụ (Gói chụp studio, Gói ngày cưới, Cho thuê trang phục,...).
13. `services`: Chi tiết bảng giá dịch vụ.
14. `contracts`: Hợp đồng Studio (`contract_code`, `customer_id`, `signed_at`, `wedding_date`, `total_amount`, `final_amount`, `deposited_amount`, `remaining_amount`, `status`).
15. `contract_items`: Chi tiết các hạng mục trong hợp đồng.
16. `payments`: Phiếu thanh toán / Đặt cọc của khách hàng (`payment_code`, `amount`, `payment_method`, `paid_at`, `attachment_url`).

### D. Nhóm Kế Toán & Thu Chi
17. `expense_receipts`: Phiếu thu / Phiếu chi hàng ngày (`receipt_code`, `type`, `category_id`, `amount`, `transaction_at`, `description`, `attachment_url`).

### E. Nhóm Lịch & Công Việc
18. `work_events`: Lịch làm việc tổng hợp (Chụp ảnh, Makeup, Ngày cưới, Lấy váy, Trả váy, Nghỉ phép,...).
19. `tasks`: Việc cần làm / Giao việc phát sinh cho nhân viên.

### F. Nhóm Kho Trang Phục (Váy, Vest, Suit, Phụ Kiện)
20. `garment_categories`: Danh mục trang phục (Váy cưới, Váy tiệc, Vest, Suit, Phụ kiện).
21. `garments`: Chi tiết trang phục (`garment_code`, `barcode_value`, `name`, `size`, `color`, `purchase_price`, `current_rental_price`, `status`, `usage_count`, `storage_location`, `cover_image_url`).
22. `garment_images`: Thư viện ảnh chi tiết trang phục.
23. `garment_bookings`: Lịch đặt giữ trang phục theo hợp đồng (Ngăn chặn trùng lịch).
24. `inventory_movements`: Nhật ký xuất nhập/chuyển trạng thái trang phục (Nhập kho, Soạn đồ, Xuất thuê, Trả về, Chuyển giặt, Giặt xong, Chuyển sửa, Sửa xong, Thất lạc, Thanh lý).
25. `garment_maintenance`: Bảo trì, giặt ủi & sửa chữa trang phục.

### G. Nhóm Nhân Sự & Chấm Công
26. `shifts`: Danh mục ca làm việc (Sáng, Chiều, Cả ngày).
27. `attendance`: Chấm công vị trí GPS (`employee_id`, `work_date`, `check_in_at`, `check_out_at`, `check_in_latitude`, `check_in_longitude`, `check_in_distance_meters`, `check_in_photo_url`, `status`).
28. `leave_requests`: Đơn xin nghỉ phép / làm thêm.

### H. Nhóm Hệ Thống & Nhật Ký
29. `audit_logs`: Nhật ký theo dõi biến động hệ thống (`actor_user_id`, `actor_email`, `module_code`, `table_name`, `record_id`, `action`, `old_data`, `new_data`, `ip_address`, `user_agent`).
30. `system_settings`: Cấu hình hệ thống (Tọa độ GPS Studio, bán kính chấm công cho phép, thông tin studio).

---

## 2. QUY TẮC RLS (ROW LEVEL SECURITY)
- Tất cả các bảng đều bật `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`.
- Chính sách chung:
  - `ADMIN`: Đọc/Ghi toàn bộ.
  - `STAFF` / `MANAGER`: Chỉ có quyền `SELECT` nếu có `can_view = true` cho module tương ứng; chỉ có quyền `INSERT/UPDATE` nếu `can_create / can_update = true`.
  - Không cho phép `DELETE` trực tiếp qua RLS client trừ tài khoản `ADMIN`.
