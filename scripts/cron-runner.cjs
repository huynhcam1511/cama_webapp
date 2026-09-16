const ENDPOINT = process.env.CRON_ENDPOINT || 'https://cama-web--cama-webapp.asia-southeast1.hosted.app/api/cron/reminders';

async function tick() {
  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  console.log(`[${time}] ⏰ Đang quét nhắc hẹn CAMA CRM...`);
  try {
    const res = await fetch(ENDPOINT);
    const data = await res.json();
    console.log(`[${time}] ✅ Phản hồi từ máy chủ:`, JSON.stringify(data));
  } catch (err) {
    console.error(`[${time}] ❌ Lỗi kết nối:`, err.message);
  }
}

console.log('🚀 Dịch vụ bấm giờ tự động CAMA CRM đã kích hoạt!');
console.log(`🎯 Mục tiêu API: ${ENDPOINT}`);
console.log('⏱️ Chu kỳ: Tự động quét mỗi 15 phút (24/7)...');

// Chạy ngay lần đầu
tick();

// Chu kỳ 15 phút
const FIFTEEN_MINS = 15 * 60 * 1000;
setInterval(tick, FIFTEEN_MINS);
