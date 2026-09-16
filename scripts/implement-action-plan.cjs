const fs = require('fs');
function edit(path, fn) { const s = fs.readFileSync(path, 'utf8'); fs.writeFileSync(path, fn(s).replace(/\r\n/g, '\n')); }
edit('src/app/dashboard/contracts/actions.ts', s => s
 .replace('import { generateSequentialCode }', 'import { orderDepartment } from "@/lib/order-departments";\nimport { generateSequentialCode }')
 .replace(/  const departmentFor = \(category: string\) => \{[\s\S]*?  const departmentName:[\s\S]*?\n  };/, '  const departmentFor = orderDepartment;')
 .replace('Array.from(new Set((eventItems.length ? eventItems : [{ category: "" }]).map((item: any) => departmentFor(item.category))))', 'Array.from(new Set(eventItems.map((item: any) => departmentFor(item.category)).filter(Boolean)))'));
edit('src/app/dashboard/orders/orders-client.tsx', s => s
 .replace('import QRScanner', 'import { orderDepartmentLabel } from "@/lib/order-departments";\nimport QRScanner')
 .replace('  const [searchQuery', '  const [filterDepartment, setFilterDepartment] = useState("ALL");\n  const [searchQuery')
 .replace('const filteredOrders = orders.filter(o => {', 'const filteredOrders = orders.filter(o => {\n    if (filterDepartment !== "ALL" && (o.operational_department === "VAN_HANH" ? "UNASSIGNED" : o.operational_department || "UNASSIGNED") !== filterDepartment) return false;')
 .replaceAll('{order.operational_department === "VAY" ? "Phòng Váy" : order.operational_department === "SUOT" ? "Phòng Suốt" : "Phòng Vận hành"}', '{orderDepartmentLabel(order.operational_department)}')
 .replace('{/* Desktop Table View */}', `<label className="flex items-center gap-3 py-3 text-sm">Phòng phụ trách
          <select aria-label="Phòng phụ trách" className="border rounded-md p-2 bg-white" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
            <option value="ALL">Tất cả</option><option value="VAY">Phòng Váy</option><option value="SUOT">Phòng Suit</option><option value="UNASSIGNED">Chưa phân phòng</option>
          </select></label>
          {filteredOrders.length === 0 && <p className="p-4 text-sm text-slate-500">Không tìm thấy đơn hàng nào.</p>}
          {Array.from(new Set(filteredOrders.map(order => order.contract_id || order.id))).map(groupId => {
            const contractOrders = filteredOrders.filter(order => (order.contract_id || order.id) === groupId);
            return <details key={groupId} open className="mb-3 border rounded-lg bg-white">
              <summary className="p-3 cursor-pointer font-semibold text-sm">{contractOrders[0].contract?.contract_code || 'Đơn lẻ'} · {contractOrders[0].contract?.customer?.bride_name || ''} · {contractOrders.length} đơn</summary>
              {Array.from(new Set(contractOrders.map(order => order.event_id || order.service_type || order.id))).map(eventId => {
                const filteredOrders = contractOrders.filter(order => (order.event_id || order.service_type || order.id) === eventId);
                return <section key={eventId} className="p-2"><h3 className="px-2 py-2 text-sm text-slate-600">{filteredOrders[0].service_type || 'Chưa có sự kiện'}</h3>
          {/* Desktop Table View */}`)
 .replace('gap-3 pb-24', 'gap-3')
 .replace(/(\s*)<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Pick Scanner Modal \*\/\}/, '$1</div>\n                </section>;\n              })}\n            </details>;\n          })}\n        </div>\n      </div>\n\n      {/* Pick Scanner Modal */}'));
edit('src/app/dashboard/customer-journey/[id]/customer-journey-detail-client.tsx', s => s
 .replace('  const saveQueueRef', `  const [saveError, setSaveError] = useState("");
  const dirtyRef = useRef(false);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = ''; } };
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a[href]');
      if (anchor && dirtyRef.current && !window.confirm('Thay đổi chưa được lưu. Bạn vẫn muốn rời trang?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', navigate, true); };
  }, []);
  const saveQueueRef`)
 .replace('    setSaving(true);', '    dirtyRef.current = true;\n    setSaveError("");\n    setSaving(true);')
 .replace('      })\n      .catch((error)', '        if (saveVersionRef.current === version) { dirtyRef.current = false; setSaveError(""); }\n      })\n      .catch((error)')
 .replace('console.error("Journey auto-save failed:", error);', 'console.error("Journey auto-save failed:", error);\n        if (saveVersionRef.current === version) setSaveError("Chưa lưu được thay đổi. Vui lòng thử lại.");')
 .replace('onClick={() => router.push("/dashboard/customer-journey")}', 'onClick={() => { if (!dirtyRef.current || window.confirm("Thay đổi chưa được lưu. Bạn vẫn muốn rời trang?")) router.push("/dashboard/customer-journey"); }}')
 .replace('{saving && <span', '{!saving && <span role="status" className="text-xs mt-1 text-slate-600">{saveError || "Đã lưu tất cả thay đổi"}{saveError && <button className="ml-2 underline" onClick={() => saveToDB(journeyData, notes)}>Thử lại</button>}</span>}\n           {saving && <span')
 .replace('onChange={(e) => setNotes(e.target.value)}\n              onBlur={() => saveToDB(journeyData, notes)}', 'onChange={(e) => { setNotes(e.target.value); saveToDB(journeyData, e.target.value); }}'));
