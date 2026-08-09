const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The replacement function for getSubRows to include rich metadata
const newGetSubRows = `
  const getSubRows = (item: any) => {
    if (item.deliverables && Object.keys(item.deliverables).length > 0) {
      const subRows: any[] = [];
      Object.entries(item.deliverables).forEach(([key, deliv]: [string, any]) => {
        if (deliv.platform || deliv.category || deliv.format) {
          
          let markdownDoc = \`# Bản thảo: \${item.title}\\n\\n\`;
          
          // --- THÊM PHẦN TỔNG QUAN CHI TIẾT TỪ PIPELINE ---
          markdownDoc += \`## 1. Tổng quan Chiến lược (Strategy)\\n\\n\`;
          markdownDoc += \`| Yếu tố | Chi tiết |\\n\`;
          markdownDoc += \`|---|---|\\n\`;
          if (item.customer_insight) markdownDoc += \`| **Customer Insight** | \${item.customer_insight} |\\n\`;
          if (item.main_message) markdownDoc += \`| **Thông điệp chính** | \${item.main_message} |\\n\`;
          if (item.tone_voice) markdownDoc += \`| **Tone & Voice** | \${item.tone_voice} |\\n\`;
          if (item.hook_suggestion) markdownDoc += \`| **Hook Suggestion** | \${item.hook_suggestion} |\\n\`;
          if (item.cta_target) markdownDoc += \`| **Call to Action** | \${item.cta_target} |\\n\\n\`;
          
          markdownDoc += \`## 2. Thông số Triển khai (Execution)\\n\\n\`;
          if (item.assets_needed) markdownDoc += \`- **Tài nguyên cần có:** \${item.assets_needed}\\n\`;
          if (item.best_time_to_post) markdownDoc += \`- **Giờ vàng đăng bài:** \${item.best_time_to_post}\\n\`;
          if (item.trending_audio) markdownDoc += \`- **Âm thanh Trending:** \${item.trending_audio}\\n\`;
          if (item.trend_reference) markdownDoc += \`- **Reference (Mẫu):** [\${item.trend_reference}](\${item.trend_reference})\\n\\n\`;
          
          markdownDoc += \`---\\n\\n\`;
          
          // --- CHI TIẾT CONTENT (TỪNG KÊNH) ---
          markdownDoc += \`## 3. Nội dung Chi tiết: \${deliv.platform}\\n\\n\`;
          
          if (deliv.caption) {
            markdownDoc += \`### 📝 Caption / Text\\n\${deliv.caption}\\n\\n\`;
          }
          if (deliv.hashtags) {
            markdownDoc += \`**Hashtags:** \${deliv.hashtags}\\n\\n\`;
          }
          if (deliv.script_details && deliv.script_details.length > 0) {
            markdownDoc += \`### 🎬 Kịch bản Sản xuất (Production Script)\\n\`;
            markdownDoc += \`| Cảnh | Thời gian | Góc máy / Hành động (Visual) | Lời thoại / Text (Audio) |\\n\`;
            markdownDoc += \`|---|---|---|---|\\n\`;
            deliv.script_details.forEach((row: any, i: number) => {
              markdownDoc += \`| \${i+1} | \${row.time} | **\${row.camera}**<br/>_\${row.acting_cue}_ | \${row.dialogue} |\\n\`;
            });
            markdownDoc += \`\\n\`;
          }
          if (deliv.seeding_comments) {
            markdownDoc += \`### 💬 Kịch bản Seeding (24h đầu)\\n\`;
            deliv.seeding_comments.forEach((c: string) => {
              markdownDoc += \`- \${c}\\n\`;
            });
          }

          subRows.push({
            id: key,
            platform: deliv.platform || '(Chưa rõ)',
            category: deliv.category || '(Chưa rõ)',
            format: deliv.format || '(Chưa rõ)',
            page: deliv.page || (deliv.category + ' Official'), // MOCK PAGE
            markdown_content: markdownDoc
          });
        }
      });
      if (subRows.length > 0) return subRows;
    }
    return [];
  };
`;

// Regex to replace the old getSubRows function
const regex = /const getSubRows = \(item: any\) => \{[\s\S]*?return \[\];\n  \};/m;
content = content.replace(regex, newGetSubRows.trim());

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Update successful');
