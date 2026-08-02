import fs from 'fs';

// Custom CSV Parser to handle quotes and newlines
function parseCSV(csv) {
  const rows = [];
  let row = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (inQuotes) {
      if (char === '"') {
        if (csv[i+1] === '"') { current += '"'; i++; } 
        else inQuotes = false;
      } else { current += char; }
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { row.push(current); current = ''; }
      else if (char === '\n') { row.push(current); rows.push(row); row = []; current = ''; }
      else if (char !== '\r') { current += char; }
    }
  }
  if (current || csv[csv.length-1] === ',') row.push(current);
  if (row.length > 0) rows.push(row);
  return rows;
}

const csvData = `Ngày hẹn,Giờ hẹn,SĐT,Tên khách / cặp đôi,Fanpage / nguồn đầu tiên,PIC giữ khách,Nhóm dịch vụ của lịch,Dịch vụ / nội dung lịch,Loại lịch,Trạng thái lịch,Kết quả sau hẹn,Follow-up tiếp theo,Ngày cưới / ngày chụp,Ghi chú trước hẹn,Kết quả / ghi chú sau hẹn
01/07/2026,19h,/,Chị Bình Minh,TikTok - Zalo Hiền ,Thảo Hiền ,Wedding Studio,CHỤP PT + STU,Tư vấn studio,Không đến,Khách không phản hồi,/,,"Dự kiến chọn gói chụp 1PT + 1Stu
15tr900k",/
04/07/2026,16h,0962859607,Hien Kyky,Facebook - Cama W ,Thảo Hiền ,Wedding Studio,CHỤP PT + STU,Tư vấn studio,Đã đến,Đã cọc / chốt đơn,ĐÃ XÁC NHẬN ,"08/08/2026
BOOK TAKE CARE","Dự kiến chọn gói chụp 2PT + 1Stu
18tr900k","TỔNG HỢP ĐỒNG
45 Triệu"
04/07/2026,18h,0384476829,"Lê Lương Hiếu Nghĩa",Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã đến,Chưa cập nhật,ĐÃ XÁC NHẬN ,,,
05/07/2026,10h,/,Lê Bảo Thúy Anh ,TikTok - Zalo Hiền ,Thảo Hiền ,TSTT,TSTT,TRẢI NGHIỆM VÁY VEST,Đã đến,Đã cọc / chốt đơn,,,"QUAY TSTT
17tr500k",/
05/07/2026,14h,385299667,Kang Min Sun,Facebook - Cama Haute Couture ,Thảo Hiền ,Bridal,Thuê váy,Tư vấn váy,Đã đến,Đang cân nhắc,,,,
07/07/2026,19h,902015206,Quỳnh Hương,Facebook - Cama Haute Couture ,Thảo Hiền ,Bridal,Thuê váy,Tư vấn váy,Đã đến,Đang cân nhắc,,,2 VÁY LIMITED ,
09/07/2026,19h30,Zalo,Chị Gia Hân,TikTok - Zalo Hiền ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã xác nhận,Chưa cập nhật,,,,
09/07/2026,20h,916087974,Ngô Kiều Tiên ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã đến,Đã cọc / chốt đơn,/,03/10/2026,,"TỔNG HỢP ĐỒNG 
10tr300"
10/07/2026,13h,904753878,Chị Châu Ngọc ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã đến,Đang cân nhắc,,31/10/2026,,SUY NGHĨ THÊM VÌ SẢNH SK NHỎ 
09/07/2026,17h ,/,Trinh Minh Tho ,Facebook - Cama Suit ,Thảo Hiền ,Suit,Thuê vest,Tư vấn suit,Đã xác nhận,Đã cọc / chốt đơn,,,,
18/07/2026,11h,/,Vu Ng Tường Vy ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã xác nhận,Chưa cập nhật,,,,
13/07/2026,17h,/,Chị Chi Tran ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã xác nhận,Chưa cập nhật,,,,
12/07/2026,17h,/,Khánh Tường,Facebook - Cama Suit ,Thảo Hiền ,Suit,Thuê vest,Thử vest,Đã đến,Đã cọc / chốt đơn,,,,
14/07/2026,17h,/,Huỳnh Thanh Đạt,Facebook - Cama Suit ,Thảo Hiền ,Suit,Thuê vest,Tư vấn suit,Đã đến,Đã cọc / chốt đơn,,,,
16/07/2026,19h30,/,Huỳnh Thanh Hưng,Facebook - Cama Suit ,Thảo Hiền ,Suit,Thuê vest,Tư vấn suit,Đã đến,Đã cọc / chốt đơn,,,,
16/07/2026,20h,/,Trần Nguyễn Đăng Toàn,Facebook - Cama Suit ,Thảo Hiền ,Suit,Thuê vest,Tư vấn suit,Đã đến,Đã cọc / chốt đơn,,,,
18/07/2026,13h,/,Võ Phạm Thúy Hiền ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã xác nhận,Chưa cập nhật,,/,,
20/07/2026,15h ,/,Hồng Tea,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,Thử váy,Đã đến,Không phù hợp,,/,,
22/07/2026,17h ,/,Lê Nguyễn Thúy Anh,Facebook - Cama Haute Couture ,Thảo Hiền ,TSTT,TSTT,TƯ VẤN TSTT,Đã đến,Đã cọc / chốt đơn,,11/08/2026,,"HĐ QUAY + C BT
22.500.000"
26/07/2026,15h ,/,Grace Nguyen ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,Tư vấn combo,Không đến,Chưa cập nhật,,,,
20/07/2026,20h45 ,/,Vũ Bùi Ánh Ngọc,Facebook - Cama Haute Couture ,Thảo Hiền ,Suit,Thuê vest,Tư vấn suit,Đã đến,Đã cọc / chốt đơn,,21/07/2026,,CHỐT VEST
23/07/2026,20h ,/,Chị Minh Anh ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,Tư vấn combo,Không đến,Chưa cập nhật,,,,
23/07/2026,9h30 ,/,CDCR Hân & Tâm,Facebook - Cama Haute Couture ,Thảo Hiền ,TSTT,TSTT,TƯ VẤN TSTT,Đã đến,Đã cọc / chốt đơn,,14/08/2026,,"HĐ Q + C TSTT
29.800.000"
23/07/2026,17h,/,Anh Hùng ,Facebook - Cama Suit ,Thảo Hiền ,Suit,Thuê vest,Thử vest,Đã đến,Đã cọc / chốt đơn,,13/07/2026,,CHỐT VEST 
24/07/2026,9h30,/,Long & Thoa ,Facebook - Cama Haute Couture ,Anh Cao,Suit,Thuê vest,Thử vest,Đã đến,Đã cọc / chốt đơn,,04/08/2026,,"HĐ Q + C + 1 STU
29.800.000"
28/07/2026,19h ,/,Quốc Cường ,Facebook - Cama Haute Couture ,Anh Cao,TSTT,TSTT,TƯ VẤN TSTT,Đã xác nhận,Chưa cập nhật,,/,,
26/07/2026,17h ,/,Tín ,Facebook - Cama Suit ,Thảo Hiền ,Suit,Thuê vest,Thử vest,Đã đến,Đã cọc / chốt đơn,,26/07/2026,,CHỐT VEST
27/07/2026,19h ,/,Chị Thảo ,Facebook - Cama Haute Couture ,Thảo Hiền ,Wedding Studio,Chụp STU,Tư vấn studio,Đã xác nhận,Chưa cập nhật,,/,,
29/07/2026,18h30 ,/,Hải Yến Trần,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Không đến,Khách không phản hồi,,,,
28/07/2026,11h,/,Bella Tran ,Facebook - Cama Haute Couture ,Thảo Hiền ,Combo Bridal + Suit,Combo Váy Vest,TRẢI NGHIỆM VÁY VEST,Đã đến,Đang cân nhắc,,,,
29/07/2026,18h30 ,/,Chị Hanna,Facebook - Cama Haute Couture ,Thảo Hiền ,Bridal,Thuê váy,Tư vấn váy,Đã đến,Đang cân nhắc,,,,
29/07/2026,10h ,/,Anh Thiện ,KHÁCH CŨ ,Anh Cao,Suit,Thuê vest,Tư vấn suit,Đã đến,Đã cọc / chốt đơn,,29/07/2026,,
29/07/2026,18h ,/,Mai Anh ,Facebook - Cama Haute Couture ,Thảo Hiền ,Bridal,Thuê váy,Tư vấn váy,Đã đến,Cần follow-up,,,,
29/07/2026,18h30 ,/,Anh Khanh,ZALO,Thảo Hiền ,Combo Wedding,TRỌN GÓI NC ,TRỌN GÓI NC ,Chờ xác nhận,Chưa cập nhật,,,,`;

async function run() {
  console.log("Starting customers data import...");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const rows = parseCSV(csvData);
  const inserts = [];
  
  // Track seen phones/names to avoid duplicates
  const seen = new Set();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue; 
    
    const rawPhone = r[2] !== '/' ? r[2] : '';
    const phone = rawPhone || '0000000000'; // fallback phone
    const name = r[3] || 'Khách hàng ẩn danh';
    
    const uniqueKey = phone + name;
    if (seen.has(uniqueKey)) continue;
    seen.add(uniqueKey);

    let weddingDateStr = null;
    if (r[12] && r[12].includes('/')) {
      const wparts = r[12].split('\n')[0].split('/');
      if (wparts.length === 3) {
        weddingDateStr = `${wparts[2]}-${wparts[1]}-${wparts[0]}`;
      }
    }
    
    // Determine Lead Status based on Booking Result
    const resultStr = r[10] || '';
    let leadStatus = 'Đã hẹn lịch';
    if (resultStr.includes('cọc') || resultStr.includes('chốt')) leadStatus = 'Đã chốt (Win)';
    else if (resultStr.includes('không phản hồi') || resultStr.includes('Không phù hợp')) leadStatus = 'Khách rớt (Lost)';
    else if (resultStr.includes('cân nhắc')) leadStatus = 'Đang tư vấn';

    const payload = {
      customer_code: 'KH-' + Math.floor(1000 + Math.random() * 9000),
      bride_name: name, // We just put the whole name in bride_name for simplicity
      groom_name: '',
      phone: phone,
      email: '',
      source: r[4] || 'Facebook',
      wedding_date: weddingDateStr,
      notes: r[13] || '', // notes before
      lead_status: leadStatus
    };

    inserts.push(payload);
  }

  console.log("Parsed " + inserts.length + " customers to insert.");

  const response = await fetch(`${url}/rest/v1/customers`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(inserts)
  });

  if (!response.ok) {
    console.error("Failed to insert data:", response.status, await response.text());
  } else {
    console.log("Successfully imported customers!");
  }
}

run();
