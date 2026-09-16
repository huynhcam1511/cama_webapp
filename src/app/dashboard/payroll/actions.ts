'use server';
import {createAdminClient} from '@/lib/supabase/admin';import {requireActiveUser,requirePermission} from '@/lib/rbac';import {revalidatePath} from 'next/cache';import {z} from 'zod';
import {calculatePayroll} from '@/lib/payroll-calculation';
const periodSchema=z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
async function readAll(build:()=>any){const rows:any[]=[];for(let i=0;;i+=1000){const {data,error}=await build().range(i,i+999);if(error)throw new Error(error.message);rows.push(...data);if(data.length<1000)return rows;}}
export async function getPayroll(period:string){
 await requireActiveUser();await requirePermission('PAYROLL','view');periodSchema.parse(period);const db=createAdminClient();
 const run=await db.from('payroll_runs').select('*').eq('period',period).maybeSingle();if(run.error)throw new Error(run.error.message);
 if(run.data)return {rows:run.data.rows as ReturnType<typeof calculatePayroll>[],finalized:true,finalizedAt:run.data.finalized_at};
 const [y,m]=period.split('-').map(Number);const start=period+'-01';const next=`${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`;
 const [users,profiles,attendance,schedules,ot,transactions,awards,contracts,allocations]=await Promise.all([
  readAll(()=>db.from('users').select('id,full_name,employee_code,is_active,default_start_time').order('id')),
  readAll(()=>db.from('payroll_profiles').select('*').order('user_id')),
  readAll(()=>db.from('attendance_logs').select('*').gte('date',start).lt('date',next).order('id')),
  readAll(()=>db.from('staff_schedules').select('*').gte('date',start).lt('date',next).order('id')),
  readAll(()=>db.from('overtime_requests').select('*').eq('status','APPROVED').gte('ends_at',start+'T00:00:00+07:00').lt('ends_at',next+'T00:00:00+07:00').order('id')),
  readAll(()=>db.from('kpi_transactions').select('*').gte('created_at',start+'T00:00:00+07:00').lt('created_at',next+'T00:00:00+07:00').order('id')),
  readAll(()=>db.from('video_reward_awards').select('*').gte('approved_at',start+'T00:00:00+07:00').lt('approved_at',next+'T00:00:00+07:00').order('video_id')),
  readAll(()=>db.from('contracts').select('id,contract_code,total_amount,status,notes,created_at').is('deleted_at',null).order('id')),
  readAll(()=>db.from('contract_commission_allocations').select('*').order('contract_id').order('user_id')),
 ]);
 const monthContracts=contracts.filter(c=>{let meta:any={};try{meta=typeof c.notes==='string'?JSON.parse(c.notes):c.notes||{};}catch{}return String(meta.contract_date||c.created_at).slice(0,7)===period;});
 const rows=users.filter(u=>u.is_active||profiles.some(p=>p.user_id===u.id)||attendance.some(a=>a.user_id===u.id)||ot.some(o=>o.user_id===u.id)).map(u=>calculatePayroll(u,profiles.find(p=>p.user_id===u.id),attendance,schedules,ot,transactions,awards,monthContracts,allocations));
 return {rows,finalized:false,finalizedAt:null};
}
export async function savePayrollProfile(input:unknown){
 const user=await requireActiveUser();await requirePermission('PAYROLL','update');const money=z.coerce.number().finite().nonnegative();
 const p=z.object({user_id:z.string().uuid(),base_salary:money,allowance:money,ot_hourly_rate:money.nullable(),late_per_minute:money,commission_percent:money.max(100)}).parse(input);
 const {error}=await createAdminClient().from('payroll_profiles').upsert({...p,updated_by:user.id,updated_at:new Date().toISOString()});if(error)throw new Error(error.message);revalidatePath('/dashboard/payroll');
}
export async function saveCommissionAllocation(contract_id:string,user_id:string,share_percent:number){
 await requireActiveUser();await requirePermission('PAYROLL','update');z.string().uuid().parse(contract_id);z.string().uuid().parse(user_id);z.number().finite().positive().max(100).parse(share_percent);
 const {error}=await createAdminClient().from('contract_commission_allocations').upsert({contract_id,user_id,share_percent});if(error)throw new Error(error.message);revalidatePath('/dashboard/payroll');
}
export async function finalizePayroll(period:string){
 const user=await requireActiveUser();await requirePermission('PAYROLL','update');const result=await getPayroll(period);if(result.finalized)throw new Error('Kỳ lương đã chốt');
 if(!result.rows.length||result.rows.some(r=>!r.configured))throw new Error('Cần cấu hình lương cho tất cả nhân viên trước khi chốt');
 const {error}=await createAdminClient().from('payroll_runs').insert({period,rows:result.rows,finalized_by:user.id});if(error)throw new Error(error.code==='23505'?'Kỳ lương đã được chốt':error.message);revalidatePath('/dashboard/payroll');
}
