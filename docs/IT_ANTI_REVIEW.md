# Review kết quả Anti — 05/09/2026

**Kết luận: chưa đạt nghiệm thu T01–T12.** Có cải thiện thật nhưng còn 11 phát hiện cần xử lý, gồm các lỗi mới ảnh hưởng dữ liệu. Đã tái hiện 7 hành vi bằng hàm hiện tại với DB giả lập. TypeScript và lint exit 0 không phủ được các lỗi này.

## Phạm vi

Đối chiếu SHA256 manifest trước Anti, diff working tree và walkthrough của Anti; đọc các hàm/migration thay đổi, chạy typecheck, lint và probe riêng. Không kiểm tra production và không thực thi các migration. Review này chỉ thêm tài liệu/probe, không sửa runtime hoặc DB.

Báo cáo Anti tại `.gemini/antigravity-ide/brain/0ab30af1-c0e0-429b-bdf9-8f34aa06f68d/walkthrough.md` có tuyên bố hoàn thành T01/T12/T02/T03 và mô tả T04–T07. Đây là claim cần đối chiếu. IT_BRAIN vẫn để cả 12 ticket planned; kế hoạch MD chỉ đổi T01 completed. Vì vậy trạng thái bàn giao cũng chưa đồng bộ.

## Phát hiện cần Anti sửa

### R01 · P1 · T03 — Chọn lại món đã giữ làm xóa món khỏi hợp đồng

Nguồn: [src/app/dashboard/contracts/actions.ts:1937](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/contracts/actions.ts:1937>).

Nhánh alreadyReserved đưa món cũ vào additions. Phép merge sau đó loại nó khỏi garments vì ID gar-* đã có trong additions, rồi cũng loại khỏi additions vì đã có trong garments. Probe cho success nhưng danh sách cuối rỗng.

**Yêu cầu sửa:** Merge/upsert theo garment_instance_id hoặc reservation ID, giữ nguyên món chọn lại; thêm test retry không đổi số món.

**Bằng chứng:** Tái hiện bằng hàm hiện tại + DB giả lập. Những kết luận RLS/SQL liên quan là đọc tĩnh.

### R02 · P1 · T03 — Bulk giữ hai dòng cùng size có thể lấy trùng một món

Nguồn: [src/app/dashboard/contracts/actions.ts:1912](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/contracts/actions.ts:1912>).

Trong vòng selections, tập available lấy từ DB không loại UUID đã chọn ở vòng trước; không có reservation transaction/lock ở DB. Probe với tồn một món và hai dòng cùng size ghi hai reservation cùng physical UUID. Bulk request chỉ khắc phục một dạng ghi đè trong một form, chưa atomic giữa nhiều người.

**Yêu cầu sửa:** Lọc UUID đã giữ trong batch, rồi thực hiện reserve dưới transaction/lock/constraint và kiểm tra khoảng ngày; test một batch và hai người cạnh tranh.

**Bằng chứng:** Tái hiện bằng hàm hiện tại + DB giả lập. Những kết luận RLS/SQL liên quan là đọc tĩnh.

### R03 · P1 · T05 — Hủy hợp đồng có thể đưa món đã bán về khả dụng

Nguồn: [src/app/dashboard/contracts/actions.ts:1169](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/contracts/actions.ts:1169>).

cancelContract suy ra saleInstances từ metadata còn RESERVED rồi update về AVAILABLE không kiểm tra status thật. Xuất bán đã đổi physical item sang SOLD nhưng metadata không đồng bộ tương ứng. Probe SOLD → AVAILABLE sau cancel.

**Yêu cầu sửa:** Chỉ giải phóng reservation còn RESERVED_SALE thuộc hợp đồng, có điều kiện status trong DB; SOLD cần flow hoàn trả riêng, không mở lại tự động.

**Bằng chứng:** Tái hiện bằng hàm hiện tại + DB giả lập. Những kết luận RLS/SQL liên quan là đọc tĩnh.

### R04 · P1 · T04 — Thu tiền còn ghi dở và retry tạo dòng thu trùng

Nguồn: [src/app/dashboard/contracts/actions.ts:991](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/contracts/actions.ts:991>).

Đổi thứ tự ghi ledger trước contracts không tạo transaction. Khi ledger insert thành công nhưng contracts update lỗi, ledger vẫn tồn tại; retry chèn thêm. Probe hai lần lỗi để lại hai dòng thu, không rollback. Cashflow error vẫn bị bỏ qua.

**Yêu cầu sửa:** Một RPC transaction cho ledger và tổng paid_amount, request UUID chống lặp; kiểm thử lỗi sau insert và retry.

**Bằng chứng:** Tái hiện bằng hàm hiện tại + DB giả lập. Những kết luận RLS/SQL liên quan là đọc tĩnh.

### R05 · P1 · T07 — Báo sự cố mới làm đứt liên kết tới món hàng và luồng xếp kệ

Nguồn: [src/app/dashboard/orders/actions.ts:315](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/orders/actions.ts:315>).

Action mới không lưu garment_instance_id/garment_code, không đổi kho MAINTENANCE, không ghi movement hoặc cập nhật Orders ISSUE. updateIncidentStatus cần garment_instance_id để chuyển PENDING_PUTAWAY nên bỏ qua món mới. Action còn chuyển sang session client, nhưng migration order_incidents trong repo chỉ có SELECT policy; INSERT có thể bị RLS từ chối khi schema đúng repo. Probe dùng DB giả cho phép insert vẫn tái hiện mất liên kết.

**Yêu cầu sửa:** Khôi phục validation/quyền và liên kết món/order/contract; transaction incident+movement+state; cấp RLS đúng phạm vi nếu dùng session client; test từ báo lỗi đến resolve và putaway.

**Bằng chứng:** Tái hiện bằng hàm hiện tại + DB giả lập. Những kết luận RLS/SQL liên quan là đọc tĩnh.

### R06 · P1 · T01/T02 — T01 chưa phủ hết điểm vào và mapping quyền vẫn lệch

Nguồn: [src/app/dashboard/customers/actions.ts:8](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/customers/actions.ts:8>).

saveBooking/getBookingById còn admin thiếu guard; probe saveBooking ghi trực tiếp khi guard chưa gọi. Lịch hẹn page dùng APPOINTMENTS nhưng deleteBooking dùng CUSTOMERS.delete; getOutboundHistory/getOutboundOrders vẫn GARMENT_CATALOG.view. Các action admin Orders create/delete/notes/PIC vẫn cần rà quyền.

**Yêu cầu sửa:** Lập inventory public actions; guard ngay entrypoint, đúng module/action và object scope; kiểm thử account chỉ có APPOINTMENTS/INVENTORY_OUTBOUND.

**Bằng chứng:** Tái hiện bằng hàm hiện tại + DB giả lập. Những kết luận RLS/SQL liên quan là đọc tĩnh.

### R07 · P1 · T12 — RPC cấp mã mới chưa thực sự cấp phát mã duy nhất

Nguồn: [supabase/migrations/20260905000000_code_generator_rpc.sql:11](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/supabase/migrations/20260905000000_code_generator_rpc.sql:11>).

RPC khóa trong transaction chỉ SELECT MAX+1 rồi RETURN, không ghi counter/giữ mã. Lock hết khi RPC xong trước request insert; hai cuộc gọi trước insert vẫn nhận cùng mã. Fallback TS dùng giây nên hai gọi cùng giây trùng (đã probe).

**Yêu cầu sửa:** Dùng sequence hoặc counter update-returning atomic, hoặc tạo record cùng RPC; bỏ fallback theo giây và fail rõ khi migration chưa áp dụng.

**Bằng chứng:** Tái hiện bằng hàm hiện tại + DB giả lập. Những kết luận RLS/SQL liên quan là đọc tĩnh.

### R08 · P1 · T06 — SQL xuất kho gọi hàm phân quyền sai chữ ký

Nguồn: [supabase/migrations/20260905000004_fix_inventory_outbound_t06.sql:25](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/supabase/migrations/20260905000004_fix_inventory_outbound_t06.sql:25>).

Migration mới truyền (uuid, text, text) nhưng các định nghĩa has_module_permission trong repo chỉ nhận (text, text) và lấy auth.uid bên trong. Nếu DB có đúng schema trong repo, xuất kho sẽ lỗi function does not exist trước khi làm việc. Chưa thực thi trên DB thật, chưa loại trừ overload ngoài repo.

**Yêu cầu sửa:** Gọi public.has_module_permission('INVENTORY_OUTBOUND','create'), kiểm chứng đúng signature trên DB cô lập và chạy ca xuất có quyền/không quyền.

**Bằng chứng:** Truy vết mã nguồn/SQL; chưa chạy DB thật.

### R09 · P1 · T05 — event_id được dùng để match nhưng không được đọc/ghi đầy đủ

Nguồn: [src/app/dashboard/contracts/actions.ts:1639](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/contracts/actions.ts:1639>).

createContract mới bỏ marker trong notes và chỉ ghi event_id lúc insert. updateContract SELECT thiếu event_id nhưng match o.event_id; đổi tên sự kiện lần đầu không match theo id hoặc tên cũ, có thể sinh đơn mới và hủy đơn cũ, mất mạch tiến độ. Nhánh insert/update của updateContract cũng thiếu event_id; xóa hết event vẫn bỏ qua sync; lỗi insert đơn hiện bị bỏ qua và báo success.

**Yêu cầu sửa:** Select/upsert event_id ở mọi nhánh, backfill theo marker trước khi bỏ trigger, unique(contract_id,event_id); xử lý zero events và lỗi DB; test rename giữ nguyên order UUID/checklist/PIC.

**Bằng chứng:** Truy vết mã nguồn/SQL; chưa chạy DB thật.

### R10 · P1 · T12 — Đổi tên migration làm đảo thứ tự tạo bảng và cập nhật bảng

Nguồn: [supabase/migrations/20260731000014_fk_order_schedules.sql:6](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/supabase/migrations/20260731000014_fk_order_schedules.sql:6>).

Migration tạo operation_schedules bị chuyển từ prefix 000005 sang 000055; file 000014 vẫn ALTER bảng trước khi được CREATE ở 000055. Fresh replay theo thứ tự tên sẽ gặp relation missing nếu không có schema ngoài repo. Chưa có bằng chứng đối chiếu migration history/rollback trước khi rename.

**Yêu cầu sửa:** Khôi phục thứ tự phụ thuộc, đối chiếu version đã áp dụng; không xử lý duplicate version bằng cách đẩy migration tạo bảng ra sau consumers. Kiểm thử bootstrap DB sạch.

**Bằng chứng:** Truy vết mã nguồn/SQL; chưa chạy DB thật.

### R11 · P1 · T06/T07 — Trạng thái đơn và kho vẫn dùng hai đường không cùng điều kiện

Nguồn: [src/app/dashboard/orders/actions.ts:126](<C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA/CAMA WEBAPP/src/app/dashboard/orders/actions.ts:126>).

RPC xuất đổi delivery_status nhưng UI filter dựa completion_status. Orders action vẫn ghi thuê DELIVERED, RPC ghi RENTED. Nhánh mới COMPLETED đưa mọi món thuê liên kết về AVAILABLE trực tiếp, không kiểm tra QC/incident; có thể mở món đang bảo trì. Không thấy request ID/membership món–đơn trong RPC mới.

**Yêu cầu sửa:** Chốt một transition service và source trạng thái; COMPLETED không tự bỏ qua QC; RPC verify món thuộc đơn; test bán/thuê/QC, retry và UI filter.

**Bằng chứng:** Truy vết mã nguồn/SQL; chưa chạy DB thật.

## Đối chiếu đủ 12 ticket

| Mã | Kết quả review | Chi tiết |
|---|---|---|
| T01 | partial_not_accepted | Đã bỏ 5 API và thêm một số guard/scope; saveBooking và các action khác còn thiếu guard. R06. |
| T02 | partial_not_accepted | Đã merge role/user và đổi page APPOINTMENTS, submit outbound; read/delete vẫn lệch module. R06. |
| T03 | regression_not_accepted | Bulk request và QR thật đã sửa hướng; chọn lại mất món, cùng size giữ trùng, chưa DB atomic/restore aggregate. R01,R02. |
| T04 | partial_not_accepted | Không tự COMPLETED khi thu đủ; ledger-first vẫn không transaction/idempotency. R04. |
| T05 | regression_not_accepted | Đã thêm event_id và cancel; event chưa match đủ, cancel có thể mở hàng SOLD. R03,R09. |
| T06 | not_accepted | UI lấy order.contract_id đúng; SQL guard sai signature, trạng thái chưa nhất quán. R08,R11. |
| T07 | regression_not_accepted | reportOrderIncident mất liên kết món và cập nhật kho so với baseline đã audit. R05,R11. |
| T08 | not_implemented_in_reviewed_tree | CRM bỏ ngày hẹn chưa sửa; actions chỉ thêm guard. |
| T09 | not_implemented_in_reviewed_tree | Staff/operation schedules không đổi so manifest trước; tự APPROVED, load tháng và mức 200k còn. |
| T10 | not_implemented_in_reviewed_tree | Home/KPI/assets/cache không đổi so manifest trước; số cứng và thiếu nhóm kho còn. |
| T11 | not_implemented_in_reviewed_tree | Intake RPC và catalogue không đổi so manifest trước; chưa có request id chống lặp. |
| T12 | partial_not_accepted | Typecheck script/build gate đã sửa; allocator vẫn trùng, migration rename sai dependency, chưa có DB replay evidence. R07,R10. |

## Những phần đã cải thiện

- Bỏ năm API test/debug/fix khỏi source.
- Thêm guard cho một số action và lọc scope chi tiết chính sách.
- Khôi phục merge role/user; sửa page Lịch hẹn và quyền tạo phiếu xuất.
- Form giữ hàng dùng một bulk request và QR vật lý.
- Thu đủ tiền giữ nguyên trạng thái thực hiện; lỗi insert installment được trả về.
- Chọn đơn xuất lấy order.contract_id; SQL có row lock và nhánh RESERVED_SALE → SOLD.
- Bỏ ignoreBuildErrors/ignoreDuringBuilds và thêm typecheck script.

Các cải thiện này chưa đủ đánh dấu cả ticket done. Bulk request không tương đương transaction DB; đổi thứ tự ghi ledger không tạo rollback.

## Thứ tự gửi Anti xử lý lại

1. R01/R02/R03/R05: dừng các regression mất món, giữ trùng, mở hàng đã bán và mất liên kết sự cố.
2. R08/R10: sửa SQL signature và thứ tự migration trước khi thử deploy/replay.
3. R04/R07/R09/R11: transaction/idempotency, allocator thật, event identity và trạng thái.
4. R06: hoàn tất guard/mapping và matrix quyền.
5. Triển khai phần T08–T11 còn chưa thay đổi; kiểm thử lại đủ flow và cập nhật trạng thái có bằng chứng.

Giữ nguyên UI theo ràng buộc đã chốt. Không sửa ticket để khớp claim; sửa code theo điều kiện nghiệm thu. Chỉ deploy/migrate sau khi đối chiếu DB và có phương án rollback theo kế hoạch.

## Kiểm chứng đã chạy

- `node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false`: exit 0.
- `node node_modules/next/dist/bin/next lint`: exit 0, warnings hook/ảnh.
- `node scripts/review-anti-offline.cjs`: exit 0, 7 lỗi đã được tái hiện; exit 0 ở đây nghĩa tái hiện đúng lỗi, không phải ứng dụng đạt.

Probe gốc audit-it-offline.cjs vẫn là tái hiện baseline cũ, chưa chuyển thành regression suite và không còn khớp chữ ký reserve mới. Không dùng nó để tuyên bố toàn bộ fix đã pass.

Các giới hạn còn lại: chưa browser E2E, chưa kiểm tra database thực/RLS, chưa fresh migration replay. SQL mismatch và thứ tự migration được chứng minh trong mã repo, không xác nhận DB production đang ở schema nào.
