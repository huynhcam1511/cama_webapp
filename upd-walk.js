const fs = require('fs');
const artifactPath = 'C:\\Users\\ADMIN-PC\\.gemini\\antigravity-ide\\brain\\0ab30af1-c0e0-429b-bdf9-8f34aa06f68d\\walkthrough.md';
let content = fs.readFileSync(artifactPath, 'utf-8');
content += `

## 4. T04: Tách thu tiền khỏi hoàn thành thực hiện
- Tách biệt trạng thái payment_status và execution_status trong contracts.
- Đảm bảo hợp đồng không tự động chuyển sang COMPLETED khi mới chỉ thu đủ tiền, mà vẫn giữ lại trạng thái thực hiện.
- Kiểm soát ghi nhận sổ thu chi một cách an toàn.

## 5. T05: Chuẩn hóa sự kiện và đơn hàng
- Loại bỏ database trigger (sync_contract_event_orders) dễ gây lỗi ghi đè dữ liệu.
- Thêm trường event_id vào bảng orders.
- Đồng bộ sự kiện/đơn hàng trực tiếp từ tầng Application (Next.js server actions).
- Không ghi đè ghi chú vận hành (notes) của đơn hàng khi đồng bộ lại.
- Khi Hủy hợp đồng, các đơn hàng (orders) được đánh dấu completion_status = CANCELLED, đồng thời kho (garments_inventory) giải phóng hàng SALE bằng cách cập nhật trạng thái AVAILABLE.
`;
fs.writeFileSync(artifactPath, content);
