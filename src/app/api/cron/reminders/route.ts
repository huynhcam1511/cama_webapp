import { NextResponse } from 'next/server';
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// Nhân sự nhận mail thông báo: Nhi, Hiền, Quân, Châu và email test Huỳnh Kiến Cẩm
const DEFAULT_RECIPIENTS = [
  'huynhkiencam151102@gmail.com',  // Huỳnh Kiến Cẩm (Admin / Test)
  'tranngocthiennhi0105@gmail.com', // Thiên Nhi (Media)
  'np.thaohienwork@gmail.com',      // Thảo Hiền (Sale / Tư vấn)
  'nauq.contact2802@gmail.com',     // Nguyễn Minh Quân (Vận hành / Phòng Suit)
  'duocsitien0108@gmail.com',       // Trần Quỳnh Châu (Vận hành / Phòng Váy)
];

function getRecipients(): string[] {
  const envEmails = process.env.REMINDER_EMAILS
    ? process.env.REMINDER_EMAILS.split(',').map(e => e.trim()).filter(Boolean)
    : [];
  const set = new Set([...DEFAULT_RECIPIENTS, ...envEmails]);
  return Array.from(set);
}

function getVietnamDateTime() {
  const now = new Date();
  // Convert to UTC+7 (Vietnam Time)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (7 * 3600000));

  const yyyy = vnTime.getFullYear();
  const mm = String(vnTime.getMonth() + 1).padStart(2, '0');
  const dd = String(vnTime.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const tomorrow = new Date(vnTime.getTime() + 24 * 3600000);
  const tomYyyy = tomorrow.getFullYear();
  const tomMm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tomDd = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${tomYyyy}-${tomMm}-${tomDd}`;

  const hours = vnTime.getHours();
  const minutes = vnTime.getMinutes();
  const currentMinutesFromMidnight = hours * 60 + minutes;

  return { vnTime, todayStr, tomorrowStr, currentMinutesFromMidnight, hours, minutes };
}

function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export async function GET(request: Request) {
  return handleReminders(request);
}

export async function POST(request: Request) {
  return handleReminders(request);
}

async function handleReminders(request: Request) {
  try {
    const url = new URL(request.url);
    const isDryRun = url.searchParams.get('dry_run') === 'true';
    const isForce = url.searchParams.get('force') === 'true';

    const supabase = createAdminClient();
    const { vnTime, todayStr, tomorrowStr, currentMinutesFromMidnight, hours, minutes } = getVietnamDateTime();
    const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    console.log(`[Cron Reminders] Running at ${todayStr} ${timeFormatted} (UTC+7)`);

    // 1. Fetch operation schedules for TODAY and TOMORROW
    const { data: schedules, error: scheduleError } = await supabase
      .from("operation_schedules")
      .select(`
        id, title, event_type, date, start_time, end_time, location, status,
        customer_name, customer_phone, service_group, service_content, notes,
        customer:customers(bride_name, phone),
        primary_assignee:users!primary_assignee_id(full_name, email)
      `)
      .in("date", [todayStr, tomorrowStr])
      .not("status", "in", '("CANCELLED","COMPLETED","NO_SHOW")');

    if (scheduleError) {
      console.error("[Cron Reminders] Error fetching schedules:", scheduleError);
      return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }

    // 2. Fetch orders for TODAY and TOMORROW
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select(`
        id, order_code, service_type, event_date, delivery_time, return_date,
        completion_status, checklist, notes, operational_department,
        contract:contracts(contract_code, customer:customers(bride_name, phone)),
        pic:users!pic_id(full_name, email)
      `)
      .in("event_date", [todayStr, tomorrowStr])
      .is("deleted_at", null)
      .not("completion_status", "in", '("CANCELLED","COMPLETED")');

    if (orderError) {
      console.error("[Cron Reminders] Error fetching orders:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 3. Fetch past reminder logs to avoid duplicate emails
    const allEntityIds = [
      ...(schedules || []).map(s => s.id),
      ...(orders || []).map(o => o.id),
    ];

    const loggedReminders = new Set<string>();
    if (allEntityIds.length > 0 && !isForce) {
      const { data: logs } = await supabase
        .from("reminder_logs")
        .select("entity_id, reminder_type")
        .in("entity_id", allEntityIds);

      (logs || []).forEach((log: any) => {
        loggedReminders.add(`${log.entity_id}_${log.reminder_type}`);
      });
    }

    // 4. Filter items for "TRƯỚC 1 NGÀY" (Date == Tomorrow)
    const schedules1Day = (schedules || []).filter(s => {
      if (s.date !== tomorrowStr) return false;
      return !loggedReminders.has(`${s.id}_1_DAY`);
    });

    const orders1Day = (orders || []).filter(o => {
      if (o.event_date !== tomorrowStr) return false;
      return !loggedReminders.has(`${o.id}_1_DAY`);
    });

    // 5. Filter items for "TRƯỚC 2 TIẾNG" (Date == Today, within ~2 hours)
    const schedules2Hours = (schedules || []).filter(s => {
      if (s.date !== todayStr) return false;
      if (loggedReminders.has(`${s.id}_2_HOURS`)) return false;
      
      const startMins = parseTimeToMinutes(s.start_time);
      if (startMins === null) return false;
      const diff = startMins - currentMinutesFromMidnight;
      // Trong khoảng 0 -> 125 phút (trước 2 tiếng) hoặc trễ dưới 15 phút
      return diff >= -15 && diff <= 125;
    });

    const orders2Hours = (orders || []).filter(o => {
      if (o.event_date !== todayStr) return false;
      if (loggedReminders.has(`${o.id}_2_HOURS`)) return false;

      const deliveryMins = parseTimeToMinutes(o.delivery_time);
      if (deliveryMins === null) return false;
      const diff = deliveryMins - currentMinutesFromMidnight;
      return diff >= -15 && diff <= 125;
    });

    const has1DayReminders = schedules1Day.length > 0 || orders1Day.length > 0;
    const has2HoursReminders = schedules2Hours.length > 0 || orders2Hours.length > 0;

    if (!has1DayReminders && !has2HoursReminders) {
      return NextResponse.json({
        success: true,
        message: "Không có sự kiện mới nào cần gửi nhắc hẹn tại thời điểm này.",
        checked_at: `${todayStr} ${timeFormatted}`,
        stats: {
          schedules_today: (schedules || []).filter(s => s.date === todayStr).length,
          schedules_tomorrow: (schedules || []).filter(s => s.date === tomorrowStr).length,
          orders_today: (orders || []).filter(o => o.event_date === todayStr).length,
          orders_tomorrow: (orders || []).filter(o => o.event_date === tomorrowStr).length,
        }
      });
    }

    const recipients = getRecipients();
    const newLogsToInsert: Array<{ entity_type: string; entity_id: string; reminder_type: string; recipients: string[] }> = [];

    // Send Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 6. Gửi Mail CẢNH BÁO KHẨN CẤP: TRƯỚC 2 TIẾNG (nếu có)
    if (has2HoursReminders) {
      const urgentScheduleRows = schedules2Hours.map(s => {
        const cust = Array.isArray(s.customer) ? s.customer[0] : s.customer;
        const custName = (cust as any)?.bride_name || s.customer_name || 'Khách chưa đặt tên';
        const custPhone = (cust as any)?.phone || s.customer_phone || 'Chưa có SĐT';
        const pic = (s.primary_assignee as any)?.full_name || 'Chưa phân công';
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; font-weight: 700; color: #dc2626; font-size: 14px;">${s.start_time || 'N/A'}</td>
            <td style="padding: 10px 12px;">
              <div style="font-weight: 600; color: #0f172a;">${custName}</div>
              <div style="font-size: 12px; color: #64748b;">${custPhone}</div>
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #334155;">
              ${s.service_group ? `<b>${s.service_group}</b> - ` : ''}${s.title || s.service_content || 'Lịch hẹn'}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569;">${pic}</td>
          </tr>
        `;
      }).join('');

      const urgentOrderRows = orders2Hours.map(o => {
        const custName = (o.contract as any)?.customer?.bride_name || 'Khách lẻ';
        const phone = (o.contract as any)?.customer?.phone || 'Chưa có SĐT';
        const pic = (o.pic as any)?.full_name || 'Chưa phân công';
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; font-weight: 700; color: #2563eb; font-size: 14px;">${o.order_code}</td>
            <td style="padding: 10px 12px; font-weight: 700; color: #dc2626; font-size: 14px;">${o.delivery_time || 'Hôm nay'}</td>
            <td style="padding: 10px 12px;">
              <div style="font-weight: 600; color: #0f172a;">${custName}</div>
              <div style="font-size: 12px; color: #64748b;">${phone}</div>
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #334155;">${o.service_type || 'Giao đồ'}</td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569;">${pic}</td>
          </tr>
        `;
      }).join('');

      const urgentHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #fca5a5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #ffffff; padding: 22px 24px; text-align: left;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              🔴 CẢNH BÁO KHẨN CẤP (TRONG 2 TIẾNG TỚI)
            </div>
            <h1 style="margin: 0; font-size: 21px; font-weight: 800;">Lịch Hẹn & Đơn Hàng Sắp Đến Giờ</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Thời gian kiểm tra: ${timeFormatted} ngày ${todayStr}</p>
          </div>

          <div style="padding: 24px;">
            <p style="margin: 0 0 18px 0; font-size: 14px; color: #334155; line-height: 1.5;">
              Xin chào <b>Nhi, Hiền, Quân, Châu</b>,<br/>
              Hệ thống CAMA CRM phát hiện các lịch hẹn và đơn hàng cần bàn giao trong vòng <b>2 tiếng tới</b> hôm nay:
            </p>

            ${schedules2Hours.length > 0 ? `
              <h3 style="color: #991b1b; font-size: 15px; font-weight: 700; margin: 20px 0 8px 0; text-transform: uppercase;">
                📅 Lịch hẹn khách sắp đến (${schedules2Hours.length} lịch)
              </h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #fee2e2; text-align: left; color: #991b1b; font-size: 12px;">
                    <th style="padding: 10px 12px;">Giờ hẹn</th>
                    <th style="padding: 10px 12px;">Khách hàng</th>
                    <th style="padding: 10px 12px;">Nội dung</th>
                    <th style="padding: 10px 12px;">Phụ trách</th>
                  </tr>
                </thead>
                <tbody>${urgentScheduleRows}</tbody>
              </table>
            ` : ''}

            ${orders2Hours.length > 0 ? `
              <h3 style="color: #1e3a8a; font-size: 15px; font-weight: 700; margin: 20px 0 8px 0; text-transform: uppercase;">
                📦 Đơn hàng cần bàn giao (${orders2Hours.length} đơn)
              </h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #dbeafe; text-align: left; color: #1e40af; font-size: 12px;">
                    <th style="padding: 10px 12px;">Mã ĐH</th>
                    <th style="padding: 10px 12px;">Giờ giao</th>
                    <th style="padding: 10px 12px;">Khách hàng</th>
                    <th style="padding: 10px 12px;">Dịch vụ</th>
                    <th style="padding: 10px 12px;">Phụ trách</th>
                  </tr>
                </thead>
                <tbody>${urgentOrderRows}</tbody>
              </table>
            ` : ''}

            <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <a href="https://cama-web--cama-webapp.asia-southeast1.hosted.app/dashboard" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 26px; font-weight: 700; font-size: 14px; border-radius: 8px;">
                Mở CAMA CRM để xử lý ngay →
              </a>
            </div>
          </div>
        </div>
      `;

      if (!isDryRun) {
        await transporter.sendMail({
          from: `"CAMA CRM Alert" <${process.env.EMAIL_USER}>`,
          to: recipients.join(', '),
          subject: `🔴 [CẨN GẤP - 2 TIẾNG TỚI] Có ${schedules2Hours.length} lịch hẹn & ${orders2Hours.length} đơn hàng đến hạn (${timeFormatted})`,
          html: urgentHtml,
        });

        schedules2Hours.forEach(s => {
          newLogsToInsert.push({ entity_type: 'SCHEDULE', entity_id: s.id, reminder_type: '2_HOURS', recipients });
        });
        orders2Hours.forEach(o => {
          newLogsToInsert.push({ entity_type: 'ORDER', entity_id: o.id, reminder_type: '2_HOURS', recipients });
        });
      }
    }

    // 7. Gửi Mail TỔNG HỢP: TRƯỚC 1 NGÀY (Lịch ngày mai)
    if (has1DayReminders) {
      const scheduleRows1Day = schedules1Day.map(s => {
        const cust = Array.isArray(s.customer) ? s.customer[0] : s.customer;
        const custName = (cust as any)?.bride_name || s.customer_name || 'Khách chưa đặt tên';
        const custPhone = (cust as any)?.phone || s.customer_phone || 'Chưa có SĐT';
        const pic = (s.primary_assignee as any)?.full_name || 'Chưa phân công';
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; font-weight: 700; color: #0369a1; font-size: 14px;">${s.start_time || 'Cả ngày'}</td>
            <td style="padding: 10px 12px;">
              <div style="font-weight: 600; color: #0f172a;">${custName}</div>
              <div style="font-size: 12px; color: #64748b;">${custPhone}</div>
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #334155;">
              ${s.service_group ? `<b>${s.service_group}</b> - ` : ''}${s.title || s.service_content || 'Lịch hẹn'}
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569;">${pic}</td>
          </tr>
        `;
      }).join('');

      const orderRows1Day = orders1Day.map(o => {
        const custName = (o.contract as any)?.customer?.bride_name || 'Khách lẻ';
        const phone = (o.contract as any)?.customer?.phone || 'Chưa có SĐT';
        const pic = (o.pic as any)?.full_name || 'Chưa phân công';
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; font-size: 14px;">${o.order_code}</td>
            <td style="padding: 10px 12px; font-weight: 700; color: #0369a1; font-size: 14px;">${o.delivery_time || 'Trong ngày'}</td>
            <td style="padding: 10px 12px;">
              <div style="font-weight: 600; color: #0f172a;">${custName}</div>
              <div style="font-size: 12px; color: #64748b;">${phone}</div>
            </td>
            <td style="padding: 10px 12px; font-size: 13px; color: #334155;">${o.service_type || 'Giao đồ'}</td>
            <td style="padding: 10px 12px; font-size: 13px; color: #475569;">${pic}</td>
          </tr>
        `;
      }).join('');

      const html1Day = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 22px 24px; text-align: left;">
            <div style="display: inline-block; background: rgba(59, 130, 246, 0.3); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; color: #93c5fd;">
              📅 NHẮC LỊCH TRƯỚC 1 NGÀY (NGÀY MAI)
            </div>
            <h1 style="margin: 0; font-size: 21px; font-weight: 800;">Kế Hoạch Lịch Hẹn & Đơn Hàng Ngày Mai</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.85;">Ngày diễn ra: <b>${tomorrowStr}</b> | Báo cáo tự động từ CAMA CRM</p>
          </div>

          <div style="padding: 24px;">
            <p style="margin: 0 0 18px 0; font-size: 14px; color: #334155; line-height: 1.5;">
              Xin chào <b>Nhi, Hiền, Quân, Châu</b>,<br/>
              Dưới đây là danh sách tổng hợp tất cả lịch hẹn khách hàng và các đơn hàng cần chuẩn bị để bàn giao vào ngày mai (<b>${tomorrowStr}</b>):
            </p>

            ${schedules1Day.length > 0 ? `
              <h3 style="color: #0369a1; font-size: 15px; font-weight: 700; margin: 20px 0 8px 0; text-transform: uppercase;">
                📅 Lịch hẹn khách ngày mai (${schedules1Day.length} lịch)
              </h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #f0f9ff; text-align: left; color: #0369a1; font-size: 12px;">
                    <th style="padding: 10px 12px;">Giờ hẹn</th>
                    <th style="padding: 10px 12px;">Khách hàng</th>
                    <th style="padding: 10px 12px;">Dịch vụ</th>
                    <th style="padding: 10px 12px;">Phụ trách</th>
                  </tr>
                </thead>
                <tbody>${scheduleRows1Day}</tbody>
              </table>
            ` : '<p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">✓ Không có lịch hẹn khách nào vào ngày mai.</p>'}

            ${orders1Day.length > 0 ? `
              <h3 style="color: #047857; font-size: 15px; font-weight: 700; margin: 20px 0 8px 0; text-transform: uppercase;">
                📦 Đơn hàng cần bàn giao ngày mai (${orders1Day.length} đơn)
              </h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #ecfdf5; text-align: left; color: #047857; font-size: 12px;">
                    <th style="padding: 10px 12px;">Mã ĐH</th>
                    <th style="padding: 10px 12px;">Giờ giao</th>
                    <th style="padding: 10px 12px;">Khách hàng</th>
                    <th style="padding: 10px 12px;">Dịch vụ</th>
                    <th style="padding: 10px 12px;">Phụ trách</th>
                  </tr>
                </thead>
                <tbody>${orderRows1Day}</tbody>
              </table>
            ` : '<p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">✓ Không có đơn hàng nào cần bàn giao vào ngày mai.</p>'}

            <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <a href="https://cama-web--cama-webapp.asia-southeast1.hosted.app/dashboard" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 26px; font-weight: 700; font-size: 14px; border-radius: 8px;">
                Mở CAMA CRM để kiểm tra chi tiết →
              </a>
            </div>
          </div>
        </div>
      `;

      if (!isDryRun) {
        await transporter.sendMail({
          from: `"CAMA CRM" <${process.env.EMAIL_USER}>`,
          to: recipients.join(', '),
          subject: `[CAMA CRM] 📅 Kế hoạch Ngày Mai (${tomorrowStr}): ${schedules1Day.length} lịch hẹn & ${orders1Day.length} đơn giao`,
          html: html1Day,
        });

        schedules1Day.forEach(s => {
          newLogsToInsert.push({ entity_type: 'SCHEDULE', entity_id: s.id, reminder_type: '1_DAY', recipients });
        });
        orders1Day.forEach(o => {
          newLogsToInsert.push({ entity_type: 'ORDER', entity_id: o.id, reminder_type: '1_DAY', recipients });
        });
      }
    }

    // 8. Lưu log vào bảng reminder_logs để chống spam
    if (!isDryRun && newLogsToInsert.length > 0) {
      await supabase.from("reminder_logs").upsert(newLogsToInsert, {
        onConflict: 'entity_type,entity_id,reminder_type'
      });
    }

    return NextResponse.json({
      success: true,
      dry_run: isDryRun,
      recipients,
      reminders_sent: {
        urgent_2_hours: {
          schedules: schedules2Hours.length,
          orders: orders2Hours.length,
        },
        advance_1_day: {
          schedules: schedules1Day.length,
          orders: orders1Day.length,
        }
      }
    });

  } catch (error: any) {
    console.error("[Cron Reminders] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
