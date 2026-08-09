require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const finalCampaign = {
  title: "🎯 [TEST FULL] Chuyên Gia 12: Đập Tan Ám Ảnh Váy Cưới Rập Khuôn",
  status: "NEW",
  deliverables: {
    tiktok_video_1: {
      platform: "TikTok",
      format: "Video Dọc",
      industry: "Váy Bridal",
      page: "TikTok CAMA Haute Couture",
      content_pillar: "Chuyên Gia Đào Tạo (Expert)",
      media_requirements: "Quay bằng iPhone 15 Pro Max, góc quay ngang tầm mắt, ánh sáng tự nhiên. Media chuẩn bị trước 2 chiếc váy: 1 chiếc bồng xòe đính đá đại trà, 1 chiếc váy Satin tối giản chuẩn kỹ thuật Draping của CAMA để Anh Cao Hùng thị phạm trực tiếp.",
      customer_insight: "Cô dâu bị ám ảnh bởi việc phải chọn những chiếc váy bồng xòe, lấp lánh đính đá để 'nổi bật' trong ngày cưới. Họ không hiểu rằng sự nổi bật thực sự đến từ form dáng vừa vặn và chất liệu cao cấp, chứ không phải từ những chi tiết rườm rà. Họ sợ bị chê là 'giản dị quá' nếu mặc váy trơn, dẫn đến việc chọn sai váy và trở nên sến sẩm, khó di chuyển trong tiệc cưới.",
      main_message: "CAMA định nghĩa lại sự lộng lẫy: Sự lộng lẫy không đong đếm bằng số lượng pha lê đính trên váy, mà bằng kỹ thuật cắt may hoàn hảo tôn vinh đường cong cơ thể. Một chiếc váy Satin tối giản với kỹ thuật Draping xuất sắc sẽ biến bạn thành một nàng thơ thực sự, chứ không phải một cây thông Noel di động.",
      tone_voice: "Thẳng thắn, chuyên môn cao, mang tính giáo dục thị trường. Anh Cao Hùng và Hiền sẽ đóng vai trò người thức tỉnh, phá vỡ định kiến cũ kỹ.",
      hook_suggestion: "Hiền mặc thử chiếc váy đính đá rườm rà, bước đi khó khăn và nhăn nhó. Anh Cao Hùng bước tới, lắc đầu ngán ngẩm: 'Em đang mặc váy cưới, hay đang vác cả một cửa hàng đá quý trên người vậy?'",
      caption: "CỨ ĐÍNH NHIỀU ĐÁ LÀ SANG? BẠN ĐANG MẶC VÁY HAY VÁC ĐÁ? 💎🚫\n\nRất nhiều cô dâu đến CAMA mang theo một định kiến: Váy cưới là phải thật to, thật xòe, thật nhiều đá pha lê mới lộng lẫy. Nhưng sự thật là, khi bạn đắp quá nhiều chi tiết rườm rà lên người, chiếc váy đã 'nuốt chửng' nhan sắc của bạn.\n\nAnh Cao Hùng luôn nói: 'Đẳng cấp nằm ở kỹ thuật dựng form, không phải ở số lượng hạt cườm'. Tại CAMA, chúng tôi tôn thờ vẻ đẹp tinh tế của chất liệu cao cấp và đường cắt may tỉ mỉ. \n\n#CamaBridal #AnhCaoHung #VayCuoiToiGian #ThietKeDocQuyen",
      hashtags: "#CamaBridal #AnhCaoHung #VayCuoiToiGian #ThietKeDocQuyen #XuHuongVayCuoi",
      script_details: [
        { 
          time: "0-60s", 
          camera: "Medium shot tại phòng thử đồ VIP. Máy quay tĩnh.", 
          acting_cue: "Hiền cố gắng xoay người trong chiếc váy đính đá cồng kềnh, mặt lộ rõ vẻ mệt mỏi. Anh Cao Hùng đứng cạnh, khoanh tay quan sát.", 
          dialogue: "Hiền: Anh Hùng ơi, cái váy này khách đòi đính thêm đá cho 'sáng', mà em mặc thử thấy nặng như đeo tạ ấy, đi không nổi luôn!\n\nAnh Cao Hùng: (Lắc đầu) Đấy là sai lầm kinh điển! Khách cứ nghĩ đính đá là sang, nhưng thực tế lên sân khấu, đèn đóm rọi vào chỉ thấy một cục sáng lóa, không ai nhìn thấy mặt cô dâu đâu. Em cởi cái 'cây thông' này ra, mặc thử mẫu Satin mới nhà mình xem.\n\n(Hiền thay váy Satin tối giản, bước ra nhẹ nhàng, thanh thoát)\n\nAnh Cao Hùng: Nhìn xem! Không một viên đá nào, nhưng đường cắt Draping siết chặt eo, lụa Satin bắt sáng mượt mà. Đây mới là đẳng cấp! Lộng lẫy là khi em mặc chiếc váy, người ta khen 'Em đẹp quá', chứ không phải khen 'Cái váy đính nhiều đá quá'."
        }
      ],
      seeding_comments: [
        "Công nhận, đợt trước cưới mình cũng bị cuồng đính đá, giờ xem lại ảnh thấy sến kinh khủng.",
        "Anh Hùng nói chuẩn quá, váy trơn mới là chân ái, sang trọng vượt thời gian.",
        "Nhìn chị Hiền mặc váy Satin mà mê mẩn, form dáng đẹp xuất sắc."
      ]
    },
    facebook_reels_1: {
      platform: "Facebook",
      format: "Reels",
      industry: "Váy Bridal",
      page: "CAMA Haute Couture",
      content_pillar: "Chuyên Gia Đào Tạo (Expert)",
      media_requirements: "Tái sử dụng footage từ clip TikTok nhưng dựng lại với nhịp độ nhanh hơn ở 3s đầu (Jump cut) để phù hợp thuật toán Reels. Chèn text to đùng: 'Sai lầm 99% cô dâu mắc phải'.",
      customer_insight: "Sự tiếp nối của insight TikTok, nhưng nhắm vào tệp khách hàng lướt Reels nhanh. Họ cần một cú vả trực diện vào định kiến ngay lập tức.",
      main_message: "CAMA định nghĩa lại sự lộng lẫy: Kỹ thuật cắt may > Số lượng pha lê.",
      tone_voice: "Thẳng thắn, chuyên môn cao, nhịp độ dồn dập.",
      hook_suggestion: "Jump cut thẳng vào mặt Anh Cao Hùng: 'Đừng biến mình thành cây thông Noel trong ngày cưới nữa!'",
      caption: "SAI LẦM KINH ĐIỂN: CỨ ĐÍNH ĐÁ LÀ SANG? 💎🚫\n\nAnh Cao Hùng bóc trần sự thật về những chiếc váy cưới 'dát' đầy pha lê. Bạn muốn lộng lẫy hay muốn bị chiếc váy nuốt chửng?\n\n#CamaBridal #AnhCaoHung #VayCuoiToiGian",
      hashtags: "#CamaBridal #AnhCaoHung #VayCuoiToiGian",
      script_details: [
        { 
          time: "0-30s", 
          camera: "Jump cut liên tục. Tập trung vào biểu cảm của Anh Cao Hùng và sự khác biệt rõ rệt giữa 2 chiếc váy.", 
          acting_cue: "Nhịp điệu nhanh, dứt khoát.", 
          dialogue: "Anh Cao Hùng: Đừng biến mình thành cây thông Noel nữa! Khách cứ nghĩ đính đá là sang, nhưng lên sân khấu chỉ thấy lóa mắt, chìm nghỉm luôn nhan sắc thật. (Chỉ sang Hiền đang mặc váy Satin). Nhìn này! Không đá, không kim sa, nhưng đường cắt siết eo chuẩn chỉ. Sang trọng là ở form dáng, nhớ nhé!"
        }
      ],
      seeding_comments: [
        "Váy Satin Cama làm form đỉnh thật sự, siết eo bé tí.",
        "Em cũng thích váy trơn giống anh Hùng tư vấn."
      ]
    },
    facebook_reels_2: {
      platform: "Facebook",
      format: "Reels",
      industry: "Váy Bridal",
      page: "CAMA Wedding",
      content_pillar: "Chuyên Gia Đào Tạo (Expert)",
      media_requirements: "Cùng footage nhưng đổi Hook. Text: 'Thương hiệu CAMA không bán váy đính đá?'.",
      customer_insight: "Tệp khách hàng bên CAMA Wedding cần sự tin tưởng vào tổng thể dịch vụ (cả váy, cả ảnh).",
      main_message: "Sự tinh tế trong chọn váy quyết định bộ ảnh cưới hoàn hảo.",
      tone_voice: "Thuyết phục, liên kết với việc chụp ảnh phóng sự.",
      hook_suggestion: "Anh Cao Hùng cầm chiếc váy đính đá lên và nói: 'Mặc cái này chụp phóng sự thì xách váy cũng hết ngày!'",
      caption: "VÁY CƯỚI TỐI GIẢN - BÍ QUYẾT CHO BỘ ẢNH PHÓNG SỰ 'SỐNG MÃI' 📸\n\nChiếc váy quá cồng kềnh sẽ giết chết cảm xúc tự nhiên của bạn. Hãy để Anh Cao Hùng và CAMA giúp bạn.\n\n#CamaWedding #AnhCaoHung #AnhCuoiPhongSu",
      hashtags: "#CamaWedding #AnhCaoHung #AnhCuoiPhongSu",
      script_details: [
        { 
          time: "0-30s", 
          camera: "Góc quay từ dưới lên (Low angle) khi Anh Cao Hùng nói về nhiếp ảnh.", 
          acting_cue: "Hùng diễn giải bằng tay, Hiền minh họa cách di chuyển nhẹ nhàng với váy Satin.", 
          dialogue: "Anh Cao Hùng: Mặc váy đính đá xòe to chụp phóng sự thì xách váy cũng hết ngày! Lúc cần khóc cười tự nhiên thì lại vướng víu. Thay vào đó, chọn một chiếc Satin tối giản, em cứ tự do chạy nhảy, múa hát, máy ảnh bắt trọn thần thái. Cama không chỉ bán váy, Cama bán cả trải nghiệm ngày cưới!"
        }
      ],
      seeding_comments: [
        "Quá chuẩn, bữa cưới mình mặc váy to quá đi lết không nổi, chụp ảnh mặt nhăn nhó.",
        "Hiền mặc váy Satin di chuyển mượt ghê."
      ]
    },
    tiktok_video_2: {
      platform: "TikTok",
      format: "Video Dọc",
      industry: "Váy Bridal",
      page: "TikTok Hiền",
      content_pillar: "Kể Chuyện (Storytelling)",
      media_requirements: "Khung hình có sự xuất hiện nhiều hơn của Hiền. Góc quay POV (như đang kể chuyện trực tiếp với follower).",
      customer_insight: "Cô dâu thích nghe chuyện tâm tình từ góc độ một người phụ nữ (Hiền) hơn là lời khuyên chuyên môn khô khan.",
      main_message: "Hiền đã từng thấy rất nhiều giọt nước mắt hối hận vì chọn sai váy, và Hiền ở đây để giúp bạn tránh vết xe đổ đó.",
      tone_voice: "Tâm tình, thủ thỉ, đồng cảm sâu sắc.",
      hook_suggestion: "Hiền ngồi uống trà, nhìn thẳng vào ống kính: 'Các bà đừng bao giờ để mẹ chồng đi chọn váy cưới cùng, trừ phi...'",
      caption: "CÂU CHUYỆN ĐẰNG SAU CHIẾC VÁY 'CÔNG CHÚA' 👑\n\nLại là Hiền đây. Hôm nay kể cho các bà nghe câu chuyện về một cô dâu bị ép mặc váy đính đá đến mức khóc sưng mắt.\n\n#TikTokHien #TamSuCoDau #CamaBridal",
      hashtags: "#TikTokHien #TamSuCoDau #CamaBridal #VayCuoi",
      script_details: [
        { 
          time: "0-60s", 
          camera: "Quay POV, Hiền ngồi gần ống kính, ánh sáng ấm.", 
          acting_cue: "Hiền kể chuyện với biểu cảm linh hoạt, thi thoảng có Anh Cao Hùng đi lướt qua phía sau làm cameo.", 
          dialogue: "Hiền: Các bà đừng bao giờ để mẹ chồng chọn váy cưới cùng, trừ phi mẹ cực kỳ tâm lý! Tuần trước tui mới tiếp một ca, mẹ chồng bắt nằng nặc lấy cái váy đính hạt cườm lấp lánh như dạ hội, bảo thế mới môn đăng hộ đối. Cô dâu dáng nhỏ xíu, khoác cái váy lên như bị nuốt chửng luôn, đứng khóc thút thít. May sao anh Cao Hùng nhà tui lôi ngay con Satin mới ra, phân tích một hồi về form dáng với tỷ lệ cơ thể. Thế là mẹ chồng 'lú' luôn, ưng cái bụng chốt liền. Đáy, đám cưới mình, mình phải đẹp theo cách của mình, các bà nhớ nhé!"
        }
      ],
      seeding_comments: [
        "Nghe chị Hiền kể chuyện cuốn quá.",
        "Đúng ý tôi luôn, sợ nhất là người lớn can thiệp vụ váy vóc."
      ]
    }
  }
};

async function seed() {
  console.log('Đang nạp 1 Campaign [TEST FULL] có đủ Ngành hàng, Trang, Pillar, Media...');
  const { error } = await supabase.from('marketing_contents').insert([finalCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã nạp thành công Campaign [TEST FULL]!');
  }
}

seed();
