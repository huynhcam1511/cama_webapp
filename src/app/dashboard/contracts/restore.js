const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/contracts/contract-dialog.tsx', 'utf8');

// 1. Rename components and interfaces
code = code.replace(/ContractDialogProps/g, 'ContractFormProps');
code = code.replace('export default function ContractDialog({', 'import { useRouter } from "next/navigation";\n\nexport default function ContractForm({');

// 2. Add router
code = code.replace('const [loading, setLoading]', 'const router = useRouter();\n  const [loading, setLoading]');

// 3. Replace onClose calls
code = code.replace(/onClose\(\)/g, 'router.push("/dashboard/contracts")');
code = code.replace(/onClick=\{onClose\}/g, 'onClick={() => router.push("/dashboard/contracts")}');

// 4. Remove Modal Wrappers
const oldWrapper = `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-100 border border-border/80 rounded-xl shadow-2xl w-full max-w-[98vw] max-h-[95vh] overflow-hidden flex flex-col">`;
const newWrapper = `<div className="flex flex-col h-full min-h-[calc(100vh-64px)] bg-slate-100">`;
code = code.replace(oldWrapper, newWrapper);

// Remove the trailing closing divs
code = code.replace('    </div>\n    </div>\n  );\n}', '    </div>\n  );\n}');

// 5. Update props
code = code.replace('  onSaved,\n}: ContractFormProps)', '  onSaved,\n  initialData,\n  isEditMode\n}: ContractFormProps & { initialData?: any; isEditMode?: boolean })');

// 6. Remove 'if (!isOpen) return null;'
code = code.replace('if (!isOpen) return null;', '');

fs.writeFileSync('src/app/dashboard/contracts/_components/contract-form.tsx', code);
console.log('Restoration complete.');
