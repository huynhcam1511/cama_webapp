import { getContracts } from "@/app/dashboard/contracts/actions";
import { Target, TrendingUp, Zap, ChevronUp, BarChart4, ChevronRight } from "lucide-react";
import { SalesCharts } from "./sales-charts";

export default async function SalesDashboardPage() {
  // 1. Fetch real data from Supabase via existing action
  const { contracts, stats } = await getContracts();

  // 2. Compute Actual Revenue (Tiền thực thu)
  const actualRevenue = contracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
  
  // 3. Targets
  const BREAK_EVEN = 400000000;
  const GOAL = 800000000;
  
  // 4. Progress calculation (Max 100%)
  const progressPercent = Math.min((actualRevenue / GOAL) * 100, 100);

  // Formatter
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  // --- DATA PROCESSING FOR CHARTS --- //
  
  // 1. Daily Data (Combo Chart)
  const dailyMap: Record<string, { contractsCount: number; revenue: number }> = {};
  contracts.forEach(c => {
    const d = c.contract_date || c.created_at.split("T")[0];
    if (!dailyMap[d]) dailyMap[d] = { contractsCount: 0, revenue: 0 };
    dailyMap[d].contractsCount += 1;
    
    // Add payments from this contract based on payment date
    c.payments.forEach((p: any) => {
      if (p.status === 'COMPLETED' || p.status === 'PAID') {
        const pd = p.payment_date?.split("T")[0] || d;
        if (!dailyMap[pd]) dailyMap[pd] = { contractsCount: 0, revenue: 0 };
        dailyMap[pd].revenue += Number(p.amount || 0);
      }
    });
  });
  const dailyData = Object.keys(dailyMap).sort().slice(-14).map(date => ({
    date: date.substring(5), // e.g., '08-15'
    contractsCount: dailyMap[date].contractsCount,
    revenue: dailyMap[date].revenue
  }));

  // 2. Category Data (Pie Chart)
  const catMap: Record<string, number> = {};
  contracts.forEach(c => {
    c.items.forEach((item: any) => {
      const cat = item.category || 'Khác';
      catMap[cat] = (catMap[cat] || 0) + Number(item.amount || 0);
    });
  });
  const categoryData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));

  // 3. Funnel Data (Leads -> Contracts -> Paid)
  // Since we don't have a real 'leads' table in this mock, we will estimate based on contracts
  const totalContracts = contracts.length;
  const paidContracts = contracts.filter(c => c.paid_amount > 0).length;
  const funnelData = [
    { stage: "Lead đổ về", value: Math.max(totalContracts * 3, 100) },
    { stage: "Khách đến tiệm", value: Math.max(totalContracts * 1.5, 50) },
    { stage: "Ký hợp đồng", value: totalContracts },
    { stage: "Đã thanh toán", value: paidContracts },
  ];

  // 4. Leaderboard
  const staffMap: Record<string, { contractsCount: number; revenue: number }> = {};
  contracts.forEach(c => {
    const staff = c.assigned_staff_name || 'Chưa phân công';
    if (!staffMap[staff]) staffMap[staff] = { contractsCount: 0, revenue: 0 };
    staffMap[staff].contractsCount += 1;
    staffMap[staff].revenue += Number(c.paid_amount || 0);
  });
  const topPerformers = Object.keys(staffMap)
    .map(k => ({ name: k, ...staffMap[k] }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* DOANH THU & ĐIỂM HÒA VỐN */}
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-3xl text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-emerald-100 uppercase tracking-wider text-sm">Doanh Thu & Điểm Hòa Vốn (Real-time)</p>
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">Thực thu (Paid)</div>
            </div>
            
            <div className="flex items-end gap-3 mb-4">
              <h3 className="text-4xl font-black">{formatVND(actualRevenue)}</h3>
              <span className="text-emerald-100 font-medium mb-1">/ {formatVND(GOAL)} (Mục tiêu)</span>
            </div>

            <div className="relative w-full bg-emerald-700/50 rounded-full h-4 mb-2">
              {/* Thanh tiến độ hiện tại */}
              <div className="absolute top-0 left-0 bg-white h-4 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              
              {/* Điểm hòa vốn (400M / 800M = 50%) */}
              <div className="absolute top-0 left-[50%] h-6 w-1 bg-amber-400 -translate-y-1 z-20"></div>
              <div className="absolute -top-6 left-[50%] -translate-x-1/2 text-xs font-bold text-amber-300 whitespace-nowrap">
                Hòa vốn (400 Tr)
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-emerald-100 mt-4">
              <p>Chi phí cố định: ~250M</p>
              <p>Chi phí Ads: ~60-90M</p>
            </div>
          </div>
          <Target className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-400/20" />
        </div>

        {/* TIME TO CASH */}
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-500 mb-1 uppercase tracking-wider text-xs">Tổng Số Hợp Đồng</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-800">{stats.total_count}</h3>
                <span className="text-base text-slate-500 font-bold">HĐ</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Zap className="w-6 h-6" /></div>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Tổng giá trị công nợ còn lại (Chưa thu):</p>
            <div className="flex gap-2 mt-4">
               <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                 {formatVND(stats.total_debt)}
               </span>
            </div>
          </div>
        </div>
      </div>
      
      <SalesCharts 
        dailyData={dailyData} 
        categoryData={categoryData} 
        funnelData={funnelData} 
        topPerformers={topPerformers} 
      />
    </div>
  );
}
