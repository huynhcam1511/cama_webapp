import {createAdminClient} from '@/lib/supabase/admin';
import {requireActiveUser,requirePermission,getUserPermissions} from '@/lib/rbac';
import OvertimeView from './view';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await requireActiveUser();await requirePermission('STAFF_SCHEDULE','view');const p=(await getUserPermissions(user.id)).get('STAFF_SCHEDULE');const db=createAdminClient();
 let query=db.from('overtime_requests').select('*, user:users!user_id(full_name), contract:contracts(contract_code)').order('starts_at',{ascending:false}).limit(200);
 if(!p?.can_update)query=query.eq('user_id',user.id);
 const [rows,contracts]=await Promise.all([query,db.from('contracts').select('id,contract_code,notes').is('deleted_at',null).order('created_at',{ascending:false}).limit(500)]);
 if(rows.error||contracts.error)return <p role="alert">Không tải được OT. {rows.error?.message||contracts.error?.message}</p>;
 return <OvertimeView rows={rows.data||[]} canCreate={!!p?.can_create} canApprove={!!p?.can_update} contracts={(contracts.data||[]).map(c=>{let m:any={};try{m=typeof c.notes==='string'?JSON.parse(c.notes):c.notes||{};}catch{}return {id:c.id,code:c.contract_code,events:(m.events||[]).map((e:any,i:number)=>({id:e.id||`event-${i+1}`,name:e.name}))};})}/>;
}
