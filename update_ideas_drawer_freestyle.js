const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the subRows generation logic to support "free style" AI markdown directly from deliverables
const oldSubRowsBlock = `    if (item.deliverables && Object.keys(item.deliverables).length > 0) {
      const subRows: any[] = [];
      Object.entries(item.deliverables).forEach(([key, deliv]: [string, any]) => {
        if (deliv.platform || deliv.category || deliv.format) {
          
          let markdownDoc = \`# Bản thảo Bài đăng: \${deliv.platform}\\n\\n\`;
          
          // Thêm phần Chiến lược (nặng đô) vào đầu markdown
          markdownDoc += \`### 🎯 Định hướng Chiến lược (Creative Brief)\\n\`;
          if (item.customer_insight) markdownDoc += \`**💡 Insight:** \${item.customer_insight}\\n\\n\`;
          if (item.main_message) markdownDoc += \`**📣 Thông điệp:** \${item.main_message}\\n\\n\`;
          if (item.tone_voice) markdownDoc += \`**🎭 Tone & Voice:** \${item.tone_voice}\\n\\n\`;
          if (item.hook_suggestion) markdownDoc += \`**🎣 Hook:** \${item.hook_suggestion}\\n\\n\`;
          if (item.cta_target) markdownDoc += \`**🎯 CTA:** \${item.cta_target}\\n\\n\`;
          if (item.assets_needed) markdownDoc += \`**🎬 Chuẩn bị (Assets):** \${item.assets_needed}\\n\\n\`;
          
          markdownDoc += \`---\\n\\n\`;
          
          if (deliv.caption) {
            markdownDoc += \`### 📝 Nội dung Text\\n\${deliv.caption}\\n\\n\`;
          }
          if (deliv.hashtags) {
            markdownDoc += \`**Hashtags:** \${deliv.hashtags}\\n\\n\`;
          }
          if (deliv.script_details && deliv.script_details.length > 0) {
            markdownDoc += \`### 🎬 Kịch bản Video\\n\`;
            markdownDoc += \`| Cảnh | Thời gian | Góc máy / Hành động | Lời thoại |\\n\`;
            markdownDoc += \`|---|---|---|---|\\n\`;
            deliv.script_details.forEach((row: any, i: number) => {
              markdownDoc += \`| \${i+1} | \${row.time} | **\${row.camera}**<br/>_\${row.acting_cue}_ | \${row.dialogue} |\\n\`;
            });
            markdownDoc += \`\\n\`;
          }
          if (deliv.seeding_comments) {
            markdownDoc += \`### 💬 Seeding Comments\\n\`;
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
    }`;

const newSubRowsBlock = `    if (item.deliverables && Object.keys(item.deliverables).length > 0) {
      const subRows: any[] = [];
      Object.entries(item.deliverables).forEach(([key, deliv]: [string, any]) => {
        if (deliv.platform || deliv.category || deliv.format) {
          
          let markdownDoc = '';
          
          // NẾU AI TRẢ VỀ RAW MARKDOWN TRỰC TIẾP (Free style) -> Ưu tiên dùng luôn
          if (deliv.raw_markdown) {
            markdownDoc = deliv.raw_markdown;
          } else {
            // RENDER LẠI THEO CHUẨN JSON CŨ NẾU KHÔNG CÓ RAW MARKDOWN
            markdownDoc = \`# Bản thảo Bài đăng: \${deliv.platform}\\n\\n\`;
            
            // Lấy từ item metadata hoặc từ chính deliverable (để lách luật varchar 100 của DB)
            const insight = deliv.customer_insight || item.customer_insight;
            const msg = deliv.main_message || item.main_message;
            const tone = deliv.tone_voice || item.tone_voice;
            const hook = deliv.hook_suggestion || item.hook_suggestion;
            const cta = deliv.cta_target || item.cta_target;
            const assets = deliv.assets_needed || item.assets_needed;

            if (insight || msg || tone || hook || cta || assets) {
              markdownDoc += \`### 🎯 Định hướng Chiến lược (Creative Brief)\\n\`;
              if (insight) markdownDoc += \`**💡 Insight:** \${insight}\\n\\n\`;
              if (msg) markdownDoc += \`**📣 Thông điệp:** \${msg}\\n\\n\`;
              if (tone) markdownDoc += \`**🎭 Tone & Voice:** \${tone}\\n\\n\`;
              if (hook) markdownDoc += \`**🎣 Hook:** \${hook}\\n\\n\`;
              if (cta) markdownDoc += \`**🎯 CTA:** \${cta}\\n\\n\`;
              if (assets) markdownDoc += \`**🎬 Chuẩn bị (Assets):** \${assets}\\n\\n\`;
              markdownDoc += \`---\\n\\n\`;
            }
            
            if (deliv.caption) {
              markdownDoc += \`### 📝 Nội dung Text\\n\${deliv.caption}\\n\\n\`;
            }
            if (deliv.hashtags) {
              markdownDoc += \`**Hashtags:** \${deliv.hashtags}\\n\\n\`;
            }
            if (deliv.script_details && deliv.script_details.length > 0) {
              markdownDoc += \`### 🎬 Kịch bản Video\\n\`;
              markdownDoc += \`| Cảnh | Thời gian | Góc máy / Hành động | Lời thoại |\\n\`;
              markdownDoc += \`|---|---|---|---|\\n\`;
              deliv.script_details.forEach((row: any, i: number) => {
                // SỬA LỖI UI: Replace newline characters with <br/> to prevent breaking markdown tables!
                const safeTime = (row.time || '').replace(/\\n/g, '<br/>');
                const safeCamera = (row.camera || '').replace(/\\n/g, '<br/>');
                const safeActing = (row.acting_cue || '').replace(/\\n/g, '<br/>');
                const safeDialogue = (row.dialogue || '').replace(/\\n/g, '<br/>');
                
                markdownDoc += \`| \${i+1} | \${safeTime} | **\${safeCamera}**<br/>_\${safeActing}_ | \${safeDialogue} |\\n\`;
              });
              markdownDoc += \`\\n\`;
            }
            if (deliv.seeding_comments) {
              markdownDoc += \`### 💬 Seeding Comments\\n\`;
              deliv.seeding_comments.forEach((c: string) => {
                markdownDoc += \`- \${c}\\n\`;
              });
            }
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
    }`;

content = content.replace(oldSubRowsBlock, newSubRowsBlock);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Updated table rendering to fix newlines and support free style raw_markdown!");
