'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireActiveUser, requirePermission } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function saveOffLimit(department: string, weekday: number, max: number) {
 await requireActiveUser(); await requirePermission('STAFF_SCHEDULE','update');
 z.string().uuid().parse(department); z.number().int().min(0).max(6).parse(weekday); z.number().int().min(0).parse(max);
 const {error}=await createAdminClient().from('staff_off_limits').upsert({department_id:department,weekday,max_off:max});
 if(error)throw new Error(error.message); revalidatePath('/dashboard/schedules/staff');
}
export async function createOvertime(input: unknown) {
 const user=await requireActiveUser(); await requirePermission('STAFF_SCHEDULE','create');
 const p=z.object({starts_at:z.string().datetime({offset:true}),ends_at:z.string().datetime({offset:true}),reason:z.string().trim().min(1).max(3000),contract_id:z.string().uuid().nullable(),event_id:z.string().nullable()}).parse(input);
 const duration=Date.parse(p.ends_at)-Date.parse(p.starts_at);
 if(duration<=0||duration>86400000)throw new Error('OT phải dài hơn 0 và không quá 24 giờ');
 const db=createAdminClient();
 if(p.contract_id){const {data,error}=await db.from('contracts').select('notes').eq('id',p.contract_id).is('deleted_at',null).single();if(error||!data)throw new Error('Không tìm thấy hợp đồng');
  const meta=typeof data.notes==='string'?JSON.parse(data.notes||'{}'):data.notes||{};
  if(p.event_id&&!meta.events?.some((e:any,i:number)=>(e.id||`event-${i+1}`)===p.event_id))throw new Error('Sự kiện không thuộc hợp đồng');
 }else if(p.event_id)throw new Error('Cần chọn hợp đồng');
 const {error}=await db.from('overtime_requests').insert({...p,user_id:user.id});if(error)throw new Error(error.message);
 revalidatePath('/dashboard/schedules/overtime');
}
export async function approveOvertime(id:string,status:'APPROVED'|'REJECTED'){
 const user=await requireActiveUser();await requirePermission('STAFF_SCHEDULE','update');z.string().uuid().parse(id);z.enum(['APPROVED','REJECTED']).parse(status);
 const db=createAdminClient();const {data:ot,error:readError}=await db.from('overtime_requests').select('*').eq('id',id).eq('status','PENDING').single();
 if(readError||!ot)throw new Error('Yêu cầu đã được xử lý hoặc không tồn tại');
 if(ot.user_id===user.id)throw new Error('Cần một quản lý khác duyệt OT của bạn');
 let rate=null,amount=null;
 if(status==='APPROVED'){
  const {data:p,error}=await db.from('payroll_profiles').select('ot_hourly_rate').eq('user_id',ot.user_id).single();
  if(error||p?.ot_hourly_rate==null)throw new Error('Chưa cấu hình đơn giá OT trong bảng lương');
  rate=Number(p.ot_hourly_rate);amount=Math.round((Date.parse(ot.ends_at)-Date.parse(ot.starts_at))/3600000*rate);
 }
 const {error}=await db.from('overtime_requests').update({status,approved_by:user.id,approved_at:new Date().toISOString(),hourly_rate:rate,amount}).eq('id',id).eq('status','PENDING').select('id').single();
 if(error)throw new Error(error.message);revalidatePath('/dashboard/schedules/overtime');revalidatePath('/dashboard/payroll');
}
