"use client";

import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";
import { format } from "date-fns";

const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export function SalesCharts({ 
  dailyData, 
  categoryData, 
  funnelData, 
  topPerformers 
}: { 
  dailyData: any[]; 
  categoryData: any[]; 
  funnelData: any[]; 
  topPerformers: any[]; 
}) {

  const formatVND = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' ₫';

  return (
    <div className="space-y-4">
      {/* 1. Combo Chart: Dòng tiền & Hợp đồng */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Tương quan Hợp đồng Ký mới & Dòng tiền Thu về</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val/1000000}M`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <RechartsTooltip 
                formatter={(value: any, name: string) => name === 'Dòng tiền (VND)' ? [formatVND(value), name] : [value, name]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="right" dataKey="contractsCount" name="Hợp đồng mới" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Dòng tiền (VND)" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2. Pie Chart: Cơ cấu doanh thu */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Cơ cấu Doanh thu theo Ngành hàng</h3>
          <div className="h-56 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val: number) => formatVND(val)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">Chưa có dữ liệu ngành hàng</p>
            )}
          </div>
        </div>

        {/* 3. Funnel Chart (Area Chart as Funnel approximation) */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Phễu Chuyển đổi Khách hàng</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <AreaChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} width={120} />
                <RechartsTooltip 
                  formatter={(val: number) => [val, 'Số lượng']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#818cf8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Leaderboard */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Bảng xếp hạng Sales Xuất Sắc</h3>
        <div className="space-y-4">
          {topPerformers.length > 0 ? topPerformers.map((user, idx) => (
            <div key={user.name} className={`flex items-center justify-between p-4 rounded-2xl ${idx === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`font-black text-2xl w-6 text-center ${idx === 0 ? 'text-amber-500' : 'text-slate-300'}`}>{idx + 1}</div>
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.contractsCount} Hợp đồng</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-lg text-emerald-600">{formatVND(user.revenue)}</div>
              </div>
            </div>
          )) : (
            <p className="text-slate-400 text-center py-4">Chưa có dữ liệu nhân sự</p>
          )}
        </div>
      </div>
    </div>
  );
}
