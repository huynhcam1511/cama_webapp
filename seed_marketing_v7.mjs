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
  console.log("🚀 Bắt đầu quá trình tạo 10 Kịch bản TikTok chuyên sâu (V7)...");

  const ideas = [
    {
      title: "Biến hình: Cô dâu bánh bèo vs Cô dâu cool ngầu",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Guided Experience",
      tone_voice: "Trẻ trung, Trend",
      customer_insight: "Dâu phân vân không biết mình hợp phong cách nhẹ nhàng hay sắc sảo cá tính.",
      main_message: "CAMA có đủ thiết kế để nàng biến hóa 180 độ chỉ trong 1 nốt nhạc.",
      hook_suggestion: "Có bao giờ nàng nghĩ mình mặc đồ cá tính còn hợp hơn bánh bèo?",
      cta_target: "Inbox book thử váy 2 phong cách",
      assets_needed: "Video 2 trang phục: 1 Váy ren mềm mại, 1 Váy satin xẻ tà sắc sảo + Phụ kiện kính râm đen.",
      trending_audio: "Nhạc beat drop (Trend thay đồ nhanh)",
      trend_reference: "Trend lấy tay đập vào cam để chuyển cảnh váy.",
      script_details: [
        { time: "0-3s", camera: "Cận cảnh dâu mặc váy ren ngọt ngào", dialogue: "Mọi người bảo mình chỉ hợp phong cách bánh bèo..." },
        { time: "3-4s", camera: "Lấy tay đập vào cam", dialogue: "*Drop nhạc*" },
        { time: "4-15s", camera: "Toàn cảnh dâu váy satin, kính đen cực slay", dialogue: "...Cho đến khi mình diện bộ này của CAMA!" }
      ],
      social_post_caption: "Ủa khoan! Giao diện 2 là của ai vậy chời? 🫣 Đừng ngại thử sức với nhiều phong cách, vì biết đâu cá tính ngầm của bạn chỉ đợi một chiếc váy phù hợp để bung xõa! 😎",
      social_post_hashtags: "#camawedding #bienhinh #vaycuoicatinh"
    },
    {
      title: "Series bóc phốt: Tại sao thuê váy cưới lại đắt?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "DRAFTING",
      pillar: "Founder Authority",
      tone_voice: "Chuyên gia, Thẳng thắn",
      customer_insight: "Nhiều khách thắc mắc tại sao tiền thuê váy bằng luôn tiền mua đứt váy chợ.",
      main_message: "Giá trị của váy CAMA nằm ở chất liệu nhập, đá đính thủ công, và giặt hấp vô trùng sau mỗi lần thuê.",
      hook_suggestion: "'Thuê váy thôi mà, sao đắt thế?' Chắc hẳn nhiều dâu đang nghĩ vậy...",
      cta_target: "Đến CAMA sờ tận tay chất liệu",
      assets_needed: "Anh Hùng ngồi cầm 1 chiếc váy đính hạt thủ công, B-roll quá trình giặt hấp váy mệt mỏi.",
      trending_audio: "Nhạc nền lo-fi tâm sự nhẹ",
      trend_reference: "Format POV chia sẻ nghề nghiệp",
      script_details: [
        { time: "0-5s", camera: "Cận mặt Founder", dialogue: "'Thuê váy thôi mà, đắt thế?' Đây là câu tôi nghe nhiều nhất." },
        { time: "5-15s", camera: "Quay B-roll xưởng thợ đính kết", dialogue: "Nhưng bạn có biết, 1 chiếc váy CAMA mất 300 giờ đính hạt pha lê thủ công?" },
        { time: "15-25s", camera: "Quay B-roll máy hấp vô trùng", dialogue: "Chưa kể quy trình giặt hấp vô trùng 5 bước sau mỗi lần mặc. Cái giá đó không phải để thuê vải, mà để mua sự hoàn hảo cho bạn." }
      ],
      social_post_caption: "Sự thật đằng sau mức giá của một chiếc váy cưới cao cấp. 🤔 Cùng anh Hùng bóc trần những công đoạn mà ít studio nào muốn cho bạn biết! 👇",
      social_post_hashtags: "#cama #suuthat #chuyengiavaycuoi"
    },
    {
      title: "Giải cứu cô dâu nấm lùn 1m45",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "READY_TO_SHOOT",
      pillar: "Fit & Form",
      tone_voice: "Đồng cảm, Phân tích",
      customer_insight: "Dâu nấm lùn siêu tự ti, sợ mặc váy cưới sẽ bị 'nuốt chửng' form.",
      main_message: "Quy tắc 1/3 và chất liệu chữ A của CAMA kéo dài chân ngay lập tức.",
      hook_suggestion: "Dâu 1m45 nặng 40kg... đi thử váy sẽ như thế nào?",
      cta_target: "Dâu nhỏ nhắn inbox liền",
      assets_needed: "Video thực tế một bạn dâu nhỏ nhắn, mặc thử 1 cái váy bồng lùng bùng (bị xấu) và 1 cái váy chữ A xẻ tà CAMA (đẹp).",
      trending_audio: "Nhạc review giọng nam",
      trend_reference: "Review thực tế",
      script_details: [
        { time: "0-3s", camera: "Dâu đứng bẽn lẽn trong góc", dialogue: "Đau đầu nhất là tư vấn cho dâu 1m45, 40kg." },
        { time: "3-8s", camera: "Dâu mặc váy xòe quá to", dialogue: "Thử váy xòe bồng to thì như một cục bông di động..." },
        { time: "8-18s", camera: "Dâu đổi sang váy A-line lụa, đi guốc", dialogue: "Nhưng chỉ cần đổi sang lụa chữ A siết eo eo tà cao. Ăn gian ngay 10cm! Thấy ảo chưa?" }
      ],
      social_post_caption: "Ai kêu 1m45 là không mặc váy cưới đẹp được? Chạm ngay vào đây để xem phép thuật nhà CAMA biến hình cho nàng dâu mi nhon nhé! ✨👗",
      social_post_hashtags: "#cama #codau1m45 #codauvocuc"
    },
    {
      title: "Phản ứng của chú rể khi lần đầu thấy váy cưới (First Look)",
      platform: "TikTok",
      category: "Suit",
      format: "Video",
      status: "PUBLISHED",
      pillar: "Real Proof",
      tone_voice: "Cảm xúc, Chân thật",
      customer_insight: "Cặp đôi thích những khoảnh khắc First Look ý nghĩa, rớt nước mắt.",
      main_message: "CAMA trân trọng và lưu giữ những khoảnh khắc cảm xúc thật nhất.",
      hook_suggestion: "(Không cần lời nói, chỉ có tiếng nhạc và tiếng khóc sụt sùi)",
      cta_target: "Book lịch chụp First Look tại CAMA",
      assets_needed: "Cảnh rèm mở ra, chú rể lấy tay che miệng khóc. Phải là cảm xúc thật.",
      trending_audio: "A Thousand Years / Untouchable cover",
      trend_reference: "Trend First Look",
      script_details: [
        { time: "0-5s", camera: "Quay lưng chú rể đang hồi hộp", dialogue: "(Nhạc A Thousand Years nổi lên chậm)" },
        { time: "5-10s", camera: "Rèm kéo ngang, dâu xuất hiện lộng lẫy", dialogue: "(Âm thanh rẹt rẹt của rèm)" },
        { time: "10-25s", camera: "Bắt cận cảnh nước mắt chú rể, ôm chầm dâu", dialogue: "(Chữ trên màn hình: Lần đầu tiên anh thấy em mặc váy cưới...)" }
      ],
      social_post_caption: "Khoảnh khắc chiếc rèm kéo ra, thế giới của anh bỗng chốc thu bé lại vừa bằng một cô gái mặc váy trắng... 😭 Trái tim team CAMA cũng tan chảy theo hai bạn! 💖",
      social_post_hashtags: "#firstlook #cama #camstudio #camdong"
    },
    {
      title: "Vlog 1 ngày thử váy tại CAMA sẽ có gì?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Guided Experience",
      tone_voice: "Vui vẻ, Năng lượng",
      customer_insight: "Khách đi làm về mệt, lười đi thử váy, sợ nhân viên thái độ hoặc không có trà nước.",
      main_message: "Thử váy ở CAMA là một trải nghiệm nghỉ dưỡng thu nhỏ, có trà chiều, phòng VIP xịn xò.",
      hook_suggestion: "Đi thử váy mà cứ ngỡ đang đi uống trà chiều ở khách sạn 5 sao?",
      cta_target: "Nhắn CAMA giữ phòng VIP cuối tuần",
      assets_needed: "Quay mâm trà bánh, rèm tự động, dâu được nhân viên nâng váy, kéo khóa tận tình.",
      trending_audio: "Nhạc chill vlog aesthetic",
      trend_reference: "Format Mini Vlog Day in my life",
      script_details: [
        { time: "0-5s", camera: "Góc quay từ cửa bước vào, sáng sủa", dialogue: "Hôm nay cùng theo chân Ngọc đi thử váy tại CAMA Bridal nha." },
        { time: "5-10s", camera: "Cận cảnh khay trà và bánh macaron", dialogue: "Vừa vào phòng đã được set up sẵn trà thơm bánh ngọt như ở KS 5 sao." },
        { time: "10-20s", camera: "Nhân viên xách váy và chỉnh tà", dialogue: "Các bạn nhân viên thì nâng như nâng trứng. Thử 10 cái vẫn tươi cười. Dâu nào lười đi thử thì dẹp ngay suy nghĩ đó đi nhé!" }
      ],
      social_post_caption: "Làm dâu đã mệt rồi, đi thử váy là phải hưởng thụ nha! ☕👗 Book lịch ngay hôm nay để CAMA phục vụ nàng như những nàng công chúa thực thụ!",
      social_post_hashtags: "#cama #vlogthuvay #trachieu #bridal"
    },
    {
      title: "Khi chồng đi chọn váy: 'Vợ mặc gì cũng đẹp!'",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Real Proof",
      tone_voice: "Hài hước, Tình huống",
      customer_insight: "Đàn ông thường thụ động khi đi thử váy cưới, hay nói 'em mặc gì chả đẹp' khiến dâu bực mình.",
      main_message: "Nhân viên CAMA hiểu tâm lý, tự động đóng vai 'trọng tài' và tư vấn thay chú rể.",
      hook_suggestion: "Sợ nhất là dẫn mấy ổng đi thử váy mà câu cửa miệng luôn là: 'Đẹp, đẹp hết!'",
      cta_target: "Gửi video này cho chồng",
      assets_needed: "Diễn viên hoặc khách thật (chú rể) ngồi bấm điện thoại. Dâu thay 3 bộ ra hỏi, ông nào cũng ngẩng lên gật đầu 'đẹp' vô hồn.",
      trending_audio: "Nhạc nền hài hước (Funny meme sound)",
      trend_reference: "Trend troll chú rể vô tri",
      script_details: [
        { time: "0-5s", camera: "Dâu mặc bộ ren đuôi cá", dialogue: "Vợ: Bộ này eo hơi to không anh? Chồng (không nhìn): Đẹp!" },
        { time: "5-10s", camera: "Dâu mặc bộ xòe công chúa", dialogue: "Vợ: Hay xòe thế này? Chồng (đang combat game): Đẹp, mặc gì chả đẹp!" },
        { time: "10-20s", camera: "Nhân viên CAMA chen ngang bóp vai dâu", dialogue: "Nhân viên: Để em tư vấn cho chị, mấy anh trai chỉ biết bốc phét thôi! Bộ này giấu mỡ cực đỉnh chị ơi." }
      ],
      social_post_caption: "Kinh nghiệm xương máu: Đi thử váy cưới nhất định phải mang theo chị em bạn dì, còn mấy anh chồng chỉ mang đi để quẹt thẻ thôi nha! 🤣 Chị em thấy đúng không?",
      social_post_hashtags: "#cama #trollchure #thuvaycuoi #funny"
    },
    {
      title: "Phân biệt Form Váy Chữ A và Xòe Bồng",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "DRAFTING",
      pillar: "Fit & Form",
      tone_voice: "Kiến thức, Nhanh gọn",
      customer_insight: "Nhiều dâu không phân biệt được tên các dáng váy, gọi sai loạn xị ngầu khi nhờ tư vấn.",
      main_message: "Kiến thức căn bản về form váy. CAMA có đủ tất cả form.",
      hook_suggestion: "90% cô dâu không phân biệt được váy chữ A và váy Xòe Bồng (Ball Gown).",
      cta_target: "Lưu lại video này đi thử váy",
      assets_needed: "2 váy đặt cạnh nhau. Đồ họa vẽ đường viền (outline) váy A và váy bồng để thấy độ rộng.",
      trending_audio: "Nhạc giải thích/Education beat",
      trend_reference: "Format chỉ bảng / Text đồ họa nổi",
      script_details: [
        { time: "0-5s", camera: "Người tư vấn chỉ vào váy chữ A", dialogue: "Đây là chữ A. Độ phồng nhẹ, xòe từ eo xuống theo hình chữ A chuẩn." },
        { time: "5-10s", camera: "Người tư vấn chỉ vào váy Ball Gown", dialogue: "Còn đây là xòe bồng công chúa. Thân phồng to, có tùng mặc lót bên trong." },
        { time: "10-15s", camera: "Toàn cảnh 2 form cạnh nhau", dialogue: "Dâu ốm thì mặc Ball Gown cho mập mạp, dâu mi nhon thì quất chữ A cho thanh thoát nhé!" }
      ],
      social_post_caption: "Đừng để bị lú khi nghe chuyên viên tư vấn gọi tên váy nữa! Lưu liền clip này để mốt đi thử váy còn biết đường 'đòi' đúng dáng mình thích nha các dâu! 👗🤓",
      social_post_hashtags: "#cama #kienthucvaycuoi #vaychuA #vayxoebong"
    },
    {
      title: "Đu Trend chụp ảnh cưới phong cách Hongkong",
      platform: "TikTok",
      category: "Studio",
      format: "Video",
      status: "NEW",
      pillar: "Guided Experience",
      tone_voice: "Cổ điển, Điện ảnh",
      customer_insight: "Giới trẻ thích phong cách hoài cổ thập niên 90s (Vương Gia Vệ) nhưng không biết makeup làm sao.",
      main_message: "CAMA Studio set up sẵn góc Hongkong 90s với ánh đèn neon và tone màu hoài cổ.",
      hook_suggestion: "Có một tình yêu rất Wong Kar Wai ở giữa lòng CAMA...",
      cta_target: "Tag người yêu vào rủ chụp liền",
      assets_needed: "Dâu mặc váy đỏ rượu, rể mặc vest retro rộng. Hút thuốc hờ hững (prop), đèn neon mờ ảo, mưa nhân tạo.",
      trending_audio: "Ánh trăng nói hộ lòng tôi (Remix lofi)",
      trend_reference: "Wong Kar Wai cinematic trend",
      script_details: [
        { time: "0-5s", camera: "Cận mặt dâu makeup tone đậm, môi đỏ mọng", dialogue: "Ai nói ảnh cưới là phải vest đen váy trắng?" },
        { time: "5-15s", camera: "Slow-motion chạy dưới mưa neon", dialogue: "Thử một lần hóa thân thành nam nữ chính trong phim Hongkong thập niên 90 xem sao." },
        { time: "15-20s", camera: "Thành quả ảnh tĩnh (chỉnh màu phim xước)", dialogue: "Nhắn CAMA setup ngay concept này cho bạn." }
      ],
      social_post_caption: "Một chút hoài niệm, một chút điện ảnh. Nếu bạn chán sự an toàn, hãy thử concept Hongkong 90s độc quyền tại CAMA nhé! 🍷🎞️",
      social_post_hashtags: "#cama #hongkongstyle #anhcuoihongkong #retro"
    },
    {
      title: "Pha lê Swarovski có gì mà đắt thế?",
      platform: "TikTok",
      category: "Bridal",
      format: "Video",
      status: "NEW",
      pillar: "Founder Authority",
      tone_voice: "Kiến thức, Cao cấp",
      customer_insight: "Dâu nghe quảng cáo 'váy đính Swarovski' rất nhiều nhưng không biết nó khác gì đá nhựa rẻ tiền.",
      main_message: "Swarovski bắt sáng ở mọi góc độ, kể cả trong bóng tối, tạo sự lấp lánh sang trọng không chói lóa.",
      hook_suggestion: "Đá chợ 10 ngàn 1 bịch, pha lê Swarovski tiền triệu, khác nhau chỗ nào?",
      cta_target: "Đến xem trực tiếp độ sáng của pha lê",
      assets_needed: "Máy quay soi đèn flash điện thoại trực tiếp vào 1 viên đá thường và 1 viên Swarovski trên váy CAMA để thấy sự khúc xạ ánh sáng (7 màu).",
      trending_audio: "Nhạc ASMR tiếng đính hạt",
      trend_reference: "Format soi hiển vi / Test chất lượng",
      script_details: [
        { time: "0-5s", camera: "Soi flash vào đá nhựa", dialogue: "Đây là đá thường: Ánh sáng gắt, xỉn màu." },
        { time: "5-15s", camera: "Soi flash vào váy CAMA đính Swarovski", dialogue: "Còn đây là Swarovski trên váy CAMA: Tỏa ra tia sáng 7 màu cực bén." },
        { time: "15-20s", camera: "Quay dâu bước đi dưới đèn mờ", dialogue: "Tắt đèn đi nó vẫn sáng lấp lánh như ngàn vì sao. Đó là lý do CAMA chỉ dùng đá xịn." }
      ],
      social_post_caption: "Tiền nào của nấy là có thật nha các nàng! Đứng trên sân khấu dưới ánh đèn spotlight, nàng sẽ hiểu tại sao CAMA quyết tâm dùng pha lê Swarovski cao cấp! 💎✨",
      social_post_hashtags: "#cama #swarovski #vaycuoicaocap #hautecouture"
    },
    {
      title: "Bất ngờ mắc mưa khi chụp ngoại cảnh và cái kết",
      platform: "TikTok",
      category: "Studio",
      format: "Video",
      status: "NEW",
      pillar: "Real Proof",
      tone_voice: "Đồng hành, Trách nhiệm",
      customer_insight: "Khách rất sợ đi chụp xa (Đà Lạt/Biển) mà gặp trời mưa thì hỏng hết bộ ảnh cưới nghìn đô.",
      main_message: "Dù thời tiết xấu, ê kíp CAMA vẫn lăn xả và biến cái rủi thành concept độc đáo.",
      hook_suggestion: "Bay 1000km vào Đà Lạt chụp ảnh cưới thì... mưa tầm tã!",
      cta_target: "Book CAMA để không bao giờ sợ 'bể show'",
      assets_needed: "Hậu trường mưa thật, ekip căng ô nilon to đùng che cho dâu. Thợ chụp cầm máy chịu ướt.",
      trending_audio: "Nhạc phim drama kịch tính chuyển sang lãng mạn",
      trend_reference: "Behind the scenes khắc nghiệt",
      script_details: [
        { time: "0-5s", camera: "Trời mưa đen kịt, dâu buồn so", dialogue: "Tưởng xu cà na bể luôn cả show chụp..." },
        { time: "5-15s", camera: "Ekip lăn xả cầm máy chạy mưa", dialogue: "Nhưng ekip CAMA bảo: 'Mưa thì chụp mưa! Lấy ô ra đây!'" },
        { time: "15-25s", camera: "Thành quả ảnh siêu nghệ thuật dưới ô trong suốt", dialogue: "Và đây là kết quả. Đôi khi sự cố lại tạo ra kiệt tác để đời." }
      ],
      social_post_caption: "Kế hoạch B của CAMA luôn là: Không có gì cản được chúng mình mang về cho bạn bộ ảnh đẹp nhất! Dù nắng gắt hay mưa rào, cứ tin tưởng giao phó cho ê kíp nghen! ☔📸",
      social_post_hashtags: "#cama #chupanhngoicanh #dalat #mưa #behindthescenes"
    }
  ];

  try {
    const url = `${supabaseUrl}/rest/v1/marketing_contents`;
    
    // Thêm data mới thẳng vào, không xóa data cũ để cộng dồn
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
    
    console.log(`🎉 Đã fetch thành công thêm 10 kịch bản TikTok (V7) vào Database!`);
  } catch (err) {
    console.error("Lỗi khi đẩy vào Database:", err);
  }
}

runSeed();
