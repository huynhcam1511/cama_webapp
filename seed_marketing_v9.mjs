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
  console.log("🚀 Bắt đầu quá trình tạo Kịch bản Series Chuyên Gia (Bản dài 40s + Diễn xuất) V9...");

  const ideas = [
    {
      title: "Váy cưới trên mạng 3 triệu vs Váy cưới CAMA",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Thuyết phục, Sắc sảo",
      customer_insight: "Nhiều người bị mờ mắt bởi giá rẻ trên mạng, so sánh trực tiếp với tiền thuê váy của Studio.",
      main_message: "Tiền thuê váy không chỉ là thuê 1 bộ đồ, mà là thuê sự an tâm, dịch vụ bảo quản, và form dáng thiết kế độc quyền 12 xương.",
      hook_suggestion: "Khách chê giá thuê bên mình bằng tiền mua luôn 1 cái váy trên mạng anh ạ!",
      cta_target: "Nhắn tin nhận tư vấn form dáng",
      assets_needed: "Hiền cầm iPad đọc phản hồi. Hùng đang cầm 1 chiếc váy thật, chỉ vào các lớp lót và đường may. Âm thanh ASMR lật váy.",
      trending_audio: "Nhạc nền lo-fi tâm sự nhẹ",
      trend_reference: "Format Talkshow tương tác",
      script_details: [
        { time: "0-6s", camera: "Cận mặt Hiền", acting_cue: "Hiền cau mày, chỉ tay vào màn hình iPad vẻ bức xúc.", dialogue: "Anh Hùng, khách comment chê giá thuê váy cưới bên mình mắc bằng tiền mua đứt luôn cái váy trên shopee kìa anh. Sao mình không giảm giá tí cho dễ chốt?" },
        { time: "6-18s", camera: "Trung cảnh Hùng đang ủi váy", acting_cue: "Hùng dừng tay ủi, quay lại nhìn Hiền, cười nhếch mép tự tin. Nhấn mạnh từng chữ.", dialogue: "Mua cái váy 3 triệu trên mạng mặc xong cất xó, năm sau lôi ra ố vàng thì có rẻ không em? Em nghĩ xem, người ta đang so sánh một mảnh vải may công nghiệp với một tác phẩm nghệ thuật à?" },
        { time: "18-30s", camera: "Cận cảnh bàn tay Hùng lật lớp tùng váy bên trong", acting_cue: "Hùng lật tùng váy cho camera thấy rõ lớp corset nẹp xương. Giọng điệu chuyên nghiệp, dứt khoát.", dialogue: "Nhìn này, ở CAMA, váy giặt hấp vô trùng 5 bước, lụa Pháp xịn, form nẹp 12 xương định hình siết eo. Đứa nào dám bảo mua váy 3 triệu trên mạng mà form đứng cứng cáp như vầy anh đền gấp 10 lần!" },
        { time: "30-40s", camera: "Toàn cảnh Hùng và Hiền", acting_cue: "Hùng giơ tay vỗ nhẹ vào vai Hiền. Hiền gật gù tâm đắc.", dialogue: "Khách hàng của CAMA đang trả tiền cho sự hoàn hảo trong ngày trọng đại nhất đời họ, chứ không phải trả tiền thuê mướn một mảnh vải. Hiểu chưa?" }
      ],
      social_post_caption: "Váy 3 triệu trên mạng và Váy cao cấp CAMA khác nhau chỗ nào? 😱\nNghe anh Hùng bóc trần sự thật về giá trị thật sự của một chiếc váy cưới nhé! Chị em đừng vì rẻ mà 'ôm hận' trong ngày trọng đại!",
      social_post_hashtags: "#cama #serieschuyengia #vaycuoicaocap #founderCAMA #vaycuoigiare"
    },
    {
      title: "Cô dâu béo bụng có mặc được Váy Đuôi Cá?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Đồng cảm, Đảm bảo",
      customer_insight: "Dâu tự ti về mỡ bụng (đặc biệt bụng dưới), tự mặc định chỉ mặc được váy xòe, sợ lộ dáng nếu mặc đuôi cá.",
      main_message: "Váy đuôi cá CAMA được thiết kế 'đo ni đóng giày' với corset đai hông siết chặt, nắn lại toàn bộ mỡ thừa.",
      hook_suggestion: "Chị khách 65kg hỏi em: Béo bụng thì cấm chỉ định mặc váy đuôi cá hả anh?",
      cta_target: "Dâu béo mạnh dạn inbox thử váy",
      assets_needed: "Hiền đóng vai dâu tự ti, đứng rụt rè. Hùng lấy ra 1 chiếc váy đuôi cá và giải thích chi tiết cấu trúc corset eo.",
      trending_audio: "Nhạc truyền cảm hứng",
      trend_reference: "Format tư vấn 1-1 chuyên nghiệp",
      script_details: [
        { time: "0-8s", camera: "Góc quay từ dưới lên", acting_cue: "Hiền chống tay lên hông, mặt mếu máo phồng má.", dialogue: "Anh ơi, hồi sáng có bà chị 65kg vô khóc lóc với em, bả kêu 'Béo bụng như chị thì cấm chỉ định mặc váy đuôi cá phải không em?'. Thấy thương ghê á!" },
        { time: "8-18s", camera: "Hùng bước vào khung hình", acting_cue: "Hùng xua tay, lấy ngay 1 chiếc đuôi cá từ kệ ra. Giọng chắc nịch.", dialogue: "Trời đất, ai nói béo bụng không mặc được đuôi cá? Nếu sợ lộ mỡ là do cái váy đó mỏng tang, không có cấu trúc định hình thôi em!" },
        { time: "18-28s", camera: "Quay cận cảnh cấu trúc siết eo bên trong chiếc đuôi cá", acting_cue: "Hùng vuốt dọc theo đường nẹp xương ở bụng, chỉ rõ cho người xem.", dialogue: "Đuôi cá của nhà CAMA anh thiết kế riêng phần bụng dưới nẹp 12 xương thép xoắn dẻo, kết hợp đai hông siết chặt. Nó nắn toàn bộ mỡ thừa chui tọt vào trong luôn!" },
        { time: "28-40s", camera: "Chèn b-roll dâu tròn trịa mặc váy đuôi cá cười tươi", acting_cue: "Giọng Hùng voiceover ấm áp, tự hào.", dialogue: "Chỉ cần 5 phút kéo khóa, 65kg cũng hóa đồng hồ cát. Dâu nào đang tự ti, cứ mạnh dạn nhắn CAMA, anh cân hết!" }
      ],
      social_post_caption: "Ai bảo béo bụng là phải chia tay váy Đuôi Cá? 🧜‍♀️\nLầm to rồi nha! Chị em cứ xem xong clip này là tự tin book lịch thử ngay lập tức! Ở CAMA, form dáng là 'bất bại'!",
      social_post_hashtags: "#cama #codau65kg #vayduoica #tuvanchodau"
    },
    {
      title: "Giải ngố: Đá thường vs Pha Lê Swarovski",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "DRAFTING",
      pillar: "Founder Authority",
      tone_voice: "Kiến thức, Trực quan",
      customer_insight: "Sợ bị studio 'lùa gà' quảng cáo đính đá pha lê Swarovski tiền triệu nhưng thực chất là đá nhựa dỏm rẻ tiền.",
      main_message: "CAMA minh bạch 100% về chất liệu. Đá Swarovski bắt sáng khác biệt hoàn toàn với đá thường.",
      hook_suggestion: "Pha lê tiền triệu với đá nhựa 10 ngàn 1 bịch thì khác nhau chỗ nào?",
      cta_target: "Đến CAMA xem thực tế",
      assets_needed: "1 viên đá nhựa (prop), 1 chiếc váy CAMA đính Swarovski thật. Tắt hết đèn trong phòng, chỉ dùng đèn pin điện thoại để test hiệu ứng ánh sáng (Rất quan trọng).",
      trending_audio: "Nhạc ASMR tiếng đính hạt",
      trend_reference: "Thử thách Test chất lượng thực tế",
      script_details: [
        { time: "0-10s", camera: "Phòng hơi tối, cận cảnh Hiền", acting_cue: "Hiền cầm đèn pin soi soi vào 1 viên đá bự chảng, cười hớn hở.", dialogue: "Anh xem nè, khách bảo đá này mua ngoài chợ 10 ngàn 1 bịch, soi đèn vào nó cũng chói chang quá trời, tội gì phải đính Swarovski tiền triệu cho tốn tiền?" },
        { time: "10-22s", camera: "Hùng kéo tấm rèm đen che bớt sáng", acting_cue: "Hùng lắc đầu ngán ngẩm, kéo 1 chiếc váy cao cấp ra. Giọng điệu kiểu 'để anh dạy cho em bài học'.", dialogue: "Em lầm to! Ánh sáng gắt làm em loá mắt thôi. Giờ em lấy đèn pin đó soi qua chiếc váy đính 3000 viên Swarovski thật của CAMA anh xem!" },
        { time: "22-35s", camera: "Cận cảnh cực đại vào đá Swarovski dưới ánh đèn pin", acting_cue: "Hùng xoay nhẹ chiếc váy, ánh sáng tán sắc 7 màu bung ra rực rỡ, lấp lánh như cầu vồng.", dialogue: "Thấy khác biệt chưa? Đá thường nó chỉ chói 1 màu đục, còn Pha lê Swarovski nó khúc xạ ánh sáng 7 màu cực kì bén. Ngay cả trong bóng râm nó vẫn phản chiếu lấp lánh." },
        { time: "35-45s", camera: "Hùng nhìn thẳng ống kính", acting_cue: "Hùng nháy mắt, gật đầu khẳng định chất lượng.", dialogue: "Bước lên sân khấu, khách mời sẽ tự biết cô dâu đang mặc cái váy đẳng cấp hay váy hàng chợ ngay lập tức. Đó là giá trị của sự khác biệt!" }
      ],
      social_post_caption: "Tập 3: 'Lật tẩy' đá nhựa 10K và Pha lê Swarovski hàng hiệu! 💎\nXem xong clip này, dâu khỏi lo bị các studio qua mặt bằng những lời quảng cáo hoa mỹ nhé!",
      social_post_hashtags: "#cama #swarovski #phabietvaycuoi #chuyengiavaycuoi"
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
      body: JSON.stringify(ideas)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Insert failed: ${response.status} ${err}`);
    }
    
    console.log(`🎉 Đã fetch thành công 3 kịch bản Cực Sâu (V9) vào Database!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  }
}

runSeed();
