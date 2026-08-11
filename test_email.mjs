import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const testMailOptions = {
  from: `CAMA CRM <${process.env.EMAIL_USER}>`,
  to: 'anhthi20041105@gmail.com',
  subject: '[TEST] Báo cáo tổng hợp: Lịch trình & Công việc hôm nay',
  html: `
    <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 25px 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">📊 Báo Cáo Tổng Hợp Công Việc Hôm Nay</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Hệ thống quản trị CAMA CRM</p>
      </div>
      
      <div style="padding: 25px 20px;">
        <p style="color: #334155; font-size: 15px; margin-bottom: 25px;">Xin chào Anh Thi,<br><br>Dưới đây là tổng hợp toàn bộ lịch hẹn, lịch chăm sóc khách hàng và tiến độ đơn hàng cần chú ý trong ngày hôm nay:</p>
        
        <!-- MODULE 1: LỊCH HẸN VẬN HÀNH -->
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">📅 Lịch Hẹn & Vận Hành (Trong 2 giờ tới)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">Giờ</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">Khách hàng</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">Dịch vụ</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">Trạng thái</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb;">14:30</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">Nguyễn Thị Ngọc</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #475569;">Bridal / Thử váy 1</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><span style="background-color: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Chờ đến</span></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb;">15:00</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">Trần Văn Hùng</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #475569;">Suit / May đo</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><span style="background-color: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Chờ đến</span></td>
          </tr>
        </table>

        <!-- MODULE 2: CHĂM SÓC KHÁCH HÀNG -->
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">🎧 Chăm Sóc Khách Hàng (Cần xử lý)</h3>
        <div style="background-color: #fdf4ff; border: 1px solid #f87171; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #991b1b;">[Khiếu nại] Chị Linh - Khách thuê váy</p>
          <p style="margin: 0; font-size: 13px; color: #7f1d1d;">Phản hồi váy bị chật vòng eo sau khi nhận. Cần gọi điện xử lý ngay lập tức.</p>
        </div>
        <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-left: 4px solid #22c55e; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #166534;">[Hỏi thăm] Anh Tuấn & Chị Trâm</p>
          <p style="margin: 0; font-size: 13px; color: #14532d;">Đã trả váy 3 ngày. Cần gọi điện xin feedback và đánh giá dịch vụ.</p>
        </div>

        <!-- MODULE 3: ĐƠN HÀNG -->
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">📦 Tiến Độ Đơn Hàng (Đến hạn hôm nay)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">Mã ĐH</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">Loại</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">Công việc cần xong</th>
            <th style="padding: 10px; border: 1px solid #e2e8f0; color: #475569; font-size: 13px;">PIC</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">ORD-2026-0810</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #475569;">Thuê váy</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #ef4444; font-weight: 500;">Vệ sinh & Đóng gói</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">Phòng váy</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">ORD-2026-0795</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #475569;">May đo Suit</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #eab308; font-weight: 500;">Chờ khách đến thử form</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">Trần Hùng</td>
          </tr>
        </table>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; pt-4; text-align: center;">
          Đây là email tự động tổng hợp từ hệ thống CAMA CRM. Vui lòng truy cập web để xử lý.
        </p>
      </div>
    </div>
  `
};

console.log(`Đang cố gắng gửi email từ: ${process.env.EMAIL_USER}`);
console.log(`Đến email: anhthi20041105@gmail.com`);

transporter.sendMail(testMailOptions, (error, info) => {
  if (error) {
    console.error('Lỗi khi gửi email:', error.message);
    console.error('--> HƯỚNG DẪN: Bạn cần tạo Mật Khẩu Ứng Dụng (App Password) cho Gmail của bạn và điền vào biến EMAIL_PASS trong file .env.local');
  } else {
    console.log('Email sent thành công: ' + info.response);
  }
});
