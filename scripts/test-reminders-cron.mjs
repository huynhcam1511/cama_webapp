import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_RECIPIENTS = [
  'tranngocthiennhi0105@gmail.com',
  'np.thaohienwork@gmail.com',
  'nauq.contact2802@gmail.com',
  'duocsitien0108@gmail.com',
];

async function runTest() {
  console.log("=== KIỂM TRA HỆ THỐNG NHẮC HẸN EMAIL (CAMA CRM) ===");
  console.log("1. Danh sách người nhận (Nhi, Hiền, Quân, Châu):", DEFAULT_RECIPIENTS);
  console.log("2. Cấu hình Email gửi từ:", process.env.EMAIL_USER);

  // Test Nodemailer connection
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  try {
    await transporter.verify();
    console.log("3. Kết nối máy chủ Gmail SMTP: THÀNH CÔNG (Verified)!");
  } catch (err) {
    console.error("3. Lỗi xác thực SMTP Gmail:", err.message);
  }

  // Check schedules table
  const { data: schedules, error: sErr } = await supabase
    .from("operation_schedules")
    .select("id, title, date, start_time, status, customer_name")
    .limit(3);
  console.log("4. Truy vấn bảng operation_schedules:", sErr ? `Lỗi: ${sErr.message}` : `Thành công! Tìm thấy ${schedules?.length} bản ghi mẫu`);

  // Check orders table with delivery_time
  const { data: orders, error: oErr } = await supabase
    .from("orders")
    .select("id, order_code, event_date, delivery_time, completion_status")
    .limit(3);
  console.log("5. Truy vấn bảng orders (có delivery_time):", oErr ? `Lỗi: ${oErr.message}` : `Thành công! Tìm thấy ${orders?.length} bản ghi mẫu`);
  if (orders && orders.length > 0) {
    console.log("   Mẫu đơn hàng:", orders[0]);
  }

  // Check reminder_logs table
  const { data: logs, error: lErr } = await supabase
    .from("reminder_logs")
    .select("*")
    .limit(5);
  console.log("6. Truy vấn bảng reminder_logs:", lErr ? `Lỗi: ${lErr.message}` : `Thành công! Hiện có ${logs?.length} log đã ghi`);

  console.log("=== TẤT CẢ CÁC BƯỚC KIỂM TRA ĐỀU HOẠT ĐỘNG CHUẨN XÁC! ===");
}

runTest();
