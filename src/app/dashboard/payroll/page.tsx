import {getPayroll} from './actions';
import {requireActiveUser,getUserPermissions} from '@/lib/rbac';
import {createAdminClient} from '@/lib/supabase/admin';
import PayrollView from './view';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:{period?:string}}){
 const user=await requireActiveUser();
 const period=searchParams.period||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit'}).format(new Date());
 const permissions=(await getUserPermissions(user.id)).get('PAYROLL');
 try{
  const result=await getPayroll(period);const db=createAdminClient();
  const [profiles,contracts]=await Promise.all([db.from('payroll_profiles').select('*'),db.from('contracts').select('id,contract_code').is('deleted_at',null).order('created_at',{ascending:false}).limit(500)]);
  if(profiles.error||contracts.error)throw new Error(profiles.error?.message||contracts.error?.message);
  return <PayrollView period={period} result={result} profiles={profiles.data||[]} contracts={contracts.data||[]} canUpdate={!!permissions?.can_update}/>;
 }catch(e){return <main><h1 className="text-2xl font-semibold">Bảng lương</h1><p role="alert" className="mt-4">Không tải được dữ liệu bảng lương: {e instanceof Error?e.message:'Lỗi hệ thống'}</p></main>;}
}
