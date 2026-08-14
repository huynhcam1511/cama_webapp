const http = require('http');

console.log('Đang khởi động bot nhắc việc cục bộ (Local Cronjob)...');
console.log('Bot sẽ gọi vào API /api/cron/reminders mỗi 1 tiếng một lần (chỉ hoạt động từ 8h sáng đến 8h tối).\n');

const pingApi = () => {
    const currentHour = new Date().getHours();
    
    // Kiểm tra xem có nằm trong khung giờ hành chính không (8h - 20h)
    if (currentHour >= 8 && currentHour <= 20) {
        console.log(`[${new Date().toLocaleTimeString()}] Đang quét các công việc khẩn cấp...`);
        http.get('http://localhost:3000/api/cron/reminders', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`[Kết quả]:`, json);
                } catch(e) {
                    console.log(`[Kết quả]:`, data);
                }
            });
        }).on('error', (err) => {
            console.error('Lỗi khi gọi API (Máy chủ Next.js có đang chạy không?):', err.message);
        });
    } else {
        console.log(`[${new Date().toLocaleTimeString()}] Đang ngoài giờ hành chính (${currentHour}h). Bỏ qua lần quét này.`);
    }
};

// Gọi ngay lần đầu tiên
pingApi();

// Cài đặt lặp lại mỗi 1 tiếng (3,600,000 ms)
setInterval(pingApi, 3600000);
