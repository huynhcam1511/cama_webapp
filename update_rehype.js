const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/marketing/ideas/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Thêm import rehypeRaw
if (!content.includes('import rehypeRaw')) {
  content = content.replace(
    "import remarkGfm from 'remark-gfm';",
    "import remarkGfm from 'remark-gfm';\nimport rehypeRaw from 'rehype-raw';"
  );
}

// Thêm rehypePlugins vào ReactMarkdown
if (!content.includes('rehypePlugins={[rehypeRaw]}')) {
  content = content.replace(
    "<ReactMarkdown remarkPlugins={[remarkGfm]}>",
    "<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>"
  );
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Update successful');
