import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer'; // Assuming Nodemailer will be installed

export async function GET(req: Request) {
  // 1. Fetch pending tasks from database (Orders to deliver, CSKH reminders)
  // Mock data since DB is currently inaccessible
  const tasks = [
    { type: 'CSKH', content: 'Gọi nhắc thử váy dâu Thảo' },
    { type: 'ORDER', content: 'Chuẩn bị váy xuất kho cho HĐ-123' },
  ];

  // 2. Format email body
  const emailHtml = `
    <h2>Báo cáo Công việc Hàng ngày (8h00 Sáng)</h2>
    <p>Chào phòng váy và team CSKH, dưới đây là các việc cần làm hôm nay:</p>
    <ul>
      ${tasks.map(t => `<li><strong>[${t.type}]</strong>: ${t.content}</li>`).join('')}
    </ul>
    <p>Vui lòng xử lý kịp thời.</p>
  `;

  // 3. Send email using Nodemailer or Resend
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: '"CAMA System" <noreply@camastudio.com>',
    to: 'phongvay@camastudio.com, teamcskh@camastudio.com',
    subject: `[CAMA] Báo cáo lịch trình ngày ${new Date().toLocaleDateString('vi-VN')}`,
    html: emailHtml
  });
  */

  return NextResponse.json({ success: true, message: 'Email nhắc lịch đã được chuẩn bị.' });
}
