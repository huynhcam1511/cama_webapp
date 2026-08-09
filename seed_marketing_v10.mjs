import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runSeed() {
  console.log("🚀 Bắt đầu quá trình tạo Gói Campaign Đa Kênh (V10)...");

const campaigns = [
    {
      title: "Campaign Mùa Cưới: The Grand Vow",
      platform: "Facebook, TikTok",
      category: "Váy Bridal, Suit & Vest, Studio Chụp",
      format: "Post (Hình ảnh), Story (24h), Video (Short form)",
      status: "NEW",
      pillar: "Lãng mạn & Đẳng cấp",
      tone_voice: "Sang trọng, Thượng lưu",
      customer_insight: "Khách hàng muốn tìm kiếm một trải nghiệm trọn gói từ Váy, Suit đến Chụp hình chuẩn 5 sao để không phải lo nghĩ gì trong ngày cưới.",
      main_message: "CAMA - Đẳng cấp cưới thượng lưu. Từ bộ Váy Haute Couture lộng lẫy, bộ Suit lịch lãm đến không gian Studio chuyên nghiệp.",
      hook_suggestion: "Bạn có biết 90% cô dâu chú rể hối hận vì không chọn gói dịch vụ trọn gói?",
      cta_target: "Nhắn tin nhận tư vấn gói trọn gói Váy + Suit + Chụp",
      drive_asset_link: "https://drive.google.com/drive/u/0/folders/the_grand_vow",
      
      deliverables: {
        facebook_haute_couture_post: { 
          platform: 'Facebook', category: 'CAMA Haute Couture (Váy)', format: 'Post (Hình ảnh)', 
          caption: 'KHỞI TẠO XU HƯỚNG MÙA CƯỚI 2026 VỚI CAMA HAUTE COUTURE 💍\n\nMùa thu đông năm nay, CAMA mang đến cho các cô dâu tương lai những thiết kế váy cưới độc bản, tinh tế đến từng đường kim mũi chỉ. Không chỉ là váy cưới, đó là tuyên ngôn của sự sang trọng và đẳng cấp.\n\n✨ Hàng trăm mẫu thiết kế Limited Edition\n✨ Form dáng chuẩn Haute Couture tôn trọn đường cong\n✨ Fitting 1-1 cùng chuyên gia phong cách\n\nInbox ngay để đặt lịch fitting VIP!', 
          hashtags: '#CamaHauteCouture #VayCuoiThietKe #VayCuoi2026' 
        },
        facebook_haute_couture_story: { 
          platform: 'Facebook', category: 'CAMA Haute Couture (Váy)', format: 'Story (24h)', 
          caption: 'Sneak peek fitting room! Cô dâu của CAMA rạng rỡ quá 😍', 
          hashtags: '#CAMA' 
        },
        facebook_wedding_post: { 
          platform: 'Facebook', category: 'CAMA Wedding (Studio)', format: 'Post (Hình ảnh)', 
          caption: 'ĐẰNG SAU NHỮNG BỨC ẢNH CƯỚI TRIỆU LIKE LÀ GÌ? 📸\n\nLà sự chuẩn bị kỹ lưỡng từ ekip CAMA Wedding. Từ khâu lên concept, ánh sáng, đến việc chăm sóc cô dâu chú rể từng li từng tí. Chúng tôi không chụp ảnh, chúng tôi lưu giữ khoảnh khắc thanh xuân rực rỡ nhất của bạn.\n\n👉 Nhận ngay báo giá gói chụp Studio & Ngoại cảnh 2026', 
          hashtags: '#CamaWedding #ChupAnhCuoi #StudioCuoi' 
        },
        facebook_suit_post: { 
          platform: 'Facebook', category: 'CAMA Suit', format: 'Post (Hình ảnh)', 
          caption: 'BST SUIT CƯỚI 2026: TÔN VINH VẺ LỊCH LÃM CỦA QUÝ ÔNG 🤵\n\nAi bảo ngày cưới chỉ cô dâu mới cần tỏa sáng? Chú rể của CAMA cũng phải toát lên phong thái đĩnh đạc và cuốn hút nhất. \n\nKhám phá ngay BST Suit nhập khẩu với chất liệu len Merino cao cấp, form ôm vừa vặn, tôn dáng tuyệt đối.', 
          hashtags: '#CamaSuit #VestCuoi #SuitNam' 
        },
        tiktok_cu_video_1: { 
          platform: 'TikTok Cũ', category: 'Váy Bridal', format: 'Video Ngắn', 
          caption: 'Tuyệt chiêu chọn váy cưới "hack dáng" cho cô dâu nhỏ nhắn! 👗 #ChonVayCuoi #CAMA', 
          hashtags: '#ChonVayCuoi #CAMA #VayCuoiDep',
          script_details: [
            { time: "00:00 - 00:03", camera: "Toàn cảnh, góc thấp lên", acting_cue: "Cô dâu bước ra từ phòng thử đồ, ánh sáng spotlight chiếu vào, rèm mở từ từ", dialogue: "Bạn là cô dâu nấm lùn và luôn tự ti khi mặc váy cưới?" },
            { time: "00:03 - 00:07", camera: "Trung cảnh, xoay máy quanh cô dâu", acting_cue: "Chuyên viên tư vấn xuất hiện, chỉ vào điểm nhấn eo và tùng váy", dialogue: "Đừng lo, thiết kế chữ A với phần eo nâng cao này sinh ra là dành cho bạn." },
            { time: "00:07 - 00:12", camera: "Cận cảnh", acting_cue: "Zoom vào chi tiết đính đá dọc thân váy tạo hiệu ứng thị giác", dialogue: "Cộng thêm họa tiết đính đá chạy dọc, đôi chân bạn trông sẽ dài miên man luôn!" },
            { time: "00:12 - 00:15", camera: "Toàn cảnh", acting_cue: "Cô dâu mỉm cười tự tin, xoay một vòng, text CTA hiện lên", dialogue: "Ghé CAMA Haute Couture để thử ngay nhé!" }
          ]
        },
        tiktok_cu_video_2: { 
          platform: 'TikTok Cũ', category: 'Váy Bridal', format: 'Video Hậu Trường', 
          caption: 'Cận cảnh chiếc váy 1 TỶ ĐỒNG của CAMA có gì? 😱 #VayCuoiThietKe #CAMA', 
          hashtags: '#VayCuoiThietKe #VayCuoiTrieuDo',
          script_details: [
            { time: "00:00 - 00:05", camera: "Cận cảnh cực đại (Macro)", acting_cue: "Quay lướt qua hàng ngàn viên pha lê Swarovski lấp lánh dưới đèn", dialogue: "Đây là chiếc váy khiến mọi cô gái phải ao ước..." },
            { time: "00:05 - 00:10", camera: "Trung cảnh", acting_cue: "Thợ thủ công đang tỉ mỉ đính từng viên đá bằng tay", dialogue: "Hơn 500 giờ làm việc thủ công không ngừng nghỉ của 3 nghệ nhân hàng đầu." },
            { time: "00:10 - 00:15", camera: "Toàn cảnh, Slow motion", acting_cue: "Cô dâu mặc váy đi trên thảm đỏ, tùng váy lộng lẫy bung xòe", dialogue: "Hãy đến CAMA và trải nghiệm cảm giác làm nữ hoàng trong ngày trọng đại!" }
          ]
        }
      }
    },
    {
      title: "Campaign Đào Tạo: Mastery of Light",
      platform: "Facebook, TikTok",
      category: "Academy (Đào tạo)",
      format: "Post, Video Course Intro",
      status: "NEW",
      pillar: "Kiến thức chuyên sâu",
      tone_voice: "Chuyên gia, Truyền cảm hứng",
      customer_insight: "Thợ ảnh muốn nâng cao tay nghề đánh sáng studio.",
      main_message: "Khoá học Mastery of Light do chính Cao Hùng trực tiếp đứng lớp.",
      hook_suggestion: "Tại sao ánh sáng quyết định 80% thành công của bức ảnh?",
      cta_target: "Đăng ký khóa học K30",
      drive_asset_link: "https://drive.google.com/drive/u/0/folders/mastery_of_light",
      
      deliverables: {
        facebook_academy_post: { 
          platform: 'Facebook', category: 'CAMA Academy', format: 'Post (Hình ảnh)', 
          caption: 'TUYỂN SINH KHOÁ NHIẾP ẢNH STUDIO K30 - TỪ SỐ 0 ĐẾN MASTER 🎓\n\nBạn có đam mê nhiếp ảnh nhưng chưa biết bắt đầu từ đâu? Hoặc bạn đang kẹt ở một level và muốn bứt phá?\nĐến với K30 của CAMA Academy, bạn sẽ được học:\n- Tư duy ánh sáng định hình khối\n- Cách pose dáng tự nhiên\n- Hậu kỳ Photoshop & Lightroom nâng cao\n\nInbox để nhận lộ trình học chi tiết!', 
          hashtags: '#CamaAcademy #DaoTaoNhiepAnh #HocChupAnh' 
        },
        facebook_ca_nhan_post: { 
          platform: 'Facebook', category: 'Cá nhân Cao Hùng', format: 'Post (Chia sẻ)', 
          caption: 'Hôm nay chia sẻ một chút về tư duy đánh sáng với các bạn trẻ. Ánh sáng không chỉ để làm sáng khuôn mặt, ánh sáng là công cụ để vẽ lên cảm xúc. Nếu bạn không hiểu ánh sáng, bạn chỉ đang bấm máy vô hồn.\n\nHẹn gặp các bạn ở K30 nhé!', 
          hashtags: '#CaoHungNguyen #NhiepAnhGia' 
        },
        tiktok_moi_video: { 
          platform: 'TikTok Mới', category: 'Academy (Đào tạo)', format: 'Video Ngắn', 
          caption: 'Bí mật đánh sáng ven chân dung cực nghệ! 💡 #HocChupAnh #CAMA_Academy', 
          hashtags: '#HocChupAnh #CAMA_Academy #TipsChupAnh',
          script_details: [
            { time: "00:00 - 00:04", camera: "Trung cảnh", acting_cue: "Anh Hùng đứng trong studio tối, bật đèn ven", dialogue: "Muốn chân dung nổi khối, tách hẳn khỏi nền? Dùng ngay đèn ven!" },
            { time: "00:04 - 00:10", camera: "Cận cảnh setup đèn", acting_cue: "Hướng dẫn viên đặt đèn góc 45 độ phía sau mẫu", dialogue: "Đặt một đèn với chóa nhỏ góc 45 độ chéo từ phía sau mẫu." },
            { time: "00:10 - 00:15", camera: "So sánh Before / After", acting_cue: "Màn hình chia đôi: Chưa có đèn ven và có đèn ven", dialogue: "Và đây là kết quả! Khối tóc và vai nổi bật lên ngay. Áp dụng thử nhé!" }
          ]
        }
      }
    }
  ];

  try {
    const url = `${supabaseUrl}/rest/v1/marketing_contents`;
    
    // Xóa data cũ
    await fetch(`${url}?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(campaigns)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Insert failed: ${response.status} ${err}`);
    }
    
    console.log(`🎉 Đã fetch thành công Gói Campaign Đa Kênh (V10) vào Database!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  }
}

runSeed();
