# Sổ input thực tế và quyết định IT

Cập nhật: 05/09/2026. Không lưu dữ liệu nhận dạng khách hàng ở đây; dùng ID hoặc ví dụ đã ẩn thông tin khi ghi ca thực tế.

## Input đã nhận

| ID | Nguồn | Nội dung | Trạng thái |
|---|---|---|---|
| I001 | Người dùng, chat 05/09/2026 | Đang mở module và nhập từ thực tế; cần nhìn flow tổng và từng module, giữ ngữ cảnh qua chat | user_confirmed |
| I002 | Người dùng, chat 05/09/2026 | Tạo IT brain JSON và audit ra action plan | user_confirmed |
| I003 | Ảnh sidebar + registry | 11 mục điều hướng như master plan | observed; chưa chứng minh workflow |
| I005 | Người dùng, chat 08/09/2026 | Chính sách KPI, thưởng/phạt và hoa hồng áp dụng từ 01/09: 2% chia phòng váy+suit, 2% hoa hồng Hiền. Thưởng lên hẹn (30k), đơn váy (50k), view (100k/10k views, 30k/clip). Phạt chấm công 50k-100k. | user_confirmed |
| I006 | Người dùng, chat 08/09/2026 | Đổi luồng: Bỏ chọn sản phẩm trong Hợp đồng. Đơn hàng độc lập kho. Luồng kho: lúc làm đơn mới chụp ảnh -> nhập kho -> xuất kho. Yêu cầu làm đơn giản, review dropdown form nhập/xuất kho đồng nhất. | user_confirmed |

Chưa nhận ca giao dịch cụ thể, trường dữ liệu đang vướng, danh sách module đã nhập xong hay quy tắc trạng thái được chủ nghiệp vụ xác nhận trong chat này. (Trừ các chính sách vừa chốt ở I005, I006).

## Mẫu ghi mỗi input mới

- ID: I004 trở đi; ngày và nguồn.
- Module và bước trong flow tổng.
- Người thao tác/vai trò; mục tiêu thực tế.
- Tình huống và dữ liệu ví dụ đã ẩn thông tin.
- Hiện tại đang làm gì; kết quả mong muốn.
- Input bắt buộc/tùy chọn; quy tắc kiểm tra.
- Trạng thái trước → thao tác → trạng thái sau.
- Output; module nào nhận tiếp; ai được sửa dữ liệu này.
- Ngoại lệ: đổi/hủy, trùng, thiếu dữ liệu, làm lại, mất kết nối.
- Bằng chứng: đường dẫn/ảnh/ID ca thử; ngày kiểm chứng.
- Trạng thái: user_confirmed / code_observed / document_claim / proposed / needs_confirmation / runtime_verified.
- Quyết định liên quan Dxxx; finding Fxxx; action Axx; câu hỏi còn mở.

## Sổ quyết định

| ID | Quyết định | Trạng thái | Nguồn |
|---|---|---|---|
| D001 | Lưu brain JSON, audit và kế hoạch MD từ thực tế | user_confirmed | Chat hiện tại |
| D002 | IT_BRAIN.json là chỉ mục IT mới, giữ nguyên tài liệu lịch sử | proposed — cách tổ chức áp dụng trong baseline | Agent đề xuất |
| D003 | Gỡ chọn sản phẩm khỏi Hợp đồng. Đơn hàng độc lập Kho. Workflow kho: chụp ảnh -> nhập -> xuất tại thời điểm làm đơn. | user_confirmed | Chat 08/09/2026 |

Chưa chốt nguồn kho chuẩn (đang chờ chỉnh dropdown đồng nhất), state machine, điều kiện bắt buộc từ lịch hẹn sang hợp đồng, chính sách khấu trừ. Các chính sách hoa hồng (I005) đã được chốt và sẽ đưa vào cơ chế tính toán Dashboard/KPI.

## Bàn giao cuối mỗi chat

Ghi ngày; input/decision mới; file đổi; action hoàn tất và bằng chứng; việc còn mở; bước cụ thể tiếp theo. Đồng bộ handoff trong IT_BRAIN.json. Nếu sửa quyết định cũ, ghi quyết định thay thế và lý do, không xóa dấu vết.

### Baseline 05/09/2026

Đã tạo brain, master plan 11 module và flow liên module, audit F01–F08, backlog A01–A08. A01 hoàn tất ở mức tài liệu; A02–A08 chưa triển khai. Bước tiếp theo: A02/A04 về rủi ro và A06 với một ca thực tế xuyên Khách hàng → Hợp đồng → Đơn → Kho.


### Cập nhật sau yêu cầu scan kỹ code — 05/09/2026

I004 (user_confirmed): người dùng yêu cầu scan kỹ code trước khi lập action plan cụ thể. Đã thay backlog sơ bộ bằng C01–C20/T01–T12; lịch sử v1 được giữ trong IT_BRAIN.json và docs/audit/IT_AUDIT_ACTION_PLAN_v1.md. Typecheck và lint qua; 6 probe offline tái hiện lỗi, chưa production E2E. Bước tiếp theo là T12 baseline + T01, rồi T03. Quy tắc nghiệp vụ chưa có nguồn xác nhận vẫn để mở.
