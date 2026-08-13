import { NextResponse } from 'next/server';
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Authenticate the cron request
    // In production, you would check an API key from request headers to prevent unauthorized access.
    // For Vercel Cron, you can check request.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`
    
    const supabase = createAdminClient();

    // 2. Fetch all tasks that are NOT DONE
    const { data: tasks, error } = await supabase
      .from("journey_tasks")
      .select(`
        id, contract_id, text, status, due_date, due_time, assignee_id, assignee_name,
        contracts ( contract_code, customers ( bride_name, groom_name ) )
      `)
      .neq("status", "DONE");

    if (error) {
      console.error("Cron Error fetching tasks:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: "No active tasks." });
    }

    // 2.5 Fetch users separately to avoid schema cache/foreign key issues
    const { data: allUsers } = await supabase.from("users").select("id, email, full_name");
    const userMap = new Map();
    allUsers?.forEach((u: any) => userMap.set(u.id, u.email));

    // 3. Filter tasks: only Overdue or Due Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urgentTasks = tasks.filter((task: any) => {
      if (!task.due_date) return false;
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      // Overdue (< 0) or Today (== 0)
      return diffDays <= 0;
    });

    if (urgentTasks.length === 0) {
      return NextResponse.json({ message: "No urgent tasks to remind." });
    }

    // 4. Group by User (Assignee)
    const tasksByUser: { [email: string]: any[] } = {};
    
    urgentTasks.forEach((task: any) => {
      // Find email from userMap
      const email = (task.assignee_id && userMap.get(task.assignee_id)) ? userMap.get(task.assignee_id) : 'admin@camastudio.vn'; 
      if (!tasksByUser[email]) {
        tasksByUser[email] = [];
      }
      tasksByUser[email].push(task);
    });

    // 5. Send Emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    for (const [email, userTasks] of Object.entries(tasksByUser)) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h3 style="color: #334155;">Chào bạn,</h3>
          <p>Bạn có <b style="color: #ef4444;">${userTasks.length}</b> công việc khẩn cấp (Hôm nay hoặc Quá hạn) đang chờ xử lý:</p>
          <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; border-color: #e2e8f0; font-size: 14px;">
            <tr style="background: #f8fafc; color: #475569; text-align: left;">
              <th>Hợp Đồng</th>
              <th>Công việc</th>
              <th>Thời hạn</th>
            </tr>
            ${userTasks.map((t: any) => `
              <tr>
                <td style="font-weight: bold; color: #2563eb;">${t.contracts?.contract_code || 'N/A'}</td>
                <td>${t.text}</td>
                <td style="color: #dc2626; font-weight: bold;">${t.due_date} ${t.due_time || ''}</td>
              </tr>
            `).join('')}
          </table>
          <br/>
          <p>Vui lòng đăng nhập hệ thống CAMA STUDIO để cập nhật tiến độ công việc.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
          <p style="font-size: 12px; color: #94a3b8;">Email này được gửi tự động từ hệ thống CAMA STUDIO.</p>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"CAMA Bot" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `[CAMA Studio] Nhắc việc: Bạn có ${userTasks.length} công việc khẩn cấp`,
          html: htmlContent
        });
      } catch (err: any) {
        console.error("Lỗi gửi mail cho", email, err.message);
      }
    }
    
    console.log(`Cronjob triggered. Sent emails to ${Object.keys(tasksByUser).length} users.`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Sent reminders to ${Object.keys(tasksByUser).length} users.`,
      usersNotified: Object.keys(tasksByUser)
    });

  } catch (err: any) {
    console.error("Cronjob exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
