const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /(<h3 className="text-\[11px\] font-bold tracking-widest text-slate-900 uppercase flex items-center gap-1\.5">\s*<DollarSign className="w-3\.5 h-3\.5 text-amber-500" \/> 4\.1\. Tiến Độ Thanh Toán\s*<\/h3>\s*<\/div>)/m;

const note = `
                  <div className="text-[10px] text-amber-600 font-medium italic mb-2 bg-amber-50 p-1.5 rounded border border-amber-100 leading-tight">
                    💡 <b>Tip cho Sale:</b> Hãy chủ động nhập trước <b>Ngày dự kiến</b> và <b>Số tiền còn lại</b> ở các đợt tiếp theo (để trạng thái "Chưa thu"). Hệ thống sẽ tự động canh ngày để nhắc Kế toán đi thu nợ!
                  </div>`;

content = content.replace(regex, `$1${note}`);

fs.writeFileSync(file, content, 'utf8');
console.log('Done adding note to 4.1');
