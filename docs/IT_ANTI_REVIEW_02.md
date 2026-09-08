# Review Anti lần 2 — 05/09/2026

Kết luận: có bản sửa mới, nhưng chưa đạt nghiệm thu. Bản working tree đang không qua typecheck. Đây là kết quả kiểm tra code tại thời điểm review, không phải xác nhận database đang chạy đã được cập nhật.

## Những thay đổi đã ghi nhận

- Có RPC giữ đồ và ghi nhận thanh toán mới, có khóa dòng trong SQL.
- Hủy giữ đồ bán đã thêm điều kiện `status = RESERVED_SALE` (R03 cải thiện).
- Bộ sinh mã có bảng counter và UPSERT thay vì chỉ SELECT MAX.
- Lưu/đọc booking đã có guard APPOINTMENTS.
- Đã khôi phục tên migration tạo operation_schedules trước migration FK.

## Các việc phải sửa tiếp

| Mã | Mức | Bằng chứng và việc cần làm |
|---|---|---|
| V2-01 | P1 | `src/app/dashboard/contracts/actions.ts:1004` còn `) {` sau hàm thanh toán; dòng 1960 còn `}) {` sau hàm giữ đồ, kèm thân hàm cũ. TypeScript báo TS1128 tại cả hai vị trí. Xóa đúng phần dư, chạy typecheck lại. |
| V2-02 | P1 | `20260905000005_reserve_garments_atomic.sql:92,148` dùng `c.notes->...` và COALESCE TEXT với JSONB; `20260905000006_record_payment_atomic.sql:25,65` tương tự. Schema repo định nghĩa contracts.notes và payment_installments.notes là TEXT. Chuyển kiểu có xử lý dữ liệu cũ hoặc migrate schema nhất quán; kiểm thử RPC trên DB dựng từ migrations. |
| V2-03 | P1 | `20260905000004_fix_inventory_outbound_t06.sql:25` vẫn gọi has_module_permission với 3 đối số. Các định nghĩa repo chỉ nhận 2 đối số. Sửa chữ ký và kiểm thử bằng session người có/không có quyền. |
| V2-04 | P1 | RPC thanh toán trả kết quả retry chỉ gồm success/message (SQL:26); caller lại đọc notes, new_total_paid, receipt_code và truy cập v_meta.activities (actions.ts:969–993). Retry cùng request ID sẽ lỗi sau khi sửa lỗi schema. Trả cùng cấu trúc kết quả cho retry; khóa/unique request ID để chống hai request đồng thời. |
| V2-05 | P1 | Thanh toán vẫn có lần update metadata riêng sau RPC (actions.ts:996), nên chưa atomic toàn bộ. Request ID dự phòng dùng Date.now nên không ổn định khi gửi lại. Đưa trạng thái thanh toán, công nợ và activity vào cùng giao dịch, giữ ID từ thao tác gốc qua retry. |
| V2-06 | P1 | `src/app/dashboard/orders/actions.ts` không đổi so với review đầu: reportOrderIncident vẫn thiếu nối garment instance và chuỗi xử lý tồn kho đã nêu R05; chưa thể đóng R05/R11 chỉ dựa vào walkthrough. Kiểm thử báo lỗi → sửa → QC → nhập vị trí và đối chiếu trạng thái UI. |
| V2-07 | P2 | `src/app/dashboard/customers/actions.ts:54–55`: xóa booking yêu cầu cả APPOINTMENTS.delete và CUSTOMERS.delete. Chuẩn hóa theo quyền module nghiệp vụ; test tài khoản chỉ có quyền lịch hẹn. |

## Cổng nghiệm thu

1. Sửa V2-01 trước; chạy `node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false`. Lần review này exit 1 với hai TS1128. Không dùng kết quả typecheck pass của review đầu cho bản mới.
2. Dựng database thử từ migrations; chạy thực tế giữ đồ, thu tiền và xuất kho. Review này chỉ đối chiếu SQL với schema repo, chưa thực thi migration hay thay đổi production.
3. Test retry thu tiền cùng ID và hai request đồng thời: chỉ một giao dịch, metadata nhất quán; giả lập lỗi giữa chừng phải rollback.
4. Test giữ lại món cũ không mất hoặc bọc sai cấu trúc JSON; tồn một món với hai yêu cầu không cấp trùng; hủy hợp đồng không đưa món SOLD về AVAILABLE.
5. Chạy lại acceptance R01–R11 và T01–T12, ghi bằng chứng cho từng mục. Những mục không được nêu là đã đạt trong review này vẫn chưa được xác nhận đóng.
6. Walkthrough mới của Anti còn ghi T09, T10, T11 đang chờ. T08 phải kiểm thử xóa ngày hẹn và nhiều lịch hẹn, không chỉ cắt chuỗi ISO.

Giữ nguyên yêu cầu của người dùng: không đổi thiết kế UI; sửa logic, quyền, liên kết dữ liệu và giao dịch. Review này chỉ cập nhật tài liệu, không sửa mã ứng dụng.
