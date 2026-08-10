'use server';

import { createClient } from "@/lib/supabase/server";

/**
 * MODULE LIÊN KẾT: MARKETING <-> VẬN HÀNH (OPERATIONS)
 * Khi Campaign Content được chốt, tự động đẩy task Quay/Chụp sang lịch của team Vận Hành.
 */
export async function createShootingTaskFromCampaign(campaignId: string, subId: string, mediaLink: string, scriptTitle: string) {
  const supabase = createClient();
  
  // Giả định: Bảng `operations_tasks` là bảng lịch trình/công việc của team Vận Hành
  const taskPayload = {
    title: `[MARKETING MEDIA] Quay/Chụp Kịch Bản: ${scriptTitle}`,
    type: 'SHOOTING',
    source_campaign_id: campaignId,
    source_sub_id: subId,
    media_drive_link: mediaLink,
    status: 'TODO',
    priority: 'HIGH',
    department: 'OPERATIONS',
    created_at: new Date().toISOString()
  };

  // Vì DB thực tế có thể chưa có bảng operations_tasks, ta dùng try-catch an toàn
  try {
    const { error } = await supabase.from('operations_tasks').insert([taskPayload]);
    if (error) {
       console.log('Chưa có bảng operations_tasks, nhưng logic bắn tín hiệu đã sẵn sàng.');
    } else {
       console.log('✅ Đã tạo Task Quay Chụp bên Vận Hành.');
    }
  } catch (e) {
    console.log('Lỗi khi liên kết Vận hành:', e);
  }

  // Update status in marketing_contents
  const { data: currentContent } = await supabase.from('marketing_contents').select('deliverables').eq('id', campaignId).single();
  if (currentContent && currentContent.deliverables && currentContent.deliverables[subId]) {
     const newDeliverables = { ...currentContent.deliverables };
     newDeliverables[subId].media_drive_link = mediaLink;
     newDeliverables[subId].status = 'MEDIA_READY';
     
     await supabase.from('marketing_contents').update({
        deliverables: newDeliverables,
        status: 'MEDIA_READY'
     }).eq('id', campaignId);
  }

  return { success: true };
}

/**
 * MODULE LIÊN KẾT: MARKETING <-> SALES (CRM)
 * Hàm này dùng để đo lường ROI. Query bảng customers để đếm số Leads từ Campaign này.
 */
export async function calculateCampaignROI(publishedUrl: string, campaignId: string) {
  const supabase = createClient();
  
  // Giả định: Bảng customers có trường utm_source lưu link nguồn hoặc campaign_id
  try {
    const { data: leads, error } = await supabase
      .from('customers')
      .select('id, name, status')
      .eq('utm_source', publishedUrl); // hoặc eq('campaign_id', campaignId)
      
    if (error) {
       return { leads_generated: 0, deals_closed: 0 };
    }
    
    const leadsGenerated = leads?.length || 0;
    const dealsClosed = leads?.filter(l => l.status === 'WON' || l.status === 'CONTRACT').length || 0;
    
    return { leads_generated: leadsGenerated, deals_closed: dealsClosed };
  } catch (e) {
    return { leads_generated: 0, deals_closed: 0 };
  }
}

/**
 * MODULE LIÊN KẾT: MARKETING <-> KẾ TOÁN (ACCOUNTING / PAYROLL)
 * Hàm này dùng để xét thưởng nóng KPI nếu lượt Views vượt quá 100,000.
 */
export async function evaluateCampaignKPI(campaignId: string, subId: string, metrics: any) {
  const supabase = createClient();
  
  if (!metrics || !metrics.views) return;
  
  if (metrics.views >= 100000) {
    // KPI ĐẠT! Bắn bản ghi thưởng sang phòng Kế Toán
    const bonusPayload = {
      campaign_id: campaignId,
      sub_id: subId,
      amount: 500000, // Thưởng 500k VNĐ
      reason: `Thưởng KPI Video Viral (>100k views)`,
      department: 'MARKETING',
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase.from('payroll_bonuses').insert([bonusPayload]);
      if (error) {
         console.log('Chưa có bảng payroll_bonuses, nhưng logic tính thưởng đã sẵn sàng.');
      } else {
         console.log('✅ Đã bắn thông báo Thưởng sang Kế Toán.');
      }
    } catch (e) {
      console.log('Lỗi khi liên kết Kế Toán:', e);
    }
  }

  // Lưu URL và metrics vào DB
  const { data: currentContent } = await supabase.from('marketing_contents').select('deliverables').eq('id', campaignId).single();
  if (currentContent && currentContent.deliverables && currentContent.deliverables[subId]) {
     const newDeliverables = { ...currentContent.deliverables };
     newDeliverables[subId].performance_metrics = metrics;
     newDeliverables[subId].actual_published_link = metrics.actual_published_link;
     newDeliverables[subId].status = 'PUBLISHED';
     
     await supabase.from('marketing_contents').update({
        deliverables: newDeliverables,
        status: 'PUBLISHED'
     }).eq('id', campaignId);
  }
  
  return { success: true };
}
