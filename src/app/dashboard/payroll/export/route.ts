import {getPayroll} from '../actions';
import ExcelJS from 'exceljs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const period=new URL(request.url).searchParams.get('period')||'';
 const result=await getPayroll(period);
 const workbook=new ExcelJS.Workbook();const sheet=workbook.addWorksheet('Bảng lương');
 sheet.addRow(['Kỳ lương',period,result.finalized?'Đã chốt':'Tạm tính']);
 sheet.addRow(['Mã NV','Nhân viên','Lương cơ bản','Phụ cấp','OT','Thưởng','Hoa hồng','Khấu trừ','Thực nhận','Cấu hình']);
 for(const r of result.rows)sheet.addRow([r.code,r.name,...(r.configured?[r.base,r.allowance,r.ot,r.bonus,r.commission,r.deductions,r.total]:Array(7).fill(null)),r.configured?'Đã cấu hình':'Chưa cấu hình']);
 sheet.getRow(2).font={bold:true};sheet.views=[{state:'frozen',ySplit:2}];sheet.autoFilter={from:'A2',to:'J2'};
 sheet.columns.forEach((c,i)=>{c.width=i===1?30:20;if(i>=2&&i<=8)c.numFmt='#,##0';});
 const detail=workbook.addWorksheet('Chi tiết');detail.addRow(['Mã NV','Nhân viên','Nguồn','Số tiền']);
 for(const r of result.rows)for(const d of r.details)detail.addRow([r.code,r.name,d.source,d.amount]);
 detail.columns.forEach((c,i)=>{c.width=i===2?70:25;});detail.getRow(1).font={bold:true};
 const bytes=await workbook.xlsx.writeBuffer();
 return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="bang-luong-${period}.xlsx"`,'Cache-Control':'private, no-store'}});
}
