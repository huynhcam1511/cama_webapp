const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/contents/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the hardcoded render block with dynamic iteration
const oldRenderBlock = `      {(hasTikTok || isGeneric) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Kịch Bản Chi Tiết & Diễn Xuất (TikTok)</h2>
          </div>
          <table className="w-full text-left text-sm table-fixed">
            <colgroup>
              <col className="w-20" />
              <col className="w-32" />
              <col className="w-48" />
              <col className="w-auto" />
            </colgroup>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 text-gray-600 font-medium">Thời gian</th>
                <th className="p-3 text-gray-600 font-medium">Góc máy</th>
                <th className="p-3 text-orange-600 font-bold">Diễn xuất</th>
                <th className="p-3 text-gray-600 font-medium">Lời thoại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(() => {
                const tiktokData = content.deliverables?.tiktok || {};
                const scripts = tiktokData.script_details || content.script_details || [];
                if (scripts.length === 0) {
                  return <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Chưa có phân cảnh. (Cần dùng AI để sinh)</td></tr>;
                }
                return scripts.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 align-top">
                    <td className="p-3 text-gray-500 font-mono text-xs pt-4">{row.time || '--'}</td>
                    <td className="p-3 text-gray-700 text-xs pt-4">{row.camera || '--'}</td>
                    <td className="p-3">
                      <textarea className="w-full bg-orange-50/50 border border-orange-100 rounded-md p-2 text-orange-800 text-xs italic resize-none outline-none" defaultValue={row.acting_cue || ''} rows={4} readOnly />
                    </td>
                    <td className="p-3">
                      <textarea className="w-full bg-transparent border border-transparent rounded-md p-2 text-gray-900 leading-relaxed resize-none outline-none" defaultValue={row.dialogue || ''} rows={4} readOnly />
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
          {renderSocialPost('tiktok', 'Nội dung đăng TikTok')}
        </div>
      )}

      {(hasFbVay || isGeneric) && renderSocialPost('facebook_vay', 'Bài Đăng - Page Váy Bridal')}
      {(hasFbSuit || isGeneric) && renderSocialPost('facebook_suit', 'Bài Đăng - Page CAMA Suit')}
      {(hasFbStudio || isGeneric) && renderSocialPost('facebook_studio', 'Bài Đăng - Page CAMA Studio')}
      {(hasFbAcademy || isGeneric) && renderSocialPost('facebook_academy', 'Bài Đăng - Page CAMA Academy')}
      {(hasFounder || isGeneric) && renderSocialPost('founder_page', 'Bài Đăng - Profile Chuyên Gia (Cao Hùng)')}`;

const newRenderBlock = `      {/* Dynamic Render Channels based on deliverables keys */}
      {Object.entries(content.deliverables || {}).map(([key, data]: [string, any]) => {
        const isTikTok = key.toLowerCase().includes('tiktok');
        const pageName = data.page || key;
        const formatName = data.format || 'Bài Đăng';
        const title = \`\${formatName} - \${pageName}\`;
        
        return (
          <React.Fragment key={key}>
            {isTikTok && data.script_details && data.script_details.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Kịch Bản Chi Tiết & Diễn Xuất (\${pageName})</h2>
                </div>
                <table className="w-full text-left text-sm table-fixed">
                  <colgroup>
                    <col className="w-20" />
                    <col className="w-32" />
                    <col className="w-48" />
                    <col className="w-auto" />
                  </colgroup>
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-gray-600 font-medium">Thời gian</th>
                      <th className="p-3 text-gray-600 font-medium">Góc máy</th>
                      <th className="p-3 text-orange-600 font-bold">Diễn xuất</th>
                      <th className="p-3 text-gray-600 font-medium">Lời thoại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.script_details.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 align-top">
                        <td className="p-3 text-gray-500 font-mono text-xs pt-4">{row.time || '--'}</td>
                        <td className="p-3 text-gray-700 text-xs pt-4">{row.camera || '--'}</td>
                        <td className="p-3">
                          <textarea className="w-full bg-orange-50/50 border border-orange-100 rounded-md p-2 text-orange-800 text-xs italic resize-none outline-none" defaultValue={row.acting_cue || ''} rows={4} readOnly />
                        </td>
                        <td className="p-3">
                          <textarea className="w-full bg-transparent border border-transparent rounded-md p-2 text-gray-900 leading-relaxed resize-none outline-none" defaultValue={row.dialogue || ''} rows={4} readOnly />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {renderSocialPost(key, title)}
          </React.Fragment>
        );
      })}`;

content = content.replace(oldRenderBlock, newRenderBlock);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Update dynamic rendering successful');
