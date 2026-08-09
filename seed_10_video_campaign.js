require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const generate10VideoMarkdown = () => {
  let md = `# 🎬 SERIES THỰC TẾ: "10 CÚ ĐÁNH THỨC" DÀNH CHO CÔ DÂU (TIKTOK/REELS)\n\n`;
  md += `> **Mục tiêu:** Series 10 tập đập tan lầm tưởng của cô dâu về việc thuê/mua váy cưới. Thay vì review váy sáo rỗng, chúng ta đưa ra tình huống thực tế, bắt trend Drama nhẹ nhàng, và chốt lại bằng kiến thức chuyên gia từ Anh Hùng.\n\n`;
  
  md += `### 🎯 Định hướng Chiến lược (Creative Brief)\n`;
  md += `**💡 Insight:** Cô dâu rất sợ bị "lùa gà" tại các studio nhỏ, mặc váy lên form lỏng lẻo, rườm rà nhưng không dám chê.\n\n`;
  md += `**📣 Thông điệp:** "Váy cưới không phải để che khuyết điểm, mà là để kiến tạo đường cong. Hãy nghe Chuyên gia."\n\n`;
  md += `**🎭 Tone & Voice:** Quyết liệt, chân thực, bóc phốt thực trạng, nhưng đầy tính chuyên môn.\n\n`;
  md += `**🎬 Chuẩn bị (Assets):** 1 buổi quay duy nhất. Thay 5 bộ váy. Quay tại phòng fitting VIP của CAMA.\n\n`;
  
  md += `---\n\n`;
  
  md += `### 📦 MA TRẬN 10 TẬP VIDEO (KỊCH BẢN CHI TIẾT)\n\n`;
  
  md += `| Tập | Chủ đề (Hook) | Nội dung / Hành động | Lời thoại Key (Punchline) | Thời lượng |\n`;
  md += `|---|---|---|---|---|\n`;
  
  const episodes = [
    { title: "Váy bồng bềnh hay Váy bùi nhùi?", cue: "Hiền mặc thử váy xòe rẻ tiền, đi lại lụp xụp. Hùng xuất hiện cầm váy đuôi cá vứt vào.", punchline: "Em định mang rèm cửa đi đám cưới à? Thử cái này đi, corset 12 xương!" },
    { title: "Sự thật về 'Váy Tỷ Đồng'", cue: "Mẫu Tây đang xoay váy. Hùng soi đèn flash vào từng hạt pha lê Swarovski.", punchline: "Đừng nghe họ nổ 'tỷ đồng'. Nhìn kỹ độ bắt sáng của hạt đá này, đây mới là đẳng cấp thật sự." },
    { title: "Bắp tay to mặc gì?", cue: "Khách ảo (camera POV) than thở bắp tay to. Hiền định lấy váy trễ vai che lại, Hùng cản.", punchline: "Càng che càng thô! Mặc váy cúp ngực tim sâu, kéo ánh nhìn xuống Vòng 1. Nhìn xem!" },
    { title: "Bí mật Siết Eo Tàng Hình", cue: "Quay sát cảnh thợ kéo dây corset phía sau lưng. Eo cô dâu rút từ 70 xuống 60.", punchline: "Không cần nhịn ăn. Ở CAMA, tôi bẻ form đồng hồ cát cho em ngay tại chỗ." },
    { title: "Cứ váy lụa là sang?", cue: "So sánh lụa phi bóng (nhăn nheo) và lụa Mikado của CAMA (đứng form).", punchline: "Lụa phi bóng ra gió là dính chặt vào người lộ hết mỡ. Nhìn Mikado đây, đứng form chuẩn chữ A." },
    { title: "Drama: Trễ hẹn lấy váy", cue: "Hiền diễn nét hốt hoảng báo xưởng chậm váy. Hùng bình thản lấy ra phương án B đỉnh hơn.", punchline: "Ở CAMA không có chữ 'Trễ'. Xưởng nhà, thợ nhà, sai ở đâu tôi đền ở đó." },
    { title: "Đừng thuê váy quá chật", cue: "Cô dâu thở không nổi vì cố ních. Hùng lấy kéo (giả vờ) dọa cắt.", punchline: "Đám cưới em phải đi tiếp khách 3 tiếng, không thở được thì cười kiểu gì? Form váy phải nương theo cơ thể." },
    { title: "Sự khác biệt của ren Pháp", cue: "Zoom macro vào ren mỏng tang bị xước, sau đó so với ren Alençon dày dặn.", punchline: "Ren rẻ tiền đi ngang bụi cây là rách. Cầm ren Pháp lên, kéo thử xem nó có dãn rão không?" },
    { title: "Cô dâu gầy có nên mặc váy đuôi cá?", cue: "Hiền (gầy) mặc đuôi cá nhìn thẳng đuột. Hùng độn thêm Tùng giả bên trong.", punchline: "Gầy mà mặc đuôi cá là thành cây sào. Bí mật là phải tạo Hông giả. Thấy chưa?" },
    { title: "Giá thuê lẻ vs Gói Combo", cue: "Hiền gạch xóa bảng giá. Hùng chốt deal.", punchline: "Thuê lẻ cái váy này 30 củ. Đăng ký combo hôm nay tôi tặng luôn váy này để quay Pre-wedding. Bấm link ngay." }
  ];
  
  episodes.forEach((ep, i) => {
    md += `| **Tập ${i+1}:** ${ep.title} | ${ep.cue} | Anh Hùng: *"${ep.punchline}"* | 30s-45s |\n`;
  });
  
  md += `\n---\n\n`;
  md += `### 💡 Hướng dẫn Sản xuất (Production Note)\n`;
  md += `- **Góc máy:** Dùng góc máy thấp (low angle) khi quay Anh Hùng để tạo sự uy quyền, góc ngang (eye-level) khi quay Hiền để tạo sự gần gũi.\n`;
  md += `- **Ánh sáng:** Đánh đèn Key-light mạnh vào mặt váy để tôn chất liệu lụa/đá. Hậu cảnh setup tone ấm (Warm mood).\n`;
  md += `- **Edit & Dựng:** Chèn tiếng *bíp/glitch* mỗi lần bóc phốt sai lầm. Nhạc beat dồn dập (trending TikTok).`;
  
  return md;
};

const seriesCampaign = {
  title: "Series Thực Tế 10 Tập: Đập Tan Lầm Tưởng Váy Cưới",
  category: "Váy Bridal",
  platform: "TikTok/Reels",
  status: "NEW",
  deliverables: {
    tiktok_series: {
      platform: "TikTok",
      category: "Váy Bridal",
      format: "Series 10 Video",
      page: "CAMA Official",
      raw_markdown: generate10VideoMarkdown()
    }
  }
};

async function seed() {
  console.log('Đang chạy Pipeline tạo Campaign 10 Video...');
  const { error } = await supabase.from('marketing_contents').insert([seriesCampaign]);
  if (error) {
      console.error('Lỗi khi đẩy dữ liệu:', error);
  } else {
      console.log('✅ Đã tạo thành công Campaign 10 Video!');
  }
}

seed();
