# ACTION PLAN: KẾT NỐI CHÍNH SÁCH NHÂN SỰ & LƯƠNG THƯỞNG VÀO DASHBOARD ĐO LƯỜNG TỰ ĐỘNG

> **Mục tiêu:** Chuyển hóa toàn bộ quy định văn bản (Quy định thời giờ & Lương, Cơ chế Hoa hồng - KPI, Phụ cấp job vận hành) thành các luồng dữ liệu tự động đo lường, đối soát và hiển thị trực tiếp trên Dashboard của **CAMA WEBAPP**.

---

## GIAI ĐOẠN 1: CẤU HÌNH KHUNG CA & TỰ ĐỘNG HÓA CHẤM CÔNG (ATTENDANCE)

### 1. Cấu hình bảng Ca làm việc (`shifts`)
- [ ] Thiết lập danh mục ca chuẩn theo Quy định chốt:
  - **Ca 1 (Sáng):** 08:00 – 16:00 (hoặc 17:00).
  - **Ca 2 (Chiều - Tối):** 13:00 – 21:00 (hoặc 22:00 đón khách).
  - **Ca Full-time:** 08:00 – 21:00 (nghỉ trưa & tối 2-3 tiếng).
- [ ] Thiết lập quy tắc kiểm tra chấm công:
  - Cho phép dung sai check-in (ví dụ: ±15 phút).
  - Tự động gắn cờ `Đúng giờ`, `Đi muộn`, `Về sớm`.
  - Giới hạn ngày nghỉ chuẩn: 02 ngày/tháng (hoặc 04 ngày theo PA1).

### 2. Dashboard Chấm công theo thời gian thực
- [ ] Hiển thị trực quan tỷ lệ chuyên cần theo phòng ban (Kinh doanh, Vận hành, Marketing).
- [ ] Tự động tổng hợp số công thực tế trong tháng để làm dữ liệu đầu vào cho Bảng lương.

---

## GIAI ĐOẠN 2: KÍCH HOẠT ĐO LƯỜNG KPI & HOA HỒNG TỰ ĐỘNG (KPI & COMMISSION)

### 1. Gán chỉ tiêu KPI theo kỳ (`kpi_assignments`)
- [ ] Thiết lập Target doanh số cho team Kinh doanh (Sales) theo từng tháng.
- [ ] Kết nối dữ liệu thời gian thực từ module Hợp đồng (`STUDIO_CONTRACTS`) & Dòng tiền (`CASHFLOW`):
  - Doanh thu hợp đồng ký mới (`CONTRACT_REVENUE`).
  - Thực thu tiền cọc / thanh toán (`CASH_COLLECTED`).
  - Tỷ lệ chốt hợp đồng (`CONVERSION_RATE`).

### 2. Cơ chế tính Hoa hồng tự động theo bậc thang
- [ ] Lập trình công thức tính tỷ lệ % hoa hồng lũy tiến theo doanh thu đạt được.
- [ ] Thiết lập chế tài vi phạm tự động:
  - Giữ lại hoặc hủy thưởng/hoa hồng đối với trường hợp tự ý nghỉ việc không báo trước 30 ngày theo quy định.

---

## GIAI ĐOẠN 3: ĐO LƯỜNG PHỤ CẤP JOB & BẢO ĐẢM TRẢ LƯƠNG ĐỘNG (DYNAMIC PAYROLL)

### 1. Tích hợp Module Ghi nhận Job Vận hành (`Operations / Take Care`)
- [ ] Tạo form/nút xác nhận hoàn thành công việc kèm theo từng Đơn hàng/Hợp đồng:
  - **Take care cô dâu nội thành:** +300.000 VNĐ/lần.
  - **Sắp đồ / Chuẩn bị trang phục tiệc & chụp:** +50.000 VNĐ/cặp.
  - **Ghi nhận tiền Tip/Bo:** Ghi nhận 100% về nhân sự thực hiện (cửa hàng không thu).
- [ ] Tự động tổng hợp số lượt job phát sinh của từng nhân sự trong tháng.

### 2. Tự động hóa Bảng Lương (`/dashboard/payroll`)
- [ ] Xóa bỏ toàn bộ dữ liệu mẫu (mock data), kết nối dữ liệu sống từ Database:
  - **Lương cơ bản:** Tự động áp theo diện Thử việc (4.5M - 7M) hoặc Chính thức (5.5M - 8.5M) dựa trên hồ sơ nhân sự.
  - **Phụ cấp Job:** Tự động cộng dồn các lượt take care + soạn đồ.
  - **Hoa hồng & Thưởng KPI:** Lấy số liệu tự động từ module KPI.
  - **Khấu trừ:** Tự động trừ các lỗi phát sinh từ Biên bản sự cố đơn hàng (váy rách, lỗi trang phục, phạt nội quy...).
- [ ] Xuất phiếu lương chi tiết từng nhân sự và báo cáo Tổng quỹ lương cho Ban Giám Đốc.

---

## GIAI ĐOẠN 4: ĐỐI SOÁT & DASHBOARD TỔNG QUAN GIÁM SÁT (EXECUTIVE OVERVIEW)

- [ ] Tạo Dashboard widget tại trang chủ `/dashboard`:
  - Biểu đồ quỹ lương thực tế vs. Doanh thu toàn shop.
  - Tiến độ hoàn thành KPI tháng của từng bộ phận.
  - Cảnh báo nhân sự sắp hết hạn thử việc để xét duyệt chính thức.
- [ ] Quy trình chốt lương và khóa kỳ (Lock Period) cuối tháng có phê duyệt của Ban Quản Lý.
