'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {addDays,format,startOfWeek} from 'date-fns';
import {createWeeklySchedules,ScheduleType} from './actions';
export default function WeeklyRegistration(){
 const router=useRouter();const [week,setWeek]=useState(format(new Date(),'yyyy-MM-dd'));const [types,setTypes]=useState<Record<number,string>>({});const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 return <details className="border rounded-lg p-3"><summary className="text-sm cursor-pointer">Đăng ký OFF / ca tuần</summary><form className="space-y-3 mt-3" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{await createWeeklySchedules(Object.entries(types).filter(([,type])=>type).map(([i,type])=>({date:format(addDays(startOfWeek(new Date(week+'T12:00:00'),{weekStartsOn:1}),Number(i)),'yyyy-MM-dd'),schedule_type:type as ScheduleType,leave_reason:String(f.get('reason')), ...(type==='WORKING'?{start_time:String(f.get('start')),end_time:String(f.get('end'))}:{})})));setMessage('Đã gửi đăng ký chờ duyệt');setTypes({});router.refresh();}catch(e){setMessage(e instanceof Error?e.message:'Không gửi được');}finally{setBusy(false);}}}>
 <label className="block text-sm">Tuần chứa ngày<input aria-label="Tuần chứa ngày" type="date" required value={week} onChange={e=>setWeek(e.target.value)} className="block border rounded p-2"/></label>
 <div className="flex flex-wrap gap-3">{Array.from({length:7},(_,i)=><label key={i} className="text-sm">{format(addDays(startOfWeek(new Date(week+'T12:00:00'),{weekStartsOn:1}),i),'dd/MM')}<select className="block border rounded p-2" value={types[i]||''} onChange={e=>setTypes({...types,[i]:e.target.value})}><option value="">Không đăng ký</option><option value="WEEKLY_OFF">OFF</option><option value="WORKING">Ca làm</option></select></label>)}</div>
 <div className="flex gap-3"><label className="text-sm">Bắt đầu ca<input name="start" type="time" defaultValue="08:30" className="block border p-2 rounded"/></label><label className="text-sm">Kết thúc ca<input name="end" type="time" defaultValue="17:30" className="block border p-2 rounded"/></label></div>
 <input name="reason" required placeholder="Ghi chú đăng ký" aria-label="Ghi chú đăng ký" className="border rounded p-2 w-full"/><button disabled={busy||!Object.values(types).some(Boolean)} className="bg-emerald-700 text-white rounded px-4 py-2 disabled:opacity-50">Gửi đăng ký</button><p role="status" className="text-sm">{message}</p></form></details>;
}
