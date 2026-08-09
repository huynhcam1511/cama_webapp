const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update thead
content = content.replace(
  '<th className="px-4 py-3 w-40 whitespace-nowrap">Trang (Page)</th>',
  '<th className="px-4 py-3 w-40 whitespace-nowrap">Trang (Page)</th>\n              <th className="px-4 py-3 w-32 whitespace-nowrap">Ngày tạo</th>'
);

// 2. Update parent row (loading state)
content = content.replace(
  '<tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>',
  '<tr><td colSpan={8} className="p-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>'
);
content = content.replace(
  '<tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu.</td></tr>',
  '<tr><td colSpan={8} className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu.</td></tr>'
);

// 3. Update parent row 
const oldParentRow = `<td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={4}>
                        {item.title} <span className="text-gray-400 text-xs font-normal ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{subRows.length} đầu mục</span>
                      </td>
                      <td className="px-4 py-3 text-right">`;

const newParentRow = `<td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={4}>
                        {item.title} <span className="text-gray-400 text-xs font-normal ml-2 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{subRows.length} đầu mục</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right">`;
content = content.replace(oldParentRow, newParentRow);

// 4. Update sub row
const oldSubRow = `<td className="px-4 py-3 text-gray-600 text-sm whitespace-nowrap">
                          {sub.page}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">`;

const newSubRow = `<td className="px-4 py-3 text-gray-600 text-sm whitespace-nowrap">
                          {sub.page}
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">`;
content = content.replace(oldSubRow, newSubRow);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Update date column successful');
