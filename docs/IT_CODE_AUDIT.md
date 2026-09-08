# IT code audit sâu — 05/09/2026 — v2

## Kết luận

Ứng dụng đã có code thực thi cho các module đầu tiên, nhưng đường nhập dữ liệu thực tế còn các lỗi liên module cụ thể. Ưu tiên bảo vệ điểm vào dữ liệu, sửa ghi đè khi giữ hàng, dùng đúng UUID/QR và tách thu tiền khỏi hoàn thành công việc; sau đó nối xuất/trả/sự cố và các màn hình tổng hợp.

## Phạm vi và mức bằng chứng

- Scan cấu trúc 155 file TS/TSX/JS dưới src và 66 migration SQL, tổng 35.319 dòng; đã lưu path, checksum, bảng/RPC và route. Đây là kiểm kê cấu trúc toàn bộ, không phải tuyên bố đọc ngữ nghĩa từng dòng của 221 file.
- Đọc sâu route/page/client/action liên quan 11 mục trong ảnh, cùng RBAC/middleware, API test, payment, incident, version và các định nghĩa SQL mới nhất liên quan.
- Truy vết các caller quan trọng: lưu form nhiều món, báo sự cố từ Hợp đồng, chọn đơn xuất kho, xóa lịch hẹn, đăng ký nghỉ/tăng ca.
- Chạy các hàm TypeScript hiện tại được trích bằng AST với DB giả lập: 6 hành vi lỗi được tái hiện. Probe không gọi network, không đọc env và không thay dữ liệu thật.
- TypeScript exit 0; lint exit 0 có warnings hook dependencies/ảnh. Chưa build hoặc chạy browser E2E, chưa dựng DB sạch, chưa kiểm tra RLS/RPC trên production. Không gọi API debug/fix để thử tác động.
- Working tree vốn đã có nhiều thay đổi chưa commit; checksum trong manifest giúp đối chiếu bản code đã scan. Không đồng nhất code local với bản triển khai.

## Điều chỉnh so với v1

1. Tài sản hiện là asset overview thật trong inventory/locations, không chỉ cấu trúc vị trí.
2. Đã có migration contract_versions append-only và restore, nên việc cần làm là kiểm chứng coverage/actor/bảng con, không lập một version store mới từ đầu.
3. Đã có xuất kho RPC với transaction; vấn đề nằm ở quyền, trạng thái, quan hệ, chống lặp và tính nhất quán với Orders.
4. searchGarmentInstance kiểm AVAILABLE nhưng không thấy caller ở trang xuất hiện tại. Trang hiện tại chọn mọi món trên kệ; không kết luận UI chỉ xuất được AVAILABLE từ helper không dùng.
5. Hai helper search kho cũ không thấy caller UI; reportGarmentIncident legacy vẫn được modal hợp đồng gọi, nên phạm vi nguồn kho cũ cần xử lý là đường này trước.
6. ReturnScanner tồn tại nhưng không thấy được import vào trang hiện hành; không đánh dấu flow quét trả này đã hoạt động chỉ từ sự tồn tại file.

## Ma trận module và đường dữ liệu hiện tại

| Module | Đường xử lý đã truy vết | Vấn đề/đợt sửa |
|---|---|---|
| Tổng quan | page.tsx → client Supabase count + KPI component | Số cứng, route tạo sai, thiếu nhóm kho; C15/T10 |
| Khách hàng | customers-view/form → customers/actions → customers + operation_schedules | Guard, bỏ ngày hẹn, mã đồng thời; C02,C13,C17 |
| Lịch hẹn | appointments → SALE_BOOKING; xóa qua customers/actions | CUSTOMERS.view thay APPOINTMENTS; delete thiếu guard; C02,C03,C13 |
| Hợp đồng | contract-form → create/update/thu/giữ → contracts.notes + services + installments | C04–C08,C12; T03–T05,T07 |
| Hành trình | Journey actions → contracts.journey_data/notes + journey_tasks | Read–merge–write, delete/insert tasks, filter status; C04–C06 |
| Đơn vận hành | Contract event SQL/app → orders → kho/incident | Hai owner sync, trạng thái, sự cố; C07,C10–C12,C20 |
| Tài sản | getAssetOverviewCached → overview → garments_inventory/outbound sessions | Bộ trạng thái, cache/count/pagination; C19 |
| Nhập kho | catalog/new → declaration wrapper → impl → model/session/lines/instances | Có transaction/guard; thiếu replay key, cần chốt model key; C16 |
| Xuất kho | outbound/new → submitOutbound → process_inventory_outbound | Null contract_id, DB invariant, chọn mọi món; C09,C10 |
| Lịch làm việc | staff page → month fetch; UI nghỉ/tăng ca → createWeeklySchedules | Tự APPROVED, tuần ngoài tháng không fetch; C14 |
| Chính sách | getPolicies scope filter → getPolicyById admin | Detail không áp cùng scope; C02 |

Tài chính/sự cố/phân quyền được đọc vì chạm flow chính; chưa audit toàn diện Marketing, tuyển dụng, đào tạo hoặc mọi tính năng nhân sự ngoài liên kết nêu trên.

## Phát hiện và cách nghiệm thu

P0: rủi ro trực tiếp tới quyền hoặc tính đúng dữ liệu; P1: cần sửa trước nghiệm thu flow. Mức này là ưu tiên sửa, không xác nhận thiệt hại đã xảy ra.

### C01 · P0 — API thử nghiệm có quyền đọc/ghi dữ liệu nhưng thiếu chặn truy cập

**Nguồn:** `src/app/api/debug/route.ts:3`; `src/app/api/test-query/route.ts:4`; `src/app/api/test-sign/route.ts:4`; `src/app/api/fix-db/route.ts:4`; `src/app/api/fix-db/virtual-warehouse/route.ts:4`; `src/middleware.ts:75`.

**Quan sát:** GET debug trả một hợp đồng; test-query trả journey_tasks; test-sign đổi bucket thành public; fix-db gọi exec_sql bằng admin; virtual-warehouse chuyển vị trí hàng và xóa vị trí cũ bằng client phiên. Middleware chỉ chặn đăng nhập/trạng thái ở /dashboard, không chặn các API này.

**Ảnh hưởng:** Nếu route được triển khai và DB cho phép thao tác, người gọi có thể đọc dữ liệu hoặc gây thay đổi ngoài phạm vi. Chưa gọi các endpoint này.

**Sửa cụ thể (T01):** Loại các route thử nghiệm khỏi bản chạy; chuyển bảo trì thành script có phạm vi rõ. Nếu còn API nội bộ, kiểm tra actor/quyền tại handler và dùng phương thức ghi phù hợp.

**Nghiệm thu:** Chưa đăng nhập và tài khoản thường không đọc được debug, không đổi bucket hay vị trí; endpoint đã bỏ trả 404. Test dùng môi trường cô lập.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C02 · P0 — Server actions dùng admin chưa kiểm tra quyền tại điểm vào

**Nguồn:** `src/app/dashboard/customers/actions.ts:46`; `src/app/dashboard/customers/actions.ts:79`; `src/app/dashboard/contracts/actions.ts:486`; `src/app/dashboard/contracts/actions.ts:2096`; `src/app/dashboard/policies/actions.ts:82`; `src/app/dashboard/appointments/appointments-client.tsx:34`.

**Quan sát:** deleteBooking dùng admin và delete trực tiếp; getCustomers/getCustomerById/getStaffs, getContractById và reportGarmentIncident cũng có đường vào thiếu guard. Policy list lọc scope nhưng getPolicyById chỉ lọc ID. Trang chi tiết chỉ kiểm tra POLICIES.view, không scope.

**Ảnh hưởng:** Người xem lịch có thể đến action xóa không yêu cầu quyền delete; người có quyền xem chính sách có thể đọc ID ngoài phạm vi. Không dựa vào nút ẩn để bảo vệ server.

**Sửa cụ thể (T01):** Thêm guard module/action và kiểm tra đối tượng cho từng public action; tách helper nội bộ khỏi action xuất ra client; policy detail dùng cùng bộ lọc scope như list.

**Nghiệm thu:** Probe deleteBooking hiện ghi DB giả mà không gọi guard. Sau sửa, thử account không quyền delete và policy ngoài department đều bị từ chối, tài khoản đúng quyền vẫn làm được.

**Bằng chứng:** Có probe offline trên hàm hiện tại; xem scripts/audit-it-offline.cjs. Các kết luận UI/SQL liên quan vẫn là đọc tĩnh.

### C03 · P1 — Quyền menu, server và SQL không thống nhất

**Nguồn:** `src/app/dashboard/appointments/page.tsx:9`; `src/app/dashboard/inventory/outbound/actions.ts:119`; `src/lib/rbac.ts:73`; `supabase/migrations/20260829000001_fix_roleless_user_permissions.sql:55`.

**Quan sát:** Menu có APPOINTMENTS và INVENTORY_OUTBOUND, nhưng page/action lại kiểm tra CUSTOMERS/GARMENT_CATALOG. TypeScript bỏ merge quyền role; SQL has_module_permission vẫn fallback role.

**Ảnh hưởng:** Người được cấp đúng module theo menu vẫn có thể bị chặn; quyền DB có thể rộng hơn kết quả server cho cùng tài khoản.

**Sửa cụ thể (T02):** Chốt ma trận quyền liên module, dùng chung quy tắc role/user override; giữ quyền lịch sử đã được người dùng yêu cầu cho đến khi xác nhận quy tắc thay thế.

**Nghiệm thu:** Ma trận gồm role-only, user allow, user deny, roleless, disabled và admin; menu/action/RLS cho kết quả đồng nhất.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C04 · P0 — Giữ nhiều món cùng lúc ghi đè JSON hợp đồng

**Nguồn:** `src/app/dashboard/contracts/_components/contract-form.tsx:667`; `src/app/dashboard/contracts/actions.ts:1858`; `src/app/dashboard/contracts/actions.ts:1948`; `src/app/dashboard/customer-journey/actions.ts:118`.

**Quan sát:** Form gọi reserveContractInventory song song cho nhiều selection. Mỗi action đọc notes rồi ghi lại toàn bộ JSON; Journey và các writer khác cũng read–merge–write riêng.

**Ảnh hưởng:** Ngay một người lưu nhiều món có thể mất một phần danh sách giữ hàng. Hai hợp đồng tranh cùng món cũng chưa có khóa/constraint reservation ở DB trong đường này.

**Sửa cụ thể (T03):** Đưa giữ nhiều món thành một thao tác atomic tại DB, có kiểm tra tồn và khoảng ngày dưới lock; dùng UUID tài sản/sự kiện và version conflict cho các writer JSON còn lại.

**Nghiệm thu:** Probe hiện hai request success nhưng final notes còn một món. Sau sửa: hai dòng giữ được đủ; hai khách tranh món chỉ một thành công; metadata người khác không bị mất.

**Bằng chứng:** Có probe offline trên hàm hiện tại; xem scripts/audit-it-offline.cjs. Các kết luận UI/SQL liên quan vẫn là đọc tĩnh.

### C05 · P0 — Lưu/khôi phục hợp đồng chưa bao trọn bảng con

**Nguồn:** `src/app/dashboard/contracts/actions.ts:1591`; `src/app/dashboard/customer-journey/actions.ts:194`; `supabase/migrations/20260814000001_contract_version_history.sql:113`.

**Quan sát:** updateContract ghi cha rồi delete/insert services qua request khác, không đọc error hai bước con; Journey xóa task rồi insert. Version trigger đã tồn tại cho row contracts; restore chỉ update contracts, không khôi phục services/payment_installments/journey_tasks theo cùng snapshot.

**Ảnh hưởng:** Cha/con có thể lệch khi lỗi giữa bước; restore có thể làm UI đọc JSON cũ trong khi bảng con giữ bản mới.

**Sửa cụ thể (T03):** Transaction cho aggregate hợp đồng và task; xác định snapshot bao gồm bảng con hoặc rebuild projections có đối soát. Tái sử dụng version store có sẵn, không tạo lịch sử song song.

**Nghiệm thu:** Inject lỗi insert dịch vụ/task phải rollback. Restore một bản có thay đổi dịch vụ, thu tiền, task phải cho dữ liệu nhất quán ở các màn hình và truy vết actor.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C06 · P0 — Thu tiền đóng hợp đồng và có thể báo thành công khi ghi sổ thất bại

**Nguồn:** `src/app/dashboard/contracts/actions.ts:940`; `src/app/dashboard/contracts/actions.ts:1013`; `src/app/dashboard/customer-journey/actions.ts:18`.

**Quan sát:** recordPaymentTransaction đặt contracts.status=COMPLETED khi thu đủ, dù execution_status chưa hoàn tất; insert payment_installments không kiểm tra error. normalizeContract ưu tiên payments trong JSON. Nhánh cashflow chỉ chạy khi lần đầu đạt DEPOSITED/FULLY_PAID; lần thu sau có thể không vào nhánh.

**Ảnh hưởng:** Hợp đồng biến mất khỏi danh sách Journey khi chỉ mới thu đủ; số thu UI và sổ giao dịch có thể lệch. Chưa chứng minh cashflow table tồn tại trên môi trường chạy.

**Sửa cụ thể (T04):** Tách trạng thái tiền và thực hiện; transaction ghi ledger rồi tổng hợp; kiểm tra số tiền hữu hạn/dương, khóa chống lặp. Đối chiếu các đường initial payment, sửa installment, recordPayment và hoàn tiền.

**Nghiệm thu:** Probe thu đủ khi execution IN_PROGRESS chuyển COMPLETED; lỗi ledger giả vẫn success. Sau sửa thu đủ vẫn giữ việc chưa xong; lỗi ledger không tăng paid_amount; retry chỉ một phiếu.

**Bằng chứng:** Có probe offline trên hàm hiện tại; xem scripts/audit-it-offline.cjs. Các kết luận UI/SQL liên quan vẫn là đọc tĩnh.

### C07 · P1 — Hủy hợp đồng và đồng bộ sự kiện thiếu nguồn điều phối duy nhất

**Nguồn:** `src/app/dashboard/contracts/actions.ts:1118`; `supabase/migrations/20260829000002_sync_contract_event_orders.sql:41`; `src/app/dashboard/contracts/actions.ts:1461`.

**Quan sát:** cancelContract chỉ cập nhật contracts. Trigger sync_contract_event_orders return sớm với CANCELLED/deleted; nhánh app cũng đồng bộ event, trong khi trigger đồng bộ cùng dữ liệu. Trigger luôn viết notes tự sinh của order khi match.

**Ảnh hưởng:** Hủy hợp đồng không tự hủy đơn/giải phóng RESERVED_SALE trong các đường đã đọc. Sửa notes từ module khác có thể ghi lại ghi chú order tự sinh. Không khẳng định cứ chạy cả hai là sinh đơn trùng.

**Sửa cụ thể (T05):** Chọn một bộ điều phối sự kiện; event_id thành quan hệ rõ, tách ghi chú vận hành khỏi marker; xử lý cancel/delete/restore và release đúng reservation.

**Nghiệm thu:** Ca hai event trùng tên, đổi tên, xóa hết event, hủy hợp đồng đã giữ bán; mỗi event đúng một order, ghi chú vận hành còn, kho được giải phóng đúng.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C08 · P0 — Mã món trong hợp đồng được tính lại khác QR vật lý

**Nguồn:** `src/app/dashboard/contracts/actions.ts:1911`; `src/app/dashboard/orders/actions.ts:124`; `supabase/migrations/20260829000005_inventory_factory_size_codes.sql:29`.

**Quan sát:** reserveContractInventory dùng ordinal trên toàn bộ model để tạo garment_code; SQL cấp mã theo factory+size. instance.qr_code đã đọc nhưng không dùng làm mã ghi vào hợp đồng.

**Ảnh hưởng:** Model nhiều size hoặc có lịch sử nhập/xóa có thể tạo mã giả; updateOrderStatus tìm theo QR không cập nhật được món thật.

**Sửa cụ thể (T03):** Ghi garment_instance_id và QR có sẵn; bỏ mọi suy diễn ordinal ở client/action. Audit các liên kết hiện có bằng UUID để lập bản sửa preview.

**Nghiệm thu:** Probe size48-001 và size50-001 tạo garment_code size50-002. Sau sửa mã hợp đồng trùng QR thật; giao đúng UUID dù mã hiển thị thay đổi.

**Bằng chứng:** Có probe offline trên hàm hiện tại; xem scripts/audit-it-offline.cjs. Các kết luận UI/SQL liên quan vẫn là đọc tĩnh.

### C09 · P1 — Chọn đơn xuất kho làm mất contract_id

**Nguồn:** `src/app/dashboard/inventory/outbound/actions.ts:80`; `src/app/dashboard/inventory/outbound/new/page.tsx:368`.

**Quan sát:** getOutboundOrders chọn order.contract_id nhưng nested contract chỉ có contract_code/customer, không có id. UI lại lấy contract?.id nên truyền chuỗi rỗng; action chuyển thành null.

**Ảnh hưởng:** Phiếu có order_id nhưng thiếu contract_id, ảnh hưởng tra cứu hợp đồng/khách trong tài sản.

**Sửa cụ thể (T06):** Dùng order.contract_id ở UI; server tự derive contract_id từ order_id và kiểm tra hai tham chiếu khớp, không tin payload độc lập.

**Nghiệm thu:** Chọn đơn có hợp đồng và xuất: session giữ đúng contract_id. Gửi contract khác đơn phải bị từ chối hoặc chuẩn hóa theo nguồn đơn.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C10 · P0 — RPC xuất kho không kiểm tra quyền/trạng thái/quan hệ tại DB

**Nguồn:** `supabase/migrations/20260828000000_add_expected_return_date.sql:7`; `supabase/migrations/20260828000000_add_expected_return_date.sql:22`; `src/app/dashboard/inventory/outbound/new/page.tsx:256`; `src/app/dashboard/inventory/outbound/actions.ts:133`.

**Quan sát:** Định nghĩa mới nhất trong migration lấy staff_id/status từ payload, không kiểm tra auth.uid/quyền, món thuộc đơn, trạng thái nguồn, khóa hàng hoặc request_id. UI hiện chọn mọi món trên kệ, không gọi searchGarmentInstance. Giao khách luôn RENTED, còn Đi chụp/Khác thành MAINTENANCE; Orders giao thuê lại ghi DELIVERED.

**Ảnh hưởng:** Có thể xuất lại món đã bán/đang xuất hoặc sai đơn nếu đường DB này được triển khai; hai phiếu cạnh tranh không bị chặn. Ba lớp dùng khác bộ trạng thái.

**Sửa cụ thể (T06):** Viết lại RPC có actor từ phiên, permission guard, allowlist transition, khóa món, kiểm tra reservation và chống lặp; transaction đã có trong function nên tập trung bổ sung các invariant, không nói chưa có transaction.

**Nghiệm thu:** Role không quyền gọi RPC thất bại; sold/maintenance không xuất trái phép; hai phiên xuất cùng món chỉ một phiếu; thuê/bán/đi chụp cập nhật đúng trạng thái và ledger.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C11 · P1 — Sự cố/giải quyết/xếp kệ chưa atomic và chống lặp chưa bền

**Nguồn:** `src/app/dashboard/orders/actions.ts:348`; `src/app/dashboard/orders/actions.ts:394`; `src/app/dashboard/order-incidents/actions.ts:49`; `src/app/dashboard/inventory/inbound/actions.ts:80`.

**Quan sát:** Incident insert trước các ghi kho/order; duplicate trả success ngay cả khi lần trước lỗi ở bước sau. ID phụ thuộc cửa sổ 10 giây. Resolve cập nhật incident rồi món/order; putaway đổi món rồi insert movement không đọc error/affected rows.

**Ảnh hưởng:** Retry có thể tạo trùng qua ranh giới 10 giây hoặc bỏ dở đồng bộ; hai putaway có thể cùng báo success, lịch sử thiếu/trùng.

**Sửa cụ thể (T07):** Request UUID bền qua retry; atomic incident + movement + order projection, kiểm tra món thuộc order/contract; resolve và putaway kiểm tra trạng thái và affected rows.

**Nghiệm thu:** Inject lỗi sau insert incident và retry, hai lần putaway, nhiều sự cố trên cùng món; không success giả, chỉ một movement hợp lệ và chỉ khả dụng khi đủ điều kiện.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C12 · P1 — Hai luồng sự cố dùng khác nguồn và khác quyết định nghiệp vụ

**Nguồn:** `src/app/dashboard/contracts/[id]/contract-detail-view.tsx:534`; `src/app/dashboard/contracts/actions.ts:2096`; `src/app/dashboard/orders/actions.ts:311`; `src/app/dashboard/contracts/actions.ts:2040`.

**Quan sát:** Modal hợp đồng đang gọi reportGarmentIncident: đánh LIQUIDATED, cộng bồi thường, chỉ trừ inventory_items nếu có inventory_item_id. Luồng Orders ghi order_incidents và MAINTENANCE ở garments_inventory. markGarmentReturned chỉ đổi JSON; ReturnScanner có file nhưng không thấy import vào trang hiện hành.

**Ảnh hưởng:** Cùng một sự cố có thể bị coi là thanh lý hoặc bảo trì theo màn hình; hàng kiểu mới không được sửa kho ở đường legacy.

**Sửa cụ thể (T07):** Hợp nhất report incident theo UUID và quy trình đã chốt; chỉ thanh lý bằng quyết định riêng. Truy vết caller trước khi loại helper cũ, không đánh đồng helper tồn tại với tính năng đang dùng.

**Nghiệm thu:** Ca báo lỗi cùng món từ Hợp đồng và Orders cho cùng bản ghi nghiệp vụ; xử lý sửa được không bị thanh lý; trả hàng cập nhật kho/QC theo quy tắc đã chốt.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C13 · P1 — CRM và lịch hẹn không đồng bộ đúng khi bỏ ngày hoặc có nhiều lịch

**Nguồn:** `src/app/dashboard/customers/actions.ts:111`; `src/app/dashboard/customers/actions.ts:161`; `src/app/dashboard/customers/actions.ts:172`.

**Quan sát:** updateCustomer chỉ gọi sync khi appointment_date có giá trị nên nhánh xóa lịch bên trong không chạy khi bỏ ngày. Lookup dùng maybeSingle cho toàn bộ SALE_BOOKING của khách; nhiều lịch gây lỗi bị bỏ qua. Các ghi lịch không trả lỗi về kết quả lưu khách.

**Ảnh hưởng:** Lịch cũ vẫn hiện dù người dùng bỏ lịch; có thể báo lưu khách thành công nhưng không tạo được hẹn.

**Sửa cụ thể (T08):** Phân biệt field bị bỏ qua với yêu cầu xóa; dùng appointment ID và trạng thái hủy thay xóa lịch sử; chốt nhiều lịch/khách. Ghi đồng bộ có kiểm tra lỗi.

**Nghiệm thu:** Probe bỏ ngày không đụng schedule. Sau sửa: giữ nguyên khi không gửi field, hủy đúng lịch khi yêu cầu, khách có hai hẹn không tạo thêm ngoài ý muốn.

**Bằng chứng:** Có probe offline trên hàm hiện tại; xem scripts/audit-it-offline.cjs. Các kết luận UI/SQL liên quan vẫn là đọc tĩnh.

### C14 · P1 — Đăng ký lịch tự APPROVED và chuyển tuần không tải dữ liệu mới

**Nguồn:** `src/app/dashboard/schedules/staff/actions.ts:121`; `src/app/dashboard/schedules/staff/staff-schedules-view.tsx:108`; `src/app/dashboard/schedules/staff/page.tsx:17`; `src/app/dashboard/schedules/staff/staff-schedules-view.tsx:66`.

**Quan sát:** UI nghỉ/tăng ca gọi createWeeklySchedules, server ghi APPROVED với quyền create. Tăng ca optimistic lại PENDING. Page chỉ fetch tháng hiện tại, nút tuần chỉ đổi currentDate; không có fetch theo tuần mới.

**Ảnh hưởng:** Trạng thái duyệt trước/sau tải lại khác nhau; tuần ngoài tháng ban đầu thiếu dữ liệu lịch.

**Sửa cụ thể (T09):** Chốt tự duyệt hay cần duyệt theo loại lịch; server là nguồn trạng thái. Load theo date range tuần và cache key, xử lý timezone ngày cuối tháng.

**Nghiệm thu:** Tạo nghỉ/tăng ca bằng quyền create-only; trạng thái đúng policy và UI. Xem tuần giao tháng/tháng sau có dữ liệu đã lưu, không mất ngày cuối tháng.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C15 · P1 — Tổng quan trộn số liệu cứng với dữ liệu thật và link tạo hợp đồng sai

**Nguồn:** `src/app/dashboard/page.tsx:139`; `src/app/dashboard/page.tsx:84`; `src/app/dashboard/page.tsx:77`; `src/app/dashboard/sales-kpi-card.tsx:17`.

**Quan sát:** Quick Stats hardcode 450 triệu, 124 hợp đồng, 15 khách; KPI có giá trị và tháng cứng. Quick action /contracts/new không có page new, có thể rơi vào [id]; create page thật là /contracts/create. groupOrder thiếu INVENTORY_GROUP.

**Ảnh hưởng:** Người dùng có thể đọc số minh họa như kết quả thực tế; nút tạo sai đường; kho không hiện trong nhóm thẻ Home.

**Sửa cụ thể (T10):** Thay số cứng bằng truy vấn có định nghĩa chỉ số hoặc hiển thị chưa có dữ liệu; sửa route, thêm nhóm kho theo quyền. Phân biệt snapshot KPI lịch sử nếu vẫn giữ.

**Nghiệm thu:** Tạo/sửa một ca thử làm đổi đúng số; không còn số giả dưới nhãn hiện tại; nút tạo mở form create; tài khoản có quyền thấy nhóm kho.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C16 · P1 — Nhập kho có transaction nhưng chưa chống gửi lặp và định danh mẫu cần chốt

**Nguồn:** `supabase/migrations/20260829000005_inventory_factory_size_codes.sql:55`; `supabase/migrations/20260829000005_inventory_factory_size_codes.sql:101`; `src/app/dashboard/inventory/catalog/actions.ts:61`.

**Quan sát:** RPC wrapper kiểm quyền và SQL nhập model/session/lines/instances trong một function. Mỗi lần gọi tạo session/món mới, chưa có request ID. Mẫu khóa bằng factory_code chuẩn hóa; nhập lại cùng mã cập nhật nhiều trường model.

**Ảnh hưởng:** Retry sau mất mạng có thể nhập đôi; cùng factory nhưng khác màu/biến thể có thể ghi đè thuộc tính mẫu nếu nghiệp vụ coi là mẫu khác.

**Sửa cụ thể (T11):** Bổ sung idempotency cho phiếu nhập; xác nhận khóa mẫu factory hay factory+biến thể. Validate vị trí và tổng size ở server/DB; bảo toàn metadata khi nhập bổ sung.

**Nghiệm thu:** Gửi lại cùng request chỉ một session và đúng N món; hai request nhập thực sự khác vẫn cộng đúng. Nhập màu/size khác không đổi dữ liệu ngoài phạm vi đã chốt.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C17 · P1 — Cấp mã và lịch sử migration chưa đủ để triển khai lặp lại an toàn

**Nguồn:** `src/utils/code-generator.ts:11`; `supabase/migrations/20260829000002_sync_contract_event_orders.sql:132`; `supabase/migrations/20260829000002_sync_contract_event_orders.sql:138`.

**Quan sát:** Allocator app đọc max rồi +1 không khóa. Có bốn cặp migration cùng prefix version. Backfill sync event chỉ SET updated_at trong khi trigger chỉ nghe notes/status/deleted_at nên không kích hoạt sync. Không thấy định nghĩa journey_tasks/cashflow/payroll_deductions trong 66 migration đã scan.

**Ảnh hưởng:** Đồng thời có thể sinh mã trùng; dựng môi trường mới khó tái lập đúng schema. Không suy ra bảng production chắc chắn thiếu.

**Sửa cụ thể (T12):** Dùng sequence/RPC cấp mã; lập manifest version/checksum, đối chiếu migration đã áp dụng trước khi đổi tên; sửa backfill explicit theo event; bổ sung baseline schema thiếu sau khi đối chiếu DB.

**Nghiệm thu:** Probe hai allocator cùng CUST-000010. Sau sửa chạy đồng thời không trùng; bootstrap DB sạch và replay hợp lệ; backfill thực sự tạo/cập nhật đơn cho fixture cũ.

**Bằng chứng:** Có probe offline trên hàm hiện tại; xem scripts/audit-it-offline.cjs. Các kết luận UI/SQL liên quan vẫn là đọc tĩnh.

### C18 · P1 — Build bỏ qua TypeScript/lint nên cần cổng kiểm tra độc lập

**Nguồn:** `next.config.mjs:4`; `next.config.mjs:7`; `package.json:12`.

**Quan sát:** Đã chạy tsc --noEmit --incremental false: exit 0; next lint exit 0 có warnings. Build config đang bỏ qua cả hai; package không có test script.

**Ảnh hưởng:** Build thành công không chứng minh nghiệp vụ đúng; lỗi kiểu/lint mới có thể qua build nếu không chạy gate riêng.

**Sửa cụ thể (T12):** Thêm bước typecheck/lint có kiểm soát trong quy trình, ưu tiên regression test cho các luồng dữ liệu đã tái hiện. Không dành đợt đầu để sửa toàn bộ cảnh báo ảnh.

**Nghiệm thu:** Typecheck/lint qua; các test atomicity, permissions, reservation, payment, outbound và migration nằm trong gate và thật sự fail khi tái đưa lỗi.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C19 · P1 — Tài sản chưa phản ánh đủ trạng thái và có cache cũ sau thao tác

**Nguồn:** `src/app/dashboard/inventory/locations/page.tsx:73`; `src/lib/inventory-asset-prefetch.ts:18`; `src/app/dashboard/inventory/locations/actions.ts:40`.

**Quan sát:** Tab Đang xuất chỉ đếm RENTED, Orders lại ghi DELIVERED; danh mục chưa có nhóm SOLD/RESERVED_SALE. Cache browser 60 giây không có invalidation hàm ghi trong code đã scan. Assets fetch toàn bộ không phân trang, outbound chỉ lấy 500 session.

**Ảnh hưởng:** Số đếm bỏ sót trạng thái; quay lại sau xuất/putaway có thể thấy dữ liệu cũ; quan hệ xuất gần nhất của món có thể thiếu khi vượt giới hạn.

**Sửa cụ thể (T10):** Thống nhất enum với T06, tính count phía DB, phân trang; invalidate cache sau thao tác, thêm refresh và trạng thái lỗi rõ.

**Nghiệm thu:** DELIVERED/SOLD/RESERVED_SALE hiển thị đúng nhóm; xuất rồi quay lại thấy ngay; fixture trên giới hạn trang không làm tổng count sai.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

### C20 · P1 — Nhánh tự động hóa nhân sự/lương còn giá trị ví dụ và bỏ qua lỗi

**Nguồn:** `src/app/dashboard/orders/actions.ts:139`; `src/app/dashboard/schedules/operation/actions.ts:362`; `src/app/dashboard/schedules/operation/actions.ts:335`.

**Quan sát:** ISSUE qua updateOrderStatus chèn khấu trừ PENDING 200000; createOperationSchedule chèn attendance với comment giả lập, còn schema trong repo có attendance_logs. Conflict lịch chỉ so cùng ngày/location, không so giờ. Chưa có DB verification cho các bảng giả lập.

**Ảnh hưởng:** Đề xuất lương không đúng quy định hoặc lặp; phân công có thể bị hiểu như chấm công. Cảnh báo trùng phòng không phân biệt khung giờ.

**Sửa cụ thể (T09):** Tách phân công khỏi chấm công; cấu hình chính sách sự cố có nguồn xác nhận và chống lặp; bỏ/hoàn thiện automation giả lập sau khi đối chiếu schema; so khoảng giờ cho conflict.

**Nghiệm thu:** Đổi ISSUE nhiều lần không tạo nhiều đề xuất; không đánh dấu đã làm chỉ từ lịch phân công; hai lịch cùng phòng khác giờ không bị cảnh báo trùng giờ.

**Bằng chứng:** Đọc code/caller/SQL; chưa chạy trên môi trường thật.

## Hồ sơ kiểm chứng

- [Manifest scan và checksum](audit/IT_CODE_SCAN_2026-09-05.json)
- [Finding và ticket có dòng code](audit/IT_DEEP_AUDIT_2026-09-05.json)
- [Probe offline dùng hàm thực tế](../scripts/audit-it-offline.cjs)
- [Action plan v2](IT_AUDIT_ACTION_PLAN.md)

Probe hiện là bài tái hiện lỗi của baseline: exit 0 nghĩa là đã quan sát đúng lỗi mô tả, không nghĩa ứng dụng đã được sửa. Sau khi triển khai, chuyển chúng thành regression test kỳ vọng hành vi đúng.

Bốn prefix migration trùng: 20260731000005, 20260731000006, 20260829000002, 20260830000001. Không tự đổi tên migration đã áp dụng; cần đối chiếu lịch sử DB trước.

Năm route registry chưa có page chính xác: /dashboard/operations, /dashboard/tasks, /dashboard/hr, /dashboard/settings, /dashboard/garments/scan. Đây là kiểm kê route; quyền/isActive quyết định người nào nhìn thấy. Không mở rộng mặc định thành yêu cầu xây tất cả module còn thiếu.
