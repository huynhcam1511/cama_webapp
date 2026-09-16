import { getVideoReportById } from '../actions';
import { getVideoRewardRule, getVideoRewardAward } from '../reward-actions';
import VideoDetailView from './video-detail-view';
import { getUserPermissions, requireActiveUser, requirePermission } from '@/lib/rbac';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const user = await requireActiveUser();
  const isNew = params.id === 'new';

  if (isNew) {
    await requirePermission('VIDEO_PERFORMANCE_REPORT', 'create');
  } else {
    await requirePermission('VIDEO_PERFORMANCE_REPORT', 'view');
  }

  const permissionsMap = await getUserPermissions(user.id);
  const permissions = permissionsMap.get('VIDEO_PERFORMANCE_REPORT') || {
    can_create: false,
    can_update: false,
    can_delete: false
  };

  const video = isNew ? null : await getVideoReportById(params.id);
  const rewardRule = await getVideoRewardRule();
  const rewardAward = isNew ? null : await getVideoRewardAward(params.id);

  const db = createAdminClient();
  const { data: users } = await db
    .from('users')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name');

  return (
    <VideoDetailView
      isNew={isNew}
      initialData={video}
      permissions={permissions}
      rewardRule={rewardRule}
      rewardAward={rewardAward}
      users={users || []}
      currentUserId={user.id}
    />
  );
}
