# CAMA Data Integrity Architecture

## Mục tiêu bất biến

Dữ liệu nghiệp vụ đã được người dùng nhập không được mất do sửa UI, đồng bộ liên module, migration hoặc thay đổi mã hiển thị. Mọi thay đổi phải truy được ai làm, lúc nào, giá trị trước và sau, đồng thời có đường rollback.

## Quyền sở hữu dữ liệu

- Sales/Hợp đồng sở hữu thông tin hợp đồng, sự kiện và dịch vụ đã chốt.
- Customer Journey sở hữu công việc và tiến độ trong `journey_data`; chỉ được merge `userNotes`, không được thay toàn bộ `contracts.notes`.
- Operations/Orders nhận bản sao tham chiếu theo `contract_id`; không phải nguồn chuẩn để sửa ngược hợp đồng nếu chưa có quy tắc đồng bộ rõ ràng.
- Accounting/Payments sở hữu giao dịch thu tiền. `paid_amount` là giá trị tổng hợp và phải khớp sổ giao dịch.
- Kho sở hữu trạng thái tài sản; mọi giữ/giao/trả phải tham chiếu hợp đồng và sự kiện ổn định bằng UUID.

## Quy tắc ghi dữ liệu

1. Dùng UUID làm quan hệ; mã `CONT-xxxxxx` chỉ là mã hiển thị và có thể đổi mà không ảnh hưởng bảng con.
2. Không lưu nhiều miền dữ liệu trong một JSON blob nếu cần cập nhật độc lập. Tách sự kiện, dịch vụ, thanh toán và version thành bảng chuẩn.
3. Trong giai đoạn còn dùng JSON chung, mọi cập nhật phải read–merge–write ở server và chỉ merge khóa thuộc module đó.
4. Ghi hợp đồng cùng bảng con phải nằm trong một database transaction.
5. Không xóa dữ liệu cũ trước khi bản thay thế đã được validate và transaction có thể rollback.

## Versioning bắt buộc

Mỗi lần tạo, sửa hoặc xóa phải append một version bất biến gồm:

- `entity_type`, `entity_id`, `version_number`;
- `action`, `actor_user_id`, `actor_name`, `created_at`;
- `old_data`, `new_data`, `change_summary`;
- `source_module`, `request_id` và mã migration nếu có.

Không cập nhật hoặc xóa version cũ. Màn hình lịch sử phải đọc từ version store này, không đọc từ mảng JSON có thể bị ghi đè.

## Migration gate

Trước khi chạy production:

1. Xuất snapshot các bảng bị tác động và checksum/count theo bảng.
2. Chạy dry-run, liệt kê chính xác ID và cột sẽ đổi.
3. Xác nhận không có `DELETE`, thay UUID hoặc cascade ngoài phạm vi.
4. Chạy trong transaction khi có thể.
5. So sánh count, khóa ngoại, tổng tiền và số dòng con sau migration.
6. Lưu báo cáo migration và câu lệnh rollback.

## Quy trình phục hồi sự cố

1. Ngừng ghi vào bản ghi bị ảnh hưởng.
2. Thu thập version/audit, snapshot, bảng con và dữ liệu dẫn xuất từ module liên quan.
3. Lập bản preview phục hồi, đánh dấu rõ dữ liệu chắc chắn và dữ liệu suy luận.
4. Người dùng duyệt preview.
5. Backup trạng thái hiện tại rồi phục hồi trong transaction.
6. Kiểm tra lại Hợp đồng, Customer Journey, Orders, Payments và Kho.

## Sự cố ngày 14/08/2026

`Customer Journey` đã ghi `{"userNotes":"..."}` đè lên toàn bộ `contracts.notes`. Migration đổi mã hợp đồng chỉ cập nhật `contract_code` và không phải nguyên nhân trực tiếp. Dữ liệu còn có thể đối chiếu từ `contract_services`, `payment_installments`, `orders` và `journey_data`; database lúc audit chưa có `contract_activities`, còn `audit_logs` không có version của hợp đồng này.
