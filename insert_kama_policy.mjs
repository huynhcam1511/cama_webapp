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
    title: 'Nội Quy & Nguyên Tắc Vận Hành KAMA HAUTE COUTURE',
    content: `# NỘI QUY VÀ NGUYÊN TẮC VẬN HÀNH KAMA HAUTE COUTURE

Dưới đây là các nội quy, quy định và nguyên tắc vận hành nội bộ tại Kama Wedding được tổng hợp chi tiết từ các cuộc thảo luận, chia sẻ thực tế của Ban Giám đốc:

## I. Nội Quy Giờ Giấc & Tác Phong Làm Việc Chung
*   **Kỷ luật giờ giấc nghiêm túc:** Toàn bộ nhân sự phải tuân thủ nghiêm ngặt giờ giấc làm việc theo quy định, không đi muộn về sớm. Nghiêm cấm tình trạng đến giờ làm việc nhưng tụ tập ăn sáng hoặc lười biếng.
*   **Tác phong làm việc chuyên tâm:** Trong giờ làm việc, nhân viên tuyệt đối không được rảnh rỗi lướt TikTok hoặc sử dụng điện thoại vào việc riêng.
*   **Thực hiện bài kiểm tra định kỳ:** Nhân viên phải tham gia các buổi đào tạo nội bộ về kiến thức sản phẩm (form dáng vest, bảng size số) và làm bài kiểm tra tác phong để đánh giá năng lực.

## II. Quy Định Vệ Sinh & Bàn Giao Ca (Yêu Cầu Rất Cao)
*   **Giữ gìn không gian sạch đẹp:** Nhân viên phòng váy và phòng vest phải tự giác sắp xếp không gian gọn gàng. Tuyệt đối không để xảy ra tình trạng vứt đồ bừa bãi, treo đồ ngổn ngang rồi hết giờ là đi về. Thấy rác tại cửa hàng là phải nhặt ngay lập tức.
*   **Báo cáo không gian đầu - cuối ngày:** Đầu ngày khi đến nhận ca và cuối ngày trước khi ra về, nhân viên bắt buộc phải chụp ảnh toàn bộ không gian làm việc sạch sẽ, ngăn nắp và tải báo cáo lên hệ thống mới để giám sát.

## III. Quy Tắc Vàng Trong Tư Vấn & Phục Vụ Khách Hàng
*   **Phục vụ theo phong cách "Gia đình" (Trọng tâm thương hiệu):** Không phục vụ theo kiểu quá công nghiệp, lâm sàng (làm khách đề phòng). Nhân viên phải tạo không khí gần gũi, tin tưởng như người nhà để dễ dàng tư vấn và chốt hợp đồng.
*   **Làm chủ việc định hình phong cách:** Khách hàng không tự chọn đồ. Nhân viên phải là người quan sát khuyết điểm cơ thể của khách (béo, gầy, đùi to, chân vòng kiềng...) để chủ động chọn và phối đồ phù hợp. Sẵn sàng dùng chuyên môn để thuyết phục, "dập tắt" các ý định phối đồ không đẹp của khách để hướng họ tới phong cách giúp họ chiếm spotlight tại sự kiện.
*   **Nguyên tắc "Không ép khách":** Tuyệt đối không được ép khách chốt hợp đồng bằng mọi giá. Nếu khách còn lăn tăn, hãy khuyên họ về suy nghĩ kỹ. Thậm chí, nếu khách đã cọc giữ váy nhưng tìm được mẫu ưng ý hơn ở bên khác, sẵn sàng hoàn trả lại tiền cọc.
*   **Giới hạn số lượng phục vụ:** Để đảm bảo dịch vụ tốt nhất, cửa hàng chỉ nhận tối đa 1 khách chụp mỗi ngày, không nhận dồn dập.
*   **4 nguyên tắc giao tiếp cốt lõi:**
    1.  Không để khách phải chờ đợi.
    2.  Tuyệt đối không tranh luận trước mặt khách.
    3.  Không tự ý báo giá bừa bãi (nhân viên phải tuân theo bảng giá quy định, trường hợp không biết rõ phải hỏi ý kiến Giám đốc, riêng bộ phận Sale mới có quyền tự quyết định giá).
    4.  Bảo mật tuyệt đối thông tin khách hàng.
*   **Đảm bảo sự chuẩn xác:** Tuyệt đối không được để thiếu đồ, thất lạc phụ kiện, không ghi sai ngày cưới và không đo sai số đo của khách.

## IV. Quy Tắc Ứng Xử Trong Phòng Thử Váy (Fitting Room)
*   **Luôn xin phép trước:** Nhân viên bắt buộc phải xin phép khách hàng trước khi chạm vào người cô dâu để chỉnh sửa trang phục.
*   **Cấm kỵ nói xấu:** Tuyệt đối không được nói xấu khách hàng này với khách hàng khác, hoặc bàn tán nói xấu khách trước mặt cô dâu đang thử đồ. Đây là điều tối kỵ nặng nhất tại cửa hàng.

## V. Quy Trình Vận Hành Số Hóa Trên Web App Mới
*   **Hạn chế sử dụng Zalo:** Yêu cầu chuyển hoàn toàn việc trao đổi công việc, báo cáo, và quản lý xuất/nhập đồ từ Zalo sang hệ thống Web App mới.
*   **Quét mã QR kệ kho:** Mỗi kệ kho (trong số 20 vị trí kệ đã được quét 3D) sẽ có một mã QR cố định. Nhân viên muốn lấy đồ ra giao cho khách hoặc cất đồ vào kho đều bắt buộc phải quét mã QR tại kệ đó để hệ thống cập nhật đúng vị trí sản phẩm, tránh treo lộn xộn.
*   **Chụp ảnh QC (Kiểm định chất lượng):** Ở khâu giao đồ đi và nhận đồ thu hồi về, nhân viên bắt buộc phải chụp ảnh tình trạng sản phẩm thực tế (QC) và tải trực tiếp lên Web App để làm bằng chứng đối chiếu.
*   **Theo dõi đơn hàng sát sao:** Nhân viên Sale và bộ phận quản lý phải theo dõi tiến độ đơn hàng qua 5 đợt thanh toán kèm cọc. Đặc biệt chú ý đến các cảnh báo đỏ trên hệ thống đối với những đơn hàng quá hạn trả đồ để kịp thời xử lý.`,
    policy_scope: 'GENERAL',
    is_active: true
  }
];

async function insertPolicies() {
  console.log("Bắt đầu insert nội quy Kama Haute Couture...");
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
