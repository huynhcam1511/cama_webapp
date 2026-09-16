'use client';
import { useState } from 'react';
import { saveOffLimit } from './operations-actions';
export default function OffLimits({ departments }: { departments: any[] }) {
 const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
 return <details className="border rounded-lg p-3"><summary className="cursor-pointer text-sm">Cấu hình số người OFF tối đa</summary><form className="flex flex-wrap gap-3 mt-3 items-end" onSubmit={async e=>{e.preventDefault(); const f=new FormData(e.currentTarget);setBusy(true);try{await saveOffLimit(String(f.get('department')),Number(f.get('weekday')),Number(f.get('max')));setMessage('Đã lưu hạn mức');}catch(e){setMessage(e instanceof Error?e.message:'Không lưu được');}finally{setBusy(false);}}}>
 <label className="text-sm">Phòng<select name="department" required className="block border rounded p-2">{departments.map(d=><option key={d.id} value={d.id}>{d.department_name}</option>)}</select></label>
 <label className="text-sm">Ngày<select name="weekday" className="block border rounded p-2">{[1,2,3,4,5,6,0].map(d=><option key={d} value={d}>{d===0?'Chủ nhật':`Thứ ${d+1}`}</option>)}</select></label>
 <label className="text-sm">Tối đa<input name="max" type="number" min="0" required className="block border rounded p-2 w-24" /></label><button disabled={busy} className="bg-emerald-700 text-white rounded px-4 py-2">Lưu</button><p role="status" className="text-sm">{message}</p></form></details>;
}
