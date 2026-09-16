'use server';
import {createAdminClient} from '@/lib/supabase/admin';import {requireActiveUser,requirePermission} from '@/lib/rbac';import {revalidatePath} from 'next/cache';import {z} from 'zod';
export async function saveVideoRewardRule(views:number,engagement:number){
 await requireActiveUser();await requirePermission('VIDEO_PERFORMANCE_REPORT','update');z.number().finite().nonnegative().parse(views);z.number().finite().nonnegative().parse(engagement);
 const {error}=await createAdminClient().from('video_reward_rules').upsert({id:true,per_thousand_views:views,per_engagement:engagement,updated_at:new Date().toISOString()});if(error)throw new Error(error.message);
}
export async function approveVideoReward(videoId:string,logId:string,userId:string){
 const user=await requireActiveUser();await requirePermission('VIDEO_PERFORMANCE_REPORT','update');z.string().uuid().parse(videoId);z.string().uuid().parse(userId);
 if(user.id===userId)throw new Error('Cần quản lý khác duyệt thưởng cho bạn');
 const db=createAdminClient();const [post,rule]=await Promise.all([db.from('marketing_contents').select('platform_contents').eq('id',videoId).single(),db.from('video_reward_rules').select('*').eq('id',true).single()]);
 if(post.error||rule.error)throw new Error('Không tìm thấy video hoặc chưa cấu hình thưởng');
 const log=post.data.platform_contents?.performance_logs?.find((l:any)=>l.id===logId);if(!log)throw new Error('Không tìm thấy phiên bản');
 const values=['views','likes','comments','shares'].map(k=>z.coerce.number().finite().nonnegative().parse(log[k]||0));
 const amount=Math.round(values[0]/1000*Number(rule.data.per_thousand_views)+(values[1]+values[2]+values[3])*Number(rule.data.per_engagement));
 const {error}=await db.from('video_reward_awards').insert({video_id:videoId,user_id:userId,log_id:logId,amount,rule_snapshot:{...rule.data,metrics:log},approved_by:user.id});
 if(error)throw new Error(error.code==='23505'?'Video này đã được duyệt thưởng':error.message);revalidatePath('/dashboard/payroll');
}
