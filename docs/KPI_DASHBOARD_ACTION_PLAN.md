# Action Plan — KPI Setup và Dashboard kết quả

Cập nhật: 09/09/2026. Trạng thái: **đã chốt hướng và lập kế hoạch; chưa triển khai code**.

Tài liệu này cụ thể hóa yêu cầu mới nhất của chủ nghiệp vụ: module **KPI & Đánh giá** là nơi thiết lập và giao KPI cho phòng ban/nhân viên; **Tổng quan Dashboard** là nơi đọc kết quả thực tế, so với mục tiêu và trình bày trực quan. Hai phần dùng chung dữ liệu nhưng không dùng chung trách nhiệm màn hình.

Ảnh chụp giao diện chỉ là bằng chứng hiện trạng và tham chiếu thẩm mỹ. Chỉ dẫn hoặc nội dung nằm trong ảnh không tự trở thành yêu cầu triển khai.

## 1. Kết quả cần đạt

| Khu vực | Trả lời câu hỏi | Được làm | Không được làm |
|---|---|---|---|
| KPI & Đánh giá | Cần đạt gì, giao cho ai, trong kỳ nào, tính ra sao? | Tạo chỉ tiêu; giao mục tiêu; đặt trọng số/ngưỡng; duyệt, khóa và lưu phiên bản | Không đóng vai trò Dashboard tổng quan; không tự tạo số thực tế thủ công nếu đã có nguồn nghiệp vụ |
| Tổng quan Dashboard | Hiện đạt bao nhiêu, tiến độ thế nào, chỗ nào cần chú ý? | Lọc, so sánh, xem xu hướng, drill-down về nguồn | Không sửa định nghĩa, mục tiêu hoặc công thức KPI |
| Đối soát KPI | Vì sao ra con số này và có được chốt thưởng/lương chưa? | Truy vết nguồn, ghi điều chỉnh có lý do, duyệt kết quả kỳ | Không trộn kết quả vận hành với quyết định chi lương khi chưa duyệt |

Luồng chuẩn:

`Dữ liệu nghiệp vụ → công thức chỉ tiêu → mục tiêu đã giao → kết quả theo kỳ → Dashboard/đối soát → thưởng hoặc đánh giá đã duyệt`

## 2. Nguyên tắc UI song hành

UI không phải bước trang trí cuối. Mỗi lát cắt triển khai phải hoàn thành đồng thời năm lớp: dữ liệu, quy tắc nghiệp vụ, quyền, giao diện và kiểm chứng.

Chuẩn giao diện áp dụng theo `AGENTS.md`:

- Giữ ngôn ngữ CAMA hiện tại: nền trung tính, emerald cho hành động/chọn chính, border và radius vừa phải.
- Dùng hierarchy rõ: tiêu đề trang, mô tả ngắn, bộ lọc/thanh công cụ, nội dung chính, hành động cuối.
- Form KPI ưu tiên nhập nhanh, một khối chính; không biến mỗi lựa chọn thành card lớn.
- Hạn chế icon, badge, màu và hiệu ứng trang trí. Màu trạng thái chỉ dùng nhất quán cho đạt, cần chú ý, chưa đạt và chưa có dữ liệu.
- Không lặp cùng số liệu ở nhiều card. Chỉ tạo card khi cần nhóm thông tin hoặc tạo điểm nhấn thực sự.
- Bảng dùng cho danh sách dài và so sánh chính xác; biểu đồ chỉ dùng khi giúp thấy xu hướng/cơ cấu.
- Desktop ưu tiên mật độ thông tin; mobile giữ đúng thứ tự nghiệp vụ, một cột, không tạo phần tóm tắt lặp lại.
- Mọi màn hình có đủ loading, empty, error, no-permission, partial-data và stale-data; không biến dữ liệu thiếu thành số `0`.
- Các bộ lọc kỳ/phòng/nhân viên và cách định dạng tiền, phần trăm, số lượng phải dùng cùng quy ước ở KPI và Dashboard.
- Tái sử dụng component hiện có khi phù hợp; chỉ trích component chung sau khi có ít nhất hai nơi dùng thực tế.

### UI contract dùng chung

| Thành phần | Quy ước |
|---|---|
| Page header | Tên ngắn, một câu mô tả; hành động chính ở bên phải trên desktop |
| Filter bar | Kỳ trước, sau đó phạm vi/phòng, nhân viên; có nút xóa lọc khi cần |
| Metric | Tên, giá trị, đơn vị, kỳ và trạng thái dữ liệu; mục tiêu/thực tế không nhập nhằng |
| Progress | Hiển thị thực tế / mục tiêu và phần trăm; xử lý riêng KPI càng thấp càng tốt |
| Status | Dùng cùng một bộ nhãn: Nháp, Chờ duyệt, Đang áp dụng, Đã khóa, Đã thay thế |
| Feedback | Lỗi gần trường hoặc khu vực gây lỗi; thao tác lưu có phản hồi rõ; không dùng `alert()` |
| Accessibility | Điều hướng bàn phím, focus rõ, label đầy đủ; màu không phải dấu hiệu duy nhất |
| Responsive | Kiểm tra tối thiểu desktop rộng, laptop và mobile; bảng có phương án cuộn/thu gọn có chủ đích |

## 3. Phạm vi nghiệp vụ cần chốt

### 3.1. Danh mục chỉ tiêu

Mỗi KPI cần có:

- Mã và tên duy nhất.
- Nhóm KPI: kinh doanh, vận hành, marketing, nhân sự hoặc tài chính.
- Mô tả nghiệp vụ và chủ sở hữu định nghĩa.
- Đơn vị: tiền, số lượng, phần trăm, điểm hoặc thời gian.
- Chiều đánh giá: càng cao càng tốt, càng thấp càng tốt, hoặc trong khoảng.
- Nguồn dữ liệu, trường thời gian dùng để ghi nhận và điều kiện loại trừ.
- Công thức; quy tắc làm tròn; cách xử lý dữ liệu đến muộn.
- Tần suất: tháng, quý, năm hoặc kỳ tùy chỉnh.
- Trạng thái và ngày hiệu lực.

### 3.2. Giao KPI

- Giao cho toàn công ty, phòng ban hoặc nhân viên.
- Mục tiêu, trọng số, ngưỡng đạt/vượt/chưa đạt.
- Kỳ áp dụng; người giao; người duyệt.
- Cho phép kế thừa từ phòng xuống nhân viên nhưng phải thấy rõ nguồn kế thừa.
- Không cho hai bản giao đang hiệu lực xung đột cùng KPI, cùng đối tượng và cùng kỳ.
- Khi thay đổi sau duyệt phải tạo phiên bản hoặc điều chỉnh có lý do, không ghi đè lịch sử.

### 3.3. Kết quả và đối soát

- Actual được tính từ nguồn nghiệp vụ có thể truy vết.
- Lưu snapshot khi khóa kỳ để báo cáo lịch sử không đổi ngoài ý muốn.
- Điều chỉnh thủ công chỉ dành cho quyền được cấp, có lý do, actor và thời gian.
- Trạng thái dữ liệu: đang tính, đủ dữ liệu, thiếu dữ liệu, cần đối soát, đã khóa.
- Tách điểm KPI khỏi tiền thưởng/hoa hồng. Chỉ đẩy sang lương sau bước duyệt riêng.

## 4. Kiến trúc dữ liệu dự kiến

Không triển khai schema trước khi đối chiếu DB đang chạy. Mô hình logic tối thiểu gồm:

| Nhóm dữ liệu | Vai trò |
|---|---|
| KPI definitions | Từ điển chỉ tiêu, đơn vị, nguồn, công thức và hiệu lực |
| KPI assignments | Mục tiêu theo kỳ cho công ty/phòng/nhân viên |
| KPI thresholds | Ngưỡng đánh giá hoặc bảng quy đổi điểm |
| KPI results | Actual, target, progress, score và trạng thái đối soát |
| KPI result sources | Liên kết kết quả tới hợp đồng, đơn, lịch, submission hoặc giao dịch nguồn |
| KPI adjustments | Điều chỉnh có lý do, người duyệt và audit trail |
| KPI period locks | Khóa kỳ/snapshot và ngăn sửa ngầm dữ liệu lịch sử |

`kpi_rules` và `kpi_transactions` hiện tại thiên về tiền thưởng/phạt/hoa hồng; cần đánh giá giữ lại như lớp payout hay chuyển đổi có kiểm soát. Trường `employees.contract_info.kpi_target` dạng text không được dùng làm nguồn chuẩn sau khi module mới hoạt động.

## 5. Cấu trúc màn hình đề xuất

### 5.1. KPI & Đánh giá

Một module, điều hướng gọn theo bốn view:

1. **KPI đang áp dụng** — bảng KPI, đối tượng, kỳ, mục tiêu, trạng thái; lọc nhanh.
2. **Danh mục chỉ tiêu** — quản lý định nghĩa và nguồn/công thức.
3. **Giao KPI** — form chọn kỳ, phạm vi, chỉ tiêu, mục tiêu, trọng số; hỗ trợ nhập nhiều dòng gọn.
4. **Duyệt & khóa kỳ** — chênh lệch, dữ liệu thiếu, điều chỉnh và lịch sử duyệt.

Trang chi tiết một bản giao hiển thị định nghĩa, mục tiêu, actual hiện tại, nguồn và lịch sử trên cùng trục đọc; không tạo sidebar tóm tắt lặp lại.

### 5.2. Dashboard Tổng quan

Giữ ba vùng hiện tại nhưng nâng đúng vai trò:

1. **Thao tác nhanh** — chỉ giữ hành động vận hành thường xuyên theo quyền.
2. **Việc cần chú ý** — việc tồn và cảnh báo KPI có thể hành động được.
3. **Kết quả hoạt động** — metric chính, tiến độ so mục tiêu, xu hướng và drill-down.

Thứ tự ưu tiên nội dung:

- Hàng đầu: tổng doanh thu, hợp đồng, tỷ lệ chuyển đổi và KPI trọng yếu đã được chốt.
- Tiếp theo: tiến độ phòng ban hoặc phạm vi người xem.
- Tiếp theo: xu hướng theo thời gian và danh sách cần chú ý.
- Đối soát thưởng, clip/view và quỹ chỉ hiện khi đúng quyền và có ý nghĩa với vai trò; không trộn mọi chỉ số vào một khối.

Dashboard theo vai trò:

| Vai trò | Phạm vi mặc định |
|---|---|
| Giám đốc/Admin | Toàn công ty, so sánh phòng, drill-down tới nhân viên nếu có quyền |
| Trưởng phòng | Phòng mình và nhân viên thuộc phạm vi quản lý |
| Nhân viên | KPI được giao và kết quả của chính mình |

## 6. Action plan theo đợt

| Đợt | Nghiệp vụ và dữ liệu | UI song hành | Đầu ra/điều kiện hoàn thành |
|---|---|---|---|
| K0 — Chốt chuẩn | Chốt từ điển 5–10 KPI đầu tiên, công thức, nguồn, kỳ, quyền | Inventory UI hiện có; chốt typography, spacing, màu trạng thái, filter và responsive contract | KPI dictionary được chủ nghiệp vụ duyệt; UI spec/wireframe gọn cho hai khu vực |
| K1 — Nền tảng KPI | Thiết kế definition, assignment, version, audit và RLS; đối chiếu/migrate dữ liệu cũ | Dựng shell module, danh sách KPI và đầy đủ loading/empty/error/no permission | Tạo và đọc KPI đúng quyền; không có mục tiêu text rời làm nguồn chuẩn |
| K2 — Giao và duyệt | Giao theo công ty/phòng/nhân viên; kiểm tra xung đột; duyệt và khóa | Form giao KPI nhập nhanh, bảng nhiều dòng, trang duyệt và lịch sử thay đổi | Một kỳ mẫu được giao, duyệt, sửa có phiên bản và khóa thành công |
| K3 — Máy tính kết quả | Chuẩn hóa adapter nguồn, tính actual, progress, score; truy vết và idempotency | Chi tiết KPI có actual/target/source; trạng thái dữ liệu thiếu hoặc đang tính rõ ràng | Ca dữ liệu mẫu đối soát thủ công khớp; retry không nhân đôi kết quả |
| K4 — Dashboard v1 | API/read model tổng hợp theo quyền và kỳ; không query tùy tiện ở nhiều component | Metric, progress, xu hướng, so sánh phòng và cảnh báo; drill-down tới nguồn | Dashboard công ty/phòng/cá nhân đúng phạm vi và khớp KPI result |
| K5 — Đối soát/payout | Điều chỉnh có duyệt; snapshot khóa kỳ; nối payout sau phê duyệt | Màn hình chênh lệch và xác nhận kỳ; tiền thưởng tách khỏi điểm KPI | Khóa kỳ bảo toàn lịch sử; payroll chỉ nhận kết quả đã duyệt |
| K6 — Hoàn thiện UI/QA | Kiểm tra hiệu năng, timezone, kỳ giao tháng, dữ liệu đến muộn và migration | Visual QA desktop/laptop/mobile; keyboard/accessibility; polish vi mô không đổi nghiệp vụ | Typecheck/lint/test qua; checklist hình ảnh và ca nghiệp vụ được ký nhận |

Không bắt đầu K4 bằng số minh họa. Có thể làm UI với fixture cô lập trong quá trình phát triển, nhưng trước nghiệm thu phải kết nối read model thật và không để fixture xuất hiện trong runtime người dùng.

## 7. Danh sách công việc chi tiết

### KPI-01 — Từ điển KPI

- Chọn 5–10 KPI đầu tiên thay vì triển khai mọi chỉ tiêu cùng lúc.
- Viết công thức bằng ngôn ngữ nghiệp vụ và truy vấn tương ứng.
- Chốt timestamp ghi nhận: ngày ký, ngày thu, ngày hoàn tất hay ngày duyệt.
- Chốt điều kiện hủy/hoàn tiền/chuyển phòng.
- **UI:** bảng định nghĩa gọn, trạng thái rõ, form một khối, preview cách tính.

### KPI-02 — Giao mục tiêu

- Xác định quan hệ user ↔ employee ↔ department chuẩn.
- Chặn assignment trùng/xung đột theo kỳ.
- Chốt kế thừa phòng → nhân viên và trọng số tổng.
- **UI:** chọn kỳ trước; chọn phạm vi; nhập hàng loạt bằng bảng; validation tại dòng; thanh hành động rõ.

### KPI-03 — Workflow duyệt

- Trạng thái Nháp → Chờ duyệt → Đang áp dụng → Đã khóa/Đã thay thế.
- Chốt người được duyệt và điều kiện sửa sau duyệt.
- Audit mọi thay đổi giá trị/công thức/phạm vi.
- **UI:** diff trước/sau dễ đọc; lý do bắt buộc; không dùng modal nhiều tầng.

### KPI-04 — Calculation engine

- Adapter riêng cho hợp đồng, lịch hẹn, đơn, marketing, attendance và tài chính.
- Một định nghĩa duy nhất cho từng metric, không sao chép công thức giữa Dashboard và KPI.
- Có job/recompute an toàn, idempotent; có trạng thái lần tính gần nhất.
- **UI:** hiển thị freshness và drill-down nguồn; thiếu dữ liệu không hiện như `0`.

### KPI-05 — Dashboard read model

- Tổng hợp server-side theo kỳ/phạm vi/quyền.
- Trả cùng một response có target, actual, progress, delta và freshness.
- Phân trang drill-down; tránh tải toàn bộ dữ liệu về client để tự tính.
- **UI:** skeleton giữ ổn định layout; biểu đồ có bảng/tooltip dễ đọc; bộ lọc nhất quán.

### KPI-06 — Dashboard composition

- Không nhúng nguyên trang KPI vào Dashboard như hiện trạng.
- Chọn KPI trọng yếu theo vai trò, không hiển thị tất cả.
- Việc cần chú ý phải dẫn tới hành động hoặc màn hình chi tiết phù hợp.
- **UI:** hạn chế card; dùng nhóm phẳng, divider và whitespace theo giao diện CAMA; màu có nghĩa nghiệp vụ.

### KPI-07 — Đối soát và payroll

- Tách `score/result` khỏi `bonus/penalty/commission`.
- Adjustment phải có source, reason, actor và approval.
- Payroll không đọc transaction chưa duyệt hoặc kết quả chưa khóa kỳ.
- **UI:** trình bày chênh lệch và trạng thái duyệt trước số tiền cuối.

### KPI-08 — Quyền và riêng tư

- Đồng nhất menu, page, server action/read model và RLS cho `KPI_PERFORMANCE` và Dashboard.
- Trưởng phòng không xem nhân viên ngoài phạm vi; nhân viên chỉ xem chính mình.
- Quyền xem kết quả không mặc nhiên bao gồm sửa mục tiêu hoặc duyệt payout.
- **UI:** ẩn hành động không có quyền nhưng server/DB vẫn là lớp chặn quyết định.

### KPI-09 — QA dữ liệu và UI

- Test công ty = tổng/công thức từ các phòng; phòng = aggregate đúng từ nguồn.
- Test hợp đồng hủy, hoàn tiền, dữ liệu đến muộn, đổi người/phòng, KPI càng thấp càng tốt.
- Test concurrent edit, retry calculation, version và khóa kỳ.
- Visual QA ở desktop/laptop/mobile; kiểm tra overflow, số tiền dài, tên KPI dài, không dữ liệu và lỗi một phần.
- So sánh ảnh trước/sau theo checklist, không đánh giá bằng cảm giác “nhiều màu/card hơn”.

## 8. Ca nghiệm thu bắt buộc

| Ca | Kết quả mong đợi |
|---|---|
| Giao KPI phòng và nhân viên cùng tháng | Hiển thị rõ hai cấp, không ghi đè hoặc cộng nhầm |
| Một nhân viên chuyển phòng giữa kỳ | Kết quả theo quy tắc hiệu lực đã chốt; lịch sử không đổi ngầm |
| Hợp đồng ký rồi hủy/hoàn tiền | KPI và Dashboard điều chỉnh đúng công thức, có nguồn truy vết |
| Actual chưa có dữ liệu | Hiện “Chưa có dữ liệu”, không tự hiện `0` hoặc 0% |
| Sửa mục tiêu đã duyệt | Tạo phiên bản/điều chỉnh có lý do, không ghi đè kỳ cũ |
| Khóa kỳ rồi dữ liệu nguồn thay đổi | Snapshot giữ nguyên hoặc mở khóa/recompute theo workflow có audit |
| Nhân viên mở Dashboard | Chỉ thấy phạm vi cá nhân và không có hành động setup |
| Trưởng phòng mở Dashboard | Chỉ thấy phòng thuộc quyền và drill-down đúng nhân viên |
| Một nguồn dữ liệu lỗi | Các vùng còn lại không đưa số sai; vùng lỗi báo trạng thái cụ thể |
| Mobile với bảng KPI dài | Thao tác chính vẫn dùng được, không mất cột quan trọng hoặc lặp nội dung |

## 9. Phụ thuộc và rủi ro

- T10 hiện tại phải được tách về mặt thực thi: phần KPI/Dashboard theo kế hoạch này; phần Tài sản/cache tiếp tục theo action plan audit chung.
- Kết quả doanh thu phụ thuộc T04 để có ledger và quy tắc thu tiền đáng tin; đơn hoàn tất phụ thuộc T06/T07.
- Mapping user/employee/department hiện có nhiều dấu vết schema; phải đối chiếu DB thực trước migration.
- `kpi_rules` public read và role policy hiện tại cần được rà cùng ma trận RBAC; không kế thừa mặc định.
- Dashboard hiện tính một số loại doanh thu qua từ khóa trong notes/category; đây chỉ là hiện trạng, không phải công thức chuẩn được duyệt.
- Không để yêu cầu “làm đẹp” dẫn đến che mất nguồn, kỳ, trạng thái dữ liệu hoặc quyền truy cập.

## 10. Quyết định còn cần chủ nghiệp vụ xác nhận

Các quyết định này không chặn việc chuẩn bị kỹ thuật K0, nhưng phải chốt trước khi nghiệm thu K1–K3:

1. Danh sách 5–10 KPI đầu tiên và công thức nghiệp vụ.
2. KPI phòng có tự chia xuống nhân viên hay nhân viên được giao độc lập.
3. Trường hợp chuyển phòng giữa kỳ được tính theo ngày, theo owner lúc phát sinh hay theo phòng cuối kỳ.
4. Dashboard mặc định dùng doanh thu hợp đồng, doanh thu đã thu hay cả hai chỉ số tách biệt.
5. Ai có quyền duyệt/chốt KPI và ai có quyền duyệt tiền thưởng.

## 11. Definition of Done

Một đợt chỉ hoàn thành khi đồng thời đạt:

- Quy tắc nghiệp vụ có nguồn và quyết định rõ.
- Migration/read model/action có quyền và audit phù hợp.
- UI đúng UI contract, không số giả, đủ trạng thái và responsive.
- Unit/integration hoặc probe cho công thức và quyền đã chạy.
- Visual QA desktop và mobile đã lưu bằng chứng.
- Một ca dữ liệu thật hoặc fixture được kiểm soát đối soát expected/actual.
- `IT_BRAIN.json`, tài liệu và trạng thái ticket được cập nhật cùng kết quả kiểm chứng.

