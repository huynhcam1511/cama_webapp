import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const targetEmail = 'huynhkiencam151102@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function send1DayTestEmail() {
  const tomorrowStr = "17/09/2026";
  const html1Day = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 22px 24px; text-align: left;">
        <div style="display: inline-block; background: rgba(59, 130, 246, 0.3); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; color: #93c5fd;">
          📅 [TEST] NHẮC LỊCH TRƯỚC 1 NGÀY (NGÀY MAI)
        </div>
        <h1 style="margin: 0; font-size: 21px; font-weight: 800;">Kế Hoạch Lịch Hẹn & Đơn Hàng Ngày Mai</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.85;">Ngày diễn ra: <b>${tomorrowStr}</b> | Báo cáo tự động từ CAMA CRM</p>
      </div>

      <div style="padding: 24px;">
        <p style="margin: 0 0 18px 0; font-size: 14px; color: #334155; line-height: 1.5;">
          Xin chào <b>Cẩm (Admin Test), Nhi, Hiền, Quân, Châu</b>,<br/>
          Dưới đây là danh sách tổng hợp tất cả lịch hẹn khách hàng và các đơn hàng cần chuẩn bị để bàn giao vào ngày mai (<b>${tomorrowStr}</b>):
        </p>

        <h3 style="color: #0369a1; font-size: 15px; font-weight: 700; margin: 20px 0 8px 0; text-transform: uppercase;">
          📅 Lịch hẹn khách ngày mai (2 lịch)
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
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 700; color: #0369a1; font-size: 14px;">09:30</td>
              <td style="padding: 10px 12px;">
                <div style="font-weight: 600; color: #0f172a;">Trần Hoàng Nam</div>
                <div style="font-size: 12px; color: #64748b;">0934123456</div>
              </td>
              <td style="padding: 10px 12px; font-size: 13px; color: #334155;"><b>Phòng Suit</b> - May đo Suit chú rể Premium</td>
              <td style="padding: 10px 12px; font-size: 13px; color: #475569;">Nguyễn Minh Quân</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 700; color: #0369a1; font-size: 14px;">14:00</td>
              <td style="padding: 10px 12px;">
                <div style="font-weight: 600; color: #0f172a;">Lê Phương Linh</div>
                <div style="font-size: 12px; color: #64748b;">0908889999</div>
              </td>
              <td style="padding: 10px 12px; font-size: 13px; color: #334155;"><b>Phòng Váy</b> - Thử váy cưới Haute Couture</td>
              <td style="padding: 10px 12px; font-size: 13px; color: #475569;">Trần Quỳnh Châu</td>
            </tr>
          </tbody>
        </table>

        <h3 style="color: #047857; font-size: 15px; font-weight: 700; margin: 20px 0 8px 0; text-transform: uppercase;">
          📦 Đơn hàng cần bàn giao ngày mai (1 đơn)
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
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; font-size: 14px;">ORDE-476830</td>
              <td style="padding: 10px 12px; font-weight: 700; color: #0369a1; font-size: 14px;">10:00</td>
              <td style="padding: 10px 12px;">
                <div style="font-weight: 600; color: #0f172a;">Vũ Thu Thảo</div>
                <div style="font-size: 12px; color: #64748b;">0977665544</div>
              </td>
              <td style="padding: 10px 12px; font-size: 13px; color: #334155;">Giao váy cưới chụp ngoại cảnh</td>
              <td style="padding: 10px 12px; font-size: 13px; color: #475569;">Trần Quỳnh Châu</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <a href="https://cama-web--cama-webapp.asia-southeast1.hosted.app/dashboard" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 26px; font-weight: 700; font-size: 14px; border-radius: 8px;">
            Mở CAMA CRM để kiểm tra chi tiết →
          </a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"CAMA CRM" <${process.env.EMAIL_USER}>`,
    to: targetEmail,
    subject: `[TEST] 📅 [CAMA CRM] Kế hoạch Ngày Mai (${tomorrowStr}): 2 lịch hẹn & 1 đơn giao`,
    html: html1Day,
  });

  console.log("✅ ĐÃ GỬI THÀNH CÔNG email test mẫu 'Trước 1 Ngày' đến huynhkiencam151102@gmail.com!");
}

send1DayTestEmail().catch(err => console.error("Lỗi khi gửi:", err));
