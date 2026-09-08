const fs = require('fs');
const path = 'c:\\Users\\ADMIN-PC\\Documents\\ANTIGRAVITY\\CAMA\\CAMA WEBAPP\\supabase\\migrations\\20260908000000_kpi_and_attendance.sql';
let content = fs.readFileSync(path, 'utf8');

// Remove time_logs creation
content = content.replace(/-- 2\. Time Logs \(Attendance\)[\s\S]*?updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW\(\)\n\);\n/, '');

// Remove RLS for time_logs
content = content.replace(/ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;\n/g, '');
content = content.replace(/-- Time logs: user can insert own, read own\. Admin can read all\.[\s\S]*?ROLE IN \('ADMIN', 'DIRECTOR', 'MANAGER'\)\)\n\);\n/g, '');

fs.writeFileSync(path, content, 'utf8');
