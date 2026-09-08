const fs = require('fs');
const path = 'c:\\Users\\ADMIN-PC\\Documents\\ANTIGRAVITY\\CAMA\\CAMA WEBAPP\\src\\app\\layout.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('Agentation')) {
  // Add import
  code = code.replace(
    /import "\.\/globals\.css";/,
    'import "./globals.css";\nimport { Agentation } from "agentation";'
  );
  
  // Add component
  code = code.replace(
    /\{children\}\n\s*<\/div>/,
    '{children}\n          <Agentation />\n        </div>'
  );
  
  fs.writeFileSync(path, code, 'utf8');
  console.log("Injected Agentation!");
} else {
  console.log("Agentation already present.");
}
