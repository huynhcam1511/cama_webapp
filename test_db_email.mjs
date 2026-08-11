import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runCron() {
    try {
        const now = new Date();
        
        // 1. Fetch LỊCH HẸN & VẬN HÀNH
        const targetTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); 
        const targetDateStr = targetTime.toLocaleDateString("en-CA");
        
        const h = targetTime.getHours().toString().padStart(2, '0');
        const startHourStr = `${h}:00:00`;
        const endHourStr = `${h}:59:59`;

        const { data: schedules } = await supabase
            .from("operation_schedules")
            .select("*, assignee:primary_assignee_id(email, full_name)")
            .eq("date", targetDateStr)
            .neq("status", "COMPLETED")
            .neq("status", "CANCELLED")
            .neq("status", "Đã đến")
            .neq("status", "Không đến");

        const upcomingAppointments = (schedules || []).filter(s => 
            s.event_type !== 'INTERNAL_TASK' && s.start_time >= startHourStr && s.start_time <= endHourStr
        );
        const todayTodos = (schedules || []).filter(s => s.event_type === 'INTERNAL_TASK');

        // 2. Fetch ĐƠN HÀNG
        const { data: orders } = await supabase
            .from("orders")
            .select("*, pic:pic_id(full_name)")
            .neq("completion_status", "COMPLETED")
            .is("deleted_at", null);
            
        const urgentOrders = (orders || []).filter(o => {
            if (!o.checklist) return false;
            try {
                const checklist = typeof o.checklist === 'string' ? JSON.parse(o.checklist) : o.checklist;
                return checklist.some(item => !item.done);
            } catch (e) {
                return false;
            }
        }).slice(0, 5);

        // 3. Fetch CHĂM SÓC KHÁCH HÀNG
        const { data: contracts } = await supabase
            .from("contracts")
            .select("contract_code, customers(bride_name, groom_name, phone), event_date")
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(3);

        // 4. Build Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let apptHtml = upcomingAppointments.length ? '' : '<tr><td colspan="4" style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b; text-align: center;">Không có lịch hẹn trong 2 giờ tới</td></tr>';
        upcomingAppointments.forEach(s => {
            apptHtml += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb;">${s.start_time || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${s.customer_name || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #475569;">${s.service_group || ''} / ${s.appointment_type || ''}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;"><span style="color: #d97706; font-size: 13px; font-weight: 500;">${s.status || 'Chờ đến'}</span></td>
                </tr>
            `;
        });

        let todoHtml = todayTodos.length ? '' : '<p style="color: #64748b; font-size: 13px;">Không có công việc nội bộ nào chưa hoàn thành hôm nay.</p>';
        todayTodos.forEach(t => {
            todoHtml += `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #3b82f6; padding: 12px; border-radius: 4px; margin-bottom: 10px;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b;">${t.title || 'Công việc nội bộ'}</p>
                    <p style="margin: 0; font-size: 13px; color: #475569;">PIC: ${t.assignee?.full_name || 'Chưa gán'} | Hạn: ${t.start_time || 'Trong ngày'}</p>
                </div>
            `;
        });

        let csHtml = (contracts || []).length ? '' : '<p style="color: #64748b; font-size: 13px;">Không có tác vụ CSKH cần xử lý.</p>';
        (contracts || []).forEach(c => {
            csHtml += `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #10b981; padding: 12px; border-radius: 4px; margin-bottom: 10px;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b;">[Hợp đồng mới] ${c.customers?.bride_name || ''} & ${c.customers?.groom_name || ''}</p>
                    <p style="margin: 0; font-size: 13px; color: #475569;">Mã HĐ: ${c.contract_code} | Vui lòng gọi điện tư vấn và follow-up.</p>
                </div>
            `;
        });

        let orderHtml = urgentOrders.length ? '' : '<tr><td colspan="4" style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b; text-align: center;">Không có đơn hàng nào tồn đọng công việc</td></tr>';
        urgentOrders.forEach(o => {
            orderHtml += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${o.order_code}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #475569;">${o.service_type || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #ef4444; font-size: 13px;">Còn task chưa check</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${o.pic?.full_name || 'Chưa gán'}</td>
                </tr>
            `;
        });

        const htmlBody = `
            <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #f8fafc; padding: 20px; border-bottom: 1px solid #e2e8f0;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">📊 Báo Cáo Tổng Hợp Công Việc Hôm Nay</h2>
                    <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">CAMA CRM - Tự động tạo lúc ${now.toLocaleTimeString('vi-VN')}</p>
                </div>
                
                <div style="padding: 20px;">
                    <!-- MODULE 1: LỊCH HẸN VẬN HÀNH -->
                    <h3 style="color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; font-size: 16px;">📅 Lịch Hẹn & Vận Hành (Trong 2 giờ tới)</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                        <tr style="background-color: #f1f5f9; text-align: left;">
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">Giờ</th>
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">Khách hàng</th>
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">Dịch vụ</th>
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">Trạng thái</th>
                        </tr>
                        ${apptHtml}
                    </table>

                    <!-- MODULE 1.5: TODO NỘI BỘ -->
                    <h3 style="color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; font-size: 16px;">☑️ Việc Nội Bộ Chưa Xong (Hôm nay)</h3>
                    <div style="margin-bottom: 25px;">
                        ${todoHtml}
                    </div>

                    <!-- MODULE 2: CHĂM SÓC KHÁCH HÀNG -->
                    <h3 style="color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; font-size: 16px;">🎧 Chăm Sóc Khách Hàng (Gợi ý cần xử lý)</h3>
                    <div style="margin-bottom: 25px;">
                        ${csHtml}
                    </div>

                    <!-- MODULE 3: ĐƠN HÀNG -->
                    <h3 style="color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; font-size: 16px;">📦 Tiến Độ Đơn Hàng (Đang tồn đọng việc)</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr style="background-color: #f1f5f9; text-align: left;">
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">Mã ĐH</th>
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">Loại</th>
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">Tình trạng</th>
                            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 600;">PIC</th>
                        </tr>
                        ${orderHtml}
                    </table>
                    
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
                        Đây là email tự động tổng hợp từ hệ thống CAMA CRM. Vui lòng truy cập web để xử lý.
                    </p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `CAMA CRM <${process.env.EMAIL_USER}>`,
            to: 'anhthi20041105@gmail.com',
            subject: `[CAMA CRM] Báo cáo tổng hợp: Lịch trình & Công việc (${targetDateStr})`,
            html: htmlBody
        });
        
        console.log("SUCCESS: Real database aggregated email sent to anhthi20041105@gmail.com!");
    } catch (err) {
        console.error("ERROR running cron:", err);
    }
}

runCron();
