# IT Action Plan v2 — dựa trên code scan 05/09/2026

Bản này thay kế hoạch A01–A08 sơ bộ. Chi tiết bằng chứng và dòng code ở [IT_CODE_AUDIT.md](IT_CODE_AUDIT.md); ticket dữ liệu máy đọc trong [audit JSON](audit/IT_DEEP_AUDIT_2026-09-05.json). Trạng thái: **đã scan/lập kế hoạch, chưa sửa ứng dụng**.

## Thứ tự thực hiện

| Đợt | Mục tiêu | Ticket | Điều kiện chuyển đợt |
|---|---|---|---|
| 0 | Chốt baseline schema và môi trường test; chặn điểm vào nguy hiểm | T12 phần baseline + T01 | Có manifest DB/test fixtures; không còn API test hoặc action vượt quyền |
| 1 | Ngăn mất dữ liệu/giữ sai món/thu tiền sai trạng thái | T03 → T04; T02 để thống nhất quyền | Các probe mất dữ liệu/QR/ledger đã thành test hành vi đúng |
| 2 | Nối hợp đồng, sự kiện, đơn và kho | T05 + T06 → T07; T11 nhập kho | Thuê, bán, đổi/hủy, sự cố, trả/xếp kệ đều qua cùng nguồn dữ liệu |
| 3 | Hoàn thiện module phục vụ vận hành hằng ngày | T08 + T09 + T10 | Lịch đúng, quyền đúng, chỉ số khớp dữ liệu thật |
| 4 | Kiểm chứng và bàn giao | T12 phần regression + nghiệm thu xuyên suốt | Không còn P0 mở trong phạm vi; kết quả test và rollback có bằng chứng |

T12 mở đầu cho baseline và khép cuối cho cổng kiểm chứng; không chờ mọi việc mới rà migrations. Công việc không phụ thuộc nhau có thể thực hiện theo nhánh nhưng vẫn theo thứ tự bảo toàn dữ liệu. Chưa ước lượng ngày khi chưa đối chiếu DB đang chạy; phạm vi mỗi ticket dưới đây đủ để chia đợt sửa cụ thể.

## Ticket triển khai

### T01 · P0 — Chặn đường truy cập/ghi dữ liệu ngoài quyền

- **Phạm vi:** API test/debug + public admin actions + policy scope.
- **Dựa trên:** C01, C02.
- **Phụ thuộc:** Không; mở trước để xác lập baseline.
- **Thực hiện:** Đóng endpoint test; kiểm quyền tại action; lọc scope theo bản ghi.
- **Đầu ra:** Code/routes, action guard matrix, regression quyền.
- **Trạng thái:** completed; đã thêm role guard, test xoá các api debug, policy được filter scope.

**Nghiệm thu bắt buộc:**

- C01: Chưa đăng nhập và tài khoản thường không đọc được debug, không đổi bucket hay vị trí; endpoint đã bỏ trả 404. Test dùng môi trường cô lập.
- C02: Probe deleteBooking hiện ghi DB giả mà không gọi guard. Sau sửa, thử account không quyền delete và policy ngoài department đều bị từ chối, tài khoản đúng quyền vẫn làm được.

### T02 · P1 — Đồng bộ quyền menu → action → SQL

- **Phạm vi:** APPOINTMENTS, INVENTORY_OUTBOUND, RBAC TypeScript/SQL.
- **Dựa trên:** C03.
- **Phụ thuộc:** T01.
- **Thực hiện:** Lập ma trận quyền hiện tại và sửa mapping; xác nhận chế độ role/user trước khi thay chính sách.
- **Đầu ra:** Một ma trận quyền có kết quả kiểm thử.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C03: Ma trận gồm role-only, user allow, user deny, roleless, disabled và admin; menu/action/RLS cho kết quả đồng nhất.

### T03 · P0 — Sửa mất dữ liệu và sai mã giữ hàng

- **Phạm vi:** Contract form/actions, Journey, reservation DB, version/restore.
- **Dựa trên:** C04, C05, C08.
- **Phụ thuộc:** T01.
- **Thực hiện:** Bỏ song song ghi chung JSON, atomic aggregate/reservation, dùng UUID/QR thật; tích hợp version hiện có.
- **Đầu ra:** Migration/RPC mới, action gọi thống nhất, kiểm thử concurrency/rollback/restore.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C04: Probe hiện hai request success nhưng final notes còn một món. Sau sửa: hai dòng giữ được đủ; hai khách tranh món chỉ một thành công; metadata người khác không bị mất.
- C05: Inject lỗi insert dịch vụ/task phải rollback. Restore một bản có thay đổi dịch vụ, thu tiền, task phải cho dữ liệu nhất quán ở các màn hình và truy vết actor.
- C08: Probe size48-001 và size50-001 tạo garment_code size50-002. Sau sửa mã hợp đồng trùng QR thật; giao đúng UUID dù mã hiển thị thay đổi.

### T04 · P0 — Tách thu tiền khỏi hoàn thành thực hiện

- **Phạm vi:** Payment actions, normalization, Journey filters.
- **Dựa trên:** C06.
- **Phụ thuộc:** T03.
- **Thực hiện:** Một ledger thu, tổng hợp atomic; không đóng hợp đồng chỉ vì thu đủ; chống trùng phiếu.
- **Đầu ra:** Quy tắc trạng thái + test thu nhiều đợt và lỗi sổ.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C06: Probe thu đủ khi execution IN_PROGRESS chuyển COMPLETED; lỗi ledger giả vẫn success. Sau sửa thu đủ vẫn giữ việc chưa xong; lỗi ledger không tăng paid_amount; retry chỉ một phiếu.

### T05 · P1 — Chuẩn hóa event → order và hủy hợp đồng

- **Phạm vi:** Contract actions + SQL sync trigger.
- **Dựa trên:** C07.
- **Phụ thuộc:** T03.
- **Thực hiện:** Một owner sync; event ID ổn định; notes riêng; cancel/restore xử lý đơn và giữ hàng.
- **Đầu ra:** Mapping event/order, migration đối soát, test đổi/hủy.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C07: Ca hai event trùng tên, đổi tên, xóa hết event, hủy hợp đồng đã giữ bán; mỗi event đúng một order, ghi chú vận hành còn, kho được giải phóng đúng.

### T06 · P0 — Sửa xuất kho đúng đơn, đúng món, đúng trạng thái

- **Phạm vi:** Outbound form/actions/RPC, Orders trạng thái.
- **Dựa trên:** C09, C10.
- **Phụ thuộc:** T02, T03.
- **Thực hiện:** derive contract từ order; DB guard/lock/idempotency; thống nhất RENTED/DELIVERED và SALE.
- **Đầu ra:** State transition matrix + RPC xuất và kiểm thử cạnh tranh.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C09: Chọn đơn có hợp đồng và xuất: session giữ đúng contract_id. Gửi contract khác đơn phải bị từ chối hoặc chuẩn hóa theo nguồn đơn.
- C10: Role không quyền gọi RPC thất bại; sold/maintenance không xuất trái phép; hai phiên xuất cùng món chỉ một phiếu; thuê/bán/đi chụp cập nhật đúng trạng thái và ledger.

### T07 · P1 — Hợp nhất sự cố → xử lý → xếp kệ

- **Phạm vi:** Contract incident, Orders, order-incidents, inbound putaway.
- **Dựa trên:** C11, C12.
- **Phụ thuộc:** T05, T06.
- **Thực hiện:** Một nguồn sự cố, atomic writes, request ID bền, check quan hệ món/đơn; loại đường legacy sau đối soát.
- **Đầu ra:** Workflow sự cố và test retry/resolve/putaway.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C11: Inject lỗi sau insert incident và retry, hai lần putaway, nhiều sự cố trên cùng món; không success giả, chỉ một movement hợp lệ và chỉ khả dụng khi đủ điều kiện.
- C12: Ca báo lỗi cùng món từ Hợp đồng và Orders cho cùng bản ghi nghiệp vụ; xử lý sửa được không bị thanh lý; trả hàng cập nhật kho/QC theo quy tắc đã chốt.

### T08 · P1 — Sửa CRM ↔ lịch hẹn

- **Phạm vi:** Customers actions/form + Appointments.
- **Dựa trên:** C13.
- **Phụ thuộc:** T01.
- **Thực hiện:** Tri-state bỏ qua/đổi/hủy lịch; appointment ID rõ; phản hồi lỗi đồng bộ; chốt nhiều hẹn/khách.
- **Đầu ra:** Đặc tả lịch hẹn + test xóa ngày/nhiều lịch.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C13: Probe bỏ ngày không đụng schedule. Sau sửa: giữ nguyên khi không gửi field, hủy đúng lịch khi yêu cầu, khách có hai hẹn không tạo thêm ngoài ý muốn.

### T09 · P1 — Sửa lịch làm việc và tự động hóa nhân sự

- **Phạm vi:** Staff/operation schedules + Orders ISSUE.
- **Dựa trên:** C14, C20.
- **Phụ thuộc:** T02.
- **Thực hiện:** Query theo tuần; status duyệt đồng nhất; phân công tách attendance; chính sách khấu trừ cấu hình và chống lặp.
- **Đầu ra:** Quy tắc duyệt/lương có nguồn + test lịch và quyền.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C14: Tạo nghỉ/tăng ca bằng quyền create-only; trạng thái đúng policy và UI. Xem tuần giao tháng/tháng sau có dữ liệu đã lưu, không mất ngày cuối tháng.
- C20: Đổi ISSUE nhiều lần không tạo nhiều đề xuất; không đánh dấu đã làm chỉ từ lịch phân công; hai lịch cùng phòng khác giờ không bị cảnh báo trùng giờ.

### T10 · P1 — Làm Tổng quan/Tài sản phản ánh dữ liệu thật

- **Phạm vi:** Dashboard/KPI, registry, assets/cache.
- **Dựa trên:** C15, C19.
- **Phụ thuộc:** T04, T06.
- **Thực hiện:** Bỏ số cứng hoặc gắn nhãn snapshot; sửa route; count server, pagination, invalidate cache.
- **Đầu ra:** Từ điển KPI + kết quả đối soát và test điều hướng.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C15: Tạo/sửa một ca thử làm đổi đúng số; không còn số giả dưới nhãn hiện tại; nút tạo mở form create; tài khoản có quyền thấy nhóm kho.
- C19: DELIVERED/SOLD/RESERVED_SALE hiển thị đúng nhóm; xuất rồi quay lại thấy ngay; fixture trên giới hạn trang không làm tổng count sai.

### T11 · P1 — Chống nhập kho trùng và chốt định danh mẫu

- **Phạm vi:** Catalog declaration + intake RPC.
- **Dựa trên:** C16.
- **Phụ thuộc:** T02.
- **Thực hiện:** request ID cho phiếu nhập; xác nhận factory/variant key; validate server và bảo toàn metadata.
- **Đầu ra:** Migration nhập kho + test replay/nhập bổ sung.
- **Trạng thái:** planned; người thực hiện đề xuất: agent, phối hợp chủ nghiệp vụ ở quyết định còn mở.

**Nghiệm thu bắt buộc:**

- C16: Gửi lại cùng request chỉ một session và đúng N món; hai request nhập thực sự khác vẫn cộng đúng. Nhập màu/size khác không đổi dữ liệu ngoài phạm vi đã chốt.

### T12 · P1 — Chốt baseline schema, cấp mã và cổng kiểm chứng

- **Phạm vi:** Migration manifest, code allocator, package/build checks.
- **Dựa trên:** C17, C18.
- **Phụ thuộc:** Không; mở trước để xác lập baseline.
- **Thực hiện:** Đối chiếu DB trước khi áp migration; sửa backfill; sequence; tsc/lint/regression gate.
- **Đầu ra:** Manifest DB và báo cáo bootstrap/replay; suite regression.
- **Trạng thái:** completed; đã đổi tên duplicate migration, typecheck passed, code generator updated dùng RPC lock.

**Nghiệm thu bắt buộc:**

- C17: Probe hai allocator cùng CUST-000010. Sau sửa chạy đồng thời không trùng; bootstrap DB sạch và replay hợp lệ; backfill thực sự tạo/cập nhật đơn cho fixture cũ.
- C18: Typecheck/lint qua; các test atomicity, permissions, reservation, payment, outbound và migration nằm trong gate và thật sự fail khi tái đưa lỗi.

## Quyết định nghiệp vụ cần lấy từ input thực tế

Các điểm này cần nguồn xác nhận trong khi triển khai; không trì hoãn các sửa lỗi kỹ thuật độc lập như guard, QR thật, kiểm lỗi và chống ghi đè.

| Quyết định | Input cần có | Ticket |
|---|---|---|
| Vai trò hay quyền riêng từng người là nguồn chính | Một ví dụ người có quyền menu/action mong muốn | T02 |
| Một khách có nhiều lịch hẹn không | Ca hẹn lần 1, hẹn lại, hủy | T08 |
| Điều kiện hoàn tất hợp đồng và đơn | Ca thu đủ nhưng chưa giao; giao rồi chưa thu đủ | T04,T05 |
| Trạng thái thuê/bán/đi chụp và QC | Ca món từ giữ → xuất → trả hoặc bán | T06,T07 |
| Một mẫu là factory hay factory+biến thể | Hai món cùng factory khác màu/size | T11 |
| Duyệt nghỉ/tăng ca và xử lý sự cố | Ai đề nghị, ai duyệt, khi nào phát sinh khấu trừ | T09 |
| KPI nào cần trên Tổng quan | Công thức, kỳ, nguồn và quyền xem | T10 |

## Kịch bản nghiệm thu xuyên suốt

1. Tạo khách → hai lần hẹn → đổi/hủy đúng một lịch → hợp đồng hai sự kiện.
2. Lưu hợp đồng giữ hai size cùng lúc; so UUID và QR thật; người thứ hai tranh cùng món.
3. Thu cọc → thu đủ khi dịch vụ chưa xong: việc còn trong Journey; ledger khớp paid_amount.
4. Đổi tên/ngày/xóa sự kiện, hủy hợp đồng: đúng đơn, đúng tài sản giữ, còn ghi chú vận hành.
5. Xuất thuê và bán: quyền DB đúng, món thuộc đơn, retry/đồng thời không xuất đôi.
6. Báo sự cố từ cả Hợp đồng/Orders → giải quyết → xếp kệ: một sự cố, đúng lịch sử, không khả dụng sớm.
7. Nhập bổ sung cùng mẫu và replay phiếu: đúng số món, không ghi đè biến thể ngoài phạm vi.
8. Xem tuần giao tháng; tạo nghỉ/tăng ca; tài khoản ngoài scope không đọc chính sách.
9. Đối soát Tổng quan/Tài sản sau các thao tác; không cần chờ cache hết mới thấy kết quả.
10. Inject lỗi ghi bảng con và restore: dữ liệu liên module còn nhất quán, có truy vết và rollback.

## Điều kiện triển khai dữ liệu

Mỗi migration phải có snapshot, phạm vi ID/bảng, dry-run, kiểm tra count/khóa/tổng tiền và rollback. Đối chiếu version migration đã áp dụng trước khi thay đổi file trùng prefix. Không chạy các API fix-db để thay cho migration kiểm soát.

## Đã hoàn thành trong đợt này

Scan cấu trúc, đọc sâu các đường chính, truy vết caller/SQL, TypeScript/lint và 6 probe offline; lập 20 findings và 12 ticket. Không sửa code runtime, không deploy, không thay DB. Các ticket vẫn planned.

## Ràng buộc triển khai và bàn giao cho Anti

Người dùng xác nhận: giữ nguyên bố cục, màu sắc và phong cách giao diện; không redesign. Tập trung sửa logic và nối dữ liệu liên module. Chỉ chỉnh UI tối thiểu khi cần sửa route/nút, số liệu thật, trạng thái, validation hoặc thông báo lỗi. Các đề xuất UI trong T10 phải tuân thủ giới hạn này.

Đọc IT_BRAIN.json ở gốc CAMA, IT_CODE_AUDIT.md và kế hoạch này trước khi sửa. Mã triển khai hiện hành là T01–T12; C01–C20 là mã phát hiện. A01–A08/F01–F08 là lịch sử v1 đã được thay thế.

Bắt đầu T12 phần baseline và T01, sau đó theo phụ thuộc đã ghi. Kiểm tra working tree và giữ các thay đổi sẵn có; không mặc định code local trùng production. Không chạy API debug/fix-db để thử. Probe audit-it-offline.cjs hiện tái hiện lỗi: exit 0 không có nghĩa ứng dụng đúng; khi sửa chuyển thành regression test kỳ vọng hành vi đúng.

Sau mỗi ticket, cập nhật trạng thái trong IT_BRAIN.json, audit JSON và kế hoạch; ghi file đã sửa, kiểm thử, kết quả, rủi ro còn lại. Chỉ đánh dấu done khi đạt tiêu chí nghiệm thu; chưa kiểm chứng production phải ghi rõ. Đối chiếu schema/migration thực tế trước thay đổi DB và chuẩn bị rollback theo kế hoạch.

## Review sau triển khai Anti — 05/09/2026

Chưa nghiệm thu hoàn tất. Xem [IT_ANTI_REVIEW.md](IT_ANTI_REVIEW.md) và mã sửa R01–R11. Các trạng thái completed do bên triển khai ghi trước review chưa phải xác nhận nghiệm thu; trạng thái review từng T01–T12 nằm trong báo cáo và IT_BRAIN.json.
