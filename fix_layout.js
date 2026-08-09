const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', 'utf-8');

// Fix Top Wrappers
content = content.replace(
  '<div className="flex flex-col p-1 md:p-2 bg-slate-50 h-[calc(100vh-64px)] overflow-hidden items-center justify-start">\n      <div className="w-full max-w-7xl bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">\n\n\n        {/* Form Body - LANDSCAPE GRID LAYOUT */}\n        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-1 bg-transparent min-h-0 w-full overflow-hidden">',
  '<div className="flex flex-col bg-white h-[calc(100vh-64px)] w-full overflow-hidden">\n\n        {/* Form Body - LANDSCAPE GRID LAYOUT */}\n        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 min-h-0 w-full overflow-hidden">'
);

// Fix Bottom Wrappers and Grid closure
content = content.replace(
  '              </section>\n\n        </div>\n{/* Footer Actions */}\n        <div className="px-3 py-1.5 border-t border-slate-200 flex items-center justify-between bg-white w-full rounded-b-xl shrink-0">',
  '              </section>\n\n        </div>\n      </div>\n      {/* Footer Actions (Outside Grid) */}\n      <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-between bg-slate-50 w-full shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">'
);

// Remove the extra closing divs at the very bottom
content = content.replace(
  '          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  );\n}',
  '          </div>\n        </div>\n    </div>\n  );\n}'
);


fs.writeFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', content, 'utf-8');
console.log('Fixed outer layout and footer grid bug!');
