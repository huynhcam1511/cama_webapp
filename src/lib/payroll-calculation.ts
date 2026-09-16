export interface PayrollProfile {user_id:string;base_salary:number;allowance:number;ot_hourly_rate:number|null;late_per_minute:number;commission_percent:number}
export function lateMinutes(checkIn:string,start:string){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(checkIn)).split(':').map(Number);
 const shift=start.split(':').map(Number);return Math.max(0,parts[0]*60+parts[1]-shift[0]*60-shift[1]);
}
export function calculatePayroll(user:any,profile:PayrollProfile|undefined,attendance:any[],schedules:any[],overtime:any[],transactions:any[],awards:any[],contracts:any[],allocations:any[]){
 const details:{source:string;amount:number}[]=[];let late=0;
 for(const log of attendance.filter(a=>a.user_id===user.id&&a.check_in_time)){
  const shift=schedules.find(s=>s.user_id===user.id&&s.date===log.date&&s.schedule_type==='WORKING'&&s.approval_status==='APPROVED');
  const mins=lateMinutes(log.check_in_time,shift?.start_time||user.default_start_time||'08:30');late+=mins;
  if(mins&&profile?.late_per_minute)details.push({source:`Chấm công ${log.date}: ${mins} phút trễ`,amount:-Math.round(mins*profile.late_per_minute)});
 }
 const ot=overtime.filter(o=>o.user_id===user.id&&o.status==='APPROVED').reduce((sum,o)=>{details.push({source:`OT ${o.id}`,amount:Number(o.amount)});return sum+Number(o.amount);},0);
 let bonus=0,deductions=0,commission=0;
 for(const tx of transactions.filter(t=>t.user_id===user.id)){
  const amount=Math.abs(Number(tx.amount));if(tx.transaction_type==='PENALTY')deductions+=amount;else if(tx.transaction_type==='COMMISSION')commission+=amount;else bonus+=amount;
  details.push({source:`KPI ${tx.id}: ${tx.description||tx.transaction_type}`,amount:tx.transaction_type==='PENALTY'?-amount:amount});
 }
 for(const a of awards.filter(a=>a.user_id===user.id)){bonus+=Number(a.amount);details.push({source:`Thưởng video ${a.video_id}`,amount:Number(a.amount)});}
 for(const a of allocations.filter(a=>a.user_id===user.id)){
  const c=contracts.find(c=>c.id===a.contract_id);if(!c||['DRAFT','CANCELLED','REFUNDED','ARCHIVED'].includes(c.status))continue;
  if(transactions.some(t=>t.user_id===user.id&&t.transaction_type==='COMMISSION'&&t.source_reference===c.id))continue;
  const amount=Math.round(Number(c.total_amount)*Number(a.share_percent)/100*Number(profile?.commission_percent||0)/100);
  commission+=amount;details.push({source:`Hợp đồng ${c.contract_code} × ${a.share_percent}% × ${profile?.commission_percent||0}%`,amount});
 }
 deductions+=Math.round(late*Number(profile?.late_per_minute||0));const base=Number(profile?.base_salary||0),allowance=Number(profile?.allowance||0);
 return {id:user.id,name:user.full_name,code:user.employee_code,configured:!!profile,base,allowance,ot,bonus,commission,late,deductions,total:base+allowance+ot+bonus+commission-deductions,details};
}
