import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const policies = [
  {
    title: 'Chính sách Quản lý và Đền bù Tài sản',
    content: `# CHÍNH SÁCH QUẢN LÝ VÀ ĐỀN BÙ TÀI SẢN

Tài sản của CAMA Studio (Máy ảnh, Ống kính, Hệ thống đèn, Váy cưới Haute Couture, Vest/Suit) là công cụ kiếm tiền của toàn bộ tập thể. Yêu cầu 100% nhân sự tuân thủ nghiêm ngặt quy định sau:

## 1. Quy định đối với thiết bị Media (Máy ảnh, Lens, Đèn)
*   **Bàn giao & Kiểm tra:** Trước mỗi ca làm việc, nhân sự Media phải kiểm tra tình trạng thiết bị. Nếu phát hiện trầy xước, nứt vỡ phải báo cáo ngay.
*   **Sử dụng:** Tuyệt đối không tự ý mang thiết bị ra khỏi Studio nếu không có lịch chụp ngoại cảnh được duyệt.
*   **Đền bù:** Trong trường hợp xảy ra rơi vỡ, vào nước, hư hỏng do lỗi chủ quan (bất cẩn, sai quy trình sử dụng):
    *   Lần 1: Nhân sự chịu **50%** chi phí sửa chữa/thay mới.
    *   Lần 2: Nhân sự chịu **100%** chi phí sửa chữa/thay mới và xem xét hình thức kỷ luật.

## 2. Quy định đối với Váy cưới & Trang phục
*   Sale và Makeup có trách nhiệm hướng dẫn khách hàng mặc thử váy đúng cách, tránh làm hỏng khóa kéo, bung pha lê hoặc dính son phấn vào váy.
*   Tuyệt đối không để váy chạm đất ở khu vực ẩm ướt, nhiều bụi bẩn.
*   Trường hợp váy bị rách thủng, hỏng phom dáng nghiêm trọng do sự tắc trách của nhân sự (không nhắc nhở khách, cố tình kéo mạnh tay): Nhân sự chịu phí sửa chữa từ **500.000đ - 2.000.000đ** tùy mức độ hư hại.`,
    policy_scope: 'GENERAL',
    is_active: true
  },
  {
    title: 'Chính sách Bảo mật Thông tin (NDA & Media Policy)',
    content: `# CHÍNH SÁCH BẢO MẬT THÔNG TIN VÀ HÌNH ẢNH (NDA)

Uy tín của CAMA được xây dựng dựa trên sự tin tưởng của khách hàng, đặc biệt là tệp khách hàng cao cấp. Toàn bộ nhân sự (Sale, Media, Content, Makeup) cam kết thực hiện các quy định sau:

## 1. Bảo mật dữ liệu khách hàng
*   **Nghiêm cấm** hành vi sao chép, trích xuất, hoặc tuồn data khách hàng (Số điện thoại, Zalo, link Facebook cá nhân) cho bất kỳ bên thứ ba nào hoặc phục vụ mục đích trục lợi cá nhân.
*   Mọi thông tin về Hợp đồng, Gói dịch vụ khách đã chốt phải được giữ kín tuyệt đối, không bàn tán với khách hàng khác.

## 2. Quy định về Hình ảnh (Media Policy)
*   Toàn bộ file gốc (RAW) và file đã qua chỉnh sửa thuộc bản quyền của CAMA Studio.
*   Nghiêm cấm thợ ảnh, thợ makeup sử dụng ảnh khách hàng của CAMA đăng lên Fanpage/Facebook cá nhân/Tiktok cá nhân để làm portfolio riêng **khi chưa được sự đồng ý của Giám đốc hoặc Khách hàng**.
*   Các file ảnh/video bị lỗi, out nét hoặc nhạy cảm của khách phải được xóa bỏ ngay lập tức, tuyệt đối không phát tán.`,
    policy_scope: 'GENERAL',
    is_active: true
  },
  {
    title: 'Quy tắc Ứng xử và Phục vụ Khách hàng',
    content: `# QUY TẮC ỨNG XỬ VÀ CHĂM SÓC KHÁCH HÀNG (CAMA SERVICE CODE)

Trải nghiệm tại CAMA phải là trải nghiệm của một dịch vụ Haute Couture (Thời trang cao cấp). Đội ngũ Sale và Lễ tân là bộ mặt của Studio.

## 1. Tiêu chuẩn Diện mạo & Tác phong
*   **Trang phục:** Ăn mặc lịch sự, gọn gàng, mang phong cách chuyên nghiệp (Khuyến khích mặc tone màu trung tính: Đen, Trắng, Be). Không mặc quần đùi, áo sát nách, dép lê trong giờ làm việc.
*   **Thái độ:** Luôn giữ nụ cười, sử dụng ngôn từ lịch thiệp, tôn trọng khách hàng (Dạ, Vâng, Cảm ơn, Xin lỗi).

## 2. Quy trình Đón khách tại Showroom
*   Khách bước vào cửa: Phải có nhân sự ra mở cửa, cúi chào và hỏi tên khách hàng.
*   Mời khách vào khu vực sảnh chờ, mời nước uống (Trà/Cà phê/Nước suối) ngay lập tức.
*   Không bao giờ để khách hàng ngồi đợi một mình quá 5 phút mà không có lời giải thích.

## 3. Xử lý Phàn nàn
*   Khi khách hàng có ý kiến chê bai hoặc không hài lòng về váy/ảnh: Lắng nghe 100%, tuyệt đối **KHÔNG tranh cãi, không ngắt lời khách**.
*   Nhận lỗi về trải nghiệm chưa tốt, sau đó báo cáo ngay cho Cấp quản lý (Trưởng phòng/Giám đốc) để có phương án xử lý (đổi váy, chụp lại, giảm giá).`,
    policy_scope: 'GENERAL',
    is_active: true
  },
  {
    title: 'Chính sách Thưởng Hoa Hồng (Commission & KPI)',
    content: `# CHÍNH SÁCH THƯỞNG HOA HỒNG VÀ HIỆU SUẤT (KPIs)

Bên cạnh mức lương cứng cơ bản, CAMA Studio áp dụng hệ thống thưởng hoa hồng nhằm ghi nhận và khuyến khích những nỗ lực bứt phá doanh thu của nhân sự.

## 1. Đối với Bộ phận Sale (Tư vấn)
Hoa hồng được tính dựa trên **Doanh thu thực thu** (Khách đã đặt cọc hoặc thanh toán đủ) trong tháng.
*   **Mức 1:** Thưởng **3%** tổng giá trị hợp đồng đối với các gói dịch vụ cơ bản (Thuê váy lẻ, Chụp Studio dưới 15 triệu).
*   **Mức 2:** Thưởng **5%** tổng giá trị hợp đồng đối với các gói dịch vụ Cao cấp (Gói Ngày cưới trọn gói, Chụp ngoại cảnh trên 25 triệu, Váy Haute Couture).
*   *Điều kiện nhận thưởng:* Tỷ lệ chốt đơn (Close Rate) từ khách đến showroom phải đạt tối thiểu 70%.

## 2. Đối với Bộ phận Media & Content
Khuyến khích tạo ra các nội dung viral, đem lại nguồn Khách hàng tiềm năng (Leads).
*   Thưởng **500.000đ** cho mỗi video TikTok/Reels đạt trên 100.000 lượt xem tự nhiên (Organic Views).
*   Thưởng **5%** hoa hồng nếu khách hàng chốt hợp đồng và ghi nhận nguồn đến từ video do bạn trực tiếp sản xuất/lên ý tưởng.`,
    policy_scope: 'GENERAL',
    is_active: true
  },
  {
    title: 'Quy trình Chấm công & Nghỉ phép',
    content: `# QUY TRÌNH CHẤM CÔNG VÀ XIN NGHỈ PHÉP

Để đảm bảo tiến độ công việc và lịch phục vụ khách hàng không bị gián đoạn, quy trình chấm công được quy định chặt chẽ như sau:

## 1. Chấm công và Đi muộn
*   Nhân sự phải có mặt và check-in đúng giờ làm việc (Khối Sale/Media: 9h00, Khối Content: 9h00).
*   **Đi muộn / Về sớm:**
    *   Đi muộn dưới 15 phút: Nhắc nhở (tối đa 3 lần/tháng). Từ lần thứ 4, phạt **50.000đ/lần**.
    *   Đi muộn từ 15 phút - 60 phút: Phạt **100.000đ/lần**.
    *   Đi muộn trên 60 phút: Tính thành nửa ngày nghỉ không lương.

## 2. Quy trình Xin nghỉ phép
*   **Nghỉ phép 1 ngày:** Phải báo trước ít nhất **24 giờ** cho Quản lý trực tiếp trên Group công việc.
*   **Nghỉ phép từ 2 ngày trở lên:** Phải làm form Đơn xin nghỉ phép và báo trước ít nhất **03 ngày**.
*   **Nghỉ ốm đột xuất:** Phải gọi điện trực tiếp báo cáo Quản lý trước ca làm việc ít nhất 2 giờ để sắp xếp người thay thế.
*   **Tuyệt đối nghiêm cấm:** Việc nghỉ không phép (vắng mặt không lý do, không thể liên lạc được). Vi phạm lần 1: Kỷ luật phạt tiền bằng 2 ngày lương. Vi phạm lần 2: Sa thải ngay lập tức.`,
    policy_scope: 'GENERAL',
    is_active: true
  }
];

async function insertPolicies() {
  console.log("Bắt đầu insert 5 chính sách bổ sung...");
  for (const policy of policies) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(policy)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Lỗi khi thêm [${policy.title}]:`, errorText);
      } else {
        console.log(`✅ Đã thêm: ${policy.title}`);
      }
    } catch (err) {
      console.error(`❌ Lỗi network khi thêm [${policy.title}]:`, err);
    }
  }
  console.log("Hoàn tất đẩy dữ liệu!");
}

insertPolicies();
