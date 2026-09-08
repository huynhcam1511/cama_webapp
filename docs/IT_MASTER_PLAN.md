# CAMA — Kế hoạch nghiệp vụ IT

Cập nhật: 05/09/2026, audit v2. Đọc [code audit sâu](IT_CODE_AUDIT.md) và [action plan v2](IT_AUDIT_ACTION_PLAN.md) để biết hiện trạng và việc sửa cụ thể. Khung nghiệp vụ dưới đây vẫn là đề xuất cần input thực tế; không thay thế bằng chứng code.

## Điểm vào và cách tiếp tục

Đọc [IT_BRAIN.json](../../IT_BRAIN.json), [audit/action plan](IT_AUDIT_ACTION_PLAN.md), rồi [sổ input](IT_INPUT_REGISTER.md). JSON giữ ID và trạng thái; MD giải thích quy trình và nghiệm thu. Khi đổi trạng thái công việc, cập nhật cả hai trong cùng đợt. Các BRAIN.json khác giữ nguyên phạm vi trước đây.

Tài liệu lưu trên đĩa không tự bảo đảm mọi chat mới đều tải ngữ cảnh. Câu mở đầu dùng lại: **“Đọc IT_BRAIN.json ở gốc CAMA và các tài liệu được liên kết; tiếp tục từ handoff, đối chiếu code hiện tại trước khi sửa.”**

## Toàn cảnh nghiệp vụ đề xuất

Khách hàng → lịch hẹn/tư vấn → hợp đồng với dịch vụ và sự kiện → hành trình theo dõi → đơn vận hành theo sự kiện → thực hiện/bàn giao → hoàn tất và đối soát.

Đây là flow làm việc để xác minh với người dùng. Không suy ra mọi khách phải đi qua lịch hẹn; code có hành trình tạo thủ công. Hành trình là lớp theo dõi, không mặc định là bước chặn trước khi sinh đơn.

| Nhánh xuyên suốt | Điểm nối | Kết quả cần kiểm chứng |
|---|---|---|
| Kho | Nhập mẫu/món → vị trí → giữ cho hợp đồng/sự kiện → xuất cho đơn | Đúng món, đúng thời gian, không giữ trùng |
| Thuê | Giao → nhận trả → QC → giặt/sửa nếu cần → khả dụng | Chỉ khả dụng khi đạt điều kiện đã chốt |
| Bán | Giữ bán → giao bán → kết thúc | Không tự đưa hàng đã bán về tồn khả dụng |
| Nhân sự | Nhu cầu đơn → phân công → lịch làm việc → hoàn tất | Không trùng lịch, có người chịu trách nhiệm |
| Tài chính | Hợp đồng → giao dịch thu → công nợ → đối soát | Tổng thu khớp giao dịch; hủy/hoàn tiền có quy tắc |
| Chính sách | Quy định có hiệu lực → điều kiện xử lý | Không biến mức ví dụ trong code thành chính sách |
| Tổng quan | Tổng hợp từ nguồn từng module | Chỉ số có công thức, kỳ và quyền xem |

## Ranh giới sở hữu dữ liệu

Dựa trên docs/DATA_INTEGRITY_ARCHITECTURE.md, cần kiểm chứng thực thi: Hợp đồng sở hữu cam kết, dịch vụ, sự kiện; Journey sở hữu tiến độ và userNotes; Orders thực hiện theo contract_id; Kho sở hữu trạng thái tài sản; Payments sở hữu giao dịch, paid_amount là tổng hợp. UUID là khóa liên kết; mã hiển thị không thay vai trò UUID.

Mỗi điểm bàn giao cần chốt: nguồn nào ghi, trường nào chỉ đọc, điều kiện chuyển, người chịu trách nhiệm, xử lý khi sửa/hủy và cách phục hồi. Read–merge–write không tự đảm bảo an toàn khi có hai người cập nhật cùng lúc.

## Phạm vi từng module

11 mục dưới đây được thấy trong ảnh và đối chiếu registry. Có route/code không đồng nghĩa đã chạy đúng production. Mục đích, input/output dưới đây là khung đề xuất; người phụ trách và state machine chưa được xác nhận.

### DASHBOARD — Tổng quan

- Route: `/dashboard`.
- Mục đích: Theo dõi kết quả và việc cần xử lý.
- Input: Số liệu các module.
- Output: Chỉ số và cảnh báo.
- Cần chốt: Định nghĩa chỉ số, kỳ báo cáo, quyền xem.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### CUSTOMERS — Khách hàng

- Route: `/dashboard/customers`.
- Mục đích: Quản lý hồ sơ khách.
- Input: Thông tin liên hệ, nhu cầu.
- Output: Hồ sơ dùng chung.
- Cần chốt: Quy tắc trùng khách, người phụ trách, nguồn khách.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### APPOINTMENTS — Lịch hẹn khách

- Route: `/dashboard/appointments`.
- Mục đích: Tổ chức cuộc hẹn.
- Input: Khách, mục đích, thời gian.
- Output: Kết quả hẹn và bước tiếp.
- Cần chốt: Đổi lịch, vắng hẹn, hẹn nhiều lần.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### STUDIO_CONTRACTS — Hợp đồng

- Route: `/dashboard/contracts`.
- Mục đích: Ghi nhận cam kết thương mại.
- Input: Khách, dịch vụ, sự kiện, tài sản, giá.
- Output: Hợp đồng, lịch thu, đơn vận hành.
- Cần chốt: Sửa/hủy, nhiều sự kiện, bán và thuê cùng hợp đồng.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### CUSTOMER_JOURNEY — Hành trình khách hàng

- Route: `/dashboard/customer-journey`.
- Mục đích: Theo dõi tiến độ thực hiện.
- Input: Hợp đồng, lịch, nhiệm vụ.
- Output: Tiến độ và ghi chú.
- Cần chốt: Ranh giới sửa thông tin với Hợp đồng; hành trình thủ công.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### ORDERS — Đơn hàng vận hành

- Route: `/dashboard/orders`.
- Mục đích: Thực hiện cam kết theo sự kiện.
- Input: Hợp đồng, sự kiện, người phụ trách.
- Output: Giao việc, bàn giao, sự cố.
- Cần chốt: Điều kiện hoàn tất, đồng bộ khi sửa/hủy hợp đồng.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### INVENTORY_LOCATIONS — Tài sản

- Route: `/dashboard/inventory/locations`.
- Mục đích: Tổng hợp tài sản thực tế theo món/nhóm, vị trí và trạng thái xuất/bảo trì/chờ kệ.
- Input: Vị trí và tài sản.
- Output: Tra cứu vị trí.
- Cần chốt: Quy tắc đếm tồn/khả dụng/đang xuất, nguồn trạng thái và cập nhật sau thao tác.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### GARMENT_CATALOG — Quản lý Nhập Kho

- Route: `/dashboard/inventory/catalog`.
- Mục đích: Khai báo mẫu và món vật lý.
- Input: Mẫu, size, số lượng, ảnh, vị trí.
- Output: Tài sản có mã và vị trí.
- Cần chốt: Phân biệt khai báo, nhập thực tế, putaway, nhập trả.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### INVENTORY_OUTBOUND — Quản lý xuất kho

- Route: `/dashboard/inventory/outbound`.
- Mục đích: Xuất tài sản theo chứng từ.
- Input: Đơn, tài sản, lý do xuất.
- Output: Phiếu xuất và thay đổi kho.
- Cần chốt: Giữ chỗ, giao, trả, QC, bán, thanh lý.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### STAFF_SCHEDULE — Lịch làm việc

- Route: `/dashboard/schedules/staff`.
- Mục đích: Bố trí nhân sự.
- Input: Nhân sự, ca và nhu cầu thực hiện.
- Output: Lịch phân công.
- Cần chốt: Trùng ca, đổi ca, liên kết lịch khách/đơn.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

### POLICIES — Chính sách & nội quy

- Route: `/dashboard/policies`.
- Mục đích: Tra cứu quy định vận hành.
- Input: Nội dung chính sách.
- Output: Quy định áp dụng.
- Cần chốt: Phiên bản, ngày hiệu lực, ai ban hành.
- Nghiệm thu đặc tả: một ca thật đi từ đầu vào đến đầu ra, có dữ liệu bắt buộc, người thao tác, trạng thái trước/sau và ít nhất một ngoại lệ; kiểm tra tác động sang module liên quan.

## Module hỗ trợ ngoài ảnh

Registry còn có tài chính, nhân sự, phân quyền, sự cố, marketing và báo cáo. Chúng cần được đưa vào khi flow chạm tới; chưa mở rộng thành dự án triển khai toàn bộ trong yêu cầu này. Nhãn “Tài sản” đang trỏ tới inventory/locations, “Quản lý Nhập Kho” tới inventory/catalog: cần xác nhận tên với nội dung người dùng mong đợi.

## Thứ tự hoàn thiện

Kế hoạch A01–A08 sơ bộ đã được thay bằng T01–T12 sau code scan. Thứ tự: T12 baseline + T01 quyền → T03 bảo toàn dữ liệu/QR + T04 thu tiền + T02 ma trận quyền → T05–T07 flow đơn/kho/sự cố + T11 nhập kho → T08–T10 lịch và tổng quan → T12 kiểm chứng. Xem action plan v2 để biết phụ thuộc và điều kiện hoàn thành từng ticket.

## Bộ ca nghiệm thu cần thực hiện

| Ca | Kết quả mong đợi cần chốt/kiểm chứng |
|---|---|
| Khách mới → hẹn → hợp đồng | Giữ cùng customer_id, không nhân đôi hồ sơ |
| Một hợp đồng nhiều sự kiện | Đơn đúng từng sự kiện, đổi ngày không tạo trùng |
| Thuê → giữ → xuất → trả | Đúng món, theo dõi thời gian, QC trước khả dụng |
| Bán đứt | Tồn và đơn khớp, không cho thuê món đã bán |
| Hủy/đổi dịch vụ sau giữ hàng | Chỉ giải phóng đúng tài sản, giữ lịch sử |
| Hai người sửa Hợp đồng/Journey | Không mất metadata và dịch vụ |
| Lỗi khi ghi bảng con | Không để bản ghi cha đã đổi nhưng con bị mất |
| Gửi lặp/xử lý ISSUE lặp | Không tạo đơn, phiếu hay đề xuất khấu trừ trùng |
| Người không có quyền | Từ chối tại server/database đúng phạm vi |
| Dashboard và công nợ | Khớp nguồn, không cộng hai lần dữ liệu dẫn xuất |

Các ca này chưa chạy trong audit hiện tại.

