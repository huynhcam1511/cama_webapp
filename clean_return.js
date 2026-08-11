const fs = require('fs');
const file = 'src/app/dashboard/contracts/_components/contract-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* HÀNG TRẢ CỌC \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/m;
const replacement = `                  </div>
                </div>
              </section>`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Cleaned up old return block');
} else {
    console.log('Regex did not match');
}
