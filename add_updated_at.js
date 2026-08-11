const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = '{!errorMsg && <span>* Hợp đồng được lưu trữ an toàn. Đơn hàng (Orders) cho ekip soạn đồ sẽ được tạo rời để theo dõi quy trình.</span>}';
const replacement = `{!errorMsg && <span>* Hợp đồng được lưu trữ an toàn. Đơn hàng (Orders) cho ekip soạn đồ sẽ được tạo rời để theo dõi quy trình.</span>}
            {isEditMode && initialData?.updated_at && (
              <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono text-[10px]">
                Cập nhật lần cuối: {new Date(initialData.updated_at).toLocaleString('vi-VN')}
              </span>
            )}`;

content = content.replace(anchor, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Done adding updated_at to footer');
