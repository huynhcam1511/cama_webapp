import fs from 'fs';

const filePath = 'C:/Users/ADMIN-PC/Documents/ANTIGRAVITY/CAMA WEBAPP/src/app/dashboard/contracts/contract-dialog.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The goal is to swap the left and right column contents, and change their widths and layout properties.

// 1. Extract Khách hàng section (lines 261-299 approx)
const khachHangRegex = /(<section className="bg-white p-3\.5 rounded-xl border border-slate-200 shadow-sm space-y-3 shrink-0">\s*<h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-2">\s*<User.*?<\/section>)/s;
const khachHangMatch = content.match(khachHangRegex);

// 2. Extract Lịch trình section (lines 301-349 approx)
const lichTrinhRegex = /(<section className="bg-white p-3\.5 rounded-xl border border-slate-200 shadow-sm shrink-0">\s*<h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">\s*<Settings2.*?<\/section>)/s;
const lichTrinhMatch = content.match(lichTrinhRegex);

// 3. Extract Dịch vụ section (lines 356-489 approx)
const dichVuRegex = /(<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">.*?TỔNG HỢP ĐỒNG:.*?<\/div>\s*<\/div>)/s;
const dichVuMatch = content.match(dichVuRegex);

// 4. Extract Thanh toán section (lines 491-682 approx)
const thanhToanRegex = /(<div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">\s*<div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">.*?<\/div>\s*<\/div>\s*<\/div>)/s; // The last </div> matches the end of Thanh toan
const thanhToanMatch = content.match(thanhToanRegex);

if (!khachHangMatch || !lichTrinhMatch || !dichVuMatch || !thanhToanMatch) {
  console.log("Failed to match one of the sections.");
  console.log("Khach Hang:", !!khachHangMatch);
  console.log("Lich Trinh:", !!lichTrinhMatch);
  console.log("Dich Vu:", !!dichVuMatch);
  console.log("Thanh Toan:", !!thanhToanMatch);
  process.exit(1);
}

// Adjust Dich Vu layout: "chỉ phần nội dung cuộn đối với card dịch vụ & sản phẩm. Các card giữ kích thước ổn định"
// We will wrap Dich Vu to flex-1 and overflow-hidden, with its table body scrollable, OR just make the container overflow-y-auto.
// The user says: "Bên trái là “Dịch vụ & sản phẩm”, chiếm khoảng 65% chiều rộng, cho phép thêm nhiều dòng và cuộn dọc khi nội dung dài."
// And: "chỉ phần nội dung cuộn đối với card dịch vụ & sản phẩm."
let newDichVu = dichVuMatch[1];
newDichVu = newDichVu.replace(
  '<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0">',
  '<div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">'
);
newDichVu = newDichVu.replace(
  '<div className="p-0">',
  '<div className="p-0 flex-1 overflow-y-auto">'
);

// We need to replace the entire columns container
const columnsRegex = /({\/\* CỘT TRÁI \(Thông tin & Lịch trình\) - 30% \*\/}.*)(\s*{\/\* Footer Actions \*\/})/s;

const newColumns = `{/* CỘT TRÁI (Dịch vụ & sản phẩm) - 65% */}
          <div className="w-full lg:w-[65%] h-full flex flex-col pr-1 overflow-hidden">
            ${newDichVu}
          </div>

          {/* CỘT PHẢI (Khách hàng, Lịch trình, Thanh toán) - 35% */}
          <div className="w-full lg:w-[35%] h-full overflow-y-auto space-y-4 pr-1 pb-4">
            ${khachHangMatch[1]}
            ${lichTrinhMatch[1]}
            ${thanhToanMatch[1]}
          </div>`;

const newContent = content.replace(columnsRegex, (match, p1, p2) => {
  return newColumns + p2;
});

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log("Successfully rewrote the dialog layout!");
