const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state for Import Modal
if (!content.includes('const [showImportModal, setShowImportModal] = useState(false);')) {
  content = content.replace('const [selectedSubRow, setSelectedSubRow] = useState<any>(null);', 
    'const [selectedSubRow, setSelectedSubRow] = useState<any>(null);\n  const [showImportModal, setShowImportModal] = useState(false);\n  const [importJson, setImportJson] = useState("");');
}

// 2. Add the handleImport function
if (!content.includes('const handleImportJson = async () => {')) {
  const importFunc = `
  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJson);
      await createMarketingContent(parsed);
      setShowImportModal(false);
      setImportJson("");
      loadContents();
      alert("Import thành công!");
    } catch (err) {
      alert("Lỗi JSON không hợp lệ: " + (err as Error).message);
    }
  };
`;
  content = content.replace('const handleCreateNew = async () => {', importFunc + '\n  const handleCreateNew = async () => {');
}

// 3. Add the button in Action Bar
if (!content.includes('Nhập JSON AI')) {
  const importButton = `
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImportModal(true)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Nhập JSON AI
          </button>
          <button onClick={handleCreateNew}`;
  
  content = content.replace('<button onClick={handleCreateNew}', importButton);
  content = content.replace('Tạo Ý Tưởng Mới\n        </button>', 'Tạo Ý Tưởng Mới\n        </button>\n        </div>');
}

// 4. Add the Modal UI at the bottom
if (!content.includes('Import JSON Modal')) {
  const modalHtml = `
      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nhập Kịch Bản Từ AI (Antigravity)</h3>
            <p className="text-sm text-gray-500 mb-4">Dán chuỗi JSON định dạng chuẩn vào ô dưới đây để tự động tạo Campaign.</p>
            <textarea 
              className="w-full flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none min-h-[400px]"
              placeholder='{\n  "title": "Campaign...",\n  "deliverables": { ... }\n}'
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold text-sm">Hủy</button>
              <button onClick={handleImportJson} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm">Lưu Campaign</button>
            </div>
          </div>
        </div>
      )}
  `;
  content = content.replace('</div>\n  );\n}\n', modalHtml + '\n    </div>\n  );\n}\n');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Added Import JSON modal successfully!");
