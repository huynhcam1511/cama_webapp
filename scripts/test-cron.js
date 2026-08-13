const http = require('http');

console.log('Đang khởi động bot nhắc việc cục bộ (Local Cronjob)...');
console.log('Bot sẽ gọi vào API /api/cron/reminders mỗi 2 phút một lần.\n');

const pingApi = () => {
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
};

// Gọi ngay lần đầu tiên
pingApi();

// Cài đặt lặp lại mỗi 2 phút (120,000 ms)
setInterval(pingApi, 120000);
