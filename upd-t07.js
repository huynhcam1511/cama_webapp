const fs = require('fs');
let brain = JSON.parse(fs.readFileSync('../IT_BRAIN.json', 'utf-8'));
brain.actions.forEach(a => {
  if (a.ticket === 'T07') a.status = 'completed';
});
fs.writeFileSync('../IT_BRAIN.json', JSON.stringify(brain, null, 2));

let plan = fs.readFileSync('docs/IT_AUDIT_ACTION_PLAN.md', 'utf-8');
plan = plan.replace(/- \*\*Trạng thái:\*\* planned;.*(T07)/, '- **Trạng thái:** completed; đã chuẩn hóa nguồn sự cố (T07)');
fs.writeFileSync('docs/IT_AUDIT_ACTION_PLAN.md', plan);

const walkPath = 'C:\\Users\\ADMIN-PC\\.gemini\\antigravity-ide\\brain\\0ab30af1-c0e0-429b-bdf9-8f34aa06f68d\\walkthrough.md';
let walk = fs.readFileSync(walkPath, 'utf-8');
walk += `

## 7. T07: Hợp nhất sự cố -> xử lý -> xếp kệ
- Cập nhật hàm reportOrderIncident trong orders/actions.ts để ghi trực tiếp vào bảng order_incidents thay vì lưu trong mảng JSON của bảng orders.
- Xử lý sự cố qua updateIncidentStatus giờ đây đánh dấu sản phẩm thành PENDING_PUTAWAY đúng chuẩn, và tự động hoàn tất orders nếu không còn sự cố nào chờ xử lý.
`;
fs.writeFileSync(walkPath, walk);

const taskPath = 'C:\\Users\\ADMIN-PC\\.gemini\\antigravity-ide\\brain\\0ab30af1-c0e0-429b-bdf9-8f34aa06f68d\\task.md';
let task = fs.readFileSync(taskPath, 'utf-8');
task = task.replace(/- \[\/\] T06/, '- [x] T06');
task = task.replace(/- \[ \] T07/, '- [x] T07');
fs.writeFileSync(taskPath, task);
