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

const csvData = `SĐT,Tên khách / cặp đôi,Tuần,Ngày vào lead,Fanpage / nguồn vào đầu tiên,Nhu cầu ghi nhận ban đầu,Ngày cưới / ngày dùng chính,PIC giữ khách,Gói tư vấn,Liên hệ gần nhất,Follow-up tiếp theo,Việc ưu tiên toàn khách,Ghi chú chung
/,Trần Quỳnh Như,TUẦN 1 ,01/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,"Đầu tháng 12
Quảng Ngai",Hiền,Combo Váy Vest,01/07/2026,03/07/2026,Trao đổi chi tiết về Váy,ĐÃ TRAO ĐỎI
/,Tuyen Le,,01/07/2026,Facebook — CAMA Haute Couture,VÁY ,"2/8
Sài Gòn",Hiền,"Combo Váy Vest
Thuê Váy",01/07/2026,02/07/2026,"Đã trải nghiệm Váy
Đang phân vân ",ĐÃ TRAO ĐỔI 
/,Tram Ngoc,,29/06/2026,Facebook — CAMA Haute Couture,VÁY ,/,Hiền,Thuê Váy,02/07/2026,03/07/2026,"Trao đổi về BST mới đã về 
Mời chị đến thử ",ĐÃ TRAO ĐỔI 
/,Bảo Trân Đặng,,02/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,/,Hiền,Combo Váy Vest,02/07/2026,03/07/2026,Trao đổi chi tiết về Combo,
/,Trang Huỳnh ,,26/06/2026,Facebook — CAMA Haute Couture,PT VŨ / NCSG,06/12/2026,Hiền,"Chụp PT - NCSG
Chụp TT + PS",02/07/2026,03/07/2026,Đang trao đổi thêm về thông tin ,
/,Yến Linh,,03/07/2026,Facebook — CAMA Haute Couture,VÁY ,01/04/2027,Hiền,Thuê Váy,03/07/2026,05/07/2026,"ĐÃ TRAO ĐỔI FULL
ĐỢI NGÀY DÂU LIÊN HỆ ",
/,Vân Anh NT,,03/07/2026,Facebook — CAMA Haute Couture,VÁY ,/,Hiền,Thuê Váy,03/07/2026,05/07/2026,"ĐÃ TRAO ĐỔI FULL
ĐỢI NGÀY DÂU LIÊN HỆ ",
/,Linh Ú Nu,,03/07/2026,Facebook — CAMA Haute Couture,PT VŨ / NCSG,Tháng 12,Hiền,Chụp NCSG,03/07/2026,05/07/2026,Trao đổi thêm về lựa chọn gói chụp,
911315385,Gia Hân ,,03/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,/,Hiền,Combo Váy Vest,03/07/2026,05/07/2026,"ĐÃ TRAO ĐỔI FULL
ĐỢI NGÀY DÂU LIÊN HỆ ",
/,Mỹ Uyên ,,03/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,09/01/2027,Hiền,Combo Váy Vest,03/07/2026,05/07/2026,ĐỢI DÂU PHẢN HỒI ,
/,Đoàn Thị Xuân Mai,,03/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,2027,Hiền,Combo Váy Vest,03/07/2026,05/07/2026,"ĐÃ TRAO ĐỔI FULL
ĐỢI NGÀY DÂU LIÊN HỆ ",
/,Đỗ Xuân Uyên,,03/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,Tháng 12,Hiền,Combo Váy Vest,03/07/2026,05/07/2026,"ĐÃ TRAO ĐỔI FULL
ĐỢI NGÀY DÂU LIÊN HỆ ",
/,Bé Bông,TUẦN 2,06/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,Combo Váy Vest,06/07/2027,07/07/2026,,
/,Phạm thư,,06/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,Combo Váy Vest,06/07/2026,07/07/2026,,
/,Tran Doan Trang,,06/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Cẩm,VÁY ,06/07/2026,08/07/2026,,
/,Huong Giang,,06/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Cẩm,VÁY ,06/07/2026,08/07/2026,,
/,Narcissus Nguyen,,06/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Cẩm,VÁY ,06/07/2026,07/07/2026,,
/,Kang Min Sun ,,07/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,Combo Váy Vest,07/07/2026,,,
916087974,Ngô Kiều Tiên ,,07/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,Combo Váy Vest,07/07/2026,10/07/2026,,
/,Diệp Ngọc Thảo Như,,07/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,Combo Váy Vest,07/07/2026,10/07/2026,,
/,Kaylin Trương ,,07/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,07/07/2026,10/07/2026,,
/,Oanh Lùng,,07/07/2026,Facebook — CAMA Haute Couture,MAY VEST,,Hiền,MAY VEST,07/07/2026,10/07/2026,,
/,Pham Nhi Nhi,,07/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,07/07/2026,,,
/,An Như,,08/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,07/07/2026,10/07/2026,,
/,Quỳnh Hương,,08/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,08/07/2026,09/07/2026,,
/,Đặng Yến,,08/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,08/07/2026,10/07/2026,,
/,Phoebe Nguyen,,08/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,08/07/2026,09/07/2026,,
/,Như Hà,,08/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,08/07/2026,10/07/2026,,
/,Đỗ Thị Hoa ,,08/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Anh Cao,COMBO VÁY VEST,08/07/2026,10/07/2026,,
/,Hoàng Hương Giang,,09/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,COMBO VÁY VEST,09/07/2026,11/07/2026,,
/,Minh Minh ,,09/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,Combo Váy Vest,10/07/2026,11/07/2026,,
/,Nguyễn Ngọc Vương Trâm ,,09/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,Combo Váy Vest,11/07/2026,11/07/2026,,
/,Châu Ngọc ,,09/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,12/07/2026,/,,
/,Mia Mia ,,09/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,13/07/2026,11/07/2026,,
/,Thanh Tuyền ,,09/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,10/1/2027,Hiền,COMBO VÁY VEST,11/07/2026,12/07/2026,,
/,Đào Yến Nhi,,09/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,Cuối năm cưới ,Hiền,COMBO VÁY VEST,10/07/2026,/,,"Cuối năm cưới, giữa tháng 8 hẹn lịch"
/,Chi Tran ,,11/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,23/07/2026,Hiền,COMBO VÁY VEST,11/07/2026,/,CƯỚI GẤP CHỐT SỚM,
/,Mon ,,12/07/2026,Facebook — CAMA Haute Couture,VÁY ,/,Hiền,VÁY ,12/07/2026,/,,
/,Vi Nhỏ ,,12/07/2026,Facebook — CAMA Haute Couture,TRỌN GÓI NC ,29/11/2026,Hiền,TRỌN GÓI NC ,12/07/2026,/,THEO DÕI HỖ TRỢ ,DÂU CÂN NHẮC VÌ PHÍ CAO
/,Kiều Mỹ ,,12/07/2026,Facebook — CAMA Haute Couture,VÁY ,28/02/2026,Hiền,VÁY ,12/07/2026,15/07/2026,THEO DÕI HỖ TRỢ ,DÂU CÂN NHẮC 
/,Nguyễn Ánh Tiên ,TUẦN 3,13/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,11/10,Hiền,COMBO VÁY VEST,13/07/2026,16/07/2026,THEO DÕI HỖ TRỢ ,DÂU CÂN NHẮC 
/,Hạnh Suna ,,13/07/2026,Facebook — CAMA Haute Couture,STUDIO,/,Hiền,STUDIO,13/07/2026,14/07/2026,THEO DÕI HỖ TRỢ ,/
/,Đình Hiếu ,,13/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,/,Hiền,COMBO VÁY VEST,13/07/2026,14/07/2026,THEO DÕI HỖ TRỢ ,
/ ,Thien Kim ,,13/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,Cuối năm ,Hiền,COMBO VÁY VEST,13/07/2026,14/07/2026,XÁC NHẬN LỊCH ,
/,Thao Thanh ,,13/07/2026,Facebook - CAMA WEDDING,PT VŨ / NCSG,01/01/2027,Hiền,PT VŨ / NCSG,13/07/2026,13/07/2026,ĐỢI DÂU XÁC NHẬN ,
/,Pé Piu,,13/07/2026,Facebook - CAMA WEDDING,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,13/07/2026,14/07/2026,ĐỢI DÂU XÁC NHẬN ,
/,Nguyễn Trịnh Thùy Duyên ,,14/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,14/07/2026,16/07/2026,THEO DÕI HỖ TRỢ ,
/,Linh Tàu,,14/07/2026,Facebook — CAMA Haute Couture,STUDIO,,Hiền,STUDIO,14/07/2026,17/07/2026,THEO DÕI HỖ TRỢ ,
/,Tươi Cận ,,14/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,27/09/2026,Hiền,COMBO VÁY VEST,14/07/2026,17/07/2026,THEO DÕI HỖ TRỢ ,
/,Khanh Hoang,,13/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,14/07/2026,19/07/2026,THEO DÕI HỖ TRỢ ,
/,Hoàng Quế ,,14/07/2026,Facebook — CAMA Haute Couture,Thuê váy,,Hiền,VÁY ,14/07/2026,20/07/2026,THEO DÕI HỖ TRỢ ,
/,Trần Trần Uyên ,,15/07/2026,Facebook — CAMA Haute Couture,TRỌN GÓI NC ,,Hiền,TRỌN GÓI NC ,15/07/2026,21/07/2026,THEO DÕI HỖ TRỢ ,
/,Cham Pham ,,15/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,15/07/2026,22/07/2026,THEO DÕI HỖ TRỢ ,
/,Mỹ Ngọc ,,16/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,16/07/2026,20/07/2026,THEO DÕI HỖ TRỢ ,
/,Ngọc Huỳnh ,,16/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,16/07/2026,20/07/2026,ĐỢI DÂU XÁC NHẬN ,
/,Ruth Quỳnh Như ,,16/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,16/07/2026,20/07/2026,THEO DÕI HỖ TRỢ ,
/,Thúy Thỏ ,,16/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,16/07/2026,20/07/2026,ĐỢI DÂU XÁC NHẬN ,
/,Thanh Uyên ,,16/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,16/07/2026,20/07/2026,THEO DÕI HỖ TRỢ ,
/,Mai Thanh ,,16/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,16/07/2026,20/07/2026,THEO DÕI HỖ TRỢ ,
/,Khánh Ly,,18/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,18/07/2026,21/07/2026,THEO DÕI HỖ TRỢ ,
/,Kim Thoại ,,19/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,19/07/2026,22/07/2026,THEO DÕI HỖ TRỢ ,
/,Tran Huynh ,,20/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,19/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Hà Thu Phương ,,20/07/2026,Facebook — CAMA Haute Couture,VÁY ,30/07/2026,Hiền,VÁY ,20/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Hồng Tea,,20/07/2026,Facebook — CAMA Haute Couture,VÁY ,20/09/2026,Hiền,VÁY ,20/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Xuân Như,,20/07/2026,Facebook — CAMA Haute Couture,VÁY ,06/11/2026,Hiền,VÁY ,20/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Trần Gia Huy ,,20/07/2026,Facebook — CAMA Haute Couture,VEST,/,Hiền,VEST,20/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Thanh Quang ,,20/07/2026,Facebook — CAMA Suit,VEST,/,Hiền,VEST,20/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Vũ Ánh Ngọc Bùi,,20/07/2026,Facebook — CAMA Suit,VEST,,Hiền,VEST,20/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Con Tho ,,20/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,20/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Grace Nguyen,,19/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,21/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Quỳnh Phan ,,21/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,21/07/2026,23/07/2026,THEO DÕI HỖ TRỢ ,
/,Như Ý Trần ,,21/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,22/07/2026,24/07/2026,ĐỢI DÂU XÁC NHẬN ,
/,Đặng Minh Bảo ,,21/07/2026,Facebook — CAMA Suit,VEST,,Hiền,VEST,22/07/2026,24/07/2026,THEO DÕI HỖ TRỢ ,
/,Phương Ly,,21/07/2026,Facebook — CAMA Suit,VEST,,Hiền,VEST,22/07/2026,24/07/2026,THEO DÕI HỖ TRỢ ,
/,Nguyễn Nga ,,22/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,22/07/2026,25/07/2026,THEO DÕI HỖ TRỢ ,
/,Nguyễn Ngọc Thảo Nhi,,22/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,22/07/2026,25/07/2026,THEO DÕI HỖ TRỢ ,
/,Ngân Miu,,22/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,22/07/2026,25/07/2026,THEO DÕI HỖ TRỢ ,
/,Tran Le Thien Nhi,,22/07/2026,Facebook — CAMA Haute Couture,VÁY ,,Hiền,VÁY ,22/07/2026,25/07/2026,THEO DÕI HỖ TRỢ ,
/,Hiền Nguyễn ,,22/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,22/07/2026,25/07/2026,THEO DÕI HỖ TRỢ ,
/,Nguyen Minh Chau,,23/07/2026,Facebook — CAMA Haute Couture,COMBO VÁY VEST,,Hiền,COMBO VÁY VEST,23/07/2026,26/07/2026,THEO DÕI HỖ TRỢ ,`;

function parseDate(dateStr) {
  if (!dateStr || dateStr === '/') return null;
  const parts = dateStr.split('\n')[0].trim().split('/');
  if (parts.length >= 2) {
    const year = parts[2] ? (parts[2].length === 4 ? parts[2] : `20${parts[2]}`) : new Date().getFullYear();
    const month = parts[1].padStart(2, '0');
    const day = parts[0].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
}

async function run() {
  console.log("Starting Leads data import...");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const rows = parseCSV(csvData);
  const inserts = [];
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1]) continue; 
    
    const rawPhone = r[0] !== '/' ? r[0] : '';
    const phone = rawPhone || '0000000000'; // fallback phone
    const name = r[1];

    const payload = {
      customer_code: 'LD-' + Math.floor(1000 + Math.random() * 9000),
      bride_name: name,
      groom_name: '',
      phone: phone,
      email: '',
      source: r[4] || 'Facebook',
      wedding_date: parseDate(r[6]),
      
      // CRM Pipeline fields
      lead_date: parseDate(r[3]),
      initial_request: r[5] !== '/' ? r[5] : '',
      consulting_package: r[8] !== '/' ? r[8] : '',
      last_contact: parseDate(r[9]),
      next_followup: parseDate(r[10]),
      priority_task: r[11] !== '/' ? r[11] : '',
      general_notes: r[12] !== '/' ? r[12] : '',
      
      lead_status: 'Mới' // Default
    };

    inserts.push(payload);
  }

  console.log("Parsed " + inserts.length + " leads to insert.");

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
    console.error("Failed to insert leads data:", response.status, await response.text());
  } else {
    console.log("Successfully imported leads pipeline!");
  }
}

run();
