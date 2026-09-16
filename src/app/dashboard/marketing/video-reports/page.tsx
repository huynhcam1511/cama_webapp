import {getVideoReports} from './actions';
import {getUserPermissions,requireActiveUser} from '@/lib/rbac';
import {createAdminClient} from '@/lib/supabase/admin';
import VideoReportsView from './view';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await requireActiveUser();const rows=await getVideoReports();const permissions=(await getUserPermissions(user.id)).get('VIDEO_PERFORMANCE_REPORT');
 const db=createAdminClient();const users=await db.from('users').select('id,full_name').eq('is_active',true);
 return <VideoReportsView rows={rows} users={users.data||[]} canCreate={!!permissions?.can_create} canUpdate={!!permissions?.can_update}/>;
}
