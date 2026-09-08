const fs = require('fs');
const path = 'c:\\Users\\ADMIN-PC\\Documents\\ANTIGRAVITY\\CAMA\\CAMA WEBAPP\\src\\app\\layout.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /<Agentation \/>/,
  "{process.env.NODE_ENV === 'development' && <Agentation />}"
);

fs.writeFileSync(path, code, 'utf8');
