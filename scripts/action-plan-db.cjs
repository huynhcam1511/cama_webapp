require('dotenv').config({path:'.env.local',quiet:true});
const {createClient}=require('@supabase/supabase-js');
const fs=require('fs');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
 const sql=process.argv[2] ? fs.readFileSync(process.argv[2],'utf8') : `select table_name,column_name,data_type from information_schema.columns where table_schema='public' and table_name in ('users','contracts','attendance_logs','kpi_transactions','marketing_contents','staff_schedules') order by table_name,ordinal_position`;
 const {data,error}=await db.rpc('exec_sql',{sql_string:sql});
 if(error){console.log(error.code,error.message);process.exitCode=1;}else console.log(JSON.stringify(data));
})();
