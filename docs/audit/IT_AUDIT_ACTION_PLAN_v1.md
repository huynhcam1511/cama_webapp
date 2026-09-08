# IT audit và action plan — 05/09/2026

## Kết luận và giới hạn

Webapp đã có nhiều luồng thực thi; tài liệu AppSheet và kế hoạch kho cũ không đủ để mô tả trạng thái hiện nay. Ưu tiên bảo toàn dữ liệu ghi liên module và xác minh nhánh khấu trừ ví dụ, sau đó chuẩn hóa input thực tế thành đặc tả.

Đây là audit tĩnh có trọng tâm của registry, tài liệu kiến trúc và actions Hợp đồng/Journey/Orders/Xuất kho. Không đăng nhập ứng dụng, không truy vấn dữ liệu production, không xác minh migrations đã áp dụng, không chạy kiểm thử chức năng hay audit bảo mật toàn diện. Các tác động dưới đây là rủi ro suy ra từ code, không phải khẳng định sự cố đã xảy ra. Tài liệu data integrity ghi sự cố 14/08; đó là ghi nhận lịch sử trong tài liệu. Code Journey hiện đã merge userNotes.

Working tree webapp đã có nhiều sửa đổi chưa commit trước audit. Baseline phản ánh code trên đĩa ngày audit, không khẳng định trùng bản triển khai. Đợt này chỉ thêm tài liệu và điểm vào README.

## Phát hiện có nguồn

### F01 · P1 — Ngữ cảnh IT phân tán và tài liệu cũ lệch phạm vi

- Bằng chứng: `PLAYBOOK/CAMA_BRAIN_IT_APP_START_HERE.md`. Điểm vào cũ dành cho AppSheet, trong khi CAMA WEBAPP có ứng dụng Next.js/Supabase.
- Ảnh hưởng: Nhầm kế hoạch cũ với trạng thái webapp.
- Xử lý: A01; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

### F02 · P1 — Song song hai nguồn kho

- Bằng chứng: `CAMA WEBAPP/src/app/dashboard/contracts/actions.ts:1705`. checkInventoryAvailability và checkInventoryAvailabilityAndSearch đọc inventory_items; searchContractInventory đọc garment_models/garments_inventory.
- Ảnh hưởng: Có nguy cơ tra cứu/giữ hàng khác nguồn; cần xác định đường gọi còn hoạt động.
- Xử lý: A03; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

### F03 · P0 — Ghi hợp đồng và dịch vụ không nguyên tử tại đoạn đã đọc

- Bằng chứng: `CAMA WEBAPP/src/app/dashboard/contracts/actions.ts:1581`. updateContract cập nhật hợp đồng rồi delete/insert contract_services qua các request riêng; hai thao tác bảng con không kiểm tra error tại đây.
- Ảnh hưởng: Lỗi giữa chừng có thể để hợp đồng và dịch vụ lệch nhau.
- Xử lý: A04; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

### F04 · P0 — JSON hợp đồng dùng chung còn rủi ro cập nhật đồng thời

- Bằng chứng: `CAMA WEBAPP/src/app/dashboard/customer-journey/actions.ts:84`. Journey đã merge userNotes thay vì thay toàn bộ notes, nhưng read–merge–write vẫn là các request riêng.
- Ảnh hưởng: Hai người sửa đồng thời có thể ghi đè phiên bản metadata; chưa tái hiện runtime.
- Xử lý: A04; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

### F05 · P1 — Đồng bộ trạng thái đơn và kho qua nhiều bước

- Bằng chứng: `CAMA WEBAPP/src/app/dashboard/orders/actions.ts:84`. Đơn được cập nhật trước; kho cập nhật sau theo QR. Kết quả error của cập nhật kho không được kiểm tra tại đoạn này.
- Ảnh hưởng: Đơn có thể báo giao nhưng trạng thái tài sản chưa đổi.
- Xử lý: A05; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

### F06 · P0 — Mức trừ lương ví dụ nằm trong thao tác ISSUE

- Bằng chứng: `CAMA WEBAPP/src/app/dashboard/orders/actions.ts:132`. updateOrderStatus chèn payroll_deductions amount=200000, status=PENDING khi ISSUE và có pic_id; đoạn này chưa có chống lặp.
- Ảnh hưởng: Có thể tạo đề xuất khấu trừ không đúng chính sách hoặc lặp; chưa xác minh có phát sinh thực tế.
- Xử lý: A02; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

### F07 · P1 — Kế hoạch kho cần đối chiếu lại với code mới

- Bằng chứng: `CAMA WEBAPP/src/app/dashboard/inventory/outbound/actions.ts:118`. submitOutbound đã gọi process_inventory_outbound; kế hoạch inventory-lifecycle-plan.md vẫn ghi làm module xuất kho.
- Ảnh hưởng: Không thể coi toàn bộ mục kế hoạch cũ là chưa làm; SQL tồn tại chưa chứng minh đã áp dụng production.
- Xử lý: A03; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

### F08 · P1 — Ảnh menu chưa đủ làm đặc tả nghiệp vụ

- Bằng chứng: `CAMA WEBAPP/src/config/moduleRegistry.ts`. 11 mục trong ảnh là điểm vào; registry còn chứa tài chính, quyền, sự cố và các module khác.
- Ảnh hưởng: Thiếu actor, dữ liệu, điều kiện chuyển bước và tiêu chí nghiệm thu thực tế.
- Xử lý: A06; trạng thái mở. Kiểm chứng hiện tại: đọc tĩnh.

## Action plan

P0 = ưu tiên trước khi mở rộng các luồng ghi liên quan; P1 = cần để chuẩn hóa và nghiệm thu; P2 = bàn giao/tổng hợp. Đây là ưu tiên đề xuất, không phải xác nhận đã sửa.

| ID | Ưu tiên | Công việc | Phụ thuộc | Phụ trách đề xuất | Trạng thái |
|---|---|---|---|---|---|
| A01 | P1 | Lập điểm vào IT và sổ ngữ cảnh | — | agent | done |
| A02 | P0 | Xác minh và chuẩn hóa nhánh ISSUE → đề xuất khấu trừ | — | agent + chủ nghiệp vụ | planned |
| A03 | P1 | Chốt nguồn kho và đối chiếu tiến độ kế hoạch cũ | A06 | agent + phụ trách kho | planned |
| A04 | P0 | Thiết kế và sửa bảo toàn dữ liệu liên module | — | agent | planned |
| A05 | P1 | Chuẩn hóa Hợp đồng → Đơn → Kho → hoàn trả | A03, A04 | agent + vận hành | planned |
| A06 | P1 | Thu input thực tế và hoàn thiện đặc tả 11 module | A01 | chủ nghiệp vụ + agent | planned |
| A07 | P1 | Kiểm chứng xuyên suốt và quyền truy cập | A05, A06, A02 | agent + người dùng theo vai trò | planned |
| A08 | P2 | Đối soát tổng quan và bàn giao đợt tiếp theo | A07 | agent | planned |

### A01 — Điều kiện hoàn thành

JSON, audit, master plan, input template có liên kết và đọc lại được.

### A02 — Điều kiện hoàn thành

Chốt có/không tự sinh đề xuất, mức và người duyệt; thao tác lặp không tạo trùng; không ảnh hưởng lương nếu chưa đủ điều kiện.

### A03 — Điều kiện hoàn thành

Lập bảng route → action → bảng/RPC → migration thực tế; chọn nguồn chuẩn; kế hoạch chuyển đổi có đối soát và rollback.

### A04 — Điều kiện hoàn thành

Ghi hợp đồng/bảng con atomic; cập nhật đồng thời không mất khóa; lỗi insert rollback; có version và phục hồi kiểm chứng.

### A05 — Điều kiện hoàn thành

Đổi/hủy sự kiện không sinh đơn trùng; xuất đúng món; lỗi giữa bước không lệch trạng thái; thuê trả qua QC, bán theo chính sách đã chốt.

### A06 — Điều kiện hoàn thành

Mỗi module có ca thực tế, actor, field, state, ownership, ngoại lệ và tiêu chí nghiệm thu; giả định có trạng thái riêng.

### A07 — Điều kiện hoàn thành

Chạy ca thuê, bán, nhiều sự kiện, đổi/hủy, thiếu quyền, gửi lặp, hai người sửa; lưu expected/actual và bằng chứng.

### A08 — Điều kiện hoàn thành

Chỉ số tổng quan khớp nguồn; cập nhật backlog, quyết định, kết quả test, việc tiếp theo và phiên bản brain.

## Cách thực hiện đợt kế tiếp

A02: truy vết caller của updateOrderStatus, đối chiếu chính sách hiện hành và ledger nếu được thực hiện trong đợt triển khai. Phân biệt đề xuất PENDING với khấu trừ đã thực thi; chưa kết luận đã trừ lương người nào.

A04: rà toàn bộ nơi ghi contracts.notes, contract_services, journey_tasks; thiết kế transaction/RPC và version hoặc kiểm tra phiên bản đồng thời; kiểm thử lỗi giữa bước và hai phiên sửa. Tại updateContract đã thấy delete/insert dịch vụ; không suy ra mọi thao tác khác đều có cùng lỗi.

A03: truy vết cả inventory_items và garments_inventory tới UI, SQL, dữ liệu thật; không xóa nguồn cũ trước khi biết còn được dùng ở đâu. Đối chiếu process_inventory_outbound với migration và hành vi chạy thực tế.

Mọi đợt triển khai sau cần ghi phạm vi thay đổi, cách kiểm chứng, kết quả, đường rollback khi tác động dữ liệu. Yêu cầu hiện tại kết thúc ở brain, audit và kế hoạch; các action sửa code vẫn là planned.

## Nguồn đọc

- [Registry](../src/config/moduleRegistry.ts)
- [Contract actions](../src/app/dashboard/contracts/actions.ts)
- [Journey actions](../src/app/dashboard/customer-journey/actions.ts)
- [Orders actions](../src/app/dashboard/orders/actions.ts)
- [Outbound actions](../src/app/dashboard/inventory/outbound/actions.ts)
- [Kiến trúc](architecture.md), [bảo toàn dữ liệu](DATA_INTEGRITY_ARCHITECTURE.md), [kế hoạch kho trước đây](inventory-lifecycle-plan.md)
- [Điểm vào AppSheet lịch sử](../../PLAYBOOK/CAMA_BRAIN_IT_APP_START_HERE.md)
- Ảnh sidebar và yêu cầu người dùng trong cuộc hội thoại ngày 05/09/2026.

