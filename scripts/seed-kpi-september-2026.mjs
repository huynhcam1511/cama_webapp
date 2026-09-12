import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config({ path: ".env.local" });
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const start="2026-09-01", end="2026-09-30";
const targets={CONTRACT_REVENUE:[500000000,25],CASH_COLLECTED:[400000000,25],NEW_CONTRACTS:[20,15],CONVERSION_RATE:[35,15],APPOINTMENTS:[60,10],ORDERS_ON_TIME:[90,10]};
const {data:user}=await db.from("users").select("id").eq("email","huynhkiencam151102@gmail.com").limit(1).maybeSingle();
const {data:period,error:periodError}=await db.from("kpi_periods").upsert({period_type:"MONTH",label:"Tháng 9/2026",starts_on:start,ends_on:end,status:"OPEN"},{onConflict:"period_type,starts_on,ends_on"}).select().single();
if(periodError)throw periodError;
const {data:definitions,error:definitionError}=await db.from("kpi_definitions").select("id,code,direction").in("code",Object.keys(targets));
if(definitionError)throw definitionError;
for(const definition of definitions){const [target,weight]=targets[definition.code];const {data:existing}=await db.from("kpi_assignments").select("id").eq("definition_id",definition.id).eq("period_id",period.id).eq("scope_type","COMPANY").maybeSingle();const payload={definition_id:definition.id,period_id:period.id,scope_type:"COMPANY",target_value:target,weight,status:"ACTIVE",effective_from:start,effective_to:end,created_by:user?.id,updated_by:user?.id};const result=existing?await db.from("kpi_assignments").update(payload).eq("id",existing.id):await db.from("kpi_assignments").insert(payload);if(result.error)throw result.error;}
const {data:assignments}=await db.from("kpi_assignments").select("id,target_value,weight,kpi_definitions(code,direction)").eq("period_id",period.id);
const [{data:contracts},{data:payments},{data:schedules},{data:orders}]=await Promise.all([
 db.from("contracts").select("id,total_amount,status").gte("contract_date",start).lte("contract_date",end).is("deleted_at",null),
 db.from("contract_payments").select("id,amount,status").gte("payment_date",start).lt("payment_date","2026-10-01"),
 db.from("operation_schedules").select("id,status").eq("schedule_category","SALE_BOOKING").gte("date",start).lte("date",end),
 db.from("orders").select("id,completion_status,return_date,updated_at").gte("return_date",start).lte("return_date",end).is("deleted_at",null)
]);
const validContracts=(contracts||[]).filter(x=>!["CANCELLED","REFUNDED"].includes(String(x.status||"").toUpperCase()));
const validSchedules=(schedules||[]).filter(x=>String(x.status||"").toUpperCase()!=="CANCELLED");
const validOrders=(orders||[]).filter(x=>String(x.completion_status||"").toUpperCase()!=="CANCELLED");
const values={CONTRACT_REVENUE:validContracts.reduce((s,x)=>s+Number(x.total_amount||0),0),CASH_COLLECTED:(payments||[]).filter(x=>String(x.status||"").toUpperCase()!=="CANCELLED").reduce((s,x)=>s+(String(x.status||"").toUpperCase()==="REFUNDED"?-Number(x.amount||0):Number(x.amount||0)),0),NEW_CONTRACTS:validContracts.length,CONVERSION_RATE:validSchedules.length?validContracts.length*100/validSchedules.length:null,APPOINTMENTS:validSchedules.length,ORDERS_ON_TIME:validOrders.length?(validOrders.filter(x=>String(x.completion_status).toUpperCase()==="COMPLETED"&&String(x.updated_at).slice(0,10)<=x.return_date).length*100/validOrders.length):null};
for(const assignment of assignments||[]){const code=assignment.kpi_definitions.code,actual=values[code],target=Number(assignment.target_value),progress=actual==null?null:(target===0?(actual===0?100:null):(assignment.kpi_definitions.direction==="LOWER_IS_BETTER"?target*100/actual:actual*100/target));await db.from("kpi_results").upsert({assignment_id:assignment.id,target_value:target,actual_value:actual,progress_percent:progress,score:progress==null?null:Math.min(progress,200)*Number(assignment.weight)/100,calculation_status:actual==null?"NO_DATA":"READY",source_snapshot:{metric:code,period_start:start,period_end:end},calculated_at:new Date().toISOString(),calculation_key:`${assignment.id}:v1:${start}`,error_message:actual==null?"Chưa có dữ liệu đủ điều kiện trong kỳ.":null},{onConflict:"assignment_id"});}
console.log(`Seeded ${assignments?.length||0} KPI assignments for ${period.label}`);
